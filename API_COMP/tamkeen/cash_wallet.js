const request = require("request");
const fs = require("fs");
const baseURL = "https://www.tamkeen.com.ye:5059/pmbagents";
const login = "/v1/Account/Login";
const myEligibleSOF = "/v1/Account/EligibleSoF";
const customerEligibleSOF = "/v1/Account/OthersEligibleSoF";
const cashInEndPoint = "/v1/CashIn/CashIn";
const cashOutEndPoint = "/v1/CashOut/InitCashOutViaOtp";
const cashOutConfirm = "/v1/CashOut/CashOutCnfrmByOtp";
const username = "c1.subtst5";
const password = "mtM/v91a";
const authorization = 'Basic ' + toBase64();
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var agentOptions= {
    // key:fs.readFileSync('C:/server test/alnoamanServerApi Maintenance -21-02-2021/node_server_API_servcis/API_COMP/tamkeen/key.pem'),
    // cert:fs.readFileSync('C:/server test/alnoamanServerApi Maintenance -21-02-2021/node_server_API_servcis/API_COMP/tamkeen/cert.pem'),
};
var rn = require('random-number');



function cash_server(req, callback) {


    findLastToken(req.service_info.service_name).then(value => {
        console.log("token found in DB");
        if ((req.service_info.service_type).toUpperCase() == "CASHIN_Q") {
            var mobileNumber = req.process_info.customerMobile;
            var amount = req.process_info.amount;
            var requesterRegion = req.rem_info.region;
            var mySofId = 0;
            var customerSof = 0;
            getMyEligibleSOF(value.tokenBody, "CASHIN_Q", function (status, dataA, bodySentA) {
                if (status == 200) {
                    if (dataA.ResultCode == 1) {
                        if ((requesterRegion == 1)) {
                            var sourceOfFundList = dataA.SourceOfFundList;
                            for (var i = 0; i < sourceOfFundList.length; i++) {
                                if (sourceOfFundList[i].sofCurrencyId == 2) {
                                    mySofId = sourceOfFundList[i].sofId;
                                    break;
                                }
                            }
                                getCustomerEligibleSOF(value.tokenBody, "CASHIN_Q", mobileNumber, function (status, dataB, bodySentB) {
                                    if (status == 200) {
                                        if (dataB.ResultCode == 1) {
                                            var sourceOfFundList = dataB.SourceOfFundList;
                                            for (var i = 0; i < sourceOfFundList.length; i++) {
                                                if (sourceOfFundList[i].SofCurrencyId == 2) {
                                                    customerSof = sourceOfFundList[i].SofId;
                                                    break;
                                                }
                                            }
                                                var customerName = dataB.TargetName;
                                                var res_data = writeCashInQXmlFile(dataB, amount, no_server_error);
                                                let newData = new newApiRequest.insertData(
                                                    {
                                                        rem_no: req.rem_info.rem_no,
                                                        mobile_no: req.process_info.customerMobile,
                                                        transaction_id: dataB.OperationId,
                                                        service_name: req.service_info.service_name,
                                                        service_type: req.service_info.service_type,
                                                        system_name: req.service_info.system_name,
                                                        username: req.service_info.username,
                                                        agent_code: req.service_info.agent_or_Branch_Code,
                                                        agent_name: req.service_info.agent_or_Branch_name,
                                                        date: Date.now(),
                                                        requestData: `${[bodySentA, bodySentB]}`,
                                                        responesData: JSON.stringify([dataA, dataB]),
                                                        Amounts: req.process_info.amount,
                                                        FirstName: customerName,
                                                        SecondName: "",
                                                        ThirdName: "",
                                                        LastName: "",
                                                        CustID: customerSof,
                                                        request_id: mySofId,
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

                                                        var callbackResponse = writeCashInQXmlFile(dataB, amount, no_server_error);
                                                        callback(callbackResponse);
                                                    }

                                                });

                                            
                                        } else {
                                            var res_data = writeGeneralErrorXmlFile(dataB.ResultMessage, no_server_error);
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
                                                    requestData: bodySentB,
                                                    responesData: JSON.stringify(dataB),
                                                    Amounts: req.process_info.amount,
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

                                                    var callbackResponse = writeGeneralErrorXmlFile(dataB.ResultMessage, database_error);
                                                    callback(callbackResponse);
                                                }

                                            });
                                        }


                                    } else if (status == 401) {
                                        getToken(function (status, token, requestSents) {
                                            if (status == 200) {
                                                newApiRequest.insertData.updateOne(
                                                    {
                                                        "rem_no":"last token","service_name":"cash"
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
                                                    cash_server(req, function (callbackResult) {
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
                                        var res_data = writeGeneralErrorXmlFile(dataB, no_server_error);
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
                                                requestData: bodySentB,
                                                responesData: JSON.stringify(dataB),
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
                            
                        } else {
                            
                            var res_data = reigonError(no_server_error);
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
                                    requestData: bodySentA,
                                    responesData: JSON.stringify(dataA),
                                    Amounts: req.process_info.amount,
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
                    } else {
                        var res_data = writeGeneralErrorXmlFile(dataA.ResultMessage, no_server_error);
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
                                requestData: bodySentA,
                                responesData: JSON.stringify(dataA),
                                Amounts: req.process_info.amount,
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
                    console.log("unAthorized");
                    getToken(function (status, token, requestSents) {
                        if (status == 200) {
                            newApiRequest.insertData.updateOne(
                                {
                                    "rem_no":"last token","service_name":"cash"
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
                                console.log("save token in DB");
                                console.log(value);
                                cash_server(req, function (callbackResult) {
                                    callback(callbackResult);
                                });
                            }).catch(error=>{
                                console.log("NOT save token in DB");
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
                            mobile_no: req.process_info.customerMobile,
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
            });
        } else if ((req.service_info.service_type).toUpperCase() == "CASHIN_P") {
            var mobileNumber = req.process_info.customerMobile;
            var amount = req.process_info.amount;

            findQResponse(req, "CASHIN_Q").then(row => {
                cashIn(value.tokenBody, amount, row.request_id, row.CustID, mobileNumber, function (status, data, bodySent) {
                    if (status == 200) {
                        if(data.ResultCode==1){
                            var res_data = writeCashInPXmlFile(data, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: req.rem_info.rem_no,
                                    mobile_no: req.process_info.customerMobile,
                                    transaction_id: data.receipt.operationId,
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
                                    CustID: row.CustID,
                                    request_id: row.request_id,
                                    qRespones: row.qRespones,
                                    pRespones: res_data,
                                    Request: JSON.stringify(req),
                                    remStatus: "1"
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
                                    var callbackResponse = writeCashInPXmlFile(data, database_error);
                                    callback(callbackResponse);
                                }
    
                            });
                        } else {
                            var res_data = writeGeneralErrorXmlFile(data.ResultMessage,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  mobile_no: req.process_info.customerMobile,
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
                                  Amounts: req.process_info.amount,
                                  FirstName: "",
                                  SecondName: "",
                                  ThirdName: "",
                                  LastName: "",
                                  CustID: "",
                                  request_id:"",
                                  qRespones: res_data,
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
                                        
                                        var callbackResponse = writeGeneralErrorXmlFile(data.ResultMessage,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        }

                    } else if (status == 401) {
                        getToken(function (status, token, requestSents) {
                            if (status == 200) {
                                newApiRequest.insertData.updateOne(
                                    {
                                        "rem_no":"last token","service_name":"cash"
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
                                    cash_server(req, function (callbackResult) {
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
                        var res_data = writeGeneralErrorXmlFile(data, no_server_error);
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
                                pRespones: res_data,
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
                                var callbackResponse = writeGeneralErrorXmlFile(data, database_error);
                                callback(callbackResponse);
                            }

                        });
                    }
                });
            }).catch(value => {
                var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", no_server_error);
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
                        pRespones: res_data,
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
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", database_error);
                        callback(callbackResponse);
                    }

                });
            });

        } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_Q") {

            var mobileNumber = req.process_info.customerMobile;
            var amount = req.process_info.amount;
            var requesterRegion = req.rem_info.region;
            var mySofId = 0;
            var customerSof = 0;
            getMyEligibleSOF(value.tokenBody, "CASHOUT_Q", function (status, dataA, bodySentA) {
                if (status == 200) {
                    if(dataA.ResultCode==1){
                        if ((requesterRegion == 1)) {
                            var sourceOfFundList = dataA.SourceOfFundList;
                            for (var i = 0; i < sourceOfFundList.length; i++) {
                                if (sourceOfFundList[i].sofCurrencyId == 2) {
                                    mySofId = sourceOfFundList[i].sofId;
                                    break;
                                }
                            }
                                getCustomerEligibleSOF(value.tokenBody, "CASHOUT_Q", mobileNumber, function (status, dataB, bodySentB) {
                                    if (status == 200) {
                                        if(dataB.ResultCode==1){
                                            var sourceOfFundList = dataB.SourceOfFundList;
                                            for (var i = 0; i < sourceOfFundList.length; i++) {
                                                if (sourceOfFundList[i].SofCurrencyId == 2) {
                                                    customerSof = sourceOfFundList[i].SofId;
                                                    break;
                                                }
                                            }
                                                cashOut(value.tokenBody, amount, customerSof, mySofId, mobileNumber, function (status, dataC, bodySentC) {
                                                    if (status == 200) {

                                                        if(dataC.ResultCode==1){
                                                            var customerName = dataC.receipt.debited.actorPreferredIdentifier;
                                                            var res_data = writeCashOutQXmlFile(dataC, no_server_error);
                                                            let newData = new newApiRequest.insertData(
                                                                {
                                                                    rem_no: req.rem_info.rem_no,
                                                                    mobile_no: req.process_info.customerMobile,
                                                                    transaction_id: dataC.humanTaskId,
                                                                    service_name: req.service_info.service_name,
                                                                    service_type: req.service_info.service_type,
                                                                    system_name: req.service_info.system_name,
                                                                    username: req.service_info.username,
                                                                    agent_code: req.service_info.agent_or_Branch_Code,
                                                                    agent_name: req.service_info.agent_or_Branch_name,
                                                                    date: Date.now(),
                                                                    requestData: `${[bodySentA, bodySentB, bodySentC]}`,
                                                                    responesData: JSON.stringify([dataA, dataB, dataC]),
                                                                    Amounts: amount,
                                                                    FirstName: customerName,
                                                                    SecondName: "",
                                                                    ThirdName: "",
                                                                    LastName: "",
                                                                    CustID: customerSof,
                                                                    request_id: mySofId,
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
            
                                                                    var callbackResponse = writeCashOutQXmlFile(dataC, no_server_error);
                                                                    callback(callbackResponse);
                                                                }
            
                                                            });
                                                        } else{
                                                            var res_data = writeGeneralErrorXmlFile(dataC.ResultMessage,no_server_error);
                                                            let newData = new newApiRequest.insertData(
                                                                {
                                                                  rem_no: req.rem_info.rem_no,
                                                                  mobile_no: req.process_info.customerMobile,
                                                                  transaction_id:"",
                                                                  service_name: req.service_info.service_name,
                                                                  service_type: req.service_info.service_type,
                                                                  system_name: req.service_info.system_name,
                                                                  username: req.service_info.username,
                                                                  agent_code: req.service_info.agent_or_Branch_Code,
                                                                  agent_name: req.service_info.agent_or_Branch_name,
                                                                  date: Date.now(),
                                                                  requestData: JSON.stringify(bodySentC),
                                                                  responesData: JSON.stringify(dataC),
                                                                  Amounts: req.process_info.amount,
                                                                  FirstName: "",
                                                                  SecondName: "",
                                                                  ThirdName: "",
                                                                  LastName: "",
                                                                  CustID: "",
                                                                  request_id:"",
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
                                                                        
                                                                        var callbackResponse = writeGeneralErrorXmlFile(dataC.ResultMessage,database_error);
                                                                        callback(callbackResponse);
                                                                    }
                                                
                                                                });
                                                        }
        
                                                    } else if (status == 401) {
                                                        getToken(function (status, token, requestSents) {
                                                            if (status == 200) {
                                                                newApiRequest.insertData.updateOne(
                                                                    {
                                                                        "rem_no":"last token","service_name":"cash"
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
                                                                    cash_server(req, function (callbackResult) {
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
                                                        var res_data = writeGeneralErrorXmlFile(dataC, no_server_error);
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
                                                                requestData: bodySentC,
                                                                responesData: JSON.stringify(dataC),
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
                                                                var callbackResponse = writeGeneralErrorXmlFile(dataC, database_error);
                                                                callback(callbackResponse);
                                                            }
        
                                                        });
                                                    }
                                                })
        
                                            
                                        } else {
                                            var res_data = writeGeneralErrorXmlFile(dataB.ResultMessage,no_server_error);
                                            let newData = new newApiRequest.insertData(
                                                {
                                                  rem_no: req.rem_info.rem_no,
                                                  mobile_no: req.process_info.customerMobile,
                                                  transaction_id:"",
                                                  service_name: req.service_info.service_name,
                                                  service_type: req.service_info.service_type,
                                                  system_name: req.service_info.system_name,
                                                  username: req.service_info.username,
                                                  agent_code: req.service_info.agent_or_Branch_Code,
                                                  agent_name: req.service_info.agent_or_Branch_name,
                                                  date: Date.now(),
                                                  requestData: JSON.stringify(bodySentB),
                                                  responesData: JSON.stringify(dataB),
                                                  Amounts: req.process_info.amount,
                                                  FirstName: "",
                                                  SecondName: "",
                                                  ThirdName: "",
                                                  LastName: "",
                                                  CustID: "",
                                                  request_id:"",
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
                                                        
                                                        var callbackResponse = writeGeneralErrorXmlFile(dataB.ResultMessage,database_error);
                                                        callback(callbackResponse);
                                                    }
                                
                                                });
                                        }

    
                                    } else if (status == 401) {
                                        getToken(function (status, token, requestSents) {
                                            if (status == 200) {
                                                newApiRequest.insertData.updateOne(
                                                    {
                                                        "rem_no":"last token","service_name":"cash"
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
                                                    cash_server(req, function (callbackResult) {
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
                                        var res_data = writeGeneralErrorXmlFile(dataB, no_server_error);
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
                                                requestData: bodySentB,
                                                responesData: JSON.stringify(dataB),
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
                                                var callbackResponse = writeGeneralErrorXmlFile(dataB, database_error);
                                                callback(callbackResponse);
                                            }
    
                                        });
                                    }
                                })
                            
                        } else {
                            
                            var res_data = reigonError(no_server_error);
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
                                    requestData: bodySentA,
                                    responesData: JSON.stringify(dataA),
                                    Amounts: req.process_info.amount,
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
                    } else {
                        var res_data = writeGeneralErrorXmlFile(dataA.ResultMessage,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              mobile_no: req.process_info.customerMobile,
                              transaction_id:"",
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: bodySentA,
                              responesData: JSON.stringify(dataA),
                              Amounts: req.process_info.amount,
                              FirstName: "",
                              SecondName: "",
                              ThirdName: "",
                              LastName: "",
                              CustID: "",
                              request_id:"",
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
                                    
                                    var callbackResponse = writeGeneralErrorXmlFile(dataA.ResultMessage,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    }

                } else if (status == 401) {
                    getToken(function (status, token, requestSents) {
                        if (status == 200) {
                            newApiRequest.insertData.updateOne(
                                {
                                    "rem_no":"last token","service_name":"cash"
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
                                cash_server(req, function (callbackResult) {
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
                            mobile_no: req.process_info.customerMobile,
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
                            var callbackResponse = writeGeneralErrorXmlFile(dataA, database_error);
                            callback(callbackResponse);
                        }

                    });
                }
            });
        } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_P") {

            var mobileNumber = req.process_info.customerMobile;
            var otp = req.process_info.otp;
            var amount = req.process_info.amount;

            findQResponse(req, "CASHOUT_Q").then(row => {

                cashOutConfirmF(value.tokenBody, row.transaction_id, otp, function (status, data, bodySent) {

                    if (status == 200) {
                        if(data.ResultCode==1){
                            var res_data = writeCashOutPXmlFile(data, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: req.rem_info.rem_no,
                                    mobile_no: req.process_info.customerMobile,
                                    transaction_id: data.receipt.operationId,
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
                                    CustID: row.CustID,
                                    request_id:row.request_id,
                                    qRespones: row.qRespones,
                                    pRespones: res_data,
                                    Request: JSON.stringify(req),
                                    remStatus: "1"
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
                                    var callbackResponse = writeCashOutPXmlFile(data, no_server_error);
                                    callback(callbackResponse);
                                }
    
                            });
                        } else {
                            var res_data = writeGeneralErrorXmlFile(data.ResultMessage,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                  rem_no: req.rem_info.rem_no,
                                  mobile_no: req.process_info.customerMobile,
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
                                  Amounts: req.process_info.amount,
                                  FirstName: "",
                                  SecondName: "",
                                  ThirdName: "",
                                  LastName: "",
                                  CustID: "",
                                  request_id:"",
                                  qRespones: res_data,
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
                                        
                                        var callbackResponse = writeGeneralErrorXmlFile(data.ResultMessage,database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                        }



                    } else if (status == 401) {
                        getToken(function (status, token, requestSents) {
                            if (status == 200) {
                                newApiRequest.insertData.updateOne(
                                    {
                                        "rem_no":"last token","service_name":"cash"
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
                                    cash_server(req, function (callbackResult) {
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
                        var res_data = writeGeneralErrorXmlFile(data, no_server_error);
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
                                requestData: bodySent,
                                responesData: JSON.stringify(data),
                                Amounts: row.Amounts,
                                FirstName: row.FirstName,
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: row.qRespones,
                                pRespones: res_data,
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
                                var callbackResponse = writeGeneralErrorXmlFile(data, database_error);
                                callback(callbackResponse);
                            }

                        });
                    }
                });
            }).catch(value => {
                var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", no_server_error);
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
                        pRespones: res_data,
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
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة", database_error);
                        callback(callbackResponse);
                    }

                });
            })

        }
    }).catch(value => {
        console.log("token not found in DB");
        getToken(function (status, token, requestSents) {
            if (status == 200) {
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
                        tokenBody: token,
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
                        cash_server(req, function (callbackResult) {
                            callback(callbackResult);
                        });

                    }
                    else {
                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل إنشاء جلسة", no_server_error);
                        callback(res_data);
                    }

                });
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
    });

}

module.exports.cash_server = cash_server;




function getTokenV1(callback) {

    const getTokenHeader = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
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
            url: "https://www.tamkeen.com.ye:5059/ilgn/?scope=Test&redirect_url=http://172.16.0.33:2120/ilgn/?scope=Test",
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
                    var myURL2 = new URL('http://www.emaple.com' + gettingScope);
                    var token = myURL2.searchParams.get('Token');
                    return callback(200, token, formBody);
                } catch (error) {
                    return callback(0, error.message, formBody);
                }
            } else {
                console.log("error")
                console.log(err);
                return callback(0, err.message, formBody);


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
            url: "http://100.0.0.108:3150/cash-w/login",
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

function getMyEligibleSOF(token, servie, callback) {

    var operationType = 0;
    var operation = 0;
    var options = {
        min: 100000
        , max:  1000000
        , integer: true
    }
    var requestID = rn(options);
    if (servie == "CASHIN_Q") {
        operationType = 12;
        operation = 1;
    } else if (servie == "CASHOUT_Q") {
        operationType = 13;
        operation = 2;
    }

    const myEligibleSOFHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
    var myEligibleSOFBody = {
        "OpsCodes": {
            "Service": 1,
            "OperationType": operationType,
            "Operation": operation
        },
        "RequestId": requestID
    };

    var preMyEligibleSOProcessed = prepareBody(myEligibleSOFBody);

    request.post(
        {
            headers: myEligibleSOFHeader,
            //url: baseURL + myEligibleSOF,
            url:"http://100.0.0.108:3150/cash-w/mySof",
            body: preMyEligibleSOProcessed,
            method: 'POST',
            agentOptions: agentOptions
        },
        function (err, respones, body) {

            if (!err) {
                console.log("error is MyeleigbleSof"+body)
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, preMyEligibleSOProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, preMyEligibleSOProcessed);
                }

            } else {
                return callback(1, err.message, preMyEligibleSOProcessed);
            }

        }
    );
}

function getCustomerEligibleSOF(token, servie, customerNo, callback) {

    var operationType = 0;
    var operation = 0;
    var options = {
        min: 100000
        , max:  1000000
        , integer: true
    }
    var requestID = rn(options);
    if (servie == "CASHIN_Q") {
        operationType = 12;
        operation = 2;
    } else if (servie == "CASHOUT_Q") {
        operationType = 13;
        operation = 1;
    }

    const customerEligibleSOFHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
    var customerEligibleSOFBody = {
        "OpsCodes": {
            "Service": 1,
            "OperationType": operationType,
            "Operation": operation
        },
        "TargetActorMsisdn": customerNo,
        "RequestId": requestID
    };

    var preCustomerEligibleSOProcessed = prepareBody(customerEligibleSOFBody);

    request.post(
        {
            headers: customerEligibleSOFHeader,
            //url: baseURL + customerEligibleSOF,
            url:"http://100.0.0.108:3150/cash-w/otherSof",
            body: preCustomerEligibleSOProcessed,
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
                    return callback(statsCode, json_tok, preCustomerEligibleSOProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, preCustomerEligibleSOProcessed);
                }

            } else {
                return callback(1, err.message, preCustomerEligibleSOProcessed);
            }

        }
    );
}

function cashIn(token, amount, debitorSOF, creditorSOF, customerNo, callback) {

    var options = {
        min: 100000
        , max:  1000000
        , integer: true
    }
    var requestID = rn(options);
    const cashInHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
    var cashInBody = {
        "quantity": amount,
        "debitedSofId": debitorSOF,
        "currencyId": 2,
        "beneficiary": {
            "type": "1",
            "identifier": customerNo
        },
        "creditedSofId": creditorSOF,
        "comment": "",
        "RequestId": requestID
    };

    var cashInProcessed = prepareBody(cashInBody);
    request.post(
        {
            headers: cashInHeader,
            //url: baseURL + cashInEndPoint,
            url:"http://100.0.0.108:3150/cash-w/cashIn",
            body: cashInProcessed,
            method: 'POST',
            agentOptions: agentOptions

        },
        function (err, respones, body) {
            console.log("*********************************************")
            if (!err) {
                console.log(body);
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, cashInProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, cashInProcessed);
                }

            } else {
                console.log(err.message);
                return callback(1, err.message, cashInProcessed);
            }

        }
    );
}

function cashOut(token, amount, debitorSOF, creditorSOF, customerNo, callback) {

    var options = {
        min: 100000
        , max:  1000000
        , integer: true
    }
    var requestID = rn(options);
    const cashOutHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
    var cashOutBody = {
        "amount": amount,
        "currencyId": 2,
        "beneficiary": {
            "Type": 1,
            "Identifier": customerNo
        },
        "debitedBalanceId": debitorSOF,
        "creditedBalanceId": creditorSOF,
        "comment": "",
        "RequestId": requestID
    };

    var cashOutProcessed = prepareBody(cashOutBody);
    request.post(
        {
            headers: cashOutHeader,
            //url: baseURL + cashOutEndPoint,
            url:"http://100.0.0.108:3150/cash-w/cashOut",
            body: cashOutProcessed,
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
                    return callback(statsCode, json_tok, cashOutProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, cashOutProcessed);
                }

            } else {
                return callback(1, err.message, cashOutProcessed);
            }

        }
    );
}

function cashOutConfirmF(token, humanTaskID, OTP, callback) {

    var options = {
        min: 100000
        , max:  1000000
        , integer: true
    }
    var requestID = rn(options);
    const cashOutConfirmHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
    var cashOutConfirmBody = {
        "humanTaskId": humanTaskID,
        "confirmationPinCode": OTP,
        "comment": "",
        "RequestId": requestID
    };

    var cashOutConfirmProcessed = prepareBody(cashOutConfirmBody);
    request.post(
        {
            headers: cashOutConfirmHeader,
            //url: baseURL + cashOutConfirm,
            url:"http://100.0.0.108:3150/cash-w/cashOutC",
            body: cashOutConfirmProcessed,
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
                    return callback(statsCode, json_tok, cashOutConfirmProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, cashOutConfirmProcessed);
                }

            } else {
                return callback(1, err.message, cashOutConfirmProcessed);
            }

        }
    );
}






function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}


async function findQResponse(req, serivceType) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
        await newApiRequest.insertData.find({
            mobile_no: req.process_info.customerMobile, service_name: req.service_info.service_name,
            service_type: serivceType, username: req.service_info.username
        }, (err, apiData) => {
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
        await newApiRequest.insertData.find({ rem_no: "last token", service_name: serviceName }, (err, apiData) => {
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

function writeGeneralErrorXmlFile(error, ServerData) {

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

function writeCashInQXmlFile(response, amount, ServerData) {

    var name = response.TargetName;


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
       <Amount>${amount}</Amount>
       <Cust_Name>${name}</Cust_Name>
      </CASHIN_Q_Response>
    </ns:CASHIN_Q>
    </env:Body>
    </env:Envelope>`
}


function writeCashInPXmlFile(response, ServerData) {

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
<CASHIN_P_Response>
<transaction_id>${t_id}</transaction_id>
</CASHIN_P_Response>
</ns:CASHIN_P>
</env:Body>
</env:Envelope>`
}

function writeCashOutQXmlFile(response, ServerData) {

    var name = response.receipt.debited.actorPreferredIdentifier;
    var fee_Amount = response.receipt.amount;

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
<Fee_Amount>${fee_Amount}</Fee_Amount>
<Cust_Name>${name}</Cust_Name>
</CASHOUT_Q_Response>
</ns:CASHOUT_Q>
</env:Body>
</env:Envelope>`
}



function writeCashOutPXmlFile(response, ServerData) {

    var t_id = response.receipt.operationId;
    var commission = response.receipt.tfcList[0].amount;
    //var commission_currency = response.receipt.tfcList.currencyId;

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
<commission>${commission}</commission>
<comm_ccy>2</comm_ccy>
</CASHOUT_P_Response>
</ns:CASHOUT_P>
</env:Body>
</env:Envelope>`
}

function reigonError(ServerData) {

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