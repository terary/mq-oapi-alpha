

const MonqadeExpressOapi = require('./src/classes/monqade-oapi/monqade-express-oapi')
const { WebMethodOapi, WebMethod, FieldType, FieldTypeCollection }  = require( './src/classes/web-method/');

const OapiDocument = require('./src/classes/oapi/document/')

module.exports = {
    MonqadeExpressOapi,
    WebMethod,
    WebMethodOapi,
    OapiDocument,
    FieldType, 
    FieldTypeCollection
}