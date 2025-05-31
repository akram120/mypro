const { strict } = require('assert');
const { Console } = require('console');
let request = require('request');
/***************** */
const TokenURL=  'https://www.cacspeed.com:7441/mmdms/v2/spd/api/v1/Auth/SignIn';
const UN_PASS_base64= new Buffer.from("AlNoaman_Ex:N0mamEx$Sp33d?").toString("base64");
const Clientid = 'mon_api_client0fef817b9cdf43719cf2dcdf54fcec20';
const content_type= 'application/json';
var   TokenHeader= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Basic " + UN_PASS_base64};
// const SearchUrl='https://www.cacspeed.com:7441/mmdms/v2/spd/api/v1/draft/Search';
const SearchUrl='http://172.16.151.33:3150/speed/query';
// const PayRemUrl='https://www.cacspeed.com:7441/mmdms/v2/spd/api/v1/draft/PayRemittance';
const PayRemUrl='http://172.16.151.33:3150/speed/pay';
//----------------------------------
//const SearchUrl='https://www.cacspeed.com:7441/dms/api/v1/draft/Search';old
//const PayRemUrl='https://www.cacspeed.com:7441/dms/api/v1/draft/PayRemittance';old
/********************** */
// const TokenURL= 'https://www.cacspeed.com:8011/dms/api/v1/Auth/SignIn';//trial
// const UN_PASS_base64= new Buffer.from("cacexchange1:cacexchange1").toString("base64");
// const Clientid = 'alj-11';//;mon_api_client
// const content_type= 'application/json';
// //var   TokenHeader= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Basic " + UN_PASS_base64};
// var   TokenHeader= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Basic " + UN_PASS_base64};
// const SearchUrl='https://cacspeed.com:8011/dms_test/v2/spd/api/v1/draft/Search';
// const PayRemUrl='https://cacspeed.com:8011/dms_test/v2/spd/api/v1/draft/PayRemittance';
/************************** */
var mongoCon= require('../../config/db_connection');
const newApiRequest= require('../../db_modal/alnoamanNewModal');
var method='post'
var  SearchHeader;
const CoSuccessCode = '1';
const token_index='access_token';
const token_type_index= 'token_type';
const rem_index = 'rem_no';
var token;
var token_type;
var Q_service_type = 'Q_REM';
var P_service_type = 'P_REM';
var no_server_error={code:'00000', massege:'تمت العمليات في السيرفر بنجاح'};
var database_error= {code:'00006', massege:'حدث خطاء اثناء تخزين البيانات في ال MongoDB'};
/*newApiRequest.insertData.find({_id:decodeURI('5fba30793eaab51a74912be9')},(err,apiData)=>{
  console.log(apiData[0].responesData);
});*/
function cac_server(req,callback)
{
  //check opration type 
   if ((req.service_info.service_type).toUpperCase() == Q_service_type){
       getToken(function(pdata,tokenbdy){
        console.log(tokenbdy);
     if(pdata[token_index] !== undefined)
     {
         rem_no = req.rem_info.rem_no;
         token = pdata[token_index];
         token_type= pdata[token_type_index];
          getRemittance(rem_no,token,token_type,function(respones,bdy,bodyRequest){
          var DraftDetail=respones['DraftDetail'];
          var customerInfo=[];
          if(DraftDetail == null || DraftDetail ==undefined){
            DraftDetail=[];
            customerInfo=[];
          }
          else
          {
            customerInfo=DraftDetail['RCustomer'];
          }
          var resData=writeSearchXmlFile(respones,no_server_error,bdy);
           
          console.log('response is befre '); 
          console.log(resData); 
          let newData= new newApiRequest.insertData(
            {
              rem_no :req.rem_info.rem_no,
              transaction_id:DraftDetail['TranId'],
              service_name :req.service_info.service_name,
              service_type :req.service_info.service_type,
              system_name: req.service_info.system_name,
              username:req.service_info.username,
              agent_code :req.service_info.agent_or_Branch_Code,
              agent_name :req.service_info.agent_or_Branch_name,
              agent_address :req.service_info.agent_or_Branch_addrs,
              date:Date.now(),
              tokenBody:tokenbdy,
              requestData:bodyRequest,
              responesData:JSON.stringify(respones),
              Amounts:DraftDetail['DraftAmt'],
              FirstName:(customerInfo['FirstName'] === undefined) ? '' : customerInfo['FirstName'],
              SecondName:(customerInfo['SecondName'] === undefined) ? '' : customerInfo['SecondName'],
              ThirdName:(customerInfo['ThirdName'] === undefined) ? '' : customerInfo['ThirdName'],
              LastName:(customerInfo['LastName'] === undefined) ? '' : customerInfo['LastName'],
              CustID:(customerInfo['Id'] === undefined) ? '' : customerInfo['Id'],
              qRespones:resData,
              Request:JSON.stringify(req)
            });
            var finalResponse = resData;
           let object_id;
            newData.save( async (err,doc)=> {
              if(!err){
                object_id=doc['_id'];
                console.log(object_id);
                DraftDetail['TranId']=object_id;
                console.log(respones);
                console.log('record was added'); 
                console.log('response is '); 
                console.log(finalResponse); 
                callback(finalResponse);
              }
              else
              {
                console.log(err);
                var resData=writeSearchXmlFile(respones,database_error,bdy);
                callback(resData);
              }
            });
     //   }
      /*  else
        {
          var resData=writeSearchXmlFile(respones,no_server_error);
           callback(resData); 
        }*/
              
          });
     }
     else
     {
       var err_json={code:'00003', massege:'حدث خطاء اثناء الاتصال مع الخدمة الرجاء التواصل مع مدير النظام '};
       var object='{}';
       var err_msg_praper=writeSearchXmlFile(object,err_json,bdy );
        callback(err_msg_praper);
     }
 
       });
       
   }
   else if ((req.service_info.service_type).toUpperCase() == P_service_type)
   { 
    getToken(
      function(pdata,bdy){ 
       
       
         if(pdata[token_index] !== undefined)
      {
    
      rem_no= req.rem_info.rem_no;
      token = pdata[token_index];
      token_type= pdata[token_type_index];
      PreparePayData(req,function(StringPreparedData , xmlQuery){

        console.log(StringPreparedData);
        payRemittance(StringPreparedData,token,token_type,function(respones,bdy){
          var Res_Code= (respones['ResultCode'] === undefined) ? "-5" : respones['ResultCode']
          var resXmlData=writePayXmlFile(respones,no_server_error,bdy);
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
              tokenBody:token,
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
           let object_id;
            newData.save( async (err,doc)=> {
              if(!err){
                console.log('record was added');
                callback(resXmlData);
              }
              else
              {
                console.log(err);
                var resXmlData=writePayXmlFile(respones,database_error,bdy);
                callback(resXmlData);
              }
            });
      });
      
     });
  }
  else
  {
    var err_json={code:'00003', massege:'حدث خطاء اثناء الاتصال مع الخدمة الرجاء التواصل مع مدير النظام '};
    var object='{}';
    var err_msg_praper=writeSearchXmlFile(object,err_json,bdy );
        callback(err_msg_praper);
     
  }
      
    }
    );
   }
   else
   {
    var err_json={code:'00002', massege:'لا توجد خدمة  "'+ (req.service_info.service_type).toUpperCase() + 'ّّ" في عمليات خدمة السريع  '};
    var object='{}';
    var err_msg_praper=writeSearchXmlFile(object,err_json,'حدث خطاء في السرفر الخاص بالربط' );
        callback(err_msg_praper);
       }
   
}
module.exports.cac_server=cac_server;

