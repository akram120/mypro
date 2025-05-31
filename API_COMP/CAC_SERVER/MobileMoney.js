const { strict } = require('assert');
const { Console } = require('console');
let request = require('request');
/************* */

const TokenURL='https://www.cacspeed.com:7441/mmdms/v2/mm/api/v1/Auth/SignIn';
const UN_PASS_base64= new Buffer.from("AlNoaman_Ex:N0mamEx$Sp33d?").toString("base64");
const Clientid = 'mon_api_client0fef817b9cdf43719cf2dcdf54fcec20';//;alj-11
const content_type= 'application/json';
var   TokenHeader= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Basic " + UN_PASS_base64};
// const CashinUrl='https://www.cacspeed.com:7441/mmdms/v2/mm/api/v1/mon/agent/cashin';
const CashinUrl='http://172.16.151.33:3150/mblmny/cashIn';
// const CashOutUrl='https://www.cacspeed.com:7441/mmdms/v2/mm/api/v1/mon/agent/cashout';
const CashOutUrl='http://172.16.151.33:3150/mblmny/cashOut';
// const GetAccountDepositURL = 'https://www.cacspeed.com:7441/mmdms/v2/mm/api/v1/mon/agent/GetCorpAccountDetails';
const GetAccountDepositURL = 'http://172.16.151.33:3150/mblmny/accIn';
const AccountDeposit =  'http://172.16.151.33:3150/mblmny/accConfirm';
// const AccountDeposit = 'https://www.cacspeed.com:7441/mmdms/v2/mm/api/v1/mon/agent/AccountDeposit';


/******************** */
// const TokenURL='https://cacspeed.com:8011/dms_test/v2/mm/api/v1/Auth/SignIn';
// //const TokenURL= 'https://www.cacspeed.com:8011/dms/api/v1/Auth/SignIn';
// const UN_PASS_base64= new Buffer.from("cacexchange1:cacexchange1").toString("base64");
// const Clientid = 'mon_api_client';//;alj-11
// const content_type= 'application/json';
// //var   TokenHeader= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Basic " + UN_PASS_base64};
// var   TokenHeader= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Basic " + UN_PASS_base64};
// //const CashinUrl='https://www.cacspeed.com:8011/dms_test/v2/mm/api/v1/mon/agent/cashin';
// const CashinUrl='https://www.cacspeed.com:8011/dms_test/v2/mm/api/v1/mon/agent/cashin/';
// const CashOutUrl='https://www.cacspeed.com:8011/dms_test/v2/mm/api/v1/mon/agent/cashout';
// const GetAccountDepositURL = 'https://www.cacspeed.com:8011/dms_test/v2/mm/api/v1/mon/agent/GetCorpAccountDetails';
// const AccountDeposit = 'https://www.cacspeed.com:8011/dms_test/v2/mm/api/v1/mon/agent/AccountDeposit';
/****************** */

