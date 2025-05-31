
var xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');
const username = "612335";
const password = "Alnoaman@123";
const soapActionURL = "http://tempuri.org/";
const content_type = 'text/xml;charset=UTF-8';
//const paymentContent_type = 'application/soap+xml;charset=UTF-8;action=\"http://tempuri.org/GetTransferList\"';
const queryRemit = "CorpGetTransferInfo";
const paymentRequestConfirm = "CorpPaymentRequestConfirm";
const paymentRequest = "CorpPaymentRequest";
const url = 'https://upt.aktifbank.com.tr/ISV/TU/WebServices/V1_4/CorpService.asmx?wsdl';
var xmlPayConfirm;
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');

var errorMsg = {
    "1":"رقم الحوالة غير صحيح او الحوالة مسلمة",
    "2":"SqlDateTime overflow. Must be between",
    "3":"Your transaction is waiting for upt main desk approval",
    "4":"Server was unable to process request.",
    "5":"[INVALID STATUS]",
    "6":"the response message does not match the content type of the binding",
    "7":"Invalid reference"
}



function UPT_Server(requestXmlFromInternalSystem,callback) {

    parser.parseString(requestXmlFromInternalSystem , function(err, result){
        console.log("**************************************************************************");
        console.log(result);
        console.log("**************************************************************************");
        var serviceInfo;
        var remitNO;
        var deletedObject;
        serviceInfo = result['soapenv:Envelope']['soapenv:Body'].service_info;
        if((serviceInfo.service_type).toUpperCase() == "Q_REM"){
            remitNO = result['soapenv:Envelope']['soapenv:Body']['tem:CorpGetTransferInfo']['tem:obj']['tem:UPT_REF'];
         } else if ((serviceInfo.service_type).toUpperCase() == "P_REM") {
            payReqUPTref = result['soapenv:Envelope']['soapenv:Body']['tem:CorpPaymentRequest']['tem:obj']['tem:UPT_REF'];
         }
         deletedObject = result['soapenv:Envelope']['soapenv:Body'];
        console.log(serviceInfo);
        
        var builder = new xml2js.Builder();
        delete deletedObject.service_info;
        var xmlRequestToUpt = builder.buildObject(result);
        console.log("///////////////////////////////////////////////////////////////////////////");
        console.log(xmlRequestToUpt);
        
   


     if ((serviceInfo.service_type).toUpperCase() == "Q_REM") {
        getTransferList(xmlRequestToUpt).then(result => {
            var uptSystemResponse = result['soap:Envelope']['soap:Body'];
            var builder = new xml2js.Builder();
            var responseArrayAndObject;
            if(uptSystemResponse.CorpGetTransferInfoResponse.CorpGetTransferInfoResult.TransferInfoStatus.RESPONSE=='Error'){
                var responsefromUptSystme = builder.buildObject(result);
                var error_query =uptSystemResponse.CorpGetTransferInfoResponse.CorpGetTransferInfoResult.TransferInfoStatus.RESPONSE_DATA; 
                var responseToInernalSystem = writeGeneralErrorQuery(error_query);
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
                        requestData: xmlRequestToUpt,
                        responesData: responsefromUptSystme,
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
                if(uptSystemResponse.CorpGetTransferInfoResponse.CorpGetTransferInfoResult.TransferInfoRetList.WSCorpTransferInfo== undefined){
                    var responsefromUptSystme = builder.buildObject(result);
                    console.log(remitNO);
                    var responseToInernalSystem = writeErrorInValidRefNo();
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
                            requestData: xmlRequestToUpt,
                            responesData: responsefromUptSystme,
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
                            responseArrayAndObject = uptSystemResponse.CorpGetTransferInfoResponse.CorpGetTransferInfoResult.TransferInfoRetList.WSCorpTransferInfo;
                            var responseToInernalSystem = builder.buildObject(result);
                        
                        let newData = new newApiRequest.insertData(
                            {
                                rem_no: responseArrayAndObject.UPT_REF_OUT,
                                service_name: serviceInfo.service_name,
                                service_type: serviceInfo.service_type,
                                system_name: serviceInfo.system_name,
                                username: serviceInfo.username,
                                agent_code: serviceInfo.agent_or_Branch_Code,
                                agent_name: serviceInfo.agent_or_Branch_name,
                                date: Date.now(),
                                requestData: xmlRequestToUpt,
                                responesData: responseToInernalSystem,
                                Amounts: responseArrayAndObject.AMOUNT_OUT,
                                FirstName: responseArrayAndObject.BENEFICIARY_NAME_OUT,
                                SecondName: "",
                                ThirdName: "",
                                LastName: responseArrayAndObject.BENEFICIARY_LASTNAME_OUT,
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
            var responseToInernalSystem = writeGeneralErrorQuery(err.message);
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
                    requestData: xmlRequestToUpt,
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

        paymentRequestF(xmlRequestToUpt).then(result=>{
            

            var payResponse = result['soap:Envelope']['soap:Body'];
            var builder = new xml2js.Builder();
            var responseToInernalSystem = builder.buildObject(result);
            var uptRef= payResponse.CorpPaymentRequestResponse.CorpPaymentRequestResult.UPT_REF;
            if(payResponse.CorpPaymentRequestResponse.CorpPaymentRequestResult.PaymentRequestStatus.RESPONSE=="Success"){ 

                
                var uptPaymentRef= payResponse.CorpPaymentRequestResponse.CorpPaymentRequestResult.UPT_PAYMENT_REF_OUT;
                findQResponse(uptRef).then(value=> {
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: uptRef,
                            transaction_id:uptPaymentRef,
                            service_name: serviceInfo.service_name,
                            service_type: "CHECK_PAY",
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToUpt,
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
                            confirmPayRequest(uptRef,uptPaymentRef,serviceInfo,requestXmlFromInternalSystem,function(finalResponse){
                                callback(finalResponse);
                            });
                        }
                        else {
                            console.log("DataBase Error");
                            confirmPayRequest(uptRef,uptPaymentRef,serviceInfo,requestXmlFromInternalSystem,function(finalResponse){
                                callback(finalResponse);
                            });
                        }
                    });
                    
                }).catch(value=>{
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: uptRef,
                            transaction_id:uptPaymentRef,
                            service_name: serviceInfo.service_name,
                            service_type: "CHECK_PAY",
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToUpt,
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
                            confirmPayRequest(uptRef,uptPaymentRef,serviceInfo,requestXmlFromInternalSystem,function(finalResponse){
                                callback(finalResponse);
                            });
                        }
                        else {
                            console.log("DataBase Error")
                            confirmPayRequest(uptRef,uptPaymentRef,serviceInfo,requestXmlFromInternalSystem,function(finalResponse){
                                callback(finalResponse);
                            });
                        }
                    });
                });
            } else {
                findQResponse(uptRef).then(value=> {
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: uptRef,
                            service_name: serviceInfo.service_name,
                            service_type: "CHECK_PAY",
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToUpt,
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
                            console.log("DataBase Error")
                            callback(responseToInernalSystem);
                        }
                    });
                    
                }).catch(value=>{
                    let newData = new newApiRequest.insertData(
                        {
                            rem_no: uptRef,
                            service_name: serviceInfo.service_name,
                            service_type: "CHECK_PAY",
                            system_name: serviceInfo.system_name,
                            username: serviceInfo.username,
                            agent_code: serviceInfo.agent_or_Branch_Code,
                            agent_name: serviceInfo.agent_or_Branch_name,
                            date: Date.now(),
                            requestData: xmlRequestToUpt,
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
            findQResponse(payReqUPTref).then(value=> {
                var responseToInernalSystem = writeGeneralErrorPay(err.message);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: payReqUPTref,
                        transaction_id:"",
                        service_name: serviceInfo.service_name,
                        service_type: "CHECK_PAY",
                        system_name: serviceInfo.system_name,
                        username: serviceInfo.username,
                        agent_code: serviceInfo.agent_or_Branch_Code,
                        agent_name: serviceInfo.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: xmlRequestToUpt,
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
                var responseToInernalSystem = writeGeneralErrorPay(err.message);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: payReqUPTref,
                        transaction_id:"",
                        service_name: serviceInfo.service_name,
                        service_type: "CHECK_PAY",
                        system_name: serviceInfo.system_name,
                        username: serviceInfo.username,
                        agent_code: serviceInfo.agent_or_Branch_Code,
                        agent_name: serviceInfo.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: xmlRequestToUpt,
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


module.exports.UPT_Server = UPT_Server;





async function getTransferList(xml) {


    console.log("inside start get Transfer List function ")

    var header = {
        'Content-Type': content_type,
        'soapAction': soapActionURL + queryRemit,
    };

    const { response } = await soapRequest({ url: "http://172.16.151.33:3150/upt/query", headers: header, xml: xml });
    const { headers, body, statusCode } = response;
    console.log(body);
    console.log(statusCode);
    
    var stringResult = body.toString();
    console.log('result of faild web login is ' +stringResult)
    var resultResponse;
    parser.parseString(stringResult, function (err, result) {
        
        console.log(result);
        resultResponse = result;
    })
    return resultResponse;


}


async function paymentRequestF(xml) {



    var header = {
        'Content-Type': content_type,
        'soapAction': soapActionURL + paymentRequest,
    };

    const { response } = await soapRequest({ url: "http://172.16.151.33:3150/upt/check_pay", headers: header, xml: xml });
    const { headers, body, statusCode } = response;
   
    console.log(body);
    console.log(statusCode);
    var finalResult;
    var stringResult = body.toString();
    parser.parseString(stringResult, function (err, result) {
        
        finalResult = result;
        console.log(result);
    })
    return finalResult;


}

async function paymentRequestConfirmF(refNo,refOutNo) {


var  xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
    <soapenv:Header>
       <tem:WsSystemUserInfo>
          <tem:Username>${username}</tem:Username>
          <tem:Password>${password}</tem:Password>
       </tem:WsSystemUserInfo>
    </soapenv:Header>
    <soapenv:Body>
       <tem:CorpPaymentRequestConfirm>
          <tem:obj>
             <tem:UPT_REF>${refNo}</tem:UPT_REF>
             <tem:UPT_PAYMENT_REF>${refOutNo}</tem:UPT_PAYMENT_REF>
          </tem:obj>
       </tem:CorpPaymentRequestConfirm>
    </soapenv:Body>
 </soapenv:Envelope>`;

 xmlPayConfirm = xml;


    var header = {
        'Content-Type': content_type,
        'soapAction': soapActionURL + paymentRequestConfirm,
    };

    const { response } = await soapRequest({ url: "http://172.16.151.33:3150/upt/pay", headers: header, xml: xml });
    const { headers, body, statusCode } = response;
    //console.log(headers);
    console.log(body);
    console.log(statusCode);
    var finalResult;
    var stringResult = body.toString();
    parser.parseString(stringResult, function (err, result) {
        //finalResult = result['soap:Envelope']['soap:Body'];
        finalResult = result;
        console.log(result);
    })
    return finalResult;


}



async function findQResponse(number) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: number,CustID:{$ne:'for save'} }, (err, apiData) => {
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


function confirmPayRequest(refNo,refOutNo,serviceInfo,requestXmlFromInternalSystem,callback){

    paymentRequestConfirmF(refNo,refOutNo).then(result=>{
        var payConfirmResponse = result['soap:Envelope']['soap:Body'];
        var builder = new xml2js.Builder();
        var responseToInernalSystem = builder.buildObject(result);
        if(payConfirmResponse.CorpPaymentRequestConfirmResponse.CorpPaymentRequestConfirmResult.PaymentRequestConfirmStatus.RESPONSE=="Success"){

        findQResponse(refNo).then(value=> {

            let newData = new newApiRequest.insertData(
                {
                    rem_no: refNo,
                    transaction_id:refOutNo,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlPayConfirm,
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
            
        }).catch(value=>{
            let newData = new newApiRequest.insertData(
                {
                    rem_no: refNo,
                    transaction_id:refOutNo,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlPayConfirm,
                    responesData: responseToInernalSystem,
                    Amounts:"",
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
        findQResponse(refNo).then(value=> {

            let newData = new newApiRequest.insertData(
                {
                    rem_no: refNo,
                    transaction_id:refOutNo,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlPayConfirm,
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
                    remStatus:""
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
            
        }).catch(value=>{
            let newData = new newApiRequest.insertData(
                {
                    rem_no: refNo,
                    transaction_id:refOutNo,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlPayConfirm,
                    responesData: responseToInernalSystem,
                    Amounts:"",
                    FirstName: "",
                    SecondName: "",
                    ThirdName: "",
                    LastName: "",
                    CustID: "",
                    qRespones: "",
                    pRespones:responseToInernalSystem,
                    Request: requestXmlFromInternalSystem,
                    remStatus:""
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
        findQResponse(refNo).then(value=> {
            var responseToInernalSystem = writeGeneralErrorConfirmPay(err.message);
            let newData = new newApiRequest.insertData(
                {
                    rem_no: refNo,
                    transaction_id:refOutNo,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlPayConfirm,
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
                    remStatus:""
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
            
        }).catch(value=>{
            var responseToInernalSystem = writeGeneralErrorConfirmPay(err.message);
            let newData = new newApiRequest.insertData(
                {
                    rem_no: refNo,
                    transaction_id:refOutNo,
                    service_name: serviceInfo.service_name,
                    service_type: serviceInfo.service_type,
                    system_name: serviceInfo.system_name,
                    username: serviceInfo.username,
                    agent_code: serviceInfo.agent_or_Branch_Code,
                    agent_name: serviceInfo.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: xmlPayConfirm,
                    responesData: responseToInernalSystem,
                    Amounts:"",
                    FirstName: "",
                    SecondName: "",
                    ThirdName: "",
                    LastName: "",
                    CustID: "",
                    qRespones: "",
                    pRespones:responseToInernalSystem,
                    Request: requestXmlFromInternalSystem,
                    remStatus:""
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


function writeErrorInValidRefNo(){
    var result = getErrorMsg("رقم الحوالة غير صحيح او الحوالة مسلمة");

var responseError =`<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <soap:Body>
            <CorpGetTransferInfoResponse xmlns="http://tempuri.org/">
                <CorpGetTransferInfoResult>
                    <TransferInfoStatus>
                        <RESPONSE_DATA>${result.msg}</RESPONSE_DATA>
                        <RESPONSE>${result.code}</RESPONSE>
                    </TransferInfoStatus><TransferInfoRetList />
                </CorpGetTransferInfoResult>
            </CorpGetTransferInfoResponse>
        </soap:Body>
    </soap:Envelope>`;

    return responseError;
}

function writeErrorPaidRefNo(){
    var responseError =`<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <soap:Body>
                <CorpGetTransferInfoResponse xmlns="http://tempuri.org/">
                    <CorpGetTransferInfoResult>
                        <TransferInfoStatus>
                            <RESPONSE_DATA>Remittance is Paid</RESPONSE_DATA>
                            <RESPONSE>Error</RESPONSE>
                        </TransferInfoStatus><TransferInfoRetList />
                    </CorpGetTransferInfoResult>
                </CorpGetTransferInfoResponse>
            </soap:Body>
        </soap:Envelope>`;
    
        return responseError;
    }


function writeGeneralErrorQuery(error){
    var result = getErrorMsg(error);

        var responseError =`<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                <soap:Body>
                    <CorpGetTransferInfoResponse xmlns="http://tempuri.org/">
                        <CorpGetTransferInfoResult>
                            <TransferInfoStatus>
                                <RESPONSE_DATA>${result.msg}</RESPONSE_DATA>
                                <RESPONSE>${result.code}</RESPONSE>
                            </TransferInfoStatus><TransferInfoRetList />
                        </CorpGetTransferInfoResult>
                    </CorpGetTransferInfoResponse>
                </soap:Body>
            </soap:Envelope>`;
            return responseError;
}

function writeGeneralErrorPay(error){

    var result = getErrorMsg(error);

    var responseError =`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Body>
       <CorpPaymentRequestResponse xmlns="http://tempuri.org/">
          <CorpPaymentRequestResult>
             <PaymentRequestStatus>
                <RESPONSE_DATA>${result.msg}</RESPONSE_DATA>
                <RESPONSE>${result.code}</RESPONSE>
             </PaymentRequestStatus>
          </CorpPaymentRequestResult>
       </CorpPaymentRequestResponse>
    </soap:Body>
 </soap:Envelope>`;
return responseError;
}

function writeGeneralErrorConfirmPay(error){

    var result = getErrorMsg(error);

    var responseError =`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Body>
       <CorpPaymentRequestConfirmResponse xmlns="http://tempuri.org/">
          <CorpPaymentRequestConfirmResult>
             <PaymentRequestConfirmStatus>
                <RESPONSE_DATA>${result.msg}</RESPONSE_DATA>
                <RESPONSE>${result.code}</RESPONSE>
             </PaymentRequestConfirmStatus>
          </CorpPaymentRequestConfirmResult>
       </CorpPaymentRequestConfirmResponse>
    </soap:Body>
 </soap:Envelope>`;
return responseError;
}



  function getErrorMsg(error){

    var finalResult;
    var code = 99;
    var msg = "فشلت العملية"
    findServErrorMsg().then(gottenData=>{
        
        var found = false;

        Object.keys(gottenData).forEach(function(key) {
            if(error.includes(gottenData[key]))
            {
                found = true;
                 finalResult = {
                    "code":key,
                    "msg":gottenData[key]
                }
                console.log(finalResult);
                return ;
            }
          })
    
          if(!found){
             finalResult = {
                "code":code,
                "msg":msg
            }
            console.log(finalResult);
            
          }
    
          return finalResult;
    }).catch(error=>{
        finalResult = {
            "code":code,
            "msg":msg
        }
        return finalResult;
    })

}

async function findServErrorMsg() {

    var errsMSG;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: "ErrorList", service_name:"upt", service_type:"getErrorMsg" }, (err, apiData) => {
        try {
            if (apiData[apiData.length - 1].responesData === undefined) {
                errsMSG = '';
                console.log("Qresponse is : undefined");
                reject(errsMSG);
            }
            else {
                errsMSG = apiData[apiData.length - 1].responesData;
                console.log("Qresponse is : " + errsMSG);
                resolve(errsMSG);
            }

        } catch (error) {
            errsMSG = '';
            console.log("Qresponse is : blank");
            reject(errsMSG);

        }


        console.log('55555555555555555555555555555555555555');
        console.log(errsMSG);


    });
});
    
}