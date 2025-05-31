process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const request = require("request");
const baseUrl = "https://82.114.181.246:6043/SBYB/API/Agent/";
const accessToken = "token";
const Balance = "Balance";
const Deposit = "Deposit";
const DespositReq = "Deposit_Req";
const WithdrawalReq = "Withdrawal_Req";
const Withdrawal = "Withdrawal";
const AgentReport = "AgentReport";
const CommReport = "CommReport";
const TotalCommReport = "TotalCommReport";
const TokenContent_type = 'application/x-www-form-urlencoded';
const content_type = 'application/json';
const username = '777284966';
const password = 'AlN0man123';
const client_id = '5008c1ae-504e-46db-aff5-8607106c0d60';
const client_secret = '3c350c23-1c44-47b1-a684-2c0bd84e6a5b';
const newApiRequest = require('../../db_modal/alnoamanNewModal');
const shamilTokenHeader = { 'content-type': TokenContent_type };
const tokenid = 'QTGAVPIJXQWSKSXFVMEXRTIQVYZKRRIOOQZUVXSBJQAZTMOBUWEPWXGMRFKNHQYLHWNGQQ';
const Timestamp = '1621952603';
var no_server_error = { code: '00000', massege: 'تمت العمليات في السيرفر بنجاح' };
var database_error = { code: '00006', massege: 'حدث خطاء اثناء تخزين البيانات في ال MongoDB' };
var Res_Code;
var resultOfSavingToDB;


