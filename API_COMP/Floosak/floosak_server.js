const request = require("request");
const baseURL = "https://cmc.qchosts.com";
const phone = "967773949213";
const password = "421957";
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var token='';
const { json } = require("body-parser");

var errorMsg = {
    "2":"The otp field is required.",
    "3":"The selected otp is invalid.",
    "4":"الحساب غير موجود",
    "6":"There was an error please call the support ! ",
    "7":"The selected target phone is invalid.",
    "8":"The amount field is required.",
    "9":"ليس لديك رصيد كافي"
}

function floosak_server(req, callback){


    findLastToken(req.service_info.service_name).then(value=>{
        console.log("token found in DB");
        if ((req.service_info.service_type).toUpperCase() == "CASHIN_Q"){
            var mobileNumber = req.process_info.customerMobile;
            var idReqOfOperation = req.process_info.transNo;
            var amount = req.process_info.amount;
            var requesterRegion = req.rem_info.region;
            
            preCashIn(value.tokenBody,value.transaction_id,mobileNumber,idReqOfOperation,amount, function(status,data,bodySent){
                if (status==200){
                    if((requesterRegion==1 && data.data.group_id=="Sana`a") || (requesterRegion !=1 && data.data.group_id !="Sana`a"))
                        {
                            var name = data.data.name;
                            var res_data = writeCashInQXmlFile(data.data,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  mobile_no: req.process_info.customerMobile,
                                  transaction_id:data.data.id,
                                  service_name: req.service_info.service_name,
                                  service_type: req.service_info.service_type,
                                  system_name: req.service_info.system_name,
                                  username: req.service_info.username,
                                  agent_code: req.service_info.agent_or_Branch_Code,
                                  agent_name: req.service_info.agent_or_Branch_name,
                                  date: Date.now(),
                                  requestData: bodySent,
                                  responesData: JSON.stringify(data),
                                  Amounts: req.process_info.amount,
                                  FirstName: name,
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
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        
                                        var callbackResponse = writeCashInQXmlFile(data.data,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        } else {
                            var name = data.data.name;
                            var res_data = reigonError(no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  mobile_no: req.process_info.customerMobile,
                                  transaction_id:data.data.id,
                                  service_name: req.service_info.service_name,
                                  service_type: req.service_info.service_type,
                                  system_name: req.service_info.system_name,
                                  username: req.service_info.username,
                                  agent_code: req.service_info.agent_or_Branch_Code,
                                  agent_name: req.service_info.agent_or_Branch_name,
                                  date: Date.now(),
                                  requestData: bodySent,
                                  responesData: JSON.stringify(data),
                                  Amounts: req.process_info.amount,
                                  FirstName: name,
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
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = reigonError(database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        }
                }else if (status==422) {
                    if(data.message.startsWith('You are not Authenticated')){
                        console.log("you are not authintacted")
                        console.log("---------------------------------------------------------------")
                        getToken(function (status,tokenData, requestSents){
                            if(status==200){
                             token = tokenData.data.token;
                             var walletID = getWalletID(tokenData);
                             let newData = new newApiRequest.insertData(
                                {
                                    rem_no: 'last token',
                                    transaction_id: walletID,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: requestSents,
                                    responesData: JSON.stringify(tokenData),
                                    tokenBody:token,
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        floosak_server(req,function(callbackResult){
                                            callback(callbackResult);
                                        });
                
                                    }
                                    else {
                                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                        callback(res_data);
                                    }
                
                                });
                            } else {
                                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: "no token",
                                        transaction_id: "",
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: "",
                                        responesData: tokenData,
                                        tokenBody: "",
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
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);;
                                        callback(callbackResponse);
                                    }
                
                                });
                            }
                        });
                    } else {
                        var res_data =writeGeneralErrorXmlFile(proccessingErrors(data.errors),no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                            rem_no: req.rem_info.rem_no,
                            mobile_no: req.process_info.customerMobile,
                            transaction_id: req.process_info.transNo,
                            service_name: req.service_info.service_name,
                            service_type: req.service_info.service_type,
                            system_name: req.service_info.system_name,
                            username: req.service_info.username,
                            agent_code: req.service_info.agent_or_Branch_Code,
                            agent_name: req.service_info.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: bodySent,
                            responesData: JSON.stringify(data),
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
                                console.log('record was added');
                                callback(res_data);
        
                            }
                            else {
                                console.log("DataBase")
                                console.log(err);
                                var callbackResponse = writeGeneralErrorXmlFile(JSON.stringify(data),database_error);
                                callback(callbackResponse);
                            }
        
                        });
                    }
                } else {
                    var res_data =writeGeneralErrorXmlFile(data,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                        rem_no: req.rem_info.rem_no,
                        mobile_no: req.process_info.customerMobile,
                        transaction_id: req.process_info.transNo,
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: bodySent,
                        responesData: JSON.stringify(data),
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: res_data,
                        Request: JSON.stringify(request),
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
                            var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });
        } else if ((req.service_info.service_type).toUpperCase() == "CASHIN_P"){            
            var mobileNumber = req.process_info.customerMobile;
            var amount = req.process_info.amount;
           
            findQResponse(mobileNumber,req.service_info.service_name,"CASHIN_Q").then(row=>{
                cashIn(value.tokenBody,row.transaction_id,function(status,data,bodySent){
                    if (status==200){
                        var trans_id = data.data.id;
                        var res_data = writeCashInPXmlFile(data.data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              mobile_no: req.process_info.customerMobile,
                              transaction_id: trans_id,
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: bodySent,
                              responesData: JSON.stringify(data),
                              Amounts: row.Amounts,
                              FirstName: row.FirstName,
                              SecondName: "",
                              ThirdName: "",
                              LastName: "",
                              CustID: "",
                              qRespones: row.qRespones,
                              pRespones:res_data,
                              Request: JSON.stringify(req),
                              remStatus:"1"
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
                                    var callbackResponse = writeCashOutQXmlFile(data.data,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    } else if (status==422) {
                        if(data.message.startsWith('You are not Authenticated')){
                            getToken(function (status,tokenData, requestSents){
                                if(status==200){
                                 token = tokenData.data.token;
                                 var walletID = getWalletID(tokenData);
                                 let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: 'last token',
                                        transaction_id: walletID,
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: requestSents,
                                        responesData: JSON.stringify(tokenData),
                                        tokenBody:token,
                                        Amounts: "",
                                        FirstName: "",
                                        SecondName: "",
                                        ThirdName: "",
                                        LastName: "",
                                        CustID: "",
                                    });
                                    console.log(newData);
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            console.log('record was added');
                                            floosak_server(req,function(callbackResult){
                                                callback(callbackResult);
                                            });
                    
                                        }
                                        else {
                                            var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                            callback(res_data);
                                        }
                    
                                    });
                                } else {
                                    var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: "no token",
                                            transaction_id: "",
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: "",
                                            responesData: tokenData,
                                            tokenBody: "",
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
                                            console.log('record was added');
                                            callback(res_data);
                    
                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);;
                                            callback(callbackResponse);
                                        }
                    
                                    });
                                }
                            });
                        } else {
                            var res_data =writeGeneralErrorXmlFile(proccessingErrors(data.errors),no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: req.rem_info.rem_no,
                                    mobile_no: req.process_info.customerMobile,
                                    transaction_id: trans_id,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: bodySent,
                                    responesData: JSON.stringify(data),
                                    Amounts: row.Amounts,
                                    FirstName: row.FirstName,
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: row.qRespones,
                                    pRespones:res_data,
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
                                    var callbackResponse = writeGeneralErrorXmlFile(JSON.stringify(data),database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                        }

                    } else {
                        var res_data =writeGeneralErrorXmlFile(data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: req.rem_info.rem_no,
                                mobile_no: req.process_info.customerMobile,
                                transaction_id: trans_id,
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodySent,
                                responesData: JSON.stringify(data),
                                Amounts: row.Amounts,
                                FirstName: row.FirstName,
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: row.qRespones,
                                pRespones:res_data,
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
                                var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                                callback(callbackResponse);
                            }
        
                        });
                    }
                });
            }).catch(value=>{
                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: req.rem_info.rem_no,
                        mobile_no: req.process_info.customerMobile,
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: "",
                        responesData: "",
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: "",
                        pRespones:res_data,
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
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);
                        callback(callbackResponse);
                    }

                });
            });

        } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_Q"){
            
            var mobileNumber = req.process_info.customerMobile;
            var otp = req.process_info.otp;
            var amount= req.process_info.amount;
            var requesterRegion = req.rem_info.region;
            preCashOut(value.tokenBody,value.transaction_id,mobileNumber,otp,function(status,data,bodySent){
                if (status==200){
                    if((requesterRegion==1 && data.data.group_id=="صنعاء") || (requesterRegion !=1 && data.data.group_id !="صنعاء")){
                           
                        if(isAmountEqual(amount,data.data.net)){
                            var name = data.data.name;
                            var res_data = writeCashOutQXmlFile(data.data,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  mobile_no: req.process_info.customerMobile,
                                  transaction_id:data.data.id,
                                  service_name: req.service_info.service_name,
                                  service_type: req.service_info.service_type,
                                  system_name: req.service_info.system_name,
                                  username: req.service_info.username,
                                  agent_code: req.service_info.agent_or_Branch_Code,
                                  agent_name: req.service_info.agent_or_Branch_name,
                                  date: Date.now(),
                                  requestData: bodySent,
                                  responesData: JSON.stringify(data),
                                  Amounts: req.process_info.amount,
                                  FirstName: name,
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
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeCashOutQXmlFile(data.data,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        } else{
                            var responseAmountError = writeGeneralErrorXmlFile("المبلغ المدخل لا يساوي مبلغ العملية الفعلي",no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  mobile_no: req.process_info.customerMobile,
                                  transaction_id:data.data.id,
                                  service_name: req.service_info.service_name,
                                  service_type: req.service_info.service_type,
                                  system_name: req.service_info.system_name,
                                  username: req.service_info.username,
                                  agent_code: req.service_info.agent_or_Branch_Code,
                                  agent_name: req.service_info.agent_or_Branch_name,
                                  date: Date.now(),
                                  requestData: bodySent,
                                  responesData: JSON.stringify(data),
                                  Amounts: req.process_info.amount,
                                  FirstName: data.data.name,
                                  SecondName: "",
                                  ThirdName: "",
                                  LastName: "",
                                  CustID: "",
                                  qRespones: responseAmountError,
                                  Request: JSON.stringify(req),
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        callback(responseAmountError);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile("المبلغ المدخل لا يساوي مبلغ العملية الفعلي",database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        }
                    } else {
                        var name = data.data.name;
                        var res_data = reigonError(no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              mobile_no: req.process_info.customerMobile,
                              transaction_id:data.data.id,
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: bodySent,
                              responesData: JSON.stringify(data),
                              Amounts: req.process_info.amount,
                              FirstName: name,
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
                                    console.log('record was added');
                                    callback(res_data);
            
                                }
                                else {
                                    console.log("DataBase")
                                    console.log(err);
                                    callback(callbackResponse);
                                }
            
                            });
                    }

                }else if (status==422) {
                    if(data.message.startsWith('You are not Authenticated')){
                        getToken(function (status,tokenData, requestSents){
                            if(status==200){
                             token = tokenData.data.token;
                             var walletID = getWalletID(tokenData);
                             let newData = new newApiRequest.insertData(
                                {
                                    rem_no: 'last token',
                                    transaction_id: walletID,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: requestSents,
                                    responesData: JSON.stringify(tokenData),
                                    tokenBody:token,
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        floosak_server(req,function(callbackResult){
                                            callback(callbackResult);
                                        });
                
                                    }
                                    else {
                                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                        callback(res_data);
                                    }
                
                                });
                            } else {
                                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: "no token",
                                        transaction_id: "",
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: "",
                                        responesData: tokenData,
                                        tokenBody: "",
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
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                            }
                        });
                    } else {
                        var res_data =writeGeneralErrorXmlFile(proccessingErrors(data.errors),no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                            rem_no: req.rem_info.rem_no,
                            mobile_no: req.process_info.customerMobile,
                            transaction_id: req.process_info.transNo,
                            service_name: req.service_info.service_name,
                            service_type: req.service_info.service_type,
                            system_name: req.service_info.system_name,
                            username: req.service_info.username,
                            agent_code: req.service_info.agent_or_Branch_Code,
                            agent_name: req.service_info.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: bodySent,
                            responesData: JSON.stringify(data),
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
                                console.log('record was added');
                                callback(res_data);
        
                            }
                            else {
                                console.log("DataBase")
                                console.log(err);
                                var callbackResponse = writeGeneralErrorXmlFile(JSON.stringify(data),database_error);
                                callback(callbackResponse);
                            }
        
                        });
                    }

                } else {
                    var res_data =writeGeneralErrorXmlFile(data,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                        rem_no: req.rem_info.rem_no,
                        mobile_no: req.process_info.customerMobile,
                        transaction_id: req.process_info.transNo,
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: bodySent,
                        responesData: JSON.stringify(data),
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: res_data,
                        Request: JSON.stringify(request),
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
                            var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });
        } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_P") {

            var mobileNumber = req.process_info.customerMobile;
            var otp = req.process_info.otp;
            var idReqOfOperation = req.process_info.transNo;
            var amount = req.process_info.amount;

            findQResponse(mobileNumber,req.service_info.service_name,"CASHOUT_Q").then(row=>{
                  
            cashOut(value.tokenBody,value.transaction_id,row.transaction_id,mobileNumber,otp,idReqOfOperation,amount,function(status,data,bodySent){
                
                if (status==200){
                    
                        var trans_id = data.data.id;
                        var res_data = writeCashOutPXmlFile(data.data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: req.rem_info.rem_no,
                                mobile_no: req.process_info.customerMobile,
                                transaction_id: trans_id,
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodySent,
                                responesData: JSON.stringify(data),
                                Amounts: row.Amounts,
                                FirstName: row.FirstName,
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: row.qRespones,
                                pRespones:res_data,
                                Request: JSON.stringify(req),
                                remStatus:"1"
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
                                    var callbackResponse = writeCashOutPXmlFile(data.data,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    

                } else if (status==422) {
                    if(data.message.startsWith('You are not Authenticated')){
                        getToken(function (status,tokenData, requestSents){
                            if(status==200){
                             token = tokenData.data.token;
                             var walletID = getWalletID(tokenData);
                             let newData = new newApiRequest.insertData(
                                {
                                    rem_no: 'last token',
                                    transaction_id: walletID,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: requestSents,
                                    responesData: JSON.stringify(tokenData),
                                    tokenBody:token,
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        floosak_server(req,function(callbackResult){
                                            callback(callbackResult);
                                        });
                
                                    }
                                    else {
                                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                        callback(res_data);
                                    }
                
                                });
                            } else {
                                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: "no token",
                                        transaction_id: "",
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: "",
                                        responesData: tokenData,
                                        tokenBody: "",
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
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);;
                                        callback(callbackResponse);
                                    }
                
                                });
                            }
                        });
                    }  else {
                        var res_data =writeGeneralErrorXmlFile(proccessingErrors(data.errors),no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: req.rem_info.rem_no,
                                mobile_no: req.process_info.customerMobile,
                                transaction_id: trans_id,
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodySent,
                                responesData: JSON.stringify(data),
                                Amounts: row.Amounts,
                                FirstName: row.FirstName,
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: row.qRespones,
                                pRespones:res_data,
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
                                var callbackResponse = writeGeneralErrorXmlFile(JSON.stringify(data),database_error);
                                callback(callbackResponse);
                            }
        
                        });
                    }
          
                } else {
                    var res_data =writeGeneralErrorXmlFile(data,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: req.rem_info.rem_no,
                            mobile_no: req.process_info.customerMobile,
                            transaction_id: trans_id,
                            service_name: req.service_info.service_name,
                            service_type: req.service_info.service_type,
                            system_name: req.service_info.system_name,
                            username: req.service_info.username,
                            agent_code: req.service_info.agent_or_Branch_Code,
                            agent_name: req.service_info.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: bodySent,
                            responesData: JSON.stringify(data),
                            Amounts: row.Amounts,
                            FirstName: row.FirstName,
                            SecondName: "",
                            ThirdName: "",
                            LastName: "",
                            CustID: "",
                            qRespones: row.qRespones,
                            pRespones:res_data,
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
                            var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });
            }).catch(value=>{
                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: req.rem_info.rem_no,
                        mobile_no: req.process_info.customerMobile,
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: "",
                        responesData: "",
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: "",
                        pRespones:res_data,
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
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);
                        callback(callbackResponse);
                    }

                });
            })

        }
    }).catch(value=>{
        console.log("token not found in DB");
        getToken(function (status,tokenData, requestSents){
            if(status==200){
             token = tokenData.data.token;
             var walletID = getWalletID(tokenData);
             console.log("wallet ID is************************ ::"+walletID)
             let newData = new newApiRequest.insertData(
                {
                    rem_no: 'last token',
                    transaction_id: walletID,
                    service_name: req.service_info.service_name,
                    service_type: req.service_info.service_type,
                    system_name: req.service_info.system_name,
                    username: req.service_info.username,
                    agent_code: req.service_info.agent_or_Branch_Code,
                    agent_name: req.service_info.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: requestSents,
                    responesData: JSON.stringify(tokenData),
                    tokenBody:token,
                    Amounts: "",
                    FirstName: "",
                    SecondName: "",
                    ThirdName: "",
                    LastName: "",
                    CustID: "",
                });
                console.log(newData);
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        floosak_server(req,function(callbackResult){
                            callback(callbackResult);
                        });

                    }
                    else {
                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                        callback(res_data);
                    }

                });
            } else {
                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);

                let newData = new newApiRequest.insertData(
                    {
                        rem_no: "no token",
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: requestSents,
                        responesData: JSON.stringify(tokenData),
                        tokenBody: "",
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
                        console.log('record was added');
                        callback(res_data);

                    }
                    else {
                        console.log("DataBase")
                        console.log(err);
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);
                        callback(callbackResponse);
                    }

                });
            }
        });
    });

}

