const express = require('express');
const router = express.Router();
const data =require('../db_modal/alnoamanNewModal');



router.post('/remitReport',express.json(),(req,res,next)=>{

    
    var requestReceived = req.body;
    console.log(requestReceived);
    var queryInfo = prepareJSONQuery(requestReceived);
    console.log(queryInfo)
    
            data.insertData.find(queryInfo).sort({date:-1}).exec(async (err, getData) => 
        {   
            if(!err){
                finalResponse = {
                    "code":getData.length==0?-1:1,
                    "message":"Success",
                    "data":getData.length==0?"No data found":getData
                }
                res.status(200).json(finalResponse);
            } else {
                finalResponse = {
                    "code":0,
                    "message":"Error",
                    "data":err.message
                    
                }
                res.status(500).json(finalResponse);
            }

    
    
        });


    

});








module.exports = router;



function prepareJSONQuery(requestGot){

    var opType = requestGot.type;
    var opNo = requestGot.opNo;
    var serviceType = requestGot.typData;
    var isPayed = requestGot.payReceived;
    var finalJson = {};
    if(opType==0){
        finalJson = {
            rem_no:opNo
        }
        if(serviceType==1){
            if(isPayed){
                finalJson.service_type = { $regex: 'q_rem', $options: 'i'};
                finalJson.remStatus = "1";
            } else {
                finalJson.service_type = { $regex: 'q_rem', $options: 'i'};
            }
        } else if(serviceType==2){
            if(isPayed){
                finalJson.service_type = { $regex: 'p_rem', $options: 'i'};
                finalJson.remStatus = "1";
            } else {
                finalJson.service_type = { $regex: 'p_rem', $options: 'i'};
            }
        } else if(serviceType==3){
            if(isPayed){
                finalJson.remStatus = "1";
            }
        }
    } else if (opType==1){
        finalJson = {
            OTP:opNo
        }
        if(serviceType==1){
            if(isPayed){
                finalJson.service_type = { $regex: 'cashin', $options: 'i'};
                finalJson.remStatus = "1";
            } else {
                finalJson.service_type = { $regex: 'cashin', $options: 'i'};
            }
        } else if(serviceType==2){
            if(isPayed){
                finalJson.service_type = { $regex: 'cashout', $options: 'i'};
                finalJson.remStatus = "1";
            } else {
                finalJson.service_type = { $regex: 'cashout', $options: 'i'};
            }
        } else if(serviceType==3){
            if(isPayed){
                finalJson.remStatus = "1";
            }
        }
    } else if (opType==2){
        finalJson = {
            mobile_no:opNo
        }
        if(serviceType==1){
            if(isPayed){
                finalJson.service_type = { $regex: 'cashin', $options: 'i'};
                finalJson.remStatus = "1";
            } else {
                finalJson.service_type = { $regex: 'cashin', $options: 'i'};
            }
        } else if(serviceType==2){
            if(isPayed){
                finalJson.service_type = { $regex: 'cashout', $options: 'i'};
                finalJson.remStatus = "1";
            } else {
                finalJson.service_type = { $regex: 'cashout', $options: 'i'};
            }
        } else if(serviceType==3){
            if(isPayed){
                finalJson.remStatus = "1";
            }
        }
    }

    return finalJson;

}