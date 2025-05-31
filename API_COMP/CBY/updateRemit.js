
const express = require('express');
const router = express.Router();
const request = require("request-promise-native");
const xml2js = require('xml2js');
const newApiRequest = require('../../db_modal/alnoamanNewModal');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const baseURL = "https://app.centralbank.gov.ye:2024/api/v1";
const loginEndPoint = "/AuthenticationAPI/Login";
const UpdateRemitEndPoint = "/Transaction/UpdateRemit";

const username = process.env.CBY_USERNAME;
const password = process.env.CBY_PASSWORD;
const authorization = 'Basic ' + toBase64(username, password);

router.post('/CBY/UpdateRemit', express.text({ type: 'application/xml' }), async (req, res) => {
    try {
        // خطوة 1: تحويل XML إلى JSON
        const sysRequest = await parseXML(req.body);
        // console.log('Received JSON:', sysRequest); // لطباعة JSON المستلم
   
        // تشكيل JSON بالشكل المطلوب
        const formattedRequest = formatRequest(sysRequest.Envelope.Body.RequestBody);
        console.log('Formatted Request:', formattedRequest); // لطباعة JSON المنسق

        // خطوة 2: إرسال JSON إلى API البنك المركزي
        const response = await updateRemitToCBY(formattedRequest);

        // خطوة 3: تحويل الرد إلى XML
        const xmlResponse = await convertJSONToXML(response);
        
        // خطوة 4: إرسال الرد كاستجابة
        res.status(200).send(xmlResponse);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json(writeGeneralError(error.message));
    }
});

async function parseXML(xml) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
            if (err) return reject(new Error("Invalid XML format"));
            resolve(result);
        });
    });
}

async function updateRemitToCBY(req) {
    let tokenData = await findLastToken();
    let token;
    console.log(tokenData + 'tokdata');
    // تحقق من وجود الرمز المميز وصلاحيته
    if (tokenData && !isTokenExpired(tokenData.tokenBody)) {
        token = tokenData.tokenBody;
    } else {
        token = await getToken(); // احصل على رمز جديد
    }

    const response = await updateRemit(token, req);
    await logRequest(req, response, tokenData);
    console.log(response);
    return response;
}

function isTokenExpired(token) {
    const decoded = jwt.decode(token);
    return decoded.exp < Date.now() / 1000; // تحقق من انتهاء صلاحية الرمز
}


async function getToken() {
    const options = {
        method: 'POST',
        uri: `${baseURL}${loginEndPoint}`,
        headers: {
            "Authorization": authorization,
            "Content-Type": "application/json"
        },
        json: true // Automatically stringifies the body to JSON
    };

    try {
        const tokenResponse = await request(options);
        // console.log('Token Response:', JSON.stringify(tokenResponse, null, 2)); // طباعة الاستجابة بالكامل بتنسيق JSON
        return tokenResponse.access_token; // تأكد من أن هذه هي الطريقة الصحيحة للحصول على الرمز المميز
    } catch (error) {
        console.error('Error getting token:', error);
        if (error.response) {
            console.error('Response body:', error.response.body);
        }
        throw error; // إعادة رمي الخطأ حتى يمكن التعامل معه في مكان آخر
    }
}

async function updateRemit(token, req) {
    console.log(token+'<--token');
    const options = {
        method: 'PUT',
        uri: `${baseURL}${UpdateRemitEndPoint}`,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: req, // إرسال JSON مباشرة
        json: true // سيتم تحويل الجسم إلى JSON تلقائيًا
    };

    // return request(options);
    try {
        const response = await request(options);
        return response; // تأكد من أن هذه هي الطريقة الصحيحة للحصول على الاستجابة
    } catch (error) {
        console.error('Error updateing remit:', error);
        throw error; // إعادة رمي الخطأ حتى يمكن التعامل معه في مكان آخر
    }

}

async function findLastToken() {
    const apiData = await newApiRequest.insertData.find({ rem_no:"last token", service_name: "CBY" });
    return apiData.length > 0 ? apiData[apiData.length - 1] : null;
}

async function logRequest(req, response, tokenData) {
    const newData = new newApiRequest.insertData({
        rem_no: req.referenceId,
        transaction_id: response.transactionId || "",
        service_name: "CBY",
        service_type: "update remit",
        date: Date.now(),
        tokenBody: tokenData ? tokenData.tokenBody : '',
        requestData: JSON.stringify(req),
        responesData: JSON.stringify(response),
        CustID: response.rowVersion || "",
        remStatus:response.code  != undefined ? response.code : 1,
    });

    await newData.save();
}

async function convertJSONToXML(json) {
    const builder = new xml2js.Builder();
    return builder.buildObject(json);
}

function writeGeneralError(message) {
    return {
        "code": 5005,
        "message": message
    };
}

function toBase64(username, password) {
    return Buffer.from(`${username}:${password}`).toString("base64");
}

function isTokenExpired(token) {
    const decoded = jwt.decode(token);
    if (decoded.exp < Date.now() / 1000) {
        return true;
    }
    return false;
}



