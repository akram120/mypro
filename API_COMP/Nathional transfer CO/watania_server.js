const request = require("request");
const fs = require('fs');
const queryRemittanceURL= "https://ycash.humanitariantransfers.org/ords/ycash/remittances_live/query";
const payoutRemittanceURL= "https://ycash.humanitariantransfers.org/ords/ycash/remittances_live/payout";
const uploadDocumentURL= "https://ycash.humanitariantransfers.org/ords/ycash/remittances_live/upload_doc";
const ClientSecret = "C467E89CF941F9E2A1ED61ED53B416F18D13128DEB49C1B5";
const content_type = 'application/json';
const Agent_ID = 7283;
var Sub_Agent_ID;
const username = "ALNOAMAN_LIVE";
const password = "NOoo0oo20224145LIV_8WFC71qyhSgVQ_oo77MAN..";
const authorization = 'Basic ' + toBase64();
const newApiRequest = require('../../db_modal/alnoamanNewModal');
const queryHeader = {
    "content-type": content_type,
    "ClientSecret": ClientSecret,
    "Authorization": authorization,
  };
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };



function Watania_Server(req, callback) {

    Sub_Agent_ID = req.service_info.agent_or_Branch_Code;
    
    if ((req.service_info.service_type).toUpperCase() == 'Q_REM') {                                                                                                    

        var remit_No = req.rem_info.rem_no;
        var region = req.rem_info.region;
        console.log(region);

        queryRemittance(remit_No, function (status, response, bodyRequest) {
            if ('error' in response) {
                console.log(response.error);
                var resData = writeGeneralErrorXmlFile("Q_ReciveRem",status==1?"حصل خطأ في الاتصال بسيرفر الخدمة": response.error, no_server_error);
                saveErrorsToDataBase(req, response.error, resData, bodyRequest).then(value => {
                    console.log(value)
                    callback(resData);
                }
                ).catch(value => {
                    console.log(value)
                    var callbackResponse = writeGeneralErrorXmlFile("Q_ReciveRem",status==1?"حصل خطأ في الاتصال بسيرفر الخدمة": response.error,database_error);
                    callback(callbackResponse);
                }
                );
            } else {
                if (status == 200) {
                    if (response.Status == "UNPaid") {
                        var resData = writeCashOutQxml(response,region, no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: remit_No,
                                transaction_id: "",
                                service_name: req.service_info.service_name,
                                service_type: req.service_info.service_type,
                                system_name: req.service_info.system_name,
                                username: req.service_info.username,
                                agent_code: req.service_info.agent_or_Branch_Code,
                                agent_name: req.service_info.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: bodyRequest,
                                responesData: JSON.stringify(response),
                                Amounts: response.Amount,
                                FirstName: response.ReceiverName,
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
                                var callbackResponse = writeCashOutQxml(response, database_error);
                                callback(callbackResponse)
                            }
                        });
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
                    var resData = writeGeneralErrorXmlFile("Q_ReciveRem","خطأ بالاتصال يرجى إعادة المحاولة", no_server_error);
                    saveErrorsToDataBase(req, "خطأ بالاتصال يرجى إعادة المحاولة", resData, bodyRequest).then(value => {
                        console.log(value)
                        callback(resData);
                    }
                    ).catch(value => {
                        console.log(value)
                        var callbackResponse = writeGeneralErrorXmlFile("Q_ReciveRem", "خطأ بالاتصال يرجى إعادة المحاولة", database_error);
                        callback(callbackResponse);
                    }
                    );
                }
            }
        });

    } else if ((req.service_info.service_type).toUpperCase() == 'P_REM') {
        var remit_No = req.rem_info.rem_no;
        var id_Number = req.rem_info.IDNumber;
        var issue_date = req.rem_info.IssueDate;
        var expiryDate = req.rem_info.ExpDate;
        var issue_place = req.rem_info.IssuePlace;
        var userID = req.service_info.username;
        payoutRemittance(remit_No,userID,id_Number,issue_date,expiryDate,issue_place,function (status, response, bodyRequest) {
            if ('error' in response) {
                console.log(response.error);
                console.log(response.error);
                var resData = writeGeneralErrorXmlFile("PaymentRem_respons",status==1?"حصل خطأ في الاتصال بسيرفر الخدمة": response.error, no_server_error);
                saveErrorsToDataBase(req, response.error, resData, bodyRequest).then(value => {
                    console.log(value)
                    callback(resData);
                }
                ).catch(value => {
                    console.log(value)
                    var callbackResponse = writeGeneralErrorXmlFile("PaymentRem_respons",response.error, database_error);
                    callback(callbackResponse);
                }
                );
            } else {
                if (status == 200) {
                    if(response.IsSuccess=="true"){
                        findQResponse(remit_No).then(value => {
                            var resData = writeCashOutPxml(response, no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.ReferenceNumber,
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
                                    remStatus: response.IsSuccess=="true" ? "1" : ""
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
                                    transaction_id: response.ReferenceNumber,
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
                                    remStatus: response.IsSuccess=="true" ? "1" : ""
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
                            var resData = writeGeneralErrorXmlFile('PaymentRem_respons',response.MSG,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.ReferenceNumber,
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
                                    remStatus: response.IsSuccess=="true" ? "1" : ""
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
                                    var callbackResponse = writeGeneralErrorXmlFile('PaymentRem_respons',response.MSG,database_error);
                                    callback(callbackResponse)
                                }
                            });
                        }).catch(value => {
                            var resData = writeGeneralErrorXmlFile('PaymentRem_respons',response.MSG,no_server_error);
                            let newData = new newApiRequest.insertData(
                                {
                                    rem_no: remit_No,
                                    transaction_id: response.ReferenceNumber,
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
                                    remStatus: response.IsSuccess=="true" ? "1" : ""
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
                                    var callbackResponse = writeGeneralErrorXmlFile('PaymentRem_respons',response.MSG, database_error);
                                    callback(callbackResponse)
                                }
                            });
                        });
                    }

                } else {
                    var resData = writeGeneralErrorXmlFile("PaymentRem_respons","خطأ بالاتصال يرجى إعادة المحاولة", no_server_error);
                    saveErrorsToDataBase(req, "خطأ بالاتصال يرجى إعادة المحاولة", resData, bodyRequest).then(value => {
                        console.log(value)
                        callback(resData);
                    }
                    ).catch(value => {
                        console.log(value)
                        var callbackResponse = writeGeneralErrorXmlFile("PaymentRem_respons","خطأ بالاتصال يرجى إعادة المحاولة", database_error);
                        callback(callbackResponse);
                    }
                    );
                }
            }
        });
    }

}