var mongoCon= require('../../config/db_connection');
const newApiRequest= require('../../db_modal/alnoamanNewModal');
var method='post'
var  SearchHeader;
const token_index='access_token';
const token_type_index= 'token_type';
const rem_index = 'rem_no';
const CoSuccessCode = 1;
var token;
var token_type;
var Q_service_type = 'CASHIN';
var P_service_type = 'CASHOUT';
var ADepsitQuery = 'ACC_DEPOSIT_Q';
var ADepsitPay = 'ACC_DEPOSIT_IN';
var no_server_error={code:'00000', massege:'تمت العمليات في السيرفر بنجاح'};
var database_error= {code:'00006', massege:'حدث خطاء اثناء تخزين البيانات في ال MongoDB'};
var randtoken = require('rand-token').generator({chars:'0-9'});
var rem_no ;
function mblmny_server(req,callback)
{
  rem_no = req.process_info.rem_no;
  //check opration type 
     if ((req.service_info.service_type).toUpperCase() == Q_service_type){

     
       getToken(function(pdata,tokenbdy){
         console.log(pdata);
     if(pdata[token_index] !== undefined)
     {
         
         token = pdata[token_index];
         token_type= pdata[token_type_index];
     
     var transaction_id= randtoken.generate(16);
     var cashinData= praperCashinData(req,transaction_id);
        console.log(cashinData);
         mmCashin(cashinData,transaction_id,token,function(respones,trns_id,bdy){
      
          console.log(respones);
          var resData=writeSearchXmlFile(respones,no_server_error,bdy);
          var Res_Code =(respones['ResultCode'] === undefined) ? -5 : respones['ResultCode']
            let newData= new newApiRequest.insertData(
              {
                OTP:req.process_info.otp,
                rem_no :rem_no,
                transaction_id:req.process_info.request_id, //trns_id
                service_name :req.service_info.service_name,
                service_type :req.service_info.service_type,
                system_name: req.service_info.system_name,
                username:req.service_info.username,
                agent_code :req.service_info.agent_or_Branch_Code,
                agent_name :req.service_info.agent_or_Branch_name,
                agent_address :req.service_info.agent_or_Branch_addrs,
                date:Date.now(),
                tokenBody:tokenbdy,
                requestData:cashinData,
                responesData:JSON.stringify(respones),
                Amounts:req.process_info.amount,
                FirstName:respones['CustomerName'],
                SecondName:"",
                ThirdName:"",
                LastName:"",
                CustID:"",
                qRespones: (Res_Code == CoSuccessCode ? resData : '')  , 
                pRespones: (Res_Code == CoSuccessCode ? resData : '') ,
                remStatus: (Res_Code == CoSuccessCode ?  1 : 0),
                Request:JSON.stringify(req)
              });
              newData.save( async (err,doc)=> {
                if(!err){
                   console.log(doc);
                   respones.transaction_id=req.process_info.request_id; 
                   console.log('record was added');
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
      getToken(function(pdata,tokenbdy){
        console.log(pdata);
    if(pdata[token_index] !== undefined)
    {
       // rem_no = req.rem_info.rem_no;
        token = pdata[token_index];
        token_type= pdata[token_type_index];
    
    var transaction_id= randtoken.generate(16);
    var cashinData= praperCashOutData(req,transaction_id);
    console.log(cashinData);
       mmCashout(cashinData,transaction_id,token,function(respones,trns_id,bdy){
         console.log(respones);
        var resData=writeSearchXmlFile(respones,no_server_error,bdy);
        var Res_Code =(respones['ResultCode'] === undefined) ? -5 : respones['ResultCode']
           let newData= new newApiRequest.insertData(
             {
              OTP:req.process_info.otp,
              rem_no :rem_no,
               transaction_id:req.process_info.request_id, //trns_id
               request_id: req.process_info.request_id,
               Amounts:req.process_info.amount,
               service_name :req.service_info.service_name,
               service_type :req.service_info.service_type,
               system_name: req.service_info.system_name,
               username:req.service_info.username,
               agent_code :req.service_info.agent_or_Branch_Code,
               agent_name :req.service_info.agent_or_Branch_name,
               agent_address :req.service_info.agent_or_Branch_addrs,
               date:Date.now(),
               tokenBody:tokenbdy,
               requestData:cashinData,
               responesData:JSON.stringify(respones),
               FirstName:req.process_info.amount,
               SecondName:"",
               ThirdName:"",
               LastName:"",
               CustID:"",
               qRespones: (Res_Code == CoSuccessCode ? resData : '')  , 
               pRespones: (Res_Code == CoSuccessCode ? resData : '') ,
               remStatus: (Res_Code == CoSuccessCode ?  1 : 0),
               Request:JSON.stringify(req)
               
             });
             newData.save( async (err,doc)=> {
               if(!err){
                  console.log(doc);
                  respones.transaction_id=req.process_info.request_id; 
                  console.log('record was added');
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
      else
      {
        var err_json={code:'00003', massege:'حدث خطاء اثناء الاتصال مع الخدمة الرجاء التواصل مع مدير النظام '};
        var object='{}';
        var err_msg_praper=writeSearchXmlFile(object,err_json,bdy );
         callback(err_msg_praper);
      }
  
        });
     }
     else if ((req.service_info.service_type).toUpperCase() ==  ADepsitQuery)
     {
      getToken(function(pdata,tokenbdy){
       
    if(pdata[token_index] !== undefined)
    {
        token = pdata[token_index];
        token_type= pdata[token_type_index];
    var AccountDepositData= praperGetAccountDeposit(req);
   
       mmGetAccountDeposit(AccountDepositData,token,function(respones,bdy,tkn){
        console.log('khaled' + tkn)
        var resData=writeSearchXmlAccountDeposit(respones,no_server_error,bdy);
            let newData= new newApiRequest.insertData(
             {
               rem_no :req.process_info.posCode,
               transaction_id: `${(respones['ResultID'] === undefined) ? req.process_info.request_id : respones['ResultID']}`,
               request_id: req.process_info.request_id,
               Amounts:req.process_info.amount,
               service_name :req.service_info.service_name,
               service_type :req.service_info.service_type,
               system_name: req.service_info.system_name,
               username:req.service_info.username,
               agent_code :req.service_info.agent_or_Branch_Code,
               agent_name :req.service_info.agent_or_Branch_name,
               agent_address :req.service_info.agent_or_Branch_addrs,
               date:Date.now(),
               requestData:AccountDepositData,
               responesData:JSON.stringify(respones),
               FirstName:respones['CorporateName'],
               SecondName:"",
               ThirdName:"",
               LastName:"",
               CustID:"",
               tokenBody: token,
               qRespones:resData,
               Request:JSON.stringify(req),
               

               
             });  
             var object_id;
             newData.save( async (err,doc)=> {
               if(!err){
              
                 object_id=doc['_id'];
                  console.log(doc);
                  respones['ResultID']= object_id;
                  respones.transaction_id = req.process_info.request_id; 
                  console.log('record was added');
                  
                  callback(resData);
               }
               else
               {
                 console.log(err);
                 var resData=writeSearchXmlAccountDeposit(respones,database_error,bdy);
                 callback(resData);
               }
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
  
        });
     }
     else if ((req.service_info.service_type).toUpperCase() == ADepsitPay)
     {
  
      mmPraperPayAccountDeposit(req , function(AccountDepositPayData, token,var_posCode,queryResponse){

        console.log(token);
        console.log(AccountDepositPayData);
        req.process_info.posCode=var_posCode;
      mmPayAccountDeposit(AccountDepositPayData,token,function(respones,bdy){
        var resData=writePayXmlAccountDeposit(respones,no_server_error,bdy);
        var Res_Code =(respones['ResultCode'] === undefined) ? -5 : respones['ResultCode']
           let newData= new newApiRequest.insertData(
             {
               rem_no :req.process_info.posCode,
               transaction_id:req.process_info.ResultID,
               request_id: req.process_info.request_id,
               Amounts:req.process_info.amount,
               service_name :req.service_info.service_name,
               service_type :req.service_info.service_type,
               system_name: req.service_info.system_name,
               username:req.service_info.username,
               agent_code :req.service_info.agent_or_Branch_Code,
               agent_name :req.service_info.agent_or_Branch_name,
               agent_address :req.service_info.agent_or_Branch_addrs,
               date:Date.now(),
               tokenBody: token,
               requestData:AccountDepositPayData,
               responesData:JSON.stringify(respones),
               FirstName:req.process_info.amount,
               SecondName:"",
               ThirdName:"",
               LastName:"",
               CustID:"",
               qRespones:queryResponse,
               pRespones:resData,
               Request:JSON.stringify(req),
               remStatus:(Res_Code == CoSuccessCode ?  1 : 0)
               
             });
             newData.save( async (err,doc)=> {
               if(!err){
                  console.log('record was added');
                  respones.transaction_id=req.process_info.request_id; 
                  callback(resData);
               }
               else
               {
                 console.log(err);
                 var resData=writePayXmlAccountDeposit(respones,database_error,bdy);
                 callback(resData);
               }
             });
           });
          });
     }
     else
     {
      var err_json={code:'00002', massege:'لا توجد خدمة  "'+ (req.service_info.service_type).toUpperCase() + 'ّّ" في عمليات خدمة السريع  '};
      var object='{}';
      var err_msg_praper=writeSearchXmlFile(object,err_json,'حدث خطاء في السرفر الخاص بالربط' );
          callback(err_msg_praper);
     } 
}


module.exports.mblmny_server=mblmny_server;

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
//        console.log(typeof body);
//        console.log(err);
//        //console.log(respones);
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

function mmCashin(body, transaction_id,token,callback)
{
const CashinToken= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Bearer " + token};
request.post(
    { headers: CashinToken,
        url: CashinUrl,
        body: body,
        method: method
       },
       function(err,respones,body)
          {
            if(!err){
              try {
                var json_tok= JSON.parse(body);
                return callback(json_tok,transaction_id,JSON.stringify(body));
                 } catch (error) {
                  console.log("error in catch"+error);
                   var test=new Object; 
                   test.error = err.message;
                   test.res=respones;
                   test.bdy=body
                   return callback(test,transaction_id,JSON.stringify(body));
                 }
            } else {
              
              var errResponse = {
                'ResultCode':-5,
                "ResultMessage":err.message
              }
              return callback(errResponse,transaction_id,JSON.stringify(body));
            }

    
          }
);
}

function mmCashout(body, transaction_id,token,callback)
{
const CashinToken= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Bearer " + token};
request.post(
    { headers: CashinToken,
        url: CashOutUrl,
        body: body,
        method: method
       },
       function(err,respones,body)
          {
            if(!err){
              console.log(body);
              try {
             var json_tok= JSON.parse(body);
             return callback(json_tok,transaction_id,JSON.stringify(body));
              } catch (error) {
                var test=new Object; 
                test.error = err;
                test.res=respones;
                test.bdy=body
                return callback(test,transaction_id,JSON.stringify(body));
              }
            }  else {
              var errResponse = {
                'ResultCode':-5,
                "ResultMessage":err.message
              }
              return callback(errResponse,transaction_id,JSON.stringify(body));
            }

    
          }
);
}

//samed.g.ye

function writeSearchXmlFile(responesData,ServerData,body)
{
  return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
 <env:Header/>
    <env:Body>
      <msg_info_API>
        <code_API> ${(responesData['ResultCode'] === undefined) ? -5 : responesData['ResultCode']}</code_API>
        <msg_API>${(responesData['ResultMessage'] === undefined) ? body : responesData['ResultMessage']}</msg_API>
        <request_id>${responesData['transaction_id']}</request_id> 
      </msg_info_API>
      <msg_info_server>
        <code_serv>${ServerData.code}</code_serv>
        <msg_serv>${ServerData.massege}</msg_serv>
      </msg_info_server>
     </env:Body>
</env:Envelope>`
}

function praperCashinData(req,id){
 var data=   { "RequestId":req.process_info.request_id,
    "Code": req.process_info.otp,
    "Amount": req.process_info.amount,
    "TranRef":req.process_info.request_id // id
    };

    return JSON.stringify(data);
}

function praperCashOutData(req,id){
 var data=   { 
 "RequestId": req.process_info.request_id,
 "CustomerIdNo": req.process_info.customer_id_no,
 "Code": req.process_info.otp,
 "Amount":  req.process_info.amount,
 "TranRef":req.process_info.request_id //id
 } ;

    return JSON.stringify(data);
}

function praperGetAccountDeposit(req){
 var x= { "RequestId": req.process_info.request_id,
    "PosCode": req.process_info.posCode
}
return JSON.stringify(x);
}

function mmGetAccountDeposit(AccountDepositData,token,callback){
  const AccountDeposit= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Bearer " + token};
  request.post(
      { headers: AccountDeposit,
          url: GetAccountDepositURL,
          body: AccountDepositData,
          method: method
         },
         function(err,respones,body)
            {
              if(!err){
                console.log(body);
                try {
               var json_tok= JSON.parse(body);
               return callback(json_tok,JSON.stringify(body),token);
                } catch (error) {
                  var test=new Object; 
                  test.error = err;
                  test.res=respones;
                  test.bdy=body
                  return callback(test,JSON.stringify(body),token);
                }
              }  else {
                var errResponse = {
                  'ResultCode':-5,
                  "ResultMessage":err.message
                }
                return callback(errResponse,JSON.stringify(body),token);
              }

      
            }
  );
}

function writeSearchXmlAccountDeposit(responesData, ServerData, bdy )
{
  return `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
   <env:Header/>
      <env:Body>
        <msg_info_API>
          <code_API>${(responesData['ResultCode'] === undefined) ? -5 : responesData['ResultCode']}</code_API>
          <msg_API>${(responesData['ResultMessage'] === undefined) ? bdy : responesData['ResultMessage']}</msg_API>
        </msg_info_API>
        <AccountDetails>
        <request_id>${(responesData['transaction_id']===undefined?"":responesData['transaction_id'])}</request_id>
        <ResultID>${(responesData['ResultID'] === undefined) ? '' : responesData['ResultID']}</ResultID> 
        <CorporateName>${(responesData['CorporateName'] === undefined) ? '' : responesData['CorporateName']}</CorporateName>
        <PosCode>${(responesData['PosCode'] === undefined) ? '': responesData['PosCode']}</PosCode>
     </AccountDetails>  
        <msg_info_server>
          <code_serv>${ServerData.code}</code_serv>
          <msg_serv>${ServerData.massege}</msg_serv>
        </msg_info_server>
       </env:Body>
  </env:Envelope>`
}

function writePayXmlAccountDeposit(responesData, ServerData, bdy )
{
  return `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
   <env:Header/>
      <env:Body>
        <msg_info_API>
          <code_API> ${(responesData['ResultCode'] === undefined) ? -5 : responesData['ResultCode']}</code_API>
          <msg_API>${(responesData['ResultMessage'] === undefined) ? (responesData['Message'] === undefined) ? bdy : responesData['Message'] : responesData['ResultMessage']}</msg_API>
        </msg_info_API>
        <AccountDetails_in_r>
        <request_id>${responesData['transaction_id']}</request_id>
        <ReferenceId>${(responesData['ReferenceId'] === undefined) ? '' : responesData['ReferenceId']}</ReferenceId> 
       
     </AccountDetails_in_r>  
        <msg_info_server>
          <code_serv>${ServerData.code}</code_serv>
          <msg_serv>${ServerData.massege}</msg_serv>
        </msg_info_server>
       </env:Body>
  </env:Envelope>`
}

function mmPraperPayAccountDeposit(req, callback){
  var token='';
  var TranId='';
  var posCode='';
  var query_response = '';
  console.log(req.process_info.ResultID);
  newApiRequest.insertData.find({_id:decodeURI(req.process_info.ResultID)},(err,apiData)=>{
    console.log('khaled')
    console.log(apiData);
  if (apiData !== undefined)
  {
  newObject= JSON.parse(apiData[apiData.length - 1].responesData);
  TranId= apiData[apiData.length - 1].transaction_id;
  query_response = apiData[apiData.length - 1].qRespones;
  token = apiData[apiData.length - 1].tokenBody;
  posCode= apiData[apiData.length - 1].rem_no;
}
else{
  TranId = "00000"
token = "no-token"
query_response = ""
posCode = "no-pos-code"
}

  var PayRespones= { "RequestId":TranId ,//req.process_info.request_id,
  "Amount": req.process_info.amount
  };
  
  return callback(JSON.stringify(PayRespones),token,posCode,query_response);


});
}

function isAmountEqual(sysAmount,MblAmount){
  if(sysAmount == MblAmount){
      return true;
  } else {
      return false;
  }
}

function mmPayAccountDeposit(body, token , callback){
  const ACC_DEPOSIT_IN_TOKEN= {'content-type': content_type, 'Clientid': Clientid, "Authorization": "Bearer " + token};
  request.post(
      { headers: ACC_DEPOSIT_IN_TOKEN,
          url: AccountDeposit,
          body: body,
          method: method
         },
         function(err,respones,body)
            {
              if(!err){
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
              var errResponse = {
                'ResultCode':-5,
                "ResultMessage":err.message
              }
              return callback(errResponse,JSON.stringify(body));
            }

      
            }
  );
}