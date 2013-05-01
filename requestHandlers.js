var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
//db = require('./config').db,
    url = require("url");
function start(response) {
    console.log("Request handler 'start' was called.");
    fs.readFile('./index.html', function (err, data) {
        if (err) throw err;
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(data);
        response.end();
    });
}
function publish(response, request, db) {
    console.log("Request handler 'publish' was called.");
    var form = new formidable.IncomingForm({uploadDir:"./temp"});
    console.log("about to parse");
    form.encoding = 'utf-8';
    form.parse(request, function(error, fields, files) {
        //获取jquery模块表
        var modulesCollection = db.collection("modules");
        //console.log("22"+decodeURI(fields.readMe));
        //查找数据库
        modulesCollection.count({name:fields.fileName.substring(0,fields.fileName.length - 4)}, function(err, count){
            if(err){
                console.log(err.toString());
            }else{
                //console.log("count: "+count);
                if(count > 0){
                    response.end("jqpm has same name jquery module,please change name!");
                    return;
                }else{
                    console.log("parsing done" + querystring.parse(fields).toString());
                    for(var s in files){
                        console.log("path: "+fields.fileName);
                        fs.renameSync(files[s].path, "./jquery_modules/" + fields.fileName);
                        //mongoDB存数据
                        modulesCollection.save({name:fields.fileName.substring(0,fields.fileName.length - 4),
                            version:"0.0.1",zipUri:"/jquery_modules/" + fields.fileName,
                            userName:fields.userName,
                            readMe:unescape(fields.readMe)},
                            function(err){
                                if(err){
                                    console.log(err.toString());
                                }else{
                                    console.log("publish success: name " + fields.fileName);
                                    response.write("publish success");
                                }
                        });
                        response.end();
                    }
                }
            }
        });
    });
}
function install(response, request) {
    var pathname = url.parse(request.url).pathname;
    var moduleName = querystring.parse(url.parse(request.url).query).fileName;
    fs.readFile("./jquery_modules/"+ moduleName +".zip", "binary", function(error, file) {
        if(error) {
            console.log(error);
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            console.log("wwwww");
            response.writeHead(200, {"Content-Type": "application/octet-stream"});
            response.write(file, "binary");
            response.end();
        }
    });
}

//获取json数据
function getJsonData(response, request, db){
    var callBackFn = querystring.parse(url.parse(request.url).query).callback;
    console.log(callBackFn);
    var modulesCollection = db.collection("modules");
    //查找数据库
    modulesCollection.find().toArray(function(err, data){
        if(err){
            console.log(err.toString());
        }else{
            console.log("data: "+JSON.stringify(data));
            response.end(callBackFn + "(" + JSON.stringify(data) + ")");
        }
    });
}

//添加用户
function addUser(response, request, db){
    console.log("Request handler 'addUser' was called.");
    var userName = querystring.parse(url.parse(request.url).query).userName;
    var password =  querystring.parse(url.parse(request.url).query).password;
    //获取jquery模块表
    var userinfoCollection = db.collection("userinfo");
    //查找数据库
    userinfoCollection.count({userName:userName}, function(err, count){
        if(err){
            console.log(err.toString());
        }else{
            //console.log("count: "+count);
            if(count > 0){
                response.end("Already exists same userName,please enter other!");
                return;
            }else{
                //mongoDB存数据
                userinfoCollection.save({userName:userName,password:password}, function(err){
                    if(err){
                        console.log(err.toString());
                    }else{
                        console.log("addUser success!" + userName);
                        response.write("addUser success");
                    }
                });
            }
        }
    });
}
exports.start = start;
exports.publish = publish;
exports.install = install;
exports.getJsonData = getJsonData;
exports.addUser = addUser;