function Shameel_server(req, callback) {

  if ((req.service_info.service_type).toUpperCase() == 'BALANCE') {

    getToken(function (status, pdata) {
      if (status == 200) {

        var gottenToken = pdata.access_token;
        var balancePRN = req.process_info.PRN;

      } else if (status == 409) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("Access_Token", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)
        callback(callbackResponse);

      } else if (status == 401) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("Access_Token", "غير مصرح للدخول ", no_server_error)
        callback(callbackResponse);

      } else {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("Access_Token", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
        callback(callbackResponse);
      }

      getBalance(function (status, pdata) {

        if (status == 200) {
          if (pdata.ResponseObject.Result.ErrorNo == 1) {

            Res_Code = 1;
            var callbackResponse = writeBalanceXmlFile(pdata.ResponseObject, no_server_error)
            callback(callbackResponse);

          } else {

            Res_Code = -5;
            var callbackResponse = writeErrorXmlFile("Balance", pdata.ResponseObject.Result.ErrorNa, no_server_error)
            callback(callbackResponse);

          }
        } else if (status == 409) {

          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("Balance", "PRN مكرر يرجى المحاولة لاحق", no_server_error)
          callback(callbackResponse);

        } else if (status == 401) {

          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("Balance", "غير مصرح للدخول ", no_server_error)
          callback(callbackResponse);

        } else {
          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("Balance", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
          callback(callbackResponse);
        }


      }, gottenToken, balancePRN);

    });
  } else if ((req.service_info.service_type).toUpperCase() == "CASHIN_Q") {

    getToken(function (status, pdata) {

      if (status == 200) {
        var tokenBodyResponse = pdata;
        var gottenToken = pdata.access_token;
        var depositeTransNo = req.process_info.transNo;
        var depositeMobileNo = req.process_info.customerMobile;
        var depositeAmount = req.process_info.amount;

      } else if (status == 409) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_Q", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)
        callback(callbackResponse);

      } else if (status == 401) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_Q", "غير مصرح للدخول ", no_server_error)
        callback(callbackResponse);
      } else if (status == 1) {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_Q", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)
        callback(callbackResponse);

      } else {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_Q", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
        callback(callbackResponse);
      }

      getDepositReq(function (status, pdata, bodyRequest) {

        if (status == 200) {
          if (pdata.ResponseObject.Result.ErrorNo == 1) {

            Res_Code = pdata.ResponseObject.Result.ErrorNo;
            var resData = writeCashInCashOutQXmlFile("CASHIN_Q", pdata.ResponseObject, no_server_error);
            let newData = new newApiRequest.insertData(
              {
                rem_no: req.rem_info.rem_no,
                mobile_no: req.process_info.customerMobile,
                transaction_id: req.process_info.transNo,
                service_name: req.service_info.service_name,
                service_type: req.service_info.service_type,
                system_name: req.service_info.system_name,
                username: req.service_info.username,
                agent_code: req.service_info.agent_or_Branch_Code,
                agent_name: req.service_info.agent_or_Branch_name,
                date: Date.now(),
                requestData: bodyRequest,
                responesData: JSON.stringify(pdata),
                tokenBody: JSON.stringify(tokenBodyResponse),
                Amounts: req.process_info.amount,
                FirstName: pdata.ResponseObject.EXDATA.customer.cust_name,
                SecondName: "",
                ThirdName: "",
                LastName: "",
                CustID: pdata.ResponseObject.EXDATA.customer.card_no,
                qRespones: resData,
                Request: JSON.stringify(req),
              });
            console.log(newData);

            newData.save(async (err, doc) => {
              if (!err) {
                console.log('record was added');
                callback(resData)
              }
              else {
                console.log("DataBase")
                console.log(err);
                Res_Code = pdata.ResponseObject.Result.ErrorNo;
                var callbackResponse = writeCashInCashOutQXmlFile("CASHIN_Q", pdata.ResponseObject, database_error);
                callback(callbackResponse)
              }
            });

          } else {

            Res_Code = pdata.ResponseObject.Result.ErrorNo;
            var resData = writeErrorXmlFile("CASHIN_Q", pdata.ResponseObject.Result.ErrorNa, no_server_error)
            let newData = new newApiRequest.insertData(
              {
                rem_no: req.rem_info.rem_no,
                mobile_no: req.process_info.customerMobile,
                transaction_id: req.process_info.transNo,
                service_name: req.service_info.service_name,
                service_type: req.service_info.service_type,
                system_name: req.service_info.system_name,
                username: req.service_info.username,
                agent_code: req.service_info.agent_or_Branch_Code,
                agent_name: req.service_info.agent_or_Branch_name,
                date: Date.now(),
                requestData: bodyRequest,
                responesData: JSON.stringify(pdata),
                tokenBody: JSON.stringify(tokenBodyResponse),
                Amounts: req.process_info.amount,
                FirstName: "",
                SecondName: "",
                ThirdName: "",
                LastName: "",
                CustID: "",
                qRespones: resData,
                Request: JSON.stringify(req),
              });
            console.log(newData);
            newData.save(async (err, doc) => {
              if (!err) {


                console.log('record was added');

                callback(resData)


              }
              else {
                console.log("DataBase")
                console.log(err);
                Res_Code = pdata.ResponseObject.Result.ErrorNo;
                var callbackResponse = writeErrorXmlFile("CASHIN_Q", pdata.ResponseObject.Result.ErrorNa, database_error)
                callback(callbackResponse)
              }
            });



          }
        } else if (status == 409) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHIN_Q", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 409 رقم prn مكرر", resData, bodyRequest, tokenBodyResponse).then(resultOfResolve => {
              console.log("result of value in Erro To DB")
              console.log(resultOfResolve)
                callback(resData);
          }).catch(resultOfReject => {
            console.log(resultOfReject)
              var callbackResponse = writeErrorXmlFile("CASHIN_Q", "PRN مكرر يرجى المحاولة لاحقا", database_error)
              callback(callbackResponse);
            });

        } else if (status == 401) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHIN_Q", "غير مصرح للدخول ", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 401 غير مصرح للدخول", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve)
                callback(resData);
            }).catch(resultOfReject => {
              console.log(resultOfReject)
              var callbackResponse = writeErrorXmlFile("CASHIN_Q", "غير مصرح للدخول ", database_error)
              callback(callbackResponse);
            });

        } else if (status == 1) {
          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHIN_Q", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)

          saveErrorsToDataBase(req, "حصل خطأ بالاتصال ب سيرفر الخدمة", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve)
                callback(resData);

            }).catch(resultOfReject => {
              console.log(resultOfReject)
              var callbackResponse = writeErrorXmlFile("CASHIN_Q", "حصل خطأ بالاتصال ب سيرفر الخدمة", database_error)
              callback(callbackResponse);
            });

        } else {
          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("CASHIN_Q", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
          callback(callbackResponse);
        }




      }, gottenToken, depositeTransNo, depositeMobileNo, depositeAmount);

    });
  } else if ((req.service_info.service_type).toUpperCase() == "CASHIN_P") {

    getToken(function (status, pdata) {

      if (status == 200) {
        var tokenBodyResponse = pdata;
        var gottenToken = pdata.access_token;
        var depositeProofMobileNo = req.process_info.customerMobile;
        var depositeProofAmount = req.process_info.amount;
        var depositeProofByName = req.process_info.by_Name;
        var depositeProofTransNo = req.process_info.transNo;
        var depositeProofBranchName = req.service_info.agent_or_Branch_name;
        var depositeProofBranchNo = req.service_info.agent_or_Branch_Code;
      } else if (status == 409) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_P", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)
        callback(callbackResponse);

      } else if (status == 401) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_P", "غير مصرح للدخول ", no_server_error)
        callback(callbackResponse);

      } else if (status == 1) {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_P", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)
        callback(callbackResponse);
      } else {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHIN_P", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
        callback(callbackResponse);
      }

      getDeposit(function (status, pdata, bodyRequest) {

        if (status == 200) {

          if (pdata.ResponseObject.Result.ErrorNo == 1) {

            findQResponse(depositeProofTransNo).then(valueRecevied => {
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
              console.log(valueRecevied)
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeCashInCashOutPXmlFile("CASHIN_P", pdata.ResponseObject, no_server_error);
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: "1"
                });
              console.log(newData)
              var object_id;
              newData.save(async (err, doc) => {
                if (!err) {
                  console.log('record was added');
                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeCashInCashOutPXmlFile("CASHIN_P", pdata.ResponseObject, database_error);
                  callback(callbackResponse);
                }

              });
            }).catch(valueRecevied => {
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeCashInCashOutPXmlFile("CASHIN_P", pdata.ResponseObject, no_server_error);
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: "1"
                });
              console.log(newData)
              var object_id;
              newData.save(async (err, doc) => {
                if (!err) {
                  console.log('record was added');
                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeCashInCashOutPXmlFile("CASHIN_P", pdata.ResponseObject, database_error);
                  callback(callbackResponse);
                }

              });

            });




          } else {



            findQResponse(depositeProofTransNo).then(valueRecevied => {
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
              console.log(valueRecevied)
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeErrorXmlFile("CASHIN_P", pdata.ResponseObject.Result.ErrorNa, no_server_error);
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: ""
                });
              console.log(newData)
              var object_id;
              newData.save(async (err, doc) => {
                if (!err) {

                  console.log('record was added');
                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeErrorXmlFile("CASHIN_P", pdata.ResponseObject.Result.ErrorNa, database_error)
                  callback(callbackResponse);
                }

              });
            }).catch(valueRecevied => {
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeErrorXmlFile("CASHIN_P", pdata.ResponseObject.Result.ErrorNa, no_server_error);
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: ""
                });
              console.log(newData)
              var object_id;
              newData.save(async (err, doc) => {
                if (!err) {

                  console.log('record was added');
                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeErrorXmlFile("CASHIN_P", pdata.ResponseObject.Result.ErrorNa, database_error)
                  callback(callbackResponse);
                }

              });
            });


          }
        } else if (status == 409) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHIN_P", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 409 رقم prn مكرر", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);

            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHIN_P", "PRN مكرر يرجى المحاولة لاحقا", database_error)
              callback(callbackResponse);
            });

        } else if (status == 401) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHIN_P", "غير مصرح للدخول ", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 401 غير مصرح للدخول", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);
            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHIN_P", "غير مصرح للدخول ", database_error)
              callback(callbackResponse);
            });

        } else if (status == 1) {
          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHIN_P", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)

          saveErrorsToDataBase(req, "حصل خطأ بالاتصال ب سيرفر الخدمة", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);

            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHIN_P", "حصل خطأ بالاتصال ب سيرفر الخدمة", database_error)
              callback(callbackResponse);
            });
        } else {
          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("CASHIN_P", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
          callback(callbackResponse);
        }


      }, gottenToken, depositeProofTransNo, depositeProofMobileNo, depositeProofAmount, depositeProofByName, depositeProofBranchName, depositeProofBranchNo);

    });

  } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_Q") {
    getToken(function (status, pdata) {

      if (status == 200) {
        var tokenBodyResponse = pdata;
        var gottenToken = pdata.access_token;
        var withdrawalMobileNo = req.process_info.customerMobile;
        var withdrawalAmount = req.process_info.amount;
        var withdrawalTransNo = req.process_info.transNo;
        var withdrawalBranchName = req.service_info.agent_or_Branch_name;
        var withdrawalBranchNo = req.service_info.agent_or_Branch_Code;

      } else if (status == 409) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)
        callback(callbackResponse);

      } else if (status == 401) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "غير مصرح للدخول ", no_server_error)
        callback(callbackResponse);

      } else if (status == 1) {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)
        callback(callbackResponse);
      } else {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
        callback(callbackResponse);
      }

      getWithdrawalReq(function (status, pdata, bodyRequest) {

        if (status == 200) {

          if (pdata.ResponseObject.Result.ErrorNo == 1) {
            Res_Code = pdata.ResponseObject.Result.ErrorNo;
            var resData = writeCashInCashOutQXmlFile("CASHOUT_Q", pdata.ResponseObject, no_server_error)
            let newData = new newApiRequest.insertData(
              {
                rem_no: req.rem_info.rem_no,
                mobile_no: req.process_info.customerMobile,
                transaction_id: req.process_info.transNo,
                service_name: req.service_info.service_name,
                service_type: req.service_info.service_type,
                system_name: req.service_info.system_name,
                username: req.service_info.username,
                agent_code: req.service_info.agent_or_Branch_Code,
                agent_name: req.service_info.agent_or_Branch_name,
                date: Date.now(),
                requestData: bodyRequest,
                responesData: JSON.stringify(pdata),
                tokenBody: JSON.stringify(tokenBodyResponse),
                Amounts: req.process_info.amount,
                FirstName: pdata.ResponseObject.EXDATA.customer.cust_name,
                SecondName: "",
                ThirdName: "",
                LastName: "",
                CustID: pdata.ResponseObject.EXDATA.customer.card_no,
                qRespones: resData,
                Request: JSON.stringify(req),
              });
            console.log(newData)

            newData.save(async (err, doc) => {
              if (!err) {


                console.log('record was added');
                callback(resData)


              }
              else {
                console.log("DataBase")
                console.log(err);
                Res_Code = pdata.ResponseObject.Result.ErrorNo;
                var callbackResponse = writeCashInCashOutQXmlFile("CASHOUT_Q", pdata.ResponseObject, database_error)
                callback(callbackResponse)
              }
            });

          } else {

            Res_Code = pdata.ResponseObject.Result.ErrorNo;
            var resData = writeErrorXmlFile("CASHOUT_Q", pdata.ResponseObject.Result.ErrorNa, no_server_error)
            let newData = new newApiRequest.insertData(
              {
                rem_no: req.rem_info.rem_no,
                mobile_no: req.process_info.customerMobile,
                transaction_id: req.process_info.transNo,
                service_name: req.service_info.service_name,
                service_type: req.service_info.service_type,
                system_name: req.service_info.system_name,
                username: req.service_info.username,
                agent_code: req.service_info.agent_or_Branch_Code,
                agent_name: req.service_info.agent_or_Branch_name,
                date: Date.now(),
                requestData: bodyRequest,
                responesData: JSON.stringify(pdata),
                tokenBody: JSON.stringify(tokenBodyResponse),
                Amounts: req.process_info.amount,
                FirstName: "",
                SecondName: "",
                ThirdName: "",
                LastName: "",
                CustID: "",
                qRespones: resData,
                Request: JSON.stringify(req),
              });
            console.log(newData)


            newData.save(async (err, doc) => {
              if (!err) {


                console.log('record was added');
                callback(resData)


              }
              else {
                console.log("DataBase")
                console.log(err);
                Res_Code = pdata.ResponseObject.Result.ErrorNo;
                var callbackResponse = writeErrorXmlFile("CASHOUT_Q", pdata.ResponseObject.Result.ErrorNa, database_error)
                callback(callbackResponse)
              }
            });



          }
        } else if (status == 409) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHOUT_Q", "PRN مكرر يرجى المحاولة لاحقا", no_server_error);


          saveErrorsToDataBase(req, "خطأ satust code = 409 رقم prn مكرر", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);

            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "PRN مكرر يرجى المحاولة لاحقا", database_error);
              callback(callbackResponse);
            });

        } else if (status == 401) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHOUT_Q", "غير مصرح للدخول ", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 401 غير مصرح للدخول", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);


            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "غير مصرح للدخول ", database_error)
              callback(callbackResponse);
            });

        } else if (status == 1) {
          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHOUT_Q", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)

          saveErrorsToDataBase(req, "حصل خطأ بالاتصال ب سيرفر الخدمة", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);
            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "حصل خطأ بالاتصال ب سيرفر الخدمة", database_error)
              callback(callbackResponse);
            });
        } else {
          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("CASHOUT_Q", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
          callback(callbackResponse);
        }

      }, gottenToken, withdrawalTransNo, withdrawalMobileNo, withdrawalAmount, withdrawalBranchName, withdrawalBranchNo);

    });
  } else if ((req.service_info.service_type).toUpperCase() == "CASHOUT_P") {

    getToken(function (status, pdata, bdy) {
      if (status == 200) {
        var tokenBodyResponse = pdata;
        var gottenToken = pdata.access_token;
        var withdrawalProofMobileNo = req.process_info.customerMobile;
        var withdrawalProofAmount = req.process_info.amount;
        var withdrawalProofTransNo = req.process_info.transNo;
        var withdrawalProofBranchName = req.service_info.agent_or_Branch_name;
        var withdrawalProofBranchNo = req.service_info.agent_or_Branch_Code;
        var withdrawalProofOTP = req.process_info.otpCode;

      } else if (status == 409) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_P", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)
        callback(callbackResponse);

      } else if (status == 401) {

        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_P", "غير مصرح للدخول ", no_server_error)
        callback(callbackResponse);

      } else if (status == 1) {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_P", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)
        callback(callbackResponse);
      } else {
        Res_Code = -5;
        var callbackResponse = writeErrorXmlFile("CASHOUT_P", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
        callback(callbackResponse);
      }

      getWithdrawal(function (status, pdata, bodyRequest) {
        if (status == 200) {
          if (pdata.ResponseObject.Result.ErrorNo == 1) {


            findQResponse(withdrawalProofTransNo).then(valueRecevied => {
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
              console.log(valueRecevied)
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeCashInCashOutPXmlFile("CASHOUT_P", pdata.ResponseObject, no_server_error)
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  OTP: req.process_info.otpCode,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: "1"
                });
              console.log(newData);


              newData.save(async (err, doc) => {
                if (!err) {
                  console.log('record was added');


                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeCashInCashOutPXmlFile("CASHOUT_P", pdata.ResponseObject, database_error)
                  callback(callbackResponse);
                }

              });
            }).catch(valueRecevied => {
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeCashInCashOutPXmlFile("CASHOUT_P", pdata.ResponseObject, no_server_error)
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  OTP: req.process_info.otpCode,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: "1"
                });
              console.log(newData);


              newData.save(async (err, doc) => {
                if (!err) {
                  console.log('record was added');


                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeCashInCashOutPXmlFile("CASHOUT_P", pdata.ResponseObject, database_error)
                  callback(callbackResponse);
                }
            });

          });

          } else {



            findQResponse(withdrawalProofTransNo).then(valueRecevied => {
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++")
              console.log(valueRecevied)
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeErrorXmlFile("CASHOUT_P", pdata.ResponseObject.Result.ErrorNa, no_server_error)
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  OTP: req.process_info.otpCode,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: ""
                });
              console.log(newData);
              console.log('666666666666666666666666666666');

              newData.save(async (err, doc) => {
                if (!err) {

                  console.log('record was added');


                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeErrorXmlFile("CASHOUT_P", pdata.ResponseObject.Result.ErrorNa, database_error)
                  callback(callbackResponse);
                }

              });
            }).catch(valueRecevied => {
              Res_Code = pdata.ResponseObject.Result.ErrorNo;
              var resXmlData = writeErrorXmlFile("CASHOUT_P", pdata.ResponseObject.Result.ErrorNa, no_server_error)
              let newData = new newApiRequest.insertData(
                {
                  rem_no: req.rem_info.rem_no,
                  mobile_no: req.process_info.customerMobile,
                  transaction_id: req.process_info.transNo,
                  service_name: req.service_info.service_name,
                  service_type: req.service_info.service_type,
                  system_name: req.service_info.system_name,
                  username: req.service_info.username,
                  agent_code: req.service_info.agent_or_Branch_Code,
                  agent_name: req.service_info.agent_or_Branch_name,
                  date: Date.now(),
                  requestData: bodyRequest,
                  responesData: JSON.stringify(pdata),
                  tokenBody: JSON.stringify(tokenBodyResponse),
                  Amounts: req.process_info.amount,
                  OTP: req.process_info.otpCode,
                  FirstName: "",
                  SecondName: "",
                  ThirdName: "",
                  LastName: "",
                  CustID: "",
                  qRespones: valueRecevied,
                  pRespones: resXmlData,
                  Request: JSON.stringify(req),
                  remStatus: ""
                });
              console.log(newData);
              console.log('666666666666666666666666666666');

              newData.save(async (err, doc) => {
                if (!err) {

                  console.log('record was added');


                  callback(resXmlData);

                }
                else {
                  console.log("DataBase")
                  console.log(err);
                  Res_Code = pdata.ResponseObject.Result.ErrorNo;
                  var callbackResponse = writeErrorXmlFile("CASHOUT_P", pdata.ResponseObject.Result.ErrorNa, database_error)
                  callback(callbackResponse);
                }

              });
            });






          }
        } else if (status == 409) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHOUT_P", "PRN مكرر يرجى المحاولة لاحقا", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 409 رقم prn مكرر", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);


            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHOUT_P", "PRN مكرر يرجى المحاولة لاحقا", database_error)
              callback(callbackResponse);
            });

        } else if (status == 401) {

          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHOUT_P", "غير مصرح للدخول ", no_server_error)

          saveErrorsToDataBase(req, "خطأ satust code = 401 غير مصرح للدخول", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);

            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHOUT_P", "غير مصرح للدخول ", database_error)
              callback(callbackResponse);
            });

        } else if (status == 1) {
          Res_Code = -5;
          var resData = writeErrorXmlFile("CASHOUT_P", "حصل خطأ بالاتصال ب سيرفر الخدمة", no_server_error)

          saveErrorsToDataBase(req, "حصل خطأ بالاتصال ب سيرفر الخدمة", resData, bodyRequest, tokenBodyResponse)
            .then(resultOfResolve => {
              console.log(resultOfResolve);
                callback(resData);
            }).catch(resultOfReject => {
              console.log(resultOfReject);
              var callbackResponse = writeErrorXmlFile("CASHOUT_P", "حصل خطأ بالاتصال ب سيرفر الخدمة", database_error)
              callback(callbackResponse);
            });

        } else {
          Res_Code = -5;
          var callbackResponse = writeErrorXmlFile("CASHOUT_P", "حصل خطأ الرجاء إعادة المحاولة", no_server_error)
          callback(callbackResponse);
        }

      }, gottenToken, withdrawalProofTransNo, withdrawalProofMobileNo, withdrawalProofAmount, withdrawalProofBranchName, withdrawalProofBranchNo, withdrawalProofOTP);

    });
  } else {
    Res_Code = -5;
    var callbackResponse = writeErrorXmlFile("NO_Serveices", "خطأ في استخدام الخدمة المختارة", no_server_error)
    callback(callbackResponse);
  }

}


