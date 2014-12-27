

Character = function(){
	this.position = Util.randomTile();
	this.destination = Util.randomTile();
	this.name = Util.getRandomName();
	this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
}

Character.prototype = {
	init : function(){
		this.position = Util.randomTile();
		this.destination = Util.randomTile();
		this.name = Util.getRandomName();
		this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
	},

	squareSelector : function(){
		return Util.squareSelector(this.position);
	},

	draw : function(){
		var k = this.atDestination() ? "atDestination" : "inTransit";

		$(this.squareSelector()).append("<p style='background-color:"+this.color+";' class='"+k+"'>"+this.name+"</p>");
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

	nextPosition : function(){
		h = this.heading();
		nCol = this.position.col + h.col;
		nRow = this.position.row + h.row;
		return {col : nCol, row: nRow};
	},

	move : function(){

		if(this.atDestination()){
			if(Math.random() < 0.05){

				this.destination = {col : Math.floor(Math.random() * Game.boardWidth), row: Math.floor(Math.random() * Game.boardHeight)};
			}

		} else {
			nextPosition = this.nextPosition();
			this.position.col = nextPosition.col;
			this.position.row = nextPosition.row;
		}
	},

	atDestination : function(){
		return (this.position.col == this.destination.col) && (this.position.row == this.destination.row);
	}

}