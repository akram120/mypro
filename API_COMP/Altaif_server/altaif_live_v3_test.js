const { concatSeries } = require('async');
const request = require ('request');
const getRemtanceURL = "https://agentapi.tibchannels.com:443/api/Rem/AgentQueryRemittances";
const content_type = 'application/json';
const getRemetanceHeader = {'Content-Type' : content_type};
const payRemetanceURL= "https://agentapi.tibchannels.com:443/api/Rem/AgentPayRemittance";
const newApiRequest= require('../../db_modal/alnoamanNewModal');
const payRemetanceHeader = {'Content-Type' : content_type};
const method='post';
const Q_service_type = 'Q_REM';
const P_service_type = 'P_REM';
const Login_Name="admin alnuman";
const Login_Full_Name="شركة النعمان للصرافة";
const Login_Password= "123456";//"alnoaman";
var no_server_error={code:'00000', massege:'تمت العمليات في السيرفر بنجاح'};
var database_error= {code:'00006', massege:'حدث خطاء اثناء تخزين البيانات في ال MongoDB'};
const CoSuccessCode = 'success';
const uuid = require('uuid');
var uuid_var ;

var errorMsg = 
{
  "2":"Add_temp_rec_Delivery_Web_API:--------It Cannot To Be Paid The Code Is Incorrect",
  "3":"Add_temp_rec_Delivery_Web_API:--------Remittance does not confirm by sending source",
  "4":"Receiver ID is Expire",
  "5":"There are No Remittances Match the Search Conditions",
  "6":"Check Receiver ID Issue Date and it's Format",
  "7":"There are No Remittance payable by you Match Remittance No",
  "8":"Check Receiver Address and it's length",
  "9":"Check Receiver ID Issue and it's length",
  "10":"Add_onhold_rem_Delivery_Web_API:--------The conversion of a varchar data type to a datetime data type resulted in an out-of-range value.",
  "11":"No Remittance rate",
  "12":"No Account for Commission"
}


function altaif_service(req, callback)
{

  if ((req.service_info.service_type).toUpperCase() == Q_service_type)
  {
    var praperedtData = praperGetRemtData(req);
    getRemittance(praperedtData , function(respones,bdy){
      var responseQuery=writeSearchXmlFile(respones,no_server_error,bdy,"");
      var isResponseArray = true;
      if(Array.isArray(respones)){
        isResponseArray = true;
      } else {
        isResponseArray = false;
      }
        let newData= new newApiRequest.insertData(
          {
            rem_no :req.rem_info.rem_no,
            transaction_id:req.rem_info.rem_no,
            service_name :req.service_info.service_name,
            service_type :req.service_info.service_type,
            system_name: req.service_info.system_name,
            username:req.service_info.username,
            agent_code :req.service_info.agent_or_Branch_Code,
            agent_name :req.service_info.agent_or_Branch_name,
            agent_address :req.service_info.agent_or_Branch_addrs,
            date:Date.now(),
            responesData:JSON.stringify(respones),
            requestData:praperedtData,
            Amounts:isResponseArray?respones[0]["Remittance_Amount"]:"",
            FirstName:isResponseArray?respones[0]["Receiver_Name"]:"",
            SecondName:"",
            ThirdName:"",
            LastName:"",
            qRespones:responseQuery,
            CustID:"",
            Request:JSON.stringify(req)
          });
         var object_id;
          newData.save( async (err,doc)=> {
            if(!err){
              console.log(doc);
              object_id=doc['_id'];
              console.log('record was added');
              var responseQuery=writeSearchXmlFile(respones,no_server_error,bdy,object_id);
              callback(responseQuery);
            }
            else
            {
              console.log(err);
             var resData=writeSearchXmlFile(respones,database_error,bdy,object_id);
              callback(resData);
            }
          });

            
        });
      }
      else if ((req.service_info.service_type).toUpperCase() == P_service_type)
   { 

    praperPayData(req,function(StringPreparedData,xmlQuery){
      console.log(StringPreparedData);
      PayRemetance(StringPreparedData,function(respones,bdy){
        var Res_Code= (respones['Msg_State'] === undefined) ? -5 : respones['Msg_State']
        var respXmlData=writePayXmlFile(respones,no_server_error,bdy);
        console.log("akram");
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
            requestData:StringPreparedData,
            FirstName:"",
            SecondName:"",
            ThirdName:"",
            LastName:"",
            CustID:uuid_var,
            qRespones: (xmlQuery === undefined ?  ""  : xmlQuery)  , 
            pRespones:  respXmlData  ,
            remStatus: (Res_Code == CoSuccessCode ?  1 : 0),
            Request:JSON.stringify(req)
          });
         var object_id;
          newData.save( async (err,doc)=> {
            if(!err){
              console.log('record was added');
              console.log("response of live version is here")
              console.log(respXmlData)
              callback(respXmlData);
            }
            else
            {
              console.log(err);
              var errResponse=writePayXmlFile(respones,database_error,bdy);
              callback(errResponse);
            }
          });
    });
   });
}
}
module.exports.altaif_service = altaif_service;



