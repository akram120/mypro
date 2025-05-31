const request= require("request");
const YeahTokenUrl="http://mt.yeahmoney.net:8444/ords/api/YMoney/Login";
const Clientid= "3x6n-YFBuuYUegSCi06oMw..";
const Client_Secret="K2n6lZCk_NjCdrTeLh_e6Q..";
//*******************test Codes********//




//********************************/
const YeahTokenAuth="Basic " + new Buffer.from(`${Clientid}:${Client_Secret}`).toString("base64");
const content_type= "application/json";
const YeahPayMethod = "post";
var YeahTokenHeader={'content-type': content_type,  "Authorization":  YeahTokenAuth};
const Agent_Code="NOMAN";
const Branch_Code="NOMANHO";
const Username="USER_API@NOMAN.COM";
var randtoken = require('rand-token').generator({chars:'0-9'});
const Password="123";
var   Language=("ar").toUpperCase();
const newApiRequest= require('../../db_modal/alnoamanNewModal');
const Agent_User_Name="khaled";
const YeahGetPayoutUrl="http://mt.yeahmoney.net:8444/ords/api/YMoney/GetPayoutInfo";
const YeahPayout =  "http://mt.yeahmoney.net:8444/ords/api/YMoney/PostPayout";
const ValidatePayout = "http://mt.yeahmoney.net:8444/ords/api/YMoney/ValidatePayout";
var token;
var token_type;
var Q_service_type = 'Q_REM';
var P_service_type = 'P_REM';
const token_index = 'Authorization';
const transaction_id = 'transaction_id';
var no_server_error={code:'00000', massege:'تمت العمليات في السيرفر بنجاح'};
var database_error= {code:'00006', massege:'حدث خطاء اثناء تخزين البيانات في ال MongoDB'};

