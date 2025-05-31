const request = require("request");
const fs = require('fs')
var randtoken = require('rand-token').generator({
    chars: 'base32'
});
const baseUrl = "https://agent.tejaripay.com/YCBAPI/resources/YCBAPI/";
const agentLogin = "AgentLogin";
const paidRemit = "paidRemit";
const queryRemittanceM = "agentRequest";
const username = 'authuser';
const password = 'b49e01336117ddb6fc6d9e';
const userID = 'nomanAPI';
const userpass = 'nomanApi_2021';
const content_type = 'application/json';
const authorization = 'Basic ' + toBase64();
const agentLoginHeader = {
    "Authorization": authorization,
    "Content-Type": content_type
};
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var Res_Code;
var resultOfSavingToDB;
var region;
var branchID;


function tejaryiPay_server(req, callback) {
    console.log(req)
    console.log('********************************************************')
     region = req.rem_info.region;
     branchID = req.service_info.agent_or_Branch_Code ;

     
    if ((req.service_info.service_type).toUpperCase() == 'Q_REM') {
        getApiKey(function (status, response, bodyRequestQueryApi) {
            if (status == 200) {
                if (response.Status == "1") {
                    var apiKeyGotten = response.sessionKey;
                    var remitNo = req.rem_info.rem_no;
                    var tokenBodyResponse = response;
                    console.log("Remitt no is:")
                    console.log(remitNo)
                    queryRemittance(apiKeyGotten, remitNo, function (status, response, bodyRequestQuery) {
                        if (status == 200) {
                            if (response[0].ResCode == 1) {
                                if(response[0].DeliverStatus.toUpperCase()=="PAID"){
                                    Res_Code = response[0].ResCode;
                                    var resData = writePaidErrorXmlFile(no_server_error);
    
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: req.rem_info.rem_no,
                                            transaction_id: response[0].TransKey,
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodyRequestQuery,
                                            responesData: JSON.stringify(response[0]),
                                            tokenBody: JSON.stringify(tokenBodyResponse),
                                            Amounts: response[0].RemittanceAmount,
                                            FirstName: response[0].ReceiverName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: resData,
                                            Request: JSON.stringify(req),
                                        });
                                    console.log(newData);
    
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            console.log('record was added');
                                            callback(resData)
                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            Res_Code = response[0].ResCode;
                                            var callbackResponse = writePaidErrorXmlFile(database_error);
                                            callback(callbackResponse)
                                        }
                                    });
                                } else {
                                    
                                Res_Code = response[0].ResCode;
                                var resData = writeCashOutQXmlFile(response[0], no_server_error);

                                let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: req.rem_info.rem_no,
                                        transaction_id: response[0].TransKey,
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: bodyRequestQuery,
                                        responesData: JSON.stringify(response[0]),
                                        tokenBody: JSON.stringify(tokenBodyResponse),
                                        Amounts: response[0].RemittanceAmount,
                                        FirstName: response[0].ReceiverName,
                                        SecondName: "",
                                        ThirdName: "",
                                        LastName: "",
                                        CustID: "",
                                        qRespones: resData,
                                        Request: JSON.stringify(req),
                                    });
                                console.log(newData);

                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        callback(resData)
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        Res_Code = response[0].ResCode;
                                        var callbackResponse = writeCashOutQXmlFile(response[0], database_error);
                                        callback(callbackResponse)
                                    }
                                });
                                }




                            } else {

                                Res_Code = response[0].ResCode;
                                var resData = writeGeneralErrorXmlFile("Q_ReciveRem", response[0].ResMsg, no_server_error);
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
                                        requestData: bodyRequestQuery,
                                        responesData: JSON.stringify(response[0]),
                                        tokenBody: JSON.stringify(tokenBodyResponse),
                                        Amounts: "",
                                        FirstName: "",
                                        SecondName: "",
                                        ThirdName: "",
                                        LastName: "",
                                        CustID: "",
                                        qRespones: resData,
                                        Request: JSON.stringify(req),
                                    });
                                console.log(newData);

                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        callback(resData)
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        Res_Code = response[0].ResCode;
                                        var callbackResponse = writeCashOutQXmlFile(response[0], database_error);

                                        callback(callbackResponse)
                                    }
                                });

                            }
                        } else {

                            Res_Code = -5;
                            var resData = writeGeneralErrorXmlFile("Q_ReciveRem", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", no_server_error)


                            saveErrorsToDataBase(req, "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", resData, bodyRequestQuery, tokenBodyResponse)
                                .then(resultOfResolve => {
                                        console.log(resultOfResolve)
                                        callback(resData);
                                }).catch(resultOfReject => {
                                    console.log(resultOfReject)
                                    var callbackResponse = writeGeneralErrorXmlFile("Q_ReciveRem", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", database_error)
                                    callback(callbackResponse);
                                });
                        }
                    });
                } else if (response.Status == "0") {
                    Res_Code = response.Status;
                    var resData = writeApiLoginErrorXmlFile("Q_ReciveRem", response, no_server_error)
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
                            requestData: bodyRequestQueryApi,
                            responesData: JSON.stringify(response),
                            tokenBody: JSON.stringify(tokenBodyResponse),
                            Amounts: "",
                            FirstName: "",
                            SecondName: "",
                            ThirdName: "",
                            LastName: "",
                            CustID: "",
                            qRespones: resData,
                            Request: JSON.stringify(req),
                        });
                    console.log(newData);


                    newData.save((err, doc) => {
                        if (!err) {


                            console.log('record was added');
                            callback(resData);
                        }
                        else {
                            console.log("DataBase")
                            console.log(err);
                            Res_Code = response.Status;
                            var callbackResponse = writeApiLoginErrorXmlFile("Q_ReciveRem", response, database_error)
                            callback(callbackResponse)
                        }
                    });


                }
            } else {

                Res_Code = -5;
                var resData = writeGeneralErrorXmlFile("Q_ReciveRem", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", no_server_error)

                saveErrorsToDataBase(req, "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", resData, bodyRequestQueryApi, "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة")
                    .then(resultOfResolve => {
                        console.log(resultOfResolve)
                            callback(resData);

                    }).catch(resultOfReject => {
                        console.log(resultOfReject)
                        var callbackResponse = writeGeneralErrorXmlFile("Q_ReciveRem", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", database_error)
                        callback(callbackResponse);
                    });

            }
        });

    } else if ((req.service_info.service_type).toUpperCase() == 'P_REM') {


        getApiKey(function (status, response, bodyRequestQueryApi) {
            if (status == 200) {
                if (response.Status == "1") {
                    var tokenBodyResponse = response;
                    var apiKeyGotten = response.sessionKey;
                    var remitNo = req.rem_info.rem_no;
                    var idType = req.rem_info.IDType;
                    var idNumber = req.rem_info.IDNumber;
                    var issueDate = req.rem_info.IssueDate;
                    var expDate = req.rem_info.ExpDate;
                    var issuePlace = req.rem_info.IssuePlace;
                    var benfMobile = req.rem_info.BenfMobile;

                    payRemittance(apiKeyGotten, remitNo, idType, idNumber, issueDate, expDate, issuePlace, benfMobile, function (status, response, bodyRequest) {
                        if (status == 200) {

                            if (response.result == 1) {

                                findQResponse(remitNo).then(valueRecevied => {
                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                    console.log(valueRecevied)
                                    Res_Code = response.result;
                                    var resXmlData = writeCashOutPXmlFile(response, no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: remitNo,
                                            transaction_id: valueRecevied.transaction_id,
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodyRequest,
                                            responesData: JSON.stringify(response),
                                            tokenBody: JSON.stringify(tokenBodyResponse),
                                            Amounts: valueRecevied.Amounts,
                                            FirstName: valueRecevied.FirstName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: valueRecevied.qRespones,
                                            pRespones: resXmlData,
                                            Request: JSON.stringify(req),
                                            remStatus: "1"
                                        });
                                    console.log(newData)
                                    // console.log(Qrespons+'55555555555555555555555555555555555555');
                                    var object_id;
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            // object_id=doc['_id'];
                                            // respones['AccountNo']=object_id;
                                            //  console.log(object_id)
                                            console.log('record was added');
                                            callback(resXmlData);

                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            Res_Code = response.result;
                                            var callbackResponse = writeCashOutPXmlFile(response, database_error);
                                            callback(callbackResponse);
                                        }

                                    });
                                }).catch(valueRecevied => {
                                    Res_Code = response.result;
                                    var resXmlData = writeCashOutPXmlFile(response, no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: remitNo,
                                            transaction_id: valueRecevied.transaction_id,
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodyRequest,
                                            responesData: JSON.stringify(response),
                                            tokenBody: JSON.stringify(tokenBodyResponse),
                                            Amounts: valueRecevied.Amounts,
                                            FirstName: valueRecevied.FirstName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: "",
                                            pRespones: resXmlData,
                                            Request: JSON.stringify(req),
                                            remStatus: "1"
                                        });
                                    console.log(newData)
                                    // console.log(Qrespons+'55555555555555555555555555555555555555');
                                    var object_id;
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            // object_id=doc['_id'];
                                            // respones['AccountNo']=object_id;
                                            //  console.log(object_id)
                                            console.log('record was added');
                                            callback(resXmlData);

                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            Res_Code = response.result;
                                            var callbackResponse = writeCashOutPXmlFile(response, database_error);
                                            callback(callbackResponse);
                                        }

                                    });
                                });



                            } else {

                                findQResponse(remitNo).then(valueRecevied => {
                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
                                    console.log(valueRecevied)
                                    Res_Code = response.result;
                                    var resXmlData = writeCashOutPXmlFile(response, no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: remitNo,
                                            transaction_id: valueRecevied.transaction_id,
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodyRequest,
                                            responesData: JSON.stringify(response),
                                            tokenBody: JSON.stringify(tokenBodyResponse),
                                            Amounts: valueRecevied.Amounts,
                                            FirstName: valueRecevied.FirstName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: valueRecevied.qRespones,
                                            pRespones: resXmlData,
                                            Request: JSON.stringify(req),
                                            remStatus: ""
                                        });
                                    console.log(newData)
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            console.log('record was added');
                                            callback(resXmlData);

                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            Res_Code = response.result;
                                            var callbackResponse = writeCashOutPXmlFile(response, database_error);
                                            callback(callbackResponse);
                                        }

                                    });
                                }).catch(valueRecevied => {
                                    Res_Code = response.result;
                                    var resXmlData = writeCashOutPXmlFile(response, no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: remitNo,
                                            transaction_id: valueRecevied.transaction_id,
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodyRequest,
                                            responesData: JSON.stringify(response),
                                            tokenBody: JSON.stringify(tokenBodyResponse),
                                            Amounts: valueRecevied.Amounts,
                                            FirstName: valueRecevied.FirstName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: "",
                                            pRespones: resXmlData,
                                            Request: JSON.stringify(req),
                                            remStatus: ""
                                        });
                                    console.log(newData)
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            console.log('record was added');
                                            callback(resXmlData);

                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            Res_Code = response.result;
                                            var callbackResponse = writeCashOutPXmlFile(response, database_error);
                                            callback(callbackResponse);
                                        }

                                    });

                                });


                            }
                        } else {

                            Res_Code = -5;
                            var resData = writeGeneralErrorXmlFile("PaymentRem_respons", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", no_server_error)


                            saveErrorsToDataBase(req, "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", resData, bodyRequest, tokenBodyResponse)
                                .then(resultOfResolve => {
                                    console.log(resultOfResolve)
                                    callback(resData);

                                }).catch(resultOfReject => {
                                    console.log(resultOfReject)
                                    var callbackResponse = writeGeneralErrorXmlFile("PaymentRem_respons", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", database_error)
                                    callback(callbackResponse);
                                });

                        }
                    });
                } else if (response.Status == "0") {
                    Res_Code = response.Status;
                    var resData = writeApiLoginErrorXmlFile("PaymentRem_respons", response, no_server_error)
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
                            requestData: bodyRequestQueryApi,
                            responesData: JSON.stringify(response),
                            tokenBody: JSON.stringify(tokenBodyResponse),
                            Amounts: "",
                            FirstName: "",
                            SecondName: "",
                            ThirdName: "",
                            LastName: "",
                            CustID: "",
                            qRespones: resData,
                            Request: JSON.stringify(req),
                        });
                    console.log(newData);


                    newData.save((err, doc) => {
                        if (!err) {


                            console.log('record was added');
                            callback(resData);
                        }
                        else {
                            console.log("DataBase")
                            console.log(err);
                            Res_Code = response.Status;;
                            var callbackResponse = writeApiLoginErrorXmlFile("PaymentRem_respons", response, database_error)
                            callback(callbackResponse)
                        }
                    });


                }
            } else {

                Res_Code = -5;
                var resData = writeGeneralErrorXmlFile("PaymentRem_respons", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", no_server_error)


                saveErrorsToDataBase(req, "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", resData, bodyRequestQueryApi, "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة")
                    .then(resultOfResolve => {
                        console.log(resultOfResolve)
                            callback(resData);
                    }).catch(resultOfReject => {
                        console.log(resultOfReject)
                        var callbackResponse = writeGeneralErrorXmlFile("PaymentRem_respons", "خطأ في الاتصال بالخدمة الرجاء  إعادة المحاولة", database_error)
                        callback(callbackResponse);
                    });

            }
        });

    }

}


