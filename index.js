function  csstylus(){

}

function slash(name) {
 if (name && name.slice && name.slice(-1) != "/") name += "/";
 return name;
}

 csstylus.static=function(options){
 	var builtPackages=[];

 	options.styl = slash( options.styl );
 	options.css = slash( options.css) || options.styl;
 	options.json = slash( options.json) || options.styl;
 	options.dest = slash( options.dest ) || options.styl;
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
	 			result += stylus.render( str )+"\n";
 			}
 			else if (moduleExtension[0]==".styl") {
 				filePath=options.styl+fileName;
 				str = fs.readFileSync(filePath, 'utf8')
	 			result += stylus.render(str , {"compress":true})+"\n";
 			} 
 			else if (moduleExtension[0]==".css") {
 				filePath=options.css+fileName;
 				str = fs.readFileSync(filePath, 'utf8')
	 			result += stylus.render(str , {"compress":true})+"\n";
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
		var packageName = req.url.match(/^\/[\w\.\-]+\.css$/);

		if (!packageName) {
			res.status(500);
			return;
		}
		packageName = packageName[0].slice(1,-4);
		if (builtPackages.indexOf( packageName )>=0) {
			res.redirec( options.dest+packageName+".css" );
			//res.sendFile(options.dest+packageName+".css" , function(err){if (err) res.status(404).end();});
			return;
		}

		var package     = require(options.json+packageName+".json");
		package.name = packageName;
		res.status(200).type('.css').send(json2css( package ));
	}
}

module.exports = csstylus;