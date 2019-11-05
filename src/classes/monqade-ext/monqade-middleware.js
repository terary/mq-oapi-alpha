'use strict';

const{ MonqadeError, MonqadeErrorCodes } = require('monqade-shared');

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
 * @param {MonqadeSchema} mqSchema - (*not in use*) The monqade schema associated with this  mini app.
 * @throws {MonqadeError} MonqadeError with code=JsonParseFailure  if payload can not be found
 * @static
 */
const extractPayloadOrDie = (req, res, next)=>{
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
    if(req.params[0]) {  // there seems to be a hiccup with route matching, 
        req.params.payload = req.params[0];
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
            //return next();  
            //return next();  //I think this 'next' belongs outside of try
        }catch(e){
            const mqError = new MonqadeError('JsonParseFailure',`Could not parse json for 'payload'`,e )
            return terminateMonqadeError(req,res,mqError);  //
        }
        return next();  //I think this 'next' belongs outside of try
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
module.exports.handleMonqadeAPIPromise = _handleMonqadeAPIPromise;


/**
 * Sends http status 200 and response for Monqade webMethod
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {MonqadeResponse} mqResponse - response from performing Monqade webMethod
 * @static
 */
const terminateStandardMonqadeResponse  = (req,res,mqResponse)=>{
    res.json({MonqadeResponse:mqResponse});
    res.status(200).end(); 
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
    if(MonqadeErrorCodes[mqError.code]){
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


