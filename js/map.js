var Map = {
  width : 8,
  height : 8,
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
    for(var row = 0; row < this.height; row++){
      for(var col = 0; col < this.width; col++){
        this.cells.push({col : col, row: row});
      }
    }
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

  highlightCell : function(cell){
    $(Util.squareSelector(cell)).addClass('highlight');
  },

  highlightCells : function(arr){
    $("td").removeClass('highlight');
    for(var i = 0; i < arr.length; i++){
      this.highlightCell(arr[i]);
    }
  }
}