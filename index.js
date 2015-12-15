function  csstylus(){

}

function slash(name) {
 if (name && name.slice && name.slice(-1) != "/") name += "/";
 return name;
}

 csstylus.static=staticFunction;

function staticFunction(config){
 	var builtPackages=[];
	var minifyCss = false;
	var minifyStyl = true;
	var options = {};

	function params(config){
		if (config){
			if (typeof config.minifyCss == "boolean") minifyCss = config.minifyCss;
			if (typeof config.minifyStyl == "boolean") minifyStyl = !!config.minifyStyl;
			if (typeof config.styl == "string") {
				options.styl = slash( config.styl );
				options.css = options.css || options.styl;
				options.json = options.json || options.styl;
				options.dest = options.dest || options.styl;
				options.files = options.files || options.styl;
			}
			if (typeof config.css == "string") options.css = slash( config.css);
			if (typeof config.json == "string") options.json = slash( config.json);
			if (typeof config.files == "string") options.files = slash( config.files );
			if (typeof config.dest == "string") options.dest = slash( config.dest );
		}
	}

	middleware.config = function( config ){
		params(config);
		return middleware;
	}
	params(config);
 	return middleware;

 	function json2css( package ){
 		var result = "",
 			stylus = require("stylus"),
 			fs = require('fs');

 		for(var i in package.modules) {
 			var fileName = package.modules[i], filePath;
 			var moduleExtension=fileName.match(/\.[\w]*$/g);
 			var str;

 			if (!moduleExtension) {
 				filePath = options.styl+fileName+".styl";

 				try{
	str = fs.readFileSync(filePath, 'utf8')
	 			}
	 			catch(e){
	 				str="";
	 				console.log("Error reading file '"+fileName+"' on package '"+package.name+".json'");
	 			}
	 			result += stylus.render(str , {"compress":minifyStyl})+"\n";
 			}
 			else if (moduleExtension[0]==".styl") {
 				filePath=options.styl+fileName;
 				try{
	 				str = fs.readFileSync(filePath, 'utf8');
	 			}
	 			catch(e){
	 				str="";
	 				console.log("Error reading file '"+fileName+"' on package '"+package.name+".json'");
	 			}
	 			result += stylus.render(str , {"compress":minifyStyl})+"\n";
 			} 
 			else if (moduleExtension[0]==".css") {
 				filePath=options.css+fileName;
 				try{
	 				str = fs.readFileSync(filePath, 'utf8')
	 			}
	 			catch(e){
	 				str="";
	 				console.log("Error reading file '"+fileName+"' on package '"+package.name+".json'");
	 			}
	 			result += (minifyCss ? stylus.render(str , {"compress":true}) : str) +"\n";
 			} 
 		}
		fs.writeFile(options.dest+package.name+".css", result, function(err){
			if(!err){
				builtPackages.push(package.name);
			}
		});
 		return result;
 	}

 	function middleware(req, res, next){
		var packageName = req.url.match(/\/[\w\.\-]+\.css$/),
		    package;

		if (!packageName) { // if no css file requested, serve static files
			res.sendFile(req.url , {root:options.files}, function(err){if (err) res.status(404).end();});
			return;
		}
		packageName = packageName[0].slice(1,-4);
		if (builtPackages.indexOf( packageName )>=0) {
			res.sendFile(options.dest+packageName+".css" , function(err){if (err) res.status(404).end();});
			return;
		}

		try{
			package     = require(options.json+packageName+".json");
		} catch(e){
			res.status(404).end();
			return;
		}
		package.name = packageName;
		res.status(200).type('.css').send(json2css( package ));
	}
}

module.exports = csstylus;