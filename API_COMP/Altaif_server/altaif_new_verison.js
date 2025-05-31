const request = require("request");
var rn = require('random-number');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
const baseURL = "https://www.gexmoney.com:5016/api";
const clientID = "97632def-e56d-11ec-967e-000c295d8935-agentnoaman";
const ClienrSecret = "c7fd9854-e577-11ec-967e-000c295d8935";
const authenticationEndPoint = "/token";
const queryRemitEndpoint = "/remittance-inquiry";
const payRemittanceEndponit = "/pay-remittance";
const payCalculateFee = "/calculate-pay-fees";
const TokenContent_type = 'application/x-www-form-urlencoded; charset=UTF-8';
const altaifTokenHeader = { 'content-type': TokenContent_type };
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var token='';
 


function altaif_server(req, callback){
 
    findLastToken(req.service_info.service_name).then(value=>{
        console.log("token found in DB");
        if ((req.service_info.service_type).toUpperCase() == 'Q_REM'){
            var remitNo = req.rem_info.rem_no;
            searchRemit(value.tokenBody,remitNo,function(status,data,bodySent){
                if (status==200){
                    if(data.RemittanceStateId == 330 || data.RemittanceStateId == 331 ){
                        var name = data.Beneficiary.CustomerEn.Name;
                        var amounts = data.ReceiveAmount.Amount;
                        var beneficiaryCityID = data.Beneficiary.CityId;
                        var beneficiaryExternalPersonID = data.Beneficiary.ExternalPersonId;
                        var res_data = writeQueryRemitxml(data,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              transaction_id:data.SourceTransaction,
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: JSON.stringify(bodySent),
                              responesData: JSON.stringify(data),
                              Amounts:amounts,
                              FirstName: name,
                              SecondName: "",
                              ThirdName: "",
                              LastName: beneficiaryCityID,
                              CustID: beneficiaryExternalPersonID,
                              qRespones: res_data,
                              Request: JSON.stringify(req),
                            });
                            console.log(newData);
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    console.log('record was added');
                                    callback(res_data);
            
                                }
                                else {
                                    console.log("DataBase")
                                    console.log(err);
                                    var callbackResponse = writeQueryRemitxml(data,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    } else{
                        
                        var res_data = writeGeneralErrorXmlFile(getRemitState(data.RemittanceStateId),no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              transaction_id:"",
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: JSON.stringify(bodySent),
                              responesData: JSON.stringify(data),
                              Amounts:"",
                              FirstName: "",
                              SecondName: "",
                              ThirdName: "",
                              LastName: "",
                              CustID: "",
                              qRespones: res_data,
                              Request: JSON.stringify(req),
                            });
                            console.log(newData);
                            newData.save(async (err, doc) => {
                                if (!err) {
                                    console.log('record was added');
                                    callback(res_data);
            
                                }
                                else {
                                    console.log("DataBase")
                                    console.log(err);
                                    var callbackResponse = writeGeneralErrorXmlFile(getRemitState(data.RemittanceStateId),no_server_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    }              
          
                        
                }else if (status==401) {
                        getToken(function (status,tokenData, requestSents){
                            if(status==200){
                             token = tokenData.AccessToken;
                             let newData = new newApiRequest.insertData(
                                {
                                    rem_no: 'last token',
                                    transaction_id: "",
                                    service_name: req.service_info.service_name,
                                    service_type: req.service_info.service_type,
                                    system_name: req.service_info.system_name,
                                    username: req.service_info.username,
                                    agent_code: req.service_info.agent_or_Branch_Code,
                                    agent_name: req.service_info.agent_or_Branch_name,
                                    date: Date.now(),
                                    requestData: JSON.stringify(requestSents),
                                    responesData: JSON.stringify(tokenData),
                                    tokenBody:token,
                                    Amounts: "",
                                    FirstName: "",
                                    SecondName: "",
                                    ThirdName: "",
                                    LastName: "",
                                    CustID: "",
                                });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        altaif_server(req,function(callbackResult){
                                            callback(callbackResult);
                                        });
                
                                    }
                                    else {
                                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                        callback(res_data);
                                    }
                
                                });
                            } else {
                                    var isMessageInDetail = true;
                                if('Detail' in tokenData){
                                    isMessageInDetail = true;
                                } else {
                                    isMessageInDetail = false;
                                }
                                var res_data =writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),no_server_error);
                                let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: "no token",
                                        transaction_id: "",
                                        service_name: req.service_info.service_name,
                                        service_type: req.service_info.service_type,
                                        system_name: req.service_info.system_name,
                                        username: req.service_info.username,
                                        agent_code: req.service_info.agent_or_Branch_Code,
                                        agent_name: req.service_info.agent_or_Branch_name,
                                        date: Date.now(),
                                        requestData: "",
                                        responesData: tokenData,
                                        tokenBody: "",
                                        Amounts: "",
                                        FirstName: "",
                                        SecondName: "",
                                        ThirdName: "",
                                        LastName: "",
                                        CustID: "",
                                        qRespones: res_data,
                                        Request: JSON.stringify(req),
                                    });
                                console.log(newData);
                                newData.save(async (err, doc) => {
                                    if (!err) {
                                        console.log('record was added');
                                        callback(res_data);
                
                                    }
                                    else {
                                        console.log("DataBase")
                                        console.log(err);
                                        var callbackResponse = writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),database_error);
                                        callback(callbackResponse);
                                    }
                
                                });
                            }
                        });
                    
                } else {
                    var isMessageInDetail = true;
                    if('Detail' in data){
                        isMessageInDetail = true;
                    } else {
                        isMessageInDetail = false;
                    }
                    var res_data =writeGeneralErrorXmlFile(isMessageInDetail?data.Detail:proccessingErrors(data.Errors),no_server_error);
                    let newData = new newApiRequest.insertData(
                        {
                        rem_no: req.rem_info.rem_no,
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: JSON.stringify(bodySent),
                        responesData: JSON.stringify(data),
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: res_data,
                        Request: JSON.stringify(request),
                        });
                    console.log(newData);
                    newData.save(async (err, doc) => {
                        if (!err) {
                            console.log('record was added');
                            callback(res_data);
    
                        }
                        else {
                            console.log("DataBase")
                            console.log(err);
                            var callbackResponse = writeGeneralErrorXmlFile(isMessageInDetail?data.Detail:proccessingErrors(data.Errors),database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });
        } else if ((req.service_info.service_type).toUpperCase() == 'P_REM'){            
            var remitNo = req.rem_info.rem_no;
            var remitCode =req.rem_info.req_no;
           // var externalRefNo= req.rem_info.receiveOrderCode;
           var options = {
            min:    1000000000
            , max:  10000000000
          , integer: true
          }
            var externalRefNo = rn(options);
            var mobileNo=req.reciver_info.mobile;
            findExternalRefNo(externalRefNo).then(exist=>{
                if(exist){
                    console.log("number of external is exist")
                    // altaif_server(req,function(callbackResult){
                    //     callback(callbackResult);
                    // });

                } else {
                    console.log("number of external is not exist")
                    findQResponse(remitNo).then(row=>{

                        payRemit(value.tokenBody,remitNo,remitCode,externalRefNo,row.FirstName,row.LastName,mobileNo,function(status,data,bodySent){
                                
                               if (status==200){
                                if(data.RemittanceNumber == remitNo.toString()) {
                                    console.log("remit no is equal")
                                    var trans_id = data.TransactionNumber;
                                    var res_data = writeConfirmRemitXmlFile(data,no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                          rem_no: req.rem_info.rem_no,
                                          transaction_id: trans_id,
                                          service_name: req.service_info.service_name,
                                          service_type: req.service_info.service_type,
                                          system_name: req.service_info.system_name,
                                          username: req.service_info.username,
                                          agent_code: req.service_info.agent_or_Branch_Code,
                                          agent_name: req.service_info.agent_or_Branch_name,
                                          date: Date.now(),
                                          requestData: bodySent,
                                          responesData: JSON.stringify(data),
                                          Amounts: row.Amounts,
                                          FirstName: row.FirstName,
                                          SecondName: "",
                                          ThirdName: "",
                                          LastName: row.LastName,
                                          CustID: externalRefNo.toString(),
                                          qRespones: row.qRespones,
                                          pRespones:res_data,
                                          Request: JSON.stringify(req),
                                          remStatus:"1"
                                        });
                                        console.log(newData);
                                        newData.save(async (err, doc) => {
                                            if (!err) {
                                                console.log('record was added');
                                                callback(res_data);
                        
                                            }
                                            else {
                                                console.log("DataBase")
                                                console.log(err);
                                                var callbackResponse = writeConfirmRemitXmlFile(data,database_error);
                                                callback(callbackResponse);
                                            }
                        
                                        });
                                }else {
                                    console.log("remit no is not equal")
                                    var res_data =writeGeneralErrorXmlFile("حدث خطأ اثناء محاولة دفع الحوالة يرجى المحاولة لاحقا",no_server_error);
                                    let newData = new newApiRequest.insertData(
                                        {
                                            rem_no: req.rem_info.rem_no,
                                            transaction_id: "",
                                            service_name: req.service_info.service_name,
                                            service_type: req.service_info.service_type,
                                            system_name: req.service_info.system_name,
                                            username: req.service_info.username,
                                            agent_code: req.service_info.agent_or_Branch_Code,
                                            agent_name: req.service_info.agent_or_Branch_name,
                                            date: Date.now(),
                                            requestData: bodySent,
                                            responesData: JSON.stringify(data),
                                            Amounts: row.Amounts,
                                            FirstName: row.FirstName,
                                            SecondName: "",
                                            ThirdName: "",
                                            LastName: "",
                                            CustID: "",
                                            qRespones: row.qRespones,
                                            pRespones:res_data,
                                            Request: JSON.stringify(req),
                                            remStatus:"0"
                                          });
                                    console.log(newData);
                                    newData.save(async (err, doc) => {
                                        if (!err) {
                                            console.log('record was added');
                                            callback(res_data);
                    
                                        }
                                        else {
                                            console.log("DataBase")
                                            console.log(err);
                                            var callbackResponse = writeGeneralErrorXmlFile("حدث خطأ اثناء محاولة دفع الحوالة يرجى المحاولة لاحقا",database_error);
                                            callback(callbackResponse);
                                        }
                    
                                    });
                                }

                               } else if (status==401) {
                                       getToken(function (status,tokenData, requestSents){
                                           if(status==200){
                                            token = tokenData.AccessToken;
                                            let newData = new newApiRequest.insertData(
                                               {
                                                   rem_no: 'last token',
                                                   transaction_id: "",
                                                   service_name: req.service_info.service_name,
                                                   service_type: req.service_info.service_type,
                                                   system_name: req.service_info.system_name,
                                                   username: req.service_info.username,
                                                   agent_code: req.service_info.agent_or_Branch_Code,
                                                   agent_name: req.service_info.agent_or_Branch_name,
                                                   date: Date.now(),
                                                   requestData: requestSents,
                                                   responesData: JSON.stringify(tokenData),
                                                   tokenBody:token,
                                                   Amounts: "",
                                                   FirstName: "",
                                                   SecondName: "",
                                                   ThirdName: "",
                                                   LastName: "",
                                                   CustID: "",
                                               });
                                               console.log(newData);
                                               newData.save(async (err, doc) => {
                                                   if (!err) {
                                                       console.log('record was added');
                                                       altaif_server(req,function(callbackResult){
                                                           callback(callbackResult);
                                                       });
                               
                                                   }
                                                   else {
                                                       var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                                       callback(res_data);
                                                   }
                               
                                               });
                                           } else {
                                                   var isMessageInDetail = true;
                                               if('Detail' in tokenData){
                                                   isMessageInDetail = true;
                                               } else {
                                                   isMessageInDetail = false;
                                               }
                                               var res_data =writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),no_server_error);
                                               let newData = new newApiRequest.insertData(
                                                   {
                                                       rem_no: "no token",
                                                       transaction_id: "",
                                                       service_name: req.service_info.service_name,
                                                       service_type: req.service_info.service_type,
                                                       system_name: req.service_info.system_name,
                                                       username: req.service_info.username,
                                                       agent_code: req.service_info.agent_or_Branch_Code,
                                                       agent_name: req.service_info.agent_or_Branch_name,
                                                       date: Date.now(),
                                                       requestData: "",
                                                       responesData: tokenData,
                                                       tokenBody: "",
                                                       Amounts: "",
                                                       FirstName: "",
                                                       SecondName: "",
                                                       ThirdName: "",
                                                       LastName: "",
                                                       CustID: "",
                                                       qRespones: res_data,
                                                       Request: JSON.stringify(req),
                                                   });
                                               console.log(newData);
                                               newData.save(async (err, doc) => {
                                                   if (!err) {
                                                       console.log('record was added');
                                                       callback(res_data);
                               
                                                   }
                                                   else {
                                                       console.log("DataBase")
                                                       console.log(err);
                                                       var callbackResponse = writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),database_error);
                                                       callback(callbackResponse);
                                                   }
                               
                                               });
                                           }
                                       });
                                   
           
                               } else {
                                   var isMessageInDetail = true;
                                   if('Detail' in data){
                                       isMessageInDetail = true;
                                   } else {
                                       isMessageInDetail = false;
                                   }
                                   var res_data =writeGeneralErrorXmlFile(isMessageInDetail?data.Detail:proccessingErrors(data.Errors),no_server_error);
                                   let newData = new newApiRequest.insertData(
                                       {
                                           rem_no: req.rem_info.rem_no,
                                           transaction_id: "",
                                           service_name: req.service_info.service_name,
                                           service_type: req.service_info.service_type,
                                           system_name: req.service_info.system_name,
                                           username: req.service_info.username,
                                           agent_code: req.service_info.agent_or_Branch_Code,
                                           agent_name: req.service_info.agent_or_Branch_name,
                                           date: Date.now(),
                                           requestData: bodySent,
                                           responesData: JSON.stringify(data),
                                           Amounts: row.Amounts,
                                           FirstName: row.FirstName,
                                           SecondName: "",
                                           ThirdName: "",
                                           LastName: "",
                                           CustID: "",
                                           qRespones: row.qRespones,
                                           pRespones:res_data,
                                           Request: JSON.stringify(req),
                                           remStatus:"0"
                                         });
                                   console.log(newData);
                                   newData.save(async (err, doc) => {
                                       if (!err) {
                                           console.log('record was added');
                                           callback(res_data);
                   
                                       }
                                       else {
                                           console.log("DataBase")
                                           console.log(err);
                                           var callbackResponse = writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),database_error);
                                           callback(callbackResponse);
                                       }
                   
                                   });
                               }
                           });
           
                       }).catch(value=>{
                           var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                           let newData = new newApiRequest.insertData(
                               {
                                   rem_no: req.rem_info.rem_no,
                                   transaction_id: "",
                                   service_name: req.service_info.service_name,
                                   service_type: req.service_info.service_type,
                                   system_name: req.service_info.system_name,
                                   username: req.service_info.username,
                                   agent_code: req.service_info.agent_or_Branch_Code,
                                   agent_name: req.service_info.agent_or_Branch_name,
                                   date: Date.now(),
                                   requestData: "",
                                   responesData: "",
                                   Amounts: "",
                                   FirstName: "",
                                   SecondName: "",
                                   ThirdName: "",
                                   LastName: "",
                                   CustID: "",
                                   qRespones: "",
                                   pRespones:res_data,
                                   Request: JSON.stringify(req),
                                 });
                           console.log(newData);
                           newData.save(async (err, doc) => {
                               if (!err) {
                                   console.log('record was added');
                                   callback(res_data);
           
                               }
                               else {
                                   console.log("DataBase")
                                   console.log(err);
                                   var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);
                                   callback(callbackResponse);
                               }
           
                           });
                       });
                }
            })


        }
    }).catch(value=>{
        console.log("token not found in DB");
        getToken(function (status,tokenData, requestSents){
            if(status==200){
             token = tokenData.AccessToken;
             let newData = new newApiRequest.insertData(
                {
                    rem_no: 'last token',
                    transaction_id: "",
                    service_name: req.service_info.service_name,
                    service_type: req.service_info.service_type,
                    system_name: req.service_info.system_name,
                    username: req.service_info.username,
                    agent_code: req.service_info.agent_or_Branch_Code,
                    agent_name: req.service_info.agent_or_Branch_name,
                    date: Date.now(),
                    requestData: requestSents,
                    responesData: JSON.stringify(tokenData),
                    tokenBody:token,
                    Amounts: "",
                    FirstName: "",
                    SecondName: "",
                    ThirdName: "",
                    LastName: "",
                    CustID: "",
                });
                console.log(newData);
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        altaif_server(req,function(callbackResult){
                            callback(callbackResult);
                        });

                    }
                    else {
                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                        callback(res_data);
                    }

                });
            } else {
                    var isMessageInDetail = true;
                if('Detail' in tokenData){
                    isMessageInDetail = true;
                } else {
                    isMessageInDetail = false;
                }
                var res_data =writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),no_server_error);
                let newData = new newApiRequest.insertData(
                    {
                        rem_no: "no token",
                        transaction_id: "",
                        service_name: req.service_info.service_name,
                        service_type: req.service_info.service_type,
                        system_name: req.service_info.system_name,
                        username: req.service_info.username,
                        agent_code: req.service_info.agent_or_Branch_Code,
                        agent_name: req.service_info.agent_or_Branch_name,
                        date: Date.now(),
                        requestData: "",
                        responesData: tokenData,
                        tokenBody: "",
                        Amounts: "",
                        FirstName: "",
                        SecondName: "",
                        ThirdName: "",
                        LastName: "",
                        CustID: "",
                        qRespones: res_data,
                        Request: JSON.stringify(req),
                    });
                console.log(newData);
                newData.save(async (err, doc) => {
                    if (!err) {
                        console.log('record was added');
                        callback(res_data);

                    }
                    else {
                        console.log("DataBase")
                        console.log(err);
                        var callbackResponse = writeGeneralErrorXmlFile(isMessageInDetail?tokenData.Detail:proccessingErrors(tokenData.Errors),database_error);
                        callback(callbackResponse);
                    }

                });
            }
        });
    });

}