module.exports.floosak_server=floosak_server;




function getToken(callback){

    const getTokenHeader = {
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel":"agent"
    };

    var getTokenBody = {
        "phone":phone,
        "password":password,
        };

    var getTokenBodyBodyProcessed = prepareBody(getTokenBody);

    request.post(
        {
            headers: getTokenHeader,
            url: "http://172.16.151.33:3150/floosak-w/login",
            body: getTokenBodyBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, getTokenBodyBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, getTokenBodyBodyProcessed);
                }
            } else {
                return callback(1,err.message, getTokenBodyBodyProcessed);
            }


        }
    );
}


function preCashIn(token,wallet_id,mobile_no,request_id,amount,callback){

    const preCashInHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel": "agent"
    };
    var preCashInBody = {
        'source_wallet_id': wallet_id,
        'request_id': request_id,
        'target_phone': '967'+mobile_no,
        'amount':amount,
        'purpose':"for test",
    };
    
    var preCashInBodyProcessed = prepareBody(preCashInBody);
  
    request.post(
        {
            headers: preCashInHeader,
            url: "http://172.16.151.33:3150/floosak-w/cashIn",
            body: preCashInBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, preCashInBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, preCashInBodyProcessed);
                }

            } else {
                return callback(1,err.message, preCashInBodyProcessed);
            }

        }
    );
}

