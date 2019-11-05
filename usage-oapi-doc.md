 ### Create Simple OAPI document

```javascript
const { OapiDocument } = require("monqade-express-oapi");

const simpleEmpty = new OapiDocument();
console.log('\nSimple empty doc:\n', JSON.stringify(simpleEmpty.toJSON()) + "\n");
```


 ### Create Simple document with app information
```javascript
// ~~~ Will need to dump doc to see all available options - should be consistent with OAPI 3.0

const { OapiDocument } = require("monqade-express-oapi");
const init = OapiDocument.getTemplate();
init.servers.push('example.com')
init.info.title ='My Example App '
init.info.version ='3.0.x '
const applicationDoc = new OapiDocument(init);
console.log('\nSome application specific fields set:\n', JSON.stringify(applicationDoc.toJSON()) + "\n");
```
###  Create Doc with simple WebMethod
```javascript
const { OapiDocument,   FieldType, FieldTypeCollection, WebMethodOapi  } = require("monqade-express-oapi");
const IS_REQUIRED = true;

const webMethodOapiDoc = new OapiDocument();

const fields = new FieldTypeCollection();
fields.addFields(
		new FieldType(
			'parameterName',
			'string',
			IS_REQUIRED,
			{description:'Field Description'}));

const wmForeignTime = new WebMethodOapi(
    'get',              // httpMethod
    '/exampleWebMethod',     // endpoint
    'exampleWebMethod',      // operationId (unique within OAPI Doc)
    (req,res)=>{res.send('hello');},   // to be executed upon request
    fields, // inputs
    fields.as200Response(),                 // http response 
    'Summary of function',                  // human readable
    'Longer Description of function'        // human readable
    );

webMethodOapiDoc.addPath(wmForeignTime.oapiPath)

console.log("\nOAPI doc with one webmethod(endpoint):\n",  JSON.stringify(webMethodOapiDoc.toJSON())+"\n");
```

### Merge OAPI Documents
```javascript
const { OapiDocument,   FieldType, FieldTypeCollection, WebMethodOapi  } = require("monqade-express-oapi");

const docInit = OapiDocument.getTemplate();
docInit.servers.push('example.com')
const serviceOapiDoc = new OapiDocument(docInit);


const functionOapiDoc = new OapiDocument();
functionOapiDoc.responses.add('didGood',{'200':{$ref:'#/components/schemas/Empty'}})

serviceOapiDoc.merge(functionOapiDoc)
console.log("\nMerged documents (notice response components):\n", JSON.stringify(serviceOapiDoc.toJSON()) + "\n");
```

[Oapi Document usage](./usage-oapi-doc.md)
[Read Me](./README.md)
