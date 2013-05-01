var server = require("./server"),
    router = require("./router"),
    requestHandlers = require("./requestHandlers"),
    db = require('./config').db;
var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/publish"] = requestHandlers.publish;
handle["/install"] = requestHandlers.install;
handle["/getData"] = requestHandlers.getJsonData;
handle["/addUser"] = requestHandlers.addUser;
server.start(router.route, handle, db);