const request = require("request");
var path = require("path");
const crypto = require("crypto");
const date = require('date-and-time')
var rn = require('random-number'); 
const baseURL = "http://ma.onecashye.com:6470/";
const preCashInUrl = "ONE/rest/CashIn";
const cashInUrl = "ONE/rest/CashIn/Exe";
const preCashOutUrl = "ONE/rest/CashOut";
const cashOutUrl = "ONE/rest/CashOut/Exe";
const authID = "17940";
const username = "967000261433";
const apiKey = "74Weq7dcPRjMWJMPifs0P+KB3SOzsBrykl7AVi8sorzwmXAEHAYCmGXu5gLEr7lV1PIV2YzjLtr0+O8/h9GAI0KMkEB/P0K3esx+zMGMYIVchyxEDkwQ0qFZfwfOh66Sh+CndrajjttNiZqpJ5VF+o";
const HmacKey = "1oVJBBzfbDgnXkouklpRksiO+p3l8MTUYM6WbArLCcS+2igbiJDuUZY1ly+WAV7f+VB1sqc2r0Gyr23ZQyOQhg==";
const password = "API@123456@77";
const header = {
    "APIKey": apiKey,
    "Content-Type":"application/json"
};
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };


function oneCash_server(req, callback){

    
        if ((req.service_info.service_type).toUpperCase() == "CASHIN_Q"){
            // var branchCode = req.service_info.agent_or_Branch_Code;
            // var branchName = req.service_info.agent_or_Branch_name;
            // var branchCity = req.service_info.agent_or_Branch_City;
            var branchCode = "01";
            var branchName = "TEST";
            var branchCity = "Sanaa";
            var recepient = req.process_info.customerMobile;
            var recepient_sub =recepient.substring(0, 2);
            if (recepient_sub =='73' ||recepient_sub =='77'||recepient_sub =='78'||recepient_sub =='71'||recepient_sub =='70')
                recepient='967'+recepient;

            var amount = req.process_info.amount;
            var currency = "YER";
            var text = "cash in";
            callback ('<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/"><env:Header/><env:Body><ns:CASHIN_Q> <msg_info_server>  <code_serv>00000</code_serv>  <msg_serv>تمت العمليات في السيرفر بنجاح</msg_serv>  </msg_info_server>  <msg_info_API>   <code_API>1</code_API>    <msg_API>true</msg_API> </msg_info_API> <CASHIN_Q_Response>  <Amount>'+amount+'</Amount>  <Cust_Name>رياض عبدالكريم محمد النعمان</Cust_Name> </CASHIN_Q_Response>    </ns:CASHIN_Q>    </env:Body>    </env:Envelope>');

         /*   preCashIn(branchCode,branchName,branchCity,recepient,amount,currency,text, function(status,data,bodySent){
                if (data.error==0){
                    var oneCashTrans = data.transactionReference;
                    var accountType = data.accountType;
                    var customerName = data.destinationAccountName;
                    var res_data = writeCashInQXmlFile(data,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                          rem_no: req.rem_info.rem_no,
                          mobile_no: req.process_info.customerMobile,
                          transaction_id:oneCashTrans,
                          service_name: req.service_info.service_name,
                          service_type: req.service_info.service_type,
                          system_name: req.service_info.system_name,
                          username: req.service_info.username,
                          agent_code: req.service_info.agent_or_Branch_Code,
                          agent_name: req.service_info.agent_or_Branch_name,
                          date: Date.now(),
                          requestData: bodySent,
                          responesData: JSON.stringify(data),
                          Amounts: amount,
                          FirstName: customerName,
                          SecondName: "",
                          ThirdName: "",
                          LastName: "",
                          CustID: accountType,
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
                                var callbackResponse = writeCashInQXmlFile(data,database_error);
                                callback(callbackResponse);
                            }
        
                        });
                }else {
                    console.log(data.message + 'data.message');
                    var res_data =writeGeneralErrorXmlFile(data.message,no_server_error);
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
                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });*/
        } else if ((req.service_info.service_type).toUpperCase() == "CASHIN_P"){            
            // var branchCode = req.service_info.agent_or_Branch_Code;
            // var branchName = req.service_info.agent_or_Branch_name;
            // var branchCity = req.service_info.agent_or_Branch_City;
            var branchCode = "01";
            var branchName = "TEST";
            var branchCity = "Sanaa";
            var recepient = req.process_info.customerMobile;
            var recepient_sub =recepient.substring(0, 2);
            if (recepient_sub =='73' ||recepient_sub =='77'||recepient_sub =='78'||recepient_sub =='71'||recepient_sub =='70')
                recepient='967'+recepient;
            var amount = req.process_info.amount;
            var currency = "YER";
            var text = "cash in";
            var sysTransId = req.process_info.transNo;
            console.log(Number.parseFloat(amount))  
            console.log(Number.parseFloat(amount) > 1000)  
            console.log('amount') 
            if (Number.parseFloat(amount) > 10000 ){
                callback ('<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/"><env:Header/><env:Body><ns:CASHIN_P><msg_info_server><code_serv>00000</code_serv><msg_serv>تمت العمليات في السيرفر بنجاح</msg_serv></msg_info_server><msg_info_API><code_API>200003</code_API> <msg_API>العمليه غير ممكنه لتجريب رساله الخطاء</msg_API></msg_info_API><CASHIN_P_Response><transaction_id>29201</transaction_id><comission>-22.50000</comission></CASHIN_P_Response></ns:CASHIN_P></env:Body></env:Envelope>');

            }else{

                callback ('<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/"><env:Header/><env:Body><ns:CASHIN_P><msg_info_server><code_serv>00000</code_serv><msg_serv>تمت العمليات في السيرفر بنجاح</msg_serv></msg_info_server><msg_info_API><code_API>1</code_API> <msg_API>true</msg_API></msg_info_API><CASHIN_P_Response><transaction_id>29201</transaction_id><comission>-22.50000</comission></CASHIN_P_Response></ns:CASHIN_P></env:Body></env:Envelope>');
            }
            findQResponse(recepient,req.service_info.service_name,"CASHIN_Q").then(row=>{

             /*   cashIn(branchCode,branchName,branchCity,recepient,amount,currency,text,sysTransId,row.transaction_id,row.CustID,function(status,data,bodySent){
                    
                    if (data.error==0){
                        var trans_id = data.originalTransactionReference;
                        var res_data = writeCashInPXmlFile(data,no_server_error);
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
                              request_id:sysTransId,
                              Amounts: row.Amounts,
                              FirstName: row.FirstName,
                              SecondName: "",
                              ThirdName: "",
                              LastName: "",
                              CustID: row.CustID,
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
                                    var callbackResponse = writeCashInPXmlFile(data,no_server_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    } else {
                        var res_data =writeGeneralErrorXmlFile(data.message,no_server_error);
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
                                var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                                callback(callbackResponse);
                            }
        
                        });
                    }
                });*/
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
            
            // var branchCode = req.service_info.agent_or_Branch_Code;
            // var branchName = req.service_info.agent_or_Branch_name;
            // var branchCity = req.service_info.agent_or_Branch_City;
            var branchCode = "01";
            var branchName = "TEST";
            var branchCity = "Sanaa";
            var otp = req.process_info.otp;
            var requestId = req.process_info.transNo;
            var amount = req.process_info.amount;
            var currency = "YER";
            callback ('<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/"><env:Header/><env:Body><ns:CASHOUT_Q><msg_info_server><code_serv>00000</code_serv><msg_serv>تمت العمليات في السيرفر بنجاح</msg_serv></msg_info_server><msg_info_API><code_API>1</code_API> <msg_API>true</msg_API></msg_info_API><CASHOUT_Q_Response><Cust_Name>اكرم احمد محمد قاسم</Cust_Name></CASHOUT_Q_Response></ns:CASHOUT_Q></env:Body></env:Envelope>');

          /*  preCashOut(branchCode,branchName,branchCity,otp,amount,currency,requestId,function(status,data,bodySent){
                if (data.error==0){
                    var transaction = data.transactionReference;
                    var custCashOutName = data.senderName;
                    var custReceipentName = data.recipientName;
                    var custCashOutMobile = data.senderMobile;
                    var res_data = writeCashOutQXmlFile(data,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                          rem_no: req.rem_info.rem_no,
                          mobile_no: custCashOutMobile,
                          transaction_id:transaction,
                          service_name: req.service_info.service_name,
                          service_type: req.service_info.service_type,
                          system_name: req.service_info.system_name,
                          username: req.service_info.username,
                          agent_code: req.service_info.agent_or_Branch_Code,
                          agent_name: req.service_info.agent_or_Branch_name,
                          date: Date.now(),
                          requestData: bodySent,
                          responesData: JSON.stringify(data),
                          OTP:otp,
                          request_id:requestId,
                          Amounts: amount,
                          FirstName: custReceipentName,
                          SecondName:custCashOutName,
                          ThirdName: "",
                          LastName: "",
                          CustID: data.accountType,
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
                                var callbackResponse = writeCashOutQXmlFile(data,database_error);
                                callback(callbackResponse);
                            }
        
                        });
                } else {
                    var res_data =writeGeneralErrorXmlFile(data.message,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                        rem_no: req.rem_info.rem_no,
                        mobile_no: "",
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
                        OTP:otp,
                        request_id:requestId,
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
                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });*/
        } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_P") {
            
            // var branchCode = req.service_info.agent_or_Branch_Code;
            // var branchName = req.service_info.agent_or_Branch_name;
            // var branchCity = req.service_info.agent_or_Branch_City;
            var branchCode = "01";
            var branchName = "TEST";
            var branchCity = "Sanaa";
            var otp = req.process_info.otp;
            var amount = req.process_info.amount;
            var requestId = req.process_info.transNo;
            var text = "cash out";
            var sysTransId = req.rem_info.rem_no;
            var currency = "YER";

            callback('<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/"><env:Header/><env:Body><ns:CASHIN_P><msg_info_server><code_serv>00000</code_serv><msg_serv>تمت العمليات في السيرفر بنجاح</msg_serv></msg_info_server><msg_info_API><code_API>1</code_API> <msg_API>true</msg_API></msg_info_API><CASHIN_P_Response><transaction_id>29201</transaction_id><comission></comission></CASHIN_P_Response></ns:CASHIN_P></env:Body></env:Envelope>');
           /* findQCashOutResponse(otp,req.service_info.service_name,"CASHOUT_Q").then(row=>{
              /*  cashOut(branchCode,branchName,branchCity,otp,amount,currency,requestId,sysTransId,row.transaction_id,row.CustID,function(status,data,bodySent){


                if (data.error==0){

                        var trans_id = data.originalTransactionReference;
                        
                        var res_data = writeCashOutPXmlFile(data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: req.rem_info.rem_no,
                                mobile_no: row.mobile_no,
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
                                OTP:row.OTP,
                                request_id:row.request_id,
                                Amounts: row.Amounts,
                                FirstName: row.FirstName,
                                SecondName: row.SecondName,
                                ThirdName: "",
                                LastName: "",
                                CustID: row.CustID,
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
                    

                } else {
                    var res_data =writeGeneralErrorXmlFile(data.message,no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: req.rem_info.rem_no,
                            mobile_no: row.mobile_no,
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
                            OTP:row.OTP,
                            request_id:row.request_id,
                            Amounts: row.Amounts,
                            FirstName: row.FirstName,
                            SecondName: row.SecondName,
                            ThirdName: "",
                            LastName: "",
                            CustID: row.CustID,
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
                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
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
            })*/

        }


}

module.exports.oneCash_server=oneCash_server;




function hashingPubKeyPassword(){

    var publicKeyAk ="-----BEGIN PUBLIC KEY-----\n"+
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7OkyDKetBwoOGG0lCLHP051ei\n"+
    "jEFaSCgH3FPddYJ3NzmikwlNwhS/HboD0gqTQXKB5F3H1DCWFteHYCw5i+/quUvm5svg6\n"+
    "eEqlxEmFHOq0l+hpJiHT6w1SsxRw04ADRIa6dxYAcQw+/t+fyiU+M1OdKYljiuFQL5TIC5\n"+
    "+OOFjtmgharpvbXAQgNXz2J16lCgLfA4rTzkDnN6wZgt9G80hUjIPqv6vVxJWAuExn9F/4\n"+
    "xLfAd5oVXmTm3fV5ZuiaKar3bTCQBIi4ULd6oH+A34C4hd5Cgf4M5sIfb91aSkgVDufYF4\n"+
    "vsegndGv4JgSbPdqN1kVOP90yy5TUBHoUBGV7wIDAQAB\n"+
    "-----END PUBLIC KEY-----"

    var ciphertext = crypto.publicEncrypt(
        {
            key: publicKeyAk,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, 
        Buffer.from(password,'utf8')
    )

   return ciphertext.toString('base64');
}




function getTimeStamp(){
    var dateUT = new Date();
    console.log(dateUT);
    dateUT.setHours(dateUT.getHours()-3)
    var valueFormatted = date.format(dateUT,'DD-MM-YYYY HH:mm:ss.SSS');
    console.log(valueFormatted);
    return valueFormatted;
}


function toNumberString(num) {
    var finalNum = parseFloat(num); 
    if (Number.isInteger(finalNum)) { 
        console.log("is number")
      return finalNum + ".0"
    } else {
        console.log("is not number")
      return finalNum.toString(); 
    }
  }

function generateHmac(reqHash) {
    // Convert key and data to byte arrays

    console.log(reqHash);
    const byteKey = Buffer.from(HmacKey, 'utf8');
    const byteHash = Buffer.from(reqHash, 'utf8');

    console.log(byteHash);
  
    // Create HMAC object using SHA512 algorithm
    const hmac = crypto.createHmac('sha512', byteKey);
  
    // Update hmac with data to be signed
    hmac.update(byteHash);
  
    // Generate HMAC digest
    const macData = hmac.digest();
  
    // Base64 encode the HMAC digest
    const result = macData.toString('base64');
  
    return result;
  }


function preCashIn(branchCode,branchName,branchCity,recepient,amount,currency,text,callback){

    var timeNow = getTimeStamp();
    var hash = `${authID}#${branchCode}#${timeNow}${recepient}#${Number.parseFloat(amount)}#${currency}#${text}`;
 
    var preCashInBody = {
        "id": authID,
        "userName": username,
        "pass": hashingPubKeyPassword(),
        "timeStamp": timeNow,
        "hash": generateHmac(hash),
        "branch": {
            "name": branchName,
            "code": branchCode,
            "city": branchCity
        },
        "transaction": {
            "amount": Number.parseFloat(amount)/*.toFixed(2)*/,
            "currency": currency,
            "transactionReceipt": `${recepient}`,
            "descriptionText": text
        }
    }


    
     var preCashInBodyProcessed = prepareBody(preCashInBody);
    
    console.log(preCashInBodyProcessed);

    request.post(
        {
            headers: header,
            url: baseURL+preCashInUrl,
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

function cashIn(branchCode,branchName,branchCity,recepient,amount,currency,text,sysTransId,oneCashTrans,accountType,callback){


    var timeNow = getTimeStamp();
    var hash = `${authID}#${branchCode}#${timeNow}${recepient}#${Number.parseFloat(amount)}#${currency}#${text}#${accountType}#${oneCashTrans}#${sysTransId}`;


    var cashInBody = {
        "id": authID,
        "userName": username,
        "pass": hashingPubKeyPassword(),
        "timeStamp": timeNow,
        "hash": generateHmac(hash),
        "branch": {
            "name": branchName,
            "code": branchCode,
            "city": branchCity
        },
        "transaction": {
            "amount": Number.parseFloat(amount)/*.toFixed(2)*/,
            "currency": currency,
            "transactionReceipt": `${recepient}`,
            "requestingOrganisationTransactionReference": sysTransId,
            "transactionReference": oneCashTrans,
            "descriptionText": text,
            "accountType": accountType
        }
    }
    
    var cashInBodyProcessed = prepareBody(cashInBody);

    console.log(cashInBodyProcessed);
    request.post(
        {
            headers: header,
            url:baseURL+cashInUrl,
            body: cashInBodyProcessed,
            method: 'POST',
            
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, cashInBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, cashInBodyProcessed);
                }

            } else {
                return callback(1,err.message, cashInBodyProcessed);
            }

        }
    );
}

function preCashOut(branchCode,branchName,branchCity,cashOutCode,amount,currency,requestId,callback){

        var timeNow = getTimeStamp();
        var hash = `${authID}#${branchCode}#${timeNow}${requestId}#${Number.parseFloat(amount)}#${currency}#${cashOutCode}`;



    var preCashOutBody = {
        "id": authID,
        "userName": username,
        "pass": hashingPubKeyPassword(),
        "timeStamp": timeNow,
        "hash":generateHmac(hash),
        "branch": {
            "name": branchName,
            "code": branchCode,
            "city": branchCity
        },
        "transaction": {
            "amount":Number.parseFloat(amount)/*.toFixed(2)*/,
            "currency": currency,
            "voucherNumber": cashOutCode,
            "requestId": requestId
        }
    }

    var preCashOutBodyProcessed = prepareBody(preCashOutBody); 

    console.log(preCashOutBodyProcessed);
    
    request.post(
        {
            headers: header,
            url: baseURL+preCashOutUrl,
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


function cashOut(branchCode,branchName,branchCity,cashOutCode,amount,currency,requestId,sysTransId,oneCashTrans,accountType,callback){

        var timeNow = getTimeStamp();
        var hash = `${authID}#${branchCode}#${timeNow}${requestId}#${Number.parseFloat(amount)}#${currency}#${cashOutCode}#${accountType}#${oneCashTrans}#${sysTransId}`;


    var cashOutBody ={
        "id": authID,
        "userName": username,
        "pass": hashingPubKeyPassword(),
        "timeStamp": timeNow,
        "hash": generateHmac(hash),
        "branch": {
            "name": branchName,
            "code": branchCode,
            "city": branchCity
        },
        "transaction": {
            "amount": Number.parseFloat(amount)/*.toFixed(2)*/,
            "currency": currency,
            "voucherNumber": cashOutCode,
            "requestId": requestId,
            "requestingOrganisationTransactionReference": sysTransId,
            "transactionReference": oneCashTrans,
            "accountType": accountType
        }
    }
    
    var cashOutBodyProcessed = prepareBody(cashOutBody);
    console.log(cashOutBodyProcessed); 
    request.post(
        {
            headers: header,
            url: baseURL+cashOutUrl,
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


async function findQCashOutResponse(number,serviceName,serviceType) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ OTP : number , service_name:serviceName,service_type:serviceType}, (err, apiData) => {
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




function writeGeneralErrorXmlFile(error,ServerData) {



    var messageError;
    console.log(error + 'error');
    if(error.length > 0 || error == undefined ){
        messageError = error
    } else {
        messageError = "حدث خطأ اثناء اجراء العملية يرجى المحاولة لاحقا"
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
        <code_API>-1</code_API>
         <msg_API>${messageError}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}

function writeCashInQXmlFile(response,ServerData){

            var name = response.destinationAccountName;
            var feeAmount = response.finalAmount;

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

    var t_id = response.originalTransactionReference;
    var commission = getCommission(response,1);

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
<comission>${commission}</comission>
</CASHIN_P_Response>
</ns:CASHIN_P>
</env:Body>
</env:Envelope>`
}

function writeCashOutQXmlFile(response,ServerData){

    var name = response.senderName;

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
<Cust_Name>${name}</Cust_Name>
</CASHOUT_Q_Response>
</ns:CASHOUT_Q>
</env:Body>
</env:Envelope>`
}



function writeCashOutPXmlFile(response,ServerData){

    var t_id = response.originalTransactionReference;
    var commission = getCommission(response,2);

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
<comission>${commission}</comission>
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


function getCommission(data,opType){

    var commAmount ; 
    if(opType == 1){
        for(var i = 0 ; i <data.commissionList.length; i++){
            if(data.commissionList[i].commissionType == "S"){
                commAmount = data.commissionList[i].commissionAmount;
                break;
            }
        }
    
        return commAmount;
    } else {
        for(var i = 0 ; i <data.commissionList.length; i++){
            if(data.commissionList[i].commissionType == "D"){
                commAmount = data.commissionList[i].commissionAmount;
                break;
            }
        }
    
        return commAmount;
    }


}

