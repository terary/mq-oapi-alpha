"use strict";
const MONQADE_TEST_HTTP_PORT=3000;

const app = require('../examples/servers/MonqadeChaos').theApp;
const {applicationRoutes} = require('../examples/servers/MonqadeChaos');
// module.exports= {
//   theApp: app,
//   mqSchema,
//   appMountPoint:  CONFIG.SUB_APP_MOUNT_POINT + mqSchema.appMountPoint ,
//   applicationRoutes: allRoutes

// };


const server = app.listen(MONQADE_TEST_HTTP_PORT, function() {
  console.log('available routes:', applicationRoutes)
  console.log(`Monqade test server running on port: ${MONQADE_TEST_HTTP_PORT}`);
});

server.on('close', ()=>{
  console.log('Server Closed');
  process.exit();
})


process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  server.close();
});
