var request = require("request");
const { stringify } = require("to");

const TadamonPayUrl = "https://tpay.tiib.com:7036/TPAYWS/resources/INTRNL/AgentReq";
const TadamonPayMethod = "post";
const TadamonPayBaiscAuth = "Baisc " + new Buffer.from("weblogic:weblogicTest1").toString("base64");
const TadamonPayUserCode = "Al-Noaman-API";
const TadamonPayUserPass = "b2e8e2cb42c2";
//const TadamonPayAgentCode = "8877";
/****************** */
// const TadamonPayUrl="https://tpayuat.tadhamonbank.com:7004/TPAYWS/resources/INTRNL/AgentReq";
// const TadamonPayMethod="post";	
// const TadamonPayBaiscAuth= "Baisc " + new Buffer.from("weblogic:weblogicTest1").toString("base64"); 
// const TadamonPayUserCode = "Test-api";
// const TadamonPayUserPass = "27cedc701ab2sf";
/******************* */

const TadamonPayReqType = "QURY";
const TadamonPayType = "PAID";
const content_type = "application/json";
const newApiRequest = require('../../db_modal/alnoamanNewModal');
const TadamonPayHeader = { 'content-type': content_type, "Authorization": TadamonPayBaiscAuth };
var Q_service_type = 'Q_REM';
var P_service_type = 'P_REM';
const CoSuccessCode = '1';
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
function tadamonPay_server(req, callback) {
  if ((req.service_info.service_type).toUpperCase() == Q_service_type) {
    rem_no = req.rem_info.rem_no;
    var agent_code = req.service_info.agent_or_Branch_Code;
    var JsonContent = PraperSearchJson(rem_no, agent_code);
    console.log(JsonContent)
    SearchAndPayRemit(JsonContent,'Q', function (respones, bdy) {
      if (respones['DELIVER_STATUS'] == 'DELIVERED') {
        respones['ResltCode'] = 2;
        respones['ResltMsg'] = `الحوالة تم تسليمها مسبقاً.`;
      }
      else if (respones['DELIVER_STATUS'] == 'CANCELED') {
        respones['ResltCode'] = 2;
        respones['ResltMsg'] = `الحوالة ملغية.`;
      }
      var resData = writeSearchXmlFile(respones, no_server_error, bdy);
      let newData = new newApiRequest.insertData(
        {
          rem_no: req.rem_info.rem_no,
          transaction_id: (respones['REQNO'] === undefined) ? '-5' : respones['REQNO'],
          service_name: req.service_info.service_name,
          service_type: req.service_info.service_type,
          system_name: req.service_info.system_name,
          username: req.service_info.username,
          agent_code: req.service_info.agent_or_Branch_Code,
          agent_name: req.service_info.agent_or_Branch_name,
          agent_address: req.service_info.agent_or_Branch_addrs,
          date: Date.now(),
          Data_Time: date_time(),
          requestData: JsonContent,
          responesData: JSON.stringify(respones),
          Amounts:(respones['AMOUNT'] === undefined) ? '' : respones['AMOUNT'],
          FirstName: (respones['REC_NAME'] === undefined) ? '' : respones['REC_NAME'],
          SecondName: "",
          ThirdName: "",
          LastName: "",
          CustID: "",
          qRespones: resData,
          Request:JSON.stringify(req)
        });
      var object_id;
      newData.save(async (err, doc) => {
        if (!err) {
          object_id = doc['_id'];
          
          respones['REQNO'] = object_id;

          console.log('record was added');
          var resData = writeSearchXmlFile(respones, no_server_error, bdy);
          console.log(resData);
          callback(resData);
        }
        else {
          console.log(err);
          var resData = writeSearchXmlFile(respones, database_error, bdy);
          callback(resData);
        }
      });
    });

  }
  else if ((req.service_info.service_type).toUpperCase() == P_service_type) {
    PraperPayJson(req, function (StringPreparedData, xmlQuery) {
      console.log(StringPreparedData);
      SearchAndPayRemit(StringPreparedData,'P', function (respones, bdy) {
        var Res_Code = (respones['ResltCode'] === undefined) ? -5 : respones['ResltCode']
        var resXmlData = writePayXmlFile(respones, no_server_error, bdy);
        let newData = new newApiRequest.insertData(
          {
            rem_no: req.rem_info.rem_no,
            transaction_id: req.rem_info.receiveOrderCode,
            service_name: req.service_info.service_name,
            service_type: req.service_info.service_type,
            system_name: req.service_info.system_name,
            username: req.service_info.username,
            agent_code: req.service_info.agent_or_Branch_Code,
            agent_name: req.service_info.agent_or_Branch_name,
            agent_address: req.service_info.agent_or_Branch_addrs,
            date: Date.now(),
            Data_Time: date_time(),
            requestData: StringPreparedData,
            responesData: JSON.stringify(respones),
            FirstName: "",
            SecondName: "",
            ThirdName: "",
            LastName: "",
            CustID: "",
            qRespones: (xmlQuery == undefined ?  ""  : xmlQuery)  , 
            pRespones:  resXmlData  ,
            remStatus: (Res_Code == CoSuccessCode ?  1 : 0),
            Request:JSON.stringify(req)
          });
        var object_id;
        newData.save(async (err, doc) => {
          if (!err) {
            console.log('record was added');
            respones.receiveOrderCode = req.rem_info.receiveOrderCode
            var resXmlData = writePayXmlFile(respones, no_server_error, bdy);
            console.log(resXmlData)
            callback(resXmlData);
          }
          else {
            console.log(err);
            var resXmlData = writePayXmlFile(respones, database_error, bdy);
            callback(resXmlData);
          }
        });
      });
    }
    );
  }
  else {
    var err_json = { code: '00002', massege: 'لا توجد خدمة  "' + (req.service_info.service_type).toUpperCase() + 'ّّ" في عمليات خدمة التضامن باي  ' };
    var object = '{}';
    var err_msg_praper = writeSearchXmlFile(object, err_json, 'حدث خطاء في السرفر الخاص بالربط');
    callback(err_msg_praper);
  }

}