function getRemittance(body, callback)
{
  
  console.log(body);
    request.post(
        {
          headers: getRemetanceHeader,
          url: "http://100.0.0.108:3150/altaif/query",
          body: body,
          method: method
        },
        function (err, respones, body) {
          if(!err){
            try 
            {
                 var json_tok= JSON.parse(body);
                 return callback(json_tok,JSON.stringify(body));
            } catch (error) {
              var test=new Object; 
              test.error=err;
              test.bdy=err;
              test.res=respones;
              
              return callback(test,JSON.stringify(body));
            }
          }else{
            var errResponse = {
              "Msg_State":-5,
              "Msg_Text":err.message
            }
            return callback(errResponse,JSON.stringify(body));
          }

        });
}



function PayRemetance(body,callback)
{
    request.post(
        {
          headers: payRemetanceHeader,
          url: "http://100.0.0.108:3150/altaif/pay",
          body: body,
          method: method
        },
        function (err, respones, body) {

          if(!err){
            console.log(body);
            try 
            {
                 var json_tok= JSON.parse(body);
                 return callback(json_tok,JSON.stringify(body));
            } catch (error) {
              var test=new Object; 
              test.error=err;
              test.bdy=err;
              test.res=respones;
              
              return callback(test,JSON.stringify(body));
            }
          }else{
            var errResponse = {
              "Msg_State":-5,
              "Msg_Text":err.message
            }
            return callback(errResponse,JSON.stringify(body));
          }

        });
}




function praperGetRemtData(req)
{
    var Data = {"Login_Name" : Login_Name,
    "Login_Full_Name" :Login_Full_Name,
    "Login_Password" :Login_Password,
    "Sender_Name" :"",
    "Receiver_Name": "",
    "Remittance_No" :req.rem_info.rem_no};

    return JSON.stringify(Data);
}

function praperPayData(req , callback)
{
  var TranId='';
  var queryResponse='';
  newApiRequest.insertData.find({_id:decodeURI(req.rem_info.receiveOrderCode)},(err,apiData)=>{
  //TranId =apiData[0].transaction_id;
  if(!err){
    try {
      TranId =apiData[apiData.length - 1].transaction_id;
      queryResponse = apiData[apiData.length - 1].qRespones;
    } catch (error) {
      TranId=""
      queryResponse=""
    }
    
  } else {
    TranId=""
    queryResponse=""
  }
  console.log(req.reciver_info.address+"/*/*"+req.rem_info.rem_no+"/*/*"+req.rem_info.req_no+"AKRAM")
  uuid_var = uuid.v1() ;
  var PayRespones=
  {
    Receiver_Address : req.reciver_info.address,
    Receiver_ID_No : req.reciver_info.identity_no,
    Receiver_ID_Issue_Date : req.reciver_info.identity_issues ,// yyyy-mm-dd
    Receiver_ID_Expire_Date : req.reciver_info.identity_exp,  // yyyy-mm-dd
    Receiver_ID_Issue : req.reciver_info.identityIssuePlace,
    Receiver_ID_Type : req.reciver_info.identity_type,
    Receiver_Nationality_ID : req.reciver_info.nationality_coyc ,
    Receiver_Phone : req.reciver_info.mobile,
    Remittance_No : req.rem_info.rem_no,
    Receiver_Birth_Date :req.reciver_info.bd_or_ed,
    Remittance_Code :req.rem_info.req_no,
    Receiver_Job : "",
    Receiver_City_ID : req.reciver_info.reciver_city,
    Receiver_Birth_Place : req.reciver_info.birthPlace,
    Receiver_Email : "",
    Receiver_English_Name : req.reciver_info.full_name,
    Receiver_Gender_ID :req.reciver_info.gender ,
    Receiver_Mother_Name : "",
    Login_Name : Login_Name,
    Login_Full_Name : Login_Full_Name,
    Login_Password : Login_Password,
    Channel_Reference_Number:   uuid_var
};
  return callback(JSON.stringify(PayRespones),queryResponse);

});

}




