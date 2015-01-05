//		__/\__
//	  _/      \_
//	 |			|
//	/	         \
//	\	         /
//	 |_	       _|
//	   \__  __/
//		  \/ 
//

console.log("fractal.js");

define(["util","entity","highland"],function(utils, entities, hl){
	console.log("running define in fractal.js");	

	var fracAngle = 60; //3 lines initially /_\
	
	//depth should be > 0.
	function LineTree(depth, line){
		console.log("Constructing LineTree");
		var root, tree;
		tree = this;
		root = new LineLink(depth,line);
		this.iterator = root;
		
		//LineLinks are the nodes of the tree. And contain a line.
		function LineLink(depth,line,parent){
			this.depth = depth;
			this.line = line;
			this.parent = parent;
			this.itChild = 0;
			if(depth) this.child = new LineLink(depth -1,new entities.Line(line.pos,line.vec),this ); //Create a child for each depth. child will be reused.
		}
		//Returns the next line segment.
		LineLink.prototype.getNextLine = function(){
			if(this.depth === 0){ //this line is a segment.
				//Set the iterator to the parent.
				tree.iterator = this.parent;
				return this.line;				
			}else{//this is not a line segment
				//how many children do we have?
				switch(this.itChild){//TODO: duplicate code :|, reuse childPos objects.
					case 0:	//children are created on initialization. adjust them accordingly.
						//Set up the line values for the first part.
						this.child.parent = this; 
						//console.log("this line premod: ",this.line.toString());
						this.child.line.setValues(this.line.pos,this.line.vec);
						//console.log("child line premod: ",this.child.line.toString());
						this.child.line.vec.divide(3);
						//console.log("this line postmod: ",this.line.toString());
						//console.log("child line postmod: ",this.child.line.toString());
						this.itChild = 1; //Increase the child iterator.
						tree.iterator = this.child;//Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper :D
					case 1://Change the line of the child to match the second part. Changing it to save on memory consumption.
						this.child.line.pos = this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec = this.child.line.vec.rotate(-fracAngle); // __/
						this.itChild = 2; //Increase the child iterator.
						tree.iterator = this.child; //Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper :D
					case 2://Change the line of the child to match the third part. Changing it to save on memory consumption.
						this.child.line.pos = this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec = this.child.line.vec.rotate(2*fracAngle); // __/
						this.itChild = 3; //Increase the child iterator.
						tree.iterator = this.child; //Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper :D
					case 3://Change the line of the child to match the fourth part. Changing it to save on memory consumption.
						this.child.line.pos = this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec = this.child.line.vec.rotate(-fracAngle); // __/
						this.itChild = 4; //Increase the child iterator.
						tree.iterator = this.child; //Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper :D
					case 4://No more line parts.
						if(this === root) return undefined; //we are done, no lines to return.
						this.itChild = 0;
						tree.iterator = this.parent; //continue with the parent.
						return tree.iterator.getNextLine(); //going up :D
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
		if(depth === 0) 
			//If we have reached the final depth push the line to the stream.
			push(null, new entities.Line(position,vector));
		else{
			//Cut the line into 4 pieces and toss them into back into this function with 1 less depth.
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
		console.log("getting a fractalStream.");
		//Declare all used variables.
		var i, angle, sides, pos, vec, line,lineLinkTree;
		i = 0;
		sides = 3;
		angle = 360.0/sides;
		//TODO: make this modifiable on the html page.
		pos = new entities.Vector(200,200);
		vec = new entities.Vector(500,0);
		
		//setup the LineTree. This will enable us to keep an iterator on the fractal.
		lineLinkTree = new LineTree(depth,new entities.Line(pos,vec));
		
		//Generator function to be used in the stream. Will be called each time something is pulled from the stream. 
		function generateFractal(push,next){
			line = lineLinkTree.iterator.getNextLine();
			if(line === undefined){
				i+=1;
				if(i === sides){
					push(null, 'end'); //our own end signal.
					push(null, hl.nil); //end signal to end the stream.
				}else{		
					// modify pos and vec to be the new Line (move and rotate).
					pos.translate(vec); 
					vec.rotate(angle);
					lineLinkTree = new LineTree(depth,new entities.Line(pos,vec));
					//Apparently no need to push for each call to the generator function. If nothing is pushed the function on the other side won't be called.
				}
			}else push(null,line);
			next();
		}
		return hl(generateFractal);//.map(function(x){return x}); //map makes sure backpressure is not build up :)
	}

	return {
		getFractalStream: getFractalStream
	}
});

