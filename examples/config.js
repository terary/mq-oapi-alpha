const connectionString = 'mongodb://127.0.0.1:27017/monqade-test';

const VARS = {
        SUB_APP_MOUNT_POINT: '/subapp-mount-point',
        MONGO_CONNECT_STRING: connectionString,
        EXAMPLE_SERVER_PORT:3100,
        MONGO_CONNECT_OPTIONS:{ useUnifiedTopology: true ,  useNewUrlParser: true, connectTimeoutMS:5000,  useCreateIndex: true, useFindAndModify:false },
    
 }
const VARS_GLOBAL = {} ; // used to keep instance stuff between start-up and tests
 module.exports.VARS = VARS;
 