module.exports.altaif_server=altaif_server;




function getToken(callback){


    var data = {
        "client_id":clientID,
        "client_secret":ClienrSecret,
        "grant_type": "client_credentials"
    
    }

    var formBody = [];
    for (var property in data) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    request.post(
        {   
            headers:altaifTokenHeader,
            url:baseURL + authenticationEndPoint,
            body: formBody,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, formBody);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, formBody);
                }
            } else {
                return callback(1,err.message, formBody);
            }


        }
    );
}

function searchRemit(token,remit_no,callback){


    const searchRemitHeader = {
        "Authorization": "Bearer " + token,
    };

    const queryParameter = {
        "remittanceNumber":remit_no
    };
    
  
    request.get(
        {
            headers: searchRemitHeader,
            //url: baseURL + queryRemitEndpoint,
            url:"http://100.0.0.108:3150/altaif/query",
            qs:queryParameter,
            method: 'GET'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, queryParameter);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, queryParameter);
                }

            } else {
                return callback(1,err.message, queryParameter);
            }

        }
    );

    
}

function calculateFee(token,remitNo,remitCode,callback){

    const calculateFeeHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
    };
    var calculateFeeBody = { 
        "RemittanceNumber": remitNo, 
        "RemittanceCode": remitCode
       };


       var calculateFeeBodyBodyProcessed = prepareBody(calculateFeeBody);

    request.post(
        {
            headers: calculateFeeHeader,
            //url: baseURL + payCalculateFee,
            url:"http://100.0.0.108:3150/altaif/fee",
            body: calculateFeeBodyBodyProcessed,
            method: 'POST',
            
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, calculateFeeBodyBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, calculateFeeBodyBodyProcessed);
                }

            } else {
                return callback(1,err.message, calculateFeeBodyBodyProcessed);
            }

        }
    );
}

