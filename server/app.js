"use strict";

/* node imports */
const fs = require('fs');
const enigma = require("enigma.js");
const schema = require("enigma.js/schemas/12.612.0");
const WebSocket = require("ws");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
//const ejs = require('ejs');
//const morgan = require('morgan');

//settings file
const settings = require('./settings.js');

//url for the Enigma WS
const url = `wss://${settings.tenant}/app/${settings.appId}`;

//Express router
const app = express();

const port = 3000;

//Middleware
//CORS
app.use(cors());

//body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use(express.static('public'));

//EJS
//app.set('views', path.join(__dirname, 'views')); // Replace 'custom_views_folder' with the desired folder name
// Set the view engine to EJS
//app.set('view engine', 'ejs');

// Parse JSON request bodies
//app.use(express.json());

//Morgan Logs

//  Create a write stream for error logs
/* app.use(morgan('dev', {
    stream: fs.createWriteStream(path.join(__dirname, 'logs', `${currentDate}_error.log`), { flags: 'a' }),
    skip: (req, res) => res.statusCode < 400 // Skip logging successful requests
}));
 */
//routes
//html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './../public', 'index.html'));
});


//post to service
app.get('/table', async (req, res) => {

    //return first object id from settings - 0
    let objectID = settings.objects[0]

    //get data from Qlik Sense object
    const response = await getObjData(settings.appId, objectID);

    res.json(response); 
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});


/**
 * Get data from Qlik Sense object
 * @param {*} appId - Qlik Sense app id
 * @param {*} object_id - Qlik Sense object id
 * @param {*} rows - number of rows to get from the object, default false - all rows
 * @returns 
 */
async function getObjData(appId, object_id, rows = false) {

    return new Promise(async (resolve, reject) => {

        try {

            //create session with enigma 
            const session = enigma.create({
                schema,
                createSocket: () =>
                    new WebSocket(url, {
                        headers: {
                            Authorization: `Bearer ${settings.apiKey}`
                        },
                    }),
            });

            const global = await session.open();

            global.openDoc(appId).then(async model => {

                //Select the admin group field
                /* model.getField('admin_group')
                    .then(field => {
                        //console.log('field',field);

                        const selected = [{
                            "qText": data.admin_group,
                            "qIsNumeric": false,
                            "qNumber": 0
                        }]
                        return field.selectValues(selected);
                    })
                    .then((successful) => {
                        if (successful) {
                            console.log('Selection done');
                        } else {
                            console.error('Selection failed');
                        }
                    })
                    .catch(console.error); */

                model.getObject({
                    "qId": object_id
                }).then(async model => {
                    //console.log('model CPWbTj', model);
                    model.getLayout().then(async modelLayout => {

                        //console.log('modelLayout', modelLayout);

                        const columns = modelLayout.qHyperCube.qSize.qcx;
                        const totalheight = modelLayout.qHyperCube.qSize.qcy;

                        //build headers part
                        const columnOrder = modelLayout.qHyperCube.columnOrder;
                        const qDimensionInfo = modelLayout.qHyperCube.qDimensionInfo.map(dim => dim.qFallbackTitle);
                        const qMeasureInfo = modelLayout.qHyperCube.qMeasureInfo.map(measure => measure.qFallbackTitle);

                        const headers_unordered = qDimensionInfo.concat(qMeasureInfo);

                        const headers = [];

                        for (let index = 0; index < columnOrder.length; index++) {
                            if (headers_unordered[columnOrder[index]] !== undefined) {
                                headers.push(headers_unordered[columnOrder[index]])
                            }
                        }

                        //console.log('headers', headers);

                        //build table data
                        const body = [];

                        await model.getHyperCubeData('/qHyperCubeDef', [{
                            qTop: 0,
                            qLeft: 0,
                            qWidth: columns,
                            qHeight: (rows ? rows : totalheight) //rows
                        }]).then(data => {

                            data[0].qMatrix.forEach((row, i) => {

                                const obj = {}

                                const row_qText = row.map(data => data.qText);

                                for (let index = 0; index < headers.length; index++) {
                                    obj[headers[index]] = row_qText[index];
                                }

                                // console.log('obj', obj);

                                body.push(obj)
                            });
                        });

                        const table_data = {
                            headers: headers,
                            body: body
                        };

                       // console.log('table_data', table_data);

                        //fs.writeFile('../csv/table_data.txt', prompt, (err) => {}); 
                        
                        resolve(table_data);



                    }); //model.getLayout().then(async modelLayout => {


                }); // model.getObject({


            }); //const app = global.openDoc(appId).then(model => {


            console.log("You are connected!");

            //await session.close();
            //console.log("Session closed!");

        } catch (err) {

            console.log("Something went wrong :(", err);

            reject("Something went wrong :(", err)

        } //try

    }); //return new Promise(async(resolve, reject) => {

}