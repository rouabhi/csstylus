# csstylus #
A node.js package tCompile, Minify and concatenate stylus and css files and serve them as a unique css file.

## How does it work ? ##
First you should create a ```.json``` file with the list of your files to be included.

Let's say you want to generate the file `final.css`. You should then create a file named `final.json` :
```javascript
{
        "modules":["file1","file2.styl","file3.css"]
}
```

File1 and file2 are considered as stylus files and they are read from the stylus path defined bellow. file3 is a css files and it is read from the css directory defined below.

In the ```node.js``` part, you have to use *csstylus* **middleware**.
```javascript
app.use( '/csstylus', csstylus.static({
                        styl:__dirname+'/styles/styl',
                        css:__dirname+'/styles/css',
                        json:__dirname+'/styles/json',
                        dest:__dirname+'/styles/dest',
                        files:__dirname+'/styles/files'
                    }) );
```

Another way to do the same thing is:
```javascript
app.use( '/csstylus', csstylus.static()
                     .config({
                        styl:__dirname+'/styles/styl',
                        css:__dirname+'/styles/css',
                        json:__dirname+'/styles/json',
                        dest:__dirname+'/styles/dest',
                        files:__dirname+'/styles/files'
                    }) );
```

The only mandatory parameter is ```styl```. All not given parameter are taken from the same value ```styl```.


The middleware is now mounted to the path ```/csstylus```. In your HTML file you should include these 2 lines:
```html
<link href="/csstylus/final.css" rel="stylesheet">
```
The first time the file is invoked, it is built and stored in the dst directory. The next time it is referenced, it is cerved directly.

## File compression ##
You can decide whether ```.css``` and ```.styl``` files are compressed, separately by calling .config method of the middleware:

```javascript
app.use( '/csstylus', csstylus.static({
                        styl:__dirname+'/styles/styl',
                        css:__dirname+'/styles/css',
                        json:__dirname+'/styles/json',
                        dest:__dirname+'/styles/dest'
                    }).config({minifyCss:true,minifyStyl:false}) ) );
```
Default values are  ```{compressCss:false,compressStyl:true}```

## What if a file modified?##
The final ```.css``` file is created on the first time it is invoqued. Modification date is not checked. So, to rebuild it, you should just relaunch **node.js**.