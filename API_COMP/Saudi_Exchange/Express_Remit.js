var xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');

const USER_ID = "APIUSER";
const PASSWORD = "7568708578";
const AGENT_CODE='YE149';
const soapActionURL = "http://tempuri.org/";
const content_type = 'text/xml;charset=UTF-8';
const Q_REMIT = "GetRemitInfo";
const REMIT_QUERY = "GetRemitByReferenceNumber";
const P_REMIT = "PayRemit";
const url = 'http://api.expressremit.com/Services/Saudi-XRemit-API.asmx?wsdl';
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');



function Saudi_Server(requestXmlFromInternalSystem,callback) {

    parser.parseString(requestXmlFromInternalSystem , function(err, result){
        console.log("**************************************************************************");
        console.log(result);
        console.log("**************************************************************************");
        var serviceInfo;
        var remitNO;
        var deletedObject;

             serviceInfo = result['soapenv:Envelope']['soapenv:Body'].service_info;
             if((serviceInfo.service_type).toUpperCase() == "Q_REM"){
                remitNO = result['soapenv:Envelope']['soapenv:Body']['tem:GetRemitByReferenceNumber']['tem:REFERENCE_NUMBER'];
             } else if ((serviceInfo.service_type).toUpperCase() == "P_REM") {
                remitNO = result['soapenv:Envelope']['soapenv:Body']['tem:PayRemit']['tem:ObjPayRemit']['tem:REFERENCE_NUMBER'];
             }

             deletedObject = result['soapenv:Envelope']['soapenv:Body'];

        console.log(serviceInfo);
        
        var builder = new xml2js.Builder();
        delete deletedObject.service_info;
        var xmlRequestToSaudi = builder.buildObject(result);
        console.log("///////////////////////////////////////////////////////////////////////////");
        console.log(xmlRequestToSaudi);
        
   


     if ((serviceInfo.service_type).toUpperCase() == "Q_REM") {
        getRemitQuery(xmlRequestToSaudi).then(result => {
            console.log("point 1");
            var saudiSystemResponseJSON = result['soap:Envelope']['soap:Body'];
            var builder = new xml2js.Builder();
            console.log("point 2")
            if(saudiSystemResponseJSON.GetRemitByReferenceNumberResponse.RESPONSE_CODE!=0){
                var saudiSystemResponseXML = builder.buildObject(result);
                console.log(remitNO);
                var responseToInernalSystem = writeGeneralErrorQuery(saudiSystemResponseJSON.GetRemitByReferenceNumberResponse.RESPONSE_MESSAGE,saudiSystemResponseJSON.GetRemitByReferenceNumberResponse.RESPONSE_CODE);
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
                        requestData: xmlRequestToSaudi,
                        responesData: saudiSystemResponseXML,
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
                        callback(responseToInernalSystem);
                    }
                });
            } else {
                if(saudiSystemResponseJSON.GetRemitByReferenceNumberResponse.GetRemitByReferenceNumberResult.GetRemitByReferenceNumber.REMIT_STATUS=="UNPAID"){
                    console.log("point 3");
                    var detailedResponse = saudiSystemResponseJSON.GetRemitByReferenceNumberResponse.GetRemitByReferenceNumberResult.GetRemitByReferenceNumber;
                    var responseToInernalSystem = builder.buildObject(result); 
                    console.log("point 4")    
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
                            requestData: xmlRequestToSaudi,
                            responesData: responseToInernalSystem,
                            Amounts: detailedResponse.PAYOUT_AMOUNT,
                            FirstName: detailedResponse.RECEIVER_NAME,
                            SecondName: "",
                            ThirdName: "",
                            LastName: "",
                            CustID: "",
                            qRespones: responseToInernalSystem,
                            Request: requestXmlFromInternalSystem,
                        });
                    console.log(newData);
                    console.log("point 5")
                    newData.save(async (err, doc) => {
                        if (!err) {
                            console.log('record was added');
                            console.log("point 6")
                            callback(responseToInernalSystem);
                        }
                        else {
                            console.log("DataBase Error")
                            callback(responseToInernalSystem);
                        }
                    });
                } else {
                    var saudiSystemResponseXML = builder.buildObject(result);
                    console.log(remitNO);
                    var responseToInernalSystem = writeGeneralErrorQuery(saudiSystemResponseJSON.GetRemitByReferenceNumberResponse.GetRemitByReferenceNumberResult.GetRemitByReferenceNumber.REMIT_STATUS,"Error");
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
                            requestData: xmlRequestToSaudi,
                            responesData: saudiSystemResponseXML,
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
                            callback(responseToInernalSystem);
                        }
                    });
                }
                   
            }
    }).catch(err=>{
            console.log("Inside catch query");
            console.log(err.message);
            var responseToInernalSystem = writeGeneralErrorQuery(err.message,"Error");
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
                    requestData: xmlRequestToSaudi,
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
                    callback(responseToInernalSystem);
                }
            });


        });

    } else if ((serviceInfo.service_type).toUpperCase() == "P_REM") {

        payRemit(xmlRequestToSaudi).then(result=>{    
            var builder = new xml2js.Builder();
            var payResponse = result['soap:Envelope']['soap:Body'];

            if(payResponse.PayRemitResponse.RESPONSE_CODE==0){
                
                var responseToInernalSystem = builder.buildObject(result);
                var saudiRef= payResponse.PayRemitResponse.REFERENCE_NUMBER;
                    findQResponse(saudiRef).then(value=> {
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: saudiRef,
                                service_name: serviceInfo.service_name,
                                service_type: serviceInfo.service_type,
                                system_name: serviceInfo.system_name,
                                username: serviceInfo.username,
                                agent_code: serviceInfo.agent_or_Branch_Code,
                                agent_name: serviceInfo.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: xmlRequestToSaudi,
                                responesData: responseToInernalSystem,
                                Amounts: value.Amounts,
                                FirstName: value.FirstName,
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
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
                                callback(responseToInernalSystem);
                            }
                        });
                        
                    }).catch(value=>{
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: saudiRef,
                                transaction_id:"",
                                service_name: serviceInfo.service_name,
                                service_type: serviceInfo.service_type,
                                system_name: serviceInfo.system_name,
                                username: serviceInfo.username,
                                agent_code: serviceInfo.agent_or_Branch_Code,
                                agent_name: serviceInfo.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: xmlRequestToSaudi,
                                responesData: responseToInernalSystem,
                                Amounts: "",
                                FirstName: "",
                                SecondName: "",
                                ThirdName: "",
                                LastName: "",
                                CustID: "",
                                qRespones: "",
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
                                console.log("DataBase Error")
                                callback(responseToInernalSystem);
                            }
                        });
                    });
            } else {
                var saudiRef= payResponse.PayRemitResponse.REFERENCE_NUMBER;
                var responseToInernalSystem = writeGeneralErrorPay(payResponse.PayRemitResponse.RESPONSE_MESSAGE,payResponse.PayRemitResponse.RESPONSE_CODE)
                findQResponse(saudiRef).then(value=> {
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: saudiRef,
                            service_name: serviceInfo.service_name,
                            service_type: serviceInfo.service_type,
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToSaudi,
                            responesData: responseToInernalSystem,
                            Amounts: value.Amounts,
                            FirstName: value.FirstName,
                            SecondName: "",
                            ThirdName: "",
                            LastName: "",
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
                            callback(responseToInernalSystem);
                        }
                    });
                    
                }).catch(value=>{
                    var responseToInernalSystem = writeGeneralErrorPay(payResponse.PayRemitResponse.RESPONSE_MESSAGE,payResponse.PayRemitResponse.RESPONSE_CODE)
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: saudiRef,
                            transaction_id:"",
                            service_name: serviceInfo.service_name,
                            service_type: serviceInfo.service_type,
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToSaudi,
                            responesData: responseToInernalSystem,
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
                            callback(responseToInernalSystem);
                        }
                    });
                });
            }
         
        }).catch(err=>{
            console.log("Inside catch Pay");
            console.log(err);
            findQResponse(remitNO).then(value=> {
                var responseToInernalSystem = writeGeneralErrorPay(err.message,"Error");
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
                        requestData: xmlRequestToSaudi,
                        responesData: responseToInernalSystem,
                        Amounts: value.Amounts,
                        FirstName: value.FirstName,
                        SecondName: "",
                        ThirdName: "",
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
                            callback(responseToInernalSystem);
                    }
                });
                
            }).catch(value=>{
                var responseToInernalSystem = writeGeneralErrorPay(err.message,"Error");
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
                        requestData: xmlRequestToSaudi,
                        responesData: responseToInernalSystem,
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
                        callback(responseToInernalSystem);
                    }
                });
            });
        });
    

    }
});

}


