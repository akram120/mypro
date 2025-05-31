const mongoose = require('mongoose');
const apiSchema = new mongoose.Schema({
    rem_no: {
        type: String,
        required: true
    },
    mobile_no: {
        type: String,
        required: false
    },
    transaction_id: {
        type: String,
        required: false
    },
    service_name: {
        type: String,
        required: false
    },
    service_type: {
        type: String,
        required: false
    },
    FirstName: {
        type: String,
        required: false
    },
    SecondName: {
        type: String,
        required: false
    },
    ThirdName: {
        type: String,
        required: false
    },
    LastName: {
        type: String,
        required: false
    },
    CustID: {
        type: String,
        required: false
    },
    system_name: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    agent_code: {
        type: String,
        required: false
    },
    agent_name: {
        type: String,
        required: false
    },
    agent_address: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    Data_Time: {
        type: String,
        required: false
    },
    requestData: {
        type: String,
        required: false
    },
    responesData: {
        type: String,
        required: false
    },
    tokenBody: {
        type: String,
        required: false
    },
    request_id: {
        type: String,
        required: false
    },
    Amounts: {
        type: String,
        required: false
    },
    OTP: {
        type: String,
        required: false
    },
    Request: {
        type: String,
        required: false
    },
    qRespones: {
        type: String,
        required: false
    },
    pRespones: {
        type: String,
        required: false
    },
    remStatus: {
        type: String,
        required: false
    }
});

let insertData = mongoose.model('alnoamanApi', apiSchema, 'apiData');
module.exports.insertData = insertData;