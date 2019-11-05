### MonqadeSchema with OpenAPI

```javascript
'use strict';
const THIS_MODULE = 'goof-oapi-express-mq';
const {MonqadeExpressOapi, WebMethodOapi} = require(THIS_MODULE)


const mqSchemaDef = require('monqade-dev-schemas').dictionary;
const mongoose = require('mongoose');
const CONFIG = require('./config').VARS;
const express = require("express");




// const port = process.env.PORT || "8000";  // applicable only if called as stand-alone server
const port = CONFIG.EXAMPLE_SERVER_PORT ;

const NO_FIELDS  = undefined;


const {oapiDocument} = require('./oapi-app-doc');
const echoResponse = {'200':{$ref:'#/components/schemas/Empty'}};


oapiDocument.servers.push({'url':'http://localhost:' + port})

const app = express();
//app.use(bodyParser.json());
// app.use(express.json()); // instead of bodyParser

const theRouter = express.Router();
app.use(CONFIG.SUB_APP_MOUNT_POINT, theRouter)


const mongConn = mongoose.createConnection(CONFIG.MONGO_CONNECT_STRING, CONFIG.MONGO_CONNECT_OPTIONS);
const mqSchema= new MonqadeExpressOapi(mqSchemaDef.paths, mqSchemaDef.options, mongConn, {doUpsertOne:{enabled:true}});  

mqSchema.appendRouter(theRouter, oapiDocument)
oapiDocument.merge(mqSchema.oapiDocument);
oapiDocument.merge(MonqadeExpressOapi.oapiMonqadeUniversal());


const fnWmGetOpenAPI = (req,res)=>{res.send(oapiDocument.toJSON())}

const wmGetOAPIDoc = new WebMethodOapi(
                                    'get',
                                    '/openapi',
                                    'openapidoc',  
                                    fnWmGetOpenAPI, 
                                    NO_FIELDS, 
                                    echoResponse, 
                                    ' API Spec OAPI compliant ','Description goes here');

oapiDocument.addPath(wmGetOAPIDoc.oapiPath);

app[wmGetOAPIDoc.httpMethod](wmGetOAPIDoc.endpoint, wmGetOAPIDoc.execFn);


app.get('/routes', (req,res) => {
    res.send({allRoutes});
});
const extractRoutes = (routerStack, prepend='')=> {
    return routerStack.map(item => {
        if( ! item.route ) { return undefined; }
        const methods =  Object.entries(item.route.methods).map(([o,i]) => {return o;});
    
        return {path: prepend + item.route.path, methods: methods.join(',')};
    }) 
}
const allRoutes = extractRoutes(theRouter.stack, CONFIG.SUB_APP_MOUNT_POINT)
                .concat(extractRoutes(app._router.stack))
                .filter(x=>x); 



app.listen(port, () => {
    console.log('Available routes:', allRoutes)
    console.log(`Listening to requests on http://localhost:${port}`);
});

```