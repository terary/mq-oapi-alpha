'use strict';
let readme = `
    monqade schema definition: dictionary

`;

const port = process.env.PORT || "8000";  // applicable only if called as stand-alone server

const THIS_IS_MODULE = require.main !== module; // can be called as dev. test. or stand alone
const MODULE_DIR = '../../src/classes/'
const COMMON_TEST_VARS = require('../../environment');
const NO_FIELDS  = undefined;
const express = require("express");
const morgan = require('morgan')


const MonqadeExpressOapi = require(MODULE_DIR + 'monqade-oapi/monqade-express-oapi')
const dictSchemaDef = require('monqade-dev-schemas').dictionary;
const { WebMethodOapi }  = require(MODULE_DIR + 'web-method/');
const {oapiDocument} = require('../support/app-oapi-doc');
const echoResponse = {'200':{$ref:'#/components/schemas/Empty'}};

oapiDocument.servers.push({'url':'http://localhost:' + port})

const app = express();
app.use(express.json()); // instead of bodyParser
if( ! THIS_IS_MODULE ) {
    app.use(morgan('combined')); 
}

const mqSchema= new MonqadeExpressOapi(dictSchemaDef.paths,dictSchemaDef.options,COMMON_TEST_VARS.runtime.MONGO_CONNECTION, {doUpsertOne:{enabled:true}} );  

// **************  PROBABLY A BIG                                                          **** NO-NO ****  
// need to figure out a way to provide schema for testing and server 
COMMON_TEST_VARS.runtime.theMqSchema = mqSchema
COMMON_TEST_VARS.runtime.schemas.dictionaryMqSchema  = mqSchema;
COMMON_TEST_VARS.runtime.ENDPOINT = '/' + mqSchema.collectionName;

mqSchema.appendRouter(app, oapiDocument)
oapiDocument.merge(mqSchema.oapiDocument);
oapiDocument.merge(MonqadeExpressOapi.oapiMonqadeUniversal());





const fnWmGetOpenAPI = (req,res)=>{

    res.send(
        //mqSchema._makeOapiDoc() // for debugging
        oapiDocument.toJSON()
    )}
let mwDescription = `
    Provides API specification utilizing OAP 3.0 format
`;
const wmGetOAPIDoc = new WebMethodOapi('get','/openapi','openapidoc',  fnWmGetOpenAPI, NO_FIELDS, echoResponse, ' API Spec OAPI compliant ',mwDescription);
oapiDocument.addPath(wmGetOAPIDoc.oapiPath);


app[wmGetOAPIDoc.httpMethod](wmGetOAPIDoc.endpoint, wmGetOAPIDoc.execFn);




if( ! THIS_IS_MODULE ){
    app.listen(port, () => {
        console.log(`Listening to requests on http://localhost:${port}`);
        });
}

module.exports= app;






