const xml2js = require('xml2js');
const xpath = require('xml2js-xpath');
const mainUrl = "https://extws.moneygram.com/extws/services/AgentConnect1512";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs =require('fs')
//const xmldoc = require('xmldoc');
var parser = new xml2js.Parser({explicitArray: false});
const CoSuccessCode = 'SUCCESS';
const newApiRequest= require('../../db_modal/alnoamanNewModal');


function monyegram_service(jsonObject, fullJson , callback)
{
  var js ; 
    
  if (((jsonObject['soapenv:Body'].service_info.service_type).toUpperCase() == Q_service_type))
  {
      js = JSON.stringify(jsonObject);
      xmlPreperGetData(fullJson,function(xmlReturned){
      var serverJson =  JSON.parse(js);
      var name = 'file' + serverJson['soapenv:Body'].service_info.agent_or_Branch_Code + serverJson['soapenv:Body'].service_info.username + '_xmlFile.xml'
      getPayRemittanc(xmlReturned, name , function(jsonData,bodyReturned)
      {
          
          var Rem_no =  xpath.find(serverJson , '//tem:rem_no')[0] //serverJson['soapenv:Body']['tem:CorpGetTransferInfo']['tem:obj']['tem:UPT_REF']       
        let newData= new newApiRequest.insertData(
          {
            rem_no :Rem_no,
            transaction_id: Rem_no,
            service_name :serverJson['soapenv:Body'].service_info.service_name,
            service_type :serverJson['soapenv:Body'].service_info.service_type,
            system_name: serverJson['soapenv:Body'].service_info.system_name,
            username:serverJson['soapenv:Body'].service_info.username,
            agent_code :serverJson['soapenv:Body'].service_info.agent_or_Branch_Code,
            agent_name :serverJson['soapenv:Body'].service_info.agent_or_Branch_name,
            agent_address :serverJson['soapenv:Body'].service_info.agent_or_Branch_addrs,
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
          }); 
      });
      });
   
  }


  else if ((jsonObject['soapenv:Body'].service_info.service_type).toUpperCase() == P_service_type)
  {
    js = JSON.stringify( jsonObject);
    xmlPreperGetData(fullJson,function(xmlReturned){
    var serverJson =  JSON.parse(js);
    var name = 'file' + serverJson['soapenv:Body'].service_info.agent_or_Branch_Code + serverJson['soapenv:Body'].service_info.username + '_xmlFile.xml'
    getPayRemittanc(xmlReturned, name , function(jsonData,bodyReturned)
    {
        Rem_no = xpath.find(serverJson , '//tem:rem_no')[0]  ; //serverJson['soapenv:Body']['tem:CorpPaymentRequest']['tem:obj']['tem:UPT_REF']  
      let newData= new newApiRequest.insertData(
        {
          rem_no :Rem_no,
          transaction_id:Rem_no,
          service_name :serverJson['soapenv:Body'].service_info.service_name,
          service_type :serverJson['soapenv:Body'].service_info.service_type,
          system_name: serverJson['soapenv:Body'].service_info.system_name,
          username:serverJson['soapenv:Body'].service_info.username,
          agent_code :serverJson['soapenv:Body'].service_info.agent_or_Branch_Code,
          agent_name :serverJson['soapenv:Body'].service_info.agent_or_Branch_name,
          agent_address :serverJson['soapenv:Body'].service_info.agent_or_Branch_addrs,
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
            var header =xpath.find(serverJson,'//tem:WsSystemUserInfo')
            var conf =xpath.find(jsonData,'//CorpPaymentRequestResult')
            if(conf.length > 0 )
            {
                var chk= xpath.find(jsonData,'//PaymentRequestStatus')
                var ref = xpath.find(jsonData,'//UPT_PAYMENT_REF_OUT') 
                console.log(ref)
                if ((chk[0].RESPONSE).toUpperCase() == CoSuccessCode && ref[0].length > 0)
                {
                  var pereperConf= preperXmlConfirmation(header[0], conf[0]);

                  getPayRemittanc(pereperConf, name , function(jsonData,bodyReturned)
                  {
                      var Rem_no ;
                       Rem_no =xpath.find(serverJson , '//tem:rem_no')[0] ; //serverJson['soapenv:Body']['tem:CorpPaymentRequest']['tem:obj']['tem:UPT_REF'] 
                       GetReqest_Res(Rem_no , (pData)=>{
                        Res_Code = (xpath.find( jsonData, '//RESPONSE')[0]).toUpperCase();
                        let newData= new newApiRequest.insertData(
                          {
                            rem_no :Rem_no,
                            transaction_id: Rem_no,
                            service_name :serverJson['soapenv:Body'].service_info.service_name,
                            service_type :'Confirm'.toUpperCase(),
                            system_name: serverJson['soapenv:Body'].service_info.system_name,
                            username:serverJson['soapenv:Body'].service_info.username,
                            agent_code :serverJson['soapenv:Body'].service_info.agent_or_Branch_Code,
                            agent_name :serverJson['soapenv:Body'].service_info.agent_or_Branch_name,
                            agent_address :serverJson['soapenv:Body'].service_info.agent_or_Branch_addrs,
                            date:Date.now(),
                            responesData:JSON.stringify(bodyReturned),
                            FirstName:"",
                            SecondName:"",
                            ThirdName:"",
                            LastName:"",
                            CustID:"",
                            qRespones: (Res_Code == CoSuccessCode ? pData   : '')  , 
                            pRespones: (Res_Code == CoSuccessCode ? bodyReturned : '') ,
                            remStatus: (Res_Code == CoSuccessCode ?  1 : 0) 

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
                   
                  })
                }
                else
                {
                  callback(bodyReturned);  
                }
            }
            else{
              callback(bodyReturned);
            }
           
          }
          else
          {
            console.log(err);
            callback(bodyReturned);
          }
        }); 
    }); 
     });
  }
}
module.exports.monyegram_service = monyegram_service;





function getPayRemittanc(body , fileName, callback)
{
  fs.writeFile(fileName , body
    , (err) => {
       if (err) console.log(err);
       console.log("Successfully Written to File.");
     });

  try {
    cmd.get(
      `curl2 --ssl-no-revoke   -H "Content-Type: text/xml"  --data-binary @${fileName}  ${mainUrl}` ,
      function(err, data, stderr){
        console.log(err);
      try {
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
    var x = delete json['soapenv:Envelope']['soapenv:Body']["service_info"];

     var Returned_Data = new xml2js.Builder().buildObject(json).replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',"");
     callback(Returned_Data);
}

function preperXmlConfirmation(HeaderJson, ConfirmationJson)

{ 

    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
    <soapenv:Header>
       <tem:WsSystemUserInfo>
          <tem:Username>${HeaderJson['tem:Username']}</tem:Username>
          <tem:Password>${HeaderJson['tem:Password']}</tem:Password>
       </tem:WsSystemUserInfo>
    </soapenv:Header>
    <soapenv:Body>
       <tem:CorpPaymentRequestConfirm>
          <tem:obj>
             <tem:UPT_REF>${ConfirmationJson.UPT_REF}</tem:UPT_REF>
             <tem:UPT_PAYMENT_REF>${ConfirmationJson.UPT_PAYMENT_REF_OUT}</tem:UPT_PAYMENT_REF>
          </tem:obj>
       </tem:CorpPaymentRequestConfirm>
    </soapenv:Body>
 </soapenv:Envelope>`
 
}

function GetReqest_Res(Rem_no , callback)
{
    newApiRequest.insertData.findOne({rem_no: Rem_no, service_type : 'q_rem'}).sort({date:-1,Object_ID:1}).exec(async (err, getData) => 
    {
       
callback(getData.qRespones);

});

}