module.exports.Shameel_server = Shameel_server;

function getToken(callback) {
  var body = `grant_type=password&username=${username}&password=${password}&client_id=${client_id}&client_secret=${client_secret}`;
  request.post(
    {
      headers: shamilTokenHeader,
      url: baseUrl + accessToken,
      body: body,
      method: 'POST'
    },
    function (err, respones, body) {
      if (!err) {
        try {
          json_tok = JSON.parse(body);
          console.log(json_tok);
          var statsCode = respones.statusCode;
          return callback(statsCode, json_tok, JSON.stringify(body));

        } catch (error) {
          var respons_err = new Object;
          console.log(error);
          respons_err.error = err;
          respons_err.res = respones.statusCode;
          respons_err.bdy = body;
          console.log(JSON.parse(respons_err));
          return callback(respons_err.res, respons_err);
        }
      } else {
        return callback(1, err);
      }


    }
  );

}

function getBalance(callback, tokenNo, PRN) {
  var balanceBody = {
    "langNo": 1,
    "PRN": PRN
  };

  var bodyRequest = prepareBody(balanceBody);
  console.log(bodyRequest);
  balanceHeader = {
    "Authorization": "Bearer " + tokenNo,
    "content-type": content_type,
    "tokenid": tokenid,
    "Timestamp": Timestamp
  };
  request.post(
    {
      headers: balanceHeader,
      url: baseUrl + Balance,
      body: balanceBody11,
      method: 'POST'
    },
    function (err, respones, body) {

      if (!err) {

        try {
          var json_tok = JSON.parse(body);
          console.log(json_tok);
          var statsCode = respones.statusCode;
          return callback(statsCode, json_tok, JSON.stringify(body));

        } catch (error) {
          console.log('error ' + error);
          console.log('body ' + body);
          console.log('respones_statusCode' + respones.statusCode);
          var respons_err = new Object;
          respons_err.error = err;
          respons_err.res = respones.statusCode;
          respons_err.bdy = body
          console.log(JSON.parse(respons_err));
          return callback(respons_err.res, JSON.stringify(body));
        }

      } else {
        return callback(1, err);
      }



    }
  );

}