function formatRequest(requestBody) {
    return {
        referenceId: requestBody.referenceId,
        amount: parseInt(requestBody.amount, 10),
        currency: requestBody.currency,
        rowVersion: requestBody.rowVersion,
        transferDate: requestBody.transferDate,
        senderName: requestBody.senderName,
        transferStatus: parseInt(requestBody.transferStatus, 10),
        senderPhonenumber: requestBody.senderPhonenumber,
        recipientName: requestBody.recipientName,
        recipientPhoneNumber: requestBody.recipientPhoneNumber,
        sourceParty: requestBody.sourceParty,
        lateSourceParty: requestBody.lateSourceParty,
        deliveryParty: requestBody.deliveryParty,
        destinationParty: requestBody.destinationParty,
        sendPaymentMethod: requestBody.sendPaymentMethod,
        deliveryDate: requestBody.deliveryDate,
        recivedPaymentMethod: requestBody.recivedPaymentMethod,
        networkName: requestBody.networkName,
        purpose: requestBody.purpose,
        mainPurpose: requestBody.mainPurpose,
        paymentAmount: parseInt(requestBody.paymentAmount, 10),
        pymentCurrency: requestBody.pymentCurrency,
        senderIdentityNumberType: parseInt(requestBody.senderIdentityNumberType, 10),
        recipientIdentityNumberType: parseInt(requestBody.recipientIdentityNumberType, 10),
        senderIdentityNumber: requestBody.senderIdentityNumber,
        recipientIdentityNumber: requestBody.recipientIdentityNumber,
        senderIdentityProduceDate: requestBody.senderIdentityProduceDate,
        recipientIdentityProduceDate: requestBody.recipientIdentityProduceDate,
        recipientJobNuture: requestBody.recipientJobNuture,
        senderJobNuture: requestBody.senderJobNuture,
        recipientNationalty: requestBody.recipientNationalty,
        senderNationalty: requestBody.senderNationalty,
        recipientAddress: requestBody.recipientAddress,
        transferType: parseInt(requestBody.transferType, 10),
        processType: parseInt(requestBody.processType, 10),
        isIndividual: requestBody.isIndividual === "True",
        senderType: parseInt(requestBody.senderType, 10),
        isPermanentClient: requestBody.isPermanentClient === "Flase" ? false : true,
        IsRecipientPermanentClient: requestBody.IsRecipientPermanentClient === "True",
        sourceCountry: requestBody.sourceCountry,
        sourceCity: requestBody.sourceCity,
        sourceZone: requestBody.sourceZone,
        sourceBranch: requestBody.sourceBranch,
        destinationCountry: requestBody.destinationCountry,
        destinationCity: requestBody.destinationCity,
        destinationZone: requestBody.destinationZone,
        paymentCountry: requestBody.paymentCountry,
        paymentCity: requestBody.paymentCity,
        paymentZone: requestBody.paymentZone,
        incomeNumber: parseInt(requestBody.incomeNumber, 10),
        outcomeNumber: parseInt(requestBody.outcomeNumber, 10),
        destinationBranch: requestBody.destinationBranch,
        PaymentBranch: requestBody.PaymentBranch,
        opUser: requestBody.opUser 
    };
}

module.exports = router;

