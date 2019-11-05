
/* cSpell:ignore oapi */
const OAPIDocument  = require('../src/classes/OAPIDocumenter');
const oapiTemplates = require('../src/classes/OAPIDocumenter/templates');
const oapiObjectBuilder = oapiTemplates.objectBuilders;

const fullInit = {};
fullInit.info = {
    title : 'The App Title',
    version : '0.1.x',
    description : 'Longer description of the Application goes here',
    termsOfService : 'http://example.com/tos.html',
    contact : oapiObjectBuilder.Contact('App Support','http://support.example.com','support@example.com'),
    license : oapiObjectBuilder.License('MIT License','http://themitlicense.com/')
}
fullInit.servers = [oapiObjectBuilder.Server('http://example.com','The dev server')]
fullInit.security = oapiObjectBuilder.SecurityRequirement('k1','k2');
fullInit.tags = [
    oapiObjectBuilder.Tag('name1',`A Tag name with '1' in it`),
    oapiObjectBuilder.Tag('nameB',`A Tag name with 'B' in it`)
];
fullInit.externalDocs = oapiObjectBuilder.ExternalDoc(`General support pages`, 'http://support.example.com');

minInit = {}
minInit.info = {  // miniInit works except minor issue with external docs - need to remove reference to externalDocs if undefined (in OAPIDocument(...))
    title : 'The App Title',
    version : '0.1.x'
  }


const oapiDocumenter = new OAPIDocument(fullInit);
// const oapiDocumenter = new OAPIDocument(minInit);
module.exports.oapiDocumenter  = oapiDocumenter;