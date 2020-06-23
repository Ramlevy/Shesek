var http = require('http');
var tempJSON = ''
http.createServer(
    function(req, res){
        var body='';
        req.on('data', function(chunk){
            body += chunk;
        });
        req.on('end', function(){
            body = body.toString('utf-8');
            console.log('POSTed: ' + body);
            res.writeHead(200);
            res.end(tempJSON);
        });
    }
).listen(8080);