const request = require("request");
const baseURL = "https://floosak.ye";
const phone = "967773949213";
const password = "421957";
const newApiRequest = require('../../db_modal/alnoamanNewModal');

const noServerError = { code: '00000', message: 'تمت العمليات في السيرفر بنجاح' };
const databaseError = { code: '00006', message: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
let token = '';

async function floosakRemitServer(req, callback) {
    try {
        const value = await findLastToken(req.service_info.service_name);
        console.log("Token found in DB:", value.tokenBody);

        // تحقق من صلاحية التوكن
        if (isTokenExpired(value.tokenBody)) {
            console.log("Token is expired, requesting a new one...");
            const tokenData = await getToken(); // طلب توكن جديد
            if (tokenData) {
                token = tokenData.data.token; // تحديث التوكن
                await saveTokenToDB(tokenData.data.token, req.service_info.service_name); // تخزين التوكن الجديد
            } else {
                callback(writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", noServerError));
                return;
            }
        } else {
            token = value.tokenBody; // استخدام التوكن الموجود
        }

        if (req.service_info.service_type.toUpperCase() === 'Q_REM') {
            await handleQRemit(req, value, callback);
        } else if (req.service_info.service_type.toUpperCase() === 'P_REM') {
            await handlePRemit(req, value, callback);
        }
    } catch (error) {
        console.error("Error in floosakRemitServer:", error);
        callback(writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", noServerError));
    }
}

// دالة للتحقق من صلاحية التوكن
function isTokenExpired(token) {
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); // فك تشفير التوكن
    const currentTime = Math.floor(Date.now() / 1000); // الوقت الحالي بالثواني
    return decodedToken.exp < currentTime; // تحقق مما إذا كان التوكن منتهي الصلاحية
}

// دالة لتخزين التوكن الجديد في قاعدة البيانات
async function saveTokenToDB(token, serviceName) {
    const newTokenData = {
        rem_no: "last token",
        service_name: serviceName,
        tokenBody: token,
        date: Date.now()
    };
    const newData = new newApiRequest.insertData(newTokenData);
    return newData.save();
}

async function handleQRemit(req, value, callback) {
    console.log(req);
    const remitNo = req.rem_info.rem_no;
    const requesterRegion = req.rem_info.region;

    const { status, data, bodySent, outTrans } = await searchRemit(value.tokenBody,remitNo,req.service_info.service_name);

    if (status === 200) {
        await processQRemitSuccess(data, remitNo, requesterRegion, bodySent, outTrans, callback);
    } else {
        await handleError(status, data, req, bodySent, callback);
    }
}

async function handlePRemit(req, value, callback) {
    const remitNo = req.rem_info.rem_no;
    const row = await findQResponse(remitNo);
    const { status, data, bodySent } = await confirmRemit(value.tokenBody, row.transaction_id);

    if (status === 200) {
        await processPRemitSuccess(data, row, remitNo, bodySent, callback);
    } else {
        await handleError(status, data, req, bodySent, callback);
    }
}

async function handleError(status, data, req, bodySent, callback) {
    if (status === 422 && data.message.startsWith('You are not Authenticated')) {
        const tokenData = await getToken();
        if (tokenData) {
            token = tokenData.data.token;
            console.log("Using new token:", token); // طباعة التوكن الجديد المستخدم
            await floosakRemitServer(req, callback);
        } else {
            const res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", noServerError);
            await saveData(createDataObject(req, "", "", bodySent, tokenData, res_data));
            callback(res_data);
        }
    } else {
        const res_data = writeGeneralErrorXmlFile(proccessingErrors(data.errors), noServerError);
        await saveData(createDataObject(req, "", "", bodySent, data, res_data));
        callback(res_data);
    }
}

async function processQRemitSuccess(data, remitNo, requesterRegion, bodySent, outTrans, callback) {
    const isValidRegion = (requesterRegion == 1 && data.data.group_id == "Sana`a") || (requesterRegion != 1 && data.data.group_id != "Sana`a");
    const res_data = isValidRegion ? writeQueryRemitxml(data.data, remitNo, noServerError) : reigonError(noServerError);

    await saveData(createDataObject(req, isValidRegion ? data.data.id : "", isValidRegion ? data.data.net : "", bodySent, data, res_data, outTrans));
    callback(res_data);
}

async function processPRemitSuccess(data, row, remitNo, bodySent, callback) {
    const res_data = writeConfirmRemitXmlFile(data.data, noServerError);
    await saveData(createDataObject(req, data.data.id, row.Amounts, bodySent, data, res_data, row.CustID));
    callback(res_data);
}

async function getToken() {
    return new Promise((resolve, reject) => {
        const getTokenHeader = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "x-channel": "agent"
        };

        const getTokenBody = { phone, password };
        const getTokenBodyProcessed = prepareBody(getTokenBody);

        request.post(
            {
                headers: getTokenHeader,
                url: `${baseURL}/api/v1/auth/login`,
                body: getTokenBodyProcessed,
                method: 'POST',
                rejectUnauthorized: false 
            },
            (err, response, body) => {
                if (!err) {
                    try {
                        const json_tok = JSON.parse(body);
                        console.log("New token received:", json_tok.data.token); // طباعة التوكن الجديد
                        resolve(response.statusCode === 200 ? json_tok : null);
                    } catch (error) {
                        console.error("Error parsing token response:", error);
                        reject(error);
                    }
                } else {
                    console.error("Error getting token:", err);
                    reject(err);
                }
            }
        );
    });
}

async function searchRemit(token, remit_no, service_name) {
    try {
        // استدعاء getResponesData وانتظار النتيجة
        const responesData = await getResponesData(service_name);
        
        // تحقق مما إذا كانت البيانات المسترجعة صالحة
        if (!responesData) {
            throw new Error("No response data found.");
        }

        // تحويل responesData إلى كائن JSON
        const parsedResponseData = JSON.parse(responesData);
        
        // الحصول على wallet_id
        const wallet_id = getWalletID(parsedResponseData); // تأكد من أنك تحصل على wallet_id بشكل صحيح

        return new Promise((resolve, reject) => {
            const request_id = Date.now();
            const searchRemitHeader = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "x-channel": "agent"
            };

            const searchRemitBody = {
                "source_wallet_id": wallet_id, // تأكد من استخدام wallet_id هنا
                "remittance_number": remit_no,
                "remittance_provider_id": "3",
                "request_id": request_id
            };

            const searchRemitBodyProcessed = prepareBody(searchRemitBody);

            request.post(
                {
                    headers: searchRemitHeader,
                    url: `${baseURL}/api/v1/account/remittance/payout/search`,
                    body: searchRemitBodyProcessed,
                    method: 'POST',
                    rejectUnauthorized: false 
                },
                (err, response, body) => {
                    if (!err) {
                        try {
                            const json_tok = JSON.parse(body);
                            resolve({ status: response.statusCode, data: json_tok, bodySent: searchRemitBodyProcessed, request_id });
                        } catch (error) {
                            console.error("Error parsing search remit response:", error);
                            reject({ status: response.statusCode, error: error.message });
                        }
                    } else {
                        console.error("Error searching remit:", err);
                        reject({ status: 1, error: err.message });
                    }
                }
            );
        });
    } catch (error) {
        console.error("Error in searchRemit:", error);
        throw error; // إعادة رمي الخطأ
    }
}

