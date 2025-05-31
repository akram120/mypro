
const request = require('request');
const xml2js = require('xml2js');
const xpath = require('xml2js-xpath');
const mainUrl = "http://apinew.uremit.ca/ReceiveAPI.svc?wsdl";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs = require('fs');
const CoSuccessCode = '01';
//var soapACtion;
//const xmldoc = require('xmldoc');
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');

var service_t;//=(jsonObject.service_info.service_type).toUpperCase();

function uremet_service(jsonObject, fullJson, callback) {
  var js;
  if ((jsonObject.service_info.service_type).toUpperCase() == Q_service_type || (jsonObject.service_info.service_type).toUpperCase() == P_service_type) {

    js = JSON.stringify(jsonObject);
    var typeServ = (jsonObject.service_info.service_type).toUpperCase();
    
    xmlPreperGetData(fullJson, function (xmlReturned) {
      console.log(xmlReturned);
      var serverJson = JSON.parse(js);
      var name = 'file' + serverJson.service_info.agent_or_Branch_Code + serverJson.service_info.username + '_xmlFile.xml'
      var remitNo = xpath.find(serverJson, '//urem:TransactionNo')[0]
      service_t = serverJson.service_info.service_type;
      getPayRemittanc(xmlReturned, name,typeServ, function (jsonData, fname, bodyReturned) {
        try {
          if (fs.existsSync(fname)) {
            fs.unlink(fname, (err) => {
              if (err) throw err;
              console.log(fname + ' was deleted');
            });
          }
        }
        catch (e) {
          console.error(e);

        }

        var Rem_no = "123"
        var Payment_Res_Code = '-1';


        if ((serverJson.service_info.service_type).toUpperCase() == Q_service_type) {
          var responseQ ;
          if('s:Envelope' in jsonData){
             responseQ = jsonData['s:Envelope']['s:Body']['DisplayCashTransactionForPayingResponse']['DisplayCashTransactionForPayingResult'];
          }
          
          Rem_no = xpath.find(serverJson, '//urem:TransactionNo')[0]
          let newData = new newApiRequest.insertData(
            {
              rem_no: Rem_no,
              transaction_id: Rem_no,
              service_name: serverJson.service_info.service_name,
              service_type: serverJson.service_info.service_type,
              system_name: serverJson.service_info.system_name,
              username: serverJson.service_info.username,
              agent_code: serverJson.service_info.agent_or_Branch_Code,
              agent_name: serverJson.service_info.agent_or_Branch_name,
              agent_address: serverJson.service_info.agent_or_Branch_addrs,
              date: Date.now(),
              requestData:xmlReturned,
              responesData: JSON.stringify(bodyReturned),
              Amounts:(responseQ['a:ResponseCode'] != '01'?"":responseQ['a:AmountToPay']),
              FirstName:(responseQ['a:ResponseCode'] != '01'?"":responseQ['a:ReceiverFirstName']) ,
              SecondName: (responseQ['a:ResponseCode'] != '01'?"":responseQ['a:ReceiverMiddleName']),
              ThirdName: (responseQ['a:ResponseCode'] != '01'?"":responseQ['a:ReceiverFourthName']),
              LastName: (responseQ['a:ResponseCode'] != '01'?"":responseQ['a:ReceiverLastName']),
              CustID: "",
              qRespones: bodyReturned,
              Request:JSON.stringify(fullJson)
            });
          var object_id;
          console.log(newData);
          newData.save(async (err, doc) => {
            if (!err) {

              console.log('record was added');
              callback(bodyReturned);
            }
            else {
              console.log(err);
              callback(bodyReturned);
            }
          });
        }

        else if ((serverJson.service_info.service_type).toUpperCase() == P_service_type) {
          service_t = serverJson.service_info.service_type;

          console.log(service_t)
          Rem_no = xpath.find(serverJson, '//urem:TransactionNo')[0]
          Payment_Res_Code = xpath.find(jsonData, '//a:ResponseCode')[0]
          console.log(Payment_Res_Code);
          if (Payment_Res_Code != CoSuccessCode) {
            let newData = new newApiRequest.insertData(
              {
                rem_no: Rem_no,
                transaction_id: Rem_no,
                service_name: serverJson.service_info.service_name,
                service_type: serverJson.service_info.service_type,
                system_name: serverJson.service_info.system_name,
                username: serverJson.service_info.username,
                agent_code: serverJson.service_info.agent_or_Branch_Code,
                agent_name: serverJson.service_info.agent_or_Branch_name,
                agent_address: serverJson.service_info.agent_or_Branch_addrs,
                date: Date.now(),
                requestData:xmlReturned,
                responesData: JSON.stringify(bodyReturned),
                FirstName: "",
                SecondName: "",
                ThirdName: "",
                LastName: "",
                CustID: "",
                pRespones: bodyReturned,
                Request:JSON.stringify(fullJson),
                remStatus: 0

              });
            var object_id;
            console.log(newData);
            newData.save(async (err, doc) => {
              if (!err) {


                console.log('record was added');
                callback(bodyReturned);
              }
              else {
                console.log(err);
                callback(bodyReturned);

              }
            });

          }
          else {
            GetReqest_Res(Rem_no, function (pData) {

              let newData = new newApiRequest.insertData(
                {

                  rem_no: Rem_no,
                  transaction_id: Rem_no,
                  service_name: serverJson.service_info.service_name,
                  service_type: serverJson.service_info.service_type,
                  system_name: serverJson.service_info.system_name,
                  username: serverJson.service_info.username,
                  agent_code: serverJson.service_info.agent_or_Branch_Code,
                  agent_name: serverJson.service_info.agent_or_Branch_name,
                  agent_address: serverJson.service_info.agent_or_Branch_addrs,
                  date: Date.now(),
                  requestData:xmlReturned,
                  responesData: JSON.stringify(bodyReturned),
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: pData,
                  pRespones: bodyReturned,
                  Request:JSON.stringify(fullJson),
                  remStatus: 1
                });
              var object_id;
              console.log(newData);
              newData.save(async (err, doc) => {
                if (!err) {

                  console.log('record was added');
                  callback(bodyReturned);
                }
                else {
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
module.exports.uremet_service = uremet_service;



function getPayRemittanc(body, fileName, serv, callback) {



  fs.writeFile(fileName, body
    , (err) => {
      if (err) console.log(err);

      console.log("Successfully Written to File.");
    });

  try {
    if(serv === Q_service_type){
      var url = "http://172.16.151.99:3150/uremet/query"
    } else{
      var url = "http://172.16.151.99:3150/uremet/pay"
    }
    var soapACtion;
    if (service_t == "p_rem") {
      soapACtion = "http://172.16.151.99:3150/uremet/pay"

    }
    else {
      soapACtion = "http://172.16.151.99:3150/uremet/query"


    };
    cmd.get(

      //  `curl --ssl-no-revoke -H   "Content-Type: text/xml" --header "SOAPAction: 'http://tempuri.org/IReceiveAPI/DisplayCashTransactionForPaying' ,'http://tempuri.org/IReceiveAPI/PayTranactionCashOrBank'  " --data-binary @${fileName}  ${mainUrl}` ,

      `curl --ssl-no-revoke -H   "Content-Type: text/xml" --header "SOAPAction: ${soapACtion} " --data-binary @${fileName}  ${url}`,

      function (err, data, stderr) {
        try {
          console.log(err);
          //var xsdDoc = x.parseXmlString(data);
          if (err == null) {
            try {
              parser.parseString(data, function (err, result) {
                if (err == null) {
                  callback(result, fileName, data);
                }
                else {
                  var test = new Object;
                  test.error = err;
                  test.res = stderr;
                  test.bdy = data
                  callback(test, fileName, data);
                }
              });
            } catch (error) {
              var test = new Object;
              test.error = error;
              test.res = stderr;
              test.bdy = data
              callback(test, fileName, data);
            }
          }
        } catch (error) {
          var test = new Object;
          test.error = error;
          test.res = stderr;
          test.bdy = data;
          callback(test, fileName, data);
        }
      });
  } catch (error) {
    var test = new Object;
    test.error = error;
    test.res = '';
    test.bdy = '';
    callback(test, 'Error curl Request');
  }
}

function xmlPreperGetData(json, callback) {

  var obj = new Object();
  obj = json;
  var x = delete obj['soapenv:Envelope']['soapenv:Body']["service_info"];
  var Returned_Data = new xml2js.Builder().buildObject(obj).replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  return callback(Returned_Data);
}


function GetReqest_Res(Rem_no, callback) {
  newApiRequest.insertData.findOne({ rem_no: Rem_no, service_type: 'q_rem' }).sort({ date: -1, Object_ID: 1 }).exec(async (err, getData) => {

    if(!err){
      try{
       return callback(getData.qRespones);
      } catch (error) {
        return callback("");
      }
    } else {
      return callback("");
    }
    

  });

}

function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;

}


function writeErrorLog(opNo,user,service,type,error){
return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
}

