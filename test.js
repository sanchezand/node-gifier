const GIF = require('./index.js');

var newGif = new GIF("E:/Libraries/Videos/Captures/2017-02-10-18-27-21.mkv", {
   frames: 4,
   delay: 1000
}).write("E:/Libraries/Desktop/asdasd.gif").then(file=>{
	console.log(`Created GIF at ${file}`);
})