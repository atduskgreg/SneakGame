/*

assumption:

tile = {col: 0, row: 3}

*/

var names = ["joe", "bob", "jane", "cat", "pam", "kit", "van", "lin", "alice", "fin"];

function getRandomName(){
	var idx = Math.floor(Math.random() * names.length);
 	return names.splice(idx, 1)[0];
}

Character = function(startingTile, destinationTile){
	this.position = startingTile;
	this.destination = destinationTile;
	this.name = getRandomName();
}

Character.prototype = {
	squareSelector : function(){
		return "#" + this.position.col + "x" + this.position.row;
	},

	draw : function(){
		console.log(this.squareSelector() + " " + this.name);
		var k = this.atDestination() ? "atDestination" : "inTransit";

		$(this.squareSelector()).append("<p class='"+k+"'>"+this.name+"</p>");
	},

	heading : function(){
		var colHeading = 0;
		var rowHeading = 0;
		if(this.destination.col > this.position.col){
			colHeading = 1;
		} else if(this.destination.col == this.position.col){
			colHeading = 0;
		} else {
			colHeading = -1;
		}
		if(this.destination.row > this.position.row){
			rowHeading = 1;
		} else if(this.destination.row == this.position.row){
			rowHeading = 0;
		} else {
			rowHeading = -1;
		}

		return {col : colHeading, row : rowHeading};
	},

	move : function(){
		h = this.heading();
		this.position.col += h.col;
		this.position.row += h.row;
	},

	atDestination : function(){
		return (this.position.col == this.destination.col) && (this.position.row == this.destination.row);
	}

}