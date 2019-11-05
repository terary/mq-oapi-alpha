const http = require('http');

/////////// *******************************
// We need this to build our post string
const responseToItem = (data) => {
    const respTemp = JSON.parse(data);
    const response = respTemp.MonqadeResponse || respTemp.MonqadeError
    if(response.isMonqadeResponse){
        return response;
    }
    if(response.isMonqadeError){
        return response;
    }
    return 'This should never be!!!';
}

const makeHttpCall =  (httpMethod = 'get', endpoint = '/dictionary', data ={},cb)  => { 
//    var querystring = require('querystring');
    var http = require('http');
    const post_data = JSON.stringify(data);
    let post_options;
        post_options = {
            host: 'localhost',
            port: '8000',
            path: endpoint,
            method: httpMethod.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        if(res.statusCode == 400) {
            console.log('************************  Caught Error *****************');
            console.log(res.statusMessage);            
        }
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
            cb(responseToItem(chunk));
        });
    });
    
    // post the data
    post_req.write(post_data);
    post_req.end();
    
}

const makeHttpGetCall =  (httpMethod = 'get', endpoint = '/dictionary', data ={},cb)  => { 
    //    var querystring = require('querystring');
        var http = require('http');
        const post_data = JSON.stringify(data);
        let post_options;
             post_options = {
                host: 'localhost',
                port: '8000',
                path: endpoint + '/' +  encodeURI(post_data),
                method: httpMethod.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json'
    //                'Content-Length': Buffer.byteLength(post_data)
                }
            }
       // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            if(res.statusCode == 400) {
                console.log('************************  Caught Error *****************');
                console.log(res.statusMessage);            
            }
            res.on('data', function (chunk) {
                // console.log('Response: ' + chunk);
                cb(responseToItem(chunk));
            });
        });
        
        // post the data
        // post_req.write(post_data);
        post_req.end();
        
    }
module.exports.makeHttpGetCall = makeHttpGetCall;    
module.exports.makeHttpCall = makeHttpCall;