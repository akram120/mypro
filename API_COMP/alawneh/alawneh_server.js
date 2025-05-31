const request = require("request");
const baseURL = "https://prod-gateway.eway.jo:443/payout/v01/";
const tokenURL = "https://prod-gateway.eway.jo:443/token";
const getTransactionDetails = "getTransactionDetails";
const acceptTransactions = "acceptTransactions";
const processTransaction = "processTransaction";
const getPendingAcceptedTransactions = "getPendingAcceptedTransactions"
const errorTransaction = "errorTransaction";
const getErrorTransactions = "getErrorTransactions";
const content_type = 'application/json';
const TokenContent_type = 'application/x-www-form-urlencoded; charset=UTF-8';
const alawanehTokenHeader = { 'content-type': TokenContent_type };
const username = "Noaman_WSbank";
const password = "Noaman$#2022#";
const pin = "63964";
const clientSecret = "NNEjEC_1NH8Q_iW8vHmkN4nNt9sa";
const clientid = "T3tWamCxFUbncgxtgmKw3b7CV6Qa";
const accountObject = {
    "username": username,
    "password": password,
    "pin": pin
};
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var object_id = "";
const statusMessage = new Map([
    ["SENT_FOR_PAY", "المعاملة تتم معالجتها من قبل وكيل او بنك آخر"],
    ["SENT_FOR_DELIVERY", "المعاملة تتم معالجتها من قبل وكيل او بنك آخر"],
    ["PROCESSED", "الحوالة مدفوعة"],
    ["ABORTED", "الحوالة في حالة الإلغاء"],
    ["DELETED", "تم إلغاء الحوالة."],
    ["ERROR", "هناك بعض المشاكل في المعاملة وهي تمر بدورة تصحيح الخطأ."],
    ["HQ_OK_PAID", "تنتظر المعاملة موافقة البنك / الوكيل قبل أن تكون جاهزة للمعالجة ولكن تم إضافة المعاملة إلى البنك / الوكيل المُعالج بالفعل"],
  ]);





