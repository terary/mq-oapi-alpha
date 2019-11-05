const connectionString = 'mongodb://127.0.0.1:27017/monqade-test';
// static: {
//     SUB_APP_MOUNT_POINT:subAppPoint,
//     MONGO_CONNECT_STRING: connectionString,
//     EXAMPLE_SERVER_PORT:3100,
//     MONGO_CONNECT_OPTIONS:{ useUnifiedTopology: true ,  useNewUrlParser: true, connectTimeoutMS:5000,  useCreateIndex: true, useFindAndModify:false },

// },

const COMMON_TEST_VARS = {
    static: {
        SUB_APP_MOUNT_POINT: 'subapp-mount-point/',
        MONGO_CONNECT_STRING: connectionString,
        EXAMPLE_SERVER_PORT:3100,
        MONGO_CONNECT_OPTIONS:{ useUnifiedTopology: true ,  useNewUrlParser: true, connectTimeoutMS:5000,  useCreateIndex: true, useFindAndModify:false },
    
    }
 }

 module.exports.COMMON_TEST_VARS = COMMON_TEST_VARS;