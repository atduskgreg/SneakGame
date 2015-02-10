var Util = {
  names : ["joe", "bob", "jane", "cat", "pam", "kit", "van", "lin", "alice", "fin", "mark", "kevin", "max", "june", "tim"],
  colors : ["red", "green", "yellow", "blue", "pink", "orange", "gray", "black", "brown", "white"],
  moves : {
    nw   : {col: -1, row:  1},
    n    : {col:  0, row:  1},
    ne   : {col:  1, row:  1},
    w    : {col: -1, row:  0},
    hold : {col:  0, row:  0},
    e    : {col:  1, row:  0},
    sw   : {col: -1, row: -1},
    s    : {col:  0, row: -1},
    se   : {col:  1, row: -1}
  },  

  getRandomName : function(){
    var idx = Math.floor(Math.random() * Util.names.length);
    return Util.names.splice(idx, 1)[0];
  },

  getRandomColor : function(){
    var idx = Math.floor(Math.random() * Util.colors.length);
    return Util.colors.splice(idx, 1)[0];
  },

  getRandomSquare : function(range){
    // default to full width of board
    var c = Math.floor(Math.random() * Game.boardWidth);
    var r = Math.floor(Math.random() * Game.boardHeight);
    
    // apply range limits if present
    if(range && range.col){
      c = range.col.start + Math.floor(Math.random() * range.col.width);
    }
    if(range && range.row){
      r = range.row.start + Math.floor(Math.random() * range.row.width);
    }
    
    return {col : c, row : r};
  },
  
  squareSelector : function(sqr){
    return "#" + sqr.col + "x" + sqr.row;
  },

  squareDescription : function(sqr){
    return ["a", "b", "c", "d", "e", "f","g","h"][sqr.col] + (sqr.row+1);
  },
  
  moveDescription : function(character){
    if(Util.sameSquare(character.position, character.nextPosition())){
      return "the "+ character.color +" character holds";
    } else {
      return "move the "+ character.color  + " character " + Util.cardinalDescription(character.position,character.nextPosition());
    }
  },

  cardinalDescription : function(fromPos, toPos){
    col = toPos.col - fromPos.col;
    row = toPos.row - fromPos.row;

    move = {col : col, row : row};

    for( key in this.moves ){
      if(this.moves[key].col == move.col && this.moves[key].row == move.row){
        return key;
      }
    }
  },

  knowledgeDescription : function(knowledge){
    result = "";
    result += knowledge.who.color + " (" + knowledge.who.name + ") had the " + knowledge.what + " " + (Game.roundNum - knowledge.when) + " turns ago";

    return result;
  },

  sameSquare : function(sqrA, sqrB){
    return (sqrA.col == sqrB.col) && (sqrA.row == sqrB.row);
  },

  indexOfSquare : function(sqr, sqrs){
    var result = -1;

    for(var i = 0; i < sqrs.length; i++){
      if(Util.sameSquare(sqr,sqrs[i])){
        result = i;
      }
    }

    return result;
  },

  shuffle : function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }
}