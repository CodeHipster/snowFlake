console.log("main.js");

require.config({
  paths: {
    // set the lodash path
    lodash: 'lib/lodash',
	highland: 'lib/highland'
  }
});

require(["util"],function(utils){
	console.log("running require in main.js");
	var context;
	init();
	
	fillScreen1();
		
	function fillScreen1(){
			//implement timing to give dom time to render.
		var i = 0;
		var desiredFrameLength = 200; //ms
		var drawsPerFrame = 1;	
		var drawCount = 0;
		var prev = 0;
		var lastFrameTime	
		var again = true;
		var draws = 0;
		
		window.requestAnimationFrame(drawLines);
		
		function drawLines(timeStamp){
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
			draws += drawCount;
			console.log(drawsPerFrame, lastFrameTime, draws);
			while(drawCount > 1){
				drawLine(nextLine());
				
				drawCount -= 1;
			}
			context.stroke();
			if(again) window.requestAnimationFrame(drawLines);
		}
		
		var width,height, lineLength, x, y, line;
		width = context.canvas.clientWidth;
		height = context.canvas.clientHeight;
		lineLength = 0.1;
		x = 0;
		y = 0;
		line = {x1:0, y1:0,x2:0,y2:0};
		
		function nextLine(){
			line.x1 = x;
			line.y1 = y;
			y = y+lineLength;			
			if(y > height) {
				x += lineLength; 
				if(x > width) {x=0;} //if we reached the end start at the start :P
				y = 0;
			} //go to next column.
			line.x2 = x;
			line.y2 = y;
			return line;
		}
	}
	function drawLine(line){
		var x1, y1, x2, y2
		x1 = line.x1;
		y1 = line.y1;
		x2 = line.x2;
		y2 = line.y2;
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
			console.log(context);
		}else 
		{
			throw new Error("canvas context unavailable");
		}
	}
});
