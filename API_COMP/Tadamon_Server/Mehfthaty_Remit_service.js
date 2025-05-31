const request = require("request");
const { parentPort, workerData } = require('worker_threads')
const xml2js = require('xml2js');
var parser = new xml2js.Parser({ explicitArray: false });
const agentApiRequestUrl = "https://agentapi.tadhamonbank.com/AgentWs/resources/Agent/agentApiRequest";
const agentApiConfirmRequestUrl = "https://agentapi.tadhamonbank.com/AgentWs/resources/Agent/agentApiConfirmRequest";
const usernameN = "alnoaman-API-1";
const usernameS = "alnoaman-API-2";
const passsword = "AlnoamanApi@123+";
const trans_type = "paidRemit";
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var transactionRemit_id;


parser.parseString(workerData , function(err, result){
    var req = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
    if ((req.service_info.service_type).toUpperCase() == 'Q_REM') {                                                                                                    

        var remit_No = req.rem_info.rem_no;
        var region = req.rem_info.region;
        remitRequest(remit_No, region, function (status, response, bodyRequest) {
            if ('error' in response) {
                console.log(response.error);
                var resData = writeGeneralErrorXmlFile("Q_ReciveRem", -5, status==1?"حصل خطأ في الاتصال بسيرفر الخدمة": response.error, no_server_error);
                saveErrorsToDataBase(req, response.error, resData, bodyRequest).then(value => {
                    console.log(value)
                    callback(resData);
                }
                ).catch(value => {
                    console.log(value)
                    var callbackResponse = writeGeneralErrorXmlFile("Q_ReciveRem", -5, response.error, database_error);
                    callback(callbackResponse);
                }
                );
            } else {
                if (status == 200) {
                    if (response.errCode == "0"&& response.region==region) {
                        transactionRemit_id = response.transNo;
                        var resData = writeCashOutQxml(response, no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: remit_No,
                                transaction_id: response.transNo,
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodyRequest,
                                responesData: JSON.stringify(response),
                                Amounts: response.amount,
                                FirstName: response.rec_name,
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: resData,
                                Request: JSON.stringify(req),
                            });
                        console.log(newData);
                        var finalResp = {
                            "sts":0,
                            "result":resData
                        }
                        parentPort.postMessage(finalResp);
                        // newData.save(async (err, doc) => {
                        //     if (!err) {
                        //         console.log('record was added');
                        //         var finalResp = {
                        //             "sts":1,
                        //             "result":resData
                        //         }
                        //         parentPort.postMessage(finalResp);
                                
                        //     }
                        //     else {
                        //         console.log("DataBase")
                        //         console.log(err);
                        //         var callbackResponse = writeCashOutQxml(response, database_error);
                        //         callback(callbackResponse)
                        //     }
                        // });
                    } else {
                        var resData = writeErrorXmlFile("Q_ReciveRem", response, no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: remit_No,
                                transaction_id: response.transNo,
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodyRequest,
                                responesData: JSON.stringify(response),
                                Amounts: response.amount,
                                FirstName: response.rec_name,
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
                                var callbackResponse = writeErrorXmlFile("Q_ReciveRem", response, database_error);
                                callback(callbackResponse)
                            }
                        });
                    }
                }else {
                    var resData = writeGeneralErrorXmlFile("Q_ReciveRem", -5, "خطأ بالاتصال يرجى إعادة المحاولة", no_server_error);
                    saveErrorsToDataBase(req, "خطأ بالاتصال يرجى إعادة المحاولة", resData, bodyRequest).then(value => {
                        console.log(value)
                        callback(resData);
                    }
                    ).catch(value => {
                        console.log(value)
                        var callbackResponse = writeGeneralErrorXmlFile("Q_ReciveRem", -5, "خطأ بالاتصال يرجى إعادة المحاولة", database_error);
                        callback(callbackResponse);
                    }
                    );
                }
            }
        });

    } else if ((req.service_info.service_type).toUpperCase() == 'P_REM') {
        var remit_No = req.rem_info.rem_no;
        var trans_No = req.rem_info.transNO;
        var region = req.rem_info.region;
        remitConfirmRequest(trans_No, region, function (status, response, bodyRequest) {
            if ('error' in response) {
                console.log(response.error);
                console.log(response.error);
                var resData = writeGeneralErrorXmlFile("PaymentRem_respons", -5, status==1?"حصل خطأ في الاتصال بسيرفر الخدمة": response.error, no_server_error);
                saveErrorsToDataBase(req, response.error, resData, bodyRequest).then(value => {
                    console.log(value)
                    callback(resData);
                }
                ).catch(value => {
                    console.log(value)
                    var callbackResponse = writeGeneralErrorXmlFile("PaymentRem_respons", -5, response.error, database_error);
                    callback(callbackResponse);
                }
                );
            } else {
                if (status == 200) {
                    if(response.errCode==0 && response.region==region){
                        findQResponse(remit_No).then(value => {
                            var resData = writeCashOutPxml(response, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.transNo,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: bodyRequest,
                                    responesData: JSON.stringify(response),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: value,
                                    pRespones: resData,
                                    Request: JSON.stringify(req),
                                    remStatus: response.errCode == "0" ? "1" : ""
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
                                    var callbackResponse = writeCashOutPxml(response, database_error);
                                    callback(callbackResponse)
                                }
                            });
                        }).catch(value => {
                            var resData = writeCashOutPxml(response, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.transNo,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: bodyRequest,
                                    responesData: JSON.stringify(response),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: "",
                                    pRespones: resData,
                                    Request: JSON.stringify(req),
                                    remStatus: response.errCode == "0" ? "1" : ""
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
                                    var callbackResponse = writeCashOutPxml(response, database_error);
                                    callback(callbackResponse)
                                }
                            });
                        });
                    } else {
                        findQResponse(remit_No).then(value => {
                            var resData = writeGeneralErrorXmlFile('PaymentRem_respons',response.errCode, response.errDesc, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.transNo,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: bodyRequest,
                                    responesData: JSON.stringify(response),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: value,
                                    pRespones: resData,
                                    Request: JSON.stringify(req),
                                    remStatus: response.errCode == "0" ? "1" : ""
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
                                    var callbackResponse = writeGeneralErrorXmlFile('PaymentRem_respons',response.errCode, response.errDesc, database_error);
                                    callback(callbackResponse)
                                }
                            });
                        }).catch(value => {
                            var resData = writeGeneralErrorXmlFile('PaymentRem_respons',response.errCode, response.errDesc, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.transNo,
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: bodyRequest,
                                    responesData: JSON.stringify(response),
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                    qRespones: "",
                                    pRespones: resData,
                                    Request: JSON.stringify(req),
                                    remStatus: response.errCode == "0" ? "1" : ""
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
                                    var callbackResponse = writeGeneralErrorXmlFile('PaymentRem_respons',response.errCode, response.errDesc, database_error);
                                    callback(callbackResponse)
                                }
                            });
                        });
                    }

                } else {
                    var resData = writeGeneralErrorXmlFile("PaymentRem_respons", -5, "خطأ بالاتصال يرجى إعادة المحاولة", no_server_error);
                    saveErrorsToDataBase(req, "خطأ بالاتصال يرجى إعادة المحاولة", resData, bodyRequest).then(value => {
                        console.log(value)
                        callback(resData);
                    }
                    ).catch(value => {
                        console.log(value)
                        var callbackResponse = writeGeneralErrorXmlFile("PaymentRem_respons", -5, "خطأ بالاتصال يرجى إعادة المحاولة", database_error);
                        callback(callbackResponse);
                    }
                    );
                }
            }
        });
    }
})







