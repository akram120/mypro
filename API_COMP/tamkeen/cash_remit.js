const request = require("request");
const fs = require("fs");
const baseURL = "https://www.tamkeen.com.ye:5059/pmbagents";
const login = "/v1/Account/Login";
const otcSearch="/v1/OtcCollection/OtcReceivingSearch";
const otcCollection="/v1/OtcCollection/OtcCollection";
const myEligibleSOF = "/v1/Account/EligibleSoF";
const username = "c1.subtst5";
const password = "mtM/v91a";
const authorization = 'Basic ' + toBase64();
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var agentOptions= {
    // key:fs.readFileSync('C:/shameelServer/keyP.pem'),
    // cert:fs.readFileSync('C:/shameelServer/crt.pem'),
  };
var rn = require('random-number');



function cash_remit_server(req, callback){

    findLastToken(req.service_info.service_name).then(value=>{

        console.log("token found in DB");
        if ((req.service_info.service_type).toUpperCase() == 'Q_REM'){
            var remitNo = req.rem_info.rem_no;
            var requesterRegion = req.rem_info.region;

            searchRemit(value.tokenBody,remitNo,function(status,data,bodySent){

                if (status==200){
                    if(requesterRegion==1){
                        if(data.ResultCode==1){
                           
                            var amounts = data.amount;
                            var res_data = writeQueryRemitxml(data,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  transaction_id:data.operationId,
                                  service_name: req.service_info.service_name,
                                  service_type: req.service_info.service_type,
                                  system_name: req.service_info.system_name,
                                  username: req.service_info.username,
                                  agent_code: req.service_info.agent_or_Branch_Code,
                                  agent_name: req.service_info.agent_or_Branch_name,
                                  date: Date.now(),
                                  requestData: bodySent,
                                  responesData: JSON.stringify(data),
                                  Amounts:amounts,
                                  CustID:`${data.currencyId}`,
                                  FirstName: data.unregReceiverParty.firstName,
                                  SecondName: data.unregReceiverParty.secondeName,
                                  ThirdName: data.unregReceiverParty.middleName,
                                  LastName: data.unregReceiverParty.lastName,
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
                                        var callbackResponse = writeQueryRemitxml(data,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        } else {
                            var res_data = writeGeneralErrorXmlFile(data.ResultMessage, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: req.rem_info.rem_no,
                                    transaction_id: "",
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
                                    request_id: "",
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
    
                                    var callbackResponse = writeGeneralErrorXmlFile(data.ResultMessage, database_error);
                                    callback(callbackResponse);
                                }
    
                            });
                        }
                    } else{
                        
                        var res_data = reigonError(no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              transaction_id:"",
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: bodySent,
                              responesData: JSON.stringify(data),
                              Amounts:"",
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
                                    var callbackResponse = reigonError(database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    }              
          
                        
                }else if (status==401) {
                    getToken(function (status,token,requestSents){
                        if(status==200){
                            newApiRequest.insertData.updateOne(
                                {
                                    "rem_no":"last token","service_name":"cash_remit"
                                }
                                ,
                                {
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: requestSents,
                                    responesData: token,
                                    tokenBody: token,
                                }
                            ).then(value=>{
                                console.log(value);
                                cash_remit_server(req, function (callbackResult) {
                                    callback(callbackResult);
                                });
                            }).catch(error=>{
                                console.log(error)
                                var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة", no_server_error);
                                callback(res_data);
                            })
                        } else {
                            var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",no_server_error);
            
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
                                    var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                        }
                    });
                } else {
                    var res_data =writeGeneralErrorXmlFile(data,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                        rem_no: req.rem_info.rem_no,
                        transaction_id: "",
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
        } else if ((req.service_info.service_type).toUpperCase() == 'P_REM'){   
            var remitNo = req.rem_info.rem_no;
            var mobileNo = req.rem_info.mobile_no;
            findQResponse(remitNo).then(row=>{
                getMyEligibleSOF(value.tokenBody,function(status,dataA,bodySentA){
                    var mySofId = 0;
                    var creditedID = 0;
                    if (status == 200) {
                        if(dataA.ResultCode==1){
                            var sourceOfFundList = dataA.SourceOfFundList;
                            for(var i=0;i<sourceOfFundList.length;i++){
                                if(sourceOfFundList[i].sofCurrencyId==row.CustID){
                                    mySofId=sourceOfFundList[i].sofId;
                                    creditedID=sourceOfFundList[i].ownerId;
                                    break;
                                }
                            }
                            
                            collectRemit(value.tokenBody,remitNo,mobileNo,creditedID,mySofId,row.FirstName,row.SecondName,row.ThirdName,row.LastName,function(status,dataB,bodySentB){    
                                if (status==200){
                                    if(dataB.ResultCode==1){
                                        var trans_id = dataB.receipt.operationId;
                                        var res_data = writeConfirmRemitXmlFile(dataB,no_server_error);
                                        let newData = new newApiRequest.insertData(
                                            {
                                              rem_no: req.rem_info.rem_no,
                                              transaction_id: trans_id,
                                              service_name: req.service_info.service_name,
                                              service_type: req.service_info.service_type,
                                              system_name: req.service_info.system_name,
                                              username: req.service_info.username,
                                              agent_code: req.service_info.agent_or_Branch_Code,
                                              agent_name: req.service_info.agent_or_Branch_name,
                                              date: Date.now(),
                                              requestData: `${[bodySentA,bodySentB]}`,
                                              responesData: JSON.stringify(dataA,dataB),
                                              Amounts: row.Amounts,
                                              FirstName: row.FirstName,
                                              SecondName: row.SecondName,
                                              ThirdName: row.ThirdName,
                                              LastName: row.LastName,
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
                                                    var callbackResponse = writeConfirmRemitXmlFile(dataB,database_error);
                                                    callback(callbackResponse);
                                                }
                            
                                            });
                                    } else {
                                        var res_data = writeGeneralErrorXmlFile(dataB.ResultMessage, no_server_error);
                                        let newData = new newApiRequest.insertData(
                                            {
                                                rem_no: req.rem_info.rem_no,
                                                transaction_id: "",
                                                service_name: req.service_info.service_name,
                                                service_type: req.service_info.service_type,
                                                system_name: req.service_info.system_name,
                                                username: req.service_info.username,
                                                agent_code: req.service_info.agent_or_Branch_Code,
                                                agent_name: req.service_info.agent_or_Branch_name,
                                                date: Date.now(),
                                                requestData: bodySentB,
                                                responesData: JSON.stringify(dataB),
                                                Amounts: "",
                                                FirstName: "",
                                                SecondName: "",
                                                ThirdName: "",
                                                LastName: "",
                                                CustID: "",
                                                request_id: "",
                                                qRespones: res_data,
                                                Request: JSON.stringify(req),
                                                remStatus:"",
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
                
                                                var callbackResponse = writeGeneralErrorXmlFile(dataB.ResultMessage, database_error);
                                                callback(callbackResponse);
                                            }
                
                                        });
                                    }
        
                                } else if (status==401) {
                                    getToken(function (status,token,requestSents){
                                        if(status==200){
                                            newApiRequest.insertData.updateOne(
                                                {
                                                    "rem_no":"last token","service_name":"cash_remit"
                                                }
                                                ,
                                                {
                                                    service_name: req.service_info.service_name,
                                                    service_type: req.service_info.service_type,
                                                    system_name: req.service_info.system_name,
                                                    username: req.service_info.username,
                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                    date: Date.now(),
                                                    requestData: requestSents,
                                                    responesData: token,
                                                    tokenBody: token,
                                                }
                                            ).then(value=>{
                                                console.log(value);
                                                cash_remit_server(req, function (callbackResult) {
                                                    callback(callbackResult);
                                                });
                                            }).catch(error=>{
                                                console.log(error)
                                                var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة", no_server_error);
                                                callback(res_data);
                                            })
                                        } else {
                                            var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",no_server_error);
                            
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
                                                    var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",database_error);
                                                    callback(callbackResponse);
                                                }
                            
                                            });
                                        }
                                    });
            
                                } else {
                                    var res_data =writeGeneralErrorXmlFile(dataB,no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: req.rem_info.rem_no,
                                            transaction_id: "",
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodySentB,
                                            responesData: JSON.stringify(dataB),
                                            Amounts: row.Amounts,
                                            FirstName: row.FirstName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: row.qRespones,
                                            pRespones:res_data,
                                            Request: JSON.stringify(req),
                                            remStatus:""
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
                                            var callbackResponse = writeGeneralErrorXmlFile(dataB,database_error);
                                            callback(callbackResponse);
                                        }
                    
                                    });
                                }
                            });
                        } else {
                            var res_data = writeGeneralErrorXmlFile(dataA.ResultMessage, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: req.rem_info.rem_no,
                                    transaction_id: "",
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: bodySentA,
                                    responesData: JSON.stringify(dataA),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    request_id: "",
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
    
                                    var callbackResponse = writeGeneralErrorXmlFile(dataA.ResultMessage, database_error);
                                    callback(callbackResponse);
                                }
    
                            });
                        }

                    } else if (status == 401) {
                        getToken(function (status, token, requestSents) {
                            if (status == 200) {
                                newApiRequest.insertData.updateOne(
                                    {
                                        "rem_no":"last token","service_name":"cash_remit"
                                    }
                                    ,
                                    {
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: requestSents,
                                        responesData: token,
                                        tokenBody: token,
                                    }
                                ).then(value=>{
                                    console.log(value);
                                    cash_remit_server(req, function (callbackResult) {
                                        callback(callbackResult);
                                    });
                                }).catch(error=>{
                                    console.log(error)
                                    var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة", no_server_error);
                                    callback(res_data);
                                })
                            } else {
                                var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة", no_server_error);
    
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
                                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة", database_error);
                                        callback(callbackResponse);
                                    }
    
                                });
                            }
                        });
                    } else {
                        var res_data = writeGeneralErrorXmlFile(dataA, no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: req.rem_info.rem_no,
                                transaction_id: req.process_info.transNo,
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodySentA,
                                responesData: JSON.stringify(dataA),
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
                                var callbackResponse = writeGeneralErrorXmlFile(data, database_error);
                                callback(callbackResponse);
                            }
    
                        });
                    }

                })

            }).catch(value=>{
                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: req.rem_info.rem_no,
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

        }
    }).catch(value=>{
        console.log("token not found in DB");
        getToken(function (status,token,requestSents){
            if(status==200){
             let newData = new newApiRequest.insertData(
                {
                    rem_no: 'last token',
                    transaction_id: "",
                    service_name: req.service_info.service_name,
                    service_type: req.service_info.service_type,
                    system_name: req.service_info.system_name,
                    username: req.service_info.username,
                    agent_code: req.service_info.agent_or_Branch_Code,
                    agent_name: req.service_info.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: requestSents,
                    responesData: token,
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
                        cash_remit_server(req,function(callbackResult){
                            callback(callbackResult);
                        });

                    }
                    else {
                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",no_server_error);
                        callback(res_data);
                    }

                });
            } else {
                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",no_server_error);

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
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة",database_error);
                        callback(callbackResponse);
                    }

                });
            }
        });
    });

}