function getToken(callback) {

    var x = {
      "access_token":"aiwoeiyqowieyoqiw7987987987",
      "token_type":"brear"
    }
    return callback(x,JSON.stringify(x));

//     request.post(
//    { headers: TokenHeader,
//     url: TokenURL,
//    },
//    function(err,respones,body)
//       {
       
//       try {
    
//            var json_tok= JSON.parse(body);
//            return callback(json_tok,JSON.stringify(body));

//       } catch (error) {
//         var test=new Object; 
//         test.error = err;
//         test.res=respones;
//         test.bdy=body
//         return callback(test,JSON.stringify(body));
//       }

//       }
// ); 
}

function getRemittance(rem_no , access_token, token_type ,callback)
{
    SearchHeader={ 'content-type': content_type, 'Authorization': token_type + " " + String(access_token) };
    var data = { SearchText: String(rem_no), SearchType: 0 };
    data = JSON.stringify(data);


    request.post(
      {
        headers: SearchHeader,
        url: SearchUrl,
        body: data,
        method: method
      },
      function (err, respones, body) {
        if(!err){
          console.log(body)
          try 
          {
               var json_tok= JSON.parse(body);
               return callback(json_tok,JSON.stringify(body),data);
          } catch (error) {
            var test=new Object; 
            test.error=err;
            test.bdy=err;
            test.res=respones;
            
            return callback(test,JSON.stringify(body),data);
          }
        } else {
          var errResponse = {
            'ResultCode':-5,
            "ResultMessage":err.message
          }
          return callback(errResponse,JSON.stringify(body),data);
        }

      });
}
function payRemittance(body,access_token,token_type,callback){

  var PayHeader={ 'content-type': content_type, 'Authorization': token_type + " " + String(access_token)};

   request.post(
    {
      headers:PayHeader  ,
      url: PayRemUrl,
      body:body,
      method: 'post'
    },
    function (err, respones, body) {
      if(!err){
        try {
          //  console.log(respones);
            console.log(err);
               var json_tok= JSON.parse(body);
               return callback(json_tok,JSON.stringify(body));
          
          } catch (error) {
            var test=new Object; 
             test.error=err;
              test.bdy=err;
              test.res=respones;
            return callback(test,JSON.stringify(body));
          }
      } else {
        var errResponse = {
          'ResultCode':-5,
          "ResultMessage":err.message
        }
        return callback(errResponse,JSON.stringify(body));
      }

    });

}

