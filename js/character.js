/*

assumption:

tile = {col: 0, row: 3}

*/

Character = function(startingTile, destinationTile){
	this.position = startingTile;
	this.destination = destinationTile;
}

Character.prototype = {
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