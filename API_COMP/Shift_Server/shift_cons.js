const { ConnectionStates } = require('mongoose');
const request = require('request');
const xml2js = require('xml2js');
const xpath = require('xml2js-xpath');
//const mainUrl = "https://demo.shift-sg-api.com:1662/SHIFTApiV2/SHIFTApiV2Service?wsdl"; //trial
const mainUrl = " https://shift-sg-api.com:1662/SHIFTApiV2/SHIFTApiV2Service?wsdl";
const Q_service_type = "Q_REM"
const P_service_type = "P_REM"
const cmd = require('node-cmd');
const fs = require('fs');
const CoSuccessCode = '9000';
//const xmldoc = require('xmldoc');
// var x = require('libxmljs');
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');

 
function shift_service(jsonObject, fullJson, callback) {
  var js;
  if ((jsonObject.service_info.service_type).toUpperCase() == Q_service_type || ((jsonObject.service_info.service_type).toUpperCase() == P_service_type)) {
    js = JSON.stringify(jsonObject);
    xmlPreperGetData(fullJson, function (xmlReturned) {
      var serverJson = JSON.parse(js);
      var typeServ = (serverJson.service_info.service_type).toUpperCase();
      
      var name = 'file' + serverJson.service_info.agent_or_Branch_Code + serverJson.service_info.username + '_xmlFile.xml'
      getPayRemittanc(xmlReturned, name,typeServ, function (jsonData, fname, bodyReturned) {

        console.log(bodyReturned+'sssssssssssss');
        
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

        // fs.unlink(fname, (err) => {
        //   if (err) throw err;
        //   console.log(fname + ' was deleted');
        // });

        var Rem_no = "123"
        var Payment_Res_Code = '-1';
        var stsCode = xpath.find(jsonData, '//ns3:resultCode');
        // console.log(stsCode + 'stsCode');
        // console.log(jsonData + 'jsonData');
        var isRemitDetailExist = true;
        console.log(xpath.find(jsonData, '//ns3:resultCode'))

        if ((serverJson.service_info.service_type).toUpperCase() == Q_service_type) {
          if(stsCode==9000){
            var responseReturend= jsonData['S:Envelope']['S:Body']['ns2:getRemittanceForReceiveResponse']['return']['ns3:remittanceInfo']
            isRemitDetailExist = true;
          } else {
            isRemitDetailExist = false;
          }
          Rem_no = serverJson['web:getRemittanceForReceive'].remittancTrackingCode
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
              Amounts:!isRemitDetailExist? "" :responseReturend['ns3:PayoutAmount'] ,
              FirstName: !isRemitDetailExist? "" :responseReturend['ns3:receiver']['ns3:firstName'] ,
              SecondName: !isRemitDetailExist? "" :responseReturend['ns3:receiver']['ns3:middelName'] ,
              ThirdName: "",
              LastName: !isRemitDetailExist? "" :responseReturend['ns3:receiver']['ns3:lastName'] ,
              CustID: "",
              qRespones: bodyReturned,
              Request:JSON.stringify(fullJson)
            });

          var object_id;
          newData.save(async (err, doc) => {
            if (!err) {
              console.log('record was added');
              console.log(bodyReturned+"akram");
              callback(bodyReturned);
            }
            else {
              console.log(err);
              callback(bodyReturned);
            }
          });
        }

        else if ((serverJson.service_info.service_type).toUpperCase() == P_service_type) {
          Rem_no = serverJson['web:receiveRemittance'].remittancTrackingCode
          Payment_Res_Code = xpath.find(jsonData, '//ns3:resultCode')[0]
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
                remStatus: 0,
                Request:JSON.stringify(fullJson)

              });
            var object_id;
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
                  remStatus: 1,
                  Request:JSON.stringify(fullJson)
                });
              var object_id;
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

}

module.exports.shift_service = shift_service;





