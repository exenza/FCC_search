var express = require("express")
var app = express()
//Check for enviromental variables
if(!process.env.cx || !process.env.google_key){
	console.log('Missing enviromental variables')
	require('./api_auth.js')
}

//Initiate search
app.get("/search/*", function(req, res){
  	var q=req.url.split('/search/')[1]
    //res.send({"search":q})
    res.send(process.env.cx)
})

//Serve a static file with instructions
app.use('/*', express.static(__dirname + '/public'));

app.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function() {
  console.log('Running app')
});