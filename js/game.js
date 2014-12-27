var Game = {
	boardWidth : 8,
	boardHeight: 8,
	nCharacters : 10,
  nPlayers : 2,
	characters : [],
  players : [],
  round : null,

	drawCharacters : function(characters){
		$("#board p").remove();
		for(var i = 0; i < characters.length; i++){
			characters[i].draw();
		}
	},

  addPlayer : function(player){
    Game.characters.push(player);
    Game.players.push(player);
  },

  getNumNPCs : function(){
    return (Game.nCharacters - Game.nPlayers);
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