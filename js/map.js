var Map = {
  cells : [],
  dirs : [{col: 1,  row:  0},
          {col: 0,  row:  1},
          {col: -1, row:  0},
          {col: 0,  row: -1},
          // add these for diagonal connectivity
          {col: 1,  row:  1},
          {col: 1,  row: -1},
          {col: -1, row: -1},
          {col: -1, row:  1}],

  setup : function(){
    for(var row = 0; row < Game.boardHeight; row++){
      for(var col = 0; col < Game.boardWidth; col++){
        this.cells.push({col : col, row: row});
      }
    }

    this.buildMap_connectedRooms();
    this.highlightIndoorCells();
  },

  buildMap_connectedRooms : function(){
    var nSeeds = 3;
    seeds = [];
    for(var i = 0; i < nSeeds; i++){
      seed = this.randomCell();
      seeds.push(seed);
      seed.indoors = true;
      Map.makeCellsIndoors(Map.getNeighbors(seed));
    }

    for(var i = 0; i < seeds.length; i++){
      for(var j = 0; j < seeds.length; j++){
        if(i != j){
          this.connectCells(seeds[i], seeds[j]);
        }
      
      } 
    }
  },

  connectCells : function(cell1, cell2){
    var i = cell1.col;
    if (cell1.col != cell2.col) {
      var colDir = (cell2.col - cell1.col)/Math.abs((cell1.col - cell2.col));
      i = cell1.col;

      while (i != cell2.col) {
        i += colDir;
        this.getCell({col : i, row : cell1.row}).indoors = true;
      }
    }

    if (cell1.row != cell2.row) {
      var rowDir = (cell2.row - cell1.row)/Math.abs((cell1.row - cell2.row));
      var j = cell1.row;
      while (j != cell2.row) {
        j += rowDir;
        this.getCell({col: i, row: j}).indoors = true;
      }
    }
  },

  highlightIndoorCells : function(){
    this.highlightCells(this.indoorCells());
  },

  indoorCells : function(){
    result = [];
    for(var i = 0; i < this.cells.length; i++){
      if(this.cells[i].indoors){
        result.push(this.cells[i]);
      }
    }

    return result;
  },

  randomCell : function(){
    return this.getCell(Util.getRandomSquare());
  },

  getNeighbor : function(cell, dir){
    return this.getCell({row : (cell.row + dir.row), col : (cell.col + dir.col)});
  },

  getCell : function(cell){
    for(var i = 0; i < this.cells.length; i++){
      if(this.cells[i].col == cell.col && this.cells[i].row == cell.row ){
        return this.cells[i];
      }
    }

    return false;
  },

  getNeighbors : function(cell){
    var result = [];
    for(var i = 0; i < this.dirs.length; i++){
      dir = this.dirs[i];
      neighbor = this.getNeighbor(cell, dir);
      if(neighbor){
        result.push(neighbor);
      }
    }
    return result;
  },

  makeCellsIndoors : function(cells){
    for(var i = 0; i < cells.length; i++){
      cells[i].indoors = true;
    }
  },

  highlightCell : function(cell){
    $(Util.squareSelector(cell)).addClass('highlight');
  },

  highlightCells : function(arr){
    this.clearHighlights();
    for(var i = 0; i < arr.length; i++){
      this.highlightCell(arr[i]);
    }
  },

  clearHighlights : function(){
    $("td").removeClass('highlight');
  },

  clear : function(){
    this.clearHighlights();
    for(var i = 0; i < this.cells.length; i++){
      this.cells[i].indoors = false;
    }
  }
}