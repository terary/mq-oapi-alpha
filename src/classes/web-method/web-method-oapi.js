"use strict";

const { WebMethod } = require('./web-method');
const {FieldTypeCollection} = require('./field-type')

class WebMethodOapi extends WebMethod {
//    constructor(){}

    constructor(httpMethod, endpoint, operationId, execFn = ()=>{} ,  // notice monqadeResponsesTemplate, but its not defined anywhere and Mq?
    wmArgs = new FieldTypeCollection([]) ,responses = monqadeResponsesTemplate , summary="", description="") {
    super(httpMethod, endpoint, operationId, execFn,wmArgs,responses,summary, description);
    }

}


module.exports.WebMethodOapi = WebMethodOapi;