var Game = {
	boardWidth : 8,
	boardHeight: 8,
	nCharacters : 10,
  nPlayers : 1,
	characters : [],
  players : [],
  round : null,
  clientNum: 0, 

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

  getClientPlayer : function(){
    return this.players[this.clientNum];
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
    $("#instruction").html((Game.round.currentCharacterNum() + 1) + "/" + Game.round.characters.length + " " + Game.round.currentMoveDescription());
  }
}