function getPayRemittanc(body, fileName,serv, callback) {
  console.log(body);
  fs.writeFile(fileName, body
    , (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
    var url;
    if(serv == Q_service_type){
      url  = "http://172.16.151.99:3150/shift/query" 
    } else if (serv == P_service_type){
      url = "http://172.16.151.99:3150/shift/pay" 
    }

  try {
                    let  test = `<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><ns2:getRemittanceForReceiveResponse xmlns:ns2="http://webservice/" xmlns:ns3="http://xml.netbeans.org/schema/ApiSchema"><return><ns3:resultCode>9000</ns3:resultCode><ns3:resultMessage>Operation successfully</ns3:resultMessage><ns3:remittanceInfo><ns3:remittanceTrackingCode>29440100021</ns3:remittanceTrackingCode><ns3:remittanceRecordingDate>08/01/2025 06:33:22 PM</ns3:remittanceRecordingDate><ns3:sendingCountryCode>USA</ns3:sendingCountryCode><ns3:destintationCountryCode>YEM</ns3:destintationCountryCode><ns3:payingAmount>0.0</ns3:payingAmount><ns3:PayoutAmount>1400.0</ns3:PayoutAmount><ns3:payoutCurrencyCode>USD</ns3:payoutCurrencyCode><ns3:remittanceStatus>READY</ns3:remittanceStatus><ns3:payoutSettlementRate>1.0</ns3:payoutSettlementRate><ns3:settlementPayoutAmount>1400.0</ns3:settlementPayoutAmount><ns3:settlementPayingAmount>0.0</ns3:settlementPayingAmount><ns3:payingAmountSettlementRate>0.0</ns3:payingAmountSettlementRate><ns3:receiveOrderCode>I1651750917</ns3:receiveOrderCode><ns3:sender><ns3:senderId>2098669</ns3:senderId><ns3:type>1</ns3:type><ns3:firstName>YAHYA</ns3:firstName><ns3:lastName>AL KOUFILY</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>3132686111</ns3:mobile><ns3:address>14329 WELLESLEY</ns3:address><ns3:nationalityCountryCode>USA</ns3:nationalityCountryCode><ns3:birthDateOrEstablishDate>31/12/1970</ns3:birthDateOrEstablishDate><ns3:identityTypeCode>3</ns3:identityTypeCode><ns3:identityTypeName>Driving License</ns3:identityTypeName><ns3:identityNumber>A900000676397</ns3:identityNumber></ns3:sender><ns3:receiver><ns3:receiverId>2244121</ns3:receiverId><ns3:type>1</ns3:type><ns3:firstName>RIYADH ABDULKAREEM MOHAMMED </ns3:firstName><ns3:lastName>ALNOAMAN</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>000000000</ns3:mobile><ns3:address>Yemen</ns3:address><ns3:nationalityCountryCode>YEM</ns3:nationalityCountryCode><ns3:identityTypeCode>0</ns3:identityTypeCode></ns3:receiver><ns3:payingToPayoutRate>0.0</ns3:payingToPayoutRate><ns3:sendingReason>Family Support</ns3:sendingReason><ns3:charges>0.0</ns3:charges><ns3:settlementCharges>0.0</ns3:settlementCharges><ns3:agentChargesShare>0.0</ns3:agentChargesShare><ns3:agentFXChargesShare>0.0</ns3:agentFXChargesShare></ns3:remittanceInfo></return></ns2:getRemittanceForReceiveResponse></S:Body></S:Envelope>`
               let   data = `<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><ns2:getRemittanceForReceiveResponse xmlns:ns2="http://webservice/" xmlns:ns3="http://xml.netbeans.org/schema/ApiSchema"><return><ns3:resultCode>9000</ns3:resultCode><ns3:resultMessage>Operation successfully</ns3:resultMessage><ns3:remittanceInfo><ns3:remittanceTrackingCode>29440100021</ns3:remittanceTrackingCode><ns3:remittanceRecordingDate>08/01/2025 06:33:22 PM</ns3:remittanceRecordingDate><ns3:sendingCountryCode>USA</ns3:sendingCountryCode><ns3:destintationCountryCode>YEM</ns3:destintationCountryCode><ns3:payingAmount>0.0</ns3:payingAmount><ns3:PayoutAmount>1400.0</ns3:PayoutAmount><ns3:payoutCurrencyCode>USD</ns3:payoutCurrencyCode><ns3:remittanceStatus>READY</ns3:remittanceStatus><ns3:payoutSettlementRate>1.0</ns3:payoutSettlementRate><ns3:settlementPayoutAmount>1400.0</ns3:settlementPayoutAmount><ns3:settlementPayingAmount>0.0</ns3:settlementPayingAmount><ns3:payingAmountSettlementRate>0.0</ns3:payingAmountSettlementRate><ns3:receiveOrderCode>I1651750917</ns3:receiveOrderCode><ns3:sender><ns3:senderId>2098669</ns3:senderId><ns3:type>1</ns3:type><ns3:firstName>YAHYA</ns3:firstName><ns3:lastName>AL KOUFILY</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>3132686111</ns3:mobile><ns3:address>14329 WELLESLEY</ns3:address><ns3:nationalityCountryCode>USA</ns3:nationalityCountryCode><ns3:birthDateOrEstablishDate>31/12/1970</ns3:birthDateOrEstablishDate><ns3:identityTypeCode>3</ns3:identityTypeCode><ns3:identityTypeName>Driving License</ns3:identityTypeName><ns3:identityNumber>A900000676397</ns3:identityNumber></ns3:sender><ns3:receiver><ns3:receiverId>2244121</ns3:receiverId><ns3:type>1</ns3:type><ns3:firstName>RIYADH ABDULKAREEM MOHAMMED </ns3:firstName><ns3:lastName>ALNOAMAN</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>000000000</ns3:mobile><ns3:address>Yemen</ns3:address><ns3:nationalityCountryCode>YEM</ns3:nationalityCountryCode><ns3:identityTypeCode>0</ns3:identityTypeCode></ns3:receiver><ns3:payingToPayoutRate>0.0</ns3:payingToPayoutRate><ns3:sendingReason>Family Support</ns3:sendingReason><ns3:charges>0.0</ns3:charges><ns3:settlementCharges>0.0</ns3:settlementCharges><ns3:agentChargesShare>0.0</ns3:agentChargesShare><ns3:agentFXChargesShare>0.0</ns3:agentFXChargesShare></ns3:remittanceInfo></return></ns2:getRemittanceForReceiveResponse></S:Body></S:Envelope>`
                  callback(test, fileName, data);
    cmd.get(
      // `curl -k  -H "Content-Type: text/xml"  --data-binary @${fileName} `,
      // ${url} --ssl-no-revoke`,
      function (err, data, stderr) {
        console.log("data is "+data);
        console.log("error is "+err);
        console.log("stderr is "+stderr);
        try {
          console.log(data);
          // var xsdDoc = x.parseXmlString(data);

          if (err == null) {
            try {
              parser.parseString(data, function (err, result) {
                if (err == null) {
                 // console.log(result['S:Envelope']['S:Body']['ns2:getRemittanceForReceiveResponse']['return']['resultCode']);
                  console.log('sts')
                  console.log(data)
                  console.log(serv);
                  if(serv == P_service_type){
                    var a = result['S:Envelope']['S:Body']['ns2:receiveRemittanceResponse']['return'];
                    a['ns3:agentChargesShareCurrencyCod'] = 'USD';
                    var builder = new xml2js.Builder();
                    data = builder.buildObject(result);
                  }
                  // else{

                  // }

                  console.log(result);
                  console.log(data);
                  callback(result, fileName, data);
                }
                else {
                  var test = new Object;
                  test.error = err;
                  test.res = stderr;
                  test.bdy = data
                  test = `<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><ns2:getRemittanceForReceiveResponse xmlns:ns2="http://webservice/" xmlns:ns3="http://xml.netbeans.org/schema/ApiSchema"><return><ns3:resultCode>9000</ns3:resultCode><ns3:resultMessage>Operation successfully</ns3:resultMessage><ns3:remittanceInfo><ns3:remittanceTrackingCode>29440100021</ns3:remittanceTrackingCode><ns3:remittanceRecordingDate>08/01/2025 06:33:22 PM</ns3:remittanceRecordingDate><ns3:sendingCountryCode>USA</ns3:sendingCountryCode><ns3:destintationCountryCode>YEM</ns3:destintationCountryCode><ns3:payingAmount>0.0</ns3:payingAmount><ns3:PayoutAmount>1400.0</ns3:PayoutAmount><ns3:payoutCurrencyCode>USD</ns3:payoutCurrencyCode><ns3:remittanceStatus>READY</ns3:remittanceStatus><ns3:payoutSettlementRate>1.0</ns3:payoutSettlementRate><ns3:settlementPayoutAmount>1400.0</ns3:settlementPayoutAmount><ns3:settlementPayingAmount>0.0</ns3:settlementPayingAmount><ns3:payingAmountSettlementRate>0.0</ns3:payingAmountSettlementRate><ns3:receiveOrderCode>I1651750917</ns3:receiveOrderCode><ns3:sender><ns3:senderId>2098669</ns3:senderId><ns3:type>1</ns3:type><ns3:firstName>YAHYA</ns3:firstName><ns3:lastName>AL KOUFILY</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>3132686111</ns3:mobile><ns3:address>14329 WELLESLEY</ns3:address><ns3:nationalityCountryCode>USA</ns3:nationalityCountryCode><ns3:birthDateOrEstablishDate>31/12/1970</ns3:birthDateOrEstablishDate><ns3:identityTypeCode>3</ns3:identityTypeCode><ns3:identityTypeName>Driving License</ns3:identityTypeName><ns3:identityNumber>A900000676397</ns3:identityNumber></ns3:sender><ns3:receiver><ns3:receiverId>2244121</ns3:receiverId><ns3:type>1</ns3:type><ns3:firstName>RIYADH ABDULKAREEM MOHAMMED </ns3:firstName><ns3:lastName>ALNOAMAN</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>000000000</ns3:mobile><ns3:address>Yemen</ns3:address><ns3:nationalityCountryCode>YEM</ns3:nationalityCountryCode><ns3:identityTypeCode>0</ns3:identityTypeCode></ns3:receiver><ns3:payingToPayoutRate>0.0</ns3:payingToPayoutRate><ns3:sendingReason>Family Support</ns3:sendingReason><ns3:charges>0.0</ns3:charges><ns3:settlementCharges>0.0</ns3:settlementCharges><ns3:agentChargesShare>0.0</ns3:agentChargesShare><ns3:agentFXChargesShare>0.0</ns3:agentFXChargesShare></ns3:remittanceInfo></return></ns2:getRemittanceForReceiveResponse></S:Body></S:Envelope>`
                  data = `<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/"><S:Body><ns2:getRemittanceForReceiveResponse xmlns:ns2="http://webservice/" xmlns:ns3="http://xml.netbeans.org/schema/ApiSchema"><return><ns3:resultCode>9000</ns3:resultCode><ns3:resultMessage>Operation successfully</ns3:resultMessage><ns3:remittanceInfo><ns3:remittanceTrackingCode>29440100021</ns3:remittanceTrackingCode><ns3:remittanceRecordingDate>08/01/2025 06:33:22 PM</ns3:remittanceRecordingDate><ns3:sendingCountryCode>USA</ns3:sendingCountryCode><ns3:destintationCountryCode>YEM</ns3:destintationCountryCode><ns3:payingAmount>0.0</ns3:payingAmount><ns3:PayoutAmount>1400.0</ns3:PayoutAmount><ns3:payoutCurrencyCode>USD</ns3:payoutCurrencyCode><ns3:remittanceStatus>READY</ns3:remittanceStatus><ns3:payoutSettlementRate>1.0</ns3:payoutSettlementRate><ns3:settlementPayoutAmount>1400.0</ns3:settlementPayoutAmount><ns3:settlementPayingAmount>0.0</ns3:settlementPayingAmount><ns3:payingAmountSettlementRate>0.0</ns3:payingAmountSettlementRate><ns3:receiveOrderCode>I1651750917</ns3:receiveOrderCode><ns3:sender><ns3:senderId>2098669</ns3:senderId><ns3:type>1</ns3:type><ns3:firstName>YAHYA</ns3:firstName><ns3:lastName>AL KOUFILY</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>3132686111</ns3:mobile><ns3:address>14329 WELLESLEY</ns3:address><ns3:nationalityCountryCode>USA</ns3:nationalityCountryCode><ns3:birthDateOrEstablishDate>31/12/1970</ns3:birthDateOrEstablishDate><ns3:identityTypeCode>3</ns3:identityTypeCode><ns3:identityTypeName>Driving License</ns3:identityTypeName><ns3:identityNumber>A900000676397</ns3:identityNumber></ns3:sender><ns3:receiver><ns3:receiverId>2244121</ns3:receiverId><ns3:type>1</ns3:type><ns3:firstName>RIYADH ABDULKAREEM MOHAMMED </ns3:firstName><ns3:lastName>ALNOAMAN</ns3:lastName><ns3:telephone></ns3:telephone><ns3:mobile>000000000</ns3:mobile><ns3:address>Yemen</ns3:address><ns3:nationalityCountryCode>YEM</ns3:nationalityCountryCode><ns3:identityTypeCode>0</ns3:identityTypeCode></ns3:receiver><ns3:payingToPayoutRate>0.0</ns3:payingToPayoutRate><ns3:sendingReason>Family Support</ns3:sendingReason><ns3:charges>0.0</ns3:charges><ns3:settlementCharges>0.0</ns3:settlementCharges><ns3:agentChargesShare>0.0</ns3:agentChargesShare><ns3:agentFXChargesShare>0.0</ns3:agentFXChargesShare></ns3:remittanceInfo></return></ns2:getRemittanceForReceiveResponse></S:Body></S:Envelope>`
                  callback(test, fileName, data);
                }
              });
            } catch (error) {
              console.log("error in try catch is "+err)
              var test = new Object;
              test.error = error;
              test.res = stderr;
              test.bdy = data
              callback(test, fileName, data);
            }
          }
        } catch (error) {
          console.log("***************************************************************")
          console.log("error in try catch is "+err)
          var test = new Object;
          test.error = error;
          test.res = stderr;
          test.bdy = data
          callback(test, fileName, data);
        }
      });
  } catch (error) {
    var test = new Object;
    test.error = error;
    test.res = '';
    test.bdy = ''
    callback(test, fileName, 'Error curl Request');
  }
}





function xmlPreperGetData(json, callback) {

  var obj = new Object();
  obj = json;
  var x = delete obj['soapenv:Envelope']['soapenv:Body']["service_info"];
  var Returned_Data = new xml2js.Builder().buildObject(obj).replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', "");
  return callback(Returned_Data);
}

function GetReqest_Res(Rem_no , callback)
{
    newApiRequest.insertData.findOne({rem_no: Rem_no, service_type : 'q_rem'}).sort({date:-1,Object_ID:1}).exec(async (err, getData) => 
    {
      if(!err){
        try{
          return callback(getData.qRespones);
        } catch (err){
          return callback("");
        }
      } else{
        return callback("")
      }      
     
});

}