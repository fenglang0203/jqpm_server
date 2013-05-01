var http = require("http");
var url = require("url");
function start(route, handle, db) {
    //测试数据是否连接成功
    if(!db){
        console.log("mongodb get fail!");
        return;
    }
    //启动http服务
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");
        route(handle, pathname, response, request, db);
    }
    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}
exports.start = start;