function remitRequest(remit_no, region, callback) {

    var remitRequestBody = {
        "userName": region==1?usernameN:usernameS,
        "password": passsword,
        "remit_no": remit_no,
        "trans_type": trans_type
    }
    console.log("***************************************************************");
    console.log("Remit Request");
    console.log(remitRequestBody);
    console.log("***************************************************************");
    var bodyRequest = prepareBody(remitRequestBody);

    request.post(
        {
            url: "http://100.0.0.108:3150/mehfthaty-remit/query",
            body: bodyRequest,
            method: 'POST'
        },
        function (err, respones, body) {
            console.log(err);
            if (!err) {
                try {
                    var json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    return callback(statsCode, json_tok, bodyRequest);

                } catch (error) {
                    console.log('error' + error.message);
                    var respons_err =
                    {
                        'error': error.message,
                        "status": respones.statusCode,
                        "body": body
                    };
                    return callback(respones.statusCode, respons_err, bodyRequest);
                }
            } else {
                var respons_err =
                {
                    'error': err.message,
                };
                return callback(1, respons_err, bodyRequest);
            }


        }
    );

}


function remitConfirmRequest(trans_ID, region, callback)  {
    console.log(region);
    var remitConfirmRequestBody = {
        "userName": region==1?usernameN:usernameS,
        "password": passsword,
        "transId": trans_ID,
        "trans_type": trans_type
    }
    console.log("***************************************************************");
    console.log("Remit Confirm Request");
    console.log(remitConfirmRequestBody);
    console.log("***************************************************************");
    var bodyRequest = prepareBody(remitConfirmRequestBody);

    request.post(
        {
            url: "http://100.0.0.108:3150/mehfthaty-remit/pay",
            body: bodyRequest,
            method: 'POST'
        },
        function (err, respones, body) {
            if (!err) {
                try {
                    var json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    return callback(statsCode, json_tok, bodyRequest);

                } catch (error) {
                    console.log('error' + error.message);
                    var respons_err =
                    {
                        'error': error.message,
                        "status": respones.statusCode,
                        "body": body
                    };
                    return callback(respones.statusCode, respons_err, bodyRequest);
                }
            } else {
                var respons_err =
                {
                    'error': err.message,
                };
                return callback(1, respons_err, bodyRequest);
            }


        }
    );

}

