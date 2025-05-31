var xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');
const soapActionURL = "http://tempuri.org/";
const content_type = 'text/xml;charset=UTF-8';
const Q_REMIT = "GetRemitForPay";
const P_REMIT = "PayRemit";
const url = 'https://api.aysar.com:777/Services/WSRemitAPI.asmx?wsdl';
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };


function Ayser_Server(requestXmlFromInternalSystem,callback) {

    parser.parseString(requestXmlFromInternalSystem , function(err, result){
        console.log("**************************************************************************");
        console.log(result);
        console.log("**************************************************************************");
        var serviceInfo;
        var remitNO;
        var deletedObject;
             serviceInfo = result['soapenv:Envelope']['soapenv:Body'].service_info;
             if((serviceInfo.service_type).toUpperCase() == "Q_REM"){
                remitNO = result['soapenv:Envelope']['soapenv:Body']['tem:GetRemitForPay']['tem:TransactionNo'];
             } else if ((serviceInfo.service_type).toUpperCase() == "P_REM") {
                remitNO = result['soapenv:Envelope']['soapenv:Body']['tem:PayRemit']['tem:payRemitInfo']['tem:TransactionNo'];
             }

             deletedObject = result['soapenv:Envelope']['soapenv:Body'];

        console.log(serviceInfo);
        
        var builder = new xml2js.Builder();
        delete deletedObject.service_info;
        var xmlRequestToZamzam = builder.buildObject(result);
        console.log("///////////////////////////////////////////////////////////////////////////");
        console.log(xmlRequestToZamzam);
        
             
     if ((serviceInfo.service_type).toUpperCase() == "Q_REM") {
        getRemitDetails(xmlRequestToZamzam).then(result => {
            var ayserResponseJSON = result['soap:Envelope']['soap:Body'];
            var builder = new xml2js.Builder();
            if('ResponseCode' in ayserResponseJSON['GetRemitForPayResponse']['GetRemitForPayResult']){
                var ayserResponseXML = builder.buildObject(result);
                console.log(remitNO);
                var responseToInernalSystem = writeGeneralErrorQuery(ayserResponseJSON['GetRemitForPayResponse']['GetRemitForPayResult']['ResponseMessage'],ayserResponseJSON['GetRemitForPayResponse']['GetRemitForPayResult']['ResponseCode'],no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: remitNO,
                        service_name: serviceInfo.service_name,
                        service_type: serviceInfo.service_type,
                        system_name: serviceInfo.system_name,
                        username: serviceInfo.username,
                        agent_code: serviceInfo.agent_or_Branch_Code,
                        agent_name: serviceInfo.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: xmlRequestToZamzam,
                        responesData: ayserResponseXML,
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: responseToInernalSystem,
                        Request: requestXmlFromInternalSystem,
                    });
                console.log(newData);
                
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        callback(responseToInernalSystem);
                    }
                    else {
                        console.log("DataBase Error")
                        var responseToInernalSystemE = writeGeneralErrorQuery(ayserResponseJSON['GetRemitForPayResponse']['GetRemitForPayResult']['ResponseMessage'],ayserResponseJSON['GetRemitForPayResponse']['GetRemitForPayResult']['ResponseCode'],database_error);
                        callback(responseToInernalSystemE);
                    }
                });
            } else {
                    var detailedResponse = ayserResponseJSON['GetRemitForPayResponse']['GetRemitForPayResult'];
                    var ayserResponseXML = builder.buildObject(result);
                    // var responseToInernalSystem = builder.buildObject(result);     
                    var responseToInernalSystem = writeQueryResponse(result,no_server_error);     
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: remitNO,
                            service_name: serviceInfo.service_name,
                            service_type: serviceInfo.service_type,
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToZamzam,
                            responesData: ayserResponseXML,
                            Amounts: detailedResponse['RemitAmount'],
                            FirstName:detailedResponse['ReceiverName'],
                            SecondName: "",
                            ThirdName: "",
                            LastName: "",
                            CustID: "",
                            qRespones: responseToInernalSystem,
                            Request: requestXmlFromInternalSystem,
                        });
                    console.log(newData);
                    
                    newData.save(async (err, doc) => {
                        if (!err) {
                            console.log('record was added');
                            callback(responseToInernalSystem);
                        }
                        else {
                            console.log("DataBase Error")
                           
                             var responseToInernalSystemE = writeQueryResponse(result,database_error);
                             callback(responseToInernalSystemE);
                        }
                    });
                
                   
            }
    }).catch(err=>{
            console.log("Inside catch query");
            console.log(err.message);
            var responseToInernalSystem = writeGeneralErrorQuery(err.message,"Error",no_server_error);
            let newData = new newApiRequest.insertData(
                {
                    rem_no: remitNO,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlRequestToZamzam,
                    responesData: responseToInernalSystem,
                    Amounts: "",
                    FirstName: "",
                    SecondName: "",
                    ThirdName: "",
                    LastName: "",
                    CustID: "",
                    qRespones: responseToInernalSystem,
                    Request: requestXmlFromInternalSystem,
                });
            console.log(newData);
            
            newData.save(async (err, doc) => {
                if (!err) {
                    console.log('record was added');
                    callback(responseToInernalSystem);
                }
                else {
                    console.log("DataBase Error")
                    var responseToInernalSystemE = writeGeneralErrorQuery(err.message,"Error",database_error);
                    callback(responseToInernalSystemE);
                }
            });


        });
    } else if ((serviceInfo.service_type).toUpperCase() == "P_REM") {
        findQResponse(remitNO).then(value=> {
            payRemit(xmlRequestToZamzam).then(result => {
                var ayserResponseJSON = result['soap:Envelope']['soap:Body']['PayRemitResponse']['PayRemitResult'];
                var builder = new xml2js.Builder();
                var ayserResponseXML = builder.buildObject(result);
                var responseToInernalSystem = writeConfirmPayResponse(ayserResponseJSON,no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: remitNO,
                        service_name: serviceInfo.service_name,
                        service_type: serviceInfo.service_type,
                        system_name: serviceInfo.system_name,
                        username: serviceInfo.username,
                        agent_code: serviceInfo.agent_or_Branch_Code,
                        agent_name: serviceInfo.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: xmlRequestToZamzam,
                        responesData: ayserResponseXML,
                        Amounts: value.Amounts,
                        FirstName: value.FirstName,
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: value.qRespones,
                        pRespones:responseToInernalSystem,
                        Request: requestXmlFromInternalSystem,
                        remStatus:ayserResponseJSON['ResponseCode']==0?"1":""
                    });
                console.log(newData);
                
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        callback(responseToInernalSystem);
                    }
                    else {
                        console.log("DataBase Error");
                        
                        var responseToInernalSystemE = writeConfirmPayResponse(ayserResponseJSON,database_error);
                        callback(responseToInernalSystemE);
                    }
                });
            }).catch(err=>{
                console.log("Inside catch query");
                console.log(err.message);
                var responseToInernalSystem = writeGeneralErrorPayConfirm(err.message,"Error",no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: remitNO,
                        service_name: serviceInfo.service_name,
                        service_type: serviceInfo.service_type,
                        system_name: serviceInfo.system_name,
                        username: serviceInfo.username,
                        agent_code: serviceInfo.agent_or_Branch_Code,
                        agent_name: serviceInfo.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: xmlRequestToZamzam,
                        responesData: responseToInernalSystem,
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: responseToInernalSystem,
                        Request: requestXmlFromInternalSystem,
                    });
                console.log(newData);
                
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        callback(responseToInernalSystem);
                    }
                    else {
                        console.log("DataBase Error")
                        var responseToInernalSystemE = writeGeneralErrorPayConfirm(err.message,"Error",database_error);
                        callback(responseToInernalSystemE);
                    }
                });
            });
        }).catch(value=>{
            var responseToInernalSystem = writeGeneralErrorPayConfirm("حصل خطأيرجى المحاولة لاحقا","-5",no_server_error);
            let newData = new newApiRequest.insertData(
                {
                    rem_no: remitNO,
                    transaction_id:"",
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlRequestToZamzam,
                    responesData: "",
                    Amounts: "",
                    FirstName: "",
                    SecondName: "",
                    ThirdName: "",
                    LastName: "",
                    CustID: "",
                    qRespones: "",
                    pRespones:responseToInernalSystem,
                    Request: requestXmlFromInternalSystem,
                });
            console.log(newData);
            
            newData.save(async (err, doc) => {
                if (!err) {
                    console.log('record was added');
                    callback(responseToInernalSystem);
                }
                else {
                    console.log("DataBase Error")
                    var responseToInernalSystemE = writeGeneralErrorPayConfirm("حصل خطأيرجى المحاولة لاحقا","-5",database_error);
                    callback(responseToInernalSystemE);
                }
            });
        });
    

    }
});

}


