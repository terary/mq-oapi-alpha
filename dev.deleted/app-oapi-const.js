'use strict';
`
    This represents the app oapi config file.
    Doesn't have to be done like this - just want to keep main code files - less cluttered        
    
`




const info = {
    title: ' My Goof App',
    description: `This app is just for goofing`,
    termsOfService: 'http://example.com/tos',
    contact: {
        "name": "API Support",
        "url": "http://www.example.com/support",
        "email": "support@example.com"
    },
    license: {
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html"  
    },
    version: "1.0.0"
}
module.exports.info = info;


const externalDocs = {
    description: 'Find out more about Swagger',
    url: 'http://swagger.io'
}
module.exports.externalDocs = externalDocs;

const servers = [
    {url: 'http://example.com'},
    {url: 'http://example.com'}
];
module.exports.servers = servers;

const security = [
    {api_key: ["some private key"]}
]
module.exports.security = security;



// init.info = info;
// init.externalDocs = externalDocs;
// init.servers = servers;
// init.security = security;


// const oapiDocument = new OapiDocument(init);
// console.log(oapiDocument.toJSON());