function yeahMoneyServer(req,callback)
{
  //check opration type 
   if ((req.service_info.service_type).toUpperCase() == Q_service_type){
      
       getToken(function(pdata,bdy){
         console.log(pdata);
        // callback(pdata);
     if(pdata['Result_Code'] == 0 && pdata[token_index] !== undefined )
     {
         rem_no = req.rem_info.rem_no;
         GetPayoutInfo(rem_no,pdata,function(respones,vrfyData,bdy){
           //callback(respones);
          var Fname='',sname='',tname='',lname='';
         try { Fname=(respones.Receiver_Info.Receiver_First_Name === undefined) ? '' : respones.Receiver_Info.Receiver_First_Name} catch (err){};
         try { sname=(respones.Receiver_Info.Receiver_Second_Name === undefined) ? '' : respones.Receiver_Info.Receiver_Second_Name} catch (err){};
         try { lname=(respones.Receiver_Info.Receiver_Surname === undefined) ? '' : respones.Receiver_Info.Receiver_Surname} catch (err){};
         let newData= new newApiRequest.insertData(
            {
              rem_no :req.rem_info.rem_no,
              transaction_id:vrfyData[transaction_id],
              service_name :req.service_info.service_name,
              service_type :req.service_info.service_type,
              system_name: req.service_info.system_name,
              username:req.service_info.username,
              agent_code :req.service_info.agent_or_Branch_Code,
              agent_name :req.service_info.agent_or_Branch_name,
              agent_address :req.service_info.agent_or_Branch_addrs,
              date:Date.now(),
              responesData:JSON.stringify(respones),
              FirstName:Fname ,
              SecondName:sname,
              ThirdName:tname,
              LastName:lname,
              CustID:"",
              tokenBody: vrfyData[token_index]
            });
           var object_id;
            newData.save( async (err,doc)=> {
              if(!err){
                //console.log(doc);
                object_id=doc['_id'];
                vrfyData[transaction_id]=object_id;
                console.log('record was added');
                var resData=writeSearchXmlFile(respones,vrfyData,no_server_error,bdy);
                callback(resData);
              }
              else
              {
                console.log(err);
                var resData=writeSearchXmlFile(respones,vrfyData,no_server_error,bdy);
                callback(resData);
              }
            });
              
          });
     }
     else
     {
       var err_json={code:'00003', massege:'حدث خطاء اثناء الاتصال مع الخدمة الرجاء التواصل مع مدير النظام ' + ' TokenHeader not Found'};
       var object='{}';
       var err_msg_praper=writeSearchXmlFile(object,err_json,bdy );
        callback(err_msg_praper);
     }
 
       });
   }
   else if ((req.service_info.service_type).toUpperCase() == P_service_type)
   { 
      rem_no= req.rem_info.rem_no;
      preparePayRemitBody(req,function(StringPreparedData,headerbody){
       
         payRemittance(StringPreparedData,headerbody,function(respones,bdy,headerbody2){
             if (respones.Result_Code == 0 && respones.Otp_Number != undefined){
               ValidatePaidRemittance(respones.Otp_Number,headerbody2,function(respones,bdy,Otp_Number){
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
                   responesData:JSON.stringify(respones),
                   FirstName:"",
                   SecondName:"",
                   ThirdName:"",
                   LastName:"",
                   CustID:"",
                   OTP:Otp_Number
            });
           var object_id;
            newData.save( async (err,doc)=> {
              if(!err){
                console.log('record was added');
                var resXmlData=writePayXmlFile(respones,no_server_error,bdy,Otp_Number);
                callback(resXmlData);
              }
              else
              {
                console.log(err);
                var resXmlData=writePayXmlFile(respones,database_error,bdy,Otp_Number);
                callback(resXmlData);
              }
            });
          });
          }
          else{
          console.log(err);
           database_error= {code:'00009', massege:'لم يتم تخزين بيانات الحوالة بسبب حدوث خطاء عند تسليمها لدى شركة التسليم'};
          var resXmlData=writePayXmlFile(respones,database_error,bdy,'no Otp Returned');
          callback(resXmlData);
        } 
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
module.exports.yeahMoneyServer=yeahMoneyServer;





function getToken(callback)
{
  var x =prepareTokenBody();
  YeahTokenHeader['Trx_Ref_Id']=randtoken.generate(32) ;
   request.post(
        { headers: YeahTokenHeader,
          url: YeahTokenUrl,
          body:  x,
          method: YeahPayMethod
        },
        function(err,respones,body)
           {
             
            try {
                var json_tok= JSON.parse(body);
                json_tok.Authorization=respones.headers.authorization;
                json_tok.transaction_id = YeahTokenHeader.Trx_Ref_Id;
                return callback(json_tok,JSON.stringify(body));
     
           } catch (error) {
             var test=new Object; 
             test.error = err;
             test.res=respones;
             test.bdy=body
             return callback(test,JSON.stringify(body));
           }
     
           }
     ); 

}
function prepareTokenBody()
{
    var TokenBody={
      "Agent_Info":
      {
        "Agent_Code": Agent_Code,
        "Branch_Code":Branch_Code ,
          "User_Info":
          {
            "Username": "USER_API@NOMAN.COM",
            "Password": "123",
            "Language": "AR",
            "Agent_User_Name": "MOHA_BAKRI"
          }
      }
      
    }
        return JSON.stringify(TokenBody);
}

function GetPayoutInfo(rem_no,pdata,callback )
{
    const GetPayoutInfoToken={'content-type': content_type, 'Trx_Ref_Id': pdata[transaction_id], "Authorization": String(pdata[token_index])};
    let body={ "Unique_Tracking_Code": rem_no };
    body = JSON.stringify(body);
    request.post(
      {
        headers: GetPayoutInfoToken,
        url: YeahGetPayoutUrl,
        body: body,
        method: YeahPayMethod
      },
      function (err, respones, body) {
        console.log(body);
        try 
        {
          var json_tok= JSON.parse(body);
          return callback(json_tok,pdata,JSON.stringify(body));
        } catch (error) {
          var test=new Object; 
          test.error=err;
          test.bdy=err;
          test.res=respones;
          return callback(test,pdata,JSON.stringify(body));
        }
      });
}

function payRemittance (body,headerbody,callback)
{
    const YeahPayHeader={ 'content-type': content_type, 'Trx_Ref_Id': headerbody.trns_id , 'Authorization':  "Bearer " + String(headerbody.tokenBody)};
    console.log(body);
     console.log(headerbody);
    request.post(
      {
        headers:YeahPayHeader,
        url: YeahPayout,
        body:body,
        method: YeahPayMethod
      },
      function (err, respones, body) {
        console.log('pay' + body);
        try {
             var json_tok= JSON.parse(body);
             return callback(json_tok,JSON.stringify(body),headerbody);
        
        } catch (error) {
          var test=new Object; 
           test.error=err;
            test.bdy=err;
            test.res=respones;
          return callback(test,JSON.stringify(body),headerbody);
        }
      });
}

function ValidatePaidRemittance(Otp_Number, headerbody,callback )
{
  const YeahPayHeader={ 'content-type': content_type, 'Trx_Ref_Id': headerbody.trns_id , 'Authorization':  "Bearer " + String(headerbody.tokenBody)};
  var body = `{"Otp_Number": ${Otp_Number}}`;
  request.post(
    {
      headers:YeahPayHeader,
      url: ValidatePayout,
      body:body,
      method: YeahPayMethod
    },
    function (err, respones, body) {
      console.log('validate' + body);
      try {
           var json_tok= JSON.parse(body);
           return callback(json_tok,JSON.stringify(body),Otp_Number);
      
      } catch (error) {
        var test=new Object; 
         test.error=err;
          test.bdy=err;
          test.res=respones;
        return callback(test,JSON.stringify(body),Otp_Number);
      }
    });
}

function writeSearchXmlFile(responesData,vrfyData,ServerData,body)
{  
  check_respones_code=responesData.Result_Code;
  var Settllement_Info=responesData['Settllement_Info'];
  var payin_info=responesData['Payin_Info'];
  var customerInfo=responesData['Receiver_Info']; ;
  var senderInfo =responesData['Sender_Info']; ;

  if (Settllement_Info == null || Settllement_Info==undefined)
  {
    
     customerInfo= [];
     senderInfo =[];
     payin_info=[];
     Settllement_Info=[];
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
 
    <code_API> ${(responesData['Result_Code'] === undefined) ? -5 : responesData['Result_Code']}</code_API>
    <msg_API>${(responesData['Result_Desc'] === undefined) ? body : responesData['Result_Desc']}</msg_API>
  </msg_info_API>
  <rem_info>
   <rem_no>${(payin_info['Unique_Tracking_Code'] === undefined) ? '' : payin_info['Unique_Tracking_Code']}</rem_no>
   <receiveOrderCode>${vrfyData[transaction_id]} </receiveOrderCode>
   <paying_amount>>${(Settllement_Info['Payout_Original_Amount'] === undefined) ? '' : Settllement_Info['Payout_Original_Amount']}</paying_amount>
   <payout_amount>${(Settllement_Info['Payout_Amount'] === undefined) ? '' : Settllement_Info['Payout_Amount']}</payout_amount>
   <paying_cuyc></paying_cuyc>
   <payout_cuyc>${(Settllement_Info['Payout_Currency_Code'] === undefined) ? '' : Settllement_Info['Payout_Currency_Code']}</payout_cuyc>
   <payout_com>${(Settllement_Info['Settlement_Fee_Amount'] === undefined) ? '' : Settllement_Info['Settlement_Fee_Amount']}</payout_com>
   <payout_com_cuyc>${(Settllement_Info['Payout_Currency_Code'] === undefined) ? '' : Settllement_Info['Payout_Currency_Code']}</payout_com_cuyc>
   <payout_settlement_rate>>${(Settllement_Info['Settlement_Rate'] === undefined) ? '' : Settllement_Info['Settlement_Rate']}</payout_settlement_rate>
   <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
   <payout_settlement_amount>${(Settllement_Info['Settlement_Total_Amount'] === undefined) ? '' : Settllement_Info['Settlement_Total_Amount']}</payout_settlement_amount>
   <payout_settlement_amount_cuyc>${(Settllement_Info['Settlement_Fee_Currency_Code'] === undefined) ? '' : Settllement_Info['Settlement_Fee_Currency_Code']}</payout_settlement_amount_cuyc>
   <rem_status></rem_status>
   <rem_type></rem_type>
   <sending_coyc></sending_coyc>
   <destenation_coyc></destenation_coyc>
   <user_note>${(Settllement_Info['UserNote'] === undefined) ? '' : Settllement_Info['UserNote']}</user_note>
  </rem_info>
  <sender_info>
   <sender_trns_id>${(senderInfo['Id'] === undefined) ? '' : senderInfo['Id']}</sender_trns_id>
   <f_name> ${(senderInfo['Sender_First_Name'] === undefined) ? '' : senderInfo['Sender_First_Name']}</f_name>
   <s_name> ${(senderInfo['Sender_Second_Name'] === undefined) ? '' : senderInfo['Sender_Second_Name']}</s_name>
   <th_name>${(senderInfo['Sender_Third_Name'] === undefined) ? '' : senderInfo['Sender_Third_Name']}</th_name>
   <l_name> ${(senderInfo['Sender_Surname'] === undefined) ? '' : senderInfo['Sender_Surname']}</l_name>
   <full_name> ${(senderInfo['Sender_Full_Name'] === undefined) ? '' : senderInfo['Sender_Full_Name']}</full_name>
   <telephone></telephone>
   <mobile></mobile>
   <address></address>
   <address1></address1>
   <nationality_coyc> </nationality_coyc>
   <bd_or_ed></bd_or_ed>
   <gender></gender>
   <identity_type></identity_type>
   <identity_no></identity_no>
   <identity_issues></identity_issues>
   <identity_exp></identity_exp>
   <note></note>
  </sender_info>
  <reciver_info>
   <reciver_trns_id>${(customerInfo['Id'] === undefined) ? '' : customerInfo['Id']}</reciver_trns_id>
   <f_name>${(customerInfo['Receiver_First_Name'] === undefined) ? '' : customerInfo['Receiver_First_Name']}</f_name>
   <s_name>${(customerInfo['Receiver_Second_Name'] === undefined) ? '' : customerInfo['Receiver_Second_Name']}</s_name>
   <th_name>${(customerInfo['Receiver_Third_Name'] === undefined) ? '' : customerInfo['Receiver_Third_Name']}</th_name>
   <l_name>${(customerInfo['Receiver_Surname'] === undefined) ? '' :     customerInfo['Receiver_Surname']}</l_name>
   <full_name>${(customerInfo['Receiver_Full_Name'] === undefined) ? '' : customerInfo['Receiver_Full_Name']}</full_name>
   <telephone></telephone>
   <mobile></mobile>
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

function preparePayRemitBody(req,callback){
  var TranId='';
  var Id='';
  var FirstName='';
  var SecondName='';
  var ThirdName='';
  var LastName='';
  var newObject= new Object;
  var headersObject=new Object;
  newApiRequest.insertData.find({_id:decodeURI(req.rem_info.receiveOrderCode)},(err,apiData)=>{
  newObject= JSON.parse(apiData[0].responesData);
  FirstName=apiData[0].FirstName;
  SecondName=apiData[0].SecondName;
  ThirdName=apiData[0].ThirdName;
  LastName=apiData[0].LastName;
  headersObject.tokenBody=apiData[0].tokenBody;
  headersObject.trns_id=apiData[0].transaction_id;
  var PayRespones={
    "Payout_Info":
    {
    "Unique_Tracking_Code": req.rem_info.rem_no,
    "Payout_Agent_Notes":"",
    "Payout_Agent_Extra_Info":""
    },
    "Receiver_Info":
    {
    "Receiver_First_Name":FirstName,
    "Receiver_Second_Name":SecondName,
    "Receiver_Third_Name":ThirdName,
    "Receiver_Fourth_Name":"",
    "Receiver_Surname":LastName,
    "Receiver_Full_Name":req.reciver_info.full_name,
    "Receiver_Relation_Code": req.reciver_info.relative_relations,
    "Receiver_Title":"",
    "Receiver_Rprsnt_Id":"",
    "Receiver_Rprsnt_Name":"",
    "Receiver_Rprsnt_Mobile":"",
    "Receiver_Post_Office_Box":"",
    "Receiver_Country_Code":req.reciver_info.reciver_country,
    "Receiver_Governorate_Code":req.reciver_info.reciver_city,
    "Receiver_District_Code":"",
    "Receiver_Location_Code":"",
    "Receiver_Home_Address":req.reciver_info.address,
    "Receiver_Work_Address":req.reciver_info.address1,
    "Receiver_Zipcode":"",
    "Receiver_Phone":req.reciver_info.telph_no,
    "Receiver_Mobile":req.reciver_info.mobile,
    "Receiver_Email":"",
    "Receiver_Other_Details":"",
    "Receiver_Nationality_Code":req.reciver_info.nationality_coyc,
    "Receiver_Is_Notifiedby_Email":"",
    "Receiver_Is_Notifiedby_Sms":"",
    "Receiver_Id_Type_Country_Code":"",
    "Receiver_Id_Type_Code":req.reciver_info.identity_type,
    "Receiver_Id_Number":req.reciver_info.identity_no,
    "Receiver_Id_Issue_Date":req.reciver_info.identity_issues,
    "Receiver_Id_Expiry_Date":req.reciver_info.identity_exp,
    "Receiver_Id_Issue_Place":req.reciver_info.identityIssuePlace,
    "Receiver_Id_Birth_Date":req.reciver_info.bd_or_ed,
    "Receiver_Id_Birth_Place":req.reciver_info.birthPlace,
    "Receiver_Gender_Code":req.reciver_info.gender,
    "Receiver_Employer_Name":"",
    "Receiver_Employer_Phone":"",
    "Receiver_Employer_Address":"",
    "Receiver_Source_Of_Income":req.reciver_info.source_of_icomeing,
    }
    };
  return callback(JSON.stringify(PayRespones),headersObject);

});

}

function writePayXmlFile(responesData,ServerData,bdy)
{
  
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
          <Otp_validate>${(responesData.ResltMsg === undefined) ? bdy : responesData.ResltMsg}</Otp_validate>
        </msg_info_API>
        </ns:PaymentRem_respons>
       </env:Body>
  </env:Envelope>`
}