module.exports.tadamonPay_server = tadamonPay_server;

function SearchAndPayRemit(body,servTyp, callback) {


  request.post(
    {
      headers: TadamonPayHeader,
      url: servTyp==='Q'?"http://172.16.151.33:3150/tadamon/query":"http://172.16.151.33:3150/tadamon/pay",
      body: body,
      method: TadamonPayMethod
    },
    function (err, respones, body) {

      if(!err){
        console.log(body);
        try {
          var json_tok = JSON.parse(body);
          return callback(json_tok, JSON.stringify(body));
  
        } catch (error) {
          var test = new Object;
          test.error = err;
          test.res = respones;
          test.bdy = body
          return callback(test, JSON.stringify(body));
        }
      } else {
        var errResponse = {
          "ResltCode":-5,
          "ResltMsg":err.message
        }
        return callback(errResponse, JSON.stringify(body));
      }


    }
  );
}

function PraperSearchJson(Remit_no, agent_code) {
  var Data = [{
    "User_Code": TadamonPayUserCode,
    "User_Pass": TadamonPayUserPass,
    "AGENT_Code": agent_code,
    "ReqType": TadamonPayReqType
  },
  {
    "Transaction_Code": Remit_no
  }
  ];

  return JSON.stringify(Data);
}

function PraperPayJson(JsonData, callback) {

  var TranId = '';
  var queryResponse;
  var newObject = new Object;
  newApiRequest.insertData.find({ _id: decodeURI(JsonData.rem_info.receiveOrderCode) }, (err, apiData) => {
    if(!err){
      try{
        TranId = apiData[apiData.length - 1].transaction_id;
        queryResponse = apiData[apiData.length -1].qRespones;
      } catch(err){
        TranId = "";
        queryResponse = "";
      }
    } else {
      TranId = "";
      queryResponse = "";
    }
    
    
    var PayRespones =
      [{
        "User_Code": TadamonPayUserCode,
        "User_Pass": TadamonPayUserPass,
        "AGENT_Code": JsonData.service_info.agent_or_Branch_Code,
        "REQNO": TranId,
        "ReqType": TadamonPayType
      },
      {
        "Transaction_Code": JsonData.rem_info.rem_no,
        "benefMobie": JsonData.reciver_info.mobile,
        "benefIDType": JsonData.reciver_info.identity_type,
        "benefIDNo": JsonData.reciver_info.identity_no,
        "benefIDIssuDat": JsonData.reciver_info.identity_issues,
        "benefIDExpDat": JsonData.reciver_info.identity_exp,
        "benefIDIssuPlc": JsonData.reciver_info.identityIssuePlace,
        "Governorate_Id": JsonData.service_info.Governorate_Id,
        "District_Id": (JsonData.service_info.District_Id === '') ? '1' : JsonData.service_info.District_Id,
        "LocalUserId": JsonData.service_info.username,
        "LocalUName": " "
      }];
    return callback(JSON.stringify(PayRespones), queryResponse);
  });
}

