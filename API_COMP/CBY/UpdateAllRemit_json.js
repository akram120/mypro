const express = require('express');
const router = express.Router();
const request = require("request-promise-native");
const newApiRequest = require('../../db_modal/alnoamanNewModal');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const baseURL = "https://app.centralbank.gov.ye:2024/api/v1";
const loginEndPoint = "/AuthenticationAPI/Login";
const UpdateAllRemitEndPoint = "/Transaction/UpdateAllRemit";

const username = process.env.CBY_USERNAME;
const password = process.env.CBY_PASSWORD;
const authorization = 'Basic ' + toBase64(username, password);

// استقبال الطلب كـ JSON
router.post('/CBY/UpdateAllRemit', express.json({ limit: '10mb' }), async (req, res) => {
    try {
        const jsonRequests = req.body; // هنا نفترض أن jsonRequests هو مصفوفة من العمليات
        console.log('Received JSON:', jsonRequests); // لطباعة JSON المستلم
        console.log('referenceId valu:', jsonRequests.referenceId); // لطباعة JSON المستلم

        // تأكد من إضافة RowVersion لكل طلب
        const requestsWithRowVersion = jsonRequests.map(request => {
            // تحقق من وجود RowVersion في الطلب
            if (!request.rowVersion) {
                console.warn(`RowVersion is missing for request with referenceId: ${request.referenceId}`);
            }
             if (!request.referenceId) {
                console.warn(`referenceId is missing for request with referenceId: ${request.referenceId}`);
            }
            return request;
            // return {
                // ...request,
                // RowVersion: request.RowVersion || "" // تأكد من وجود RowVersion
            // };
        });

        console.log('Requests with RowVersion:', requestsWithRowVersion); // طباعة الطلبات المعدلة

        const tokenData = await findLastToken();
        let token;

        if (tokenData && !isTokenExpired(tokenData.tokenBody)) {
            token = tokenData.tokenBody;
        } else {
            token = await getToken(); // احصل على رمز جديد
        }

        const response = await UpdateAllRemit(token, requestsWithRowVersion);
        
        // خطوة 3: تسجيل كل عملية في السجل
        await logRequests(jsonRequests, response, tokenData);

        // إرسال الرد كاستجابة
        res.status(200).send(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json(writeGeneralError(error.message));
    }
});
async function UpdateAllRemit(token, requests) {
    const options = {
        method: 'PUT',
        uri: `${baseURL}${UpdateAllRemitEndPoint}`,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" // تأكد من أن نوع المحتوى هو JSON
        },
        body: requests, // إرسال JSON مباشرة
        json: true // سيتم تحويل الجسم إلى JSON تلقائيًا
    };

    try {
        const response = await request(options);
        return response; // تأكد من أن هذه هي الطريقة الصحيحة للحصول على الاستجابة
    } catch (error) {
        console.error('Error Updateing remit:', error);
        throw error; // إعادة رمي الخطأ حتى يمكن التعامل معه في مكان آخر
    }
}

async function logRequests(requests, response, tokenData) {
    // معالجة الأخطاء
    console.log(response );
    console.log('response');
    if (response.error && response.error.length > 0) {
        for (let i = 0; i < response.error.length; i++) {
            const error = response.error[i];

            const req = requests.find(request => request.referenceId === error.referenceId);
                    console.log(req );
                    console.log('req.referenceId' );
            const newData = new newApiRequest.insertData({
                rem_no: req ? req.referenceId : "", // تأكد من وجود req
                transaction_id: "",
                service_name: "CBY",
                service_type: "UpdateAllRemit",
                date: Date.now(),
                tokenBody: tokenData ? tokenData.tokenBody : '',
                requestData: JSON.stringify(req), // حفظ الطلب
                responesData: JSON.stringify(error), // حفظ الخطأ
                CustID: "",
                remStatus: error.code, // تخزين كود الخطأ
            });

            await newData.save();
        }
    }

    // معالجة العمليات الناجحة
    if (response.success && response.success.length > 0) {
        for (let i = 0; i < response.success.length; i++) {
            const res = response.success[i];       
            const req = requests.find(request => request.referenceId === res.referenceId); // تأكد من مطابقة المرجع
            console.log(req.referenceId );
            console.log('req.referenceId s' );
            const newData = new newApiRequest.insertData({
                rem_no: req ? req.referenceId : "", // تأكد من وجود req
                transaction_id: res.transactionId || "", // تخزين transactionId
                service_name: "CBY",
                service_type: "UpdateAllRemit",
                date: Date.now(),
                tokenBody: tokenData ? tokenData.tokenBody : '',
                requestData: JSON.stringify(req), // حفظ الطلب
                responesData: JSON.stringify(res), // حفظ الرد الناجح
                CustID: res.rowVersion || "", // تخزين rowVersion
                remStatus: 1,      
            });

            await newData.save();
        }
    }
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
        return tokenResponse.access_token; 
    } catch (error) {
        console.error('Error getting token:', error);
        if (error.response) {
            console.error('Response body:', error.response.body);
        }
        throw error; // إعادة رمي الخطأ حتى يمكن التعامل معه في مكان آخر
    }
}

async function findLastToken() {
    const   apiData = await newApiRequest.insertData.find({ rem_no: "last token", service_name: "CBY" });
    return apiData.length > 0 ? apiData[apiData.length - 1] : null;
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

module.exports = router;
