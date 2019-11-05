"use strict";
const OAPIComponent = require('./oapi-component-base');

module.exports = class Schema extends OAPIComponent {

    add(name, fields={}){
        this._internalDoc[name] = {
            type: 'object',
            required:  fields.required,
            properties: fields.properties
        }
    }
    addEnum(name, values=[], type=string){
        this._internalDoc[name] = {
            type: 'array',
            items: {type:type,enum:values}
            // required:  fields.required,
            // properties: fields.properties
        }
    }
    addEnvelope(envName,name,fields){
        this._internalDoc[envName] = {
            type: 'object',
            properties:{
                [name]: {
                    type: 'object',
                    required:  fields.required,
                    properties: fields.properties
                }
            }
        }
    }


    addRefEnvelope(envName,name,ref){
        this._internalDoc[envName] = {
            type: 'object',
            properties:{
                [name]: {
                    $ref:ref
                }
            }
        }
    }

    addSchemaRef(schemaName,propName,ref,description){
        this._internalDoc[schemaName] = {
            type:'object',
            description,
            required:  [propName],
            properties: {[propName]:ref} 

        }
    }
    addAlias(aliasName,schemaRef){
        this._internalDoc[aliasName] = {
            $ref: schemaRef
        }
    }

    static makeProperty(name,type,format,description){
        return {
            [name]:{
                type,
                format,
                description
            }
        }
    }
}
