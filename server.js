var express = require("express")
var app = express()
//Serve a static file with instructions

app.get("/search/*", function(req, res){
  	var q=req.url.split('/search/')[1]
    res.send({"search":q})
    //res.send(process.env.cx)
})

app.use('/*', express.static(__dirname + '/public'));

app.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function() {
  console.log('Running')
});