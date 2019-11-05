### Simple server using MonqadeExpress to map endpoints and do crud operations

```javascript

'use strict';
const THIS_MODULE = 'goof-oapi-express-mq';
const {MonqadeExpressOapi, WebMethodOapi} = require(THIS_MODULE)

const mqSchemaDef = require('monqade-dev-schemas').dictionary;
const mongoose = require('mongoose');
const express = require('express');

const CONFIG = require('./config').VARS;
const port = CONFIG.EXAMPLE_SERVER_PORT ;
const app = express();


const theRouter = express.Router();
app.use(CONFIG.SUB_APP_MOUNT_POINT, theRouter)


const mongConn = mongoose.createConnection(CONFIG.MONGO_CONNECT_STRING, CONFIG.MONGO_CONNECT_OPTIONS);
const mqSchema= new MonqadeExpressOapi(mqSchemaDef.paths, mqSchemaDef.options, mongConn);  

// mqSchema.appendRouter(theRouter, oapiDocument)
mqSchema.appendRouter(theRouter)

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