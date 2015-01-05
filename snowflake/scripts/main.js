console.log("main.js");

require.config({
  paths: {
    // set the lodash path
    lodash: 'lib/lodash',
	highland: 'lib/highland'
  }
});

require(["util","fractal","highland"], function(utils, fractal, hl)
{
	console.log("running require in main.js");
	var fractalStream, context
	fractalStream = fractal.getFractalStream(12);
	console.log(fractalStream);
	init();
	
	streamFractal2();
	//streamFractal1();
		
	function streamFractal1(){
		//implement timing to give dom time to render.
		var i = 0;
		var desiredFrameLength = 20; //ms
		var drawsPerFrame = 1;
		var drawCount = 0;
		var prev = window.performance.now();
		var lastFrameTime
		
		fractalStream.each(fractalStreamListener);
		
		function fractalStreamListener(line){
			context.beginPath();
			if(drawCount < 1){ 
				//draw.
				//timeOut to update canvas.
				context.stroke();
				window.setTimeout(function(){fractalStream.resume();},0);
				// window.requestAnimationFrame(function(timeStamp){
					// context.stroke();
					// console.log(timeStamp);
					// fractalStream.resume();					
				// });
				//recalculate amount of draws.
				timeStamp = window.performance.now();
				lastFrameTime = timeStamp-prev;
				prev = timeStamp;
				if (lastFrameTime < desiredFrameLength) drawsPerFrame *=1.2 //gear up
				else drawsPerFrame *=0.95 //gear down
				drawCount = drawsPerFrame;
			}
			
			if(line !== 'end')drawLine(line);
			else context.stroke();
			
			drawCount -= 1;
		}
	}
	
	//pull still causes memory to fill up like mad.
	function streamFractal2(){
		//implement timing to give dom time to render.
		var i = 0;
		var desiredFrameLength = 35; //ms
		var drawsPerFrame = 1;	
		var drawCount = 0;
		var prev = 0;
		var lastFrameTime	
		var again = true;
		
		window.requestAnimationFrame(pullStream);
		
		function pullStream(timeStamp){
		
			context.beginPath();
			lastFrameTime = timeStamp-prev;
			console.log("lines per second: ", drawsPerFrame/(lastFrameTime/1000));
			prev = timeStamp;
			if (lastFrameTime < desiredFrameLength)
			{
				drawsPerFrame *=1.2 //gear up
			}
			else{
				drawsPerFrame *=0.95 //gear down
			}
			drawCount = drawsPerFrame;
			while(drawCount > 1){
				fractalStream.pull(function(err,x){
					if(x === 'end'){
						drawCount = 0;
						again = false;
					}else{
						drawLine(x);
					}
				});	
				drawCount -= 1;
			}
			context.stroke();
			if(again) window.requestAnimationFrame(pullStream);
		}
	}
	
	function drawLine(line){
		var x1, y1, x2, y2;
		x1 = line.pos.x;
		y1 = line.pos.y;
		x2 = x1 + line.vec.x;
		y2 = y1 + line.vec.y;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
	}

	function init(){
		console.log("init main");
		canvas = document.getElementById("canvas");
		//full screen.
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight; 
		
		utils.unloadScrollBars();
		
		
		if( canvas.getContext )
		{
			context = canvas.getContext('2d');
			context.fillStyle   = '#000';
			context.lineWidth   = 1;
		}else 
		{
			throw new Error("canvas context unavailable");
		}
	}
});
