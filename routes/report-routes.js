const express = require('express');
const router = express.Router();
const data =require('../db_modal/alnoamanNewModal');
router.get('/',  (req,res)=>{
    var queryParameter = req.query;
    if('otp' in queryParameter){
        console.log("otp")
        var otp = queryParameter.otp;
        data.insertData.find({OTP:otp}).sort({date:-1,Object_ID:1}).exec(async (err, getData) => 
        { 
            res.render('Reports/index_RE',{getData : getData})
    
    
        });
    } else if('mobileNo' in queryParameter){
        console.log("mobileNo")
        var mobileNo = queryParameter.mobileNo;
        data.insertData.find({mobile_no:mobileNo}).sort({date:-1,Object_ID:1}).exec(async (err, getData) => 
        { 
            res.render('Reports/index_RE',{getData : getData})

        });
    } else if ('remNo' in queryParameter){
        console.log("remNo")
        var remNo = queryParameter.remNo;
        var option1 = {rem_no:remNo};
        console.log(remNo);
        data.insertData.find(option1).sort({date:-1,Object_ID:1}).exec(async (err, getData) => 
        { 
            console.log('T');
            res.render('Reports/index',{getData : getData})
            
            
        });
    } else {
        console.log('F');
        res.status(500).json({"Error":"Query parameter is not defined"});
    }




});

function preaperhtml(getData){
    var x;
    getData.forEach(data => {
     x=   `<tr>
            <td>${data['_id']} </td>
            <td> ${data.rem_no}</td>
            <td>${ data.transaction_id}</td>
            <td>${ data.service_name}</td>
            <td>${ data.service_type}</td>
            <td>${ data.FirstName}</td>
            <td>${ data.SecondName}</td>
            <td>${ data.ThirdName}</td>
            <td>${ data.LastName}</td>
            <td>${ data.CustID}</td>
            <td>${ data.system_name}</td>
            <td>${ data.username}</td>
            <td>${ data.agent_code}</td>
            <td>${ data.agent_name}</td>
            <td>${ data.agent_address}</td>
            <td>${ data.date}</td>
            <td>${ data.responesData}</td>
        </tr>`
        });
        return x;
}
module.exports = router;