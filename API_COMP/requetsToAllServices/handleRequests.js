var xml2js = require('xml2js');
var parser = new xml2js.Parser({ explicitArray: false });
const newApiRequest = require('../../db_modal/alnoamanNewModal');



function getRequests(internalRequest,serviceName,callback) {
        var systemDetails = internalRequest.system_remit_details;
    if(serviceName.toUpperCase() === 'upt'.toUpperCase()){
        getUPTRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'altaif'.toUpperCase()){
        getAltaifRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'kamal'.toUpperCase()){
        getKamalRequest(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'hawalati'.toUpperCase()){
        getAbuShaikhaRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'alawneh'.toUpperCase()){
        getAlwanehRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'floosak_remit'.toUpperCase()){
        getFloosakRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'Mehfthaty_remit'.toUpperCase()){
        getMehfthatyRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'musharbash'.toUpperCase()){
        getMusharbashRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'mustaqbal'.toUpperCase()){
        getMustaqbalRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'zamzam'.toUpperCase()){
        getZamzamRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'ria'.toUpperCase()){
        getRiaRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'saudi'.toUpperCase()){
        getSaudiRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'shift'.toUpperCase()){
        getShiftRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'speed'.toUpperCase()){
        getSpeedRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'tadamonpay'.toUpperCase()){
        getTadamonPayRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    } else if(serviceName.toUpperCase() === 'tejary'.toUpperCase()){
        getTejaryRequests(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    }  else if(serviceName.toUpperCase() === 'uremet'.toUpperCase()){
        getUremetRequets(systemDetails,function(readyRequest){
            console.log(readyRequest)
            callback(readyRequest)
        })
    }


}

module.exports.getRequests=getRequests;



function getUPTRequests(systemDetails,callback){

    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:tem="http://tempuri.org/">
        <soapenv:Header>
            <tem:WsSystemUserInfo>
                <tem:Username>612335</tem:Username>
                <tem:Password>Alnoaman@123456</tem:Password>
            </tem:WsSystemUserInfo>
        </soapenv:Header>
        <soapenv:Body>
            <service_info>
                <service_name>upt</service_name>
                <service_type>Q_REM</service_type>
                <username>39501RYD</username>
                <system_name>VT5</system_name>
                <agent_or_Branch_Code>39501</agent_or_Branch_Code>
                <agent_or_Branch_name>39501</agent_or_Branch_name>
            </service_info>
            <tem:CorpGetTransferInfo>
                <tem:obj>
                    <tem:CORRESPONDENT_REF></tem:CORRESPONDENT_REF>
                    <tem:UPT_REF>87938171910</tem:UPT_REF>
                    <tem:SENDER_FULLNAME></tem:SENDER_FULLNAME>
                    <tem:BENEFICIARY_FULLNAME></tem:BENEFICIARY_FULLNAME>
                    <tem:SENDER_COUNTRY></tem:SENDER_COUNTRY>
                    <tem:OFFICE_REFERENCE_CODE></tem:OFFICE_REFERENCE_CODE>
                </tem:obj>
            </tem:CorpGetTransferInfo>
        </soapenv:Body>
    </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:CorpGetTransferInfo"){
                        requestToService[key]['tem:obj']['tem:UPT_REF'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })


    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){


    }
}

function getAltaifRequets(systemDetails,callback){

    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>123456789555</rem_no>
                 </rem_info>
                 <service_info>
                    <service_name>altaif</service_name>
                    <service_type>q_rem</service_type>
                    <username>SADDAM</username>
                    <system_name>V99</system_name>
                    <agent_or_Branch_Code>1001</agent_or_Branch_Code>
                    <agent_or_Branch_name>1001</agent_or_Branch_name>
                    <agent_or_Branch_addrs></agent_or_Branch_addrs>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}