function Alawneh_server(req, callback) {

    if ((req.service_info.service_type).toUpperCase() == 'Q_REM') { 

        getToken(function (status,tokeData, requestSent){
            if(status==200){
                var token = tokeData.access_token;
                var remitNo = req.rem_info.rem_no;
                getPendingAcceptedTransactionsF(token,function (status,data,requestSents){
                    if(status==200){
                        if(data.status=="FAIL"){
                            var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remitNo,
                                    transaction_id: "",
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: requestSents,
                                    responesData: JSON.stringify(data),
                                    tokenBody: JSON.stringify(tokeData),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: res_data,
                                    Request: JSON.stringify(req),
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        object_id = doc['_id'];
                                        console.log(object_id);
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        }
                        else {
                            if(data.result.count==0){
                                console.log("No accepted transactions");
                                getTransactionDetailsF(remitNo, token, function (status,data,requestSent){
                                    if(status==200){
                                        if(data.status=="FAIL"){
                                            var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: "",
                                                    FirstName: "",
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                });
                                                console.log(newData);
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        object_id = doc['_id'];
                                                        console.log(object_id);
                                                        console.log('record was added');
                                                        callback(res_data);
                                
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                        callback(callbackResponse);
                                                    }
                                
                                                });
                                        } else {
                                          if(data.result.transaction.status=='HQ_OK'){
                                            var res_data = writeCashOutQXmlFile(data,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: data.result.transaction.receive_amount,
                                                    FirstName: data.result.transaction.benef_name,
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                });
                                                console.log(newData);
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        object_id = doc['_id'];
                                                        console.log('record was added');
                                                        callback(res_data);
                                
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeCashOutQXmlFile(data,database_error);
                                                        callback(callbackResponse);
                                                    }
                                
                                                });
                                          } else {
                                            var res_data = writeStatusErrorXmlFile(data.result.transaction.status,`${data.result.transaction.status}--${statusMessage.get(data.result.transaction.status)}`,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: "",
                                                    FirstName: "",
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                });
                                                console.log(newData);
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        object_id = doc['_id'];
                                                        console.log(object_id);
                                                        console.log('record was added');
                                                        callback(res_data);
                                
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeStatusErrorXmlFile(data.result.transaction.status,`${data.result.transaction.status}--${statusMessage.get(data.result.transaction.status)}`,database_error);
                                                        callback(callbackResponse);
                                                    }
                                
                                                });
                                          }
                                        }
                                
                                    } else {
                                        var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                        let newData = new newApiRequest.insertData(
                                            {
                                                rem_no: remitNo,
                                                transaction_id: "",
                                                service_name: req.service_info.service_name,
                                                service_type: req.service_info.service_type,
                                                system_name: req.service_info.system_name,
                                                username: req.service_info.username,
                                                agent_code: req.service_info.agent_or_Branch_Code,
                                                agent_name: req.service_info.agent_or_Branch_name,
                                                date: Date.now(),
                                                requestData: requestSent,
                                                responesData: JSON.stringify(data),
                                                tokenBody: JSON.stringify(tokeData),
                                                Amounts: "",
                                                FirstName: "",
                                                SecondName: "",
                                                ThirdName: "",
                                                LastName: "",
                                                CustID: "",
                                                qRespones: res_data,
                                                Request: JSON.stringify(req),
                                            });
                                            console.log(newData);
                                            newData.save(async (err, doc) => {
                                                if (!err) {
                                                    object_id = doc['_id'];
                                                    console.log('record was added');
                                                    callback(res_data);
                                
                                                }
                                                else {
                                                    console.log("DataBase")
                                                    console.log(err);
                                                    var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                    callback(callbackResponse);
                                                }
                                
                                            });
                                    }
                                }); 
                            } else {
                                console.log("there are accepted transactions");
                                var transactions = [];
                                var x = 0 ;  
                                transactions = data.result.transactions.transaction;
                                transactions.every((remit,index)=>{
                                    if(remit.trans_ref==remitNo){
                                        x = 1;
                                        return false;
                                    } else {
                                        x = 0 ;
                                        return true;
                                    }
                                });
                                if(x==1){
                                    getTransactionDetailsF(remitNo, token, function (status,data,requestSent){
                                        if(status==200){
                                            if(data.status=="FAIL"){
                                                var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                    });
                                                    console.log(newData);
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            object_id = doc['_id'];
                                                            console.log(object_id);
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                            } else {
                                              if(data.result.transaction.status=='HQ_OK'|| data.result.transaction.status=='SENT_FOR_PAY' || data.result.transaction.status=='SENT_FOR_DELIVERY'){
                                                var res_data = writeCashOutQXmlFile(data,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: data.result.transaction.receive_amount,
                                                        FirstName: data.result.transaction.benef_name,
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                    });
                                                    console.log(newData);
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            object_id = doc['_id'];
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeCashOutQXmlFile(data,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                              } else {
                                                var res_data = writeStatusErrorXmlFile(data.result.transaction.status,`${data.result.transaction.status}--${statusMessage.get(data.result.transaction.status)}`,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                    });
                                                    console.log(newData);
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            object_id = doc['_id'];
                                                            console.log(object_id);
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse =  writeStatusErrorXmlFile(data.result.transaction.status,`${data.result.transaction.status}--${statusMessage.get(data.result.transaction.status)}`,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                              }
                                            }
                                    
                                        } else {
                                            var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: "",
                                                    FirstName: "",
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                });
                                                console.log(newData);
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        object_id = doc['_id'];
                                                        console.log('record was added');
                                                        callback(res_data);
                                    
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                        callback(callbackResponse);
                                                    }
                                    
                                                });
                                        }
                                    }); 
                                } else if(x==0){
                                    console.log("ACCPTED TRANS BUT NOT THIS")
                                    getTransactionDetailsF(remitNo, token, function (status,data,requestSent){
                                        if(status==200){
                                            if(data.status=="FAIL"){
                                                var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                    });
                                                    console.log(newData);
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            object_id = doc['_id'];
                                                            console.log(object_id);
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                            } else {
                                              if(data.result.transaction.status=='HQ_OK'){
                                                var res_data = writeCashOutQXmlFile(data,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: data.result.transaction.receive_amount,
                                                        FirstName: data.result.transaction.benef_name,
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                    });
                                                    console.log(newData);
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            object_id = doc['_id'];
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeCashOutQXmlFile(data,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                              } else {
                                                var res_data = writeStatusErrorXmlFile(data.result.transaction.status,`${data.result.transaction.status}--${statusMessage.get(data.result.transaction.status)}`,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                    });
                                                    console.log(newData);
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            object_id = doc['_id'];
                                                            console.log(object_id);
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeStatusErrorXmlFile(data.result.transaction.status,`${data.result.transaction.status}--${statusMessage.get(data.result.transaction.status)}`,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                              }
                                            }
                                    
                                        } else {
                                            var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: "",
                                                    FirstName: "",
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                });
                                                console.log(newData);
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        object_id = doc['_id'];
                                                        console.log('record was added');
                                                        callback(res_data);
                                    
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                        callback(callbackResponse);
                                                    }
                                    
                                                });
                                        }
                                    }); 
                                }
                            }
                        }
                    } else {
                        var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: remitNo,
                                transaction_id: "",
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: requestSents,
                                responesData: JSON.stringify(data),
                                tokenBody: JSON.stringify(tokeData),
                                Amounts: "",
                                FirstName: "",
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: res_data,
                                Request: JSON.stringify(req),
                            });
                            console.log(newData);
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    object_id = doc['_id'];
                                    console.log('record was added');
                                    callback(res_data);
                
                                }
                                else {
                                    console.log("DataBase")
                                    console.log(err);
                                    var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                    callback(callbackResponse);
                                }
                
                            });
                    }
                });
            } else {
                var remitNo = req.rem_info.rem_no;
                var res_data = writeTokenErrorXmlFile(no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: remitNo,
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: requestSent,
                        responesData: JSON.stringify(tokeData),
                        tokenBody: JSON.stringify(tokeData),
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: res_data,
                        Request: JSON.stringify(req),
                    });
                console.log(newData);
                newData.save(async (err, doc) => {
                    if (!err) {
                        object_id = doc['_id'];
                        console.log('record was added');
                        callback(res_data);

                    }
                    else {
                        console.log("DataBase")
                        console.log(err);
                        var callbackResponse = writeTokenErrorXmlFile(database_error);
                        callback(callbackResponse);
                    }

                });
            }
        });
    } else if ((req.service_info.service_type).toUpperCase() == 'P_REM') {


        getToken(function (status,tokeData,requestSent){
            if(status==200){
                var token = tokeData.access_token;
                var remitNo = req.rem_info.rem_no;
                getPendingAcceptedTransactionsF(token,function (status,data,requestSents){
                    if(status==200){
                        if(data.status=="FAIL"){
                            var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remitNo,
                                    transaction_id: "",
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: requestSents,
                                    responesData: JSON.stringify(data),
                                    tokenBody: JSON.stringify(tokeData),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: res_data,
                                    Request: JSON.stringify(req),
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        object_id = doc['_id'];
                                        console.log(object_id);
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        } else {
                            if(data.result.count==0){
                                acceptTransactionsF(remitNo, token, function (status,data,requestSent) {
                                    if(status==200){
                                        if(data.status=="SUCCESS"){
                                            if(data.result.transactions.transaction[0].operation_result=="SUCCESS"){
                                                var idNumber = req.rem_info.IDNumber;
                                                var issueDate = req.rem_info.IssueDate;
                                                processTransactionsF(remitNo, token, function (status, data,requestSent){
                                                    if(status==200){
                                                        if(data.status=="FAIL"){
                                                            findQResponse(remitNo).then(valueRecevied => {
                                                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                                console.log(valueRecevied)
                                                                var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                                let newData = new newApiRequest.insertData(
                                                                    {
                                                                        rem_no: remitNo,
                                                                        transaction_id: "",
                                                                        service_name: req.service_info.service_name,
                                                                        service_type: req.service_info.service_type,
                                                                        system_name: req.service_info.system_name,
                                                                        username: req.service_info.username,
                                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                                        date: Date.now(),
                                                                        requestData: requestSent,
                                                                        responesData: JSON.stringify(data),
                                                                        tokenBody: JSON.stringify(tokeData),
                                                                        Amounts: valueRecevied.Amounts,
                                                                        FirstName: valueRecevied.FirstName,
                                                                        SecondName: "",
                                                                        ThirdName: "",
                                                                        LastName: "",
                                                                        CustID: "",
                                                                        qRespones: valueRecevied.qRespones,
                                                                        pRespones: res_data,
                                                                        Request: JSON.stringify(req),
                                                                        remStatus: ""
                                                                    });
                                                                console.log(newData)
                                    
                                                                newData.save(async (err, doc) => {
                                                                    if (!err) {
                                                                        console.log('record was added');
                                                                        callback(res_data);
                                    
                                                                    }
                                                                    else {
                                                                        console.log("DataBase")
                                                                        console.log(err);
                                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                    
                                                                });
                                                            }).catch(valueRecevied => {
                                    
                                                                var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                                let newData = new newApiRequest.insertData(
                                                                    {
                                                                        rem_no: remitNo,
                                                                        transaction_id: "",
                                                                        service_name: req.service_info.service_name,
                                                                        service_type: req.service_info.service_type,
                                                                        system_name: req.service_info.system_name,
                                                                        username: req.service_info.username,
                                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                                        date: Date.now(),
                                                                        requestData: requestSent,
                                                                        responesData: JSON.stringify(data),
                                                                        tokenBody: JSON.stringify(tokeData),
                                                                        Amounts: "",
                                                                        FirstName: "",
                                                                        SecondName: "",
                                                                        ThirdName: "",
                                                                        LastName: "",
                                                                        CustID: "",
                                                                        qRespones: "",
                                                                        pRespones: res_data,
                                                                        Request: JSON.stringify(req),
                                                                        remStatus: ""
                                                                    });
                                                                console.log(newData)
                                                                newData.save(async (err, doc) => {
                                                                    if (!err) {
                                                                        console.log('record was added');
                                                                        callback(res_data);
                                    
                                                                    }
                                                                    else {
                                                                        console.log("DataBase")
                                                                        console.log(err);
                                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                    
                                                                });
                                                            });
                                                        } else {
                                                            findQResponse(remitNo).then(valueRecevied => {
                                                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                                console.log(valueRecevied)
                                                                var res_data = writePaySuccessXmlFile(data.result.process_result,no_server_error);
                                                                let newData = new newApiRequest.insertData(
                                                                    {
                                                                        rem_no: remitNo,
                                                                        transaction_id: "",
                                                                        service_name: req.service_info.service_name,
                                                                        service_type: req.service_info.service_type,
                                                                        system_name: req.service_info.system_name,
                                                                        username: req.service_info.username,
                                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                                        date: Date.now(),
                                                                        requestData: requestSent,
                                                                        responesData: JSON.stringify(data),
                                                                        tokenBody: JSON.stringify(tokeData),
                                                                        Amounts: valueRecevied.Amounts,
                                                                        FirstName: valueRecevied.FirstName,
                                                                        SecondName: "",
                                                                        ThirdName: "",
                                                                        LastName: "",
                                                                        CustID: "",
                                                                        qRespones: valueRecevied.qRespones,
                                                                        pRespones: res_data,
                                                                        Request: JSON.stringify(req),
                                                                        remStatus: "1"
                                                                    });
                                                                console.log(newData)
                                    
                                                                newData.save(async (err, doc) => {
                                                                    if (!err) {
                                                                        console.log('record was added');
                                                                        callback(res_data);
                                    
                                                                    }
                                                                    else {
                                                                        console.log("DataBase")
                                                                        console.log(err);
                                                                        var callbackResponse = writePaySuccessXmlFile(data.result.process_result,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                    
                                                                });
                                                            }).catch(valueRecevied => {
                                    
                                                                var res_data = writePaySuccessXmlFile(data.result.process_result,no_server_error);
                                                                let newData = new newApiRequest.insertData(
                                                                    {
                                                                        rem_no: remitNo,
                                                                        transaction_id: "",
                                                                        service_name: req.service_info.service_name,
                                                                        service_type: req.service_info.service_type,
                                                                        system_name: req.service_info.system_name,
                                                                        username: req.service_info.username,
                                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                                        date: Date.now(),
                                                                        requestData: requestSent,
                                                                        responesData: JSON.stringify(data),
                                                                        tokenBody: JSON.stringify(tokeData),
                                                                        Amounts: "",
                                                                        FirstName: "",
                                                                        SecondName: "",
                                                                        ThirdName: "",
                                                                        LastName: "",
                                                                        CustID: "",
                                                                        qRespones: "",
                                                                        pRespones: res_data,
                                                                        Request: JSON.stringify(req),
                                                                        remStatus: "1"
                                                                    });
                                                                console.log(newData)
                                                                newData.save(async (err, doc) => {
                                                                    if (!err) {
                                                                        console.log('record was added');
                                                                        callback(res_data);
                                    
                                                                    }
                                                                    else {
                                                                        console.log("DataBase")
                                                                        console.log(err);
                                                                        var callbackResponse = writePaySuccessXmlFile(data.result.process_result,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                    
                                                                });
                                                            });
                                                        }
                                                    } else {
                                                        findQResponse(remitNo).then(valueRecevied => {
                                                            console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                            console.log(valueRecevied)
                                                            var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                            let newData = new newApiRequest.insertData(
                                                                {
                                                                    rem_no: remitNo,
                                                                    transaction_id: "",
                                                                    service_name: req.service_info.service_name,
                                                                    service_type: req.service_info.service_type,
                                                                    system_name: req.service_info.system_name,
                                                                    username: req.service_info.username,
                                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                                    date: Date.now(),
                                                                    requestData: requestSent,
                                                                    responesData: JSON.stringify(data),
                                                                    tokenBody: JSON.stringify(tokeData),
                                                                    Amounts: valueRecevied.Amounts,
                                                                    FirstName: valueRecevied.FirstName,
                                                                    SecondName: "",
                                                                    ThirdName: "",
                                                                    LastName: "",
                                                                    CustID: "",
                                                                    qRespones: valueRecevied.qRespones,
                                                                    pRespones: res_data,
                                                                    Request: JSON.stringify(req),
                                                                    remStatus: ""
                                                                });
                                                            console.log(newData)
                                
                                                            newData.save(async (err, doc) => {
                                                                if (!err) {
                                                                    console.log('record was added');
                                                                    callback(res_data);
                                
                                                                }
                                                                else {
                                                                    console.log("DataBase")
                                                                    console.log(err);
                                                                    var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                                    callback(callbackResponse);
                                                                }
                                
                                                            });
                                                        }).catch(valueRecevied => {
                                
                                                            var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                            let newData = new newApiRequest.insertData(
                                                                {
                                                                    rem_no: remitNo,
                                                                    transaction_id: "",
                                                                    service_name: req.service_info.service_name,
                                                                    service_type: req.service_info.service_type,
                                                                    system_name: req.service_info.system_name,
                                                                    username: req.service_info.username,
                                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                                    date: Date.now(),
                                                                    requestData: requestSent,
                                                                    responesData: JSON.stringify(data),
                                                                    tokenBody: JSON.stringify(tokeData),
                                                                    Amounts: "",
                                                                    FirstName: "",
                                                                    SecondName: "",
                                                                    ThirdName: "",
                                                                    LastName: "",
                                                                    CustID: "",
                                                                    qRespones: "",
                                                                    pRespones: res_data,
                                                                    Request: JSON.stringify(req),
                                                                    remStatus: ""
                                                                });
                                                            console.log(newData)
                                                            newData.save(async (err, doc) => {
                                                                if (!err) {
                                                                    console.log('record was added');
                                                                    callback(res_data);
                                
                                                                }
                                                                else {
                                                                    console.log("DataBase")
                                                                    console.log(err);
                                                                    var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                                    callback(callbackResponse);
                                                                }
                                
                                                            });
                                                        });
                                                    }
                                                });
                                            } else {
                                                findQResponse(remitNo).then(valueRecevied => {
                                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                    console.log(valueRecevied)
                                                    var res_data = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: valueRecevied.Amounts,
                                                            FirstName: valueRecevied.FirstName,
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: valueRecevied.qRespones,
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: ""
                                                        });
                                                    console.log(newData)
                                
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            newApiRequest.insertData.updateOne({_id:object_id}, {$set:{CustID:"Accepted"}} , async function(err, result) {
                                                                if (!err) {
                                                                    console.log('record was updated');
                                                                    console.log(result);
                                                                    
                        
                                                                }
                                                                else {
                                                                    console.log(err);
                                                                }
                                
                                                            });
                                                            callback(res_data);
                                
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,database_error);
                                                            callback(callbackResponse);
                                                        }
                                
                                                    });
                                                }).catch(valueRecevied => {
                                
                                                    var res_data = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: "",
                                                            FirstName: "",
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: "",
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: ""
                                                        });
                                                    console.log(newData)
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            callback(res_data);
                                
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,database_error);
                                                            callback(callbackResponse);
                                                        }
                                
                                                    });
                                                });
                                            }
                                        } else {
                                            findQResponse(remitNo).then(valueRecevied => {
                                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                console.log(valueRecevied)
                                                var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: valueRecevied.Amounts,
                                                        FirstName: valueRecevied.FirstName,
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: valueRecevied.qRespones,
                                                        pRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                        remStatus: ""
                                                    });
                                                console.log(newData)
                                
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        console.log('record was added');
                                                        newApiRequest.insertData.updateOne({_id:object_id}, {$set:{CustID:"Accepted"}} , async function(err, result) {
                                                            if (!err) {
                                                                console.log('record was updated');
                                                                console.log(result);
                                                                
                            
                                                            }
                                                            else {
                                                                console.log(err);
                                                            }
                            
                                                        });
                                                        callback(res_data);
                                
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                        callback(callbackResponse);
                                                    }
                                
                                                });
                                            }).catch(valueRecevied => {
                                
                                                var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: "",
                                                        pRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                        remStatus: ""
                                                    });
                                                console.log(newData)
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        console.log('record was added');
                                                        callback(res_data);
                                
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                        callback(callbackResponse);
                                                    }
                                
                                                });
                                            });
                                        }
                                    } else {  
                                        findQResponse(remitNo).then(valueRecevied => {
                                            console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                            console.log(valueRecevied)
                                            var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: valueRecevied.Amounts,
                                                    FirstName: valueRecevied.FirstName,
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: valueRecevied.qRespones,
                                                    pRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                    remStatus: ""
                                                });
                                            console.log(newData)
                                
                                            newData.save(async (err, doc) => {
                                                if (!err) {
                                                    console.log('record was added');
                                                    callback(res_data);
                                
                                                }
                                                else {
                                                    console.log("DataBase")
                                                    console.log(err);
                                                    var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                    callback(callbackResponse);
                                                }
                                
                                            });
                                        }).catch(valueRecevied => {
                                
                                            var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                    rem_no: remitNo,
                                                    transaction_id: "",
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSent,
                                                    responesData: JSON.stringify(data),
                                                    tokenBody: JSON.stringify(tokeData),
                                                    Amounts: "",
                                                    FirstName: "",
                                                    SecondName: "",
                                                    ThirdName: "",
                                                    LastName: "",
                                                    CustID: "",
                                                    qRespones: "",
                                                    pRespones: res_data,
                                                    Request: JSON.stringify(req),
                                                    remStatus: ""
                                                });
                                            console.log(newData)
                                            newData.save(async (err, doc) => {
                                                if (!err) {
                                                    console.log('record was added');
                                                    callback(res_data);
                                
                                                }
                                                else {
                                                    console.log("DataBase")
                                                    console.log(err);
                                                    var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                    callback(callbackResponse);
                                                }
                                
                                            });
                                        });
                                    }
                                });
                            } else {
                                var transactions = [];
                                var x = 0 ;  
                                transactions = data.result.transactions.transaction;
                                transactions.every((remit,index)=>{
                                    if(remit.trans_ref==remitNo){
                                        x = 1;
                                        return false;
                                    } else {
                                        x = 0 ;
                                        return true;
                                    }
                                });
                                if(x==1){
                                    console.log("its accpted");
                                    var idNumber = req.rem_info.IDNumber;
                                    var issueDate = req.rem_info.IssueDate;
                                    processTransactionsF(remitNo, token, function (status, data,requestSent){
                                        if(status==200){
                                            if(data.status=="FAIL"){
                                                findQResponse(remitNo).then(valueRecevied => {
                                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                    console.log(valueRecevied)
                                                    var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: valueRecevied.Amounts,
                                                            FirstName: valueRecevied.FirstName,
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: valueRecevied.qRespones,
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: ""
                                                        });
                                                    console.log(newData)
                        
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            callback(res_data);
                        
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                            callback(callbackResponse);
                                                        }
                        
                                                    });
                                                }).catch(valueRecevied => {
                        
                                                    var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: "",
                                                            FirstName: "",
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: "",
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: ""
                                                        });
                                                    console.log(newData)
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            callback(res_data);
                        
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                            callback(callbackResponse);
                                                        }
                        
                                                    });
                                                });
                                            } else {
                                                findQResponse(remitNo).then(valueRecevied => {
                                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                    console.log(valueRecevied)
                                                    var res_data = writePaySuccessXmlFile(data.result.process_result,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: valueRecevied.Amounts,
                                                            FirstName: valueRecevied.FirstName,
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: valueRecevied.qRespones,
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: "1"
                                                        });
                                                    console.log(newData)
                        
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            callback(res_data);
                        
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writePaySuccessXmlFile(data.result.process_result,database_error);
                                                            callback(callbackResponse);
                                                        }
                        
                                                    });
                                                }).catch(valueRecevied => {
                        
                                                    var res_data = writePaySuccessXmlFile(data.result.process_result,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: "",
                                                            FirstName: "",
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: "",
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: "1"
                                                        });
                                                    console.log(newData)
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            callback(res_data);
                        
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writePaySuccessXmlFile(data.result.process_result,database_error);
                                                            callback(callbackResponse);
                                                        }
                        
                                                    });
                                                });
                                            }
                                        } else {
                                            findQResponse(remitNo).then(valueRecevied => {
                                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                console.log(valueRecevied)
                                                var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: valueRecevied.Amounts,
                                                        FirstName: valueRecevied.FirstName,
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: valueRecevied.qRespones,
                                                        pRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                        remStatus: ""
                                                    });
                                                console.log(newData)
                    
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        console.log('record was added');
                                                        callback(res_data);
                    
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                        callback(callbackResponse);
                                                    }
                    
                                                });
                                            }).catch(valueRecevied => {
                    
                                                var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: "",
                                                        pRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                        remStatus: ""
                                                    });
                                                console.log(newData)
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        console.log('record was added');
                                                        callback(res_data);
                    
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                        callback(callbackResponse);
                                                    }
                    
                                                });
                                            });
                                        }
                                    });
                                } else if(x==0){
                                    acceptTransactionsF(remitNo, token, function (status,data,requestSent) {
                                        if(status==200){
                                            if(data.status=="SUCCESS"){
                                                if(data.result.transactions.transaction[0].operation_result=="SUCCESS"){
                                                    var idNumber = req.rem_info.IDNumber;
                                                    var issueDate = req.rem_info.IssueDate;
                                                    processTransactionsF(remitNo, token,function (status, data,requestSent){
                                                        if(status==200){
                                                            if(data.status=="FAIL"){
                                                                findQResponse(remitNo).then(valueRecevied => {
                                                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                                    console.log(valueRecevied)
                                                                    var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                                    let newData = new newApiRequest.insertData(
                                                                        {
                                                                            rem_no: remitNo,
                                                                            transaction_id: "",
                                                                            service_name: req.service_info.service_name,
                                                                            service_type: req.service_info.service_type,
                                                                            system_name: req.service_info.system_name,
                                                                            username: req.service_info.username,
                                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                                            date: Date.now(),
                                                                            requestData: requestSent,
                                                                            responesData: JSON.stringify(data),
                                                                            tokenBody: JSON.stringify(tokeData),
                                                                            Amounts: valueRecevied.Amounts,
                                                                            FirstName: valueRecevied.FirstName,
                                                                            SecondName: "",
                                                                            ThirdName: "",
                                                                            LastName: "",
                                                                            CustID: "",
                                                                            qRespones: valueRecevied.qRespones,
                                                                            pRespones: res_data,
                                                                            Request: JSON.stringify(req),
                                                                            remStatus: ""
                                                                        });
                                                                    console.log(newData)
                                        
                                                                    newData.save(async (err, doc) => {
                                                                        if (!err) {
                                                                            console.log('record was added');
                                                                            callback(res_data);
                                        
                                                                        }
                                                                        else {
                                                                            console.log("DataBase")
                                                                            console.log(err);
                                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                                            callback(callbackResponse);
                                                                        }
                                        
                                                                    });
                                                                }).catch(valueRecevied => {
                                        
                                                                    var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                                    let newData = new newApiRequest.insertData(
                                                                        {
                                                                            rem_no: remitNo,
                                                                            transaction_id: "",
                                                                            service_name: req.service_info.service_name,
                                                                            service_type: req.service_info.service_type,
                                                                            system_name: req.service_info.system_name,
                                                                            username: req.service_info.username,
                                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                                            date: Date.now(),
                                                                            requestData: requestSent,
                                                                            responesData: JSON.stringify(data),
                                                                            tokenBody: JSON.stringify(tokeData),
                                                                            Amounts: "",
                                                                            FirstName: "",
                                                                            SecondName: "",
                                                                            ThirdName: "",
                                                                            LastName: "",
                                                                            CustID: "",
                                                                            qRespones: "",
                                                                            pRespones: res_data,
                                                                            Request: JSON.stringify(req),
                                                                            remStatus: ""
                                                                        });
                                                                    console.log(newData)
                                                                    newData.save(async (err, doc) => {
                                                                        if (!err) {
                                                                            console.log('record was added');
                                                                            callback(res_data);
                                        
                                                                        }
                                                                        else {
                                                                            console.log("DataBase")
                                                                            console.log(err);
                                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                                            callback(callbackResponse);
                                                                        }
                                        
                                                                    });
                                                                });
                                                            } else {
                                                                findQResponse(remitNo).then(valueRecevied => {
                                                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                                    console.log(valueRecevied)
                                                                    var res_data = writePaySuccessXmlFile(data.result.process_result,no_server_error);
                                                                    let newData = new newApiRequest.insertData(
                                                                        {
                                                                            rem_no: remitNo,
                                                                            transaction_id: "",
                                                                            service_name: req.service_info.service_name,
                                                                            service_type: req.service_info.service_type,
                                                                            system_name: req.service_info.system_name,
                                                                            username: req.service_info.username,
                                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                                            date: Date.now(),
                                                                            requestData: requestSent,
                                                                            responesData: JSON.stringify(data),
                                                                            tokenBody: JSON.stringify(tokeData),
                                                                            Amounts: valueRecevied.Amounts,
                                                                            FirstName: valueRecevied.FirstName,
                                                                            SecondName: "",
                                                                            ThirdName: "",
                                                                            LastName: "",
                                                                            CustID: "",
                                                                            qRespones: valueRecevied.qRespones,
                                                                            pRespones: res_data,
                                                                            Request: JSON.stringify(req),
                                                                            remStatus: "1"
                                                                        });
                                                                    console.log(newData)
                                        
                                                                    newData.save(async (err, doc) => {
                                                                        if (!err) {
                                                                            console.log('record was added');
                                                                            callback(res_data);
                                        
                                                                        }
                                                                        else {
                                                                            console.log("DataBase")
                                                                            console.log(err);
                                                                            var callbackResponse = writePaySuccessXmlFile(data.result.process_result,database_error);
                                                                            callback(callbackResponse);
                                                                        }
                                        
                                                                    });
                                                                }).catch(valueRecevied => {
                                        
                                                                    var res_data = writePaySuccessXmlFile(data.result.process_result,no_server_error);
                                                                    let newData = new newApiRequest.insertData(
                                                                        {
                                                                            rem_no: remitNo,
                                                                            transaction_id: "",
                                                                            service_name: req.service_info.service_name,
                                                                            service_type: req.service_info.service_type,
                                                                            system_name: req.service_info.system_name,
                                                                            username: req.service_info.username,
                                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                                            date: Date.now(),
                                                                            requestData: requestSent,
                                                                            responesData: JSON.stringify(data),
                                                                            tokenBody: JSON.stringify(tokeData),
                                                                            Amounts: "",
                                                                            FirstName: "",
                                                                            SecondName: "",
                                                                            ThirdName: "",
                                                                            LastName: "",
                                                                            CustID: "",
                                                                            qRespones: "",
                                                                            pRespones: res_data,
                                                                            Request: JSON.stringify(req),
                                                                            remStatus: "1"
                                                                        });
                                                                    console.log(newData)
                                                                    newData.save(async (err, doc) => {
                                                                        if (!err) {
                                                                            console.log('record was added');
                                                                            callback(res_data);
                                        
                                                                        }
                                                                        else {
                                                                            console.log("DataBase")
                                                                            console.log(err);
                                                                            var callbackResponse = writePaySuccessXmlFile(data.result.process_result,database_error);
                                                                            callback(callbackResponse);
                                                                        }
                                        
                                                                    });
                                                                });
                                                            }
                                                        } else {
                                                            findQResponse(remitNo).then(valueRecevied => {
                                                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                                console.log(valueRecevied)
                                                                var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                                let newData = new newApiRequest.insertData(
                                                                    {
                                                                        rem_no: remitNo,
                                                                        transaction_id: "",
                                                                        service_name: req.service_info.service_name,
                                                                        service_type: req.service_info.service_type,
                                                                        system_name: req.service_info.system_name,
                                                                        username: req.service_info.username,
                                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                                        date: Date.now(),
                                                                        requestData: requestSent,
                                                                        responesData: JSON.stringify(data),
                                                                        tokenBody: JSON.stringify(tokeData),
                                                                        Amounts: valueRecevied.Amounts,
                                                                        FirstName: valueRecevied.FirstName,
                                                                        SecondName: "",
                                                                        ThirdName: "",
                                                                        LastName: "",
                                                                        CustID: "",
                                                                        qRespones: valueRecevied.qRespones,
                                                                        pRespones: res_data,
                                                                        Request: JSON.stringify(req),
                                                                        remStatus: ""
                                                                    });
                                                                console.log(newData)
                                    
                                                                newData.save(async (err, doc) => {
                                                                    if (!err) {
                                                                        console.log('record was added');
                                                                        callback(res_data);
                                    
                                                                    }
                                                                    else {
                                                                        console.log("DataBase")
                                                                        console.log(err);
                                                                        var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                    
                                                                });
                                                            }).catch(valueRecevied => {
                                    
                                                                var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                                let newData = new newApiRequest.insertData(
                                                                    {
                                                                        rem_no: remitNo,
                                                                        transaction_id: "",
                                                                        service_name: req.service_info.service_name,
                                                                        service_type: req.service_info.service_type,
                                                                        system_name: req.service_info.system_name,
                                                                        username: req.service_info.username,
                                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                                        date: Date.now(),
                                                                        requestData: requestSent,
                                                                        responesData: JSON.stringify(data),
                                                                        tokenBody: JSON.stringify(tokeData),
                                                                        Amounts: "",
                                                                        FirstName: "",
                                                                        SecondName: "",
                                                                        ThirdName: "",
                                                                        LastName: "",
                                                                        CustID: "",
                                                                        qRespones: "",
                                                                        pRespones: res_data,
                                                                        Request: JSON.stringify(req),
                                                                        remStatus: ""
                                                                    });
                                                                console.log(newData)
                                                                newData.save(async (err, doc) => {
                                                                    if (!err) {
                                                                        console.log('record was added');
                                                                        callback(res_data);
                                    
                                                                    }
                                                                    else {
                                                                        console.log("DataBase")
                                                                        console.log(err);
                                                                        var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                    
                                                                });
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    findQResponse(remitNo).then(valueRecevied => {
                                                        console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                        console.log(valueRecevied)
                                                        var res_data = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,no_server_error);
                                                        let newData = new newApiRequest.insertData(
                                                            {
                                                                rem_no: remitNo,
                                                                transaction_id: "",
                                                                service_name: req.service_info.service_name,
                                                                service_type: req.service_info.service_type,
                                                                system_name: req.service_info.system_name,
                                                                username: req.service_info.username,
                                                                agent_code: req.service_info.agent_or_Branch_Code,
                                                                agent_name: req.service_info.agent_or_Branch_name,
                                                                date: Date.now(),
                                                                requestData: requestSent,
                                                                responesData: JSON.stringify(data),
                                                                tokenBody: JSON.stringify(tokeData),
                                                                Amounts: valueRecevied.Amounts,
                                                                FirstName: valueRecevied.FirstName,
                                                                SecondName: "",
                                                                ThirdName: "",
                                                                LastName: "",
                                                                CustID: "",
                                                                qRespones: valueRecevied.qRespones,
                                                                pRespones: res_data,
                                                                Request: JSON.stringify(req),
                                                                remStatus: ""
                                                            });
                                                        console.log(newData)
                                    
                                                        newData.save(async (err, doc) => {
                                                            if (!err) {
                                                                console.log('record was added');
                                                                newApiRequest.insertData.updateOne({_id:object_id}, {$set:{CustID:"Accepted"}} , async function(err, result) {
                                                                    if (!err) {
                                                                        console.log('record was updated');
                                                                        console.log(result);
                                                                        
                            
                                                                    }
                                                                    else {
                                                                        console.log(err);
                                                                    }
                                    
                                                                });
                                                                callback(res_data);
                                    
                                                            }
                                                            else {
                                                                console.log("DataBase")
                                                                console.log(err);
                                                                var callbackResponse = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,database_error);
                                                                callback(callbackResponse);
                                                            }
                                    
                                                        });
                                                    }).catch(valueRecevied => {
                                    
                                                        var res_data = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,no_server_error);
                                                        let newData = new newApiRequest.insertData(
                                                            {
                                                                rem_no: remitNo,
                                                                transaction_id: "",
                                                                service_name: req.service_info.service_name,
                                                                service_type: req.service_info.service_type,
                                                                system_name: req.service_info.system_name,
                                                                username: req.service_info.username,
                                                                agent_code: req.service_info.agent_or_Branch_Code,
                                                                agent_name: req.service_info.agent_or_Branch_name,
                                                                date: Date.now(),
                                                                requestData: requestSent,
                                                                responesData: JSON.stringify(data),
                                                                tokenBody: JSON.stringify(tokeData),
                                                                Amounts: "",
                                                                FirstName: "",
                                                                SecondName: "",
                                                                ThirdName: "",
                                                                LastName: "",
                                                                CustID: "",
                                                                qRespones: "",
                                                                pRespones: res_data,
                                                                Request: JSON.stringify(req),
                                                                remStatus: ""
                                                            });
                                                        console.log(newData)
                                                        newData.save(async (err, doc) => {
                                                            if (!err) {
                                                                console.log('record was added');
                                                                callback(res_data);
                                    
                                                            }
                                                            else {
                                                                console.log("DataBase")
                                                                console.log(err);
                                                                var callbackResponse = writeGeneralErrorXmlFile(data.result.transactions.transaction[0].message,database_error);
                                                                callback(callbackResponse);
                                                            }
                                    
                                                        });
                                                    });
                                                }
                                            } else {
                                                findQResponse(remitNo).then(valueRecevied => {
                                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                    console.log(valueRecevied)
                                                    var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: valueRecevied.Amounts,
                                                            FirstName: valueRecevied.FirstName,
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: valueRecevied.qRespones,
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: ""
                                                        });
                                                    console.log(newData)
                                    
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            newApiRequest.insertData.updateOne({_id:object_id}, {$set:{CustID:"Accepted"}} , async function(err, result) {
                                                                if (!err) {
                                                                    console.log('record was updated');
                                                                    console.log(result);
                                                                    
                                
                                                                }
                                                                else {
                                                                    console.log(err);
                                                                }
                                
                                                            });
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                                }).catch(valueRecevied => {
                                    
                                                    var res_data = writeGeneralErrorXmlFile(data.message,no_server_error);
                                                    let newData = new newApiRequest.insertData(
                                                        {
                                                            rem_no: remitNo,
                                                            transaction_id: "",
                                                            service_name: req.service_info.service_name,
                                                            service_type: req.service_info.service_type,
                                                            system_name: req.service_info.system_name,
                                                            username: req.service_info.username,
                                                            agent_code: req.service_info.agent_or_Branch_Code,
                                                            agent_name: req.service_info.agent_or_Branch_name,
                                                            date: Date.now(),
                                                            requestData: requestSent,
                                                            responesData: JSON.stringify(data),
                                                            tokenBody: JSON.stringify(tokeData),
                                                            Amounts: "",
                                                            FirstName: "",
                                                            SecondName: "",
                                                            ThirdName: "",
                                                            LastName: "",
                                                            CustID: "",
                                                            qRespones: "",
                                                            pRespones: res_data,
                                                            Request: JSON.stringify(req),
                                                            remStatus: ""
                                                        });
                                                    console.log(newData)
                                                    newData.save(async (err, doc) => {
                                                        if (!err) {
                                                            console.log('record was added');
                                                            callback(res_data);
                                    
                                                        }
                                                        else {
                                                            console.log("DataBase")
                                                            console.log(err);
                                                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                                            callback(callbackResponse);
                                                        }
                                    
                                                    });
                                                });
                                            }
                                        } else {  
                                            findQResponse(remitNo).then(valueRecevied => {
                                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                                console.log(valueRecevied)
                                                var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: valueRecevied.Amounts,
                                                        FirstName: valueRecevied.FirstName,
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: valueRecevied.qRespones,
                                                        pRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                        remStatus: ""
                                                    });
                                                console.log(newData)
                                    
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        console.log('record was added');
                                                        callback(res_data);
                                    
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                        callback(callbackResponse);
                                                    }
                                    
                                                });
                                            }).catch(valueRecevied => {
                                    
                                                var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: remitNo,
                                                        transaction_id: "",
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: requestSent,
                                                        responesData: JSON.stringify(data),
                                                        tokenBody: JSON.stringify(tokeData),
                                                        Amounts: "",
                                                        FirstName: "",
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: "",
                                                        qRespones: "",
                                                        pRespones: res_data,
                                                        Request: JSON.stringify(req),
                                                        remStatus: ""
                                                    });
                                                console.log(newData)
                                                newData.save(async (err, doc) => {
                                                    if (!err) {
                                                        console.log('record was added');
                                                        callback(res_data);
                                    
                                                    }
                                                    else {
                                                        console.log("DataBase")
                                                        console.log(err);
                                                        var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                                        callback(callbackResponse);
                                                    }
                                    
                                                });
                                            });
                                        }
                                    });
                                }
                            }
                        }

                    } else {
                        var res_data = writeGeneralErrorXmlFile(data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: remitNo,
                                transaction_id: "",
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: requestSents,
                                responesData: JSON.stringify(data),
                                tokenBody: JSON.stringify(tokeData),
                                Amounts: "",
                                FirstName: "",
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: res_data,
                                Request: JSON.stringify(req),
                            });
                            console.log(newData);
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    object_id = doc['_id'];
                                    console.log('record was added');
                                    callback(res_data);
                
                                }
                                else {
                                    console.log("DataBase")
                                    console.log(err);
                                    var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                    callback(callbackResponse);
                                }
                
                            });
                    }
                });
            } else {
                var remitNo = req.rem_info.rem_no;
                var res_data = writeTokenErrorXmlFile(no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: remitNo,
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: requestSent,
                        responesData: JSON.stringify(tokeData),
                        tokenBody: JSON.stringify(tokeData),
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: "",
                        pRespones: res_data,
                        Request: JSON.stringify(req),
                    });
                console.log(newData);
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        callback(res_data);

                    }
                    else {
                        console.log("DataBase")
                        console.log(err);
                        var callbackResponse = writeTokenErrorXmlFile(database_error);
                        callback(callbackResponse);
                    }

                });
            }
        });
   
    }


    }


