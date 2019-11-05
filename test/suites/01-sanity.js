"use strict";

const path = require('path')
//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');
const chai = require('chai')
const expect = chai.expect;

const expectedResponses = require('../support/expectedResponses')
const expected400response = expectedResponses.expected400response;
const expectedMonqadeResponse = expectedResponses.expectedMonqadeResponse;

let requester, ENDPOINT, testRecordSet ;// = chai.request(app).keepOpen()
let CONTROL_DOCUMENT;

before(function(done){
    console.log('\t*set up', `(${path.basename(__filename)})`)
    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;

    done();

})




it('*doInsertOne* (control test - work as expected) Insert document with self generated test data causes serialized MonqadeResponse  ', function(done) { 
    const candidateDoc =theMqSchema.createTestDocumentForInsert()
    const payload = { payload: {candidateDoc} };
    const s = JSON.stringify(payload);    

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
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
        .then(response=>{
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


it.skip('skipping it',() => {
}); // 

after(function(done){
    done();
})
