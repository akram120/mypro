var xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');
const content_type = 'text/xml;charset=UTF-8';
const url = 'https://demo.jordanremit.com:2828/RFRemittancesAPI/RFRemittancesWebServices?wsdl';
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };


function Kamal_Server(requestXmlFromInternalSystem,callback) {

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
        var xmlRequestToKamal = builder.buildObject(result);
        console.log("///////////////////////////////////////////////////////////////////////////");
        console.log(xmlRequestToKamal);
        

     if ((serviceInfo.service_type).toUpperCase() == "Q_REM") {
        getRemitDetails(xmlRequestToKamal).then(result => {
            var jordanRemitResponseJSON = result['S:Envelope']['S:Body'];
            var builder = new xml2js.Builder();
            if(jordanRemitResponseJSON['ns2:getRemittanceForReceiveResponse']['return']['ns3:resultId']!=9000){
                var jordanRemitResponseXML = builder.buildObject(result);
                console.log(remitNO);
                var responseToInernalSystem = writeGeneralErrorQuery(jordanRemitResponseJSON['ns2:getRemittanceForReceiveResponse']['return']['ns3:resultMessage'],jordanRemitResponseJSON['ns2:getRemittanceForReceiveResponse']['return']['ns3:resultId'],no_server_error);
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
                        requestData: xmlRequestToKamal,
                        responesData: jordanRemitResponseXML,
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
                        var responseToInernalSystemE = writeGeneralErrorQuery(jordanRemitResponseJSON['ns2:getRemittanceForReceiveResponse']['return']['ns3:resultMessage'],jordanRemitResponseJSON['ns2:getRemittanceForReceiveResponse']['return']['ns3:resultId'],database_error);
                        callback(responseToInernalSystemE);
                    }
                });
            } else {
                    console.log("before assign value")
                    var detailedResponse = jordanRemitResponseJSON['ns2:getRemittanceForReceiveResponse']['return']['ns3:remittance'];
                    console.log("after assign value")
                    console.log(detailedResponse)
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
                            requestData: xmlRequestToKamal,
                            responesData: responseToInernalSystem,
                            Amounts: detailedResponse['ns3:amount'],
                            FirstName: detailedResponse['ns3:receiver']['ns3:enFirstName'],
                            SecondName: detailedResponse['ns3:receiver']['ns3:enLastName'],
                            ThirdName: "",
                            LastName: detailedResponse['ns3:receiver']['ns3:originalName'],
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
                    requestData: xmlRequestToKamal,
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
        parser.parseString(xmlRequestToKamal , function(err, resultConvertingToJS){
        findQResponse(remitNO).then(value=> {
            resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderFirstName'] = value.FirstName;
            resultConvertingToJS['soapenv:Envelope']['soapenv:Body']['ser:validateReceiveRemittance']['receiver']['rfap:idHolderLastName'] = value.SecondName;
            var builder = new xml2js.Builder();
            var requestReadyToSentToKamal = builder.buildObject(resultConvertingToJS); 
            validateRemit(requestReadyToSentToKamal).then(result =>{
                var jordanRemitResponseJSON = result['S:Envelope']['S:Body'];
                var builder = new xml2js.Builder();
                if(jordanRemitResponseJSON['ns2:validateReceiveRemittanceResponse']['return']['ns3:resultId']!=9000){
                    var jordanRemitResponseXML = builder.buildObject(result);
                    console.log(remitNO);
                    var responseToInernalSystem = writeGeneralErrorPay(jordanRemitResponseJSON['ns2:validateReceiveRemittanceResponse']['return']['ns3:resultMessage'],jordanRemitResponseJSON['ns2:validateReceiveRemittanceResponse']['return']['ns3:resultId'],no_server_error);
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
                            responesData: jordanRemitResponseXML,
                            Amounts: value.Amounts,
                            FirstName: value.FirstName,
                            SecondName: value.SecondName,
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
                            var responseToInernalSystemE = writeGeneralErrorPay(jordanRemitResponseJSON['ns2:validateReceiveRemittanceResponse']['return']['ns3:resultMessage'],jordanRemitResponseJSON['ns2:validateReceiveRemittanceResponse']['return']['ns3:resultId'],database_error);
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
                        var jordanRemitResponseJSON = resultReceive['S:Envelope']['S:Body'];
                        var builder = new xml2js.Builder();
                        if(jordanRemitResponseJSON['ns2:receiveRemittanceResponse']['return']['ns3:resultId']!=9000){
                            var jordanRemitResponseXML = builder.buildObject(resultReceive);
                            console.log(remitNO);
                            var responseToInernalSystem = writeGeneralErrorPayConfirm(jordanRemitResponseJSON['ns2:receiveRemittanceResponse']['return']['ns3:resultMessage'],jordanRemitResponseJSON['ns2:receiveRemittanceResponse']['return']['ns3:resultId'],no_server_error);
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
                                    responesData: jordanRemitResponseXML,
                                    Amounts: value.Amounts,
                                    FirstName: value.FirstName,
                                    SecondName: value.SecondName,
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
                                    var responseToInernalSystemE = writeGeneralErrorPayConfirm(jordanRemitResponseJSON['ns2:receiveRemittanceResponse']['return']['ns3:resultMessage'],jordanRemitResponseJSON['ns2:receiveRemittanceResponse']['return']['ns3:resultId'],database_error);
                                    callback(responseToInernalSystemE);
                                }
                            });
                        } else {
                            var jordanRemitResponseXML = builder.buildObject(resultReceive);
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
                                    responesData: jordanRemitResponseXML,
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
                    requestData: xmlRequestToKamal,
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


module.exports.Kamal_Server = Kamal_Server;





async function getRemitDetails(xml) {

    var  respS = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
    <S:Body>
       <ns2:getRemittanceForReceiveResponse xmlns:ns2="http://Services/" xmlns:ns3="http://xml.netbeans.org/schema/RFApiSchema">
          <return>
             <ns3:resultId>9000</ns3:resultId>
             <ns3:resultMessage>Operation completed successfully</ns3:resultMessage>
             <ns3:GUID>e3aaaceb-ad43-4f21-8fd1-deea8138b396</ns3:GUID>
             <ns3:remittance>
                <ns3:remittanceId>2200007594683</ns3:remittanceId>
                <ns3:referenceNumber/>
                <ns3:currencyIdPayout>USD</ns3:currencyIdPayout>
                <ns3:amount>100.0</ns3:amount>
                <ns3:buyRate>0.0</ns3:buyRate>
                <ns3:countryIdSource>JOR</ns3:countryIdSource>
                <ns3:countryNameSource>JORDAN</ns3:countryNameSource>
                <ns3:sourceCorrespondentNameOriginal>مؤسسة الزرقاء للصرافة</ns3:sourceCorrespondentNameOriginal>
                <ns3:sourceCorrespondentNameEnglish>Zarqa Exchange Est</ns3:sourceCorrespondentNameEnglish>
                <ns3:sendingDate>27/06/2022 11:07:22 AM</ns3:sendingDate>
                <ns3:serviceType>C</ns3:serviceType>
                <ns3:reasonCode>1256</ns3:reasonCode>
                <ns3:reasonChildCode>1425</ns3:reasonChildCode>
                <ns3:sender>
                   <ns3:enFirstName>Hasan</ns3:enFirstName>
                   <ns3:enLastName>Abdalkareem</ns3:enLastName>
                   <ns3:type>P</ns3:type>
                   <ns3:originalName>حسن محمود حسن عبدالكريم</ns3:originalName>
                   <ns3:professionId>1607</ns3:professionId>
                   <ns3:businessSectorId>0</ns3:businessSectorId>
                   <ns3:identityId>0</ns3:identityId>
                </ns3:sender>
                <ns3:receiver>
                   <ns3:enFirstName>Aws</ns3:enFirstName>
                   <ns3:enLastName>Abdalkareem</ns3:enLastName>
                   <ns3:type>P</ns3:type>
                   <ns3:originalName>اوس حسن محمود عبدالكريم</ns3:originalName>
                   <ns3:nationality>YEM</ns3:nationality>
                   <ns3:mobile>967-123456789</ns3:mobile>
                   <ns3:address>اليمن صنعاء</ns3:address>
                   <ns3:relationShipId>0</ns3:relationShipId>
                </ns3:receiver>
             </ns3:remittance>
          </return>
       </ns2:getRemittanceForReceiveResponse>
    </S:Body>
 </S:Envelope>`;

 var  respE = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
 <S:Body>
    <ns2:getRemittanceForReceiveResponse xmlns:ns2="http://Services/" xmlns:ns3="http://xml.netbeans.org/schema/RFApiSchema">
       <return>
          <ns3:resultId>9048</ns3:resultId>
          <ns3:resultMessage>Remittance not found</ns3:resultMessage>
          <ns3:GUID>ab3c28cb-9d66-4cf1-ba9e-1909fdcdd22c</ns3:GUID>
       </return>
    </ns2:getRemittanceForReceiveResponse>
 </S:Body>
</S:Envelope>`;

    var resultResponse;
    parser.parseString(respS, function (err, result) {
        
        console.log(result);
        // console.log("***********************************************************");
        // console.log("DETAILED RESPONSE");
        // console.log(result['S:Envelope']['S:Body']['ns2:getRemittanceForReceiveResponse']['return']);
        resultResponse = result;
    })
    return resultResponse;
}


async function validateRemit(xml) {

    var respS = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
    <S:Body>
       <ns2:validateReceiveRemittanceResponse xmlns:ns2="http://Services/" xmlns:ns3="http://xml.netbeans.org/schema/RFApiSchema">
          <return>
             <ns3:resultId>9000</ns3:resultId>
             <ns3:resultMessage>Operation completed successfully</ns3:resultMessage>
             <ns3:GUID>a6c86de8-7bba-4246-ad44-ffed887a097e</ns3:GUID>
             <ns3:remittanceId>2200007594683</ns3:remittanceId>
             <ns3:settlementAmount>0.0</ns3:settlementAmount>
             <ns3:correspondentCommissionAmount>0.0</ns3:correspondentCommissionAmount>
          </return>
       </ns2:validateReceiveRemittanceResponse>
    </S:Body>
 </S:Envelope>`;

 var respE = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
 <S:Body>
    <ns2:validateReceiveRemittanceResponse xmlns:ns2="http://Services/" xmlns:ns3="http://xml.netbeans.org/schema/RFApiSchema">
       <return>
          <ns3:resultId>9617</ns3:resultId>
          <ns3:resultMessage>Invalid Receiver Identity Id</ns3:resultMessage>
          <ns3:GUID>6deda62f-6a58-4e91-8bd6-607c34f714e6</ns3:GUID>
          <ns3:remittanceId>0</ns3:remittanceId>
          <ns3:settlementAmount>0.0</ns3:settlementAmount>
          <ns3:correspondentCommissionAmount>0.0</ns3:correspondentCommissionAmount>
       </return>
    </ns2:validateReceiveRemittanceResponse>
 </S:Body>
</S:Envelope>`;

    var resultResponse;
    parser.parseString(respS, function (err, result) {
        
        console.log(result);
        resultResponse = result;
    });
    return resultResponse;


}

async function receiveRemit(xml) {

    var respS = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
    <S:Body>
       <ns2:receiveRemittanceResponse xmlns:ns2="http://Services/" xmlns:ns3="http://xml.netbeans.org/schema/RFApiSchema">
          <return>
             <ns3:resultId>9000</ns3:resultId>
             <ns3:resultMessage>Operation completed successfully</ns3:resultMessage>
             <ns3:GUID>d3aa01b1-2329-40db-b4c4-b434574981b1</ns3:GUID>
             <ns3:remittanceId>2200007594683</ns3:remittanceId>
             <ns3:settlementAmount>100.0</ns3:settlementAmount>
             <ns3:currencyIdSettlement>USD</ns3:currencyIdSettlement>
             <ns3:correspondentCommissionAmount>5.0</ns3:correspondentCommissionAmount>
             <ns3:correspondentCommissionCurrencyId>USD</ns3:correspondentCommissionCurrencyId>
          </return>
       </ns2:receiveRemittanceResponse>
    </S:Body>
 </S:Envelope>`;

 var respE = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
 <S:Body>
    <ns2:receiveRemittanceResponse xmlns:ns2="http://Services/" xmlns:ns3="http://xml.netbeans.org/schema/RFApiSchema">
       <return>
          <ns3:resultId>9011</ns3:resultId>
          <ns3:resultMessage>System is closing, time is out of working hours</ns3:resultMessage>
       </return>
    </ns2:receiveRemittanceResponse>
 </S:Body>
</S:Envelope>`;
    var finalResult;
    parser.parseString(respS, function (err, result) {
        
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

    var detailedResponse = response['S:Envelope']['S:Body']['ns2:getRemittanceForReceiveResponse']['return'];
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
        <code_API>${detailedResponse['ns3:resultId']}</code_API>
         <msg_API>${detailedResponse['ns3:resultMessage']}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${detailedResponse['ns3:remittance']['ns3:remittanceId']}</rem_no>
        <trans_key></trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${detailedResponse['ns3:remittance']['ns3:amount']}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${detailedResponse['ns3:remittance']['ns3:currencyIdPayout']}</payout_cuyc>
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
        <f_name>${detailedResponse['ns3:remittance']['ns3:sender']['ns3:enFirstName']}</f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name>${detailedResponse['ns3:remittance']['ns3:sender']['ns3:enLastName']}</l_name>
        <full_name>${detailedResponse['ns3:remittance']['ns3:sender']['ns3:originalName']}</full_name>
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
        <f_name>${detailedResponse['ns3:remittance']['ns3:receiver']['ns3:enFirstName']}</f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name>${detailedResponse['ns3:remittance']['ns3:receiver']['ns3:enLastName']}</l_name>
        <full_name>${detailedResponse['ns3:remittance']['ns3:receiver']['ns3:originalName']}</full_name>
        <telephone></telephone>
        <mobile>${detailedResponse['ns3:remittance']['ns3:receiver']['ns3:mobile']}</mobile>
        <address></address>
        <nationality_coyc>${detailedResponse['ns3:remittance']['ns3:receiver']['ns3:nationality']}</nationality_coyc>
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
        <sending_reason>${detailedResponse['ns3:remittance']['ns3:reasonChildCode']}</sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_date>${detailedResponse['ns3:remittance']['ns3:sendingDate']}</the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}



function writeConfirmPayResponse(response,ServerData){

    var detailedResponse = response['S:Envelope']['S:Body']['ns2:receiveRemittanceResponse']['return'];

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
        <code_API>${detailedResponse['ns3:resultId']}</code_API>
         <msg_API>${detailedResponse['ns3:resultMessage']}</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_com>${detailedResponse['ns3:correspondentCommissionAmount']}</rem_com>
      </rem_info>
      </ns:PaymentRem_respons>
      </env:Body>
      </env:Envelope>`
}