function payRemit(token,remitNo,remitCode,externalRefNo,name,cityId,mobileNo,callback){

    var payRemitBody ;
    var english = /^[A-Za-z0-9 ]*$/;
    if(english.test(name)) {
        console.log("english")
        payRemitBody = { 
            "RemittanceNumber": remitNo, 
            "RemittanceCode": remitCode, 
            "ExternalReferenceNo": externalRefNo, 
            "Beneficiary": { 
            "ExternalPersonId": 0, 
            "CustomerEn": { 
            "Name": name
            },
            "CityId": cityId, 
            "MobileCountryCode": "+967", 
            "MobileNumber": mobileNo
            } 
           };
    } else {
        console.log("arabic")
        payRemitBody = { 
            "RemittanceNumber": remitNo, 
            "RemittanceCode": remitCode, 
            "ExternalReferenceNo": externalRefNo, 
            "Beneficiary": { 
            "ExternalPersonId": 0, 
            "CustomerAr": { 
            "Name": name
            },
            "CityId": cityId, 
            "MobileCountryCode": "+967", 
            "MobileNumber": mobileNo
            } 
           };
    }
    const payRemitHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
    };


       var payRemitBodyProcessed = prepareBody(payRemitBody);
       console.log(payRemitBodyProcessed)
    request.post(
        {
            headers: payRemitHeader,
           // url: baseURL + payRemittanceEndponit,
            url:"http://100.0.0.108:3150/altaif/pay",
            body: payRemitBodyProcessed,
            method: 'POST',
            
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, payRemitBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, payRemitBodyProcessed);
                }

            } else {
                return callback(1,err.message, payRemitBodyProcessed);
            }

        }
    );
}




