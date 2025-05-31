
const request = require('request');
const xml2js = require('xml2js');
const xpath = require('xml2js-xpath');
const mainUrl = "http://86.96.193.147:8053/Service1.svc?wsdl";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs =require('fs');
const CoSuccessCode = '01';
//var soapACtion;
//const xmldoc = require('xmldoc');
var parser = new xml2js.Parser({explicitArray: false});
const newApiRequest= require('../../db_modal/alnoamanNewModal');

var service_t;//=(jsonObject.service_info.service_type).toUpperCase();

console.log("akram");

function DirectRemit_service(jsonObject, fullJson , callback)
{
  var js ; 
  
  if ((jsonObject.service_info.service_type).toUpperCase() == Q_service_type || (jsonObject.service_info.service_type).toUpperCase() == P_service_type)
  { 
   
      js = JSON.stringify(jsonObject);
      
      xmlPreperGetData(fullJson,function(xmlReturned){
        console.log(xmlReturned);
      var serverJson =  JSON.parse(js);

      var name = 'file' + serverJson.service_info.agent_or_Branch_Code + serverJson.service_info.username + '_xmlFile.xml'
     
      service_t=serverJson.service_info.service_type;
      getPayRemittanc(xmlReturned, name , function(jsonData,bodyReturned)
      {
       
        console.log(1)
        var Rem_no ="123"
        var Payment_Res_Code = '-1';
         
      
        if ((serverJson.service_info.service_type).toUpperCase() == Q_service_type)
        {
         // Rem_no =xpath.find(serverJson , '//urem:TransactionNo')[0] 
          /*let newData= new newApiRequest.insertData(
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
              CustID:"",
              qRespones: bodyReturned
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
            callback(`<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"><s:Body><DisplayCashTransactionForPayingResponse xmlns=\"http://tempuri.org/\"><DisplayCashTransactionForPayingResult xmlns:a=\"http://schemas.datacontract.org/2004/07/URemitWCFLib.Receive\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><a:AmountToPay>300.000000</a:AmountToPay><a:AmountToPayInWords>Three Hundred Only</a:AmountToPayInWords><a:ReceiveCountryCode>YE</a:ReceiveCountryCode><a:ReceiveCurrencyCode>USD</a:ReceiveCurrencyCode><a:ReceiverAddress>YEMAN SANAA</a:ReceiverAddress><a:ReceiverCity>.PAYOUT ANYWHERE - YE</a:ReceiverCity><a:ReceiverContactNo>967772685006</a:ReceiverContactNo><a:ReceiverFirstName>test remits receiver</a:ReceiverFirstName><a:ReceiverFourthName/><a:ReceiverLastName>FADELI</a:ReceiverLastName><a:ReceiverMiddleName/><a:ReceiverNationality>YE</a:ReceiverNationality><a:RequestDateTime>06/12/2021 13:56:47 GMT</a:RequestDateTime><a:ResponseCode>01</a:ResponseCode><a:ResponseDateTime>06/12/2021 13:56:47 GMT</a:ResponseDateTime><a:ResponseMessage>Successful API Call</a:ResponseMessage><a:SendCountryCode>JO</a:SendCountryCode><a:SendCurrencyCode i:nil=\"true\"/><a:SenderAddress>test remits sender</a:SenderAddress><a:SenderCity>AMMAN</a:SenderCity><a:SenderContactNo i:nil=\"true\"/><a:SenderFirstName>MANSOUR</a:SenderFirstName><a:SenderFourthName/><a:SenderIDNumber>07302190</a:SenderIDNumber><a:SenderIDType>PASSPORT</a:SenderIDType><a:SenderLastName>MOHAMMAD SAGHEERALSAIDI</a:SenderLastName><a:SenderMiddleName/><a:SenderNationality>YE</a:SenderNationality><a:Status>UnPaid</a:Status><a:Successful>true</a:Successful><a:TransactionDate>06/12/2021</a:TransactionDate><a:TransactionNo>2325919043339</a:TransactionNo></DisplayCashTransactionForPayingResult></DisplayCashTransactionForPayingResponse></s:Body></s:Envelope>`);

        }

        else if ((serverJson.service_info.service_type).toUpperCase() == P_service_type)
        {
            service_t=serverJson.service_info.service_type;
            
            console.log(service_t)
            Rem_no =xpath.find(serverJson , '//urem:TransactionNo')[0] 
          Payment_Res_Code = xpath.find(jsonData,'//a:ResponseCode')[0]
          console.log(Payment_Res_Code);
      if (Payment_Res_Code != CoSuccessCode)
      {
        /*let newData= new newApiRequest.insertData(
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
            CustID:"",
            remStatus: 0

          });
         var object_id;
          /*newData.save( async (err,doc)=> {
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
          callback(`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><PayTranactionCashOrBankResponse xmlns="http://tempuri.org/"><PayTranactionCashOrBankResult xmlns:a="http://schemas.datacontract.org/2004/07/URemitWCFLib.Receive" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><a:AgentReferenceNo>2325919043339</a:AgentReferenceNo><a:AmountToPay>5.000000</a:AmountToPay><a:AmountToPayInWords>Three Hundred Only</a:AmountToPayInWords><a:CommissionShareLC></a:CommissionShareLC><a:CommissionShareUSD></a:CommissionShareUSD><a:ReceiveCountryCode>YE</a:ReceiveCountryCode><a:ReceiveCurrencyCode>USD</a:ReceiveCurrencyCode><a:ReceiverMobileNo>772685006</a:ReceiverMobileNo><a:ReceiverOccupation/><a:RequestDateTime>06/12/2021 13:57:42 GMT</a:RequestDateTime><a:ResponseCode>01</a:ResponseCode><a:ResponseDateTime>06/12/2021 13:57:45 GMT</a:ResponseDateTime><a:ResponseMessage>Successful API Call</a:ResponseMessage><a:SenderRelationWithReceiver/><a:Status>Paid</a:Status><a:Successful>true</a:Successful><a:TransactionNo>2325919043339</a:TransactionNo></PayTranactionCashOrBankResult></PayTranactionCashOrBankResponse></s:Body></s:Envelope>`);


      }
      else
      {
GetReqest_Res (Rem_no , function(pData){
    /*
 let newData= new newApiRequest.insertData(
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
            CustID:"",
            qRespones: pData  , 
            pRespones: bodyReturned ,
            remStatus: 1
          });*/
         var object_id;
         callback(`<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"><s:Body><DisplayCashTransactionForPayingResponse xmlns=\"http://tempuri.org/\"><DisplayCashTransactionForPayingResult xmlns:a=\"http://schemas.datacontract.org/2004/07/URemitWCFLib.Receive\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><a:AmountToPay>300.000000</a:AmountToPay><a:AmountToPayInWords>Three Hundred Only</a:AmountToPayInWords><a:ReceiveCountryCode>YE</a:ReceiveCountryCode><a:ReceiveCurrencyCode>USD</a:ReceiveCurrencyCode><a:ReceiverAddress>YEMAN SANAA</a:ReceiverAddress><a:ReceiverCity>.PAYOUT ANYWHERE - YE</a:ReceiverCity><a:ReceiverContactNo>967775459171</a:ReceiverContactNo><a:ReceiverFirstName>NABEL ABDALLAH ALI ABDALLAH</a:ReceiverFirstName><a:ReceiverFourthName/><a:ReceiverLastName>FADELI</a:ReceiverLastName><a:ReceiverMiddleName/><a:ReceiverNationality>YE</a:ReceiverNationality><a:RequestDateTime>06/12/2021 13:56:47 GMT</a:RequestDateTime><a:ResponseCode>01</a:ResponseCode><a:ResponseDateTime>06/12/2021 13:56:47 GMT</a:ResponseDateTime><a:ResponseMessage>Successful API Call</a:ResponseMessage><a:SendCountryCode>JO</a:SendCountryCode><a:SendCurrencyCode i:nil=\"true\"/><a:SenderAddress>amman capetal sweilah a</a:SenderAddress><a:SenderCity>AMMAN</a:SenderCity><a:SenderContactNo i:nil=\"true\"/><a:SenderFirstName>MANSOUR</a:SenderFirstName><a:SenderFourthName/><a:SenderIDNumber>07302190</a:SenderIDNumber><a:SenderIDType>PASSPORT</a:SenderIDType><a:SenderLastName>MOHAMMAD SAGHEERALSAIDI</a:SenderLastName><a:SenderMiddleName/><a:SenderNationality>YE</a:SenderNationality><a:Status>UnPaid</a:Status><a:Successful>true</a:Successful><a:TransactionDate>06/12/2021</a:TransactionDate><a:TransactionNo>2325919043339</a:TransactionNo></DisplayCashTransactionForPayingResult></DisplayCashTransactionForPayingResponse></s:Body></s:Envelope>`);
         /*
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
        })
       
      } 
      }
      })

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
module.exports.DirectRemit_service = DirectRemit_service;



function getPayRemittanc(body , fileName, callback)
{ 

  fs.writeFile(fileName , body
    , (err) => {
       if (err) console.log(err);
       
       console.log("Successfully Written to File.");
     });


  try {
    var soapACtion;
    if ( service_t == "p_rem" ){
        soapACtion="http://tempuri.org/IReceiveAPI/PayTranactionCashOrBank";  
    }
    else 
      {  soapACtion='http://tempuri.org/IReceiveAPI/DisplayCashTransactionForPaying';
  
    };
    
    cmd.get(
       
      //  `curl2 --ssl-no-revoke -H   "Content-Type: text/xml" --header "SOAPAction: 'http://tempuri.org/IReceiveAPI/DisplayCashTransactionForPaying' ,'http://tempuri.org/IReceiveAPI/PayTranactionCashOrBank'  " --data-binary @${fileName}  ${mainUrl}` ,

      `curl2 --ssl-no-revoke -H   "Content-Type: text/xml" --header "SOAPAction: ${soapACtion} " --data-binary @${fileName}  ${mainUrl}` ,
      
      function(err, data, stderr){
      try {
        console.log(err);
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


function GetReqest_Res(Rem_no , callback)
{
    newApiRequest.insertData.findOne({rem_no: Rem_no, service_type : 'q_rem'}).sort({date:-1,Object_ID:1}).exec(async (err, getData) => 
    {
       
callback(getData.qRespones);

});

}

