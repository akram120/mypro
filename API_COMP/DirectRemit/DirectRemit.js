
const request = require('request');
const xml2js = require('xml2js');
const xpath = require('xml2js-xpath');
const mainUrl = "http://api.directremitworldwide.com/Service1.svc";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs = require('fs');
const util= require('util');
// const xmltojs = request('xml-js');
var convert = require('xml-js');
const CoSuccessCode = '1';
//var soapACtion;
//const xmldoc = require('xmldoc');
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');

var service_t;//=(jsonObject.service_info.service_type).toUpperCase();

function DirectRemit_service(jsonObject, fullJson, callback) {
  var js;

  if ((jsonObject.service_info.service_type).toUpperCase() == Q_service_type || (jsonObject.service_info.service_type).toUpperCase() == P_service_type) {

    js = JSON.stringify(jsonObject);
    var bodyNoCdata_q = '';
    xmlPreperGetData(fullJson, function (xmlReturned) {
      console.log(xmlReturned+'11111111111111111555555555555555');
      var serverJson = JSON.parse(js);

      var name = 'file' + serverJson.service_info.agent_or_Branch_Code + serverJson.service_info.username + '_xmlFile.xml'

      service_t = serverJson.service_info.service_type;
      getPayRemittanc(xmlReturned, name, function (jsonData, fname, bodyReturned) {


       var Status = bodyReturned.split('&lt;Status&gt;').pop().split('&lt;/Status&gt;&#xD;')[0];
       var StatusCode = bodyReturned.split('&lt;StatusCode&gt;').pop().split('&lt;/StatusCode&gt;&#xD;')[0];
       var Message = bodyReturned.split('&lt;Message&gt;').pop().split('&lt;/Message&gt;&#xD;')[0];
       var PTCNNo = bodyReturned.split('&lt;PTCNNo&gt;').pop().split('&lt;/PTCNNo&gt;&#xD;')[0];
       var PayOutRefno = bodyReturned.split('&lt;PayOutRefno&gt;').pop().split('&lt;/PayOutRefno&gt;&#xD;')[0];
       var TxnDate = bodyReturned.split('&lt;TxnDate&gt;').pop().split('&lt;/TxnDate&gt;&#xD;')[0];
       var FCAmt = bodyReturned.split('&lt;FCAmt&gt;').pop().split('&lt;/FCAmt&gt;&#xD;')[0];
       var USDAmount = bodyReturned.split('&lt;USDAmount&gt;').pop().split('&lt;/USDAmount&gt;&#xD;')[0];
       var TxnStatus = bodyReturned.split('&lt;TxnStatus&gt;').pop().split('&lt;/TxnStatus&gt;&#xD;')[0];
       var StatusDescription = bodyReturned.split('&lt;StatusDescription&gt;').pop().split('&lt;/StatusDescription&gt;&#xD;')[0];
       var OrgCntry = bodyReturned.split('&lt;OrgCntry&gt;').pop().split('&lt;/OrgCntry&gt;&#xD;')[0];
       var OrgCurr = bodyReturned.split('&lt;OrgCurr&gt;').pop().split('&lt;/OrgCurr&gt;&#xD;')[0];
       var PdtCode = bodyReturned.split('&lt;PdtCode&gt;').pop().split('&lt;/PdtCode&gt;&#xD;')[0];
       var RemGender = bodyReturned.split('&lt;RemGender&gt;').pop().split('&lt;/RemGender&gt;&#xD;')[0];
       var RemIDType = bodyReturned.split('&lt;RemIDType&gt;').pop().split('&lt;/RemIDType&gt;&#xD;')[0];
       var RemIDNo = bodyReturned.split('&lt;RemIDNo&gt;').pop().split('&lt;/RemIDNo&gt;&#xD;')[0];
       var RemFNme = bodyReturned.split('&lt;RemFNme&gt;').pop().split('&lt;/RemFNme&gt;&#xD;')[0];
       var RemSNme = bodyReturned.split('&lt;RemSNme&gt;').pop().split('&lt;/RemSNme&gt;&#xD;')[0];
       var RemTNme = bodyReturned.split('&lt;RemTNme&gt;').pop().split('&lt;/RemTNme&gt;&#xD;')[0];
       var RemLNme = bodyReturned.split('&lt;RemLNme&gt;').pop().split('&lt;/RemLNme&gt;&#xD;')[0];
       var RemMob = bodyReturned.split('&lt;RemMob&gt;').pop().split('&lt;/RemMob&gt;&#xD;')[0];
       var RemNat = bodyReturned.split('&lt;RemNat&gt;').pop().split('&lt;/RemNat&gt;&#xD;')[0];
       var RemAdd1 = bodyReturned.split('&lt;RemAdd1&gt;').pop().split('&lt;/RemAdd1&gt;&#xD;')[0];
       var RemCntry = bodyReturned.split('&lt;RemCntry&gt;').pop().split('&lt;/RemCntry&gt;&#xD;')[0];
       var RemDOB = bodyReturned.split('&lt;RemDOB&gt;').pop().split('&lt;/RemDOB&gt;&#xD;')[0];
       var BeneType = bodyReturned.split('&lt;BeneType&gt;').pop().split('&lt;/BeneType&gt;&#xD;')[0];
       var BeneFName = bodyReturned.split('&lt;BeneFName&gt;').pop().split('&lt;/BeneFName&gt;&#xD;')[0];
       var BeneSName = bodyReturned.split('&lt;BeneSName&gt;').pop().split('&lt;/BeneSName&gt;&#xD;')[0];
       var BeneTName = bodyReturned.split('&lt;BeneTName&gt;').pop().split('&lt;/BeneTName&gt;&#xD;')[0];
       var BeneLName = bodyReturned.split('&lt;BeneLName&gt;').pop().split('&lt;/BeneLName&gt;&#xD;')[0];
       var BeneAdd1 = bodyReturned.split('&lt;BeneAdd1&gt;').pop().split('&lt;/BeneAdd1&gt;&#xD;')[0];
       var BeneCntry = bodyReturned.split('&lt;BeneCntry&gt;').pop().split('&lt;/BeneCntry&gt;&#xD;')[0];
       var BeneMob = bodyReturned.split('&lt;BeneMob&gt;').pop().split('&lt;/BeneMob&gt;&#xD;')[0];
       var PayoutCurrCode = bodyReturned.split('&lt;PayoutCurrCode&gt;').pop().split('&lt;/PayoutCurrCode&gt;&#xD;')[0];
       var PayoutAmount = bodyReturned.split('&lt;PayoutAmount&gt;').pop().split('&lt;/PayoutAmount&gt;&#xD;')[0];
       var PayoutRate = bodyReturned.split('&lt;PayoutRate&gt;').pop().split('&lt;/PayoutRate&gt;&#xD;')[0];
       var OrgAmount = bodyReturned.split('&lt;OrgAmount&gt;').pop().split('&lt;/OrgAmount&gt;&#xD;')[0];
       var POT = bodyReturned.split('&lt;POT&gt;').pop().split('&lt;/POT&gt;&#xD;')[0];
       var SourceIncome = bodyReturned.split('&lt;SourceIncome&gt;').pop().split('&lt;/SourceIncome&gt;&#xD;')[0];
       var BackendCharge = bodyReturned.split('&lt;BackendCharge&gt;').pop().split('&lt;/BackendCharge&gt;&#xD;')[0];
       
       if (Status ==="1" &&StatusCode==="1" )
       {
        bodyNoCdata_q=
       `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
       <s:Body>
       <GetReceiveTransactionResponse xmlns="http://tempuri.org/">
       <GetReceiveTransactionResult>  </GetReceiveTransactionResult>
       <Status>${Status}</Status>
       <StatusCode>${StatusCode}</StatusCode>
       <Message>${Message}</Message>
       <PTCNNo>${PTCNNo}</PTCNNo>
       <PayOutRefno>${PayOutRefno}</PayOutRefno>
       <TxnDate>${TxnDate}</TxnDate>
       <FCAmt>${FCAmt}</FCAmt>
       <USDAmount>${USDAmount}</USDAmount>
       <TxnStatus>${TxnStatus}</TxnStatus>
       <StatusDescription>${StatusDescription}</StatusDescription>
       <OrgCntry>${OrgCntry}</OrgCntry>
       <OrgCurr>${OrgCurr}</OrgCurr>
       <PdtCode>${PdtCode}</PdtCode>
       <RemGender>${RemGender}</RemGender>
       <RemIDType>${RemIDType}</RemIDType>
       <RemIDNo>${RemIDNo}</RemIDNo>
       <RemFNme>${RemFNme}</RemFNme>
       <RemSNme>${RemSNme}</RemSNme>
       <RemTNme>${RemTNme}</RemTNme>
       <RemLNme>${RemLNme}</RemLNme>
       <RemMob>${RemMob}</RemMob>
       <RemNat>${RemNat}</RemNat>
       <RemAdd1>${RemAdd1}</RemAdd1>
       <RemCntry>${RemCntry}</RemCntry>
       <RemDOB>${RemDOB}</RemDOB>
       <BeneType>${BeneType}</BeneType>
       <BeneFName>${BeneFName}</BeneFName>
       <BeneSName>${BeneSName}</BeneSName>
       <BeneTName>${BeneTName}</BeneTName>
       <BeneLName>${BeneLName}</BeneLName>
       <BeneAdd1>${BeneAdd1}</BeneAdd1>
       <BeneCntry>${BeneCntry}</BeneCntry>
       <BeneMob>${BeneMob}</BeneMob>
       <PayoutCurrCode>${PayoutCurrCode}</PayoutCurrCode>
       <PayoutAmount>${PayoutAmount}</PayoutAmount>
       <PayoutRate>${PayoutRate}</PayoutRate>
       <OrgAmount>${OrgAmount}</OrgAmount>
       <POT>${POT}</POT>
       <SourceIncome>${SourceIncome}</SourceIncome>
       <BackendCharge>${BackendCharge}</BackendCharge>
       
       </GetReceiveTransactionResponse>
       </s:Body>
       </s:Envelope>
       `
       }

       else 
       {
        bodyNoCdata_q=
        `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
        <s:Body>
        <GetReceiveTransactionResponse xmlns="http://tempuri.org/">
        <GetReceiveTransactionResult>  </GetReceiveTransactionResult>
        <Status>${Status}</Status>
        <StatusCode>${StatusCode}</StatusCode>
        <Message>${Message}</Message>
        </GetReceiveTransactionResponse>
        </s:Body>
        </s:Envelope>
        `
       }
      
       // var bodyReturnedStringify = JSON.stringify(bodyReturned);
      //console.log(bodyReturned.replace('&lt;','<')+"xmllllllllll");
      // console.log(bodyReturnedStringify+"===========================");
      //console.log("///////////"+body_cdata+"   /////////////////////////////////");
 
  
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
          
           Rem_no = xmlReturned.split('&lt;PTCNNo&gt;').pop().split('&lt;/PTCNNo&gt;')[0];
          
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
              responesData: bodyReturned,
              Amounts:FCAmt,
              FirstName: BeneFName,
              SecondName: BeneSName,
              ThirdName: BeneTName,
              LastName: BeneLName,
              CustID: "",
              qRespones: bodyNoCdata_q,
              Request:JSON.stringify(fullJson)
            });
          var object_id;
          newData.save(async (err, doc) => {
            if (!err) {

              console.log('record was added');
              callback(bodyNoCdata_q);
            }
            else {
              console.log(err);
              callback(bodyNoCdata_q);
            }
          });
        }

        else if ((serverJson.service_info.service_type).toUpperCase() == P_service_type) {

          console.log(serverJson+"25252525252");
          service_t = serverJson.service_info.service_type;
          var bodyNoCdata_p= 
          `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
           <s:Body>
           <ConfirmReceiveTransactionResponse xmlns="http://tempuri.org/">
           <ConfirmReceiveTransactionResult></ConfirmReceiveTransactionResult>
          <Status>${Status}</Status>
          <StatusCode>${StatusCode}</StatusCode>
          <Message>${Message}</Message>
          </ConfirmReceiveTransactionResponse>
          </s:Body>
          </s:Envelope>
          `          
          console.log(service_t)
          Rem_no = xmlReturned.split('&lt;PTCNNo&gt;').pop().split('&lt;/PTCNNo&gt;')[0];
          console.log(Rem_no+"akakak");
          //Payment_Res_Code = xpath.find(jsonData, '//a:ResponseCode')[0]
          console.log(Status);
          if (Status != CoSuccessCode) {
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
                responesData: bodyNoCdata_p,
                FirstName: "",
                SecondName: "",
                ThirdName: "",
                LastName: "",
                CustID: "",
                remStatus: 0,
                Request:JSON.stringify(fullJson)

              });
            var object_id;
            newData.save(async (err, doc) => {
              if (!err) {


                console.log('record was added');
                callback(bodyNoCdata_p);
              }
              else {
                console.log(err);
                callback(bodyNoCdata_p);

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
                  pRespones: bodyNoCdata_p,
                  remStatus: 1,
                  Request:JSON.stringify(fullJson)
                });
              var object_id;
              newData.save(async (err, doc) => {
                if (!err) {

                  console.log('record was added');
                  callback(bodyNoCdata_p);
                }
                else {
                  console.log(err);
                  callback(bodyNoCdata_p);
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
module.exports.DirectRemit_service = DirectRemit_service;



function getPayRemittanc(body, fileName, callback) {




  fs.writeFile(fileName, body
    , (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });

  try {
    var soapACtion;
    var url ;
    if (service_t == "p_rem") {
      soapACtion = "http://172.16.151.99:3150/directRemit/pay";
      url = "http://172.16.151.99:3150/directRemit/pay";
    }
    else {
      soapACtion = "http://172.16.151.99:3150/directRemit/query";
      url = "http://172.16.151.99:3150/directRemit/query";
    };

    cmd.get(

      //  `curl --ssl-no-revoke -H   "Content-Type: text/xml" --header "SOAPAction: 'http://tempuri.org/IReceiveAPI/DisplayCashTransactionForPaying' ,'http://tempuri.org/IReceiveAPI/PayTranactionCashOrBank'  " --data-binary @${fileName}  ${mainUrl}` ,

      `curl --ssl-no-revoke -H   "Content-Type: text/xml" --header "SOAPAction: ${soapACtion} " --data-binary @${fileName}  ${url}`,

      function (err, data, stderr) {
        try {
          console.log(err+"+++++++++++++++");
          //var xsdDoc = x.parseXmlString(data);

          if (err == null) {
            try {
              parser.parseString(data, function (err, result) {
                if (err == null) {
                  callback(test, 'Error curl Request');
                  //callback(result, fileName, data);
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
      } catch(err){
        return callback("");
      }
    } else {
      return callback("");
    }
    

  });

}

