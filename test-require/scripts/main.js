console.log("main.js");

require.config({
  paths: {
    // set the lodash path
    lodash: 'lib/lodash'
  }
});

require(["a"], function(a)
{
	console.log("req main, dependencies: a");
	console.log(a);
});