/*
const express = require('express');
const router = express.Router();
const request = require("request");
const baseURL = "https://app.centralbank.gov.ye:2024/api/v1";
const loginEndPoint="/AuthenticationAPI/Login";
const updateRemitEndPoint="/Transaction/UpdateRemit";
const username = "Qmtmoney-Ex";
const password = "Qmtmoney@73391";
const authorization = 'Basic ' + toBase64();
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var token='';
var rsp;

router.post('/CBY/UpdateRemit',express.json(),(req,res,next)=>{
    console.log("inside update Remit")
    rsp = res;
    console.log(req.body)
    var sysRequest = req.body;
    if(sysRequest.sourceBranch == "UPT - UNIVERSAL MONEY" || sysRequest.sourceBranch == "مؤسسة السعودي للصرافة"){
        res.status(500).json(
            {
            "code":5005,
            "message":`company ${sysRequest.sourceBranch} is not allowed to sync`
            }
        );

    } else {
        updateRemitToCBY(req.body, function(response){
            res.status(200).json(response);
           
});
    }

})

module.exports=router;


function updateRemitToCBY(req, callback){

    findLastToken().then(value=>{
        console.log("token found in DB");
            var trans_id = req['transactionId'];
            console.log("before call update remit transID IS:"+trans_id)
            delete req['transactionId']
            updateRemit(value.tokenBody,req,trans_id,function(status,data,bodySent){

                if (status==200){
                    
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.referenceId,
                              transaction_id:data.transactionId===undefined?"":data.transactionId,
                              service_name: "CBY",
                              service_type:"update remit",
                              date: Date.now(),
                              tokenBody:value.tokenBody,
                              requestData: JSON.stringify(req),
                              responesData: JSON.stringify(data),
                              CustID: data.rowVersion===undefined?"":data.rowVersion,
                            });
                            console.log(newData);
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    console.log('record was added');
                                    callback(data);
            
                                }
                                else {
                                    console.log("DataBase")
                                    callback(data);
                                }
            
                            });
                                  
                        
                }else if (status==401) {
                    getToken(function (status,tokenData){
                        if(status==200){
                         token = tokenData.access_token;
                         let newData = new newApiRequest.insertData(
                            {
                                rem_no: 'last token',
                                service_name: "CBY",
                                service_type:"update remit",
                                date: Date.now(),
                                requestData: JSON.stringify(authorization),
                                responesData: JSON.stringify(tokenData),
                                tokenBody:token,
                            });
                            console.log(newData);
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    console.log('record was added');
                                    updateRemitToCBY(req, function(response){
                                        rsp.status(200).json(response);
                                    });
            
                                }
                                else {
                                    var res_data = writeGeneralError("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة");
                                    callback(res_data);
                                }
            
                            });
                        } else {
                            var res_data =writeGeneralError("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة");
                            callback(res_data);
            
                        }
                    });
                    
                } else {
                    let newData = new newApiRequest.insertData(
                        {
                          rem_no: req.referenceId,
                          transaction_id:data.transactionId===undefined?"":data.transactionId,
                          service_name: "CBY",
                          service_type:"update remit",
                          date: Date.now(),
                          tokenBody:value.tokenBody,
                          requestData: JSON.stringify(req),
                          responesData: JSON.stringify(data),
                          CustID: data.rowVersion===undefined?"":data.rowVersion,
                        });
                        console.log(newData);
                        newData.save(async (err, doc) => {
                            if (!err) {
                                console.log('record was added');
                                if(status == 400){
                                    callback(data);

                                } else {
                                    var res_data =writeGeneralError(data);
                                    callback(res_data);
                                }
                                
        
                            }
                            else {
                                console.log("DataBase")
                                if(status == 400){
                                    callback(data);

                                } else {
                                    var res_data =writeGeneralError(data);
                                    callback(res_data);
                                }
                            }
        
                        });
                }
            });
        
    }).catch(value=>{
        console.log("token not found in DB");
        getToken(function (status,tokenData){
            if(status==200){
             token = tokenData.access_token;
             let newData = new newApiRequest.insertData(
                {
                    rem_no: 'last token',
                    service_name: "CBY",
                    service_type:"update remit",
                    date: Date.now(),
                    requestData: JSON.stringify(authorization),
                    responesData: JSON.stringify(tokenData),
                    tokenBody:token,
                });
                console.log(newData);
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        updateRemitToCBY(req, function(response){
                            rsp.status(200).json(response);
                        });

                    }
                    else {
                        var res_data = writeGeneralError("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة");
                        callback(res_data);
                    }

                });
            } else {
                var res_data =writeGeneralError("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة");
                callback(res_data);

            }
        });
    });

}

function getToken(callback){

    const getTokenHeader = {
        "Authorization": authorization,
        "Content-Type":"application/json",
    };

    request.post(
        {
            headers: getTokenHeader,
            url: baseURL+loginEndPoint,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message);
                }
            } else {
                return callback(1,err.message);
            }


        }
    );
}

function updateRemit(token,reqestToCBY,transaction_id,callback){

    const updateRemitHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
    };
    
    var updateRemitBodyProcessed = prepareBody(reqestToCBY);
    console.log("INSIDE call update remit transID IS:"+transaction_id)
    console.log("INSIDE call update remit URL  IS:"+baseURL+updateRemitEndPoint+"?transactionId="+transaction_id)
    request.put(
        {
            headers: updateRemitHeader,
            url: baseURL+updateRemitEndPoint+"?transactionId="+transaction_id,
            body: updateRemitBodyProcessed,
            method: 'PUT',
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, updateRemitBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, updateRemitBodyProcessed);
                }

            } else {
                return callback(1,err.message, updateRemitBodyProcessed);
            }

        }
    );

    
}



function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}


async function findLastToken() {

    var Qrespons;
    var entireRow;
    var tokenStored;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: "last token" , service_name:"CBY"}, (err, apiData) => {
        try {
            if (apiData[apiData.length - 1].tokenBody === undefined) {
                tokenStored = '';
                console.log("tokenStored is : undefined");
                reject(tokenStored);
            }
            else {
                Qrespons = apiData[apiData.length - 1].tokenBody;
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : " + Qrespons);
                resolve(entireRow);
            }

        } catch (error) {
            tokenStored = '';
            console.log("tokenStored is : blank");
            reject(entireRow);

        }


        console.log('55555555555555555555555555555555555555');
        console.log(entireRow)


    });
});
    
}

function writeGeneralError(error) {

    return {
        "code":5005,
        "message":error
    }
}

function toBase64() {
    var authBase64 = `${username + ":" + password}`;
    var base64String = new Buffer.from(authBase64).toString("base64");
    return base64String;
}

*/