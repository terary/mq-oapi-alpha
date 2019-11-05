/**
 * Tests here within do not include 0x-sanity-[schema name] (does include 01-sanity)
 * 0x-sanity-[schema name] depend solely on the servers form example.
 * 
 * Test here within depend on several other things - specifically require a test dataset that gets 
 * build an there is a specific MonqadeSchema that gets instantiated etc.  Process is involved but
 * given stop-work, not going to do more to it.
 * 
 *    
 * 
 * 
 * 
 */


const chai = require('chai')
, chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const path = require('path')
//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../environment');

const LAMBDAS = require('monqade-shared').LAMBDAS;


function importTest(name, testSuite) {
    describe(name, function () {
        require(testSuite);
    });
}
// const app = require('./support/testServer.js');
const app = require('../examples/servers/MonqadeDictionary');
let testRecordSet;

describe("Monqade Express Tests", function () {

    before(function (done) {
        console.log("\t*Set-up");
        console.log('\t\t+Starting testing server.')
        requester = chai.request(app).keepOpen()


        COMMON_TEST_VARS.runtime.requester = requester;
        theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
      
        console.log('\t\t+Creating test dataset.');
        LAMBDAS.datasetCreator.build(theMqSchema,50)
        .then(dataset=>{
            COMMON_TEST_VARS.runtime.testRecordSet = dataset;
//            testRecordSet = dataset;
            done();
        }).catch(err=>{
            done(err);
        })
      


    });  
    importTest("Sanity check - for development", './suites/01-sanity.js') ;
    importTest(".doFindOne", './suites/doFindOne.js') ;
    importTest(".doDeleteOne", './suites/doDeleteOne.js') ;
    importTest(".doInsertOne", './suites/doInsertOne.js') ;
    importTest(".doUpdateOne", './suites/doUpdateOne.js') ;
    importTest(".doUpsertOne", './suites/doUpsertOne.js') ;
    importTest(".doQueryMany", './suites/doQueryMany.js') ;
    importTest(".doFindMany", './suites/doFindMany.js') ;

    importTest("MiddlewareStack", './suites/middleware-stack.js') ;
    importTest("MonqadeMiddleware - shipped middleware", './suites/monqade-middleware.js') ;
    //importTest("Misc.", './suites/misc.js') ;


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

});