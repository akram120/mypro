const { concatSeries } = require('async');
const request = require ('request');
const { parentPort, workerData } = require('worker_threads')
const xml2js = require('xml2js');
var parser = new xml2js.Parser({ explicitArray: false });
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

parser.parseString(workerData , function(err, result){
    var req = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
    if ((req.service_info.service_type).toUpperCase() == Q_service_type)
    {
        console.log("point 1")
      var praperedtData = praperGetRemtData(req);
      console.log("point 2")
      getRemittance(praperedtData , function(respones,bdy){
        console.log("point 3")
        var responseQuery=writeSearchXmlFile(respones,no_server_error,bdy,"");
        var isResponseArray = true;
        if(Array.isArray(respones)){
          isResponseArray = true;
        } else {
          isResponseArray = false;
        }
        console.log("point 4")
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
           console.log("point 5")
           console.log(newData)
           var finalResp = {
            "sts":0,
            "result":responseQuery
        }
        parentPort.postMessage(finalResp);
            // newData.save( async (err,doc)=> {
            //   if(!err){
            //     console.log("point 6")
            //     console.log(doc);
            //     object_id=doc['_id'];
            //     console.log('record was added');
            //     var resData=writeSearchXmlFile(respones,no_server_error,bdy,object_id);
            //     console.log("point 7")
            //     var finalResp = {
            //         "sts":1,
            //         "result":resData
            //     }
            //     parentPort.postMessage(finalResp);
                
            //   }
            //   else
            //   {
            //     console.log(err);
            //     console.log("point 8")
            //    var resData=writeSearchXmlFile(respones,database_error,bdy,object_id);
            //    var finalResp = {
            //     "sts":1,
            //     "result":resData
            // }
            // parentPort.postMessage(finalResp);
            //   }
            // });
  
              
          });
        }
        else if ((req.service_info.service_type).toUpperCase() == P_service_type)
     { 
  
  
      praperPayData(req,function(StringPreparedData,xmlQuery){
        console.log(StringPreparedData);
        PayRemetance(StringPreparedData,function(respones,bdy){
          var Res_Code= (respones['Msg_State'] === undefined) ? -5 : respones['Msg_State']
          var responseToInernalSystem=writePayXmlFile(respones,no_server_error,bdy);
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
              pRespones:  responseToInernalSystem  ,
              remStatus: (Res_Code == CoSuccessCode ?  1 : 0),
              Request:JSON.stringify(req)
            });
            console.log(responseToInernalSystem)
           var object_id;
            newData.save( async (err,doc)=> {
              if(!err){
                console.log('record was added');
                console.log("abooooooooooooooooooooooooooooood")
                console.log(responseToInernalSystem)
                callback(responseToInernalSystem);
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
})




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
          url:  "http://100.0.0.108:3150/altaif/pay",
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
    sts = -5
    msg =body;
  }
  else if(responesData['Msg_State'] !== undefined)
  {

    sts = responesData['Msg_State'];
    msg =responesData['Msg_Text'];

  }else
  {
    sts = -5
    msg =body;
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
      
      sts = -5
      msg =bdy;
    }
    else if(responesData['Msg_State'] !== undefined)
    {
    
      sts = responesData['Msg_State'];
      msg =responesData['Msg_Text'];
  
    }else
    {
      sts = -5
      msg =bdy;
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




