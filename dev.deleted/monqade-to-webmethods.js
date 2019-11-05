'use strict';

const {FieldType, FieldTypeCollection, WebMethod }  = require('../src/classes/web-method/');


const dictSchemaDef = require('monqade-dev-schemas').dictionary;
const MonqadeSchema = require('monqade-schema');
let mqSchema;
const mqResponse = {'200':{$ref:'#/components/schemas/Empty'}};


const mqPathsToWmFields_monkeyPunch = (mqSchema) => {
    const fields = new FieldTypeCollection();
    mqSchema.wmFields = {};

    const f= mqSchema.getPathNamesAll().forEach( (pathID)=> {
        
        const pOpts = mqSchema.getPathOptions(pathID)
        if(['createdAt','updatedAt'].indexOf(pathID) > -1) {
            const type = 'date'
            mqSchema.wmFields[pathID] = new FieldType(pathID, type, pOpts.isRequired);
            
        }else if(['_docVersionKey','_schemaVersion'].indexOf(pathID) > -1) {
            mqSchema.wmFields[pathID] = new FieldType(pathID, 'string', pOpts.isRequired);
            
        }else if (pathID == '_id'){
            const opts = {minLength:40,maxLength:40};
            const type = 'string'
            mqSchema.wmFields[pathID] = new FieldType(pathID, type, pOpts.isRequired,opts,opts);
        }else {
            mqSchema.wmFields[pathID] = new FieldType(pathID, pOpts.type.toLowerCase(), pOpts.isRequired);
        } //
    });
}



// ********************************************************
/**
 * Assures payload will be in 'res.local.monqadePayload'. Regardless of http method (GET, POST, PATCH, etc) 
 * 
 * * Will write res.local.monqadePayload only if  res.local.monqadePayload is undefined
 * * Safe to be added to middleware stack many times
 * * Creating res.local.monqadePayload outside of this middleware will cause this middleware to have no effect. 
 * 
 * Basically, the write once feature allows this middleware to be added earlier in the middleware stack 
 * to accommodate other middleware that will require the payload.
 * 
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Function} next - from caller
 * @param {MonqadeSchema} mqSchema - The monqade schema associated with this  mini app.
 * @throws {MonqadeError} MonqadeError with code=JsonParseFailure  if payload can not be found
 * @static
 */
const extractPayloadOrDie = (req, res, next, mqSchema  )=>{
    if(res.locals.monqadePayload !== undefined){
        next(); // Do this once.  Safe to call middleware many times.
    }

    const payloadTemplate = {payload: {
        candidateDoc:undefined,  // only can be simple {key1:val1,key2:val2,...}
        projection:undefined, 
        queryOptions:undefined, 
        query:undefined   // can be complex: {pathID:[{$lt:high_val},{$gt:low_val}]}
    }};

    if(req.body.payload){

        res.locals.monqadePayload =  Object.assign({},payloadTemplate.payload,req.body.payload); 
        //req.monqadePayload =  Object.assign({},payloadTemplate.payload,req.body.payload); 
        return next();
    }
    if(req.params.payload){
        try{  // try to catch JSON.parse issues, and not payload issues
            const pload = JSON.parse(req.params.payload);
            if(pload.payload){
                //req.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload.payload); 
                res.locals.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload.payload); 
            } else {
                // req.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload); 
                res.locals.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload); 

            }
            return next();
        }catch(e){
            const mqError = new MonqadeError('JsonParseFailure',`Could not parse json for 'payload'`,e )
            return terminateMonqadeError(req,res,mqError);  //
        }
    }

    const mqError = new MonqadeError('NoPayloadFound',`Could not extract payload from either GET string or request body` )
    terminateMonqadeError(req,res,mqError);
}
module.exports.extractPayloadOrDie = extractPayloadOrDie;

/**
 * Specialized middleware - terminates by sending appropriate response. No next()
 * @private
 * @param {Object} req - request from express
 * @param {object} res - response for express
 * @param {Promise} apiCallPromise - returned from a Monqade function call
 * @returns {void}
 */
const _handleMonqadeAPIPromise = (req, res, apiCallPromise)=>{
    apiCallPromise
    .then(mqResponse=>{
        terminateStandardMonqadeResponse(req,res,mqResponse);
    }).catch(mqError=>{
        //todo: does the 'unknown' error work? 
        //- I think it may work because terminate throws error
        //todo: test this to see that it works as expected
        terminateMonqadeError(req,res,mqError);
    }).catch(unknownError=>{
        terminateUnknownError500(req,res,unknownError); 
    });

}
/**
 * Sends http status 200 and response for Monqade webMethod
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {MonqadeResponse} mqResponse - response from performing Monqade webMethod
 * @static
 */
const terminateStandardMonqadeResponse  = (req,res,mqResponse)=>{
    res.json({MonqadeResponse:mqResponse}); 
}


/**
 * If MonqadeError - sends http status 400 and error- re-throw otherwise
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Error} mqError - error from performing Monqade webMethod
 * @throws {Error} - If Error paramter is not an Monqade error, will be re-thrown   
 * @static
 */
const terminateMonqadeError= (req,res,mqError) => {
    if(MonqadeShared.MonqadeErrorCodes[mqError.code]){
        res.status(400).json({MonqadeError:mqError});
    }else {
        throw(mqError); 
    }
}

/**
 * Sends http status 500 and error
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Error} unknownError - general error
 * @static
 */
const terminateUnknownError500 = (req,res,unknownError) => {
    //debug
    res.status(500).send({error:unknownError});

}

// ********************************************************



const doInsertOne = (req,res)=>{
    extractPayloadOrDie(req,res); /// should be middleware
    

    const canididateDoc = res.locals.monqadePayload // fetch from request
    const thePromise = mqSchemaDict.doInsertOne(canididateDoc)
    _handleMonqadeAPIPromise(req,res,thePromise);

    // mqSchemaDict.doInsertOne()
    //     .then(r=>{
    //     }).catch(e=>{
    //     })
}

module.exports = (function(mongooseRef){
    const mqSchemaDict = new MonqadeSchema(dictSchemaDef.paths,dictSchemaDef.options,mongooseRef);
    const webMethods = {};
    mqPathsToWmFields_monkeyPunch(mqSchemaDict);
    const fields =new FieldTypeCollection();
    fields.addFields( ... [... new Set( mqSchemaDict.getPathNamesInsertable())]
                                    .map(pathID => {
                                        return mqSchemaDict.wmFields[pathID]
                                    }));

    // const fields= [new Set(mqSchemaDict.getPathNamesInsertable().concat(mqSchemaDict.getPathNamesSystem()))].map(pathID=>{
    //     mqSchemaDict.wmFields[pathID]
    // })
    // need to build function - mqPaths to fields (all)
    // then send to webMethod insertables

    // const wmGetOAPIDoc = new WebMethod('get','/openapi','openapidoc',  fnWmGetOpenAPI, 'echos the message ',mwDescription,[], echoResponse);
    const mwDescription = ' Insert Single Record';
    webMethods['doInsertOne'] = new WebMethod('post','/','doInsertOne',  doInsertOne, 'doInsertOne ',mwDescription,fields.asRequestBody(), mqResponse);

    return {
        webMethods: webMethods 
    }
});

