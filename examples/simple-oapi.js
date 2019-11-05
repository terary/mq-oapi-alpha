"use strict";
const THIS_MODULE = '../index';
const { OapiDocument } = require(THIS_MODULE);

// ~~~~~~~~~~~~~~~ Creates a simple doc ~~~~~~~~~~~~~~
// const { OapiDocument } = require(THIS_MODULE);  done above

const simpleEmpty = new OapiDocument();
console.log('\nSimple empty doc:\n', JSON.stringify(simpleEmpty.toJSON()) + "\n");



// ~~~~~~~~~~~~~~  Create Simple Doc setting some global values 
// ~~~ Will need to dump doc to see all available options - should be inline with OAPI 3.0

// const { OapiDocument } = require(THIS_MODULE);  done above
const init = OapiDocument.getTemplate();
init.servers.push('example.com')
init.info.title ='My Example App '
init.info.version ='3.0.x '
const applicationDoc = new OapiDocument(init);
console.log('\nSome application specific fields set:\n', JSON.stringify(applicationDoc.toJSON()) + "\n");

// ~~~~~~~~~~~~~~~~~~~~~~~ Create Doc with single simple webmethod (endpoint)
const IS_REQUIRED = true;
// const { OapiDocument } = require(THIS_MODULE);  done above
const {  FieldType, FieldTypeCollection, WebMethodOapi } = require('../index.js');


const webMethodOapiDoc = new OapiDocument();

const fields = new FieldTypeCollection();
fields.addFields(new FieldType('parameterName','string', IS_REQUIRED,{description:'Field Description'}))

const wmForeignTime = new WebMethodOapi(
    'get',              // httpMethod
    '/exampleWebMethod',     // endpoint
    'exampleWebMethod',      // operationId (unique within OAPI Doc)
    (req,res)=>{res.send('hello');},   // to be executed upon request
    fields, // inputs
    fields.as200Response(),                 // http response 
    'Summary of function',                  // human readable
    'Longer Description of function'        // human readable
    );

webMethodOapiDoc.addPath(wmForeignTime.oapiPath)

console.log("\nOAPI doc with one webmethod(endpoint):\n",  JSON.stringify(webMethodOapiDoc.toJSON())+"\n");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  Merge documents
// const { OapiDocument } = require(THIS_MODULE);  done above

const docInit = OapiDocument.getTemplate();
docInit.servers.push('example.com')
const serviceOapiDoc = new OapiDocument(docInit);


const functionOapiDoc = new OapiDocument();
functionOapiDoc.responses.add('didGood',{'200':{$ref:'#/components/schemas/Empty'}})

serviceOapiDoc.merge(functionOapiDoc)
console.log("\nMerged documents (notice response components):\n", JSON.stringify(serviceOapiDoc.toJSON()) + "\n");







