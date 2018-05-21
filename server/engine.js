
const path = require('path');
const axios = require('axios');
var fs = require('fs');
const Nexmo = require('nexmo');

/* CONSTANTS */
const quickbooks_sandbox_baseurl = 'https://sandbox-quickbooks.api.intuit.com';
const quickbooks_production_baseurl = 'https://quickbooks.api.intuit.com';

const config = {
    FROM_NUMBER: '12015542287',
    TO_NUMBER: '15183667175'
}

const oauth2_access_token =   "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..tuyia4vJuXYMK85Bp2nCMg.2_8jHI7MDxLzst7t7B0Ig-3OMvQFVJmqe6fAcka18d6FTlaSxzqazPKcnhD7406A8apyRJYbUlCN0RyLqubz8Fo9z5-9tlZiSk520aDiuNeN3N6ls-H6kFsuO-hOdjoKPRZ9ES_J0M_G5rY1EtVM3Tu50jA1kcBiV3RVtItrfRCuYa1qF3-hd2lDhCwrTzUeWSkGqbw81XoQ-S9PnkHgOfvjY9-0JGuZJ6Ek7_nKk2789mGrTrVWuPwi0hZJLs7h6uURSTESVuXWPyC0trWnBN0mgU7rUO1a6tpfK6E9rNFVLl_NgkelIkcQquxoPbRlynr4_h7QTi_FNluftCxl7IGZ_tIxYoMFFFD5_93c0BymA3PoSohfbLy0xDWOAcmTO5VGYdMoyKKZn9zZhVQx-qfBsgJ61TrfLxC6w8QQi7e66o6ISBf30wtKEPj7xE5yEaX0YWi1aIYqkK3jLGrNSw1ajZYLWG9a_vJgaq0dMUzOhNeMmvWylvoXwLJMrzSQRHEfagdopqEtEu9dIE0jxGbSZMO5lr7oX2U3FimAV_spsGyvt6ml7l66YqFew-4X0gZ95f0CpQx78QvaCWPhheR2m4F5SfWwZ2Msbed5fF7M45DP1hh0gCJHXZMThuH8YMLuR_PxLCPM2JNCm2l9IKYIFXgqsyOryLgFLvEEjf3p9Ob2Hlc4NlOAoX-3U57nnV9oxpxLYLvePzJtrcjbPzwHDid2ZwlXmlm7RsHkkZE-riGzyrgZmnpib7GxXt8G4FoAw48nA9KbqSDrV8nsdgj8h6QojHA8jfpEhnVA-tBRd88LVon9lEVSB0dvCGpEIT6E7YMobkOr6DB7-xCIAw.nxmE3_fUkY3e_A5DbqBSQg";
const realm_id = '123145907152609';


/* FUNCTIONS */
function get_company_info(access_token, realmId, param, callback) {
	const url = quickbooks_sandbox_baseurl + '/v3/company/' + realmId + '/companyinfo/' + realmId + '?minorversion=12';
	const config = {
		headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer '+ access_token
		}
	}

	axios.get(url, config).then( function (response) {
		console.log('Company info received');
		let companyInfo = response.data;
    callback(null, {customer: param, company: {name: companyInfo.CompanyInfo.CompanyName} });//.QueryResponse.CompanyInfo[0].CompanyName);
	}).catch(function (error) {
    	console.log(error);
	});
}


function get_customer_info(access_token, realmId, param, callback) {
	const url = quickbooks_sandbox_baseurl + '/v3/company/' + realmId + '/customer/' + param.clientID + '?minorversion=12';
	const config = {
		headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer '+ access_token
		}
	}

	axios.get(url, config).then( function (response) {
		console.log('Customer info received');
		let customer = response.data;
    //console.log(customer);//.QueryResponse.CompanyInfo[0].CompanyName);
    callback(null, {
      period: param.period,
      value: param.value,
      company: param.clientName,
      name: customer.Customer.GivenName,
      phone: customer.Customer.PrimaryPhone.FreeFormNumber
    });
	}).catch(function (error) {
    	console.log(error);
	});
}

function get_ar_report(access_token, realmId, callback) {
	const url = quickbooks_sandbox_baseurl + '/v3/company/' + realmId + '/reports/' + 'AgedReceivables' + '?minorversion=12';
	const config = {
		headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer '+ access_token
		}
	}

	axios.get(url, config).then( function (response) {
		//console.log('AR Report received');
		let arReport = response.data.Rows.Row;
    let max3 = {value: '0', client: null};
    for(i=0;i<arReport.length;i++){
      let tmp = arReport[i];
      if(Object.keys(arReport[i]).includes('ColData')){
          if(parseInt(max3.value)<parseInt(arReport[i].ColData[4].value)){
            max3.value = arReport[i].ColData[4].value;
            max3.client = arReport[i].ColData[0];
          }
      }
    }
    callback(null, {
      period: '2 month',
      value: max3.value,
      clientName: max3.client.value,
      clientID: max3.client.id
    });
	}).catch(function (error) {
    	console.log(error);
	});
}

const getPhrase = (param) => {
    return `Dear ${param.customer.name} from our beloved ${param.customer.company}. This is kind payment reminder for the amount of $${param.customer.value} that is delayed for more than ${param.customer.period} for ${param.company.name}`;
}

var nexmo = new Nexmo({
    apiKey: '0b66e707',
    apiSecret: 'd5ecf040b36c8cf6',
    applicationId: '2c5b9de1-e3fe-46a5-b6a9-4766460b18b6',
    privateKey:  'private.key' //fs.readFileSync('./private.key'),
}, { debug: true });

const sendSMS = (param, callback) => {
    nexmo.message.sendSms(
        config.FROM_NUMBER,
        config.TO_NUMBER,
        getPhrase(param),
        callback
    );
}

const callPhone = (param, callback) => {

    var callObj = {
        action: "talk",
        voiceName: "Russell",
        text: getPhrase(param)
    }

    var callArr = [callObj];

    fs.writeFileSync('../public/test.json', JSON.stringify(callArr));

    nexmo.calls.create({
        to: [{
            type: 'phone',
            number: config.TO_NUMBER
        }],
        from: {
            type: 'phone',
            number: config.FROM_NUMBER
        },
        answer_url: ['http://7d0b78c5.ngrok.io/test.json']
    }, callback);
}


/** Performing communications */
try {
    get_ar_report (oauth2_access_token, realm_id, (err, data) => {
      //console.log(data);
      get_customer_info (oauth2_access_token, realm_id, data, (err, data) => {
        //console.log(data);
        get_company_info(oauth2_access_token, realm_id, data, (err, data) => {
          //console.log(data);
          //console.log(getPhrase(data));
          sendSMS(data, (error) => {
              if(error){
                console.log(error);
              } else {
                console.log(`SMS to ${data.customer.name} sent`);
              }
          });
          callPhone(data, (error) => {
             if(error){
               console.log(error);
             } else{
               console.log(`Call to ${data.customer.name} made`);
             }
          })
        })

      });
    });
} catch (e) {
    console.log(e);
}
