
let request = require('request');
/**header content end */
const content_type= 'application/json';
var ria_CallerCorrelationId = ""
const ria_CallerDeviceId = ""
const ria_AgentId ="6404114";
const Ocp_ApimSubscription_Key = "66429b88fe9b476f9b5d65b08a124bcb"
/**header content end */
const SearchUrl='https://rialinkgateway.riaenvia.net/PayOrders/Order/CashPickUp';
const PayRemUrl='https://rialinkgateway.riaenvia.net/PayOrders/Order/CashPickUp/Payment';
var mongoCon= require('../../config/db_connection');
const newApiRequest= require('../../db_modal/alnoamanNewModal');
var method='POST';
const CoSuccessCode='1000';
var dateFormat = require("dateformat");
var randtoken = require('rand-token').generator({chars:'0-9'});
var Q_service_type = 'Q_REM';
var P_service_type = 'P_REM';
var no_server_error={code:'00000', massege:'تمت العمليات في السيرفر بنجاح'};
var database_error= {code:'00006', massege:'حدث خطاء اثناء تخزين البيانات في ال MongoDB'};
var branch_ria_code;
//console.log(dateFormat(new Date(), "yyyymmdd") + dateFormat(new Date(), "UTC:hhMMss"));
///console.log(dateFormat(new Date(), "yyyymmddhhMMss "));
//console.log(dateFormat(new Date(), "UTC:hhMMss"));
function ria_service(req,callback)
{
  console.log("9999999999999999999999999999999999999")
  console.log(req)
  if (req.service_info.agent_or_Branch_Code==="10002")branch_ria_code="ANEC006";
  else if (req.service_info.agent_or_Branch_Code==="10003")branch_ria_code="ANEC008";
  else if (req.service_info.agent_or_Branch_Code==="10004")branch_ria_code="ANEC002";
  else if (req.service_info.agent_or_Branch_Code==="10005")branch_ria_code="ANEC005";
  else if (req.service_info.agent_or_Branch_Code==="10006")branch_ria_code="ANEC003";
  else if (req.service_info.agent_or_Branch_Code==="10007")branch_ria_code="ANEC007";
  else if (req.service_info.agent_or_Branch_Code==="10008")branch_ria_code="ANEC004";
  else if (req.service_info.agent_or_Branch_Code==="10009")branch_ria_code="ANEC010";
  else if (req.service_info.agent_or_Branch_Code==="10010")branch_ria_code="ANEC011";
  else if (req.service_info.agent_or_Branch_Code==="10011")branch_ria_code="ANEC012";
  else if (req.service_info.agent_or_Branch_Code==="10012")branch_ria_code="ANEC009";
  else if (req.service_info.agent_or_Branch_Code==="10013")branch_ria_code="ANEC013";
  else branch_ria_code="ANEC001";

 if ((req.service_info.service_type).toUpperCase() == Q_service_type)
    { 

         var StringPreparedData = praperSearchBody(req);
         var user_id=req.service_info.agent_or_Branch_Code
         SearchRemit(StringPreparedData,user_id,function(respones,bdy){
           //callback(respones);
           console.log("point 5");
           if (respones.Response !== undefined )
           respones = respones.Response
           else
           {
             respones = respones;
           }
           var resData=writeSearchXmlFile(respones,no_server_error,bdy);
           let newData= new newApiRequest.insertData(
            {
              rem_no : req.rem_info.rem_no,
              transaction_id:(respones['OrderNo'] === undefined) ? '' : respones['OrderNo'],
              service_name :req.service_info.service_name,
              service_type :req.service_info.service_type,
              system_name: req.service_info.system_name,
              username:req.service_info.username,
              agent_code :req.service_info.agent_or_Branch_Code,
              agent_name :req.service_info.agent_or_Branch_name,
              agent_address :req.service_info.agent_or_Branch_addrs,
              date:Date.now(),
              requestData:StringPreparedData,
              responesData:JSON.stringify(respones),
              Amounts:(respones['BeneAmount'] === undefined) ? '' : respones['BeneAmount'],
              FirstName:(respones['BeneNameFirst'] === undefined) ? '' : respones['BeneNameFirst'],
              SecondName:(respones['BeneNameLast1'] === undefined) ? '' : respones['BeneNameLast1'],
              ThirdName:"",
              LastName:"",
              CustID:"",
              tokenBody: (respones['TransRefID'] === undefined) ? '' : respones['TransRefID'],
              qRespones:resData,
              Request:JSON.stringify(req)

            });
           var object_id;
           
            newData.save( async (err,doc)=> {
              if(!err){
                console.log(doc);
                object_id=doc['_id'];
                respones['OrderNo']=object_id;
                //console.log(respones);
                console.log('record was added');
                console.log("point 6");
                var resData=writeSearchXmlFile(respones,no_server_error,bdy);
                callback(resData);
              }
              else
              {
                console.log(err);
                var resData=writeSearchXmlFile(respones,database_error,bdy);
                callback(resData);
              }
            });
       });
  
    }
    else if ((req.service_info.service_type).toUpperCase() == P_service_type)
    { 
     
     
       rem_no= req.rem_info.rem_no;
       
 
       PreparePayData(req,function(StringPreparedData,xmlQuery){
        var user_id=req.service_info.agent_or_Branch_Code
        console.log(StringPreparedData);
        payRemittance (StringPreparedData,user_id,function(respones,bdy){
          var resp
          if (respones.Response !== undefined )
          resp = respones.Response
          else
          {
            resp = respones;
          }
          
           var Res_Code= (resp['ResponseCode'] === undefined) ? "-5" : resp['ResponseCode']
           var resXmlData=writePayXmlFile(resp,no_server_error,bdy);
 
           let newData= new newApiRequest.insertData(
             {
               rem_no :req.rem_info.rem_no,
               transaction_id:req.rem_info.receiveOrderCode,
               service_name :req.service_info.service_name,
               service_type :req.service_info.service_type,
               system_name: req.service_info.system_name,
               username:req.service_info.username,
               agent_code :req.service_info.agent_or_Branch_Code,
               agent_name :req.service_info.agent_or_Branch_name,
               agent_address :req.service_info.agent_or_Branch_addrs,
               date:Date.now(),
               requestData:StringPreparedData,
               responesData:JSON.stringify(respones),
               FirstName:"",
               SecondName:"",
               ThirdName:"",
               LastName:"",
               CustID:"",
               qRespones: (xmlQuery == undefined ?  ""  : xmlQuery)  , 
               pRespones:  resXmlData  ,
               remStatus: (Res_Code == CoSuccessCode ?  1 : 0),
               Request:JSON.stringify(req)
 
             });
            var object_id;
             newData.save( async (err,doc)=> {
               if(!err){
                 console.log('record was added');
                 callback(resXmlData);
               }
               else
               {
                 console.log(err);
                  resXmlData=writePayXmlFile(respones,database_error,bdy);
                 callback(resXmlData);
               }
             });
       });
       
      });
   
     
     
    }
}
module.exports.ria_service = ria_service;