async function confirmRemit(token, id) {
    return new Promise((resolve, reject) => {
        const confirmRemitHeader = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "x-channel": "agent"
        };

        request.post(
            {
                headers: confirmRemitHeader,
                url: `${baseURL}/api/v1/account/remittance/payout/confirm/${id}`,
                body: "",
                method: 'POST',
                rejectUnauthorized: false ,
            },
            (err, response, body) => {
                if (!err) {
                    try {
                        const json_tok = JSON.parse(body);
                        resolve({ status: response.statusCode, data: json_tok });
                    } catch (error) {
                        console.error("Error parsing confirm remit response:", error);
                        reject({ status: response.statusCode, error: error.message });
                    }
                } else {
                    console.error("Error confirming remit:", err);
                    reject({ status: 1, error: err.message });
                }
            }
        );
    });
}

async function findQResponse(number) {
    return new Promise((resolve, reject) => {
        newApiRequest.insertData.find({ rem_no: number }, (err, apiData) => {
            if (err) {
                console.error("Error finding Q response:", err);
                return reject(err);
            }
            try {
                const lastEntry = apiData[apiData.length - 1];
                if (lastEntry && lastEntry.qRespones !== undefined) {
                    console.log("Qresponse is:", lastEntry.qRespones);
                    resolve(lastEntry);
                } else {
                    console.log("Qresponse is: undefined");
                    reject(lastEntry);
                }
            } catch (error) {
                console.error("Error processing Q response:", error);
                reject(error);
            }
        });
    });
}

async function findLastToken(serviceName) {
    return new Promise((resolve, reject) => {
        newApiRequest.insertData.find({ rem_no: "last token", service_name: serviceName }, (err, apiData) => {
            if (err) {
                console.error("Error finding last token:", err);
                return reject(err);
            }
            try {
                const lastEntry = apiData[apiData.length - 1];
                if (lastEntry && lastEntry.tokenBody !== undefined) {
                    console.log("Token found:", lastEntry.tokenBody);
                    console.log("requestData found:", lastEntry.requestData);
                    resolve(lastEntry);
                } else {
                    console.log("Token is: undefined");
                    reject(lastEntry);
                }
            } catch (error) {
                console.error("Error processing last token:", error);
                reject(error);
            }
        });
    });
}

function prepareBody(bodyReceived) {
    return JSON.stringify(bodyReceived);
}

async function saveData(data) {
    const newData = new newApiRequest.insertData(data);
    return newData.save();
}