function cashIn(token,id,callback){

    const cashInHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel": "agent"
    };
    request.post(
        {
            headers: cashInHeader,
            url:"http://172.16.151.33:3150/floosak-w/cashIn-confirm",
            body: "",
            method: 'POST',
            
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, "url"+id);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, "url"+id);
                }

            } else {
                return callback(1,err.message, "url"+id);
            }

        }
    );
}

function preCashOut(token,wallet_id,mobile_no,otp,callback){

    const preCashOutHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel": "agent"
    };
    var preCashOutBody = {
        'source_wallet_id': wallet_id,
        'otp': otp,
        'target_phone':'967'+mobile_no,
    };

    var preCashOutBodyProcessed = prepareBody(preCashOutBody); 
    
    request.post(
        {
            headers: preCashOutHeader,
            url: "http://172.16.151.33:3150/floosak-w/cashOut",
            body: preCashOutBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    console.log(body);
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, preCashOutBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, preCashOutBodyProcessed);
                }

            } else {
                return callback(1,err.message, preCashOutBodyProcessed);
            }

        }
    );
}


function cashOut(token,wallet_id,id,mobile_no,otp,reqId,amount,callback){

    const cashOutHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel": "agent"
    };
    var cashOutBody = {
        'source_wallet_id': wallet_id,
        'request_id': reqId,
        'otp':otp,
        'amount':amount,
        'phone':"967"+mobile_no,
        'transaction_id':id,
        
    };
    
    var cashOutBodyProcessed = prepareBody(cashOutBody); 
    request.post(
        {
            headers: cashOutHeader,
            url: "http://172.16.151.33:3150/floosak-w/cashOut-confirm",
            body: cashOutBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {
            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, cashOutBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, cashOutBodyProcessed);
                }

            } else {
                return callback(1,err.message, cashOutBodyProcessed);
            }

        }
    );
}



