const port = 3000;
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const logger = require('morgan');
const fs = require('fs')
const schedule = require('node-schedule')
const { constants } = require('crypto')
//////company////////////
const CacServer = require(__dirname + '/API_COMP/CAC_SERVER/CacSpeed.js');
const TadamonPayServer = require(__dirname + '/API_COMP/Tadamon_Server/TadamonPay.js');
const yeahMoneyServer = require(__dirname + "/API_COMP/Yeah_Money/YeahMoney.js");
const Mobile_money = require('./API_COMP/CAC_SERVER/MobileMoney.js');
const Shift = require(__dirname + "/API_COMP/Shift_Server/shift.js");
const UPT = require('./API_COMP/UPT/upt');
const Altaif_service = require("./API_COMP/Altaif_server/altaif_new_verison.js");
const ria = require('./API_COMP/Ria_Server/ria.js');
const uremet = require('./API_COMP/UREMIT/UREMET.js');
const Tejary = require("./API_COMP/YCB/tejariPay_server.js");
//// const tadamen_image = require('./API_COMP/Tadamon_Server/IMAGEAPI.js');
const monyegram = require('./API_COMP/moneygram/moneygram.js');
const DirectRemit = require('./API_COMP/DirectRemit/DirectRemit.js');
const Mehfthaty = require('./API_COMP/Tadamon_Server/Mehfthaty.js');
const Mehfthaty_Remit = require('./API_COMP/Tadamon_Server/Mehfthaty_Remit.js')
const Saudi_Express = require("./API_COMP/Saudi_Exchange/Express_Remit.js");
const Kamal_Exch = require("./API_COMP/Kamal Exchange/jordan_remit");
const Watania = require("./API_COMP/Nathional transfer CO/watania_server.js")
const { altaif_service } = require('./API_COMP/Altaif_server/altaif_new_verison.js');
const Alawneh = require ('./API_COMP/alawneh/alawneh_v2_server')
const Zamzam_Ayser = require("./API_COMP/Zamzam/ayser_server");
const musharbash_yes = require("./API_COMP/Musharbash/yes_server");
const ShameelServer = require('./API_COMP/SYBY_SERVER/shameel.pinned');
const mustaqbal_mustabalcom = require('./API_COMP/Mustaqbal/mustaqbal_server.js');
const floosak = require("./API_COMP/Floosak/floosak_server");
const floosak_remit = require("./API_COMP/Floosak/floosak_remit");
//-----------------------------------------
const sendRemitCBY = require("./API_COMP/CBY/sendRemit");
const updateRemitCBY = require("./API_COMP/CBY/updateRemit");
const UpdateAllRemitCBY = require("./API_COMP/CBY/UpdateAllRemit_json");
const SendAllRemitRemitCBY = require("./API_COMP/CBY/SendAllRemit_json");
const PostAccountBalanceCBY = require("./API_COMP/CBY/PostAccountBalance_json");
const PostALLAccountBalancesCBY = require("./API_COMP/CBY/PostALLAccountBalances_json");
const PostTrialBalanceCBY = require("./API_COMP/CBY/PostTrialBalance_json");
const PostAccountCategoryIssuesCBY = require("./API_COMP/CBY/PostAccountCategoryIssues_json");
const PostALLAccountBalances_json_test = require('./API_COMP/CBY/PostALLAccountBalances_json_test');

//-----------------------------------------
const alamalSync = require('./API_COMP/alamal/alamal_sync');
const cash = require("./API_COMP/tamkeen/cash_wallet");
const cash_remit = require("./API_COMP/tamkeen/cash_remit");
const abuShiekha = require('./API_COMP/abu_sheikha/abu_shaikha_pinned_server');
const oneCashWallet = require('./API_COMP/OneCash/OneCashWallet.js');
const oneCashRemit = require('./API_COMP/OneCash/oneCashRemit.js');
const oneCashChangePass = require('./API_COMP/OneCash/changePassword.js');

