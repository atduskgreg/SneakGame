

Character = function(){
	this.inventory = [];
	this.knowledge = {};
	this.destination = Util.getRandomSquare();
}

Character.prototype = {
	init : function(){
		this.name = Util.getRandomName();
		this.color =  Util.getRandomColor();
		startSqrIdx = Math.floor(Math.random() * Game.seedSquares.length);
		startSqr = Game.seedSquares[startSqrIdx];
		this.position = {col : startSqr.col, row : startSqr.row};
	},

	// learn knowledge from other character's knowledge and items
	learnFrom : function(other){
		// learn about what they're carrying
		for(var i = 0; i < other.inventory.length; i++){
			this.knowledge[other.inventory[i].name] = {what : other.inventory[i].name, who : other, when : Game.roundNum, acquired : Game.roundNum}
		}

		for(i in other.knowledge){

			// if we know something about the item,
			// only learn from them if their info is more recent
			if(this.knowledge[i]){
				if(this.knowledge[i].when < other.knowledge[i].when){
					this.knowledge[i] = other.knowledge[i];
					this.knowledge[i].acquired = Game.roundNum;
				}
			}
			// if we know nothing, learn what they know
			else {
				this.knowledge[i] = other.knowledge[i];
				this.knowledge[i].acquired = Game.roundNum;
			}
		}
	},

	acquireItemsFrom : function(other){
		itemsToRemove = [];
		for(var i = 0; i < other.inventory.length; i++){
			this.inventory.push(other.inventory[i]);
			itemsToRemove.push(other.inventory[i]);
		}
		console.log(other.inventory);
		console.log(itemsToRemove.length + " items to remove");
		for(var i = 0; i < itemsToRemove.length; i++){
			console.log("removing " + itemsToRemove[i]);
			index = other.inventory.indexOf(itemsToRemove[i]);
			other.inventory.splice(index,1);
		}
		console.log(other.inventory);

	},

	gainItem : function(item){
		this.inventory.push(item);
	},

	dropItem : function(item){
		index = this.inventory.indexOf(item);
		Game.inventory.push(item);
		this.inventory.splice(index, 1);
	},

	itemWithAttribute : function(attr, value){
		var result = null;
		for(var i = 0; i < this.inventory.length; i++){
			if(this.inventory[i][attr] == value){
				result = this.inventory[i];
			}
		}
		return result;
	},

	// toString : function(){
	// 	inventory = [];
 //        for(var k =0; k < this.inventory.length; k++){
 //          inventory.push(this.inventory[k].name);
 //        }

 //        knowledgeDescription = [];
 //        for(i in this.knowledge){
 //        	knowledgeDescription.push(this.knowledge[i].who + " had the "+ i + " " + (Game.round.num - this.knowledge[i].when) + " turns ago " );
 //        }
	// 	return this.name + " ("+this.color+") i:["+inventory.join(", ")+"] k:[" + knowledgeDescription.join(", ")+"]";
	// },

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
		console.log(this.color + " moving from " + Util.squareDescription(this.position) +"["+this.position.col+"x"+this.position.row+"]" + " to " + Util.squareDescription(this.nextPosition()));

		if(this.atDestination()){
			if(Math.random() < 0.05){

				this.destination = {col : Math.floor(Math.random() * Game.boardWidth), row: Math.floor(Math.random() * Game.boardHeight)};
			}

		} else {

			var np = this.nextPosition();
			console.log(this.color + " " + np.col + "x" + np.row);
			this.position.col = np.col;
			this.position.row = np.row;

			console.log("now at: " + Util.squareDescription(this.position));
		}
	},

	atDestination : function(){
		if(this.destination){
			return (this.position.col == this.destination.col) && (this.position.row == this.destination.row);

		} else {
			return false;
		}
	}

}