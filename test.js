const GIF = require('./index.js');

var newGif = new GIF("E:/Libraries/Videos/Captures/rub wtf.mp4", "E:/Libraries/Desktop/test.gif", {
   frames: 120,
   delay: 25
}).on('end', ()=>{
   console.log('END');
});