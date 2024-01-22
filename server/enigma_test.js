/* File for  */
(async () => {
"use strict";

/* node imports */
const fs = require('fs');
const enigma = require("enigma.js");
const schema = require("enigma.js/schemas/12.612.0");
const WebSocket = require("ws");
const express = require('express');
const cors = require('cors');
const path = require('path');

//settings file
const settings = require('./settings.js');

/* Settings */
// replace with your information
const tenant = settings.tenant;
const apiKey = settings.apiKey;
const appId = settings.appId;
const objID = settings.objects[0];


//url for the Enigma WS
const url = `wss://${tenant}/app/${appId}`;

try {

    //create session with enigma 
    const session = enigma.create({
        schema,
        createSocket: () =>
            new WebSocket(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                },
            }),
    });

    // bind traffic events to log what is sent and received on the socket:
    session.on("traffic:sent", (data) => console.log("sent:", data));
    session.on("traffic:received", (data) => console.log("received:", data));

     const global =  await session.open();

     global.openDoc(appId).then(async model => {
        model.getObject({
            "qId": objID
        }).then(async model => {

            model.getLayout().then(async modelLayout => {

                console.log('modelLayout', modelLayout.qHyperCube);

            }).catch(console.error);
        });
    }); 

   

    console.log("You are connected!");

    //await session.close();
    //console.log("Session closed!");

} catch (err) {

    console.log("Something went wrong :(", err);

} //try


})(); //async