function SearchRemit(body,user_id ,callback){
    //getLocalTime()
    console.log("point 1");
    var local_date= dateFormat(Date.now(), "yyyymmdd''HHMMss");
   const riaHeader= {
     'content-type': content_type,
     'ria-CallerCorrelationId': randtoken.generate(32),
     'ria-CallerUserId' : user_id,
     'ria-CallDateTimeLocal':  getLocalTime() ,
     'ria-CallerDeviceId': ria_CallerDeviceId,
     'ria-AgentId': ria_AgentId,
     'Ocp-Apim-Subscription-Key': Ocp_ApimSubscription_Key
               };
    console.log(riaHeader);
    request.post(
        { headers: riaHeader,
            url: "http://172.16.151.33:3150/ria/query",
            body: body,
            method: method
           },
           function(err,respones,body)
              {
                if(!err){
                  console.log(body);
                  try {
                    console.log("point 2");
                 var json_tok= JSON.parse(body);
                 return callback(json_tok,JSON.stringify(body));
                  } catch (error) {
                    console.log("point 3");
                    var test=new Object; 
                    test.error = err;
                    test.res=respones;
                    test.bdy=body
                    return callback(test,JSON.stringify(body));
                  }
                } else {
                  console.log("point 4");
                var respErr = {
                  "ResponseCode":-5,
                  "ResponseText":err.message
                }
                return callback(respErr,JSON.stringify(body));
              }

        
              }
    );
}

function payRemittance(body,user_id ,callback){
  //getLocalTime()
  var local_date=dateFormat(Date.now(), "yyyymmdd''HHMMss") ;
 const riaHeader= {
   'content-type': content_type,
   'ria-CallerCorrelationId': randtoken.generate(32),
   'ria-CallerUserId' : user_id,
   'ria-CallDateTimeLocal':  getLocalTime() ,
   'ria-CallerDeviceId': ria_CallerDeviceId,
   'ria-AgentId': ria_AgentId,
   'Ocp-Apim-Subscription-Key': Ocp_ApimSubscription_Key
             };
  console.log(riaHeader);
  request.post(
      { headers: riaHeader,
          url: "http://172.16.151.33:3150/ria/pay",
          body: body,
          method: method
         },
         function(err,respones,body)
            {
              if(!err){
                console.log(body);
                try {
                  var json_tok= JSON.parse(body);
                  return callback(json_tok,JSON.stringify(body));
                   } catch (error) {
                     var test=new Object; 
                     test.error = err;
                     test.res=respones;
                     test.bdy=body
                     return callback(test,JSON.stringify(body));
                   }
              } else {
                var respErr = {
                  "ResponseCode":-5,
                  "ResponseText":err.message
                }
                return callback(respErr,JSON.stringify(body));
              }
                

      
            }
  );
}