module.exports.Ayser_Server = Ayser_Server;





async function getRemitDetails(xml) {



    var header = {
        'Content-Type': content_type,
        'soapAction':soapActionURL+Q_REMIT
    };

    const { response } = await soapRequest({ url: "http://172.16.151.33:3150/zamzam/query", headers: header, xml: xml });
    const { headers, body, statusCode } = response;
    console.log(body);
    console.log(statusCode);
    
    var stringResult = body.toString();
    var resultResponse;
    parser.parseString(stringResult, function (err, result) {
        
        console.log(result);
        resultResponse = result;
    })
    return resultResponse;
}


async function payRemit(xml) {

                var header = {
                'Content-Type': content_type,
                'soapAction': soapActionURL+P_REMIT,
            };

            const { response } = await soapRequest({ url: "http://172.16.151.33:3150/zamzam/pay", headers: header, xml: xml });
            const { headers, body, statusCode } = response;
            console.log(body);
            console.log(statusCode);
            
            var stringResult = body.toString();
    var resultResponse;
    parser.parseString(stringResult, function (err, result) {
        
        console.log(result);
        resultResponse = result;
    });
    return resultResponse;


}




async function findQResponse(number) {

    var Qrespons;
    var entireRow;
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
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : " + Qrespons);
                resolve(entireRow);
            }

        } catch (error) {
            Qrespons = '';
            console.log("Qresponse is : blank");
            reject(Qrespons);

        }


        console.log('55555555555555555555555555555555555555');
        console.log(Qrespons);


    });
});
    
}



