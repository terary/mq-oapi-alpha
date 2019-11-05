"use strict";

const chai = require('chai')
, chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const path = require('path')

const {theApp, mqSchema, appMountPoint} = require('../../examples/servers/chaos');

const expectedResponses = require('../support/expectedResponses')
const expected400response = expectedResponses.expected400response;
const expectedMonqadeResponse = expectedResponses.expectedMonqadeResponse;

let requester, ENDPOINT, theMqSchema;// = chai.request(app).keepOpen()
console.log('Think testRecordSet is not used - no need to build dataset -- think')
let CONTROL_DOCUMENT;

before(function(done){
    console.log('\t*set up', `(${path.basename(__filename)})`)
    ENDPOINT = appMountPoint
    theMqSchema = mqSchema;

    requester =chai.request(theApp).keepOpen();

    console.log('\t\t+Creating test dataset.');
    done();
})




it('*doInsertOne* (control test - work as expected) Insert document with self generated test data causes serialized MonqadeResponse  ', function(done) { 
    const candidateDoc =theMqSchema.createTestDocumentForInsert()
    const payload = { payload: {candidateDoc} };

    requester.post(ENDPOINT  )
    .set('content-type', 'application/json')
    .send(payload )
        .then(response=>{
            const mqResponse = expectedMonqadeResponse(response);
            CONTROL_DOCUMENT =mqResponse._docs[0];
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it('*doFindOne* document with test document http status 200, MonqadeResponse  ', function(done) { 
    // const candidateDoc = testRecordSet.pop() ;
    const candidateDoc = CONTROL_DOCUMENT;
    
    const payload = {payload: {candidateDoc }} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT  +'/' + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const str = JSON.stringify(response.body);
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('*doUpdateOne* Control test, (works as expected) Update document with self generated test data results in http status 200, MonqadeResponse  ', function(done) { 
    const testDoc = theMqSchema.createTestDocumentForUpdate();
    const updateDocument =Object.assign({},testDoc, CONTROL_DOCUMENT ) 
    const payload ={payload: {candidateDoc : updateDocument} } ;
    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response => {
            const mqResponse = expectedMonqadeResponse(response);
            CONTROL_DOCUMENT = mqResponse._docs[0];
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('*doDeleteOne* Should results in http status 200 - deleted specified document  (control test, all works as expected)', function(done) { 
    // const candidateDoc = testRecordSet.pop() ;
    const candidateDoc = CONTROL_DOCUMENT ;

    const payload ={payload: {candidateDoc }};
    
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    const newEndPoint =ENDPOINT + '/' + payloadEncoded; 
    requester.delete(newEndPoint)
    .set('content-type', 'application/json')
    .send()
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })

});




after(function (done) {
    console.log("\n\t-Tear-down");
    //mongoose.connection.close(done);
    const mongoose = require('mongoose');
    mongoose.connections.forEach(conn=>{
        console.log('\t\t-Clos(ed/ing) conn:',conn.name, `(${path.basename(__filename)})`)
        conn.close();
    })
    console.log("\t\t-closing testing server.")
    requester.close(done)
    //done()
 }); 
