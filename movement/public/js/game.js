var Game = {
	boardWidth : 8,
	boardHeight: 8,
	nCharacters : 10,
  nPlayers : 1,
	characters : [],
  players : {},
  round : null,
  clientId: 0, 

	drawCharacters : function(characters){
		$("#board p").remove();
		for(var i = 0; i < characters.length; i++){
			characters[i].draw();
		}
	},

  addPlayer : function(player){
    Game.characters.push(player);
    Game.players[player.clientId] = player;
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
    $("#instruction").html(Game.round.currentMoveDescription());
  },

  generateClientId : function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}