function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}

async function findQResponse(number) {

    var Qrespons;
    var entireRow;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no : number}, (err, apiData) => {
        try {
            if (apiData[apiData.length - 1].qRespones === undefined) {
                Qrespons = '';
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : undefined");
                reject(entireRow);
            }
            else {
                Qrespons = apiData[apiData.length - 1].qRespones;
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : " + Qrespons);
                resolve(entireRow);
            }

        } catch (error) {
            Qrespons = '';
            entireRow = apiData[apiData.length - 1];
            console.log("Qresponse is : blank");
            reject(entireRow);

        }


        console.log('55555555555555555555555555555555555555');
        console.log(entireRow)


    });
});
    
}


async function findLastToken(serviceName) {

    var Qrespons;
    var entireRow;
    var tokenStored;
    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ rem_no: "last token" , service_name:serviceName}, (err, apiData) => {
        try {
            if (apiData[apiData.length - 1].tokenBody === undefined) {
                tokenStored = '';
                console.log("tokenStored is : undefined");
                reject(tokenStored);
            }
            else {
                Qrespons = apiData[apiData.length - 1].tokenBody;
                entireRow = apiData[apiData.length - 1];
                console.log("Qresponse is : " + Qrespons);
                resolve(entireRow);
            }

        } catch (error) {
            tokenStored = '';
            console.log("tokenStored is : blank");
            reject(entireRow);

        }


        console.log('55555555555555555555555555555555555555');
        console.log(entireRow)


    });
});
    
}