module.exports.Alawneh_server=Alawneh_server;

function getToken(callback) {

    var data = {
        'userName': username,
        'password': password,
        'grant_type': 'client_credentials',
        'pin':pin,
        'client_id':clientid,
        'client_secret':clientSecret
    };
    
    var formBody = [];
    for (var property in data) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    request.post(
        {
            headers: alawanehTokenHeader,
            url: tokenURL,
            body: formBody,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, formBody);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, formBody);
                }

            } else {
                return callback(1,err.message, formBody);
            }

        }
    );

}

function getTransactionDetailsF(trans_ref, token, callback) {

    const getTransactionDetailsHeader = {
        "Authorization": "Bearer " + token,
        "content-type":content_type
    };

    var getTransactionDetailsBody = {
        "body": {
            "trans_ref": trans_ref,
            "is_agent_trans_ref": false
        },
        "account": accountObject
    };

    var getTransactionDetailsBodyProcessed = prepareBody(getTransactionDetailsBody);

    request.post(
        {
            headers: getTransactionDetailsHeader,
            url: "http://100.0.0.108:3150/alawneh/query",
            body: getTransactionDetailsBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, getTransactionDetailsBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, getTransactionDetailsBodyProcessed);
                }
            } else {
                return callback(1,err.message, getTransactionDetailsBodyProcessed);
            }


        }
    );

}

