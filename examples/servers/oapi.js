'use strict';

let readme = `
    Function API to demonstrate different functionalities of OAP Document.
    -serverTime - echos server's time
    -foreignTime - gives current time in a specific timezone. 

    Other funtionality only demonstrate OAPIDoc + WebMethod features

`;


const port = process.env.PORT || "8000";
const THIS_IS_MODULE = require.main === module;
const MODULE_DIR = '../../';  // project root;
const  ThisModule = require(MODULE_DIR);


const express = require("express");
const morgan = require('morgan')
const app = express();

app.use(express.json()); // instead of bodyParser


const OapiDocument = ThisModule.OapiDocument;// require(MODULE_DIR +'oapi/document/')
const {FieldType, FieldTypeCollection, WebMethodOapi }  = ThisModule ;//require(MODULE_DIR +'web-method/');

const {webMethods, oapiDocument, } = require('../support/make-web-methods');
const echoResponse = {'200':{$ref:'#/components/schemas/Empty'}};


const fnWmGetOpenAPI = (req,res)=>{res.send(
    oapiDocument.toJSON()
    )}
let mwDescription = `
    path definition holds parameter definitions
    form: example.com/resource?p1=v1&p2=v2...
`;
const wmGetOAPIDoc = new WebMethodOapi('get','/openapi','openapidoc',  fnWmGetOpenAPI,undefined, echoResponse, 'echos the message ',mwDescription);
oapiDocument.addPath(wmGetOAPIDoc.oapiPath);
webMethods[wmGetOAPIDoc.oapiOperationId] = wmGetOAPIDoc;
app[wmGetOAPIDoc.httpMethod](wmGetOAPIDoc.endpoint, wmGetOAPIDoc.execFn);



//example: 
//      adding a non Monqade function, oapiDoc+express
const fnServerTime = function(req,res){res.send({serverTime:new Date()})}
const wmServerTime = new WebMethodOapi('get','/serverTime','serverTime',fnServerTime,undefined, OapiDocument.genericResponses(),'summary','desc')
oapiDocument.addPath(wmServerTime.oapiPath)
app[wmServerTime.httpMethod](wmServerTime.endpoint,wmServerTime.execFn);

app.use(function(req,res,next){
    next();
});
//example: 
//      adding a non Monqade function with parameters, oapiDoc+express
addForeignTimeEndpoint(app,oapiDocument);  // adds via side-effect, outside of convents - but want to keep things concise








const extractRoutes = (routerStack, prepend='')=> {
    return routerStack.map(item => {
        if( ! item.route ) { return undefined; }
        const methods =  Object.entries(item.route.methods).map(([o,i]) => {return o;});
    
        return {path: prepend + item.route.path, methods: methods.join(',')};
    }) 
}
const allRoutes = extractRoutes(app._router.stack).filter(x=>x); 

if( THIS_IS_MODULE ){
    console.log('Available Routes:', allRoutes)
    app.listen(port, () => {
        console.log(`Listening to requests on http://localhost:${port}`);
        });
}
                




function addForeignTimeEndpoint(app,oapiDoc){
    // Example:
    //      create endpoint (webMethod) describing input and output parameters
    //      document and add express route 

    const fnDescription = 'valid IANA timezone (https://www.iana.org/time-zones) (https://gist.github.com/aviflax/a4093965be1cd008f172)'
    const tzDescription = 'valid IANA timezone'
    const fnSummary = 'Return current time of the given timezone';
    const IS_REQUIRED = true;

    const responseFields = new FieldTypeCollection();
    responseFields.addFields(new FieldType('timezone','string'),new FieldType('currentTime','date'))

    const oapiResponseObject =     Object.assign({},OapiDocument.genericResponses(),responseFields.as200Response());
    const  fnParameters = new FieldTypeCollection();
    fnParameters.addFields(new FieldType('timezone','string', IS_REQUIRED,{description:tzDescription}));

    
    const fnGetForeignTime = function(req,res){
        const tz = req.query.timezone || "Australia/Brisbane";
        const timeString = new Date().toLocaleString("en-US", {timeZone: tz});
        const aestTime = new Date(timeString); 
        res.send({currentTime:timeString, timezone:tz})
    }


    const wmForeignTime = new WebMethodOapi(
                                        'get',              // httpMethod
                                        '/foreignTime',     // endpoint
                                        'foreignTime',      // operationId (unique within OAPI Doc)
                                        fnGetForeignTime,   // to be executed upon request
                                        fnParameters, // inputs
                                        oapiResponseObject,  // outputs
                                        fnSummary,          // human readable
                                        fnDescription      // human readable
                                        );

    oapiDocument.addPath(wmForeignTime.oapiPath)
    app[wmForeignTime.httpMethod](wmForeignTime.endpoint, wmForeignTime.execFn);

}

module.exports= app;