module.exports.cash_remit_server=cash_remit_server;




function getTokenV1(callback){

    const getTokenHeader = {
        "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
    };

    var data = {
        'UserInfo.UserName': username,
        'UserInfo.Password': password
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
            headers: getTokenHeader,
            url:"https://www.tamkeen.com.ye:5059/ilgn/?scope=Test&redirect_url=http://172.16.0.33:2120/ilgn/?scope=Test",
            body: formBody,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                console.log("success")
                console.log(body);
                const dom = new JSDOM(body);
                try {
                    var myURL = new URL(dom.window.document.querySelector("a").href);
                    var gettingScope = myURL.searchParams.get('scope');
                    var myURL2 = new URL('http://www.emaple.com'+gettingScope);
                    var token = myURL2.searchParams.get('Token');
                    return callback(200,token);
                } catch (error) {
                    return callback(0,error.message);
                }
            } else {
                console.log("error")
                console.log(err);
                return callback(0,err);
                
                
            }


        }
    );
}

function getToken(callback){

    const getTokenHeader = {
        "Content-Type":"application/json",
        "Authorization": authorization,
    };
    var options = {
        min: 100000
        , max:  1000000
        , integer: true
    }
    var requestID = rn(options);
    var getTokenBody = {
        "RequestId":requestID
        };

    var getTokenBodyBodyProcessed = prepareBody(getTokenBody);

    request.post(
        {
            headers: getTokenHeader,
            //url: baseURL+login,
            url: "http://100.0.0.108:3150/cash-r/login",
            body: getTokenBodyBodyProcessed,
            method: 'POST',
            agentOptions: agentOptions
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    console.log(body);
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok.Token, getTokenBodyBodyProcessed);

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

function searchRemit(token,rmeitNO,callback){

    var options = {
        min:  100000
        , max:  1000000
      , integer: true
      }
    var requestID = rn(options);

    const searchRemitHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json"
    };
    var searchRemitBody = {
        "passCode": rmeitNO,
        "RequestId": requestID
    };
    
    var searchRemitBodyProcessed = prepareBody(searchRemitBody);
  
    request.post(
        {
            headers: searchRemitHeader,
            //url: baseURL+otcSearch,
            url:"http://100.0.0.108:3150/cash-r/query",
            body: searchRemitBodyProcessed,
            method: 'POST',
            agentOptions: agentOptions
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, searchRemitBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, searchRemitBodyProcessed);
                }

            } else {
                return callback(1,err.message, searchRemitBodyProcessed);
            }

        }
    );

    
}