function createDataObject(req, transactionId, amounts, requestData, responseData, qResponses, custId = "") {
    return {
        rem_no: req.rem_info.rem_no,
        transaction_id: transactionId,
        service_name: req.service_info.service_name,
        service_type: req.service_info.service_type,
        system_name: req.service_info.system_name,
        username: req.service_info.username,
        agent_code: req.service_info.agent_or_Branch_Code,
        agent_name: req.service_info.agent_or_Branch_name,
        date: Date.now(),
        requestData: requestData,
        responesData: JSON.stringify(responseData),
        Amounts: amounts,
        FirstName: responseData.remittance ? responseData.remittance.receiver_name : "",
        SecondName: "",
        ThirdName: "",
        LastName: "",
        CustID: custId,
        qRespones: qResponses,
        Request: JSON.stringify(req),
    };
}

function writeGeneralErrorXmlFile(error, serverData) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header/>
        <env:Body>
            <ns:Q_ReciveRem>
                <msg_info_server>
                    <code_serv>${serverData.code}</code_serv>
                    <msg_serv>${serverData.message}</msg_serv>
                </msg_info_server>
                <msg_info_API>
                    <code_API>-1</code_API>
                    <msg_API>${error}</msg_API>
                </msg_info_API>
            </ns:Q_ReciveRem>
        </env:Body>
    </env:Envelope>`;
}

function writeQueryRemitxml(responesData, remitNO, serverData) {
    const currency = responesData.currency.en === "YER" && responesData.group_id === "Sana`a" ? "YER" : responesData.currency.en;

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header/>
        <env:Body>
            <ns:Q_ReciveRem>
                <msg_info_server>
                    <code_serv>${serverData.code}</code_serv>
                    <msg_serv>${serverData.message}</msg_serv>
                </msg_info_server>
                <msg_info_API>
                    <code_API>1</code_API>
                    <msg_API>true</msg_API>
                </msg_info_API>
                <rem_info>
                    <rem_no>${remitNO}</rem_no>
                    <trans_key>${responesData.id}</trans_key>
                    <payout_amount>${responesData.net}</payout_amount>
                    <payout_cuyc>${currency}</payout_cuyc>
                    <payout_com>${responesData.commission}</payout_com>
                    <full_name>${responesData.remittance.receiver_name}</full_name>
                    <mobile>${responesData.remittance.receiver_phone}</mobile>
                </rem_info>
            </ns:Q_ReciveRem>
        </env:Body>
    </env:Envelope>`;
}

function writeConfirmRemitXmlFile(response, serverData) {
    const t_id = response.id;

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header/>
        <env:Body>
            <ns:CASHIN_P>
                <msg_info_server>
                    <code_serv>${serverData.code}</code_serv>
                    <msg_serv>${serverData.message}</msg_serv>
                </msg_info_server>
                <msg_info_API>
                    <code_API>1</code_API>
                    <msg_API>true</msg_API>
                </msg_info_API>
                <PaymentRem_RESP>
                    <transaction_id>${t_id}</transaction_id>
                </PaymentRem_RESP>
            </ns:CASHIN_P>
        </env:Body>
    </env:Envelope>`;
}

function reigonError(serverData) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header/>
        <env:Body>
            <ns:CASHIN_Q>
                <msg_info_server>
                    <code_serv>${serverData.code}</code_serv>
                    <msg_serv>${serverData.message}</msg_serv>
                </msg_info_server>
                <msg_info_API>
                    <code_API>-1</code_API>
                    <msg_API>لا يمكن تمرير العملية نظرا لأختلاف المنطقة</msg_API>
                </msg_info_API>
            </ns:CASHIN_Q>
        </env:Body>
    </env:Envelope>`;
}

function proccessingErrors(jsonGot) {
    let message;
    for (const key in jsonGot) {
        if (jsonGot.hasOwnProperty(key)) {
            message = jsonGot[key];
            break;
        }
    }
    console.log(message[0]);
    return message[0];
}

function getWalletID(responseData) {
    let walletID;

    // تحقق من أن responseData يحتوي على البيانات المطلوبة
    if (responseData && responseData.data && responseData.data.wallets) {
        // ابحث عن أول محفظة في القائمة
        if (responseData.data.wallets.length > 0) {
            walletID = responseData.data.wallets[0].id; // احصل على ID المحفظة
        } else {
            console.error("No wallets found in responseData.");
        }
    } else {
        console.error("Invalid responseData structure.");
    }

    console.log("Extracted Wallet ID:", walletID);
    return walletID; // إرجاع walletID
}


async function getResponesData(serviceName) {
    try {
        // استعلام قاعدة البيانات لاسترجاع البيانات
        const result = await newApiRequest.insertData.find({ rem_no: "last token", service_name: serviceName });

        // تحقق مما إذا كانت النتيجة تحتوي على بيانات
        if (result && result.length > 0) {
            // تخزين حقل responesData في متغير
            const responesData = result[0].responesData; // افترض أن النتيجة تحتوي على كائن واحد
            console.log("Respones Data retrieved:", responesData);
            return responesData; // إرجاع responesData
        } else {
            console.error("No data found for the specified service name.");
            return null; // إرجاع null إذا لم يتم العثور على بيانات
        }
    } catch (error) {
        console.error("Error retrieving responesData:", error);
        throw error; // إعادة رمي الخطأ
    }
}

module.exports.floosakRemitServer = floosakRemitServer;



