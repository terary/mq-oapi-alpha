/* cSpell: ignore oapi */

"use strict";


const express = require('express');
const MonqadeSchema = require('monqade-schema');
const merge = require('lodash.merge');

const {FieldType, FieldTypeCollection, WebMethod }  = require('../web-method/');
const {extractPayloadOrDie, terminateMonqadeError, terminateStandardMonqadeResponse, _handleMonqadeAPIPromise} = require('./monqade-middleware');
const mqMiddleware = require('./monqade-middleware');

const MiddlewareStack = require('../middleware-stack');
 


const mqResponse = {
        '200':{$ref:'#/components/responses/MonqadeResponse'},
        '400':{$ref:'#/components/responses/MonqadeError'}
        };



const wmOpt = {
    enabled:true,
    // path:'/',
    httpMethod:'get',
    endpoint: '/'
}
const defaultOpts = {
    doInsertOne: Object.assign({},wmOpt,{httpMethod:'post'}), 
    doUpdateOne: Object.assign({},wmOpt,{httpMethod:'patch'}), 
    doUpsertOne: Object.assign({},wmOpt,{httpMethod:'post',enabled:false,endpoint:'/doUpsertOne'}), 
    doFindOne: Object.assign({},wmOpt, {endpoint:'/:payload'}),
    doDeleteOne: Object.assign({},wmOpt,{httpMethod:'delete',endpoint:'/:payload'}), 
    doFindMany:  Object.assign({},wmOpt,{endpoint:'/doFindMany/:payload'}),
    doFindManyCount:  Object.assign({},wmOpt,{endpoint:'/doFindManyCount/:payload'}),
    doQueryMany:  Object.assign({},wmOpt,{endpoint:'/doQueryMany/:payload'}),
    doQueryManyCount:  Object.assign({},wmOpt,{endpoint:'/doQueryManyCount/:payload'})
}

