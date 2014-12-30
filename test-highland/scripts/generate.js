define(["highland"],function(hl){

	var count = 0;

	function genFunc(push, next){
		if(count < 10) push(null,count);
		else push(null,hl.nil);
		next();
		count += 1;	
	}
	
	function timeOut(push,next){
		setTimeout(function(){
			genFunc(push,next)
		},1000);
	}
	
	var stream = hl(timeOut);

	return stream;
});