const exec = require('child_process').exec;
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const gm = require('gm');

function Gifier(input, opts){
	this.opts = Object.assign({
		frames: 10,
		delay: 100
	}, (opts || {}));
	this.input = input;
	this.folder = path.join(path.dirname(input), 'tmp-'+Math.ceil(Math.random() * 100000));
}

Gifier.prototype.pipe = function(res){
	return new Promise((resolve, reject)=>{
		this._createFrames().then(files=>{
			if(!res) this._clearTempFolder();
			else this._createGif(files).then(file=>{
				if(!res){
					this._clearTempFolder();
				}else{
					var pipe = fs.createReadStream(file).pipe(res);
					pipe.on('finish', done=>{
						this._clearTempFolder();
					})
				}
			})
		})
	})
}

Gifier.prototype.write = function(destination){
	return this._createFrames().then(files=>{
		return this._createGif(files, destination);
	}).catch(err=>{
		this._clearTempFolder();
	})
}

Gifier.prototype._createGif = function(files, destination=false){
	return new Promise((resolve, reject)=>{
		var g = gm();
		for(var i of files){
			g.in(i);
		}
		g.delay(this.opts.delay);
		var dest = (destination || path.join(this.folder, 'out.gif'));
		g.write(dest, (err, stout, sterr)=>{
			if(destination) this._clearTempFolder();
			return resolve(dest);
		})
	})
}

Gifier.prototype._extractFrameSecond = function(s, num){
	var h = Math.floor(s / 3600);
	var m = Math.floor((s % 3600) / 60);
	var sc = Math.floor((s % 3600) % 60);
	var time = ('00'+h).slice(-2) + ':' + ('00'+m).slice(-2) + ':' + ('00'+sc).slice(-2);
	
	return new Promise((resolve, reject)=>{
		var ssLoc = path.join(this.folder, 'tmp-'+('000'+num).slice(-3))+'.png';
		var cmd = `ffmpeg -ss ${time} -i "${this.input}" -vframes 1 -q:v 2 "${ssLoc}"`
		exec(cmd, (err, stoud, sterr)=>{
			return resolve(ssLoc);
		})
	});
}

Gifier.prototype._createFrames = function(){
	var fCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${this.input}"`;

	return new Promise((resolve, reject)=>{
		fs.mkdir(this.folder, err=>{
			if(err) return reject(err);
			exec(fCmd, (err, stout, sterr)=>{
				if(err) return reject(err);
				var seconds = parseInt(stout);
				if(isNaN(seconds)) return;
				var prom = [];
				var c = 0;
				for(var i=1; i<seconds; i+=(seconds/this.opts.frames)){
					prom.push(this._extractFrameSecond(Math.floor(i), c));
					c++;
				}
				Promise.all(prom).then(done=>{
					return resolve(done);
				})
			});
		});
	});
}

Gifier.prototype._clearTempFolder = function(done){
	if(!done) done = function(){ };
	rimraf(this.folder, done);
}

module.exports = Gifier;