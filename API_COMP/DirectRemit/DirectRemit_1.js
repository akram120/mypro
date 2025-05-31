
const request = require('request');
const xml2js = require('xml2js');
const xpath = require('xml2js-xpath');
const mainUrl = "http://86.96.193.147:8053/Service1.svc?wsdl";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs =require('fs');
const CoSuccessCode = '1';
//const xmldoc = require('xmldoc');
var parser = new xml2js.Parser({explicitArray: false});
const newApiRequest= require('../../db_modal/alnoamanNewModal');



function DirectRemit_service(jsonObject, fullJson , callback)
{
  var js ; 
  //console.log(jsonObject);
  if ((jsonObject.service_info.service_type).toUpperCase() == Q_service_type || (jsonObject.service_info.service_type).toUpperCase() == P_service_type)
  {
      js = JSON.stringify(jsonObject);
      xmlPreperGetData(fullJson,function(xmlReturned){
      var serverJson =  JSON.parse(js);
      var name = 'file' + serverJson.service_info.agent_or_Branch_Code + '_xmlFile.xml'
      getPayRemittanc(xmlReturned, name , function(jsonData,bodyReturned)
      {
        console.log(1);
        var Rem_no ="123"
        var Payment_Res_Code = '-1';
          console.log(xpath.find(jsonData,'//StatusCode'))

        if ((serverJson.service_info.service_type).toUpperCase() == Q_service_type)
        {
          //("PTCNNO",JSON.stringify(GetReceiveTransaction.$.PTCNNo)); //
           Rem_no =  serverJson['tem:GetReceiveTransaction']['tem:value'][0].PTCNNO;
           
          // console.log(rresult.GetReceiveTransaction.$.PTCNNo + 'PVDF');
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
              qRespones: bodyReturned
            });
           var Object_ID;
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
        }

        else if ((serverJson.service_info.service_type).toUpperCase() == P_service_type)
        {
          Rem_no = '219353811004'; 
          //serverJson['tem:ConfirmReceiveTransaction']['CDATA'].PTCNNo;
            //xpath.find(serverJson , '//PTCNNo')[0];// 
          Payment_Res_Code = xpath.find(jsonData,'//StatusCode')[0];
          console.log(Payment_Res_Code);
      if (Payment_Res_Code != CoSuccessCode)
      {
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
            remStatus: 0

          });
         var Object_ID;
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

      }
      else
      {
GetReqest_Res (Rem_no , function(pData){
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
          });
         var Object_ID;
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
       
      } 
      }
      })
       
        

       });
   
  }
 
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
    cmd.get(
      `curl2 --ssl-no-revoke  -H "Content-Type: text/xml"  --data-binary @${fileName}  ${mainUrl}` ,
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