module.exports.Watania_Server = Watania_Server;

function queryRemittance(epressNo,callback)
{ 
    var queryRemittanceBody = {
    "ExpressNumber": epressNo,
    "Sub_Agent_ID":Sub_Agent_ID
    }
  var queryRemittanceBodyProcessed =prepareBody(queryRemittanceBody);
   request.post(
        { headers: queryHeader,
          url: queryRemittanceURL,
          body:  queryRemittanceBodyProcessed,
          method: 'POST'
        },
        function(err,respones,body)
        {  
             if(!err){
                try {
                    var json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    return callback(statsCode, json_tok, queryRemittanceBodyProcessed);
         
               } catch (error) {
                console.log('error' + error.message);
                var respons_err =
                {
                    'error': error.message,
                    "status": respones.statusCode,
                    "body": body
                };
                return callback(respones.statusCode, respons_err, queryRemittanceBodyProcessed);
               }
             } else {
                var respons_err =
                {
                    'error': err.message,
                };
                return callback(1, respons_err, queryRemittanceBodyProcessed);
             }

     
           }
     ); 

}

function payoutRemittance(epressNo,user,idNumber,issueData,expDate,issuePlace,callback)
{ 
     var payoutRemittanceBody = { 
        "ExpressNumber": epressNo,  
        "Sub_Agent_ID":Sub_Agent_ID, 
        "UserID": user, 
        "Id_Number": idNumber, 
        "Issue_Date": issueData, 
        "Expire_Date": expDate, 
        "Issue_Place": issuePlace 
}  
  var payoutRemittanceBodyProcessed =prepareBody(payoutRemittanceBody);
   request.post(
        { headers: queryHeader,
          url: payoutRemittanceURL,
          body:  payoutRemittanceBodyProcessed,
          method: 'POST'
        },
        function(err,respones,body)
        {  
            if(!err){
                try {
                    var json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    return callback(statsCode, json_tok, payoutRemittanceBodyProcessed);
         
               } catch (error) {
                console.log('error' + error.message);
                var respons_err =
                {
                    'error': error.message,
                    "status": respones.statusCode,
                    "body": body
                };
                return callback(respones.statusCode, respons_err, payoutRemittanceBodyProcessed);
               }
             } else {
                var respons_err =
                {
                    'error': err.message,
                };
                return callback(1, respons_err, payoutRemittanceBodyProcessed);
             }
     
           }
     ); 

}

function uploadDoucment(epressNo,d1,d2,d3,callback)
{ 
    uploadDoucmentBody = { 
        "ExpressNumber": epressNo,  
        "Sub_Agent_ID":Sub_Agent_ID, 
        "Attachments":[
          {
            "Type":10,
            "Notes":" بطاقة شخصيةامامية",
            "Content":"data:image/png;base64,"+d1
          },
          {
            "Type":12,
            "Notes":"بطاقة شخصية خلفية",
            "Content":"data:image/png;base64,"+d2
          },
          {
            "Type":13,
            "Notes":"سند استلام الحوالة",
            "Content":"data:image/png;base64,"+d3
          }
        ]
}  
  var uploadDoucmentBodyProcessed =prepareBody(uploadDoucmentBody);
   request.post(
        { headers: queryHeader,
          url: uploadDocumentURL,
          body:  x,
          method: 'POST'
        },
        function(err,respones,body)
        {  
            if(!err){
                try {
                    var json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    return callback(statsCode, json_tok, uploadDoucmentBodyProcessed);
         
               } catch (error) {
                console.log('error' + error.message);
                var respons_err =
                {
                    'error': error.message,
                    "status": respones.statusCode,
                    "body": body
                };
                return callback(respones.statusCode, respons_err, uploadDoucmentBodyProcessed);
               }
             } else {
                var respons_err =
                {
                    'error': err.message,
                };
                return callback(1, respons_err, uploadDoucmentBodyProcessed);
             }
     
           }
     ); 

}

