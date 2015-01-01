var Util = {
  names : ["joe", "bob", "jane", "cat", "pam", "kit", "van", "lin", "alice", "fin", "mark"],

  getRandomName : function(){
    var idx = Math.floor(Math.random() * Util.names.length);
    return Util.names.splice(idx, 1)[0];
  },
  
  squareSelector : function(sqr){
    return "#" + sqr.col + "x" + sqr.row;
  },

  squareDescription : function(sqr){
    return ["a", "b", "c", "d", "e", "f","g","h"][sqr.col] + (sqr.row+1);
  },
  

  randomTile : function(){
  	 var c = Math.floor(Math.random() * Game.boardWidth);
  	 var r = Math.floor(Math.random() * Game.boardHeight);

  	 return {col : c, row : r};
  },

  shuffle : function(array) {
    console.log("before");
    console.log(array);
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
        console.log("after");
    console.log(array);
    return array;
  }
}