module.exports.tejaryiPay_server = tejaryiPay_server;


function getApiKey(callback) {
    var p_key = randtoken.generate(6);

    var agentLoginBody = {
        "userId": userID,
        "userPass": userpass,
        "P_KEY": p_key,
    };

    var bodyAgentLogin = prepareBody(agentLoginBody);

    request.post(
        {
            headers: agentLoginHeader,
            url: baseUrl + agentLogin,
            body: bodyAgentLogin,
            method: 'POST',
            agentOptions:{
                // ca:fs.readFileSync("C:/server test/alnoamanServerApi Maintenance -21-02-2021/node_server_API_servcis/API_COMP/YCB/tejaripay-com-chain.pem")
            }
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, bodyAgentLogin);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, errorResponse);
                }
            } else {
                return callback(1, err);
            }

        }
    );
}



function queryRemittance(apiKey, remitCode, callback) {

    const queryRemittanceHeader = {
        "Authorization": authorization,
        "Content-Type": content_type,
        "ApiKey": apiKey
    };

    var queryRemittanceBody = {
        "reqType": "1",
        "RemitCode": remitCode,
        "userId": userID
    };

    var bodyRequest = prepareBody(queryRemittanceBody);

    request.post(
        {
            headers: queryRemittanceHeader,
            url: "http://100.0.0.108:3150/tejary/query",
            body: bodyRequest,
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
                    return callback(statsCode, json_tok, bodyRequest);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, errorResponse);
                }
            } else {
                return callback(1, err);
            }

        }
    );

}