module.exports =  class MonqadeExpress extends MonqadeSchema {
    constructor(schemaPaths,schemaOptions,mongooseRef,opts={}){
        super(schemaPaths,schemaOptions,mongooseRef)
        //this._appMount = appMountPoint;
        this._rootEndpoint =  '/' + this.collectionName ;
        //this._rootEndpoint = this._appMount+ '/' + this.collectionName ;

        // this._wmOpts = Object.assign({},defaultOpts,opts) // caution mutations and deep copy ???
        this._wmOpts =merge(defaultOpts,opts) // caution mutations and deep copy ???
        
        this._init();
        // this.extractPayloadOrDie = extractPayloadOrDie;  //debug/dev purposes - *REMOVE*
    }
    get appMountPoint () {return this._rootEndpoint;}
    _init(){
        // class instantiation is expected to be at app start  and not on the fly
        // hence laborious init is justifiable 
        this._initBuildMiddlewareStacks();
        this._initBuildWmFields()
        this._initBuildWmFieldCollections();
        this._initBuildWebMethods();

    }
    get appRootEndpoint(){
        // const rootEndpoint = '/' + this.collectionName ;
        return this._rootEndpoint
    } 
    
    _initBuildMiddlewareStacks(){
        const self =this;
        this._middlewareStacks = {};
        this.getEnabledWebMethods().forEach(methodName=>{
            const doActionOne = function(req,res,undefined,mqSchema){
                self._doActionOne(req,res,methodName)
            }
 
            self._middlewareStacks[methodName] = new MiddlewareStack();
            self._middlewareStacks[methodName].push(  // stack first-in-last-out hence 'push'
                    doActionOne,
                    extractPayloadOrDie 
                );
        })
    }
    getEnabledWebMethods(){
        return Object.entries(this._wmOpts).map( ([wmName, mwOpts])=>{
            if(mwOpts.enabled){
                return wmName;
            }
        }  ).filter(isDefined => isDefined);  // because map will return 'undefined' elements


    }

    _initBuildWmFieldCollections() {
        this._wmFieldCollections = {};

        const tmpUpdateFields = this.monqadePathsToWmFields(this.distinctElements(this.getPathNamesSystem().concat(this.getPathNamesUpdatable())))
        this._wmFieldCollections['updateable'] = new FieldTypeCollection();
        this._wmFieldCollections['updateable'].addFields( ... tmpUpdateFields );

        this._wmFieldCollections['insertable'] = new FieldTypeCollection()
        this._wmFieldCollections['insertable'].addFields( ... this.monqadePathsToWmFields(this.getPathNamesInsertable()));

        this._wmFieldCollections['searchable'] = new FieldTypeCollection()
        this._wmFieldCollections['searchable'].addFields( ... this.monqadePathsToWmFields(this.getPathNamesSearchable()));

        this._wmFieldCollections['system'] = new FieldTypeCollection()
        this._wmFieldCollections['system'].addFields( ... this.monqadePathsToWmFields(this.getPathNamesSystem()));

        this._wmFieldCollections['projectable'] = new FieldTypeCollection()
        this._wmFieldCollections['projectable'].addFields( ... this.monqadePathsToWmFields(this.getPathNamesProjectable()));

    }
    _initBuildWmFields(){

        this._wmFields = {};
        this.getPathNamesAll().forEach( (pathID)=> {
            
            const pOpts = this.getPathOptions(pathID)
            switch(pathID) { // systemPaths - are little special require custom overrides
                case "updatedAt": 
                case "createdAt": 
                    this._wmFields[pathID] = new FieldType(pathID, 'date', pOpts.isRequired);
                break;

                case "_docVersionKey" :
                case "_schemaVersion":
                    this._wmFields[pathID] = new FieldType(pathID, 'string', pOpts.isRequired); 
                break;

                case "_id":
                    const opts = {minLength:40,maxLength:40};
                    this._wmFields[pathID] = new FieldType(pathID, 'string', pOpts.isRequired,opts,opts);
                break;
                default:
                    this._wmFields[pathID] = new FieldType(pathID, pOpts.type.toLowerCase(), pOpts.isRequired);
            }

        });


    }
    monqadePathsToWmFields(pathIDs) {
        return pathIDs.map(pathID => {
            return this._wmFields[pathID]
        });        
    }
    distinctElements( array){
        // not thoroughly tested
        // array.push('_id');
        return [... new Set( array)];

    } 
    getWmFieldsMonqadeMapping(methodName) {
        switch(methodName){
            case 'doUpdateOne':
                return this._wmFieldCollections['updateable'];

            case 'projectable':
                return this._wmFieldCollections['projectable'];
        

            case 'systemPaths':
            case 'doDeleteOne':
            case 'doFindOne':
                return this._wmFieldCollections['system'];
            case 'doInsertOne':
                return  this._wmFieldCollections['insertable'];

            case 'searchable':
            case 'doQueryMany':
                return  this._wmFieldCollections['searchable'];
        
                        
        }
    }
    _initBuildWebMethods(){
        const self = this;
        this._webMethods = {}
        
        this.getEnabledWebMethods().forEach(methodName=>{
            const wmOpt =this._wmOpts[methodName]
            const endpoint = this._rootEndpoint  + wmOpt.endpoint;

            const mwStackWrapper = function(req,res,next){  
                // express-middleware to monqade-middleware conversion - 'next' 
                // function wrapper necessary to preserve  stack context 
                self._middlewareStacks[ methodName].execute(req,res, next, self)
            }
    
            this._webMethods[methodName] = new WebMethod(
                    wmOpt.httpMethod , //httpMethod
                    endpoint,
                    `${this.collectionName}~${methodName}`,  
                    mwStackWrapper,
                    this.getWmFieldsMonqadeMapping(methodName),
                    mqResponse, `${methodName} `,' ${methodName} - need figure out webMethod descriptions'
                );
        });

    }
    _doActionOne(req,res,doAction){
        // package and call base class's do[Action]One(...)
        let thePromise;
        const {candidateDoc,projection,queryOptions, query} = res.locals.monqadePayload



        if(doAction==='doQueryMany' || doAction==='doQueryManyCount'){
            thePromise = this[doAction](query,projection,queryOptions)
        }else {
            thePromise = this[doAction](candidateDoc,projection,queryOptions)
        }


        mqMiddleware.handleMonqadeAPIPromise(req,res,thePromise);
    }
    use(webMethodId, fn){
        console.log(`
            This should accept ...fn
            Also not tested
        `);
        this._middlewareStacks[webMethodId].use(fn)

    }

    makeRouter(){  // not tested
        return this.appendRoutes( express.Router())
    }
    
    appendRouter(app){  // deprecated - test/dev environment need to use appendRoutes
        return this.appendRoutes(app)
    }    
    appendRoutes(app){ // should be appendRoutes (no router)
        //end points are assigned at webMethod creation and therefore fixed.
        app.use(express.json()); // instead of bodyParser
        const self =this;

        this.getEnabledWebMethods().forEach(methodName=>{
            const wm = self.getWebMethods()[methodName];
            app[wm.httpMethod](wm.endpoint, wm.execFn);
        });
        return app; // return not tested - but should be ok?
    }
  
    getWebMethods(){
        return this._webMethods;
    }


  

 }