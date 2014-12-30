console.log("util.js");

define(function(){
	console.log("returning utils");
	return {
		reloadScrollBars: function() {
			document.documentElement.style.overflow = 'auto';  // firefox, chrome
			document.body.scroll = "yes"; // ie only
		},
		unloadScrollBars: function() {
			document.documentElement.style.overflow = 'hidden';  // firefox, chrome
			document.body.scroll = "no"; // ie only
		}
	}
});