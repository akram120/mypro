const request = require("request");
const CashinPayUrl="https://agentapi.tadhamonbank.com/AgentWs/resources/Agent/agentApiRequest";
const CashInOutConfirmUrl="https://agentapi.tadhamonbank.com/AgentWs/resources/Agent/agentApiConfirmRequest";
const agentApiRegionurl="https://agentapi.tadhamonbank.com/AgentWs/resources/Agent/agentApiRegion";
const TadamonPayMethod="post";	
var userName ="alnoaman-API-1";
const password ="AlnoamanApi@123+";
const newApiRequest= require('../../db_modal/alnoamanNewModal');
const TadamonPayHeader= {'content-type': "application/json"};
const CoSuccessCode = '0';
var no_server_error={code:'00000', massege:'تمت العمليات في السيرفر بنجاح'};
var database_error= {code:'00006', massege:'حدث خطاء اثناء تخزين البيانات في ال MongoDB'};
var Account;
var Amount;
var TransId;
var Res_Code;
var serv_type;
var otp;
var regin;
var rem_no;
function Mehfthaty_server(req,callback)
{
   if ((req.service_info.service_type).toUpperCase() == 'CASHIN_Q' || (req.service_info.service_type).toUpperCase() == 'CASHOUT_Q' )
   {
        var serv = (req.service_info.service_type).toUpperCase();
         rem_no = req.rem_info.rem_no;
         serv_type = req.service_info.service_type.replace(/_q/g, '');
         Account = req.process_info.account; 
         Amount = req.process_info.amount; 
         regin=req.service_info.regin; 
         try { userName =(regin == 2) ? 'alnoaman-API-2' : 'alnoaman-API-1'} catch (err){};
         console.log('regin = '+regin);
         var agent_code=  req.service_info.agent_or_Branch_Code;
         var JsonContent= PraperCashinJson(Account,agent_code);
          console.log(JsonContent)
          PostCashin(JsonContent,serv,function(respones,bdy){

              Res_Code=respones['errCode'];
            
          //  console.log(respones['errCode']+'-----------------------------'+respones['errDesc']+'/'+Res_Code);
          var resData=writeSearchXmlFile(respones,no_server_error,bdy);
          console.log(rem_no);
          let newData= new newApiRequest.insertData(
            {
              rem_no :rem_no,
              mobile_no:Account,
              transaction_id:(respones['transNo']=== undefined) ? '-5' : respones['transNo'],
              service_name :req.service_info.service_name,
              service_type :req.service_info.service_type,
              system_name: req.service_info.system_name,
              username:req.service_info.username,
              agent_code :req.service_info.agent_or_Branch_Code,
              agent_name :req.service_info.agent_or_Branch_name,
              agent_address :req.service_info.agent_or_Branch_addrs,
              date:Date.now(),
              requestData:JsonContent,
              responesData:JSON.stringify(respones),
              Amounts:(respones['amount'] === undefined) ? '' : respones['amount'],
              FirstName:(respones['ClientName'] === undefined) ? '' : respones['ClientName'],
              SecondName:"",
              ThirdName:"",
              LastName:"",
              CustID:"",
              qRespones:resData,
              Request:JSON.stringify(req),
            });

            var object_id;
            newData.save( async (err,doc)=> {
              if(!err){
                object_id=doc['_id'];
                respones['AccountNo']=object_id;

                console.log('record was added');
                var resData=writeSearchXmlFile(respones,no_server_error,bdy);
                console.log(resData);
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
   else if ((req.service_info.service_type).toUpperCase() == 'CASHINOUTCONFIRM')
   {
    deps_name = req.rem_info.deps_name;
    rem_no = req.rem_info.rem_no;
     otp    = req.process_info.otp;
    Account = req.process_info.account;
    TransId = req.process_info.transId;
    serv_type=req.service_info.service_type_toconfirm;
    var systemAmount = req.process_info.amount;
    var Qrespons;
    var savedAmount;
     newApiRequest.insertData.find({transaction_id: TransId},(err,apiData)=>{
      try {
        if (apiData[apiData.length - 1].qRespones === undefined)
        {
         Qrespons = '';
         savedAmount=0;
        }
        else
        {
         Qrespons = apiData[apiData.length - 1].qRespones;
         savedAmount = apiData[apiData.length - 1].Amounts;

         
        }

      } catch (error) {
        Qrespons = '';
        savedAmount=0;
      } 


      
       console.log(Qrespons+'55555555555555555555555555555555555555');
      return Qrespons;
    });   

    console.log(TransId+"gggggggggggggggggggggggg"+serv_type);
   ///////////////////////////////////////////////////////

   
   var JsonContent= PraperCashInOut_ConfirmJson(TransId,serv_type);
    console.log(JsonContent+"aaaaaaaaaaaaaaaaaaaaaaaaaa")
      PostCashInOut_Confirm(JsonContent,function(respones,bdy){
        console.log("sssssssssssssssssssssssssss");
         Res_Code = (JSON.parse (respones.bdy)['errCode']).replace(/[^\d.-]/g, '');
    
   
        console.log(JSON.parse (respones.bdy)['errCode']);
         var resXmlData=writePayXmlFile(JSON.parse (respones.bdy),no_server_error,bdy);
         // console.log(Qrespons='66666666666666666666666666666666');
        
       let newData= new newApiRequest.insertData(
         {
                 rem_no :rem_no,
                 mobile_no:Account,
                 transaction_id:TransId,
                 service_name :req.service_info.service_name,
                 service_type :"CashInOutConfirm",
                 system_name: req.service_info.system_name,
                 username:req.service_info.username,
                 agent_code :req.service_info.agent_or_Branch_Code,
                 agent_name :req.service_info.agent_or_Branch_name,
                 agent_address :req.service_info.agent_or_Branch_addrs,
                 date:Date.now(),
                 requestData:JsonContent,
                 responesData:JSON.stringify(JSON.parse (respones.bdy)),
                 FirstName:"",
                 SecondName:"",
                 ThirdName:"",
                 LastName:"",
                 OTP:otp,
                 Request:JSON.stringify(req),
                 qRespones: (Res_Code == CoSuccessCode ?  Qrespons : '')  , 
                 pRespones: (Res_Code == CoSuccessCode ? resXmlData : '') ,
                 remStatus: (Res_Code == CoSuccessCode ?  1 : 0)
         }); 
         // console.log(Qrespons+'55555555555555555555555555555555555555');
        var object_id;
         newData.save( async (err,doc)=> {
           if(!err){
             object_id=doc['_id'];
             respones['AccountNo']=object_id;
              console.log(object_id)
             console.log('record was added');
             console.log(resXmlData);
             callback(resXmlData);
   
               }
               else
               {
                 console.log(err);
                 var resData=writePayXmlFile(respones,database_error,bdy);
                 callback(resData);
               }
   
             });
           });
     



   }


   else
   {
    Res_Code =-5;
    var err_json={code:'00002', massege:'لا توجد خدمة  "'+ (req.service_info.service_type).toUpperCase() + 'ّّ" في عمليات خدمة التضامن باي  '};
    var object='{}';
    var err_msg_praper=writeSearchXmlFile(object,err_json,'حدث خطاء في السرفر الخاص بالربط' );
        callback(err_msg_praper);
       }
   
}

module.exports.Mehfthaty_server=Mehfthaty_server;

function PostCashin(body , serv, callback)
{


    request.post(
        { headers: TadamonPayHeader,
         url: serv=='CASHIN_Q'?"http://100.0.0.108:3150/mehfthaty-w/cashIn":"http://100.0.0.108:3150/mehfthaty-w/cashOut",
         body: body,
         method: TadamonPayMethod
        },
        function(err,respones,body)
           { 

            if(!err){
              console.log(body+'AKRAM');
           
              try 
              {
                   var json_tok= JSON.parse(body);
                   return callback(json_tok,JSON.stringify(body));
        
              } catch (error) {
               console.log('erorr+++++');
                var test=new Object; 
                test.error = err;
                test.res=respones;
                test.bdy=body
                return callback(test,JSON.stringify(body));
              }
            } else {
              var respons_err =
              {
                  'errCode': "-5",
                  'errDesc':err.message
              };
              return callback(respons_err,JSON.stringify(body))
            }
        

     
           }
     ); 
}

function PostCashInOut_Confirm(body , callback)
{


    request.post(
        { headers: TadamonPayHeader,
         url: "http://100.0.0.108:3150/mehfthaty-w/cashInCashOut-confirm",
         body: body,
         method: TadamonPayMethod
        },
        function(err,respones,body)
           { 
            
            if(!err){
              console.log(body+'AKRAM');
           
              try 
              {
               var json_tok= JSON.parse(body);
               return callback(json_tok,JSON.stringify(body));
        
              } catch (error) {
               console.log('erorr+++++111');
                var test=new Object; 
                test.error = err;
                test.res=respones;
                test.bdy=body
                return callback(test,JSON.stringify(body));
              }
            } else{

              var respons_err =
              {
                  'errCode': "-5",
                  'errDesc':err.message
              };
              return callback(respons_err,JSON.stringify(body))

            }

     
           }
     ); 
}

function agentApiRegion(body , callback){
  request.post(
    { headers: TadamonPayHeader,
     url: agentApiRegionurl,
     body: body,
     method: TadamonPayMethod
    },
    function(err,respones,body)
       { 
        
       console.log(body+'AKRAM');
       
       try 
       {
        var json_tok= JSON.parse(body);
        return callback(json_tok,JSON.stringify(body));
 
       } catch (error) {
        console.log('erorr+++++111');

         var test=new Object; 
         test.error = err;
         test.res=respones;
         test.bdy=body
         return callback(test,JSON.stringify(body));
       }
 
       }
 ); 
}

function PraperCashinJson(Account,agent_code){
  console.log(Account);
  var Data=  /*{
        "User_Code" : TadamonPayUserCode,
        "User_Pass" : TadamonPayUserPass,
        "AGENT_Code":agent_code,
        "ReqType":TadamonPayReqType
        },*/
        {"userName":userName,"password":password,"Account":Account,"trans_type":serv_type ,/*  "currency": "886",*/ "amount":Amount}
    
        ;

        return JSON.stringify(Data);
}

function PraperCashInOut_ConfirmJson(TransId,serv_type){
  var Data=  
        {"userName":userName,"password":password,"transId":TransId ,"trans_type":serv_type,"otp":otp, /* "currency": "886",*/ "depositor_name":deps_name};

        console.log(Data);
        return JSON.stringify(Data);
        
}



function isAmountEqual(sysAmount,MehAmount){
  if(sysAmount == MehAmount){
      return true;
  } else {
      return false;
  }
}


function writeSearchXmlFile(responesData,ServerData,body){



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
    <code_API>${(Res_Code === undefined) ? -5 :Res_Code}</code_API>
     <msg_API>${(responesData['errDesc'] === undefined) ? body : responesData['errDesc']}</msg_API>
  </msg_info_API>
  <cashin_info>
   <transNo>${(responesData['transNo'] === undefined) ? '' : responesData['transNo']}</transNo>
   <AccountNo>${(Account === undefined) ? '' : Account}</AccountNo>
   <ClientName>${(responesData['ClientName'] === undefined) ? '' : responesData['ClientName']}</ClientName>
   <amount>${(responesData['amount'] === undefined) ? '' : responesData['amount']}</amount>
   <fee>${(responesData['fee'] === undefined) ? '' : responesData['fee']}</fee>
   <total>${(responesData['total'] === undefined) ? '' : responesData['total']}</total>
   <errCode>${(responesData['errCode'] === undefined) ? '' : responesData['errCode']}</errCode>
   <errDesc>${(responesData['errDesc'] === undefined) ? '' : responesData['errDesc']}</errDesc>
   </cashin_info>
</ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`;

}

function writePayXmlFile(responesData,ServerData,body)
{

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
      <code_API>${(Res_Code === undefined) ? -5 :Res_Code}</code_API>
       <msg_API>${(responesData['errDesc'] === undefined) ? body : responesData['errDesc']}</msg_API>
    </msg_info_API>
    <cashin_info>
     <transNo>${(responesData['transNo'] === undefined) ? '' : responesData['transNo']}</transNo>
     <AccountNo>${(Account === undefined) ? '' : Account}</AccountNo>
     <ClientName>${(responesData['ClientName'] === undefined) ? '' : responesData['ClientName']}</ClientName>
     <amount>${(responesData['amount'] === undefined) ? '' : responesData['amount']}</amount>
     <fee>${(responesData['fee'] === undefined) ? '' : responesData['fee']}</fee>
     <total>${(responesData['total'] === undefined) ? '' : responesData['total']}</total>
     <errCode>${(responesData['errCode'] === undefined) ? '' : responesData['errCode']}</errCode>
     <errDesc>${(responesData['errDesc'] === undefined) ? '' : responesData['errDesc']}</errDesc>
     </cashin_info>
  </ns:Q_ReciveRem>
  </env:Body>
  </env:Envelope>`
}

function writeAmountErrorXmlFile(error,ServerData) {

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
      <code_API>-5</code_API>
       <msg_API>${error}</msg_API>
    </msg_info_API>
  </ns:Q_ReciveRem>
  </env:Body>
  </env:Envelope>`
}


function writeInfoLog(opNo,user,service,type,data,typeOfRequest){
    
  return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--${typeOfRequest}:${data}`;

}


function writeErrorLog(opNo,user,service,type,error){
return `operation_no:${opNo}--user:${user}--serivce:${service}--type:${type}--error:${error}`;
}