function getKamalRequest(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://Services/">
        <soapenv:Header/>
        <soapenv:Body>
           <service_info>            
               <service_name>kamal</service_name> 
               <service_type>q_rem</service_type> 
               <username>SADDAM</username>
                <system_name>V99</system_name>
                <agent_or_Branch_Code>101</agent_or_Branch_Code>
                <agent_or_Branch_name>101</agent_or_Branch_name>
           </service_info>
           <ser:getRemittanceForReceive>
              <remittanceId>2202007045767</remittanceId>
              <serviceCenterBranchCode></serviceCenterBranchCode>
              <GUID></GUID>
              <aCorrespondentId>157</aCorrespondentId>
              <aUserId>408</aUserId>
              <aPassword>ecgox419</aPassword>
           </ser:getRemittanceForReceive>
        </soapenv:Body>
     </soapenv:Envelope>`

     parser.parseString(x,function(err,result){
        if(!err){
            var requestToService = result['soapenv:Envelope']['soapenv:Body'];
            Object.entries(requestToService).forEach(([key, value]) =>{
                if(key === "service_info"){
                    requestToService[key].username = systemDetails.username;
                    requestToService[key].system_name = systemDetails.system_name;
                    requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                    requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                } 
                if (key === "ser:getRemittanceForReceive"){
                    requestToService[key].remittanceId = systemDetails.rem_no
                }
            })
            const builder = new xml2js.Builder();
            var finalData = builder.buildObject(result);
            callback(finalData)
        }
    })

    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}


function getAbuShaikhaRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
           <service_info>            
               <service_name>hawalati</service_name> 
               <service_type>q_rem</service_type> 
               <username>**PARM_2**</username>
                <system_name>**PARM_3**</system_name>
                <agent_or_Branch_Code>**PARM_4**</agent_or_Branch_Code>
                <agent_or_Branch_name>**PARM_4**</agent_or_Branch_name>
           </service_info>
           <tem:GetRemitForPay>
              <tem:ObjAgentAuthentication>
                 <tem:AgentCode>357</tem:AgentCode>
                 <tem:UserCode>1000</tem:UserCode>
                 <tem:UserPassword>FuT$654987</tem:UserPassword>
              </tem:ObjAgentAuthentication>
              <tem:TransactionNo>**PARM_1**</tem:TransactionNo>
           </tem:GetRemitForPay>
        </soapenv:Body>
     </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:GetRemitForPay"){
                        requestToService[key]['tem:TransactionNo'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}


function getAlwanehRequests(systemDetails, callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                 </rem_info>
                 <service_info>
                    <service_name>alawneh</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_4**</username>
                    <system_name>**PARM_5**</system_name>
                    <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                    <agent_or_Branch_name>**PARM_7**</agent_or_Branch_name>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}


function getFloosakRequests(systemDetails, callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                    <region>**PARM_2**</region>
                 </rem_info>
                 <service_info>
                    <service_name>floosak_remit</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_4**</username>
                    <system_name>**PARM_5**</system_name>
                    <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                     <agent_or_Branch_name>**PARM_6**</agent_or_Branch_name>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                        requestToService[key].region = systemDetails.region
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}


function getMehfthatyRequests(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                    <region>**PARM_9**</region>
                 </rem_info>
                 <service_info>
                    <service_name>Mehfthaty_remit</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_4**</username>
                    <system_name>**PARM_5**</system_name>
                    <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                     <agent_or_Branch_name>**PARM_6**</agent_or_Branch_name>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                        requestToService[key].region = systemDetails.region
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}


function getMusharbashRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
           <service_info>            
               <service_name>musharbash</service_name> 
               <service_type>q_rem</service_type> 
               <username>**PARM_2**</username>
                <system_name>**PARM_3**</system_name>
                <agent_or_Branch_Code>**PARM_4**</agent_or_Branch_Code>
                <agent_or_Branch_name>**PARM_4**</agent_or_Branch_name>
           </service_info>
           <tem:GetRemitForPay>
              <tem:ObjAgentAuthentication>
                 <tem:AgentCode>1134</tem:AgentCode>
                 <tem:UserCode>1134</tem:UserCode>
                 <tem:UserPassword>Aa123456@@</tem:UserPassword>
              </tem:ObjAgentAuthentication>
              <tem:TransactionNo>**PARM_1**</tem:TransactionNo>
           </tem:GetRemitForPay>
        </soapenv:Body>
     </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:GetRemitForPay"){
                        requestToService[key]['tem:TransactionNo'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}

function getMustaqbalRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
           <service_info>            
               <service_name>mustaqbal</service_name> 
               <service_type>q_rem</service_type> 
               <username>**PARM_2**</username>
                <system_name>**PARM_3**</system_name>
                <agent_or_Branch_Code>**PARM_4**</agent_or_Branch_Code>
                <agent_or_Branch_name>**PARM_4**</agent_or_Branch_name>
           </service_info>
           <tem:GetRemitForPay>
              <tem:ObjAgentAuthentication>
                 <tem:AgentCode>357</tem:AgentCode>
                 <tem:UserCode>1000</tem:UserCode>
                 <tem:UserPassword>FuT$654987</tem:UserPassword>
              </tem:ObjAgentAuthentication>
              <tem:TransactionNo>**PARM_1**</tem:TransactionNo>
           </tem:GetRemitForPay>
        </soapenv:Body>
     </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:GetRemitForPay"){
                        requestToService[key]['tem:TransactionNo'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}

function getZamzamRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
           <service_info>            
               <service_name>zamzam</service_name> 
               <service_type>q_rem</service_type> 
               <username>**PARM_2**</username>
                <system_name>**PARM_3**</system_name>
                <agent_or_Branch_Code>**PARM_4**</agent_or_Branch_Code>
                <agent_or_Branch_name>**PARM_4**</agent_or_Branch_name>
           </service_info>
           <tem:GetRemitForPay>
              <tem:ObjAgentAuthentication>
                 <tem:AgentCode>7011</tem:AgentCode>
                 <tem:UserCode>NOAMN.API</tem:UserCode>
                 <tem:UserPassword>NOAMN.API123</tem:UserPassword>
              </tem:ObjAgentAuthentication>
              <tem:TransactionNo>**PARM_1**</tem:TransactionNo>
           </tem:GetRemitForPay>
        </soapenv:Body>
     </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:GetRemitForPay"){
                        requestToService[key]['tem:TransactionNo'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}

function getRiaRequests(systemDetails, callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
           <env:Header />
           <env:Body>
              <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                 </rem_info>
                 <service_info>
                    <service_name>ria</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_2**</username>
                    <system_name>**PARM_3**</system_name>
                    <agent_or_Branch_Code>**PARM_4**</agent_or_Branch_Code>
                    <agent_or_Branch_name>**PARM_5**</agent_or_Branch_name>
                    <agent_or_Branch_addrs></agent_or_Branch_addrs>
                 </service_info>
              </ns:Q_ReciveRem>
           </env:Body>
        </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                        
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}

function getSaudiRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
        <service_info>            
        <service_name>saudi</service_name> 
        <service_type>Q_REM</service_type> 
         <username>**PARM_4**</username>
         <system_name>**PARM_5**</system_name>
         <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
         <agent_or_Branch_name>**PARM_7**</agent_or_Branch_name>
        </service_info>
           <tem:GetRemitByReferenceNumber>
              <tem:ObjAgentAuthentication>
                 <tem:AGENT_CODE>YE149</tem:AGENT_CODE>
                 <tem:USER_ID>APIUSER</tem:USER_ID>
                 <tem:PASSWORD>7568708578</tem:PASSWORD>
              </tem:ObjAgentAuthentication>
              <tem:REFERENCE_NUMBER>**PARM_1**</tem:REFERENCE_NUMBER>
           </tem:GetRemitByReferenceNumber>
        </soapenv:Body>
        </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:GetRemitByReferenceNumber"){
                        requestToService[key]['tem:REFERENCE_NUMBER'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}

function getShiftRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservice/">
        <soapenv:Header/>
        <soapenv:Body>
         <service_info>
                   <service_name>shift</service_name>
                   <service_type>q_rem</service_type>
                   <username>**PARM_4**</username>
                   <system_name>**PARM_5**</system_name>
                   <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                   <agent_or_Branch_name>**PARM_7**</agent_or_Branch_name>
                   <agent_or_Branch_addrs></agent_or_Branch_addrs>
                </service_info>
        <web:getRemittanceForReceive>
        <remittancTrackingCode>**PARM_1**</remittancTrackingCode>
        <agentCode>YE003</agentCode>
        <userId>ALNOAMAN</userId>
        <userPassword>knls8b26</userPassword>
        </web:getRemittanceForReceive>
        </soapenv:Body>
       </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "web:getRemittanceForReceive"){
                        requestToService[key]['remittancTrackingCode'] = systemDetails.rem_no;
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}

function getSpeedRequests(systemDetails, callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                 </rem_info>
                 <service_info>
                    <service_name>speed</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_4**</username>
                    <system_name>**PARM_5**</system_name>
                    <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                    <agent_or_Branch_name>**PARM_7**</agent_or_Branch_name>
                    <agent_or_Branch_addrs></agent_or_Branch_addrs>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}

function getTadamonPayRequests(systemDetails, callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                 </rem_info>
                 <service_info>
                    <service_name>tadamonpay</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_4**</username>
                    <system_name>**PARM_5**</system_name>
                    <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                    <agent_or_Branch_name>**PARM_7**</agent_or_Branch_name>
                    <agent_or_Branch_addrs></agent_or_Branch_addrs>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}

function getTejaryRequests(systemDetails, callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){

        var x = `<?xml version="1.0" encoding="UTF-8"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://AlnoamanAPI/">
        <env:Header /> <env:Body> <ns:Q_ReciveRem>
                 <rem_info>
                    <rem_no>**PARM_1**</rem_no>
                    <region>**PARM_8**</region>
                 </rem_info>
                 <service_info>
                    <service_name>tejary</service_name>
                    <service_type>q_rem</service_type>
                    <username>**PARM_4**</username>
                    <system_name>**PARM_5**</system_name>
                    <agent_or_Branch_Code>**PARM_6**</agent_or_Branch_Code>
                    <agent_or_Branch_name>**PARM_7**</agent_or_Branch_name>
                 </service_info>
              </ns:Q_ReciveRem>                                                                                                                                                                   
           </env:Body>  </env:Envelope>`

           parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['env:Envelope']['env:Body']['ns:Q_ReciveRem'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "rem_info"){
                        requestToService[key].rem_no = systemDetails.rem_no
                        requestToService[key].region = systemDetails.region
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })

    } else if(systemDetails.serviceType.toUpperCase() === 'pay'.toUpperCase()){

    }
}


function getUremetRequets(systemDetails,callback){
    if(systemDetails.service_type.toUpperCase() === 'query'.toUpperCase()){
        var x = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:urem="http://schemas.datacontract.org/2004/07/URemitWCFLib.Receive">
        <soapenv:Header/>
        <soapenv:Body>
       <service_info>
                 <service_name>uremet</service_name>
                 <service_type>q_rem</service_type>
                 <username>**PARM_2**</username>
                 <system_name>**PARM_3**</system_name>
                 <agent_or_Branch_Code>**PARM_4**</agent_or_Branch_Code>
                 <agent_or_Branch_name>**PARM_5**</agent_or_Branch_name>
                 <agent_or_Branch_addrs></agent_or_Branch_addrs>
              </service_info>
           <tem:DisplayCashTransactionForPaying>
              <tem:req>
                 <urem:Password>NOAMAN@967</urem:Password>
                 <urem:SecurityKey>wJQx5krTioWWHc8VqpvPuQ==</urem:SecurityKey>
                 <urem:TransactionNo>**PARM_1**</urem:TransactionNo>
                 <urem:UniqueID>06927816</urem:UniqueID>
              </tem:req>
           </tem:DisplayCashTransactionForPaying>
        </soapenv:Body>
     </soapenv:Envelope>`
        parser.parseString(x,function(err,result){
            if(!err){
                var requestToService = result['soapenv:Envelope']['soapenv:Body'];
                Object.entries(requestToService).forEach(([key, value]) =>{
                    if(key === "service_info"){
                        requestToService[key].username = systemDetails.username;
                        requestToService[key].system_name = systemDetails.system_name;
                        requestToService[key].agent_or_Branch_Code = systemDetails.agent_or_Branch_Code;
                        requestToService[key].agent_or_Branch_name = systemDetails.agent_or_Branch_name;
                    } 
                    if (key === "tem:DisplayCashTransactionForPaying"){
                        requestToService[key]['tem:req']['urem:TransactionNo'] = systemDetails.rem_no
                    }
                })
                const builder = new xml2js.Builder();
                var finalData = builder.buildObject(result);
                callback(finalData)
            }
        })
    } else if(systemDetails.service_type.toUpperCase() === 'pay'.toUpperCase()) {

    }
}