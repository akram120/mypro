const request = require("request");
const baseURL = "https://cmc.qchosts.com";
const phone = "967773949213";
const password = "421957";
const newApiRequest = require('../../db_modal/alnoamanNewModal');
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var token='';

var errorMsg = {
    "2":"This remittance is not found ! ",
    "3":"This remittance has been processed"
}

function floosak_remit_server(req, callback){

    findLastToken(req.service_info.service_name).then(value=>{
        console.log("token found in DB");
        if ((req.service_info.service_type).toUpperCase() == 'Q_REM'){
            var remitNo = req.rem_info.rem_no;
            var requesterRegion = req.rem_info.region;

            searchRemit(value.tokenBody,value.transaction_id,remitNo,function(status,data,bodySent,outTrans){

                if (status==200){
                    if((requesterRegion==1 && data.data.group_id=="Sana`a") || (requesterRegion !=1 && data.data.group_id !="Sana`a")){
                        var name = data.data.remittance.receiver_name;
                        var amounts = data.data.net;
                        var res_data = writeQueryRemitxml(data.data,remitNo,no_server_error);
                        let newData = new newApiRequest.insertData(
                            {
                              rem_no: req.rem_info.rem_no,
                              transaction_id:data.data.id,
                              service_name: req.service_info.service_name,
                              service_type: req.service_info.service_type,
                              system_name: req.service_info.system_name,
                              username: req.service_info.username,
                              agent_code: req.service_info.agent_or_Branch_Code,
                              agent_name: req.service_info.agent_or_Branch_name,
                              date: Date.now(),
                              requestData: bodySent,
                              responesData: JSON.stringify(data),
                              Amounts:amounts,
                              FirstName: name,
                              SecondName: "",
                              ThirdName: "",
                              LastName: "",
                              CustID: outTrans,
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
                                    var callbackResponse = writeQueryRemitxml(data.data,remitNo,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    } else{
                        
                        var res_data = reigonError(no_server_error);
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
                              requestData: bodySent,
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
                                    var callbackResponse = reigonError(database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    }              
          
                        
                }else if (status==422) {
                    if(data.message.startsWith('You are not Authenticated')){
                        console.log("you are not authintacted")
                        console.log("---------------------------------------------------------------")
                        getToken(function (status,tokenData, requestSents){
                            if(status==200){
                             token = tokenData.data.token;
                             var walletID = getWalletID(tokenData);
                             let newData = new newApiRequest.insertData(
                                {
                                    rem_no: 'last token',
                                    transaction_id: walletID,
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
                                        floosak_remit_server(req,function(callbackResult){
                                            callback(callbackResult);
                                        });
                
                                    }
                                    else {
                                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                        callback(res_data);
                                    }
                
                                });
                            } else {
                                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
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
                                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);;
                                        callback(callbackResponse);
                                    }
                
                                });
                            }
                        });
                    } else {
                        var res_data =writeGeneralErrorXmlFile(proccessingErrors(data.errors),no_server_error);
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
                                var callbackResponse = writeGeneralErrorXmlFile(JSON.stringify(data),database_error);
                                callback(callbackResponse);
                            }
        
                        });
                    }
                } else {
                    var res_data =writeGeneralErrorXmlFile(data,no_server_error);
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
                            var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
                            callback(callbackResponse);
                        }
    
                    });
                }
            });
        } else if ((req.service_info.service_type).toUpperCase() == 'P_REM'){            
            var remitNo = req.rem_info.rem_no;
            findQResponse(remitNo).then(row=>{
                confirmRemit(value.tokenBody,row.transaction_id,function(status,data,bodySent){    
                    if (status==200){
                        var trans_id = data.data.id;
                        var res_data = writeConfirmRemitXmlFile(data.data,no_server_error);
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
                              LastName: "",
                              CustID: row.CustID,
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
                                    var callbackResponse = writeConfirmRemitXmlFile(data.data,database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                    } else if (status==422) {
                        if(data.message.startsWith('You are not Authenticated')){
                            getToken(function (status,tokenData, requestSents){
                                if(status==200){
                                 token = tokenData.data.token;
                                 var walletID = getWalletID(tokenData);
                                 let newData = new newApiRequest.insertData(
                                    {
                                        rem_no: 'last token',
                                        transaction_id: walletID,
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
                                            floosak_remit_server(req,function(callbackResult){
                                                callback(callbackResult);
                                            });
                    
                                        }
                                        else {
                                            var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                                            callback(res_data);
                                        }
                    
                                    });
                                } else {
                                    var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
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
                                            var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);;
                                            callback(callbackResponse);
                                        }
                    
                                    });
                                }
                            });
                        } else {
                            var res_data =writeGeneralErrorXmlFile(proccessingErrors(data.errors),no_server_error);
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
                                    var callbackResponse = writeGeneralErrorXmlFile(JSON.stringify(data),database_error);
                                    callback(callbackResponse);
                                }
            
                            });
                        }

                    } else {
                        var res_data =writeGeneralErrorXmlFile(data,no_server_error);
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
                                var callbackResponse = writeGeneralErrorXmlFile(data,database_error);
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
    }).catch(value=>{
        console.log("token not found in DB");
        getToken(function (status,tokenData, requestSents){
            if(status==200){
             token = tokenData.data.token;
             var walletID = getWalletID(tokenData);
             console.log("wallet ID is************************ ::"+walletID)
             let newData = new newApiRequest.insertData(
                {
                    rem_no: 'last token',
                    transaction_id: walletID,
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
                        floosak_remit_server(req,function(callbackResult){
                            callback(callbackResult);
                        });

                    }
                    else {
                        var res_data = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);
                        callback(res_data);
                    }

                });
            } else {
                var res_data =writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",no_server_error);

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
                        requestData: requestSents,
                        responesData: JSON.stringify(tokenData),
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
                        var callbackResponse = writeGeneralErrorXmlFile("الرجاء المحاولة لاحقا بسبب فشل الاتصال بالخدمة",database_error);;
                        callback(callbackResponse);
                    }

                });
            }
        });
    });

}

