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

  addPlayerForClient : function(player, clientId){
    Game.characters.push(player);
    Game.players[clientId] = player;
  },

  getClientPlayer : function(){
    return this.players[this.clientId];
  },

  allPlayersReady : function(){
    result = true;
    for(clientId in this.players){
      result = result && this.players[clientId].moveLoaded();
    }

    return result;
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