function payRemittance(apiKey, remitNo, idType, idNumber, issueDate, expDate, issuePlace, benfMobile, callback) {

    const payRemittanceHeader = {
        "Authorization": authorization,
        "Content-Type": content_type,
        "ApiKey": apiKey
    };

    var payRemittanceBody = {
        "UserID": userID,
        "P_REQ_CODE": remitNo,
        "ReqType": 1,
        "IDTYPE": idType,
        "IDNUMBER": idNumber,
        "ISSUE_DATE": issueDate,
        "EXP_DATE": expDate,
        "ISSUE_PLACE": issuePlace,
        "P_BEN_MOBILE": benfMobile,
        "P_SERVICE_CODE": 1
    };

    var bodyRequest = prepareBody(payRemittanceBody);

    request.post(
        {
            headers: payRemittanceHeader,
            url: "http://100.0.0.108:3150/tejary/pay",
            body: bodyRequest,
            method: 'POST'
        },
        function (err, respones, body) {
            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, bodyRequest);

                } catch (error) {
                    var errorResponse = new Object;
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, errorResponse);
                }
            } else {
                return callback(1, err);
            }

        }
    );

}

function writeCashOutPXmlFile(responesData, ServerData) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:PaymentRem_respons>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>${responesData.result}</code_API>
         <msg_API>${responesData.stMsg}</msg_API>
      </msg_info_API>
    </ns:PaymentRem_respons>
    </env:Body>
    </env:Envelope>`
}


function writeApiLoginErrorXmlFile(service, responesData, ServerData) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:${service}>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>${responesData.Status}</code_API>
         <msg_API>${responesData.Msg}</msg_API>
      </msg_info_API>
    </ns:${service}>
    </env:Body>
    </env:Envelope>`
}