function writeGeneralErrorXmlFile(error,ServerData) {

    

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
        <code_API>-1</code_API>
         <msg_API>${error}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}


function writeQueryRemitxml(responesData,ServerData) {

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
        <code_API>1</code_API>
         <msg_API>Success</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${responesData.RemittanceNumber}</rem_no>
        <trans_key>${responesData.SourceTransaction}</trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${responesData.ReceiveAmount.Amount}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${responesData.ReceiveAmount.CurrencyId}</payout_cuyc>
        <payout_com></payout_com>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc></payout_com_cuyc>
        <payout_settlement_rate></payout_settlement_rate>
        <payout_settlement_rate_cuyc></payout_settlement_rate_cuyc>
        <payout_settlement_amount></payout_settlement_amount>
        <payout_settlement_amount_cuyc></payout_settlement_amount_cuyc>
        <rem_status></rem_status>
        <rem_type></rem_type>
        <sending_coyc></sending_coyc>
        <destenation_coyc></destenation_coyc>
        <user_note></user_note>
     </rem_info>
     <sender_info>
        <sender_trns_id></sender_trns_id>
        <f_name></f_name>
        <s_name></s_name>
        <th_name></th_name>
        <l_name> </l_name>
        <full_name>${responesData.Remitter.CustomerEn.Name}</full_name>
        <telephone></telephone>
        <mobile>${responesData.Remitter.MobileNumber}</mobile>
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
        <full_name>${responesData.Beneficiary.CustomerEn.Name}</full_name>
        <telephone></telephone>
        <mobile>${responesData.Beneficiary.MobileNumber}</mobile>
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
        <exchanger_account_amount></exchanger_account_amount>
        <exchanger_account_currency_name></exchanger_account_currency_name>
        <user_id></user_id>
        <branch_code></branch_code>
        <recive_bank_code></recive_bank_code>
  </bank_info>
  <others>
        <sending_reason></sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_date>${responesData.RemittanceDate}</the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}


