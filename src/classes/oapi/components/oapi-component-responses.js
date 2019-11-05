"use strict";
const OAPIComponent = require('./oapi-component-base');


const monqadeResponses = {
    '200':{
        // description: "MonqadeResponse",
        '$ref':'#/components/schemas/Empty'
    },
    '400':{
        // description: "MonqadeError",
        '$ref':'#/components/schemas/Empty'
    },
    '403':{
        // description: "Unauthorized.  Possibly WebMethod disabled",
        '$ref':'#/components/schemas/Empty'
    },
    '404':{
        // description: "Not found",
        '$ref':'#/components/schemas/Empty'
    }
}



module.exports = class Responses extends OAPIComponent {
    constructor(){
        super();
        this._internalDoc = {};// Object.assign({},monqadeResponses);
    }
    addRefTo(name,responseObject){
        this._internalDoc[name] = responseObject
    }
    add(name,responseObject){
        this._internalDoc[name] = responseObject
    }
    // const mqErrorEnvelope = {
    //     description: ' Standard Monqade Response',
    //     content:{
    //         'application/json': {
    //             schema:{
    //                 properties: {
    //                     MonqadeError: monqadeErrorFields.asSchemaParameters()
    //                 }
    //             }                
    //         }
    //     }
    // }

    addEnvelope(envName,name,fields,description=''){
        this._internalDoc[envName] = {
            description,
            content:{
                'application/json': {
                    schema:{
                        properties: {
                            [name]: fields
                        }
                    }                
                }
            }
    
        }
    }
}
