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
	fractalStream = fractal.getFractalStream(12); //12 iterations deep.
	console.log(fractalStream);
	init();
	
	streamFractal();
	
	function streamFractal(){
		//implement timing to give dom time to render.
		var desiredFrameLength = 35; //30fps
		var drawsPerFrame = 1;	
		var drawCount = 0;
		var prev = 0;
		var lastFrameTime = 0;
		var again = true;
		
		// Does animation logic when the browser is ready.
		window.requestAnimationFrame(pullStream);
		
		// Calculate number of lines to draw depending on computer speed.
		function calculateDrawCount(timeStamp){	
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
		}
		
		//Function to be called when values are received from the stream.
		function pullStream(timeStamp){
			context.beginPath(); // Calling this clears the internal path stored in the context.
			calculateDrawCount(timeStamp);
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
	
	//function to draw the line.
	var x1, y1, x2, y2;
	function drawLine(line){
		x1 = line.pos.x;
		y1 = line.pos.y;
		x2 = x1 + line.vec.x;
		y2 = y1 + line.vec.y;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
	}

	//initialize the canvas.
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
