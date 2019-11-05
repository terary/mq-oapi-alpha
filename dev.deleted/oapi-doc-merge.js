'use strict';

const {FieldType, FieldTypeCollection, WebMethod }  = require('../src/classes/web-method/');
const OapiDocument = require('../src/classes/oapi/document/')
const app_oapi_consts = require('./app-oapi-const')
const {webMethods,  oapiDocument } = require('./make-web-methods');
const oapiDocFull =   oapiDocument;
const IS_REQUIRED = true;
const echoResponse = {'200':{$ref:'#/components/schemas/Empty'}};
let wmDescription = 'Testing Merge';

const init = OapiDocument.getTemplate();
init.info = app_oapi_consts.info;
init.info.title = 'Minor Doc';
const oapiDocMinor = new OapiDocument(init);

init.info.title = 'Major Doc';
const oapiDocMajor = new OapiDocument(init);








const  myFields = new FieldTypeCollection();
myFields.addFields(new FieldType('fldStringM','string', IS_REQUIRED));
myFields.addFields(new FieldType('objectIdM','string', IS_REQUIRED,{maxLength:40,minLength:40,description:'this is my description'}));
myFields.addFields(new FieldType('fldNumberM','number', ! IS_REQUIRED, {maximum:10} ));
myFields.addFields(new FieldType('fldBooleanM','boolean'));
myFields.addFields(new FieldType('fldDateM','date', IS_REQUIRED));

wmDescription = 'Simple get origin: minor'
const wmSimpleGetMinor = new WebMethod('get','/QueryGetMinor','QueryGetMinor', ()=>{}, myFields.asGetParameters(), echoResponse, 'Simple get minor',wmDescription);
oapiDocMinor.addPath(wmSimpleGetMinor.oapiPath);


wmDescription = 'Simple get origin: major'
const wmSimpleGetMajor = new WebMethod('get','/QueryGetMajor','QueryGetMajor', ()=>{}, myFields.asGetParameters(), echoResponse, 'Simple get major',wmDescription);
oapiDocMajor.addPath(wmSimpleGetMajor.oapiPath);

wmDescription = `minor contributes get`
const wmBothDiffHttpMethodGet = new WebMethod('get','/BothDiffHttpMethod','BothDiffHttpMethodGet', ()=>{}, myFields.asGetParameters(), echoResponse, 'both contribute',wmDescription);
oapiDocMinor.addPath(wmBothDiffHttpMethodGet.oapiPath);

wmDescription = `major contributes post`
const wmBothDiffHttpMethodPost = new WebMethod('post','/BothDiffHttpMethod','BothDiffHttpMethodPost', ()=>{}, myFields.asRequestBody(), echoResponse, 'both contribute',wmDescription);
oapiDocMajor.addPath(wmBothDiffHttpMethodPost.oapiPath);



wmDescription = `major contributes post -- major wins`
const wmConflictMajor = new WebMethod('post','/conflict','conflict', ()=>{}, myFields.asRequestBody(), echoResponse, 'conflict Major',wmDescription);

oapiDocMajor.addPath(wmConflictMajor.oapiPath);

wmDescription = `minor contributes post -- minor wins??`
const wmConflictMinor = new WebMethod('post','/conflict','conflict', ()=>{}, myFields.asRequestBody(), echoResponse, 'conflict Minor',wmDescription);
oapiDocMinor.addPath(wmConflictMinor.oapiPath);

// const wmQueryGetBothA = new WebMethod('get','/QueryGetBoth','QueryGetMini', ()=>{}, myFields.asGetParameters(), echoResponse, 'Both - mini ',wmDescription);
// oapiDocumentMini.addPath(wmQueryGetBothA.oapiPath);

// const wmQueryGetBothB = new WebMethod('get','/QueryGetBoth','QueryGetMini', ()=>{}, myFields.asGetParameters(), echoResponse, 'Both - parent ',wmDescription);
// oapiDocument.addPath( wmQueryGetBothB.oapiPath);

// const wmQueryGetParent = new WebMethod('get','/QueryGetParent','QueryGetMini', ()=>{}, myFields.asGetParameters(), echoResponse, 'echos the message ',wmDescription);
// oapiDocument.addPath(wmQueryGetParent.oapiPath);



// console.log('******************************')
// console.log( oapiDocumentMini.toJSON());
// console.log('******************************')

wmDescription = `minor added before merge`
const wmPreMerge = new WebMethod('post','/premerge','premerge', ()=>{}, myFields.asRequestBody(), echoResponse, 'added pre merge',wmDescription);
oapiDocMinor.addPath(wmPreMerge.oapiPath);


oapiDocMajor.merge(oapiDocMinor)

oapiDocMajor.merge(oapiDocFull)


wmDescription = `minor added after merge`
const wmPostMerge = new WebMethod('post','/postmerge','postmerge', ()=>{}, myFields.asGetParameters(), echoResponse, 'added post merge',wmDescription);
oapiDocMinor.addPath(wmPostMerge.oapiPath);


//console.log( JSON.stringify(oapiDocMajor._paths,undefined,2));

//console.log( JSON.stringify(oapiDocMajor.toJSON(),undefined,2));
console.log(JSON.stringify(oapiDocMajor.toJSON(),undefined,2));
// console.log(JSON.stringify(oapiDocFull.toJSON(),undefined,2));



//console.log(oapiDocMajor.toJSON());



