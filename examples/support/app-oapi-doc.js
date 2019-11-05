
'use strict';

const MODULE_DIR = '../../src/classes/'

const OapiDocument = require(  MODULE_DIR + 'oapi/document/')
const app_oapi_consts = require('./app-oapi-const')

const init = OapiDocument.getTemplate();



init.info = app_oapi_consts.info;
init.externalDocs = app_oapi_consts.externalDocs;

init.servers = [{'url':'http://localhost:8000'}];// app_oapi_consts.servers;
init.security = app_oapi_consts.security;
const oapiDocument = new OapiDocument(init);
module.exports.oapiDocument = oapiDocument;



