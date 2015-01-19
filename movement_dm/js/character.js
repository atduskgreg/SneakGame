

Character = function(){
	this.position = Util.randomTile();
	this.destination = Util.randomTile();
	this.name = Util.getRandomName();

	colors = ["red", "green", "yellow", "blue", "pink", "orange", "brown", "gray", "black", "brown"];

	this.color =  colors[Math.floor(Math.random() * colors.length)];
	this.knowledge = {};
	this.inventory = [];
}

Character.prototype = {
	init : function(){
		this.position = Util.randomTile();
		this.destination = Util.randomTile();
		this.name = Util.getRandomName();
		colors = ["red", "green", "yellow", "blue", "pink", "orange", "brown", "gray", "black", "brown"];

		this.color =  colors[Math.floor(Math.random() * colors.length)];
	},

	// learn knowledge from other character's knowledge and items
	learnFrom : function(other){
		// learn about what they're carrying
		for(var i = 0; i < other.inventory.length; i++){
			this.knowledge[other.inventory[i].name] = {who : other.name, when : Game.round.num}
		}

		for(i in other.knowledge){

			// if we know something about the item,
			// only learn from them if their info is more recent
			if(this.knowledge[i]){
				if(this.knowledge[i].when < other.knowledge[i].when){
					this.knowledge[i] = other.knowledge[i];
				}
			}
			// if we know nothing, learn what they know
			else {
				this.knowledge[i] = other.knowledge[i];
			}
		}
	},

	toString : function(){
		inventory = [];
        for(var k =0; k < this.inventory.length; k++){
          inventory.push(this.inventory[k].name);
        }

        knowledgeDescription = [];
        for(i in this.knowledge){
        	knowledgeDescription.push(this.knowledge[i].who + " had the "+ i + " " + (Game.round.num - this.knowledge[i].when) + " turns ago " );
        }
		return this.name + " ("+this.color+") i:["+inventory.join(", ")+"] k:[" + knowledgeDescription.join(", ")+"]";
	},

	toData : function(){
		return {position : this.position, destination : this.destination, name : this.name, color : this.color};
	},

	fromData : function(data){
		this.position = data.position;
		this.destination = data.destination;
		this.name = data.name;
		this.color = data.color;
	},

	setupInstruction : function(){
		return "Place the " + this.color + " character on " + Util.squareDescription(this.position);
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