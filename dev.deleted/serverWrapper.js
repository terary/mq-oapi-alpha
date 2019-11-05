const MONQADE_TEST_HTTP_PORT=3000;
let serverHandle;
//const app = require("./server");
const app = require('../examples/servers/MonqadeDictionary');

const server = app.listen(MONQADE_TEST_HTTP_PORT, function() {
  console.log(`Monqade test server running on port: ${MONQADE_TEST_HTTP_PORT}`);
});

server.on('close', ()=>{
  console.log('Server Closed');
  process.exit();
})

// use python to read discovery and build functions?
process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  server.close();
//  process.exit();
  // if (i_should_exit)

});