////////company//////////
const xml2js = require('xml2js');
const xpath = require("xml2js-xpath");
const newApiRequest = require('./db_modal/alnoamanNewModal');
const Q_service_type = 'Q_REM';
const P_service_type = 'P_REM';
const CONFIRM = 'CONFIRM';
const CASHINOUTCONFIRM = 'CASHINOUTCONFIRM';
const CASHIN_Q = 'CASHIN_Q';
const CASHOUT_Q = 'CASHOUT_Q';
const CASHIN_P = 'CASHIN_P';
const CASHOUT_P = 'CASHOUT_P';
const CIN_service_type = 'CASHIN';
const COUT_service_type = 'CASHOUT';
const ADepsitQuery = 'ACC_DEPOSIT_Q';
const ADepsitPay = 'ACC_DEPOSIT_IN';
const ReciveRem = 'ns:ReciveRem';
const Q_ReciveRem = 'ns:Q_ReciveRem';
const PaymentRem = 'ns:PaymentRem';
const PaymentRem_respons = 'ns:PaymentRem_respons';
const Account_Deposit = 'ns:account_deposit';
const cashin_cashout = 'ns:cashin_cashout';
const account_deposit_q = 'ns:account_deposit_q';
const account_deposit_in = 'ns:account_deposit_in';
const reports = require('./routes/report-routes');
const remitReports = require('./remit-api-report/reports.js');

//creating variabels of date , time and paths to create backup
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
var current_date = `${date}-${month}-${year}`;
var filePath = `logs-test/api-console.log`;
var copy = `backups/${current_date}-backup.log`;



var router;
var parser = new xml2js.Parser({ explicitArray: false });
var index_of_process;
var http_options = {
     secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
     minVersion: 'TLSv1',
     secureProtocol: 'TLSv1_server_method'
}
var options = { inflate: true, limit: '100kb', type: 'text/xml' };
var Rem_Indexes =
{
     SHIFT: 'remittancTrackingCode',
     MBLMNY: 'rem_no',
     SPEED: 'rem_no',
     TADAMONPAY: 'rem_no',
     RIA: 'rem_no',
     UPT: 'tem:UPT_REF',
     YEAHMONEY: 'rem_no',
     ALTAIF: 'rem_no',
     UREMET: 'urem:TransactionNo',
     MONYEGRAM: 'rem_no',
     DIRECTREMIT: 'rem_no',
     SHAMEEL: 'rem_no',
     MEHFTHATY: 'rem_no',
     MEHFTHATY_REMIT: 'rem_no',
     TEJARY: 'rem_no',
     SHAMEEL : 'rem_no',
     ALAWNEH : 'remittanceId',
     SAUDI:'tem:REFERENCE_NUMBER',
     KAMAL: 'rem_no',
     WATANIA:'rem_no',
     ZAMZAM: 'tem:TransactionNo',
     MUSHARBASH:'tem:TransactionNo',
     MUSTAQBAL:'tem:TransactionNo',
     HAWALATI:'tem:TransactionNo',
     FLOOSAK:'rem_no',
     FLOOSAK_REMIT:'rem_no',
     CASH:'rem_no',
     CASH_REMIT:'rem_no',
     ONECASH:'rem_no',
     ONECASH_REMIT:'rem_no',
}

app.get('/close_99', function (req, res) {


     console.log("Exiting NodeJS server");
     process.exit();

});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(logger('combined'));
app.use(bodyParser.raw(options));
app.use(bodyParser.urlencoded({ extended: true }));
//--------------------
app.use('/',sendRemitCBY);
app.use('/',updateRemitCBY);
app.use('/',UpdateAllRemitCBY);
app.use('/',SendAllRemitRemitCBY);
app.use('/',PostAccountBalanceCBY);
app.use('/',PostALLAccountBalancesCBY);
app.use('/',PostTrialBalanceCBY);
app.use('/',PostAccountCategoryIssuesCBY);
app.use('/', PostALLAccountBalances_json_test);
//--------------------

// app.use('/',alamalSync);
app.use('/',remitReports,(req,res,next)=>{
     res.header("Access-Control-Allow-Origin", "*");
     res.header(
       "Access-Control-Allow-Headers",
       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
     );
     if (req.method === "OPTIONS") {
          res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
         
        }
     next();
 });


router = express.Router();

app.use('/report', reports);
app.use('/', oneCashChangePass);
app.get('/', function (req, res) { 

 });