function prepareBody(bodyRecivied)
{       
       return JSON.stringify(bodyRecivied);
}

// function toBase64(path){
//   var binaryData = fs.readFileSync(path);
//   var base64String = new Buffer.from(binaryData).toString("base64");
//   return base64String;
// }

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
        <code_API>${responesData.Status==null?"false":responesData.Status}</code_API>
         <msg_API>${responesData.Message}</msg_API>
      </msg_info_API>
    </ns:${service}>
    </env:Body>
    </env:Envelope>`
}

function writeGeneralErrorXmlFile(service, resDesc, ServerData) {

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
        <code_API>false</code_API>
         <msg_API>${resDesc}</msg_API>
      </msg_info_API>
    </ns:${service}>
    </env:Body>
    </env:Envelope>`
}

function writeCashOutQxml(responesData,region, ServerData) {
    
    var sCurr = "YE3";

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
        <code_API>Success</code_API>
         <msg_API>${responesData.Message}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${responesData.ExpressNumber}</rem_no>
        <trans_key></trans_key>
        <region_id></region_id>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${region==1?responesData.Deducted_Amount==0?responesData.Amount:responesData.Amount-responesData.Deducted_Amount:responesData.Amount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${responesData.CurrencyCode=="YER"?region==1?responesData.CurrencyCode:sCurr:responesData.CurrencyCode}</payout_cuyc>
        <payout_com>${responesData.Commission_Amount}</payout_com>
        <Deduct_Amount>${region==2?0:responesData.Deducted_Amount}</Deduct_Amount>
        <Main_Amount>${responesData.Amount}</Main_Amount>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc>${responesData.Commission_CurrencyCode=="YER"?region==1?responesData.Commission_CurrencyCode:sCurr:responesData.Commission_CurrencyCode}</payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount></payout_settlement_amount>
        <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
        <rem_status>${responesData.Status}</rem_status>
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
        <full_name>${responesData.SenderName}</full_name>
        <telephone></telephone>
        <mobile>${responesData.SenderPhone==null?"لا يوجد":responesData.SenderPhone}</mobile>
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
        <full_name>${responesData.ReceiverName}</full_name>
        <telephone></telephone>
        <mobile>${responesData.ReceiverPhone==null?"لا يوجد":responesData.ReceiverPhone}</mobile>
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
        <sending_reason>${responesData.RemittancePurpose==null?"لا يوجد":responesData.RemittancePurpose}</sending_reason>
        <deliver_via></deliver_via>
        <note>${responesData.Notes==null?"لا يوجد":responesData.Notes}</note>
        <the_date>${responesData.TheDate==null?"لا يوجد":responesData.TheDate}</the_date>
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
        <code_API>${responesData.IsSuccess}</code_API>
         <msg_API>${responesData.MSG}</msg_API>
      </msg_info_API>
      <rem_info>
       <reference_number>${responesData.ReferenceNumber}</reference_number>
      </rem_info>
    </ns:PaymentRem_respons>
    </env:Body>
    </env:Envelope>`
}

function toBase64() {
    var authBase64 = `${username + ":" + password}`;
    var base64String = new Buffer.from(authBase64).toString("base64");
    return base64String;
}




function pinnedWriteCashOutQxml(region) {

    var Deducted_Amount =100000;
    var Amount = 230000;

    return `<?xml version="1.0" encoding="UTF-8"?>
    <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
     <env:Header/>
     <env:Body>
     <ns:Q_ReciveRem>
      <msg_info_server>
       <code_serv>00000</code_serv>
       <msg_serv>تمت العمليات في السيرفر بنجاح</msg_serv>
       </msg_info_server>
       <msg_info_API>
        <code_API>Success</code_API>
         <msg_API>حوالة متوفرة</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>101010202020</rem_no>
        <trans_key></trans_key>
        <region_id></region_id>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${region==1?Deducted_Amount==0?Amount:Amount-Deducted_Amount:Amount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>YER</payout_cuyc>
        <payout_com></payout_com>
        <Deducted_Amount>${region==2?0:Deducted_Amount}</Deducted_Amount>
        <Main_Amount>${Amount}</Main_Amount>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc></payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount></payout_settlement_amount>
        <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
        <rem_status>UNPaid</rem_status>
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
        <full_name>منظمة care</full_name>
        <telephone></telephone>
        <mobile>لا يوجد</mobile>
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
        <full_name>عدنان أكرم عبدالله محمد</full_name>
        <telephone></telephone>
        <mobile>لا يوجد</mobile>
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
        <sending_reason>لا يوجد</sending_reason>
        <deliver_via></deliver_via>
        <note>لا يوجد</note>
        <the_date>لا يوجد</the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}