function writeGeneralErrorQuery(error,code,ServerData){

    
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
         <code_API>${code}</code_API>
          <msg_API>${error}</msg_API>
       </msg_info_API>
       </ns:Q_ReciveRem>
       </env:Body>
       </env:Envelope>`;
}

function writeGeneralErrorPayConfirm(error,code,ServerData){


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
     <code_API>${code}</code_API>
      <msg_API>${error}</msg_API>
   </msg_info_API>
   </ns:PaymentRem_respons>
   </env:Body>
   </env:Envelope>`;

}



function writeQueryResponse(response,ServerData) {

    var detailedResponse = response['soap:Envelope']['soap:Body']['GetRemitForPayResponse']['GetRemitForPayResult'];
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
        <code_API>0</code_API>
         <msg_API>Success</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${detailedResponse['TransactionNo']}</rem_no>
        <trans_key></trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${detailedResponse['RemitAmount']}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${detailedResponse['RemitCurrency']}</payout_cuyc>
        <payout_com>${detailedResponse['Commission']}</payout_com>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc>${detailedResponse['CommCurrency']}</payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount>${detailedResponse['SettlementAmount']}</payout_settlement_amount>
        <payout_settlement_amount_cuyc>${detailedResponse['SettlementCurrency']}</payout_settlement_amount_cuyc>
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
        <l_name></l_name>
        <full_name>${detailedResponse['SenderName']}</full_name>
        <telephone></telephone>
        <mobile></mobile>
        <address>${detailedResponse['SenderAddres']}</address>
        <address1></address1>
        <nationality_coyc>${detailedResponse['SenderCountry']}</nationality_coyc>
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
        <full_name>${detailedResponse['ReceiverName']}</full_name>
        <telephone></telephone>
        <mobile>${detailedResponse['ReceiverPhone']}</mobile>
        <address>${detailedResponse['ReceiverAddress']}</address>
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
        <sending_reason>${detailedResponse['PurposeDesc']}</sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_date>${detailedResponse['RemSendDate']}</the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}



function writeConfirmPayResponse(response,ServerData){


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
        <code_API>${response['ResponseCode']}</code_API>
         <msg_API>${response['ResponseMessage']}</msg_API>
      </msg_info_API>
      </ns:PaymentRem_respons>
      </env:Body>
      </env:Envelope>`
}


function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
    return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;
  
  }
  
  
  function writeErrorLog(opNo,user,service,type,error){
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
  }
