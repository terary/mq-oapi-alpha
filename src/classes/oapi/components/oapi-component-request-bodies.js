"use strict";

"use strict";
const OAPIComponent = require('./oapi-component-base');

module.exports = class RequestBodies extends OAPIComponent {

    add(name,schemaRefString){
        this._internalDoc[name] = {
            content:this._content(schemaRefString)
        }
    }
    _content(schemaRefString){
        return {
                'application/json':{
                    schema: {
                        '$ref':schemaRefString
                    }
                }

            }
    }
}
