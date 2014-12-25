function  csstylus(){

}

function slash(name) {
 if (name && name.slice && name.slice(-1) != "/") name += "/";
 return name;
}

 csstylus.static=staticFunction;

function staticFunction(config){
 	var builtPackages=[];
	var compressCss = false;
	var compressStyl = true;
	var options = {};

	function params(config){
		if (config){
			if (typeof config.compressCss == "string") compressCss = !!config.compressCss;
			if (typeof config.compressStyl == "string") compressStyl = !!config.compressStyl;
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
 				str = fs.readFileSync(filePath, 'utf8')
	 			result += stylus.render(str , {"compress":compressStyl})+"\n";
 			}
 			else if (moduleExtension[0]==".styl") {
 				filePath=options.styl+fileName;
 				str = fs.readFileSync(filePath, 'utf8')
	 			result += stylus.render(str , {"compress":compressStyl})+"\n";
 			} 
 			else if (moduleExtension[0]==".css") {
 				filePath=options.css+fileName;
 				str = fs.readFileSync(filePath, 'utf8')
	 			result += (compressCss ? stylus.render(str , {"compress":true}) : str) +"\n";
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
		var packageName = req.url.match(/\/[\w\.\-]+\.css$/);

		if (!packageName) {
			res.sendFile(req.url , {root:options.files}, function(err){if (err) res.status(404).end();});
			return;
		}
		packageName = packageName[0].slice(1,-4);
		if (builtPackages.indexOf( packageName )>=0) {
			res.sendFile(options.dest+packageName+".css" , function(err){if (err) res.status(404).end();});
			return;
		}

		var package     = require(options.json+packageName+".json");
		package.name = packageName;
		res.status(200).type('.css').send(json2css( package ));
	}
}

module.exports = csstylus;