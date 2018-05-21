## IntuitCollector
This app was made during **Intuit Hackathon** to demonstrate usage of *Nexmo*, *Google Assistant* and *Intuit* APIs.

## Functionality
**IntuitCollector** allows to remind money debtors about overdue payments by sms and voice call.
Users can see stat (balance, number of calls made, etc.) and set parameters (frequency of calls and sms) of service through Google Assistant by calling **IntuitCollector** and following instructions.

## APIs and Tools used
- **Nexmo** service and APIs for call and sms services
- **DialogFlow** framework for Google Assistant app
- **Ngrock** for communicating with *Nexmo* service (Nexmo requires for open http connection to provide statuses)
- **Quickbooks** APIs and sandbox environment to get and process debtors data (amounts, contact data, etc.)

## Source
- */dialogflow* contains Google Assistant app consists from intentions, phrases etc.
- */server/engine.js* performs the basic logic: receives and process data from Intuit, triggers sms and calls
- */server/server.js* opens http server to interact with Nexmo through Ngrock
- */server/private.key* that is not included to this repo contains private key for Nexmo service

## Further development
App is made during Intuit weekend hackathon to test APIs as requested by event conditions. No further development is intended. Feel free to reuse the code.