module.exports.floosak_remit_server=floosak_remit_server;




function getToken(callback){

    const getTokenHeader = {
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel":"agent"
    };

    var getTokenBody = {
        "phone":phone,
        "password":password,
        };

    var getTokenBodyBodyProcessed = prepareBody(getTokenBody);

    request.post(
        {
            headers: getTokenHeader,
            url:"http://100.0.0.108:3150/floosak-r/login",
            body: getTokenBodyBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {
                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode, json_tok, getTokenBodyBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, getTokenBodyBodyProcessed);
                }
            } else {
                return callback(1,err.message, getTokenBodyBodyProcessed);
            }


        }
    );
}

function searchRemit(token,wallet_id,remit_no,callback){



    var request_id = Date.now();

    const searchRemitHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel": "agent"
    };
    var searchRemitBody = {
        "source_wallet_id" : wallet_id,
        "remittance_number" : remit_no,
        "remittance_provider_id" : "3",
        "request_id" : request_id
    };
    
    var searchRemitBodyProcessed = prepareBody(searchRemitBody);
  
    request.post(
        {
            headers: searchRemitHeader,
            url: "http://100.0.0.108:3150/floosak-r/query",
            body: searchRemitBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, searchRemitBodyProcessed,request_id);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, searchRemitBodyProcessed,request_id);
                }

            } else {
                return callback(1,err.message, searchRemitBodyProcessed,request_id);
            }

        }
    );

    
}

function confirmRemit(token,id,callback){

    const confirmRemitHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "x-channel": "agent"
    };
    request.post(
        {
            headers: confirmRemitHeader,
            url: "http://100.0.0.108:3150/floosak-r/pay",
            body: "",
            method: 'POST',
            
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, "url"+id);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, "url"+id);
                }

            } else {
                return callback(1,err.message, "url"+id);
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

    var result = getErrorMsg(error);

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
        <code_API>${result.code}</code_API>
         <msg_API>${result.msg}</msg_API>
      </msg_info_API>
    </ns:Q_ReciveRem>
    </env:Body>
    </env:Envelope>`
}


function writeQueryRemitxml(responesData,remNO, ServerData) {
    var currency = ""
    if(responesData.currency.en=="YER"){
        if(responesData.group_id=="Sana`a"){
            currency = "YER"
        } else {
            currency = "YE3"
        }
    } else {
        currency = responesData.currency.en
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
        <code_API>1</code_API>
         <msg_API>true</msg_API>
      </msg_info_API>
      <rem_info>
        <rem_no>${remNO}</rem_no>
        <trans_key>${responesData.id}</trans_key>
        <region></region>
        <to_city></to_city>
        <receiveOrderCode></receiveOrderCode>
        <paying_amount></paying_amount>
        <payout_amount>${responesData.net}</payout_amount>
        <paying_cuyc></paying_cuyc>
        <payout_cuyc>${currency}</payout_cuyc>
        <payout_com>${responesData.commission}</payout_com>
        <payout_extra_com></payout_extra_com>
        <payout_com_cuyc>${currency}</payout_com_cuyc>
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
        <full_name>${responesData.remittance.sender_name}</full_name>
        <telephone></telephone>
        <mobile>${responesData.remittance.sender_phone}</mobile>
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
        <full_name>${responesData.remittance.receiver_name}</full_name>
        <telephone></telephone>
        <mobile>${responesData.remittance.receiver_phone}</mobile>
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
        <sending_reason>${responesData.purpose}</sending_reason>
        <deliver_via></deliver_via>
        <note></note>
        <the_date></the_date>
        <the_number></the_number>
 </others>
 </ns:Q_ReciveRem>
</env:Body>
</env:Envelope>`

    
}


function writeConfirmRemitXmlFile(response,ServerData){

var t_id = response.id;

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
 <msg_API>true</msg_API>
</msg_info_API>
<PaymentRem_RESP>
<transaction_id>${t_id}</transaction_id>
</PaymentRem_RESP>
</ns:CASHIN_P>
</env:Body>
</env:Envelope>`
}


function reigonError(ServerData){

return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
<env:Header/>
<env:Body>
<ns:CASHIN_Q>
<msg_info_server>
<code_serv>${ServerData.code}</code_serv>
<msg_serv>${ServerData.massege}</msg_serv>
</msg_info_server>
<msg_info_API>
<code_API>-1</code_API>
 <msg_API>لا يمكن تمرير العملية نظرا لأختلاف المنطقة</msg_API>
</msg_info_API>
</ns:CASHIN_Q>
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

function getWalletID(list){
    var y ;
    for(var i =0; i <list["data"]["wallets"].length;i++){
        switch(list["data"]["wallets"][i]["currency"]["id"]){
            case 1:
                y =list["data"]["wallets"][i]["id"]
        }
    }
    console.log("id of currency is **********:"+y);
    return y;
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
    await newApiRequest.insertData.find({ rem_no: "ErrorList", service_name:"floosak_remit", service_type:"getErrorMsg" }, (err, apiData) => {
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