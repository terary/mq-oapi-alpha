"use strict";


const defaults = {};

const openapiVersion = '3.0.0';
defaults.openapiVersion = openapiVersion;

const info = {
    // bare minimum for passing https://editor.swagger.io/
    title: undefined,           //      string	REQUIRED. The title of the application.
    description: undefined,     //  	string	A short description of the application. CommonMark syntax MAY be used for rich text representation.
    termsOfService: undefined,  //  	string	A URL to the Terms of Service for the API. MUST be in the format of a URL.
    contact: {},                //  	Contact Object	The contact information for the exposed API.
    license: {name:''},         //  	License Object	The license information for the exposed API.
    version: undefined,         //  	string	REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version).
}
defaults.info = info;


const servers = [];
defaults.servers = servers  


const paths = {};
defaults.paths = paths  


// const components = {};
// defaults.components = components  


const security = [];
defaults.security = security;  

const tags = [];
defaults.tags = tags;  

const externalDocs = {};
defaults.externalDocs = externalDocs;  

module.exports = defaults;
