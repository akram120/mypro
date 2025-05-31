var xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');

const content_type = 'text/xml;charset=UTF-8';


//const url = 'https://api-prod.eway.jo:7120/RFRemittancesAPI/RFRemittancesWebServices?wsdl';
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };


function Alawneh_Server_V2(requestXmlFromInternalSystem,callback) {

    parser.parseString(requestXmlFromInternalSystem , function(err, result){

        console.log("**************************************************************************");
        console.log(result);
        console.log("**************************************************************************");

        var serviceInfo;
        var remitNO;
        var deletedObject;
             serviceInfo = result['soapenv:Envelope']['soapenv:Body'].service_info;
             if((serviceInfo.service_type).toUpperCase() == "Q_REM"){
                remitNO = result['soapenv:Envelope']['soapenv:Body']['ser:getRemittanceForReceive']['remittanceId'];
             } else if ((serviceInfo.service_type).toUpperCase() == "P_REM") {
                remitNO = result['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['remittanceId'];
             }

             deletedObject = result['soapenv:Envelope']['soapenv:Body'];

        console.log(serviceInfo);
        
        var builder = new xml2js.Builder();
        delete deletedObject.service_info;
        var xmlRequestToAlawneh = builder.buildObject(result);
        console.log("///////////////////////////////////////////////////////////////////////////");
        console.log(xmlRequestToAlawneh);
        

     if ((serviceInfo.service_type).toUpperCase() == "Q_REM") {
        getRemitDetails(xmlRequestToAlawneh).then(result => {
            var alawnehResponseJSON = result['S:Envelope']['S:Body'];
            var builder = new xml2js.Builder();
            if(alawnehResponseJSON['ns0:getRemittanceForReceiveResponse']['return']['ns1:resultId']!=9000){
                var alawnehResponseXML = builder.buildObject(result);

                console.log(remitNO);
                var responseToInernalSystem = writeGeneralErrorQuery(alawnehResponseJSON['ns0:getRemittanceForReceiveResponse']['return']['ns1:resultMessage'],alawnehResponseJSON['ns0:getRemittanceForReceiveResponse']['return']['ns1:resultId'],no_server_error);
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
                        requestData: xmlRequestToAlawneh,
                        responesData: alawnehResponseXML,
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
                        var responseToInernalSystemE = writeGeneralErrorQuery(alawnehResponseJSON['ns0:getRemittanceForReceiveResponse']['return']['ns1:resultMessage'],alawnehResponseJSON['ns0:getRemittanceForReceiveResponse']['return']['ns1:resultId'],database_error);
                        callback(responseToInernalSystemE);
                    }
                });
            } else {
                    console.log("before assign value")
                    var detailedResponse = alawnehResponseJSON['ns0:getRemittanceForReceiveResponse']['return']['ns1:remittance'];
                    console.log("after assign value")
                    console.log(detailedResponse)
                    var testResultOfExsistingM = 'ns1:enMiddleName' in detailedResponse['ns1:receiver'];
                    var testResultOfExsistingF = 'ns1:enFirstName' in detailedResponse['ns1:receiver'];
                    var testResultOfExsistingL = 'ns1:enLastName' in detailedResponse['ns1:receiver'];
                    var alawnehResponseXML = builder.buildObject(result);
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
                            requestData: xmlRequestToAlawneh,
                            responesData: alawnehResponseXML,
                            Amounts: detailedResponse['ns1:amount'],
                            FirstName: testResultOfExsistingF?detailedResponse['ns1:receiver']['ns1:enFirstName']:"",
                            SecondName: testResultOfExsistingL?detailedResponse['ns1:receiver']['ns1:enLastName']:"",
                            ThirdName: testResultOfExsistingM?detailedResponse['ns1:receiver']['ns1:enMiddleName']:"",
                            LastName: detailedResponse['ns1:receiver']['ns1:originalName'],
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
                    requestData: xmlRequestToAlawneh,
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
        parser.parseString(xmlRequestToAlawneh , function(err, resultConvertingToJS){
        findQResponse(remitNO).then(value=> {
            resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderFirstName'] = value.FirstName;
            resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderMiddleName'] = value.ThirdName;
            resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderLastName'] = value.SecondName;
            var builder = new xml2js.Builder();
            var requestReadyToSentToKamal = builder.buildObject(resultConvertingToJS); 
            validateRemit(requestReadyToSentToKamal).then(result =>{

                var alawnehResponseJSON = result['S:Envelope']['S:Body'];
                var builder = new xml2js.Builder();
                if(alawnehResponseJSON['ns0:validateReceiveRemittanceResponse']['return']['ns1:resultId']!=9000){
                    var alawnehResponseXML = builder.buildObject(result);
                    console.log(remitNO);
                    var responseToInernalSystem = writeGeneralErrorPay(alawnehResponseJSON['ns0:validateReceiveRemittanceResponse']['return']['ns1:resultMessage'],alawnehResponseJSON['ns0:validateReceiveRemittanceResponse']['return']['ns1:resultId'],no_server_error);
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
                            requestData: requestReadyToSentToKamal,
                            responesData: alawnehResponseXML,
                            Amounts: value.Amounts,
                            FirstName: value.FirstName,
                            SecondName: value.SecondName,
                            ThirdName: value.ThirdName,
                            LastName: value.LastName,
                            CustID: "",
                            qRespones: value.qRespones,
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
                            console.log("DataBase Error");
                            var responseToInernalSystemE = writeGeneralErrorPay(alawnehResponseJSON['ns0:validateReceiveRemittanceResponse']['return']['ns1:resultMessage'],alawnehResponseJSON['ns0:validateReceiveRemittanceResponse']['return']['ns1:resultId'],database_error);
                            callback(responseToInernalSystemE);
                        }
                    });
                } else {
                    resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderFirstName'] = value.FirstName;
                    resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderLastName'] = value.SecondName;
                    resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:receiveRemittance'] =  resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance'];
                    delete resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance'];
                    var builder = new xml2js.Builder();
                    var requestToKamalProccesed = builder.buildObject(resultConvertingToJS);
                    receiveRemit(requestToKamalProccesed).then(resultReceive=>{
                        
                        var alawnehResponseJSON = resultReceive['S:Envelope']['S:Body'];
                        var builder = new xml2js.Builder();
                        if(alawnehResponseJSON['ns0:receiveRemittanceResponse']['return']['ns1:resultId']!=9000){
                            var alawnehResponseXML = builder.buildObject(resultReceive);
                            console.log(remitNO);
                            var responseToInernalSystem = writeGeneralErrorPayConfirm(alawnehResponseJSON['ns0:receiveRemittanceResponse']['return']['ns1:resultMessage'],alawnehResponseJSON['ns0:receiveRemittanceResponse']['return']['ns1:resultId'],no_server_error);
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
                                    requestData: requestToKamalProccesed,
                                    responesData: alawnehResponseXML,
                                    Amounts: value.Amounts,
                                    FirstName: value.FirstName,
                                    SecondName: value.SecondName,
                                    ThirdName: value.ThirdName,
                                    LastName: value.LastName,
                                    CustID: "",
                                    qRespones: value.qRespones,
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
                                    console.log("DataBase Error");
                                    var responseToInernalSystemE = writeGeneralErrorPayConfirm(alawnehResponseJSON['ns0:receiveRemittanceResponse']['return']['ns1:resultMessage'],alawnehResponseJSON['ns0:receiveRemittanceResponse']['return']['ns1:resultId'],database_error);
                                    callback(responseToInernalSystemE);
                                }
                            });
                        } else {
                            var alawnehResponseXML = builder.buildObject(resultReceive);
                            var responseToInernalSystem = writeConfirmPayResponse(resultReceive,no_server_error);
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
                                    requestData: requestToKamalProccesed,
                                    responesData: alawnehResponseXML,
                                    Amounts: value.Amounts,
                                    FirstName: value.FirstName,
                                    SecondName: value.SecondName,
                                    ThirdName: "",
                                    LastName: value.LastName,
                                    CustID: "",
                                    qRespones: value.qRespones,
                                    pRespones:responseToInernalSystem,
                                    Request: requestXmlFromInternalSystem,
                                    remStatus:"1"
                                });
                            console.log(newData);
                            
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    console.log('record was added');
                                    callback(responseToInernalSystem);
                                }
                                else {
                                    console.log("DataBase Error");
                                    var responseToInernalSystemE = writeConfirmPayResponse(result,database_error);
                                    callback(responseToInernalSystemE);
                                }
                            });
                        }
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
                                requestData: requestToKamalProccesed,
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
                }
            }).catch(err=>{
                console.log("Inside catch query");
                console.log(err.message);
                var responseToInernalSystem = writeGeneralErrorPay(err.message,"Error",no_server_error);
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
                        requestData: requestReadyToSentToKamal,
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
                        var responseToInernalSystemE = writeGeneralErrorPay(err.message,"Error",database_error);
                        callback(responseToInernalSystemE);
                    }
                });
            });
        }).catch(value=>{
            var responseToInernalSystem = writeGeneralErrorPayConfirm("حصل خطأيرجى المحاولة لاحقا","Error",no_server_error);
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
                    requestData: xmlRequestToAlawneh,
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
                    var responseToInernalSystemE = writeGeneralErrorPayConfirm("حصل خطأيرجى المحاولة لاحقا","Error",database_error);
                    callback(responseToInernalSystemE);
                }
            });
        });
    
    })
    }
});

}