function getPendingAcceptedTransactionsF(token, callback) {

    const getPendingAcceptedTransactionsHeader = {
        "Authorization": "Bearer " + token,
        "content-type":content_type
    };

    var getPendingAcceptedTransactionsBody = {
        "account": accountObject
    };

    var getPendingAcceptedTransactionsBodyProcessed = prepareBody(getPendingAcceptedTransactionsBody);

    request.post(
        {
            headers: getPendingAcceptedTransactionsHeader,
            url: baseURL + getPendingAcceptedTransactions,
            body: getPendingAcceptedTransactionsBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, getPendingAcceptedTransactionsBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, getPendingAcceptedTransactionsBodyProcessed);
                }
            } else {
                return callback(1,err.message, getPendingAcceptedTransactionsBodyProcessed);
            }


        }
    );

}


function acceptTransactionsF(trans_ref, token, callback) {

    const acceptTransactionsHeader = {
        "Authorization": "Bearer " + token,
        "content-type":content_type
    };

    var acceptTransactionsBody = {
        "body": {
            "trans_ref": trans_ref,
        },
        "account": accountObject
    };

    var acceptTransactionsBodyProcessed = prepareBody(acceptTransactionsBody);

    request.post(
        {
            headers: acceptTransactionsHeader,
            url:"http://100.0.0.108:3150/alawneh/check",
            body: acceptTransactionsBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, acceptTransactionsBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, errorResponse, acceptTransactionsBodyProcessed);
                }
            } else {
                return callback(1,err.message, acceptTransactionsBodyProcessed);
            }


        }
    );

}