function getWithdrawalReq(callback, tokenNo, transNo, mobileNo, amount, branchName, branchNo) {

  var prnModifed ; 
  if(transNo.charAt(0)!="0"){
    prnModifed = "0" + transNo.substring(1);
    
  } else {
    prnModifed = "2" + transNo.substring(1);
  }

  var WithdrawalReqB = {
    "langNo": 1,
    "PRN": prnModifed,
    "customerMobile": mobileNo,
    "amount": amount,
    "transNo": transNo,
    "branch_Name": branchName,
    "branch_No": branchNo
  };
  console.log("Request of Withdrawal");
  console.log(WithdrawalReqB);


  var bodyRequest = prepareBody(WithdrawalReqB);
  balanceHeader = {
    "Authorization": "Bearer " + tokenNo,
    "content-type": content_type,
    "tokenid": tokenid,
    "Timestamp": Timestamp
  };
  request.post(
    {
      headers: balanceHeader,
      url: baseUrl + WithdrawalReq,
      body: bodyRequest,
      method: 'POST'
    },
    function (err, respones, body) {
      if (!err) {
        try {
          var json_tok = JSON.parse(body);
          console.log("Response of Withdrawal");
          console.log(json_tok);
          var statsCode = respones.statusCode;
          return callback(statsCode, json_tok, bodyRequest);

        } catch (error) {
          console.log('error' + error);
          var respons_err = new Object;
          respons_err.error = err;
          respons_err.res = respones.statusCode;
          respons_err.bdy = body;
          console.log(JSON.parse(respons_err));
          return callback(respons_err.res, JSON.stringify(body));
        }
      } else {
        return callback(1, err);
      }


    }
  );

}

