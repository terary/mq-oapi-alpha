
class FieldType {
    constructor(name, type, required=false,schemaOpts={}, paramOpts={}){
        this._name = name;
        this._type = type;
        this._required = required;
        this._schema = Object.assign({},{type}, schemaOpts);
    }
    get name() {return this._name}
    get type() {return this._type}
    get required() {return this._required}
    asNotRequired(){
        
    }
    asGetParameter(inLocation ='query') {

        const p= {
            name:this._name,
            in: inLocation,
            required: this.required,
            schema: this._schema
         }
        if(this._type === 'date'){
            p.schema.type='string';
            p.schema.format ='date-time';

        }        
        return p;
    }
    asSchemaParameter(){
        const p =this._schema
        if(this._type === 'date'){
            p.type='string';
            p.format ='date-time';

        }        
        return p;

    }

}
module.exports.FieldType = FieldType;
//templates.FieldType = FieldType;

class FieldTypeCollection {
    constructor(  ){
        this._fields = [];
 
    }

    addFields( ...   fields){
        this._fields.push( ...  fields)
    }
    asGetParameters(inLocation='query'){
        return this._fields.map(f=>{
            return f.asGetParameter(inLocation)
        })
    }
    
    asGetSchemaReference(name, schemaRef){
        return [{
            name,
            in: 'path',
            required: true,
            schema : schemaRef
        }]  // oapi expects array 
    }
    asSchemaParameters(){
        const properties =  this._fields.reduce((acc,cur,idx,ary  )=>{
            acc[cur.name] = cur.asSchemaParameter();
            return acc;
        },{});
        let required = this._fieldNamesRequired(); 
        if ( required.length == 0) {required= undefined}
        return {required,properties}
    }

    as200Response(description=''){
        const properties =  this._fields.reduce((acc,cur,idx,ary  )=>{
            acc[cur.name] = cur.asSchemaParameter();
            return acc;
        },{});
        const required = this._fieldNamesRequired(); 

        // return {required,properties}
        return{
            "200": {
            "description": description,
            "content": {
              "application/json": {
                "schema": {
                    "properties":properties

                }
              }
            }
          }
        };

    }
    _fieldNamesRequired(){
        return this._fields.filter(f=>{ return f.required}).map(f=>{return f.name});
    }
    /**
     * @parameter {ref} object - in form: {$ref:'doc reference'}
     */
    asRequestBodyRef(ref){
        return  {
            content:{
                'application/json': {
                    schema: ref
                }      
            }    
        }
    }
    asPostRequestBody(){
        return this.asRequestBody();
    }
    asRequestBody(){

        const properties =  this._fields.reduce((acc,cur,idx,ary  )=>{
            acc[cur.name] = cur.asSchemaParameter();
            return acc;
        },{});

        const required = this._fieldNamesRequired(); 

        return {
            content:{
                'application/json': {
                    schema:{
                        required,
                        properties
                    }
                }      
            }    
        }
    }

}
module.exports.FieldTypeCollection = FieldTypeCollection;
//templates.FieldTypeCollection = FieldTypeCollection;
