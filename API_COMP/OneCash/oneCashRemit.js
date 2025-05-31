const request = require("request");
var path = require("path");
const crypto = require("crypto");
const date = require('date-and-time')
var rn = require('random-number'); 
const baseURL = "http://ma.onecashye.com:6470/";
const RedeemVoucher = "ONE/rest/RedeemVoucher";
const RedeemVoucherExce = "ONE/rest/RedeemVoucherExe";
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

function oneCash_remit_server(req, callback){


        if ((req.service_info.service_type).toUpperCase() == 'Q_REM'){
            // var branchCode = req.service_info.agent_or_Branch_Code;
            // var branchName = req.service_info.agent_or_Branch_name;
            // var branchCity = req.service_info.agent_or_Branch_City;
            var branchCode = "01";
            var branchName = "TEST";
            var branchCity = "Sanaa";
            var transactionNumber = req.rem_info.transNo;
            var remitNo = req.rem_info.rem_no;
            var requesterRegion = req.rem_info.region;

            searchRemit(branchName,branchCode,branchCity,remitNo,transactionNumber,function(status,data,bodySent){

                if (data.error==0){
                        
                        var res_data = writeQueryRemitxml(data,remitNo,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              transaction_id:data.transactionReference,
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: bodySent,
                              responesData: JSON.stringify(data),
                              Amounts:data.amount,
                              request_id:transactionNumber,
                              FirstName: data.recipientName,
                              SecondName: data.destinationAccountName,
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
                                    var callbackResponse = writeQueryRemitxml(data,remitNo,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                                 
          
                        
                } else {
                    var res_data =writeGeneralErrorXmlFile(data.message,no_server_error);
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
                            var callbackResponse = writeGeneralErrorXmlFile(data.message,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });
        } else if ((req.service_info.service_type).toUpperCase() == 'P_REM'){            
            // var branchCode = req.service_info.agent_or_Branch_Code;
            // var branchName = req.service_info.agent_or_Branch_name;
            // var branchCity = req.service_info.agent_or_Branch_City;
            var branchCode = "01";
            var branchName = "TEST";
            var branchCity = "Sanaa";
            var transactionNumber = req.rem_info.transNo;
            var remitNo = req.rem_info.rem_no;
            //var orgRequest = req.rem_info.orginalRequesting;
            var remitAmount = req.rem_info.amount;
            var remitCurrency = req.rem_info.currency;
            var options = {
                min:  100000
                , max:  1000000
              , integer: true
              }
            var requestId = rn(options);
            findQResponse(remitNo).then(row=>{
                confirmRemit(branchName,branchCode,branchCity,remitNo,transactionNumber,row.SecondName,remitAmount,remitCurrency,row.transaction_id,requestId,row.CustID,function(status,data,bodySent){    
                    if (data.error==0){
                        
                        var res_data = writeConfirmRemitXmlFile(data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              transaction_id: data.originalTransactionReference,
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
                              request_id:requestId,
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
                                    var callbackResponse = writeConfirmRemitXmlFile(data,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    }  else {
                        var res_data =writeGeneralErrorXmlFile(data.message,no_server_error);
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
                });
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


}

module.exports.oneCash_remit_server=oneCash_remit_server;



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
      return finalNum + ".0"
    } else {
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

function searchRemit(branchName,branchCode,branchCity,voucherNumber,transNo,callback){


    var timeNow = getTimeStamp();
    var hash = `${authID}#${branchCode}#${timeNow}${voucherNumber}#${transNo}`;


    var preSearchRemitBody = {
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
            "transactionNumber": transNo,
            "voucherNumber": voucherNumber

        }
    }
    
    var preSearchRemitBodyProcessed = prepareBody(preSearchRemitBody);
  
    request.post(
        {
            headers: header,
            url: baseURL+RedeemVoucher,
            body: preSearchRemitBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, preSearchRemitBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, preSearchRemitBodyProcessed);
                }

            } else {
                return callback(1,err.message, preSearchRemitBodyProcessed);
            }

        }
    );

    
}

function confirmRemit(branchName,branchCode,branchCity,voucherNumber,transNo,transReceipt,amount,currency,transRefernce,orgRequest,accountType,callback){

        var timeNow = getTimeStamp()
        var hash = `${authID}#${branchCode}#${timeNow}#${voucherNumber}#${transNo}#${transReceipt}#${Number.parseFloat(amount)}#${currency}#${transRefernce}#${orgRequest}`;


    var confirmRemitBody = {
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
            "amount": Number.parseFloat(amount),
            "currency": currency,
            "transactionReceipt": transReceipt,
            "transactionNumber": transNo,
            "voucherNumber": voucherNumber,
            "requestingOrganisationTransactionReference": `${orgRequest}`,
            "transactionReference": transRefernce,
            "accountType": accountType

        }
    }
    
    var confirmRemitBodyProcessed = prepareBody(confirmRemitBody);
    console.log(confirmRemitBodyProcessed);
    request.post(
        {
            headers: header,
            url: baseURL+RedeemVoucherExce,
            body: confirmRemitBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    console.log(body)
                    console.log('akrrrrrrrrm')
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, confirmRemitBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, confirmRemitBodyProcessed);
                }

            } else {
                return callback(1,err.message, confirmRemitBodyProcessed);
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
    await newApiRequest.insertData.find({ rem_no : number , service_type : "q_rem"}, (err, apiData) => {
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

    if(error.length > 0 ){
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


function writeQueryRemitxml(responesData,remNO, ServerData) {

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
        <rem_no>${remNO}</rem_no>
        <trans_key>${responesData.transactionReference}</trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${responesData.amount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${responesData.currency}</payout_cuyc>
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
        <full_name>${responesData.senderName}</full_name>
        <telephone></telephone>
        <mobile>${responesData.senderMobile}</mobile>
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
        <full_name>${responesData.recipientName}</full_name>
        <telephone></telephone>
        <mobile>${responesData.destinationAccountName}</mobile>
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

var t_id = response.originalTransactionReference;
var commission = getCommission(response);
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
<comission>${commission}</comission>
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



function getCommission(data){

    var commAmount ; 

    for(var i = 0 ; i <data.commissionList.length; i++){
        if(data.commissionList[i].commissionType == "D"){
            commAmount = data.commissionList[i].commissionAmount;
            break;
        }
    }

    return commAmount;

}

