'use strict';


const {FieldTypeCollection} = require('./field-type')
//OAPI Path
const PathItem = ( httpMethod, operationObject)=>{
    return {[httpMethod]:operationObject}
}
const Path = ( requestURI, pathItemObject)=>{
    
    return {[requestURI]: pathItemObject}
}



class WebMethod {
    constructor(httpMethod, endpoint, operationId, execFn = ()=>{} ,  // notice monqadeResponsesTemplate, but its not defined anywhere and Mq?
    wmArgs = new FieldTypeCollection([]) ,responses = monqadeResponsesTemplate , summary="", description="") {

        // default post/patch/put  only post/patch tested
        let fieldLocation = 'requestBody';
        let parameters = wmArgs.asRequestBody();

        if(['get','delete'].indexOf(httpMethod.toLowerCase()) != -1 ){
            fieldLocation = 'parameters'
            parameters = wmArgs.asGetParameters();
        }
        
        this._fieldLocation = fieldLocation; 
        this._wmArgs = wmArgs; //FieldTypeCollection
        this._execFn = execFn;
        this._operationId = operationId;
        this._endpoint = endpoint;
        this._httpMethod = httpMethod;
        this._description =description;
        this._summary = summary;
        this._responses = responses;
        this._OAPIOperation = { operationId, summary, description, [fieldLocation]: parameters,responses }; 
        this._oapiPath = this._buildOAPIPath();
    
    }
    get oapiOperationId() {return this._operationId; }
    get oapiPath() { return this._oapiPath; }
    get summary() { return this._summary}
    get description() {return this._description}

    get execFn() {
        // when instanciating webmethod this should be wrapped in function
        // or when calling instance.execFn should be wrapped in function.
        // as a getter it will get the context of instance (webmethod) - which is probably
        // not desired. 
        //

        // function call will get context of webMethod - very strange
        // best to wrap up in it's own function
        // getters can have no paramters 
        // use calle - this._execFn.call(callee,...)
        return this._execFn; //.call(callee,... arguments);
    }
    get endpoint() {return this._endpoint};
    get httpMethod() {return this._httpMethod}
    get fields() { return this._wmArgs}
    
    _buildOAPIPath(){

        const item = PathItem(this._httpMethod, this._OAPIOperation);
        return Path(this._endpoint,item);
    }

    oapiPathWithParameterRef(refString,paramName='payload'){
        // default behaviour define parameters inline with oapi operation
        // this method overrides behaviour by inserting reference to schema in-place of parameters
        //
        //  stupid parameters are deep within  oapi operation definition - easier just to redefine
        
        let parameters = this._wmArgs.asRequestBodyRef({$ref:refString});
        if(['get','delete'].indexOf(this._httpMethod.toLowerCase()) != -1 ){
            parameters = this._wmArgs.asGetSchemaReference(paramName,{$ref:refString});
        }

    

        const op = { 
                operationId: this._operationId, 
                summary: this._summary, 
                description: this._description,
                [this._fieldLocation] : parameters ,
                responses:this._responses 
            }; 
        const item = PathItem(this._httpMethod, op);
        return Path(this._endpoint,item);
    }




    payloadCandidateDocManyEnvelope(candidateDocsRefs,mqQueryOptionRef){
        let docRefs; 
        if (Array.isArray(candidateDocsRefs)){
            docRefs = { 
                allOf: 
                    refs.map(r => {
                    return {$ref: r}
                })
            };
        } else {
            docRefs = {$ref: candidateDocsRefs}
        }

        return {
            schema:{
            type: 'object',
            properties: {
                payload: {
                    type: 'object',
                    properties:{
                        candidateDoc: docRefs,
                        projection: {type:'array', items:{type:'string'}},
                        queryOptions:{$ref: mqQueryOptionRef}         
                        }
                    }
                }
            }
        }    
    }
    payloadCandidateDocEnvelope(refs){
        let docRefs; 
        if (Array.isArray(refs)){
            docRefs = { 
                allOf: 
                    refs.map(r => {
                    return {$ref: r}
                })
            };
        } else {
            docRefs = {$ref: refs}
        }

        return {
            schema:{
            type: 'object',
            properties: {
                payload: {
                    type: 'object',
                    properties:{
                        candidateDoc: docRefs
                                
                        }
                    }
                }
            }
        }    
    }



}
module.exports.WebMethod = WebMethod;
