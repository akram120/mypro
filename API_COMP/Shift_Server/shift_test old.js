const { ConnectionStates } = require('mongoose');
const request = require('request');
const xml2js = require('xml2js');
//const xpath = require('xml2js-xpath');
const mainUrl = "https://demo.shift-sg-api.com:1662/SHIFTApiV2/SHIFTApiV2Service?wsdl";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs =require('fs')
//const xmldoc = require('xmldoc');
var parser = new xml2js.Parser({explicitArray: false});
const newApiRequest= require('../../db_modal/alnoamanNewModal');


function shift_service(jsonObject, fullJson , callback)
{
  var js ; 
  //console.log(jsonObject);
  if ((jsonObject.service_info.service_type).toUpperCase() == Q_service_type || ((jsonObject.service_info.service_type).toUpperCase() == P_service_type))
  {
      js = JSON.stringify(jsonObject);
      xmlPreperGetData(fullJson,function(xmlReturned){
      var serverJson =  JSON.parse(js);
      var name = 'file' + serverJson.service_info.agent_or_Branch_Code + '_xmlFile.xml'
     // getPayRemittanc(xmlReturned, name , function(jsonData,bodyReturned)
    //  {
        var Rem_no ="123"
        if ((serverJson.service_info.service_type).toUpperCase() == Q_service_type)
        {
         // Rem_no =serverJson['web:getRemittanceForReceive'].remittancTrackingCode       
callback(`<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><ns2:getRemittanceForReceiveResponse xmlns:ns2=\"http://webservice/\" xmlns:ns3=\"http://xml.netbeans.org/schema/ApiSchema\"><return><ns3:resultCode>9000</ns3:resultCode><ns3:resultMessage>Operation successfully</ns3:resultMessage><ns3:remittanceInfo><ns3:remittanceTrackingCode>57232169312</ns3:remittanceTrackingCode><ns3:remittanceRecordingDate>16/01/2021 09:08:52 AM</ns3:remittanceRecordingDate><ns3:sendingCountryCode>JOR</ns3:sendingCountryCode><ns3:destintationCountryCode>YEM</ns3:destintationCountryCode><ns3:payingAmount>0.0</ns3:payingAmount><ns3:PayoutAmount>10</ns3:PayoutAmount><ns3:payoutCurrencyCode>SAR</ns3:payoutCurrencyCode><ns3:remittanceStatus>READY</ns3:remittanceStatus><ns3:payoutSettlementRate>10</ns3:payoutSettlementRate><ns3:settlementPayoutAmount>10</ns3:settlementPayoutAmount><ns3:settlementPayingAmount>0.0</ns3:settlementPayingAmount><ns3:payingAmountSettlementRate>0.0</ns3:payingAmountSettlementRate><ns3:receiveOrderCode>I1304998987</ns3:receiveOrderCode><ns3:sender><ns3:senderId>365263</ns3:senderId><ns3:type>1</ns3:type><ns3:firstName>Haneen</ns3:firstName><ns3:middelName>Jamal</ns3:middelName><ns3:lastName>Qasem</ns3:lastName><ns3:telephone>962795393636</ns3:telephone><ns3:mobile>052025022</ns3:mobile><ns3:address>amman</ns3:address><ns3:nationalityCountryCode>JOR</ns3:nationalityCountryCode><ns3:birthDateOrEstablishDate>25/11/1993</ns3:birthDateOrEstablishDate><ns3:identityTypeCode>0</ns3:identityTypeCode></ns3:sender><ns3:receiver><ns3:receiverId>509955</ns3:receiverId><ns3:type>1</ns3:type><ns3:firstName>Ayham</ns3:firstName><ns3:middelName>Mohammad</ns3:middelName><ns3:lastName>Momani</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>1564564564</ns3:mobile><ns3:address>sanaa taiz st</ns3:address><ns3:nationalityCountryCode>YEM</ns3:nationalityCountryCode><ns3:identityTypeCode>0</ns3:identityTypeCode></ns3:receiver><ns3:payingToPayoutRate>0.0</ns3:payingToPayoutRate><ns3:sendingReason>Treatment Medication</ns3:sendingReason></ns3:remittanceInfo></return></ns2:getRemittanceForReceiveResponse></S:Body></S:Envelope>`)

        }

        else if ((serverJson.service_info.service_type).toUpperCase() == P_service_type)
        {
          //Rem_no =serverJson['web:receiveRemittance'].remittancTrackingCode
          callback(`<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><ns2:receiveRemittanceResponse xmlns:ns2=\"http://webservice/\" xmlns:ns3=\"http://xml.netbeans.org/schema/ApiSchema\"><return><ns3:resultCode>9000</ns3:resultCode><ns3:resultMessage>Operation successfully</ns3:resultMessage><ns3:agentChargesShareCurrencyCod>USD</ns3:agentChargesShareCurrencyCod><ns3:agentChargesShare>2.39</ns3:agentChargesShare><ns3:agentFXChargesShare>0.35</ns3:agentFXChargesShare></return></ns2:receiveRemittanceResponse></S:Body></S:Envelope>`);
        }

       

       /* let newData= new newApiRequest.insertData(
          {
            rem_no :Rem_no,
            transaction_id: Rem_no,
            service_name :serverJson.service_info.service_name,
            service_type :serverJson.service_info.service_type,
            system_name: serverJson.service_info.system_name,
            username:serverJson.service_info.username,
            agent_code :serverJson.service_info.agent_or_Branch_Code,
            agent_name :serverJson.service_info.agent_or_Branch_name,
            agent_address :serverJson.service_info.agent_or_Branch_addrs,
            date:Date.now(),
            responesData:JSON.stringify(bodyReturned),
            FirstName:"",
            SecondName:"",
            ThirdName:"",
            LastName:"",
            CustID:""
          });
         var object_id;
          newData.save( async (err,doc)=> {
            if(!err){
              console.log('record was added');
              callback(bodyReturned);
            }
            else
            {
              console.log(err);
              callback(bodyReturned);
            }
          });*/
        

        
      
         
     // })
       
        

       });
   
  }
 /* else if ((jsonObject.service_info.service_type).toUpperCase() == P_service_type)
  {
    js = JSON.stringify( jsonObject);
    xmlPreperGetData(fullJson,function(xmlReturned){
    var serverJson =  JSON.parse(js);
    var name = 'file' + serverJson.service_info.agent_or_Branch_Code + '_xmlFile.xml'
    PayRemittance(xmlReturned, name , function(jsonData,bodyReturned)
    {
     

      let newData= new newApiRequest.insertData(
        {
          rem_no :serverJson['web:receiveRemittance'].remittancTrackingCode,
          transaction_id: serverJson['web:receiveRemittance'].remittancTrackingCode,
          service_name :serverJson.service_info.service_name,
          service_type :serverJson.service_info.service_type,
          system_name: serverJson.service_info.system_name,
          username:serverJson.service_info.username,
          agent_code :serverJson.service_info.agent_or_Branch_Code,
          agent_name :serverJson.service_info.agent_or_Branch_name,
          agent_address :serverJson.service_info.agent_or_Branch_addrs,
          date:Date.now(),
          responesData:JSON.stringify(bodyReturned),
          FirstName:"",
          SecondName:"",
          ThirdName:"",
          LastName:"",
          CustID:""
        });
       var object_id;
        newData.save( async (err,doc)=> {
          if(!err){
            console.log('record was added');
            callback(bodyReturned);
          }
          else
          {
            console.log(err);
            callback(bodyReturned);
          }
        });
      

      
    
       
    })
     
      

     });
  }*/
}
module.exports.shift_service = shift_service;





