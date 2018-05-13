// A very basic web server in node.js
// Script from: Node.js for Front-End Developers by Garann Means (p. 9-10)
//dependencies: npm install node-cmd
//dependencies: npm install http
//dependencies: npm install https
//dependencies: npm install path
//dependencies: npm install fs


var cmd=require('node-cmd');
var http = require("http");
var https = require("https");
var path = require("path");
var fs = require("fs");

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var serverUrl = config.serverip;
var port = config.serverport;

var checkMimeType = true;

var round = 0;

get_data_to_json();
setInterval(get_data_to_json, 27000);

function get_data_to_json() {
	cmd.run('bash getdata.sh');
	console.log("Round: " + round);
	round++;
}

if(config.ssl.enabled){
	var https_port = config.ssl.options.port;
	var options = {
  		key: fs.readFileSync(config.ssl.options.key),
  		cert: fs.readFileSync(config.ssl.options.cert)
	};

	https.createServer(options,  function(req, res) {

	    var now = new Date();
	    if(req.url == "/"){
	        req.url="/index.html";
	    }

	    console.log("Requesting "+ now +" url: " + req.url);

		var filename = req.url || "index.html";
		var ext = path.extname(filename);
		var localPath = __dirname;
		var validExtensions = {
			".html" : "text/html",
			".js": "application/javascript",
			".css": "text/css",
			".jpg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".json": "application/json",
			".ico": "application/json"
		};

		var validMimeType = true;
		var mimeType = validExtensions[ext];
		if (checkMimeType) {
			validMimeType = validExtensions[ext] != undefined;
		}

		if (validMimeType) {
			localPath += filename;
			fs.exists(localPath, function(exists) {
				if(exists) {
					console.log("Serving file: " + localPath);
					getFile(localPath, res, mimeType);
				} else {
					console.log("File not found: " + localPath);
					res.writeHead(404);
					res.end();
				}
			});

		} else {
			console.log("Invalid file extension detected: " + ext + " (" + filename + ")")
		}

	}).listen(https_port, serverUrl);
	console.log("Starting web server at https://" + serverUrl + ":" + https_port);
}

http.createServer( function(req, res) {

	    var now = new Date();
	    if(req.url == "/"){
	        req.url="/index.html";
	    }

	    console.log("Requesting "+ now +" url: " + req.url);

		var filename = req.url || "index.html";
		var ext = path.extname(filename);
		var localPath = __dirname;
		var validExtensions = {
			".html" : "text/html",
			".js": "application/javascript",
			".css": "text/css",
			".jpg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".json": "application/json",
			".ico": "application/json"
		};

		var validMimeType = true;
		var mimeType = validExtensions[ext];
		if (checkMimeType) {
			validMimeType = validExtensions[ext] != undefined;
		}

		if (validMimeType) {
			localPath += filename;
			fs.exists(localPath, function(exists) {
				if(exists) {
					console.log("Serving file: " + localPath);
					getFile(localPath, res, mimeType);
				} else {
					console.log("File not found: " + localPath);
					res.writeHead(404);
					res.end();
				}
			});

		} else {
			console.log("Invalid file extension detected: " + ext + " (" + filename + ")")
		}

	}).listen(port, serverUrl);

	console.log("Starting web server at http://" + serverUrl + ":" + port);

function getFile(localPath, res, mimeType) {
	fs.readFile(localPath, function(err, contents) {
		if(!err) {
			res.setHeader("Content-Length", contents.length);
			if (mimeType != undefined) {
				res.setHeader("Content-Type", mimeType);
			}
			res.statusCode = 200;
			res.end(contents);
		} else {
			res.writeHead(500);
			res.end();
		}
	});
}