function writeSearchXmlFile(responesData,ServerData,body,object_id)
{
console.log(responesData);
console.log(typeof responesData);
if (responesData.length != undefined)
   responesData= responesData[0];

  var sts ;
  var msg

  if (responesData['Msg_State'] === undefined && responesData['Receiver_Name'] !== undefined)
  {
    sts = 1
    msg ="success"
     
  }
  else if (responesData['Msg_State'] === undefined && responesData['Receiver_Name'] === undefined)
  {
    sts = 99
    msg ="فشلت العملية";
  }
  else if(responesData['Msg_State'] !== undefined)
  {
    var result = getErrorMsg(responesData['Msg_Text']);

    sts = result.code;
    msg =result.msg;

  } 
   else
  {
    sts = 99
    msg ="فشلت العملية";
  }

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
 
    <code_API>${sts}</code_API>
    <msg_API>${msg}</msg_API>
  </msg_info_API>
  <rem_info>
   <rem_no>${(responesData['Remittance_No'] === undefined) ? '' : responesData['Remittance_No']}</rem_no>
   <receiveOrderCode>${object_id}</receiveOrderCode>
   <paying_amount></paying_amount>
   <payout_amount>${(responesData['Remittance_Amount'] === undefined) ? '' : responesData['Remittance_Amount']}</payout_amount>
   <paying_cuyc></paying_cuyc>
   <payout_cuyc>${(responesData['Remittance_Currency_ID'] === undefined) ? '' : responesData['Remittance_Currency_ID']}</payout_cuyc>
   <payout_com></payout_com>
   <payout_com_cuyc></payout_com_cuyc>
   <payout_settlement_rate></payout_settlement_rate>
   <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
   <payout_settlement_amount></payout_settlement_amount>
   <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
   <rem_status>${(responesData['Receiver_State'] === undefined) ? '' : responesData['Receiver_State']}</rem_status>
   <rem_type></rem_type>
   <sending_coyc></sending_coyc>
   <destenation_coyc></destenation_coyc>
   <user_note></user_note>
  </rem_info>
  <sender_info>
   <sender_trns_id></sender_trns_id>
   <f_name> </f_name>
   <s_name> </s_name>
   <th_name></th_name>
   <l_name> </l_name>
   <full_name>${(responesData['Sender_Name'] === undefined) ? '' : responesData['Sender_Name']} </full_name>
   <telephone></telephone>
   <mobile>${(responesData['Sender_Phone'] === undefined) ? '' : responesData['Sender_Phone']}</mobile>
   <address>${(responesData['Sender_Street'] === undefined) ? '' : responesData['Sender_Street']}</address>
   <address1>${(responesData['Sender_State'] === undefined) ? '' : responesData['Sender_State']}</address1>
   <nationality_coyc>${(responesData['Sender_Nationality_ID'] === undefined) ? '' : responesData['Sender_Nationality_ID']} </nationality_coyc>
   <bd_or_ed> </bd_or_ed>
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
   <full_name>${(responesData['Receiver_Name'] === undefined) ? '' : responesData['Receiver_Name']} </full_name>
   <telephone></telephone>
   <mobile>${(responesData['Receiver_Phone'] === undefined) ? '' : responesData['Receiver_Phone']} </mobile>
   <address>${(responesData['Receiver_Street'] === undefined) ? '' : responesData['Receiver_Street']}</address>
   <nationality_coyc>${(responesData['Receiver_Nationality_ID'] === undefined) ? '' : responesData['Receiver_Nationality_ID']}</nationality_coyc>
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
function writePayXmlFile(responesData,ServerData,bdy)
{

  console.log(responesData);
  console.log(typeof responesData);
  if (responesData.length != undefined)
     responesData= responesData[0];
  
    var sts ;
    var msg;
 
    if (responesData['Msg_State'] === 'success' &&  responesData['Msg_Text'] ==='Remittance Paid')
    {
      
      sts = 1
      msg ="success"
       
    }
    else if (responesData['Msg_State'] === undefined && responesData['Receiver_Name'] === undefined)
    {
      
      sts = 99
      msg = "فشلت العملية";
    }
    else if(responesData['Msg_State'] !== undefined)
    {
      var result = getErrorMsg(responesData['Msg_Text']);

      sts = result.code;
      msg = result.msg;
  
    }else
    {
      sts = 99
      msg ="فشلت العملية";
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
          <code_API>${sts}</code_API>
          <msg_API>${msg}</msg_API>
        </msg_info_API>
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


function getErrorMsg(error){
    
  var finalResult;
  var code = 99;
  var msg = "فشلت العملية"
  findServErrorMsg().then(gottenData=>{
      
      var found = false;

      Object.keys(gottenData).forEach(function(key) {
          if(error.includes(gottenData[key]))
          {
              found = true;
               finalResult = {
                  "code":key,
                  "msg":gottenData[key]
              }
              console.log(finalResult);
              return ;
          }
        })
  
        if(!found){
           finalResult = {
              "code":code,
              "msg":msg
          }
          console.log(finalResult);
          
        }
  
        return finalResult;
  }).catch(error=>{
      finalResult = {
          "code":code,
          "msg":msg
      }
      return finalResult;
  })

}


async function findServErrorMsg() {

  var errsMSG;
  return new Promise(async (resolve, reject) => {
  await newApiRequest.insertData.find({ rem_no: "ErrorList", service_name:"altaif", service_type:"getErrorMsg" }, (err, apiData) => {
      try {
          if (apiData[apiData.length - 1].responesData === undefined) {
            errsMSG = '';
              console.log("Qresponse is : undefined");
              reject(errsMSG);
          }
          else {
            errsMSG = apiData[apiData.length - 1].responesData;
              console.log("Qresponse is : " + errsMSG);
              resolve(errsMSG);
          }

      } catch (error) {
        errsMSG = '';
          console.log("Qresponse is : blank");
          reject(errsMSG);

      }


      console.log('55555555555555555555555555555555555555');
      console.log(errsMSG);


  });
});
  
}