module.exports.Saudi_Server = Saudi_Server;





async function getRemitDetails(xml) {

    var header = {
        'Content-Type': content_type,
        'soapAction': soapActionURL + Q_REMIT,
    };

    const { response } = await soapRequest({ url: url, headers: header, xml: xml });
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


async function getRemitQuery(xml) {
    console.log("point -1")
    var header = {
        'Content-Type': content_type,
        'soapAction': soapActionURL + REMIT_QUERY,
    };

    //const { response } = await soapRequest({ url: "http://100.0.0.108:3150/saudi/query", headers: header, xml: xml });
    console.log("point -2")
    //const { headers, body, statusCode } = response;
    //console.log(body);
    //console.log(statusCode);
    var bodyR = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  <soap:Body>    <GetRemitByReferenceNumberResponse xmlns="http://tempuri.org/">      <GetRemitByReferenceNumberResult>        <GetRemitByReferenceNumber>          <REFERENCE_NUMBER>58628665</REFERENCE_NUMBER>          <SENDER_NAME>KHALED YAHYA MOHAMMED  ALEZZI AL SHAIKH</SENDER_NAME>          <RECEIVER_NAME>ضياء الدين عبدالكريم قاسم احمد عبدالله</RECEIVER_NAME>          <PAYOUT_CURRENCY>USD</PAYOUT_CURRENCY>          <PAYOUT_AMOUNT>100</PAYOUT_AMOUNT>          <REMIT_STATUS>UNPAID</REMIT_STATUS>          <REMIT_TYPE>RECEIVE</REMIT_TYPE>        </GetRemitByReferenceNumber>      </GetRemitByReferenceNumberResult>      <RESPONSE_CODE>0</RESPONSE_CODE>      <RESPONSE_MESSAGE>Success</RESPONSE_MESSAGE>    </GetRemitByReferenceNumberResponse>  </soap:Body></soap:Envelope>`
    var stringResult = bodyR.toString();
    console.log("point -3")
    var resultResponse;
    parser.parseString(stringResult, function (err, result) {
        console.log("point -4")
        console.log(result);
        resultResponse = result;
    });
    console.log("point -5")
    return resultResponse;


}

async function payRemit(xml) {

    var header = {
        'Content-Type': content_type,
        'soapAction': soapActionURL + P_REMIT,
    };

    // const { response } = await soapRequest({ url: "http://100.0.0.108:3150/saudi/pay", headers: header, xml: xml });
    // const { headers, body, statusCode } = response;
   
    // console.log(body);
    // console.log(statusCode);
    var finalResult;
    var bodyR = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  <soap:Body>    <PayRemitResponse xmlns="http://tempuri.org/">      <PayRemitResult>true</PayRemitResult>      <REFERENCE_NUMBER>58628665</REFERENCE_NUMBER>      <RESPONSE_CODE>0</RESPONSE_CODE>      <RESPONSE_MESSAGE>Success</RESPONSE_MESSAGE>    </PayRemitResponse>  </soap:Body></soap:Envelope>`
    var stringResult = bodyR.toString();
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



function writeGeneralErrorQuery(error,code){
        var responseError =`<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <GetRemitByReferenceNumberResponse xmlns="http://tempuri.org/">
                    <RESPONSE_CODE>${code}</RESPONSE_CODE>
                    <RESPONSE_MESSAGE>${error}</RESPONSE_MESSAGE>
                </GetRemitByReferenceNumberResponse>
            </soap:Body>
        </soap:Envelope>`;
            return responseError;
}


function writeGeneralErrorPay(error,code){
    var responseError =`<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <PayRemitResponse xmlns="http://tempuri.org/">
                <RESPONSE_CODE>${code}</RESPONSE_CODE>
                <RESPONSE_MESSAGE>${error}</RESPONSE_MESSAGE>
            </PayRemitResponse>
        </soap:Body>
    </soap:Envelope>`;
return responseError;
}


function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
    return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;
  
  }
  
  
  function writeErrorLog(opNo,user,service,type,error){
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
  }
