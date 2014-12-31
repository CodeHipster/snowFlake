console.log("entity.js");

define(["lodash"],function(_){
	
	function Entity() {
		this.clone = function(){
			return _.clone(this,true)
		}
	}
	
	//VECTOR//
	//accepts x,y as numbers or an existing vector as the first argument.
	function Vector(arg1,y){
		if(typeof arg1 === 'object'){
			this.x = arg1.x;
			this.y = arg1.y;
		}
		else{
			this.x = arg1 | 0;
			this.y = y | 0;
		}
	}
	Vector.prototype = new Entity;
	Vector.prototype.divide = function(frac){
		this.x /=frac;
		this.y /=frac;
		return this;
	}
	Vector.prototype.rotate = function(angle){
		var x,y,cs,sn
		function deg2rad(angle){
			return (Math.PI / 180.0) * angle;
		}
		
		x = this.x;
		y = this.y;
		
		rad = deg2rad(angle);

		cs = Math.cos(rad);
		sn = Math.sin(rad);

		this.x = x * cs - y * sn;
		this.y = x * sn + y * cs;
		return this;	//for chaining.
	}	
	Vector.prototype.translate = function(vector){
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}
	//END OF VECTOR//
	
	//LINE//
	function Line(pos,vec){
		this.pos = new Vector(pos);
		this.vec = new Vector(vec);
	}
	Line.prototype = new Entity;
	Line.prototype.setValues = function(pos,vec){
		//TODO: make this also possibly for a line argument. and make a similar function for Vector.
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.vec.x = vec.x;
		this.vec.y = vec.y;
	}
	Line.prototype.toString = function(){
		return "pos: "+ this.pos.x + " " + this.pos.y + " vec: " + this.vec.x + " " + this.vec.y;
	}
	//END OF LINE//
	
	console.log("returning entities");
	return {
		Vector: Vector
		,
		Line: Line
	}
});