function prepareBody(bodyRecivied) {
    return JSON.stringify(bodyRecivied);
}

function findQResponse(number) {

    var Qrespons;
    return new Promise(async (resolve, reject) => {
        await newApiRequest.insertData.find({ rem_no: number }, (err, apiData) => {
            try {
                if (apiData[apiData.length - 1].qRespones === undefined) {
                    Qrespons = '';
                    console.log("Qresponse is : undefined");
                    reject(Qrespons);
                }
                else {
                    Qrespons = apiData[apiData.length - 1].qRespones;
                    console.log("Qresponse is : " + Qrespons);
                    resolve(Qrespons);
                }

            } catch (error) {
                Qrespons = '';
                console.log("Qresponse is : blank");
                reject(Qrespons);

            }

        });
    })


}

function saveErrorsToDataBase(request, erroResponse, responseToInernalSystem, bodyRequest) {

    let newData = new newApiRequest.insertData(
        {
            rem_no: request.rem_info.remit_no,
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



    return new Promise(async (resolve, reject) => {
        await newData.save((err, doc) => {

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

function writeErrorXmlFile(service, responesData, ServerData) {

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
        <code_API>${responesData.errCode}1</code_API>
         <msg_API>${responesData.errDesc}لا يمكن اكمال العملية لاختلاف المنطقة</msg_API>
      </msg_info_API>
    </ns:${service}>
    </env:Body>
    </env:Envelope>`
}

function writeGeneralErrorXmlFile(service, resCode, resDesc, ServerData) {

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
        <code_API>${resCode}</code_API>
         <msg_API>${resDesc}</msg_API>
      </msg_info_API>
    </ns:${service}>
    </env:Body>
    </env:Envelope>`
}

function writeCashOutQxml(responesData, ServerData) {
    
    var remittanceCurrency ;
    var RegionId = responesData.region;

  
     if ( RegionId == '1' )
     {
        remittanceCurrency = "1";
     }
    else
    {
        remittanceCurrency = "199";
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
        <code_API>${responesData.errCode}</code_API>
         <msg_API>${responesData.errDesc}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${responesData.remit_no}</rem_no>
        <trans_key>${responesData.transNo}</trans_key>
        <region_id></region_id>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${responesData.amount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${remittanceCurrency}</payout_cuyc>
        <payout_com>${responesData.commission/*0.5*/}</payout_com>
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
        <full_name>${responesData.sender_name}</full_name>
        <telephone></telephone>
        <mobile>${responesData.sender_mobile}</mobile>
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
        <full_name>${responesData.rec_name}</full_name>
        <telephone></telephone>
        <mobile></mobile>
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

function writeCashOutPxml(responesData, ServerData) {

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
        <code_API>${responesData.errCode}</code_API>
         <msg_API>${responesData.errDesc}</msg_API>
      </msg_info_API>
      <rem_info>
       <trans_key>${responesData.transNo}</trans_key>
      </rem_info>
    </ns:PaymentRem_respons>
    </env:Body>
    </env:Envelope>`
}