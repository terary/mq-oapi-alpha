"use strict";
const OAPIComponent = require('./oapi-component-base');

module.exports = class Parameters extends OAPIComponent {
    /**
     * 
     * 
     *                  NEVER USED / NEVER TESTED - should be deleted
     * 
     * 
     */


    add(name,type, fields={}){
        this._internalDoc[name] = {
            type,
            fields
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
