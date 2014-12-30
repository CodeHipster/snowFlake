console.log("a.js");

define(["b"],function(b){
	
	console.log("req a, dependencies: b");
	console.log(b);

	console.log("returning a");
	return {a:"a"};
});