function writeSearchXmlFile(responesData, ServerData, body) {



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
    <code_API> ${(responesData['ResltCode'] === undefined) ? -5 : responesData['ResltCode']}</code_API>
     <msg_API>${(responesData['ResltMsg'] === undefined) ? body : responesData['ResltMsg']}</msg_API>
  </msg_info_API>
  <rem_info>
   <rem_no>${(responesData['TRANSACTION_ID'] === undefined) ? '' : responesData['TRANSACTION_ID']}</rem_no>
   <receiveOrderCode>${(responesData['REQNO'] === undefined) ? '' : responesData['REQNO']}</receiveOrderCode>
   <paying_amount></paying_amount>
   <payout_amount>${(responesData['AMOUNT'] === undefined) ? '' : responesData['AMOUNT']}</payout_amount>
   <paying_cuyc></paying_cuyc>
   <payout_cuyc>${(responesData['CURRENCY'] === undefined) ? '' : responesData['CURRENCY']}</payout_cuyc>
   <payout_com></payout_com>
   <payout_com_cuyc>${(responesData['RCurrency'] === undefined) ? '' : responesData['RCurrency']}</payout_com_cuyc>
   <payout_settlement_rate></payout_settlement_rate>
   <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
   <payout_settlement_amount></payout_settlement_amount>
   <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
   <rem_status></rem_status>
   <rem_type>${(responesData['DELIVER_STATUS'] === undefined) ? '' : responesData['DELIVER_STATUS']}</rem_type>
   <sending_coyc></sending_coyc>
   <destenation_coyc></destenation_coyc>
   <user_note>${(responesData['UserNote'] === undefined) ? '' : responesData['UserNote']}</user_note>
  </rem_info>
  <sender_info>
   <sender_trns_id></sender_trns_id>
   <f_name></f_name>
   <s_name></s_name>
   <th_name></th_name>
   <l_name> </l_name>
   <full_name>${(responesData['SENDER_NAME'] === undefined) ? '' : responesData['SENDER_NAME']}</full_name>
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
   <f_name></f_name>
   <s_name></s_name>
   <th_name></th_name>
   <l_name></l_name>
   <full_name>${(responesData['REC_NAME'] === undefined) ? '' : responesData['REC_NAME']}</full_name>
   <telephone></telephone>
   <mobile>${(responesData['RECIPIENT_MOBILE'] === undefined) ? '' : responesData['RECIPIENT_MOBILE']}</mobile>
   <address></address>
   <nationality_coyc></nationality_coyc>
   <gender></gender>
   <identity_type></identity_type>
   <identity_no></identity_no>
   <identity_issues></identity_issues>
   <identity_exp></identity_exp>
   <note></note>
  </reciver_info>
  <bank_info>
   <account_no></account_no>
   <bank_code></bank_code>
   <bank_name></bank_name>
   <branch_code></branch_code>
   <recive_bank_code></recive_bank_code>
  </bank_info>
  <others>
   <sending_reason></sending_reason>
   <relative_relations></relative_relations>
   <note></note>
   <source_of_icomeing></source_of_icomeing>
  </others>
</ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`;

}

function writePayXmlFile(responesData, ServerData, bdy) {

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
          <code_API>${(responesData.ResltCode === undefined) ? -5 : responesData.ResltCode} </code_API>
          <msg_API>${(responesData.ResltMsg === undefined) ? bdy : responesData.ResltMsg}</msg_API>
        </msg_info_API>
        <rem_info>
        <rem_no>${(responesData.RemitCode === undefined) ? '' : responesData.RemitCode}</rem_no>
        <rem_com_amt>${(responesData.Commission === undefined) ? '' : responesData.Commission}</rem_com_amt>
        <receiveOrderCode>${(responesData.receiveOrderCode === undefined) ? '' : responesData.receiveOrderCode}</receiveOrderCode>
      </rem_info>
        </ns:PaymentRem_respons>
       </env:Body>
  </env:Envelope>`
}

function date_time() {
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  let hours = date_time.getHours();
  let minutes = date_time.getMinutes();
  let seconds = date_time.getSeconds();
  return (date + "-" + month + "-" + year + "  " + hours + ":" + minutes + ":" + seconds);
}

function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;

}


function writeErrorLog(opNo,user,service,type,error){
return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
}
