"use strict";

const http = require('http');
const makeHttpCall = require('./makeHttpCall').makeHttpCall;// module.exports.makeHttpCall;
const makeHttpGetCall = require('./makeHttpCall').makeHttpGetCall;// module.exports.makeHttpCall;
const dictionaryPayload = (key,value,description) => {
    return {
        payload : {
            key,
            value,
            description

        }
    }
}
const doFindOne = (doc) => {
    // const payload =  {
    //     payload:  {
    //         "_id":"5da444ed8a3a314e2bec9fdd",
    //         "key":"Key0.2520929483120735",
    //         "value":"value0.9323566606083118",
    //         "description":" just a test key",
    //         "_schemaVersion":"0001",
    //         "createdAt":"2019-10-14T09:50:37.961Z",
    //         "updatedAt":"2019-10-14T09:50:37.961Z",
    //         "_docVersionKey":0
    //     }
    // };
    const payload ={payload:doc} 
    makeHttpGetCall('get','/dictionary',payload, doUpdate);

}

const insertComplete = (mqResponse) => {
    const newDoc = mqResponse._docs[0]; 
    // console.log('******* DID INSERT ********');
    // console.log(newDoc);
    // console.log('******* DID INSERT ********');
    console.log(`did insert: `, newDoc['_id'])
    console.log(`doing findOne: `, newDoc['_id'])

    doFindOne(newDoc);
    //doDelete(newDoc)
}
const deleteComplete = (data) => {
    console.log('******* DID DELETE ********');
    console.log(data);
//    console.log('******* DID DELETE ********');
}

// const newDoc = mqResponse._docs[0]; 
const doUpdate = (mqResponse) => {
    const newDoc = mqResponse._docs[0]; 
    const payload = {payload:newDoc};
    console.log(`doing update: `, newDoc['_id'])
    makeHttpCall('patch','/dictionary',payload, doDelete);
}


const doDelete = (mqResponse)  => {
    const doc = mqResponse._docs[0];
    console.log(`doing delete: `, doc['_id'])
 
    makeHttpGetCall('delete','/dictionary',{payload:doc}, deleteComplete);

}

const newItem = dictionaryPayload('Key' + Math.random(), 'value' + Math.random(), ' just a test key');
console.log(newItem);
makeHttpCall('post','/dictionary',newItem, insertComplete);

//makeHttpCall('get','/openapi');

// doFindOne();