function writeConfirmRemitXmlFile(response,ServerData){


return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
<env:Header/>
<env:Body>
<ns:CASHIN_P>
<msg_info_server>
<code_serv>${ServerData.code}</code_serv>
<msg_serv>${ServerData.massege}</msg_serv>
</msg_info_server>
<msg_info_API>
<code_API>1</code_API>
 <msg_API>Success</msg_API>
</msg_info_API>
<PaymentRem_RESP>
<transaction_id>${response.TransactionNumber}</transaction_id>
</PaymentRem_RESP>
</ns:CASHIN_P>
</env:Body>
</env:Envelope>`
}



function proccessingErrors(jsonGot){

    var message;

        for(var key in jsonGot) {
            if(jsonGot.hasOwnProperty(key)) {
                message = jsonGot[key];
                break;
            }
        }   

      

    console.log(message[0]);

    return message[0];

}


function getRemitState(id){
    var states = [

        {
            "Id": 303,
            "Name": "تم رفضه من قبل مكافحة غسل الأموال",
            "Code": null
        },
        {
            "Id": 333,
            "Name": "مدفوعة",
            "Code": null
        },
        {
            "Id": 340,
            "Name": "معلقة",
            "Code": null
        },
        {
            "Id": 311,
            "Name": "مستردة",
            "Code": null
        },
        {
            "Id": 306,
            "Name": "في انتظار التدقيق من قبل الوكيل",
            "Code": null
        },
        {
            "Id": 307,
            "Name": "تم الرفض من قبل الوكيل",
            "Code": null
        },
        {
            "Id": 310,
            "Name": "معدلة",
            "Code": null
        },
        {
            "Id": 350,
            "Name": "مجمدة",
            "Code": null
        },
        {
            "Id": 304,
            "Name": "تم رفضه خارجيًا  من قبل مكافحة غسل الاموال",
            "Code": null
        },
        {
            "Id": 334,
            "Name": "مدفوعة خارجيا",
            "Code": null
        },
        {
            "Id": 335,
            "Name": "مدفوعة خارجيا من قبل وكيل اخر",
            "Code": null
        },
        {
            "Id": 308,
            "Name": "تم رفض النظام بعد انتهاء الصلاحية",
            "Code": null
        },
        {
            "Id": 312,
            "Name": "تم الرفض بواسطة مكافحة غسيل الأموال الخارجية",
            "Code": null
        },
        {
            "Id": 315,
            "Name": "معدلة خارجيا",
            "Code": null
        },
        {
            "Id": 316,
            "Name": "مستردة خارجيا",
            "Code": null
        },
        {
            "Id": 341,
            "Name": "معلقة خارجيا",
            "Code": null
        },
        {
            "Id": 332,
            "Name": "جاهزة للعكس",
            "Code": null
        },
        {
            "Id": 313,
            "Name": "معكوسة",
            "Code": null
        },
        {
            "Id": 317,
            "Name": "معكوسة خارجيا",
            "Code": null
        }
    ]

    var msg = "الحوالة غير جاهزة للتسليم حاليا يرجى مراجعة المرسل";

    for(var i = 0; i < states.length; i++){
        if(states[i]['Id'] == id){
            msg = states[i]['Name'];
            break;
        }
    }

    return msg;
    
}


async function findExternalRefNo(number) {


    return new Promise(async (resolve, reject) => {
    await newApiRequest.insertData.find({ service_name : "altaif" , service_type :"P_rem" , CustID:number.toString()}, (err, apiData) => {
        var isExist = false
        if(apiData.length <= 0){
            console.log("no items")
            isExist = false 
        } else {
            for(i=0; i<apiData.length ; i++){
                if(apiData[i].CustID === number.toString())
                {  
                    console.log(apiData[i].CustID)
                    console.log(number.toString())
                    console.log("number exits")
                    isExist  = true;
                    break;
                } 
            }
    
            
        }

        resolve(isExist)

    });
});
    
}
