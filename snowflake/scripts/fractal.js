//todo: fix line creating.

console.log("fractal.js");

define(["util", "entity", "highland"], function (utils, entities, hl) {
	console.log("running define in fractal.js");

	var fracAngle = 60;

	function LineTree(depth, line) {
		console.log("Constructing LineTree");
		var root, tree;
		tree = this;
		root = new LineLink(depth, line);
		this.iterator = root;

		function LineLink(depth, line, parent) {
			this.depth = depth;
			this.line = line;
			this.parent = parent;
			this.itChild = 0;
			if (depth) this.child = new LineLink(depth - 1, new entities.Line(line.pos, line.vec), this); //Create a child for each depth. child will be reused.
		}
		//Returns the next line segment.
		LineLink.prototype.getNextLine = function () {
			if (this.depth === 0) {
				//Final depth reached, line does not have to be broken up.
				//Set the iterator to the parent.
				tree.iterator = this.parent;
				//return this line.
				return this.line;
			} else {//break up the line in 4 parts
				switch (this.itChild) {
					case 0:	//children are created on initialization. adjust them accordingly.
						//Set up the line values for the first part.
						this.child.parent = this;
						this.child.line.setValues(this.line.pos, this.line.vec);
						this.child.line.vec.divide(3);
						this.itChild = 1; //Increase the child iterator.
						tree.iterator = this.child;//Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper.
					case 1://Change the line of the child to match the second part. Changing it to save on memory consumption.
						this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec.rotate(-fracAngle); // __/
						this.itChild = 2; //Increase the child iterator.
						tree.iterator = this.child; //Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper
					case 2://Change the line of the child to match the third part. Changing it to save on memory consumption.
						this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec.rotate(2 * fracAngle); // __/
						this.itChild = 3; //Increase the child iterator.
						tree.iterator = this.child; //Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper
					case 3://Change the line of the child to match the fourth part. Changing it to save on memory consumption.
						this.child.line.pos.translate(this.child.line.vec);
						this.child.line.vec.rotate(-fracAngle); // __/
						this.itChild = 4; //Increase the child iterator.
						tree.iterator = this.child; //Call getNextLine on the child.
						return tree.iterator.getNextLine(); //going deeper
					case 4://No more line parts.
						if (this === root) { //we are done, no lines to return.
							tree.iterator = undefined;
							return undefined;
						}
						this.itChild = 0;
						tree.iterator = this.parent; //continue with the parent.
						return tree.iterator.getNextLine(); //going back up
					default:
						console.log("shouldn't happen");
				}
			}
		}
	}

	function getFractalStream(depth, width, height) {
		console.log("getting a fractalStream.");
		var i, angle, sides, pos, vec, line, lineLinkTree;
		i = 0;
		sides = 3;
		angle = 360.0 / sides;
		smallestSide = Math.min(width, height);
		baseLineLength = smallestSide * (7/8)
		pos = new entities.Vector((smallestSide / 8) + 10, (smallestSide / 8) + 10);
		vec = new entities.Vector(baseLineLength, 0).rotate(15);

		lineLinkTree = new LineTree(depth, new entities.Line(pos, vec));

		// Generator function to be used in the stream. Will be called each time something is pulled from the stream. 
		function generateFractal(push, next) {
			if (lineLinkTree.iterator === undefined) {
				i += 1;
				if (i === sides) {
					push(null, 'end'); //our own end signal.
					push(null, hl.nil); //end signal to end the stream.
				} else {
					pos.translate(vec);
					vec.rotate(angle);
					lineLinkTree = new LineTree(depth, new entities.Line(pos, vec));
					push(null, lineLinkTree.iterator.getNextLine());
				}
			} else {
				line = lineLinkTree.iterator.getNextLine();
				if (line !== undefined) {
					push(null, line);
				}
			}
			next();
		}
		return hl(generateFractal);
	}

	return {
		getFractalStream: getFractalStream
	}
});