function getWithdrawal(callback, gottenToken, TransNo, mobileNo, amount, BranchName, BranchNo, OTP) {
  var Withdrawalb = {
    "langNo": 1,
    "PRN": TransNo,
    "customerMobile": mobileNo,
    "transNo": TransNo,
    "amount": amount,
    "branch_Name": BranchName,
    "branch_No": BranchNo,
    "otpCode": OTP
  }

  console.log("Request of Withdrawal Confirm");
  console.log(Withdrawalb)

  var bodyRequest = prepareBody(Withdrawalb);
  balanceHeader = {
    "Authorization": "Bearer " + gottenToken,
    "Content-Type": content_type,
    "tokenid": tokenid,
    "Timestamp": Timestamp
  };
  console.log(balanceHeader);
  request.post(
    {
      headers: balanceHeader,
      url: baseUrl + Withdrawal,
      body: bodyRequest,
      method: 'POST'
    },
    function (err, respones, body) {
      if (!err) {
        try {
          var json_tok = JSON.parse(body);
          console.log("Response of Withdrawal Confirm");
          console.log(json_tok);
          var statsCode = respones.statusCode;
          return callback(statsCode, json_tok, bodyRequest);

        } catch (error) {
          console.log('error' + error);
          var respons_err = new Object;
          respons_err.error = err;
          respons_err.res = respones.statusCode;
          respons_err.bdy = body;
          console.log(JSON.parse(respons_err));
          return callback(respons_err.res, JSON.stringify(body));
        }
      } else {
        return callback(1, err);
      }


    }
  );

}

