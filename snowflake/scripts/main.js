console.log("main.js");

require.config({
	paths: {
		// set the lodash path
		lodash: 'lib/lodash',
		highland: 'lib/highland'
	}
});

require(["util", "fractal", "highland"], function (utils, fractal, hl) {
	var fractalStream, context, nrFormat;
	nrFormat = new Intl.NumberFormat('en-US')

	init();

	streamFractal();

	function streamFractal() {
		//implement timing to give dom time to render.
		var desiredFrameLength = 35; //ms = +-28fps
		var drawsPerFrame = 1;
		var drawCount = 0; //Amount of lines draw per animation frame
		var prev = 0; //Previous animation timestamp
		var lastFrameTime = 0;
		var again = true;
		var linesDrawn = 0;
		var linesPerSecond = 0;

		// Do animation logic when the browser is ready.
		window.requestAnimationFrame(pullStream);

		function calculateDrawCount(timeStamp) {
			lastFrameTime = timeStamp - prev;
			linesPerSecond = drawsPerFrame / (lastFrameTime / 1000);
			prev = timeStamp;
			if (lastFrameTime < desiredFrameLength) {
				drawsPerFrame *= 1.2 //gear up
			}
			else {
				drawsPerFrame *= 0.95 //gear down
			}
			drawCount = drawsPerFrame;
		}

		function pullStream(timeStamp) {
			//timeStamp is in milliseconds
			context.beginPath(); // Calling this clears the internal path stored in the context.
			calculateDrawCount(timeStamp);
			drawStatistics(linesDrawn, linesPerSecond)
			console.log("lines drawn: " + linesDrawn);
			while (drawCount > 1) {
				fractalStream.pull(function (err, x) {
					if (x === 'end') {
						drawCount = 0;
						again = false;
					} else {
						drawLine(x);
						linesDrawn += 1;
					}
				});
				drawCount -= 1;
			}
			context.stroke();
			if (again) window.requestAnimationFrame(pullStream);
		}
	}

	// draw total lines and lines per second.
	function drawStatistics(totalLines, linesPerSecond) {
		//draw a white square.
		context.fillStyle = "#ffffff";
		context.fillRect(20, 4, 250, 30);
		//draw the lps text.
		context.fillStyle = "#000000";
		context.fillText(nrFormat.format(linesPerSecond.toFixed(0)) + " lines per second.", 20, 20);
		context.fillText(nrFormat.format(totalLines) + " lines drawn in total.", 20, 30);
		context.stroke();
		lines = 0;
		timeElapsed = 0;
	}

	function drawLine(line) {
		var x1, y1, x2, y2;
		x1 = line.pos.x;
		y1 = line.pos.y;
		x2 = x1 + line.vec.x;
		y2 = y1 + line.vec.y;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
	}

	function init() {
		console.log("init main");
		canvas = document.getElementById("canvas");
		//full screen.
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		utils.unloadScrollBars();

		if (canvas.getContext) {
			context = canvas.getContext('2d');
			context.fillStyle = '#000';
			context.lineWidth = 1;
		} else {
			throw new Error("canvas context unavailable");
		}

		fractalStream = fractal.getFractalStream(11, canvas.width, canvas.height);
	}
});