function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}

function isAmountEqual(sysAmount,floAmount){
    if(sysAmount == floAmount){
        return true;
    } else {
        return false;
    }
}

async function findQResponse(number,serviceName,serviceType) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ mobile_no : number , service_name:serviceName,service_type:serviceType}, (err, apiData) => {
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


async function findLastToken(serviceName) {

    var Qrespons;
    var entireRow;
    var tokenStored;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: "last token" , service_name:serviceName}, (err, apiData) => {
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

function writeGeneralErrorXmlFile(error,ServerData) {
    var result = getErrorMsg(error);

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
        <code_API>-1</code_API>
         <msg_API>There was an error please call the support !</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}

function writeCashInQXmlFile(response,ServerData){

            var name = response.name;
            var feeAmount = response.net;

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:CASHIN_Q>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>1</code_API>
         <msg_API>true</msg_API>
      </msg_info_API>
      <CASHIN_Q_Response>
       <Amount>${feeAmount}</Amount>
       <Cust_Name>${name}</Cust_Name>
      </CASHIN_Q_Response>
    </ns:CASHIN_Q>
    </env:Body>
    </env:Envelope>`
}


function writeCashInPXmlFile(response,ServerData){

    var t_id = response.id;

return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
<env:Header/>
<env:Body>
<ns:CASHIN_P>
<msg_info_server>
<code_serv>${ServerData.code}</code_serv>
<msg_serv>${ServerData.massege}</msg_serv>
</msg_info_server>
<msg_info_API>
<code_API>1</code_API>
 <msg_API>true</msg_API>
</msg_info_API>
<CASHIN_P_Response>
<transaction_id>${t_id}</transaction_id>
</CASHIN_P_Response>
</ns:CASHIN_P>
</env:Body>
</env:Envelope>`
}

function writeCashOutQXmlFile(response,ServerData){

    var name = response.name;
    var commission = response.commission;

return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
<env:Header/>
<env:Body>
<ns:CASHOUT_Q>
<msg_info_server>
<code_serv>${ServerData.code}</code_serv>
<msg_serv>${ServerData.massege}</msg_serv>
</msg_info_server>
<msg_info_API>
<code_API>1</code_API>
 <msg_API>true</msg_API>
</msg_info_API>
<CASHOUT_Q_Response>
<Fee_Amount>${response.net}</Fee_Amount>
<Cust_Name>${name}</Cust_Name>
<commission>${commission}</commission>
</CASHOUT_Q_Response>
</ns:CASHOUT_Q>
</env:Body>
</env:Envelope>`
}



function writeCashOutPXmlFile(response,ServerData){

    var t_id = response.id;

return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
<env:Header/>
<env:Body>
<ns:CASHOUT_P>
<msg_info_server>
<code_serv>${ServerData.code}</code_serv>
<msg_serv>${ServerData.massege}</msg_serv>
</msg_info_server>
<msg_info_API>
<code_API>1</code_API>
 <msg_API>true</msg_API>
</msg_info_API>
<CASHOUT_P_Response>
<transaction_id>${t_id}</transaction_id>
</CASHOUT_P_Response>
</ns:CASHOUT_P>
</env:Body>
</env:Envelope>`
}

function reigonError(ServerData){

return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
<env:Header/>
<env:Body>
<ns:CASHIN_Q>
<msg_info_server>
<code_serv>${ServerData.code}</code_serv>
<msg_serv>${ServerData.massege}</msg_serv>
</msg_info_server>
<msg_info_API>
<code_API>-1</code_API>
 <msg_API>لا يمكن تمرير العملية نظرا لأختلاف المنطقة</msg_API>
</msg_info_API>
</ns:CASHIN_Q>
</env:Body>
</env:Envelope>`
}

function proccessingErrors(jsonGot){

    var message;

        for(var key in jsonGot) {
            if(jsonGot.hasOwnProperty(key)) {
                message = jsonGot[key];
                break;
            }
        }   

      

    // console.log(message[0]);

    return message[0];

}

function getWalletID(list){
    var y ;
    for(var i =0; i <list["data"]["wallets"].length;i++){
        switch(list["data"]["wallets"][i]["currency"]["id"]){
            case 1:
                y =list["data"]["wallets"][i]["id"]
        }
    }
    console.log("id of currency is **********:"+y);
    return y;
}

function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
        return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;

}


function writeErrorLog(opNo,user,service,type,error){
    return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
}

function getErrorMsg(error){
    var finalResult;
    var code = 99;
    var msg = "فشلت العملية"
    findServErrorMsg().then(gottenData=>{
        
        var found = false;

        Object.keys(gottenData).forEach(function(key) {
            if(error.includes(gottenData[key]))
            {
                found = true;
                 finalResult = {
                    "code":key,
                    "msg":gottenData[key]
                }
                console.log(finalResult);
                return ;
            }
          })
    
          if(!found){
             finalResult = {
                "code":code,
                "msg":msg
            }
            console.log(finalResult);
            
          }
    
          return finalResult;
    }).catch(error=>{
        finalResult = {
            "code":code,
            "msg":msg
        }
        return finalResult;
    })


}


async function findServErrorMsg() {

    var errsMSG;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: "ErrorList", service_name:"floosak", service_type:"getErrorMsg" }, (err, apiData) => {
        try {
            if (apiData[apiData.length - 1].responesData === undefined) {
              errsMSG = '';
                console.log("Qresponse is : undefined");
                reject(errsMSG);
            }
            else {
              errsMSG = apiData[apiData.length - 1].responesData;
                console.log("Qresponse is : " + errsMSG);
                resolve(errsMSG);
            }
  
        } catch (error) {
          errsMSG = '';
            console.log("Qresponse is : blank");
            reject(errsMSG);
  
        }
  
  
        console.log('55555555555555555555555555555555555555');
        console.log(errsMSG);
  
  
    });
  });
    
  }