function writeSearchXmlFile(responesData,ServerData,body)
{//responesData= JSON.parse(responesData);
  //console.log(responesData);
 // if (ServerData.code == '00000'){
  
  check_respones_code=responesData.ResultCode;
  var DraftDetail=responesData['DraftDetail'];
  var customerInfo;
  var senderInfo;
  var senderIdInfo;
  var customerIdInfo;
  if (DraftDetail == null || DraftDetail==undefined)
  {
     DraftDetail =[];
     customerInfo= [];
     senderInfo =[];
     senderIdInfo=[];
     customerIdInfo=[];
  }
  else 
  {
    customerInfo= DraftDetail['RCustomer'];
    senderInfo=DraftDetail['SCustomer'];
    if (DraftDetail['RCustomer']['IdDetail'] != null)
    customerIdInfo=DraftDetail['RCustomer']['IdDetail'];
    else 
    customerIdInfo=[];

     if (DraftDetail['SCustomer']['IdDetail'] != null)
     senderIdInfo=DraftDetail['RCustomer']['IdDetail'];
     else
     senderIdInfo=[];
  }

  //****************DB-SaveData************************* */

  /***************************************** */
//}
//ملاحظة لا يتم استرجاع بيانات بطاقة المرسل في استرجاع البيانات لذلك لم يتم تضمينها صمن الشروط السابقة  
  //if (check_respones_code == 1) {
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
 
    <code_API> ${(responesData['ResultCode'] === undefined) ? -5 : responesData['ResultCode']}</code_API>
    <msg_API>${(responesData['ResultMessage'] === undefined) ? body : responesData['ResultMessage']}</msg_API>
  </msg_info_API>
  <rem_info>
   <rem_no>${(DraftDetail['DraftCode'] === undefined) ? '' : DraftDetail['DraftCode']}</rem_no>
   <receiveOrderCode>${(DraftDetail['TranId'] === undefined) ? '' : DraftDetail['TranId']}</receiveOrderCode>
   <paying_amount></paying_amount>
   <payout_amount>${(DraftDetail['DraftAmt'] === undefined) ? '' : DraftDetail['DraftAmt']}</payout_amount>
   <paying_cuyc></paying_cuyc>
   <payout_cuyc>${(DraftDetail['RCurrency'] === undefined) ? '' : DraftDetail['RCurrency']}</payout_cuyc>
   <payout_com>${(DraftDetail['FeeAmt'] === undefined) ? '' : DraftDetail['FeeAmt']}</payout_com>
   <payout_com_cuyc>${(DraftDetail['RCurrency'] === undefined) ? '' : DraftDetail['RCurrency']}</payout_com_cuyc>
   <payout_settlement_rate></payout_settlement_rate>
   <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
   <payout_settlement_amount></payout_settlement_amount>
   <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
   <rem_status></rem_status>
   <rem_type></rem_type>
   <sending_coyc></sending_coyc>
   <destenation_coyc></destenation_coyc>
   <user_note>${(DraftDetail['UserNote'] === undefined) ? '' : DraftDetail['UserNote']}</user_note>
  </rem_info>
  <sender_info>
   <sender_trns_id>${(senderInfo['Id'] === undefined) ? '' : senderInfo['Id']}</sender_trns_id>
   <f_name> ${(senderInfo['FirstName'] === undefined) ? '' : senderInfo['FirstName']}</f_name>
   <s_name> ${(senderInfo['SecondName'] === undefined) ? '' : senderInfo['SecondName']}</s_name>
   <th_name>${(senderInfo['ThirdName'] === undefined) ? '' : senderInfo['ThirdName']}</th_name>
   <l_name> ${(senderInfo['LastName'] === undefined) ? '' : senderInfo['LastName']}</l_name>
   <full_name> ${(senderInfo['FullName'] === undefined) ? '' : senderInfo['FullName']}</full_name>
   <telephone>${(senderInfo['TelNo'] === undefined) ? '' : senderInfo['TelNo']}</telephone>
   <mobile>${(senderInfo['MobileNo'] === undefined) ? '' : senderInfo['MobileNo']}</mobile>
   <address>${(senderInfo['Address1'] === undefined) ? '' : senderInfo['Address1']}</address>
   <address1></address1>
   <nationality_coyc> ${(senderInfo['Nationality'] === undefined) ? '' : senderInfo['Nationality']}</nationality_coyc>
   <bd_or_ed> ${(senderInfo['DoB'] === undefined) ? '' : senderInfo['DoB']}</bd_or_ed>
   <gender></gender>
   <identity_type></identity_type>
   <identity_no></identity_no>
   <identity_issues></identity_issues>
   <identity_exp></identity_exp>
   <note></note>
  </sender_info>
  <reciver_info>
   <reciver_trns_id>${(customerInfo['Id'] === undefined) ? '' : customerInfo['Id']}</reciver_trns_id>
   <f_name>${(customerInfo['FirstName'] === undefined) ? '' : customerInfo['FirstName']}</f_name>
   <s_name>${(customerInfo['SecondName'] === undefined) ? '' : customerInfo['SecondName']}</s_name>
   <th_name>${(customerInfo['ThirdName'] === undefined) ? '' : customerInfo['ThirdName']}</th_name>
   <l_name>${(customerInfo['LastName'] === undefined) ? '' : customerInfo['LastName']}</l_name>
   <full_name>${(customerInfo['FullName'] === undefined) ? '' : customerInfo['FullName']}</full_name>
   <telephone>${(customerInfo['TelNo'] === undefined) ? '' : customerInfo['TelNo']}</telephone>
   <mobile>${(customerInfo['MobileNo'] === undefined) ? '' : customerInfo['MobileNo']}</mobile>
   <address>${(customerInfo['Address1'] === undefined) ? '' : customerInfo['Address1']}</address>
   <nationality_coyc>${(customerInfo['Nationality'] === undefined) ? '' : customerInfo['Nationality']}</nationality_coyc>
   <gender></gender>
   <identity_type>${(customerIdInfo['IdType'] === undefined) ? '' : customerIdInfo['IdType']}</identity_type>
   <identity_no>${(customerIdInfo['IdNo'] === undefined) ? '' : customerIdInfo['IdNo']}</identity_no>
   <identity_issues>${(customerIdInfo['IdDate'] === undefined) ? '' : customerIdInfo['IdDate']}</identity_issues>
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

function PreparePayData(req,callback)
{
  console.log(req.rem_info.receiveOrderCode);
  var TranId='';
  var queryResponse="" ;
  var Id='';
  var FirstName='';
  var SecondName='';
  var ThirdName='';
  var LastName='';
  var newObject= new Object;
  newApiRequest.insertData.find({_id:decodeURI(req.rem_info.receiveOrderCode)},(err,apiData)=>{
    // newApiRequest.insertData.find({_id:ObjectId('req.rem_info.receiveOrderCode')},(err,apiData)=>{  
  
    console.log("err speed is");
    console.log(err);
    
    if(!err){
      try{
        newObject= JSON.parse(apiData[apiData.length - 1].responesData);
        FirstName=apiData[apiData.length - 1].FirstName;
        SecondName=apiData[apiData.length - 1].SecondName;
        ThirdName=apiData[apiData.length - 1].ThirdName;
        LastName=apiData[apiData.length - 1].LastName;
        queryResponse = apiData[apiData.length - 1].qRespones;
      } catch(error){
        newObject= JSON.parse("");
        FirstName="";
        SecondName="";
        ThirdName="";
        LastName="";
        queryResponse = "";
      }
    } else {
      newObject= JSON.parse("");
      FirstName="";
      SecondName="";
      ThirdName="";
      LastName="";
      queryResponse = "";
    }
  //newObject= JSON.parse(apiData[0].responesData);
  TranId=newObject.DraftDetail.TranId;
  Id=newObject.DraftDetail.RCustomer.Id;
  // FirstName=apiData[0].FirstName;
  // SecondName=apiData[0].SecondName;
  // ThirdName=apiData[0].ThirdName;
  // LastName=apiData[0].LastName;
  console.log(newObject);
  var PayRespones={
    "RCustomer": {
      "Id":Id, "FirstName":FirstName, "SecondName": SecondName, 
      "ThirdName": ThirdName, "LastName": LastName, "MobileNo":req.reciver_info.mobile, 
      "TelNo": req.reciver_info.telph_no, "FullName": req.reciver_info.full_name, "DoB": (req.reciver_info.bd_or_ed),      
       "PoB":req.reciver_info.birthPlace ,"Nationality":(req.reciver_info.nationality_coyc),"CoB":"" , "Country": (req.reciver_info.reciver_country), 
      "City":(req.reciver_info.reciver_city), "Address1": (req.reciver_info.address), "Address2": (req.reciver_info.address1), 
      "IdDetail":{ "IdNo": (req.reciver_info.identity_no), "IdType": (req.reciver_info.identity_type),"IdDateType":"1" ,
       "IdDate": (req.reciver_info.identity_issues), 
       "CoI":req.reciver_info.identityIssuePlace }}, "TranID": TranId, "DraftCode": (req.rem_info.rem_no), "PartnerRefDetail":
      { "User": (req.service_info.username), "BranchId": (req.service_info.agent_or_Branch_Code), 
      "BranchName": (req.service_info.agent_or_Branch_name), "BranchAddress": (req.service_info.agent_or_Branch_addrs)}
  };
  return callback(JSON.stringify(PayRespones) , queryResponse );

});

}

function writePayXmlFile(responesData,ServerData,bdy)
{//console.log(typeof responesData);
  //responesData=JSON.parse(responesData);

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
          <code_API>${(responesData.ResultCode === undefined) ? -5 : responesData.ResultCode} </code_API>
          <msg_API>${(responesData.ResultMessage === undefined) ? bdy :responesData.ResultMessage}</msg_API>
        </msg_info_API>
        </ns:PaymentRem_respons>
       </env:Body>
  </env:Envelope>`
}

function isEmptyObject(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}


function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;

}


function writeErrorLog(opNo,user,service,type,error){
return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
}