function getPayRemittanc(body , fileName, callback)
{
  fs.writeFile(fileName , body
    , (err) => {
       if (err) console.log(err);
       console.log("Successfully Written to File.");
     });

  try {
    cmd.get(
      `curl2  -H "Content-Type: text/xml"  --data-binary @${fileName}  ${mainUrl}` ,
      function(err, data, stderr){
      try {
        console.log(data);
         var xsdDoc = x.parseXmlString(data);
         
         if (err == null) {
          try {
           parser.parseString(data , function(err, result){
             if(err == null)
             {
                callback(result,data);
             }
             else
             {
              var test=new Object; 
              test.error = err;
              test.res=stderr;
              test.bdy=data 
              callback(test,data);
             }
           });
          } catch (error) {
           var test=new Object; 
           test.error = error;
           test.res=stderr;
           test.bdy=data 
           callback(test,data);
          }
        }
      } catch (error) {
        var test=new Object; 
        test.error = error;
        test.res=stderr;
        test.bdy=data 
        callback(test,data);
      }   
       });
  } catch (error) {
    var test=new Object; 
    test.error = error;
    test.res='';
    test.bdy='' 
    callback(test,'Error curl Request');
  }
}





function xmlPreperGetData(json ,callback)
{
   
    var obj = new Object();
    obj = json;
    var x = delete obj['soapenv:Envelope']['soapenv:Body']["service_info"];
     var Returned_Data = new xml2js.Builder().buildObject(obj).replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',"");
    return callback(Returned_Data);
}