function processTransactionsF(trans_ref, token, callback) {

    const processTransactionsHeader = {
        "Authorization": "Bearer " + token,
        "content-type":content_type
    };

    var processTransactionsBody = {
        "body": {
            "trans_ref": trans_ref,
            "pay_method": "cash",
            "bank_credit_date": {},
            "bank_clear_date":"2021-03-07T00:00:00.000Z",
            "po_clear_date": "",
            "benef_id_type": "NATIONAL_ID",
            "benef_id_details": "123",
            "issue_date": "2018-04-03T00:00:00.000Z",
            "bank_ref": "bank-internal-ref-number",
            "bank_comments": "some comment",
            "payout_comments": "some comment",
            "sms_benef_payout": true,
            "sms_benef_payout_mobile": "labore"
        },
        "account": accountObject
    };

    var processTransactionsBodyProcessed = prepareBody(processTransactionsBody);

    request.post(
        {
            headers: processTransactionsHeader,
            url: "http://100.0.0.108:3150/alawneh/pay",
            body: processTransactionsBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, processTransactionsBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, errorResponse, processTransactionsBodyProcessed);
                }
            } else {
                return callback(1,err.message, processTransactionsBodyProcessed);
            }


        }
    );

}


function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}

async function findQResponse(number) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: number }, (err, apiData) => {
        try {
            if (apiData[apiData.length - 1].qRespones === undefined) {
                Qrespons = '';
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : undefined");
                reject(entireRow);
            }
            else {
                Qrespons = apiData[apiData.length - 1].qRespones;
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : " + Qrespons);
                resolve(entireRow);
            }

        } catch (error) {
            Qrespons = '';
            entireRow = apiData[apiData.length - 1];
            console.log("Qresponse is : blank");
            reject(entireRow);

        }


        console.log('55555555555555555555555555555555555555');
        console.log(entireRow)


    });
});
    
}

