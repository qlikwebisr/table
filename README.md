# Table

### Web application that returns data from Qlik Sense SaaS object 

### Settings file
./server/settings.js

Example:
```
module.exports = {
    //Qlik Saas Data
    tenant: "<host>.eu.qlikcloud.com",
    apiKey: "<api_key>",
    appId: "81f5be0c-fd0a-43aa-ba54-73afcc934c75",
    objects: ["3b10f809-d4d6-4abf-b0d2-6b2c9ba0dc04"],

};
```
### Installation and activation
```
cd server
npm install

node app.js
```

### Check the Qlik Connection
```
node enigma_test.js
```