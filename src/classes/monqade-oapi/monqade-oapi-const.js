"use strict";


const OapiDocument = require('../oapi/document')
const {FieldType, FieldTypeCollection }  = require('../web-method/');

const IS_REQUIRED= true; // readability only.

const responseSchemaRef = {
     '200':{}, // each should be populated by schema
    '400':{$ref:'#/components/responses/MonqadeError'}
    };

    const countResponse = {
    description:'Standard Monqade response to doFindManyCount or doSearchManyCount',
    content:{
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    isMonqadeResponse:{type:'boolean','description':'Always true'},
                    '_docs':{type:'array', items:{
                        type: 'object',
                        properties:{count:{
                            type:'number'
                        }}
                    }}
                }
            }
        }
    }
}

    // mqOapiUniversalDoc
function document() {

    const oapiDocument = new OapiDocument();


    const monqadeErrorFields =new FieldTypeCollection();
    monqadeErrorFields.addFields( 
            new FieldType('name', 'string', IS_REQUIRED),
            new FieldType('_code', 'string', IS_REQUIRED,{description:'MonqadeErrorCode see: http://...'}),
            new FieldType('_description', 'string', IS_REQUIRED,{description:'Human readable -maybe not UI appropriate.'}),
            new FieldType('isMonqadeError', 'boolean', IS_REQUIRED, {description:'Always true'}), 
            new FieldType('originalError', 'string', ! IS_REQUIRED,{description:'If available original Error - dev/debug purposes'})
        );
    oapiDocument.responses.addEnvelope('MonqadeError','MonqadeError', monqadeErrorFields.asSchemaParameters(), 'Standard Monqade Error')


    const queryOptionFields =new FieldTypeCollection();
    queryOptionFields.addFields( 
            new FieldType('limit', 'number', ! IS_REQUIRED),
            new FieldType('skip', 'number', ! IS_REQUIRED, {description: 'skip + pageSize = limit' }),
        );
    oapiDocument.schemas.add(`MonqadeQueryOptions`, queryOptionFields.asSchemaParameters());


    oapiDocument.responses.add('MonqadeCount',countResponse )
    
    return oapiDocument;

}

const standardMqResponse = (schemaRef, description = 'monqade~generic~response')=>{
    return  {
            description, 
            content: {
                'application/json':{schema:{type: 'object', properties:{
                    isMonqadeResponse:{
                        type:'boolean',
                        description: 'Always true'
                    },
                    _docs:{
                        type: 'array',
                        items: schemaRef
                    }
                }}}
            }
        }
}


module.exports.standardMqResponse = standardMqResponse;
module.exports.document = document;
module.exports.responseSchemaRef = responseSchemaRef;

