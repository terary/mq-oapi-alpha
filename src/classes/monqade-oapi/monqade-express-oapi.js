"use strict";


/* cSpell: ignore oapi monqade */

const merge = require('lodash.merge');

const MonqadeExpress = require('../monqade-ext/monqade-express');
const OapiDocument = require('../oapi/document')
const {FieldType, FieldTypeCollection }  = require('../web-method/');

const OAPIOperation = require('../oapi').OAPIOperation;
const collectionsInstantiated = new Set()
const mqOapiConst = require('./monqade-oapi-const');


module.exports =  class MonqadeExpressOapi extends MonqadeExpress {
    constructor(schemaPaths,schemaOptions,mongooseRef,opts,appMount=''){
        super(schemaPaths,schemaOptions,mongooseRef, opts,appMount)

        collectionsInstantiated.add(this.collectionName);


        this._oapiDocument = undefined; 
        this._fieldsAll = undefined ; // will be FieldTypeCollection
        this._responseSchemaRef = merge({},mqOapiConst.responseSchemaRef );
        this._responseCountOp = merge({},mqOapiConst.responseSchemaRef );
        this._responseQueryMany = merge({},mqOapiConst.responseSchemaRef );

        this._responseSchemaRef['200']['$ref'] = '#/components/responses/' + this.collectionName + '~documents';
        this._responseCountOp['200']['$ref'] = '#/components/responses/MonqadeCount';
        this._responseQueryMany['200']['$ref'] = '#/components/responses/' + this.collectionName + '~queryMany';


    }
    get oapiDocument() {return this._makeOapiDoc();}

    OAPISchemaPathsSystem(){
        return this.getWmFieldsMonqadeMapping('systemPaths').asSchemaParameters();
    }

    OAPISchemaPathsSearchable(){
        return this.getWmFieldsMonqadeMapping('searchable').asSchemaParameters();
    }
    OAPISchemaPathsInsertable(){
        return this.getWmFieldsMonqadeMapping('doInsertOne').asSchemaParameters();
    }
    OAPISchemaPathsUpdatable(){
        return this.getWmFieldsMonqadeMapping('doUpdateOne').asSchemaParameters();
    }
    OAPISchemaPathsProjectable(){
        return this.getWmFieldsMonqadeMapping('projectable').asSchemaParameters();
    }
    

    OAPISchemaPathsAll(){
        // all fields are special case - don't get categorized
        const fields =new FieldTypeCollection();  
        fields.addFields( ... [... new Set( this.getPathNamesAll())]
        .map(pathID => {
            return this._wmFields[pathID]
        }));
        return fields.asSchemaParameters();
    }

    _makeOapiDoc(){
        const schemaRef ='#/components/schemas'     
        this._oapiDocument = new OapiDocument();

        this.getEnabledWebMethods().forEach(methodName=>{
            let oapiParameterObject;
            const webMethod = this.getWebMethods()[methodName];
            let responseSchemaRef =this._responseSchemaRef
    

            switch(methodName){
                case "doDeleteOne":
                case "doFindOne":
                    oapiParameterObject =this._getParametersPayloadEnvelope({$ref:`${schemaRef}/${this.collectionName}~systemPaths`});
                    break;

                case "doUpdateOne":
                    this._oapiDocument.schemas.add(`${this.collectionName}~updatablePaths`, this.OAPISchemaPathsUpdatable());
                    oapiParameterObject =this._poseParametersPayloadEnvelope(
                                {
                                    allOf:[
                                        {$ref:`${schemaRef}/${this.collectionName}~systemPaths`},
                                        {$ref:`${schemaRef}/${this.collectionName}~updatablePaths`}
                                    ]
                                });
                    break;

                case "doInsertOne":
                    this._oapiDocument.schemas.add(`${this.collectionName}~insertablePaths`, this.OAPISchemaPathsInsertable());
                    oapiParameterObject =this._poseParametersPayloadEnvelope({$ref:`${schemaRef}/${this.collectionName}~insertablePaths`});
                    break;
                    
                    
                case "doUpsertOne":
                    oapiParameterObject =this._poseParametersPayloadEnvelope({$ref:`${schemaRef}/${this.collectionName}~document`});
                    break;

                case "doFindManyCount":
                    responseSchemaRef =this._responseCountOp
                case "doFindMany":
                    oapiParameterObject =this._getParametersPayloadEnvelope(
                            {$ref:`${schemaRef}/${this.collectionName}~document`},
                            {$ref: `${schemaRef}/${this.collectionName}~projectablePathNames` }, 
                            {$ref: `${schemaRef}/MonqadeQueryOptions`}
                        );
                    break;

                case "doQueryManyCount":
                    responseSchemaRef =this._responseCountOp
                case "doQueryMany":
                    responseSchemaRef = (responseSchemaRef === this._responseCountOp) ?this._responseCountOp : this._responseQueryMany; // intentional reset
                    this._oapiDocument.schemas.add(`${this.collectionName}~searchablePaths`, this.OAPISchemaPathsSearchable());
                    oapiParameterObject =this._getParametersPayloadEnvelope(
                            {$ref:`${schemaRef}/${this.collectionName}~searchablePaths`},
                            {$ref: `${schemaRef}/dictionary~projectablePathNames` }, 
                            {$ref: `${schemaRef}/MonqadeQueryOptions`}
                        );
                    break;
                default:
                    // should be now default cases
            }

            this._oapiDocument.addPath(this.oapiPathFromWebMethod(webMethod,oapiParameterObject, responseSchemaRef));
  
        })

        // OAPI schema specific to this document collection - few others conditionally determined if webMethod is enabled 
        const documentSchema = this.OAPISchemaPathsAll();
        documentSchema.required = [];  // or general purposes no fields will be required for this schema 
        this._oapiDocument.schemas.add(`${this.collectionName}~document`, documentSchema);

        this._oapiDocument.schemas.add(`${this.collectionName}~systemPaths`, this.OAPISchemaPathsSystem());
        this._oapiDocument.schemas.add(`${this.collectionName}~queryOptions`, this.OAPISchemaPathsSearchable());
        this._oapiDocument.schemas.add(`${this.collectionName}~projectablePaths`, this.OAPISchemaPathsProjectable());
        this._oapiDocument.schemas.addEnum(`${this.collectionName}~projectablePathNames`, this.getPathNamesProjectable(), 'string');



        //responses specific to this MonqadeAPI - few others conditionally determined if webMethod is enabled 
        const mqStandardResponse =mqOapiConst.standardMqResponse( 
            {$ref:`${schemaRef}/${this.collectionName}~document`},
            'Generic response used for all operations except: doSearchMany, doSearchManyCount, or doFindManyCount '
        ); 
        this._oapiDocument.responses.addRefTo(`${this.collectionName}~documents`,mqStandardResponse);  
        
        const mqQueryManyResponse =mqOapiConst.standardMqResponse( 
            {$ref:`${schemaRef}/${this.collectionName}~projectablePaths`},
            'Response should contain documents with only projectable paths/fields. '
        ); 
        this._oapiDocument.responses.addRefTo(`${this.collectionName}~queryMany`, mqQueryManyResponse);
   


        return this._oapiDocument;
    }


    static oapiMonqadeUniversal() {
         return mqOapiConst.document();
    }

    _poseParametersPayloadEnvelope(schemaRef){
        return  {requestBody:
            {content:
                    {'application/json':
                {  schema:{type:'object', properties:{payload:{type:'object',properties:{candidateDoc:schemaRef}}}}}
                }
            },
        
        };
    }

    /** schemaRef should be in the form: {$ref:'...' }*/
    _getParametersPayloadEnvelope( candidateDoc, projection, queryOptions){
        return  {
            parameters:[
                {name:'payload',in:'path', required:true,  schema:{type:'object', properties:{payload:{type:'object',properties:
                {
                    candidateDoc,
                    projection,
                    queryOptions 
                }
            }}}}
        ]};
    }

    oapiPathFromWebMethod(webMethod, parametersGet, responseSchemaRef =this._responseSchemaRef){
        return OAPIOperation(
            webMethod.httpMethod,
            webMethod.endpoint,
            webMethod.oapiOperationId,
            parametersGet,
            responseSchemaRef , 
            webMethod.summary, 
            webMethod.description);
    }


 }