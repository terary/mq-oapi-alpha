'use strict';

const MODULE_DIR = '../../';  // project root;
const  ThisModule = require(MODULE_DIR);


const {FieldType, FieldTypeCollection, OapiDocument, WebMethod }  = ThisModule;// require('../src/classes/web-method/');

const app_oapi_consts = require('./app-oapi-const')
const init = OapiDocument.getTemplate();


const echoResponse = {'200':{$ref:'#/components/schemas/Empty'}};



const IS_REQUIRED = true ; // 
const webMethods = {};


init.info = app_oapi_consts.info;
init.externalDocs = app_oapi_consts.externalDocs;

init.servers = [{'url':'http://localhost:8000'}];// app_oapi_consts.servers;
init.security = app_oapi_consts.security;
const oapiDocument = new OapiDocument(init);


let mwDescription;

const  myFields = new FieldTypeCollection();
myFields.addFields(new FieldType('fldString','string', IS_REQUIRED));
myFields.addFields(new FieldType('objectId','string', IS_REQUIRED,{maxLength:40,minLength:40,description:'this is my description'}));
myFields.addFields(new FieldType('fldNumber','number', ! IS_REQUIRED, {maximum:10} ));
myFields.addFields(new FieldType('fldBoolean','boolean'));
myFields.addFields(new FieldType('fldDate','date', IS_REQUIRED));


//get in query
mwDescription = `
    path definition holds parameter definitions
    form: example.com/resource?p1=v1&p2=v2...
`;
//const wmQueryGet = new WebMethod('get','/QueryGet','QueryGet', ()=>{}, myFields.asGetParameters(), echoResponse, 'echos the message ',mwDescription);
const wmQueryGet = new WebMethod('get','/QueryGet','QueryGet', ()=>{}, myFields, echoResponse, 'echos the message ',mwDescription);
const p = wmQueryGet.oapiPath
oapiDocument.addPath(wmQueryGet.oapiPath);
webMethods[wmQueryGet.oapiOperationId] = wmQueryGet;

//post in body
mwDescription = `
    request body holds parameter definitions
`;
//const wmReqBodyPost =new WebMethod('post','/wmReqBodyPost','wmReqBodyPost',  ()=>{},myFields.asRequestBody(), echoResponse,'echos the message ',mwDescription);
const wmReqBodyPost =new WebMethod('post','/wmReqBodyPost','wmReqBodyPost',  ()=>{},myFields, echoResponse,'echos the message ',mwDescription);
oapiDocument.addPath(wmReqBodyPost.oapiPath);
webMethods[wmReqBodyPost.oapiOperationId] = wmReqBodyPost;


//post in schema
mwDescription = `
    request body points to schema/inSchema
    schema/inSchema holds parameter definitions
`;
//const wmSchemaPost = new WebMethod('post','/wmSchemaPost','wmSchemaPost', ()=>{},myFields.asRequestBodyRef({$ref:'#/components/schemas/inSchemaPost'}), echoResponse,'echos the message ',mwDescription);
const wmSchemaPost = new WebMethod('post','/wmSchemaPost','wmSchemaPost', ()=>{},myFields, echoResponse,'echos the message ',mwDescription);
oapiDocument.addPath(wmSchemaPost.oapiPathWithParameterRef('#/components/schemas/inSchemaPost'));
oapiDocument.schemas.add('inSchemaPost',myFields.asSchemaParameters());
webMethods[wmSchemaPost.oapiOperationId] = wmSchemaPost;


//post with single complex-model 
mwDescription = `
    body defined by schema/inPayloadPost which in-turn is defined schema/payloadPost 
`
///const wmPost =new WebMethod('post','/inPayloadPost','inPayloadPost', ()=>{},myFields.asRequestBodyRef({$ref:'#/components/schemas/inPayloadPost'}), echoResponse, 'echos the message ',mwDescription);
const wmPost =new WebMethod('post','/inPayloadPost','inPayloadPost', ()=>{},myFields, echoResponse, 'echos the message ',mwDescription);
oapiDocument.addPath(wmPost.oapiPathWithParameterRef('#/components/schemas/inPayloadPost'));
oapiDocument.schemas.addSchemaRef('inPayloadPost','payload',{$ref:'#/components/schemas/payloadPost'});
oapiDocument.schemas.add('payloadPost',myFields.asSchemaParameters());
webMethods[wmPost.oapiOperationId] = wmPost;


//patch with single complex-model 
mwDescription = `
    body defined by schema/inPayloadPost which in-turn is defined schema/payloadPost 
`
//const wmPatch =new  WebMethod('patch','/inPayloadPost','inPayloadPatch',()=>{},myFields.asRequestBodyRef({$ref:'#/components/schemas/inPayloadPost'}), echoResponse, 'echos the message ',mwDescription);
const wmPatch =new  WebMethod('patch','/inPayloadPost','inPayloadPatch',()=>{},myFields, echoResponse, 'echos the message ',mwDescription);
oapiDocument.addPath(wmPatch.oapiPathWithParameterRef('#/components/schemas/inPayloadPost'));
oapiDocument.schemas.addSchemaRef('inPayloadPost','payload',{$ref:'#/components/schemas/payloadPost'});
oapiDocument.schemas.add('payloadPost',myFields.asSchemaParameters());
webMethods[wmPatch.oapiOperationId] = wmPatch;



// get schema reference
mwDescription = `
    I think - example.com/{'actual':'params','go':'here'}
    where actual args are defined in  section schema/PayloadGetMyCollection
`
//const wmGet =new WebMethod('get','/wmGet','wmGet',()=>{}, myFields.asGetSchemaReference('PayloadGetMyCollection',{$ref:'#/components/schemas/PayloadGetMyCollection'}), echoResponse,'echos the message ', mwDescription);
const wmGet =new WebMethod('get','/wmGet','wmGet',()=>{}, myFields, echoResponse,'echos the message ', mwDescription);
oapiDocument.addPath(wmGet.oapiPath);
oapiDocument.schemas.add('PayloadGetMyCollection',myFields.asSchemaParameters());
webMethods[wmGet.oapiOperationId] = wmGet;


// delete schema reference
mwDescription = `
    I think - example.com/{'actual':'params','go':'here'}
    where actual args are defined in  section schema/PayloadGetMyCollection
`
//const wmDelete =new WebMethod('delete','/wmGet','wmDelete', ()=>{}, myFields.asGetSchemaReference('PayloadGetMyCollection',{$ref:'#/components/schemas/PayloadGetMyCollection'}), echoResponse , 'echos the message ', mwDescription);
const wmDelete =new WebMethod('delete','/wmGet','wmDelete', ()=>{}, myFields, echoResponse , 'echos the message ', mwDescription);
oapiDocument.addPath(wmDelete.oapiPath);
webMethods[wmDelete.oapiOperationId] = wmDelete;
//oapiDocument.schemas.add('PayloadGetMyCollection',myFields.asSchemaParameters());


oapiDocument.schemas.add('Empty',);
oapiDocument.schemas.add('MyFields',myFields.asSchemaParameters());
// // oapiDocument.schemas.add('Echo4Request',myFields.asSchemaParameters());

if (require.main === module) {
    // console.log('called directly');
    console.log(JSON.stringify(oapiDocument.toJSON(),undefined,2));

} else {
    module.exports.webMethods = webMethods;
    module.exports.oapiDocument = oapiDocument;
}