function getDepositReq(callback, tokenNo, prn, mobileNo, amountDeposit) {
  var prnModifed ; 
  if(prn.charAt(0)!="0"){
    prnModifed = "0" + prn.substring(1);
    
  } else {
    prnModifed = "2" + prn.substring(1);
  }

  var DespositReqB = {
    "langNo": 1,
    "PRN": prnModifed,
    "customerMobile": mobileNo,
    "amount": amountDeposit
  }
  console.log("***************************************************************");
  console.log("Request DepositeReq");
  console.log(DespositReqB);
  console.log("***************************************************************");
  var bodyRequest = prepareBody(DespositReqB);
  balanceHeader = {
    "Authorization": "Bearer " + tokenNo,
    "content-type": content_type,
    "tokenid": tokenid,
    "Timestamp": Timestamp
  };
  request.post(
    {
      headers: balanceHeader,
      url: baseUrl + DespositReq,
      body: bodyRequest,
      method: 'POST'
    },
    function (err, respones, body) {
      if (!err) {
        try {
          var json_tok = JSON.parse(body);
          console.log(json_tok);
          var statsCode = respones.statusCode;
          return callback(statsCode, json_tok, bodyRequest);

        } catch (error) {
          console.log('error' + error);
          var respons_err = new Object;
          respons_err.error = err;
          respons_err.res = respones.statusCode;
          respons_err.bdy = body;
          console.log(JSON.parse(respons_err));
          return callback(respons_err.res, JSON.stringify(body));
        }
      } else {
        return callback(1, err);
      }


    }
  );

}

