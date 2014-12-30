console.log("b.js");

define(["lodash"],function(_){
	
	console.log("req b, dependencies: lodash");
	console.log(_.VERSION);

	console.log("returning b");
	var b = {b:"b"};
	return b;
});