console.log("main.js");

require.config({
  paths: {
    	// set the lodash path
    	lodash: 'lib/lodash',
	highland: 'lib/highland'
  }
});

require(["generate"], function(stream){
	
	stream.each(function (x) {
    		console.log(x);
	});		
});