function getDeposit(callback, tokenNo, transNo, mobileNo, amount, by, branchName, branchNo) {
  var DespositB = {
    "langNo": 1,
    "PRN": transNo,
    "customerMobile": mobileNo,
    "amount": amount,
    "by_Name": by,
    "transNo": transNo,
    "branch_Name": branchName,
    "branch_No": branchNo
  }
  console.log("***************************************************************");
  console.log("Request Deposite");
  console.log(DespositB);
  console.log("***************************************************************");
  var bodyRequest = prepareBody(DespositB);
  balanceHeader = {
    "Authorization": "Bearer " + tokenNo,
    "content-type": content_type,
    "tokenid": tokenid,
    "Timestamp": Timestamp
  };
  request.post(
    {
      headers: balanceHeader,
      url: baseUrl + Deposit,
      body: bodyRequest,
      method: 'POST'
    },
    function (err, respones, body) {
      if (!err) {
        try {
          var json_tok = JSON.parse(body);
          console.log(json_tok);
          var statsCode = respones.statusCode;
          return callback(statsCode, json_tok, bodyRequest);

        } catch (error) {
          console.log('error' + error);
          var respons_err = new Object;
          respons_err.error = error;
          respons_err.res = respones.statusCode;
          respons_err.bdy = body;
          console.log('error test.error  ' + test.error);
          console.log('error test.res  ' + test.res);
          console.log('error test.bdy  ' + test.bdy);
          console.log(JSON.parse(respons_err));
          return callback(respons_err.res, JSON.stringify(body));
        }
      } else {
        return callback(1, err);
      }


    }
  );

}




function prepareBody(bodyRecivied) {
  return JSON.stringify(bodyRecivied);
}

function writeBalanceXmlFile(responesData, ServerData) {

  return `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
   <env:Header/>
   <env:Body>
   <ns:Balance>
    <msg_info_server>
     <code_serv>${ServerData.code}</code_serv>
     <msg_serv>${ServerData.massege}</msg_serv>
     </msg_info_server>
     <msg_info_API>
      <code_API>${Res_Code}</code_API>
       <msg_API>${responesData.Result.ErrorNa}</msg_API>
    </msg_info_API>
    <Balance_Response>
     <Balance>${responesData.Wallet.Balance}</Balance>
    </Balance_Response>
  </ns:Balance>
  </env:Body>
  </env:Envelope>`

}



