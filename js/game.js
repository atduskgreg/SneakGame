var Game = {
	boardWidth : 8,
	boardHeight: 8,
	nCharacters : 10,
	characters : [],
  round : null,

	drawCharacters : function(characters){
		$("#board p").remove();
		for(var i = 0; i < characters.length; i++){
			characters[i].draw();
		}
	},

	moveCharacters : function(characters){
		for(var i = 0; i < characters.length; i++){
			characters[i].move();
		}
	},
  updateInstruction : function(){
    $("#instruction").html(Game.round.currentMoveDescription());
  }
}