function writeCashOutQXmlFile(responesData, ServerData) {

    var theNumber = responesData.TheNumber;
    var remittanceAmount = responesData.RemittanceAmount;
    var remittanceCurrency = responesData.RemittanceCurrencyName;
    var RegionId = responesData.RegionId;
    var ReceiverName = responesData.ReceiverName;
    var SenderName = responesData.SenderName;
    var toCityName = responesData.toCityName;
    var DeliverStatus = responesData.DeliverStatus;
    var status = responesData.status;
    var ServiceCode = responesData.ServiceCode;
    var DeliverVia = responesData.DeliverVia;
    var RemitType = responesData.RemitType;
    var ExtraComm = responesData.ExtraComm;
    var MsgReciver = responesData.MsgReciver;
    var USERID = responesData.USERID;
    var SenderPhone = responesData.SenderPhone;
    var TheDate = responesData.TheDate;
    var ReceiverPhone = responesData.ReceiverPhone;
    var SoucrceName = responesData.SoucrceName;
    var TheTarget = responesData.TheTarget;
    var Notes = responesData.Notes;
    var ExchangerAccountAmount = responesData.ExchangerAccountAmount;
    var ExchangerAccountCurrencyName = responesData.ExchangerAccountCurrencyName;
    var RemittancePurpose = responesData.RemittancePurpose;
    var CommissionCurrency = responesData.CommissionCurrency;
    var AgentCommission = responesData.AgentCommission;
    var PublicNumber = responesData.PublicNumber;
    var TransKey = responesData.TransKey;


   if (remittanceCurrency == "ريال يمني"){
       console.log(remittanceCurrency);
    if (region != RegionId)
    {
        Res_Code = 200;
    }
   }
  
   if (RegionId == '2' && remittanceCurrency == "ريال يمني" )
   {
    remittanceCurrency = "ريال يمني جديد";
   }
 console.log('remittanceCurrency  = '+remittanceCurrency);
 console.log('branchID : '+branchID);
 if (branchID =='10004'&& remittanceCurrency == "دولار امريكي" )
 {
 
     remittanceCurrency = 'دولار امريكي ازرق';
 }
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
        <code_API>${Res_Code}</code_API>
         <msg_API>${responesData.ResMsg}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${PublicNumber=== undefined ? '' :PublicNumber}</rem_no>
        <trans_key>${TransKey === undefined ? '' :TransKey}</trans_key>
        <region_id>${RegionId === undefined ? '' :RegionId}</region_id>
        <to_city>${toCityName === undefined ? '' :toCityName }</to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${remittanceAmount === undefined ? '' :remittanceAmount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${remittanceCurrency === undefined ? '' :remittanceCurrency}</payout_cuyc>
        <payout_com>${AgentCommission === undefined ? '' :AgentCommission}</payout_com>
        <payout_extra_com>${ExtraComm === undefined ? '' :ExtraComm }</payout_extra_com>
        <payout_com_cuyc>${CommissionCurrency=== undefined ? '' :CommissionCurrency}</payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount></payout_settlement_amount>
        <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
        <rem_status>${status === undefined ? '' :status}</rem_status>
        <rem_type>${DeliverStatus === undefined ? '' :DeliverStatus}</rem_type>
        <sending_coyc>${SoucrceName === undefined ? '' :SoucrceName}</sending_coyc>
        <destenation_coyc>${TheTarget === undefined ? '' : TheTarget}</destenation_coyc>
        <user_note>${Notes  === undefined ? '' : Notes}</user_note>
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
        <exchanger_account_amount>${ExchangerAccountAmount === undefined ? '' : ExchangerAccountAmount}</exchanger_account_amount>
        <exchanger_account_currency_name>${ExchangerAccountCurrencyName === undefined ? '' : ExchangerAccountCurrencyName}</exchanger_account_currency_name>
        <user_id>${USERID === undefined ? '' : USERID}</user_id>
        <branch_code></branch_code>
        <recive_bank_code></recive_bank_code>
  </bank_info>
  <others>
        <sending_reason>${RemittancePurpose === undefined ? '' : RemittancePurpose}</sending_reason>
        <deliver_via>${DeliverVia  === undefined ? '' : DeliverVia}</deliver_via>
        <note>${MsgReciver === undefined ? '' : MsgReciver}</note>
        <the_number>${theNumber === undefined ? '' : theNumber}</the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`;

}

function writeGeneralErrorXmlFile(service, responesData, ServerData) {

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:${service}>
      <msg_info_server>
       <code_serv>${ServerData.code}</code_serv>
       <msg_serv>${ServerData.massege}</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>${Res_Code}</code_API>
         <msg_API>${responesData}</msg_API>
      </msg_info_API>
    </ns:${service}>
    </env:Body>
    </env:Envelope>`
} 

function writePaidErrorXmlFile(ServerData) {

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
        <code_API>55</code_API>
         <msg_API>الحوالة مصروفة</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
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



function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}

function toBase64() {
    var authBase64 = `${username + ":" + password}`;
    var base64String = new Buffer.from(authBase64).toString("base64");
    return base64String;
}


async function saveErrorsToDataBase(request, erroResponse, responseToInernalSystem, bodyRequest, tokenBodyResponse) {

    let newData = new newApiRequest.insertData(
        {
            rem_no: request.rem_info.rem_no,
            transaction_id: "",
            service_name: request.service_info.service_name,
            service_type: request.service_info.service_type,
            system_name: request.service_info.system_name,
            username: request.service_info.username,
            agent_code: request.service_info.agent_or_Branch_Code,
            agent_name: request.service_info.agent_or_Branch_name,
            date: Date.now(),
            requestData: bodyRequest,
            responesData: erroResponse,
            tokenBody: JSON.stringify(tokenBodyResponse),
            Amounts: "",
            FirstName: "",
            SecondName: "",
            ThirdName: "",
            LastName: "",
            CustID: "",
            qRespones: responseToInernalSystem,
            Request: JSON.stringify(request),
        });
    console.log(newData);


    return new Promise(async (resolve,reject)=>{
        await newData.save( (err, doc) => {
          
          if (!err) {
            console.log('record was added');
            resultOfSavingToDB = 1;
            console.log('inside record')
            console.log(resultOfSavingToDB);
            resolve(resultOfSavingToDB);    
          }
          else {
            console.log("DataBase")
            console.log(err);
            resultOfSavingToDB = 0;
            reject(resultOfSavingToDB);
          }
          });
       });
}

function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
    return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;
  
  }
  
  
  function writeErrorLog(opNo,user,service,type,error){
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
  }
  