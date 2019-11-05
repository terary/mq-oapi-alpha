"use strict";
const OAPISchema = require('../src/classes/oapi/components/oapi-component-schemas')
const YAML = require('json2yaml');
// '/dictionary/:payload':
// get:
//   operationId: dictionary~doFindOne
//   summary: 'doFindOne '
//   description: ' ${methodName} - need figure out webMethod descriptions'
//   parameters:
//     - name: payload
//       in: path
//       required: true
//       schema:
//         type: object
//         properties:
//           payload:
//             type: object
//             properties:
//               candidateDoc:
//                 $ref: '#/components/schemas/dictionary~systemPaths'
//   responses:
//     '200':
//       $ref: '#/components/responses/MonqadeResponse'
//     '400':
//       $ref: '#/components/responses/MonqadeError'
const responses = {'200':{'$ref':'#/components/responses/MonqadeResponse'}};
// ~~~~~~~~~~~~~~~ Get
const parameterRefGet = ( schemaName) => {
    return  {parameters:[
        {name:'payload',in:'path', required:true,  schema:{type:'object', properties:{payload:{type:'object',properties:{candidateDoc:{'$ref': schemaName}}}}}}
    ]};
}
const parametersGet =parameterRefGet('#/components/schemas/dictionary~systemPaths');
const opGet = OAPISchema.Operation('get', '/here','TheOperationIDGet',parametersGet,responses, "Summary",'Description');
// console.log('Op:', opGet);
// console.log( JSON.stringify(opGet, undefined, 2));
console.log( YAML.stringify(opGet, undefined, 2));

//~~~~~~~~~~~~~~~ Post
const parameterRefPost = ( schemaName) => {
    return  {requestBody:
        {content:
            {'application/json':
        {  schema:{type:'object', properties:{payload:{type:'object',properties:{candidateDoc:{'$ref': schemaName}}}}}}
        }
    },
    
};
}
const parametersPost =parameterRefPost('#/components/schemas/dictionary~systemPaths');
const opPost = OAPISchema.Operation('post', '/here','TheOperationIDPost',parametersPost,responses, "Summary",'Description');
// console.log('Op:', opPost);
// console.log( JSON.stringify(opPost, undefined, 2));
console.log( YAML.stringify(opPost, undefined, 2));



