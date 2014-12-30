//todo: fix line creating.

console.log("fractal.js");

define(["util","entity","highland"],function(utils, entities, hl){
	console.log("running define in fractal.js");	

	var fracAngle = 60;
	
	function LineTree(depth, line){
		console.log(line);
		var root, iterator;
		root = new LineLink(depth,line);
		iterator = root;
		this.iterator = iterator;
		
		//TODO: if root depth = 0, set parent of root to itself. so recursion won't crash.
		if(!depth) root.parent = root;
		
		function LineLink(depth,line,parent){
			console.log("creating line link");
			this.depth = depth;
			this.line = line;
			this.parent = parent;
			this.itChild = 0;
			if(depth) this.child = new LineLink(depth -1, line,this ); //Create a child for each depth. child will be reused.
		}
		//Returns the next line segment.
		LineLink.prototype.getNextLine = function(){
			if(this.depth === 0){ //this line is a segment.
				//Set the iterator to the parent.
				iterator = this.parent;
				return this.line;				
			}else{//this is not a line segment
				//how many children do we have?
				switch(this.itChild){//TODO: duplicate code :|, reuse childPos objects.
					case 0:	//children are created on initialization. adjust them accordingly.
						//Set up the line values for the first part.
						this.child.parent = this; 
						console.log("this line premod: ",this.line.toString());
						this.child.line.setValues(this.line.pos,this.line.vec);
						console.log("child line premod: ",this.child.line.toString());
						this.child.line.vec.divide(3);
						console.log("this line postmod: ",this.line.toString());
						console.log("child line postmod: ",this.child.line.toString());
						this.itChild = 1; //Increase the child iterator.
						iterator = this.child;//Call getNextLine on the child.
						return iterator.getNextLine(); //going deeper :D
					case 1://Change the line of the child to match the second part. Changing it to save on memory consumption.
						this.child.line.pos = this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec = this.child.line.vec.rotate(-fracAngle); // __/
						this.itChild = 2; //Increase the child iterator.
						iterator = this.child; //Call getNextLine on the child.
						return iterator.getNextLine(); //going deeper :D
					case 2://Change the line of the child to match the third part. Changing it to save on memory consumption.
						this.child.line.pos = this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec = this.child.line.vec.rotate(2*fracAngle); // __/
						this.itChild = 3; //Increase the child iterator.
						iterator = this.child; //Call getNextLine on the child.
						return iterator.getNextLine(); //going deeper :D
					case 3://Change the line of the child to match the fourth part. Changing it to save on memory consumption.
						this.child.line.pos = this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec = this.child.line.vec.rotate(-fracAngle); // __/
						this.itChild = 4; //Increase the child iterator.
						iterator = this.child; //Call getNextLine on the child.
						return iterator.getNextLine(); //going deeper :D
					case 4://No more line parts.
						if(this === root) return undefined; //we are done, no lines to return.
						iterator = this.parent; //continue with the parent.
						return iterator.getNextLine(); //going up :D
					default:
						console.log("shouldn't happen");
				}			
			}				
		}		
	}

	
	function pushLineToStream(depth, position, vector, push){
		//helper function to keep code short :)
		function p(pos,vec){
			pushLineToStream(depth-1, pos, vec, push);
		}
		
		//If we have reached the final depth push the line to the stream.
		if(depth === 0) push(null, new entities.Line(position,vector));
		else{
			//Cut the line into 4 pieces and toss them into back into this function with 1 less depth.
			//		__/\__
			//	  _/      \_
			//	 |			|
			//	/	         \
			//	\	         /
			//	 |_	       _|
			//	   \__  __/
			//		  \/ 
			//
			var pos, vec;
			pos = new entities.Vector(position);
			vec = new entities.Vector(vector).divide(3); // __/\__ 
			p(pos, vec);
			pos = pos.translate(vec);
			vec = vec.rotate(-fracAngle); // __/
			p(pos, vec);
			pos = pos.translate(vec);
			vec = vec.rotate(2*fracAngle); // /\ 
			p(pos, vec);
			pos = pos.translate(vec);
			vec = vec.rotate(-fracAngle); // \__
			p(pos, vec);
		}
	}
	
	function getFractalStream(depth){
		
		console.log("getFractalStream");
		var i, angle, sides, pos, vec, line,lineLinkTree;
		i = 0;
		sides = 1
		angle = 360.0/sides;
		pos = new entities.Vector(100,50);
		vec = new entities.Vector(50,0);
		
		//setup the lineLinkTree. This will enable us to keep an iterator on the fractal.
		lineLinkTree = new LineTree(depth,new entities.Line(pos,vec));
		
		function generateFractal(push,next){
			console.log("generate fractal");
			line = lineLinkTree.iterator.getNextLine();
			if(line === undefined){
				i+=1;
				if(i === sides){
					push(null, 'end'); //our own end signal.
					push(null, hl.nil); //end signal to end the stream.
					console.log(lineLinkTree);
				}else{		
					pos.translate(vec);
					vec.rotate(angle);
					lineLinkTree = new LineTree(depth,new entities.Line(pos,vec));
					push(null,lineLinkTree.iterator.getNextLine());
				}
			}else push(null,line);
			next();
		}
		return hl(generateFractal).map(function(x){return x}); //map makes sure backpressure is not build up :)
	}

	return {
		getFractalStream: getFractalStream
	}
});