function writeCashInCashOutQXmlFile(service, responesData, ServerData) {
  var x;
  if (service == "CASHIN_Q") {
    x = responesData.EXDATA.fees
  } else if (service == "CASHOUT_Q") {
    x = responesData.EXDATA.Fee.Fee_Amt
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
   <env:Header/>
   <env:Body>
   <ns:${service}>
    <msg_info_server>
     <code_serv>${ServerData.code}</code_serv>
     <msg_serv>${ServerData.massege}</msg_serv>
     </msg_info_server>
     <msg_info_API>
      <code_API>${responesData.Result.ErrorNo}</code_API>
       <msg_API>${responesData.Result.ErrorNa}</msg_API>
    </msg_info_API>
    <${service + "_Response"}>
     <Fee_Amount>${x}</Fee_Amount>
     <Cust_CardNo>${responesData.EXDATA.customer.card_no}</Cust_CardNo>
     <Cust_Name>${responesData.EXDATA.customer.cust_name}</Cust_Name>
    </${service + "_Response"}>
  </ns:${service}>
  </env:Body>
  </env:Envelope>`
}

function writeCashInCashOutPXmlFile(service, responesData, ServerData) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
   <env:Header/>
   <env:Body>
   <ns:${service}>
    <msg_info_server>
     <code_serv>${ServerData.code}</code_serv>
     <msg_serv>${ServerData.massege}</msg_serv>
     </msg_info_server>
     <msg_info_API>
      <code_API>${Res_Code}</code_API>
       <msg_API>${responesData.Result.ErrorNa}</msg_API>
    </msg_info_API>
    <${service + "_Response"}>
     <Ref_No>${responesData.Wallet.Ref_No}</Ref_No>
     <Trans_No>${responesData.Wallet.transNo}</Trans_No>
    </${service + "_Response"}>
  </ns:${service}>
  </env:Body>
  </env:Envelope>`
}

function writeErrorXmlFile(service, responesData, ServerData) {

  return `<?xml version="1.0" encoding="UTF-8"?>
  <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
   <env:Header/>
   <env:Body>
   <ns:${service}>
    <msg_info_server>
     <code_serv>${ServerData.code}</code_serv>
     <msg_serv>${ServerData.massege}</msg_serv>
     </msg_info_server>
     <msg_info_API>
      <code_API>${Res_Code}</code_API>
       <msg_API>${responesData}</msg_API>
    </msg_info_API>
  </ns:${service}>
  </env:Body>
  </env:Envelope>`
}

async function findQResponse(number) {

  var Qrespons;
  return new Promise(async (resolve, reject) => {
  await newApiRequest.insertData.find({ transaction_id: number }, (err, apiData) => {
    try {
      if (apiData[apiData.length - 1].qRespones === undefined) {
        Qrespons = '';
        console.log("Qresponse is : undefined");
        reject(Qrespons);
      }
      else {
        Qrespons = apiData[apiData.length - 1].qRespones;
        console.log("Qresponse is : " + Qrespons);
        resolve(Qrespons);
      }

    } catch (error) {
      Qrespons = '';
      console.log("Qresponse is : blank");
      reject(Qrespons);

    }


    console.log('55555555555555555555555555555555555555');
    console.log(Qrespons);


  });
});
  
}

 function saveErrorsToDataBase(request, erroResponse, responseToInernalSystem, bodyRequest, tokenBodyResponse) {
 
  let newData = new newApiRequest.insertData(
    {
      rem_no: request.rem_info.rem_no,
      mobile_no: request.process_info.customerMobile,
      transaction_id: request.process_info.transNo,
      service_name: request.service_info.service_name,
      service_type: request.service_info.service_type,
      system_name: request.service_info.system_name,
      username: request.service_info.username,
      agent_code: request.service_info.agent_or_Branch_Code,
      agent_name: request.service_info.agent_or_Branch_name,
      date: Date.now(),
      requestData: bodyRequest,
      responesData: erroResponse,
      tokenBody: JSON.stringify(tokenBodyResponse),
      Amounts: request.process_info.amount,
      FirstName: "",
      SecondName: "",
      ThirdName: "",
      LastName: "",
      CustID: "",
      qRespones: responseToInernalSystem,
      Request: JSON.stringify(request),
    });
  console.log(newData);


  
  return new Promise(async (resolve,reject)=>{
  await newData.save( (err, doc) => {
    
    if (!err) {
      console.log('record was added');
      resultOfSavingToDB = 1;
      console.log('inside record')
      console.log(resultOfSavingToDB);
      resolve(resultOfSavingToDB);    
    }
    else {
      console.log("DataBase")
      console.log(err);
      resultOfSavingToDB = 0;
      reject(resultOfSavingToDB);
    }
    });
 });
  

  
}