app.post('/AlnoamanAPIServer', function (req, res) {
     console.log(req.body.toString());
     var xNode = req.body.toString();
     parser.parseString(xNode, function (err, result) {
          //  console.log(result);
          var x = result['env:Envelope']['env:Body'];
          if (x[ReciveRem] !== undefined)
               index_of_process = ReciveRem;
          else if (x[Q_ReciveRem] !== undefined)
               index_of_process = Q_ReciveRem;
          else if (x[PaymentRem] !== undefined)
               index_of_process = PaymentRem;
          else if (x[PaymentRem_respons] !== undefined)
               index_of_process = PaymentRem_respons;
          else if (x[Account_Deposit] !== undefined)
               index_of_process = Account_Deposit;
          else if (x[cashin_cashout] !== undefined)
               index_of_process = cashin_cashout;
          else if (x[account_deposit_q] !== undefined)
               index_of_process = account_deposit_q;
          else if (x[account_deposit_in] !== undefined)
               index_of_process = account_deposit_in;
          x = x[index_of_process];
          console.log((x.service_info.service_name).toUpperCase());

          var Rem_no = xpath.find(result, '//' + Rem_Indexes[(x.service_info.service_name).toUpperCase()]);
          // saveRequestsToDataBase(x,JSON.stringify(Rem_no)).then(value=>{
          //      console.log("saved to DB"+value);
          // }).catch(value=>{
          //      console.log("not saved to DB"+value);
          // });
          CheckifExist(Rem_no, x, function (code, xmlRes) {

               if (code == 0) {
                    if ((x.service_info.service_name).toUpperCase() == ('speed').toUpperCase()) {
                         CacServer.cac_server(x, function (response) {
                              res.send(response);
                         });
                    }
                    //TadamonPay-Company 
                    else if
                         ((x.service_info.service_name).toUpperCase() == ('TadamonPay').toUpperCase()) {
                         TadamonPayServer.tadamonPay_server(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if
                         ((x.service_info.service_name).toUpperCase() == ('yeahMoney').toUpperCase()) {
                         yeahMoneyServer.yeahMoneyServer(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('mblmny').toUpperCase()) {
                         Mobile_money.mblmny_server(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('Mehfthaty').toUpperCase()) {
                         Mehfthaty.Mehfthaty_server(x, function (response) {
                              res.send(response);
                         });

                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('Mehfthaty_remit').toUpperCase()) {
                         Mehfthaty_Remit.Mehfthaty_remit(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('altaif').toUpperCase()) {
                         Altaif_service.altaif_server(x, function (response) {
                              res.send(response);
                         });

                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('ria').toUpperCase()) {
                         ria.ria_service(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('shameel').toUpperCase()) {
                         ShameelServer.Shameel_server(x, function (response) {
                              res.send(response);
                         });

                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('tejary').toUpperCase()) {
                         Tejary.tejaryiPay_server(x, function (response) {
                              res.send(response);
                         });
                    }

                    else if ((x.service_info.service_name).toUpperCase() == ('watania').toUpperCase()) {
                         Watania.Watania_Server(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('floosak').toUpperCase()) {
                         floosak.floosak_server(x, function (response) {
                              res.send(response);
                         });
                    }
                    else if ((x.service_info.service_name).toUpperCase() == ('floosak_remit').toUpperCase()) {
                         floosak_remit.floosakRemitServer(x, function (response) {
                             res.send(response);
                         });
                     }

                    // else if ((x.service_info.service_name).toUpperCase() == ('floosak_remit').toUpperCase()) {
                    //      floosak_remit.floosak_remit_server(x, function (response) {
                    //           res.send(response);
                    //      });
                    // }

                    else if ((x.service_info.service_name).toUpperCase() == ('cash').toUpperCase()) {
                         cash.cash_server(x, function (response) {
                              res.send(response);
                         });
                    }

                    else if ((x.service_info.service_name).toUpperCase() == ('cash_remit').toUpperCase()) {
                         cash_remit.cash_remit_server(x, function (response) {
                              res.send(response);
                         });
                    }

                    else if ((x.service_info.service_name).toUpperCase() == ('onecash').toUpperCase()) {
                         oneCashWallet.oneCash_server(x, function (response) {
                              res.send(response);
                         });
                    }

                    else if ((x.service_info.service_name).toUpperCase() == ('onecash_remit').toUpperCase()) {
                         oneCashRemit.oneCash_remit_server(x, function (response) {
                              res.send(response);
                         });
                    }




                    else
                         res.send({ info: { code: '00001', massege: 'Error No Service Avialible Named :' + req.params.service } });

               }
               else {
                    res.send(xmlRes);
               }
          });
     });
});
app.post('/AlnoamanAPISoap', function (req, res) {
     var xNode = req.body.toString();
     console.log(xNode)
     parser.parseString(xNode, function (err, result) {
          if(err){
               console.log("error is ")
               console.log(err) 
          }
          console.log("********************************")
          console.log(result)
          var m = xpath.find(result, '//service_info')
          console.log("********************************")
          console.log(m)
          console.log(Rem_Indexes[(m[0].service_name).toUpperCase()])
          var Rem_no = xpath.find(result, '//' + Rem_Indexes[(m[0].service_name).toUpperCase()]);

          var service_info = new Object();
          var requestFromInyernalSys = result['soapenv:Envelope']['soapenv:Body'];
          // saveRequestsToDataBase(requestFromInyernalSys,Rem_no[0]).then(value=>{
          //      console.log("saved to DB"+value);
          // }).catch(value=>{
          //      console.log("not saved to DB"+value);
          // });
          service_info.service_info = m[0];
          console.log(xpath.find(result, '//remittancTrackingCode'))
          //-------------------عدم تسليم حوالات يو بي تي عبر شفت 
          if ((String(Rem_no[0]).substring(0, 3) == '878'||String(Rem_no[0]).substring(0, 3) == '879')&& (m[0].service_name).toUpperCase() == ('shift').toUpperCase() )
          {
           res.send(
           "<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><ns2:getRemittanceForReceiveResponse xmlns:ns2=\"http://webservice/\" xmlns:ns3=\"http://xml.netbeans.org/schema/ApiSchema\"><return><ns3:resultCode>1010</ns3:resultCode><ns3:resultMessage>لا يمكن تسليم هذه الحوالة من خدمة شفت </ns3:resultMessage></return></ns2:getRemittanceForReceiveResponse></S:Body></S:Envelope>"
           );
          }
          //-----------------------------------------
          CheckifExist(Rem_no[0], service_info, function (code, xmlRes) {
               if (code == 0) {


                    try {
                         if ((m[0].service_name).toUpperCase() == ('shift').toUpperCase()) {
                              var x = result['soapenv:Envelope']['soapenv:Body'];
                              console.log("point 1") 
                              Shift.shift_service(x, result, function (response) {
                                   console.log(response)
                                   res.send(response);
                              });
                         }
                         else if ((m[0].service_name).toUpperCase() == ('upt').toUpperCase()) {
                              console.log((m[0].service_name).toUpperCase() == ('upt').toUpperCase());
                              UPT.UPT_Server(xNode, function (response) {
                                   res.send(response);
                                  
                              });
                         }


                         else if ((m[0].service_name).toUpperCase() == ('uremet').toUpperCase()) {
                              console.log('tset');
                              var x = result['soapenv:Envelope']['soapenv:Body'];

                              uremet.uremet_service(x, result, function (response) {
                                   res.send(response);
                              });
                         }
                         else if ((m[0].service_name).toUpperCase() == ('monyegram').toUpperCase()) {
                              console.log('tset');
                              var x = result['soapenv:Envelope']['soapenv:Body'];

                              monyegram.monyegram_service(x, result, function (response) {
                                   res.send(response);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('DirectRemit').toUpperCase()) {
                              console.log((m[0].service_name).toUpperCase() + "  " + ('DirectRemit').toUpperCase());
                              var x = result['soapenv:Envelope']['soapenv:Body'];

                              DirectRemit.DirectRemit_service(x, result, function (response) {
                                   res.send(response);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('saudi').toUpperCase()) {
                              Saudi_Express.Saudi_Server(xNode, function (responsse) {
                                   res.send(responsse);
                              });
                         } 

                         else if ((m[0].service_name).toUpperCase() == ('kamal').toUpperCase()) {
                              Kamal_Exch.Kamal_Server(xNode, function (responsse) {
                                   res.send(responsse);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('zamzam').toUpperCase()) {
                              Zamzam_Ayser.Ayser_Server(xNode, function (responsse) {
                                   res.send(responsse);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('musharbash').toUpperCase()) {
                              musharbash_yes.Yes_Server(xNode, function (responsse) {
                                   res.send(responsse);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('mustaqbal').toUpperCase()) {
                              mustaqbal_mustabalcom.Mustaqbal_server(xNode, function (responsse) {
                                   res.send(responsse);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('alawneh').toUpperCase()) {
                              Alawneh.Alawneh_Server_V2(xNode, function (response) {
                                   res.send(response);
                              });
                         }

                         else if ((m[0].service_name).toUpperCase() == ('hawalati').toUpperCase()) {
                              abuShiekha.Abu_sheikha_server(xNode, function (response) {
                                   res.send(response);
                              });
                         }

                    } catch (error) {
                         console.log(m[0].service_name);
                         res.send({ info: { code: '00001', massege: 'Error: No Service Info Sent in the body' } });
                    }
               }
               else {
                    res.send(xmlRes)
               }
          });
          //  console.log(m[0].service_name)
     });

})

 
function CheckifExist(Rem_no, pData, callback) {

     newApiRequest.insertData.find({
          rem_no: decodeURI(Rem_no)
          , service_name: decodeURI(pData.service_info.service_name)
          , remStatus: 1
     }
          , (err, apiData) => {
               if (apiData.length > 0) {
                    if ((apiData[0].username).toUpperCase() == (pData.service_info.username).toUpperCase() && (apiData[0].system_name).toUpperCase() == (pData.service_info.system_name).toUpperCase()) {

                         if ((pData.service_info.service_type).toUpperCase() == Q_service_type) {
                              callback(1, apiData[0].qRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == P_service_type || (pData.service_info.service_type).toUpperCase() == CONFIRM) {
                              callback(1, apiData[0].pRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == CIN_service_type) {
                              callback(1, apiData[0].pRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == COUT_service_type) {
                              callback(1, apiData[0].pRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == ADepsitQuery) {
                              callback(1, apiData[0].qRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == CASHIN_Q) {
                              callback(1, apiData[0].qRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == CASHOUT_Q) {
                              callback(1, apiData[0].qRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == ADepsitPay) {
                              callback(1, apiData[0].pRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == CASHINOUTCONFIRM) {
                              console.log(apiData[0].pRespones)
                              callback(1, apiData[0].pRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == CASHIN_P) {
                              callback(1, apiData[0].pRespones)
                         }
                         else if ((pData.service_info.service_type).toUpperCase() == CASHOUT_P) {
                              callback(1, apiData[0].pRespones)
                         }






 

                    }
                    else {
                         callback(1, responesIsPaid(apiData[0].agent_code))
                    }
               }
               else {
                    callback(0, '');
               }
          })
}





function responesIsPaid(agent_code) {


     return `<?xml version="1.0" encoding="UTF-8"?>
     <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
      <env:Header/>
         <env:Body>
          <ns:PaymentRem_respons>
           <msg_info_server>
             <code_serv>00000</code_serv>
             <msg_serv>'تمت العمليات في السيرفر بنجاح'</msg_serv>
           </msg_info_server>
           <msg_info_API>
             <code_API> 5000 </code_API>
             <msg_API>هذة الحوالة تم تسليمها من قبل  ${agent_code} </msg_API>
           </msg_info_API>
           </ns:PaymentRem_respons>
          </env:Body>
     </env:Envelope>`
}


// async function saveRequestsToDataBase(request,remitNo) {

//      let newData = new newApiRequest.insertData(
//          {
//              rem_no: remitNo,
//              transaction_id: "",
//              service_name: request.service_info.service_name,
//              service_type: request.service_info.service_type,
//              system_name: request.service_info.system_name,
//              username: request.service_info.username,
//              agent_code: request.service_info.agent_or_Branch_Code,
//              agent_name: request.service_info.agent_or_Branch_name,
//              date: Date.now(),
//              requestData: "",
//              responesData: "",
//              tokenBody: "",
//              Amounts: "",
//              FirstName: "",
//              SecondName: "",
//              ThirdName: "",
//              LastName: "",
//              CustID: "for save",
//              qRespones: "",
//              Request: JSON.stringify(request),
//           });
    
 
 
//      return new Promise(async (resolve,reject)=>{
//          await newData.save( (err, doc) => {
           
//            if (!err) {
//              console.log('record was added');
//              resolve(1);    
//            }
//            else {
//              console.log("DataBase err "+err.message)
//              reject(0);
//            }
//            });
//         });
//  }



//const server = https.createServer(app);
app.listen(port, function () {
     console.log('Web server listening on localhost:' + port);
     schedule.scheduleJob({hour: 23, minute: 59}, () => {
          console.log('Job runs every day at 23:59 AM');
          createBackup();
        });
});

function createBackup(){

     var filePath = `logs-test/api-console.log`;
     var copy = `backups/${getCurrentDate()}-backup.log`;
          fs.writeFileSync(copy,'')
          if(fs.existsSync(copy)){
              fs.copyFile(filePath, copy, (error) => {
                  if (error) {
                      console.log("Creating backup:"+error)
                  } else {
                      console.log("Creating backup: copyFile successfully")
                      fs.truncate(filePath,0, (err) => {
                          if (err) {
                           console.log("Creating backup:"+error)
                          } //handle your error the way you want to;
                          //or else the file will be deleted
                            });
                  }
                })
          }
              
      }
     

function getCurrentDate(){
          const timeElapsed = Date.now();
          const today = new Date(timeElapsed);
          var current_Date=today.toISOString().split('T')[0];
     
          return current_Date;
     }
     