function getMyEligibleSOF(token,callback){

    var options = {
        min:  100000
        , max:  1000000
      , integer: true
      }
    var requestID = rn(options);

    const myEligibleSOFHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json"
    };
    var myEligibleSOFBody = {
        "OpsCodes": {
            "Service": 1,
            "OperationType": 110,
            "Operation": 2
        },
        "RequestId": requestID
    };
    
    var preMyEligibleSOProcessed = prepareBody(myEligibleSOFBody);
  
    request.post(
        {
            headers: myEligibleSOFHeader,
            //url: baseURL+myEligibleSOF,
            url:"http://100.0.0.108:3150/cash-w/mySof",
            body: preMyEligibleSOProcessed,
            method: 'POST',
            agentOptions: agentOptions
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, preMyEligibleSOProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, preMyEligibleSOProcessed);
                }

            } else {
                return callback(1,err.message, preMyEligibleSOProcessed);
            }

        }
    );
}

function collectRemit(token,rmeitNO,customerNo,creditoID,creditorSOFID,fName,sName,tName,lName,callback){

    var options = {
        min:  100000
        , max:  1000000
      , integer: true
      }
    var requestID = rn(options);

    const collectRemitHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json"
    };
    var collectRemitBody = {
        "passCode": rmeitNO,
        "creditedId": creditoID,
        "creditedSofId": creditorSOFID,
        "unregCreditedParty": {
            "msisdn":customerNo,
            "firstName":fName,
            "secondeName": sName,
            "middleName":tName,
            "lastName": lName,
            "PreferredNotificationChannel": "SMS"
        },
        "comment":"string",
        "RequestId":requestID
        };
    
    var collectRemitBodyProcessed = prepareBody(collectRemitBody);
  
    request.post(
        {
            headers: collectRemitHeader,
            //url: baseURL+otcCollection,
            url:"http://100.0.0.108:3150/cash-r/pay",
            body: collectRemitBodyProcessed,
            method: 'POST',
            agentOptions: agentOptions
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, collectRemitBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, collectRemitBodyProcessed);
                }

            } else {
                return callback(1,err.message, collectRemitBodyProcessed);
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
    await newApiRequest.insertData.find({ rem_no : number}, (err, apiData) => {
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
         <msg_API>${error}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}


function writeQueryRemitxml(responesData, ServerData) {



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
         <msg_API>true</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${responesData.passcode}</rem_no>
        <trans_key>${responesData.operationId}</trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${responesData.amount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${responesData.currencyId}</payout_cuyc>
        <payout_com></payout_com>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc></payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount></payout_settlement_amount>
        <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
        <rem_status></rem_status>
        <rem_type></rem_type>
        <sending_coyc></sending_coyc>
        <destenation_coyc></destenation_coyc>
        <user_note></user_note>
     </rem_info>
     <sender_info>
        <sender_trns_id></sender_trns_id>
        <f_name></f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name> </l_name>
        <full_name>${responesData.senderFullName}</full_name>
        <telephone></telephone>
        <mobile>${responesData.senderPhone}</mobile>
        <address></address>
        <address1></address1>
        <nationality_coyc></nationality_coyc>
        <bd_or_ed></bd_or_ed>
        <gender></gender>
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
        <full_name>${responesData.receiverFullName}</full_name>
        <telephone></telephone>
        <mobile>${responesData.unregReceiverParty.msisdn}</mobile>
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
        <sending_reason></sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_date></the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}


function writeConfirmRemitXmlFile(response,ServerData){

var t_id = response.receipt.operationId;

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
<PaymentRem_RESP>
<transaction_id>${t_id}</transaction_id>
<commission>${response.receipt.tfcList[0].amount}</commission>
<ccy>${response.receipt.tfcList[0].currencyId}</ccy>
</PaymentRem_RESP>
</ns:CASHIN_P>
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


function toBase64() {
    var authBase64 = `${username + ":" + password}`;
    var base64String = new Buffer.from(authBase64).toString("base64");
    return base64String;
}