const express = require('express');
const router = express.Router();
const request = require("request-promise-native");
const newApiRequest = require('../../db_modal/alnoamanNewModal');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const baseURL = "https://app.centralbank.gov.ye:2024/api/v1";
const loginEndPoint = "/AuthenticationAPI/Login";
const PostALLAccountBalancesEndPoint = "/AccountBalances/PostALLAccountBalances";

const username = process.env.CBY_USERNAME;
const password = process.env.CBY_PASSWORD;
const authorization = 'Basic ' + toBase64(username, password);

router.use(express.json({ limit: "100mb" }));

router.post('/CBY/PostALLAccountBalances', express.json(), async (req, res) => {
    const jsonRequests = req.body;
    console.log('📥 Received JSON:', JSON.stringify(jsonRequests, null, 2));

    const rem_no = `CBY_${Date.now()}`;

    try {
        // Step 1: Store the request once
        const initialLog = new newApiRequest.insertData({
            rem_no,
            service_name: "CBY",
            service_type: "PostALLAccountBalances",
            date: new Date(),
            requestData: JSON.stringify(jsonRequests),
            remStatus: "0" // وضع مبدأي بانتظار الرد
        });

        await initialLog.save();
        console.log(`✅ Request saved with rem_no: ${rem_no}`);

        // Step 2: get token and call API
        const tokenData = await findLastToken();
        let token;

        if (tokenData && !isTokenExpired(tokenData.tokenBody)) {
            token = tokenData.tokenBody;
        } else {
            token = await getToken();
        }

        const response = await PostALLAccountBalances(token, jsonRequests);

        // Step 3: update the record with the response
        const updateFields = {
            responesData: JSON.stringify(response),
            tokenBody: token,
            remStatus: response?.error?.length > 0
                ? response.error[0].code?.toString() ?? "error"
                : "1"
        };

        await newApiRequest.insertData.updateOne({ rem_no }, { $set: updateFields });

        console.log('📤 Response:', JSON.stringify(response, null, 2));
        console.log(`✅ Response updated for rem_no: ${rem_no}`);

        res.status(200).send(response);

    } catch (error) {
        console.error('❌ Error in /CBY/PostALLAccountBalances:', error);
        res.status(500).json(writeGeneralError(error.message));

        // Optional: log error response back to the DB
        await newApiRequest.insertData.updateOne(
            { rem_no },
            { $set: { responesData: JSON.stringify({ error: error.message }), remStatus: "500" } }
        );
    }
});

async function PostALLAccountBalances(token, requests) {
    const options = {
        method: 'POST',
        uri: `${baseURL}${PostALLAccountBalancesEndPoint}`,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: requests,
        json: true
    };

    try {
        return await request(options);
    } catch (error) {
        console.error('❌ Error PostALLAccountBalances:', error.message);
        throw error;
    }
}

function isTokenExpired(token) {
    const decoded = jwt.decode(token);
    return decoded.exp < Date.now() / 1000;
}

async function getToken() {
    const options = {
        method: 'POST',
        uri: `${baseURL}${loginEndPoint}`,
        headers: {
            "Authorization": authorization,
            "Content-Type": "application/json"
        },
        json: true
    };

    try {
        const tokenResponse = await request(options);
        return tokenResponse.access_token;
    } catch (error) {
        console.error('❌ Error getting token:', error.message);
        throw error;
    }
}

async function findLastToken() {
    const apiData = await newApiRequest.insertData.find({
        rem_no: "last token",
        service_name: "CBY"
    });

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
