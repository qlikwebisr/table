# Qlik Sense SaaS Table

### Web application that returns data from Qlik Sense SaaS object 

### Settings file
Change the name of seetings file from ./server/settings.js.txt to ./server/settings.js and fill the details
./server/settings.js

Example:
```
module.exports = {
    //Qlik Saas Data
    tenant: "<host>.eu.qlikcloud.com",
    apiKey: "<api_key>",
    appId: "<app_id>",
    objects: ["<object_id>"]

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
