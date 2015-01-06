console.log("main.js");

require.config({
  paths: {
    // set the lodash path
    lodash: 'lib/lodash',
	highland: 'lib/highland',
	jquery: 'lib/jquery'
  }
});

require(["util","fractal","highland","jquery"], function(utils, fractal, hl, jquery)
{
	console.log("running require in main.js");
	var fractalStream, context;
	var depth, xPos, yPos, length;
	fractalStream = fractal.getFractalStream(depth); //12 iterations deep.
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
		
		// Calculate lines per second. Each second.
		//Using vars from calculating draw count
		var timeElapsed = 0;
		var lines = 0;
		function calculateLPS(){
			lines += drawsPerFrame;
			timeElapsed += lastFrameTime;
			if (timeElapsed > 1000)
			{
				//draw a white square.
				context.fillStyle="#ffffff";
				context.fillRect(20,4,250,20);
				context.stroke();
				//draw the lps text.
				context.fillStyle = "#000000";
				context.fillText((lines/timeElapsed).toFixed(0) + " x1000 lines per second.",20,20);
				context.stroke();
				lines = 0;
				timeElapsed = 0;
			}
		}
		
		//Function to be called when values are received from the stream.
		function pullStream(timeStamp){
			context.beginPath(); // Calling this clears the internal path stored in the context.
			calculateLPS(); // Lines per second.
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
		
		//link the input fields.
		jquery("#depth").change(function(data, handler){
			console.log("depth changed");
		});
		
		if( canvas.getContext )
		{
			context = canvas.getContext('2d');
			context.fillStyle   = '#000';
			context.lineWidth   = 1;
			context.font = "16px Arial";
		}else 
		{
			throw new Error("canvas context unavailable");
		}
	}
});
