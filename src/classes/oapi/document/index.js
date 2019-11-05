/* cSpell:ignore oapi openapi monqade clonedeep */ 
const RequestBodies = require('../components/oapi-component-request-bodies');
const Schemas = require('../components/oapi-component-schemas');
const Parameters = require('../components/oapi-component-parameters');
const Responses = require('../components/oapi-component-responses');
const YAML = require('json2yaml')
const merge = require('lodash.merge');

const clonedeep = require('lodash.clonedeep')

// const oapiTemplates = require('./templates');
const defaults = require('./default-values');

class OAPIDocumenter{

    constructor(init = {}){
        this._openapiVersion = init.openapiVersion || defaults.openapiVersion;// '3.0.0'
        this._openapiInfo =  init.info || defaults.info;
        this._servers =  init.servers ||defaults.servers;
        this._paths =  init.paths || defaults.paths;
//        this._components = init.components || defaults.components
        this._components = {
            requestBodies: new RequestBodies(),
            schemas: new Schemas(),
            responses: new Responses(),
            parameters: new Parameters()
        }
        // fullInit.components.requestBodies = RequestBodies();// oapiObjectBuilder.RequestBody('Empty','#/components/schemas/Empty')

        this._openapiSecurity =init.security || defaults.security;
        this._tags =  init.tags || defaults.tags;
        if(init.externalDocs){
            // create this property only if exists in init 
            this._openapiExternalDocs =  init.externalDocs ;
        }
 
    }
    get servers() {return this._servers}
    get schemas() { return this._components.schemas}
    get requestBodies() { return this._components.requestBodies}
    get responses() { return this._components.responses}
    get parameters() { return this._components.parameters}

    toYAML() {
        return YAML.stringify(this._toDocumentObject())
    }
    toJSON() {
        return this._toDocumentObject();
    }


    _toDocumentObject(){
        //return clonedeep(defaults);
        const componentsAsObject = {};
        Object.entries(this._components).forEach( ([component,obj]) => {
            componentsAsObject[component] = obj.toObject(); 
        }  )

        const doc =  {
            openapi: this._openapiVersion, // '3.0.0',  // verify version 
            info: clonedeep( this._openapiInfo ) ,
            servers: clonedeep( this._servers) ,
            paths: clonedeep( this._paths ),
            components: componentsAsObject, 
            //components: clonedeep( this._components ),
            security: clonedeep(this._openapiSecurity),
            tags: clonedeep(this._tags)
        };
        
        return doc;

    }


    addPath(path){
        const endpoint = Object.keys(path)[0];
        const httpMethod =  Object.keys(path[endpoint])[0]


        if ( endpoint in this._paths ) {
            this._paths[endpoint][httpMethod] = path[endpoint][httpMethod]  // create httpMethod for endpoint
        } else {
            this._paths = Object.assign({},path,this._paths);  // new endpoint 
        }

    }
    merge(oapiDoc){
        const self=this;

        merge(this._paths, oapiDoc._paths);
        this._components.parameters._merge(oapiDoc._components.parameters); // maybe could get away with:
        this._components.schemas._merge(oapiDoc._components.schemas);       // oapiDoc.schema.toObject() -> not use private
        this._components.requestBodies._merge(oapiDoc._components.requestBodies);// toObject should yield deepcopy
        this._components.responses._merge(oapiDoc._components.responses);



        return this;
    }

    static getTemplate(){
        return clonedeep(defaults);
    }
    
    static response403(){
        return{
            '403':{description:'Unauthorized'}
        }
    }
    static response404(){
        return{
            '404':{description:'Not found'}
        }
    }
    static response200generic(){
        return{
            '200':{description:'success - no return values'}
        }
    } 
    static genericResponses(){
        return Object.assign({},
                    OAPIDocumenter.response200generic(),
                    OAPIDocumenter.response404(), 
                    OAPIDocumenter.response403()            
            );
    }
}

module.exports = OAPIDocumenter;