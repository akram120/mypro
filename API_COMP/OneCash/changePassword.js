const express = require('express');
const router = express.Router();
const request = require("request");
var path = require("path");
const crypto = require("crypto");
const date = require('date-and-time')
var rn = require('random-number'); 
const baseURL = "http://ma.onecashye.com:6470/";
const chngPass = "ONE/rest/UserPassChang";
const authID = "17940";
const username = "967000261433";
const apiKey = "74Weq7dcPRjMWJMPifs0P+KB3SOzsBrykl7AVi8sorzwmXAEHAYCmGXu5gLEr7lV1PIV2YzjLtr0+O8/h9GAI0KMkEB/P0K3esx+zMGMYIVchyxEDkwQ0qFZfwfOh66Sh+CndrajjttNiZqpJ5VF+o";
const HmacKey = "1oVJBBzfbDgnXkouklpRksiO+p3l8MTUYM6WbArLCcS+2igbiJDuUZY1ly+WAV7f+VB1sqc2r0Gyr23ZQyOQhg==";
const password = "API@123456@72";
const header = {
    "APIKey": apiKey,
    "Content-Type":"application/json"
};

router.post('/oneCash/changePass',express.json(),(req,res,next)=>{
    console.log("inside change password")
    console.log(req.body)

            var finalRequest = req.body;
               var updatedPass = finalRequest.newPassord
               changePassword(updatedPass, function(sts,data,body){
                    res.status(200).json(data);

        });
           


});

module.exports=router;




function hashingPubKeyPassword(passwordReceived){

    var publicKeyAk ="-----BEGIN PUBLIC KEY-----\n"+
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7OkyDKetBwoOGG0lCLHP051ei\n"+
    "jEFaSCgH3FPddYJ3NzmikwlNwhS/HboD0gqTQXKB5F3H1DCWFteHYCw5i+/quUvm5svg6\n"+
    "eEqlxEmFHOq0l+hpJiHT6w1SsxRw04ADRIa6dxYAcQw+/t+fyiU+M1OdKYljiuFQL5TIC5\n"+
    "+OOFjtmgharpvbXAQgNXz2J16lCgLfA4rTzkDnN6wZgt9G80hUjIPqv6vVxJWAuExn9F/4\n"+
    "xLfAd5oVXmTm3fV5ZuiaKar3bTCQBIi4ULd6oH+A34C4hd5Cgf4M5sIfb91aSkgVDufYF4\n"+
    "vsegndGv4JgSbPdqN1kVOP90yy5TUBHoUBGV7wIDAQAB\n"+
    "-----END PUBLIC KEY-----"

    var ciphertext = crypto.publicEncrypt(
        {
            key: publicKeyAk,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, 
        Buffer.from(passwordReceived,'utf8')
    )

   return ciphertext.toString('base64');
}





function getTimeStamp(){
var dateUT = new Date();
console.log(dateUT);
dateUT.setHours(dateUT.getHours()-3)
var valueFormatted = date.format(dateUT,'DD-MM-YYYY HH:mm:ss.SSS');
console.log(valueFormatted);
return valueFormatted;
}


function toNumberString(num) { 
var finalNum = parseFloat(num); 
if (Number.isInteger(finalNum)) { 
  return finalNum + ".0"
} else {
  return finalNum.toString(); 
}
}

function generateHmac(reqHash) {
// Convert key and data to byte arrays

console.log(reqHash);
const byteKey = Buffer.from(HmacKey, 'utf8');
const byteHash = Buffer.from(reqHash, 'utf8');

console.log(byteHash);

// Create HMAC object using SHA512 algorithm
const hmac = crypto.createHmac('sha512', byteKey);

// Update hmac with data to be signed
hmac.update(byteHash);

// Generate HMAC digest
const macData = hmac.digest();

// Base64 encode the HMAC digest
const result = macData.toString('base64');

return result;
}



function changePassword(newPassword,callback){


    var timeNow = getTimeStamp();
    var hash = `${authID}#01#${username}${timeNow}`;


    var changePasswordBody = {
        "id": authID,
        "userName": username,
        "pass": hashingPubKeyPassword(password),
        "newPass":hashingPubKeyPassword(newPassword),
        "timeStamp": timeNow,
        "hash": generateHmac(hash),
        "branch": {
            "name": "TEST",
            "code": "01",
            "city": "Sanaa"
        }
    }
    
    var changePasswordBodyProcessed = prepareBody(changePasswordBody);

    console.log(changePasswordBodyProcessed);
  
    request.post(
        {
            headers: header,
            url: baseURL+chngPass,
            body: changePasswordBodyProcessed,
            method: 'POST'
        },
        function (err, respones, body) {

            if (!err) {

                try {
                    json_tok = JSON.parse(body);
                    console.log(json_tok);
                    var statsCode = respones.statusCode;
                    console.log(statsCode);
                    return callback(statsCode,  json_tok, changePasswordBodyProcessed);

                } catch (error) {
                    var errorResponse = new Object;
                    console.log(error);
                    errorResponse.error = err;
                    errorResponse.res = respones.statusCode;
                    errorResponse.bdy = body
                    return callback(errorResponse.res, error.message, changePasswordBodyProcessed);
                }

            } else {
                return callback(1,err.message, changePasswordBodyProcessed);
            }

        }
    );

    
}




function prepareBody(bodyRecivied) {

    return JSON.stringify(bodyRecivied);

}