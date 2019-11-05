"use strict";
const merge = require('lodash.merge');

module.exports = class OASIComponent {
    constructor(){
        this._internalDoc = {};
    }
    add(){throw("'add()' should be defined by subclass")}

    toObject() {
        if(Object.keys(this._internalDoc).length > 0 ){
            return this._internalDoc;
        }
    }

    _merge(src){
        merge(this._internalDoc, src._internalDoc);
    }
    
    static PathItem = ( httpMethod, operationObject)=>{  // should be defined & exported  from OAPI
        return {[httpMethod]:operationObject}
    }
    static Path = ( requestURI, pathItemObject)=>{  // should be defined & exported  from OAPI
        
        return {[requestURI]: pathItemObject}
    }
        // // default post/patch/put  only post/patch tested
        // let fieldLocation = 'requestBody';
        // let parameters = wmArgs.asRequestBody();

        // if(['get','delete'].indexOf(httpMethod.toLowerCase()) != -1 ){
        //     fieldLocation = 'parameters'
        //     parameters = wmArgs.asGetParameters();
        // }

    static Operation = (httpMethod, endpoint, operationId, fieldLocation, responses, summary, description ) => {
        // fieldLocation: 'requestBody' | 'parameters' ....
        //let operationId, summary, description, fieldLocation, method
        let fields, xFields;
        const op = { 
            operationId: operationId, 
            summary: summary, 
            description: description
        }; 

        if(['get','delete'].indexOf(httpMethod) !== -1){
            op['parameters'] = fieldLocation['parameters']

        }else {
            op['requestBody'] = fieldLocation['requestBody']
        }

        op['responses'] = responses;
        // responses:responses 

        const item = OASIComponent.PathItem(httpMethod, op);
        return OASIComponent.Path(endpoint, item);
    }

    // static Path
    // static PathItem
    // static Operation
    //Operation:
    // _oapiMqPayload(fields){
    //     let operationId, summary, description, fieldLocation, method
    //     const op = { 
    //         operationId: this._operationId, 
    //         summary: this._summary, 
    //         description: this._description,
    //         [this._fieldLocation] : fields[this._fieldLocation], 
    //         responses:this._responses 
    //     }; 
    //     const _httpMethod = 'get';
    //     const item = PathItem(_httpMethod, op);
    //     return Path(this._endpoint,item);
    // }

}
