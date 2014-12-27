var Util = {
  names : ["joe", "bob", "jane", "cat", "pam", "kit", "van", "lin", "alice", "fin"],

  getRandomName : function(){
    var idx = Math.floor(Math.random() * Util.names.length);
    conosole.log(Util.names);
    return Util.names.splice(idx, 1)[0];
  },
  
  squareSelector : function(sqr){
    return "#" + sqr.col + "x" + sqr.row;
  },
  

  randomTile : function(){
  	 var c = Math.floor(Math.random() * Game.boardWidth);
  	 var r = Math.floor(Math.random() * Game.boardHeight);

  	 return {col : c, row : r};
  }
}