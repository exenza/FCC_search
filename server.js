var express = require("express")
var app = express()
var getJSON = require('get-json')
var MongoClient = require('mongodb').MongoClient;
var assert = require("assert")
var ObjectId = require("mongodb").ObjectId
//const url = require('url');

//Check for enviromental variables
if(!process.env.cx || !process.env.google_key){
	console.log('Missing enviromental variables, loading api_auth')
	require('./api_auth.js')
}
//Set local variables
var cx = process.env.cx
var google_key = process.env.google_key
var mongoURL = process.env.db_url
var fields='items(link,snippet,image(thumbnailLink,contextLink))'
//fields='items'
var base_api_url='https://www.googleapis.com/customsearch/v1?key='+google_key+'&cx='+cx
var api_url = base_api_url+'&fields='+fields+'&searchType=image&q='

//Initiate search
app.get("/search/*", function(req, res){
  	var q=req.path.split('/')[2]
    if(q==''){res.redirect('/');return false}
  	var offset=req.query.offset
  	if(!offset){offset=1}
    var result = []
    getJSON(api_url+q+"&start="+offset, function(err, jres){
      //Save query
      MongoClient.connect(mongoURL, function(err, db ) {
        if (err) throw err
        db.collection("lastq").insertOne({"query":q}, function(err, r){
          if(err){throw(err)}
          db.close()
        })
      })

    	for(var i=0; i<jres.items.length; i++){
			var item={}
			item.url=jres.items[i].link
			item.snippet=jres.items[i].snippet
			item.thumbnail=jres.items[i].image.thumbnailLink
			item.context=jres.items[i].image.contextLink
    		result.push(item)
    	}
    	res.type('application/json')
    	res.send(result)
    })
})

//Latest queries
app.get("/latest/*", function(req, res){
  //Retrieve queries
      MongoClient.connect(mongoURL, function(err, db ) {
        if (err) throw err
        var last_queries = db.collection('lastq').find().sort({_id:-1}).limit(10).toArray(function(err, docs){
          if (err) throw err
          db.close()
          var result = []
          for(var i = 0; docs.length>i; i++){
            result.push({"query":docs[i].query, "when":ObjectId(docs[i]['_id']).getTimestamp()})
          }
          res.type('application/json')
          res.send(result) 
        })
      })
})


//Serve a static file with instructions
app.use('/*', express.static(__dirname + '/public'));

app.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function() {
  console.log('Running app')
});