module.exports.Alawneh_Server_V2 = Alawneh_Server_V2;





async function getRemitDetails(xml) {



    var header = {
        'Content-Type': content_type
    };

    const { response } = await soapRequest({ url: "http://100.0.0.108:3150/alawneh/query", headers:header, xml: xml });
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


async function validateRemit(xml) {

    var header = {
        'Content-Type': content_type
    };

            const { response } = await soapRequest({ url: "http://100.0.0.108:3150/alawneh/pay", headers: header, xml: xml });
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

async function receiveRemit(xml) {

    var header = {
        'Content-Type': content_type
    };

    const { response } = await soapRequest({ url: "http://100.0.0.108:3150/alawneh/pay", headers: header, xml: xml });
    const { headers, body, statusCode } = response;
   
    console.log(body);
    console.log(statusCode);
    var stringResult = body.toString();

    var finalResult;
    parser.parseString(stringResult, function (err, result) {
        
        finalResult = result;
        console.log(result);
    })
    return finalResult;


}



async function findQResponse(number) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: number }, (err, apiData) => {
        try {
            if (apiData[0].qRespones === undefined) {
                Qrespons = '';
                console.log("Qresponse is : undefined");
                reject(Qrespons);
            }
            else {
                Qrespons = apiData[0].qRespones;
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

function writeGeneralErrorPay(error,code,ServerData){


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

    var detailedResponse = response['S:Envelope']['S:Body']['ns0:getRemittanceForReceiveResponse']['return'];
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
        <code_API>${detailedResponse['ns1:resultId']}</code_API>
         <msg_API>${detailedResponse['ns1:resultMessage']}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${detailedResponse['ns1:remittance']['ns1:remittanceId']}</rem_no>
        <trans_key></trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${detailedResponse['ns1:remittance']['ns1:amount']}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${detailedResponse['ns1:remittance']['ns1:currencyIdPayout']}</payout_cuyc>
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
        <f_name>${detailedResponse['ns1:remittance']['ns1:sender']['ns1:enFirstName']}</f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name>${detailedResponse['ns1:remittance']['ns1:sender']['ns1:enLastName']}</l_name>
        <full_name>${detailedResponse['ns1:remittance']['ns1:sender']['ns1:originalName']}</full_name>
        <telephone></telephone>
        <mobile></mobile>
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
        <f_name>${detailedResponse['ns1:remittance']['ns1:receiver']['ns1:enFirstName']}</f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name>${detailedResponse['ns1:remittance']['ns1:receiver']['ns1:enLastName']}</l_name>
        <full_name>${detailedResponse['ns1:remittance']['ns1:receiver']['ns1:originalName']}</full_name>
        <telephone></telephone>
        <mobile>${detailedResponse['ns1:remittance']['ns1:receiver']['ns1:mobile']}</mobile>
        <address></address>
        <nationality_coyc>${detailedResponse['ns1:remittance']['ns1:receiver']['ns1:nationality']}</nationality_coyc>
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
        <sending_reason>${detailedResponse['ns1:remittance']['ns1:reasonChildCode']}</sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_date>${detailedResponse['ns1:remittance']['ns1:sendingDate']}</the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}



function writeConfirmPayResponse(response,ServerData){

    var detailedResponse = response['S:Envelope']['S:Body']['ns0:receiveRemittanceResponse']['return'];

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
        <code_API>${detailedResponse['ns1:resultId']}</code_API>
         <msg_API>${detailedResponse['ns1:resultMessage']}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_com>${detailedResponse['ns1:correspondentCommissionAmount']}</rem_com>
      </rem_info>
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