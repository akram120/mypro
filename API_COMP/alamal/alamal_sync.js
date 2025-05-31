const express = require('express');
const router = express.Router();
var xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');
const content_type = 'text/xml;charset=UTF-8';
const agentID = '53';
const agent_CAT = 'NUEXE';
const agent_type_id = '1';
const userName = 'alnoaman';
const userPWD = '14510';
const url = 'http://amb.alamalbank.com:7105/amb/AMBServicePort?wsdl';
var parser = new xml2js.Parser({ explicitArray: false,ignoreAttrs : true, mergeAttrs : false});





router.post('/alamalSync',(req,res,next)=>{

        var fromDate = req.body.fromDate;
        var toDate = req.body.toDate;
        getAllRemittance(fromDate,toDate).then(result => {
            if(result['S:Envelope']['S:Body']['ns2:Remittances_Synchronze_v2Response']['return']['code']==004){
                var allRemittances = result['S:Envelope']['S:Body']['ns2:Remittances_Synchronze_v2Response']['return']['remVoList'];
                    res.status(200).json({
                        "code":1,
                        "Message":allRemittances
                     });
            } else {
                var errCode = result['S:Envelope']['S:Body']['ns2:Remittances_Synchronze_v2Response']['return']['code'];
                var errorMsg = result['S:Envelope']['S:Body']['ns2:Remittances_Synchronze_v2Response']['return']['message'];
                res.status(200).json({
                    "code":parseInt(errCode),
                    "Message":errorMsg
                 });
                   
            }
    }).catch(err=>{
            console.log("Inside catch query");
            console.log(err.message);
            res.status(200).json({
                "code":5005,
                "Message":err.message
             });
        });
    


});





module.exports = router;



async function getAllRemittance(fromDate,toDate) {



    var header = {
        'Content-Type': content_type,
    };

    var request = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:amb="http://ambws/">
    <soapenv:Header/>
    <soapenv:Body>
       <amb:Remittances_Synchronze_v2>
          <RequestHeaderQueryRem>
             <agentID>${agentID}</agentID>
             <agent_CAT>${agent_CAT}</agent_CAT>
             <agent_brn></agent_brn>
             <agent_type_id>${agent_type_id}</agent_type_id>
             <bnf_Name></bnf_Name>
             <bnf_Num></bnf_Num>
             <from_date>${fromDate}</from_date>
             <qeury_by_paydate></qeury_by_paydate>
             <rem_Num></rem_Num>
             <seq_fetch_rem></seq_fetch_rem>
             <t_date>${toDate}</t_date>
             <userName>${userName}</userName>
             <userPWD>${userPWD}</userPWD>
          </RequestHeaderQueryRem>
       </amb:Remittances_Synchronze_v2>
    </soapenv:Body>
 </soapenv:Envelope>`;

    // const { response } = await soapRequest({ url: url, headers: header, xml: request });
    // const { headers, body, statusCode } = response;
    // console.log(body);
    // console.log(statusCode);
    
    //var stringResult = body.toString();
    var stringResult = `<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
    <S:Body>
        <ns2:Remittances_Synchronze_v2Response xmlns:ns2="http://ambws/">
            <return>
                <code>004</code>
                <message>Success</message>
                <remVoList>
                    <bnf_id>130041528</bnf_id>
                    <name_bnf>محسن عبدالله یحیى ردمان ردمان</name_bnf>
                    <pay_agent_brn>1715</pay_agent_brn>
                    <pay_agent_no>1</pay_agent_no>
                    <pay_date>2017-08-29T00:00:00+03:00</pay_date>
                    <pay_fee_amt>0.0</pay_fee_amt>
                    <rem_Num>3.172039088356E12</rem_Num>
                    <sndr_name>Emergency Cash Project ECT first Cycle</sndr_name>
                    <trxCurrName>YER</trxCurrName>
                    <trx_amt>18000.0</trx_amt>
                </remVoList>
                <remVoList>
                    <bnf_id>130047735</bnf_id>
                    <name_bnf>یحیى حسن قاسم عثمان</name_bnf>
                    <pay_agent_brn>1715</pay_agent_brn>
                    <pay_agent_no>1</pay_agent_no>
                    <pay_date>2017-08-27T00:00:00+03:00</pay_date>
                    <pay_fee_amt>0.0</pay_fee_amt>
                    <rem_Num>3.172039090435E12</rem_Num>
                    <sndr_name>Emergency Cash Project ECT first Cycle</sndr_name>
                    <trxCurrName>YER</trxCurrName>
                    <trx_amt>18000.0</trx_amt>
                </remVoList>
                <remVoList>
                    <bnf_id>130047753</bnf_id>
                    <name_bnf>یحیى حزام احمد مفتاح</name_bnf>
                    <pay_agent_brn>1715</pay_agent_brn>
                    <pay_agent_no>1</pay_agent_no>
                    <pay_date>2017-08-22T00:00:00+03:00</pay_date>
                    <pay_fee_amt>0.0</pay_fee_amt>
                    <rem_Num>3.172039090437E12</rem_Num>
                    <sndr_name>Emergency Cash Project ECT first Cycle</sndr_name>
                    <trxCurrName>YER</trxCurrName>
                    <trx_amt>18000.0</trx_amt>
                </remVoList>
                <remVoList>
                    <bnf_id>130046104</bnf_id>
                    <name_bnf>فاطمھ علي علي الشاحذي</name_bnf>
                    <pay_agent_brn>1713</pay_agent_brn>
                    <pay_agent_no>1</pay_agent_no>
                    <pay_date>2017-08-30T00:00:00+03:00</pay_date>
                    <pay_fee_amt>0.0</pay_fee_amt>
                    <rem_Num>3.172039090441E12</rem_Num>
                    <sndr_name>Emergency Cash Project ECT first Cycle</sndr_name>
                    <trxCurrName>YER</trxCurrName>
                    <trx_amt>18000.0</trx_amt>
                </remVoList>
                <remVoList>
                    <bnf_id>130021836</bnf_id>
                    <name_bnf>علي دبیش یحیى دبیش الباجلي</name_bnf>
                    <pay_agent_brn>1715</pay_agent_brn>
                    <pay_agent_no>1</pay_agent_no>
                    <pay_date>2017-08-27T00:00:00+03:00</pay_date>
                    <pay_fee_amt>0.0</pay_fee_amt>
                    <rem_Num>3.17203908656E12</rem_Num>
                    <sndr_name>Emergency Cash Project ECT first Cycle</sndr_name>
                    <trxCurrName>YER</trxCurrName>
                    <trx_amt>12000.0</trx_amt>
                </remVoList>
            </return>
        </ns2:Remittances_Synchronze_v2Response>
    </S:Body>
</S:Envelope>`
    var resultResponse;
    parser.parseString(stringResult, function (err, result) {
        
        console.log(result);
        resultResponse = result;
    })
    return resultResponse;
}