function praperSearchBody(req)
{

   var SearchData =  {
        "DateTimeLocal": getLocalTime(),
        "DateTimeUTC": DateTimeUTC(),
        "PIN": req.rem_info.rem_no,
        "BeneAmount": "0.00",
        "CorrespLocID": branch_ria_code
        }
        console.log(SearchData);
    return JSON.stringify(SearchData);
  }

function writeSearchXmlFile(responesData,ServerData,body)
{
    var Msg=""
    var code="";
    if (responesData.Response !== undefined ){
      responesData = responesData.Response
    }else{
      var json2 = JSON.parse(JSON.parse(body));
      Msg = json2.ResponseText;
      code = json2.ResponseCode;
    }
      

      
      
      
     
      

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
        <code_API>${(responesData['ResponseCode'] === undefined) ? code : responesData['ResponseCode']}</code_API>
         <msg_API>${(responesData['ResponseText'] === undefined) ? Msg : responesData['ResponseText']}</msg_API>
      </msg_info_API>
      <rem_info>
       <rem_no>${(responesData['PIN'] === undefined) ? '' : responesData['PIN']}</rem_no>
       <receiveOrderCode>${(responesData['OrderNo'] === undefined) ? '' : responesData['OrderNo']}</receiveOrderCode>
       <paying_amount></paying_amount>
       <payout_amount>${(responesData['BeneAmount'] === undefined) ? '' : responesData['BeneAmount']}</payout_amount>
       <paying_cuyc></paying_cuyc>
       <payout_cuyc>${(responesData['BeneCurrency'] === undefined) ? '' : responesData['BeneCurrency']}</payout_cuyc>
       <payout_com></payout_com>
       <payout_com_cuyc></payout_com_cuyc>
       <payout_settlement_rate></payout_settlement_rate>
       <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
       <payout_settlement_amount></payout_settlement_amount>
       <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
       <rem_status></rem_status>
       <rem_type></rem_type>
       <sending_coyc>${(responesData['CountryFrom'] === undefined) ? '' : responesData['CountryFrom']}</sending_coyc>
       <destenation_coyc></destenation_coyc>
       <user_note></user_note>
      </rem_info>
      <sender_info>
       <sender_trns_id></sender_trns_id>
       <f_name></f_name>
       <s_name></s_name>
       <th_name></th_name>
       <l_name> </l_name>
       <full_name>${(responesData['CustNameFirst'] === undefined) ? '' : responesData['CustNameFirst']} ${(responesData['CustNameLast1'] === undefined) ? '' : responesData['CustNameLast1']} ${(responesData['CustNameLast2'] === undefined) ? '' : responesData['CustNameLast2']}</full_name>
       <telephone></telephone>
       <mobile>${(responesData['CustTelNo'] === undefined) ? '' : responesData['CustTelNo']}</mobile>
       <address>${(responesData['CustAddress'] === undefined) ? '' : responesData['CustAddress']}</address>
       <address1></address1>
       <nationality_coyc></nationality_coyc>
       <bd_or_ed>${(responesData['CustDateOfBirth'] === undefined) ? '' : responesData['CustDateOfBirth']}</bd_or_ed>
       <gender></gender>
       <identity_type></identity_type>
       <identity_no></identity_no>
       <identity_issues></identity_issues>
       <identity_exp></identity_exp>
       <identity_issuePlace>${(responesData['CustID1IssuedByCountry'] === undefined) ? '' : responesData['CustID1IssuedByCountry']}</identity_issuePlace>
       <note></note>
      </sender_info>
      <reciver_info>
       <reciver_trns_id></reciver_trns_id>
       <f_name>${(responesData['BeneNameFirst'] === undefined) ? '' : responesData['BeneNameFirst']}</f_name>
       <s_name>${(responesData['BeneNameMiddle'] === undefined) ? '' : responesData['BeneNameMiddle']}</s_name>
       <th_name></th_name>
       <l_name>${(responesData['BeneNameLast1'] === undefined) ? '' : responesData['BeneNameLast1']} ${(responesData['BeneNameLast2'] === undefined) ? '' : responesData['BeneNameLast2']}</l_name>
       <full_name>${(responesData['BeneNameFirst'] === undefined) ? '' : responesData['BeneNameFirst']} ${(responesData['BeneNameMiddle'] === undefined) ? '' : responesData['BeneNameMiddle']} ${(responesData['BeneNameLast1'] === undefined) ? '' : responesData['BeneNameLast1']} ${(responesData['BeneNameLast2'] === undefined) ? '' : responesData['BeneNameLast2']} </full_name>
       <telephone></telephone>
       <mobile>${(responesData['BeneTelNo'] === undefined) ? '' : responesData['BeneTelNo']}</mobile>
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

function getLocalTime()
{
    // dateFormat(new Date(), "yyyymmddhhMMss")
     return dateFormat(Date.now(), "yyyymmdd''HHMMss")
}
function DateTimeUTC()
{var utc_date =dateFormat(Date.now(), "yyyymmdd") + dateFormat(Date.now(), "UTC:HHMMss");
    return utc_date;
}

function PreparePayData(req,callback)
{
  console.log(req.rem_info.receiveOrderCode);
  var queryResponse = "";
  newApiRequest.insertData.find({_id:decodeURI(req.rem_info.receiveOrderCode)},(err,apiData)=>{
    console.log("_ID of getting query :"+decodeURI(req.rem_info.receiveOrderCode))
    console.log(apiData)
  if(!err){
    try{
      queryResponse =apiData[apiData.length - 1].qRespones;
    } catch (error){
      queryResponse="";
    }
  } else {
    queryResponse="";
  }
  
  var PayRespones={
    "DateTimeLocal": getLocalTime(),
    "DateTimeUTC": DateTimeUTC(),
    "VerifyOrderTransRefID": apiData[0].tokenBody,
    "OrderNo":apiData[0].transaction_id ,
    "PIN": req.rem_info.rem_no,
    "BeneCurrency": req.rem_info.Delivery_amt_ccy,
    "BeneAmount": req.rem_info.Delivery_amt,
    "PaidDateTimeLocal": getLocalTime(),
    "PaidDateTimeUTC": DateTimeUTC(),
    "BeneIDType": req.reciver_info.identity_type,
    "BeneIDNumber": req.reciver_info.identity_no,
    "BeneIDIssuedBy":"",
    "BeneIDIssuedByCountry": req.reciver_info.reciver_country,
    "BeneIDIssuedByState": req.reciver_info.identityIssuePlace,
    "BeneIDIssueDate": req.reciver_info.identity_issues ,
    "BeneIDExpirationDate": req.reciver_info.identity_exp,
    "CorrespLocID": branch_ria_code,
    "CorrespLocCountry": req.reciver_info.reciver_country,
    "BeneOccupation":req.reciver_info.ReceiverOccupation,
     "BeneDateOfBirth":req.reciver_info.bd_or_ed, 
     "BeneTelNo":req.reciver_info.mobile, 
     "BeneCountryOfBirth":req.reciver_info.birthcuntry, 
     "BeneNationality":req.reciver_info.nationality_coyc, 
     "BeneCityOfBirth":req.reciver_info.birthPlace, 
     "BeneCity":req.reciver_info.reciver_city, 
     "BeneAddress":req.reciver_info.address
  }
console.log (PayRespones);
  return callback(JSON.stringify(PayRespones) ,queryResponse);

});

}
function writePayXmlFile(responesData,ServerData,bdy)
{
  if (responesData.Response !== undefined ){
    responesData = responesData.Response
  } else{
    responesData = responesData
  }
 
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
          <code_API>${(responesData.ResponseCode === undefined) ? -5 : responesData.ResponseCode} </code_API>
          <msg_API>${(responesData.ResponseText === undefined) ? bdy : responesData.ResponseText}</msg_API>
        </msg_info_API>
        <rem_info>
        <rem_no>${(responesData.PIN === undefined) ? '' : responesData.PIN}</rem_no>
        <rem_com_amt>${(responesData.PCCommissionAmount === undefined) ? '' : responesData.PCCommissionAmount}</rem_com_amt>
        <rem_com_ccy>${(responesData.PCCommissionCurrency === undefined) ? '' : responesData.PCCommissionCurrency}</rem_com_ccy>
            </rem_info>
        </ns:PaymentRem_respons>
       </env:Body>
  </env:Envelope>`
}



function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;

}


function writeErrorLog(opNo,user,service,type,error){
return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
}