function writeCashOutQXmlFile(responesData, ServerData) {
    var remit_no = responesData.result.transaction.trans_ref;
    var city = responesData.result.transaction.benef_city;
    var remittanceAmount = responesData.result.transaction.receive_amount;
    var remittanceCurrency = responesData.result.transaction.receive_currency;
    var status = responesData.result.transaction.status;
    var TheTarget = responesData.result.transaction.collection_point_bank;
    var TheDate = responesData.result.transaction.creation_date;
    var SenderName = responesData.result.transaction.remitter_name;
    var SenderPhone = responesData.result.transaction.remitter_mobile;
    var SenderAddress = responesData.result.transaction.remitter_address;
    var SenderNationality = responesData.result.transaction.remitter_nationality;
    var SenderGender = responesData.result.transaction.remitter_gender;
    var ReceiverName = responesData.result.transaction.benef_name;
    var ReceiverPhone = responesData.result.transaction.benef_mobile;
    var RemittancePurpose = responesData.result.transaction.purpose;
    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:Q_ReciveRem>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>1</code_API>
         <msg_API>${responesData.status}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${remit_no=== undefined ? '' :remit_no}</rem_no>
        <trans_key></trans_key>
        <region_id></region_id>
        <to_city>${city=== undefined ? '' :city}</to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${remittanceAmount === undefined ? '' :remittanceAmount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${remittanceCurrency === undefined ? '' :remittanceCurrency}</payout_cuyc>
        <payout_com></payout_com>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc></payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount></payout_settlement_amount>
        <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
        <rem_status>${status === undefined ? '' :status}</rem_status>
        <rem_type></rem_type>
        <sending_coyc></sending_coyc>
        <destenation_coyc>${TheTarget === undefined ? '' : TheTarget}</destenation_coyc>
        <user_note></user_note>
        <the_date>${TheDate === undefined ? '' : TheDate}</the_date>
     </rem_info>
     <sender_info>
        <sender_trns_id></sender_trns_id>
        <f_name></f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name> </l_name>
        <full_name>${SenderName === undefined ? '' : SenderName}</full_name>
        <telephone></telephone>
        <mobile>${SenderPhone === undefined ? '' : SenderPhone }</mobile>
        <address>${SenderAddress=== undefined ? '' : SenderAddress}</address>
        <address1></address1>
        <nationality_coyc>${SenderNationality=== undefined ? '' : SenderNationality}</nationality_coyc>
        <bd_or_ed></bd_or_ed>
        <gender>${SenderGender=== undefined ? '' : SenderGender}</gender>
        <identity_type></identity_type>
        <identity_no></identity_no>
        <identity_issues></identity_issues>
        <identity_exp></identity_exp>
        <note></note>
    </sender_info>
    <reciver_info>
        <reciver_trns_id></reciver_trns_id>
        <f_name></f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name></l_name>
        <full_name>${ReceiverName  === undefined ? '' : ReceiverName}</full_name>
        <telephone></telephone>
        <mobile>${ReceiverPhone === undefined ? '' : ReceiverPhone}</mobile>
        <address></address>
        <nationality_coyc></nationality_coyc>
        <gender></gender>
        <identity_type></identity_type>
        <identity_no></identity_no>
        <identity_issues></identity_issues>
        <identity_exp></identity_exp>
        <note></note>
   </reciver_info>
   <bank_info>
        <exchanger_account_amount></exchanger_account_amount>
        <exchanger_account_currency_name></exchanger_account_currency_name>
        <user_id></user_id>
        <branch_code></branch_code>
        <recive_bank_code></recive_bank_code>
  </bank_info>
  <others>
        <sending_reason>${RemittancePurpose === undefined ? '' : RemittancePurpose}</sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`;

}


function writeTokenErrorXmlFile(ServerData) {

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:Q_ReciveRem>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>Fail</code_API>
         <msg_API>حدث خطأ بالإتصال يرجى إعادة المحاولة لاحقا</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}

function writeGeneralErrorXmlFile(error,ServerData) {

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:Q_ReciveRem>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>Fail</code_API>
         <msg_API>${error}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}

function writeStatusErrorXmlFile(status,error,ServerData) {

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:Q_ReciveRem>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>${status}</code_API>
         <msg_API>${error}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}

function writePaySuccessXmlFile(msg,ServerData) {

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:Q_ReciveRem>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>1</code_API>
         <msg_API>${msg}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}

