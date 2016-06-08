var blueprint = function(p){

  // var mapSize = 768;
  var gridSize = 90;
  var wallThickness = 10;
  var mapSize = {};
  var images = [];
  var filenames = ["emt", "wll", "dor", "hll", "hdr", "cnr", "cd1"];
  var partCount = {};

  
  p.setup =  function(){
    Map.setup();
    // console.log(mapSize);
    // gridSize = (mapSize-50)/Game.boardWidth;
    // console.log(gridSize);
    console.log(Game.boardWidth + "," + Game.boardHeight)
    mapSize = {width : (gridSize*Game.boardWidth + gridSize), height : (gridSize*Game.boardHeight+gridSize)}
    p.createCanvas(mapSize.width,mapSize.height);
    p.noLoop()
  }
  
  
  function drawGrid(){
    p.push();
    p.strokeWeight(0.1);
    squaresPerCell = 4;
  
  
    for(var row = 0; row < Game.boardHeight*4+1; row++){
      for(var col = 0; col < Game.boardWidth*4+1; col++){
        x = gridSize/2 + col*gridSize/squaresPerCell;
        y = gridSize/2 + Game.boardHeight*gridSize;
        
        // p.stroke(230);
  
        if(col % 4 == 0){

          p.strokeWeight(3);

          p.stroke(125,125,255);


        } else {
          p.strokeWeight(0.5);
          p.stroke(75,75,255);

          // p.stroke(215);
        }
        p.line(x, gridSize/2, x, y);
  
  
        p.line(gridSize/2,x,y,x);
  
  
  
        // Debug: draw coordinate labels
        // if(col < Game.boardWidth && row < Game.boardHeight){
        //   stroke(125);
        //   text(col + "," + row,  col * gridSize , mapSize.height - row*gridSize );
        // }
      }
    }
    p.pop();
  }
  
  function cellPos(cell){
    x = gridSize/2 + gridSize * cell.col - 5;
    y = (mapSize.height-gridSize/2) - gridSize*(cell.row+1) - 5;
    return {x: x, y: y};
  }
  
  
  function drawDoors(){
    p.noFill();
    doorCells = Map.getDoorCells();
    p.strokeWeight(1);
    for(var i = 0; i < doorCells.length; i++){
      doorDir = Map.doorDirection(doorCells[i]);
      pos = cellPos(doorCells[i]);
      p.stroke(175);
  
      if(doorDir == "n"){
        p.arc(pos.x+gridSize+5, pos.y+5, gridSize*2, gridSize*2, p.HALF_PI, p.PI);
        p.line(pos.x+gridSize+5,pos.y+5, pos.x+gridSize+5, pos.y+gridSize+5);
      }
  
      if(doorDir == "s"){
        p.arc(pos.x+gridSize+5,pos.y+gridSize+5, gridSize*2, gridSize*2, p.PI, p.PI+p.HALF_PI);
        p.line(pos.x+gridSize+5,pos.y+gridSize+5, pos.x+gridSize+5, pos.y+5);
  
      }
  
      if(doorDir == "w"){
        p.arc(pos.x+5, pos.y+5, gridSize*2, gridSize*2, 0, p.HALF_PI);
        p.line(pos.x+5,pos.y+5, pos.x+gridSize+5, pos.y+5);
      }
  
      if(doorDir == "e"){
        p.arc(pos.x+5+gridSize, pos.y+5, gridSize*2, gridSize*2, p.HALF_PI, p.PI);
        p.line(pos.x+5,pos.y+5, pos.x+gridSize+5, pos.y+5);
      }
    }
  }
  
  function westWall(){
    p.rect(pos.x+5, pos.y+5, wallThickness, gridSize);
    // line(pos.x, pos.y, pos.x, pos.y+gridSize);
    // line(pos.x+10, pos.y, pos.x+10, pos.y+gridSize);
  }
  function eastWall(){
    p.rect(pos.x+gridSize-wallThickness/2, pos.y+5, wallThickness, gridSize);
    // line(pos.x+gridSize, pos.y, pos.x+gridSize, pos.y+gridSize);
    // line(pos.x+gridSize+10, pos.y+10, pos.x+gridSize+10, pos.y+gridSize+10);
  }
  function northWall(){
    p.rect(pos.x+5, pos.y+5, gridSize, wallThickness);
    // line(pos.x, pos.y, pos.x+gridSize, pos.y);
    // line(pos.x, pos.y+10, pos.x+gridSize, pos.y+10);
  }
  
  function southWall(){
    p.rect(pos.x+5,pos.y+gridSize-wallThickness/2, gridSize, wallThickness);
    // line(pos.x, pos.y+gridSize, pos.x+gridSize, pos.y+gridSize);
    // line(pos.x, pos.y+gridSize+10, pos.x+gridSize, pos.y+gridSize+10);
  }
  
  function drawCell(cell){
  
    cellPart = Map.partForCell(cell);
    if(partCount[cellPart]){
        partCount[cellPart]++;
    } else {
      partCount[cellPart] = 1;
    }
  
    dNeighbors = Map.getDisconnectedNeighbors(cell);
    pos = cellPos(cell);
  
    p.noFill();
    p.strokeWeight(1);
    p.stroke(125,125,255);
  
    if(!cell.indoors){
      nHatches = 5;
      for(var i = 0; i < nHatches; i++){
        p.line(pos.x+5, pos.y+5 +  gridSize/nHatches * i, pos.x  +5+  gridSize/nHatches * i, pos.y +5);
  
        p.line(pos.x+5 +  gridSize/nHatches * i, pos.y +gridSize+5, pos.x +gridSize+5, pos.y +  gridSize/nHatches * i + 5);
  
      }
    } 
  
    p.strokeWeight(1);
    // p.stroke(125,125,255);
    p.noFill();
  
    // p.rect(pos.x+5, pos.y+5, gridSize, gridSize);
    p.stroke(255);
    // p.fill(255);
    for(var i = 0; i < dNeighbors.length; i++){
      if(cell.indoors){
        wallDir = Util.cardinalDescription(cell,dNeighbors[i]);
        if(wallDir == "n"){
          // rect(pos.x, pos.y, gridSize , 10);
          northWall();
        }
        if(wallDir == "s"){
          // rect(pos.x, pos.y + gridSize, gridSize , 10);
          southWall();
        }
        if(wallDir == "e"){
          // rect(pos.x+gridSize, pos.y, 10 , gridSize);
          eastWall();
        }
        if(wallDir == "w" ){
          westWall();
          // rect(pos.x, pos.y, 10 , gridSize);
        }
      } 
    
     
    }
    if(cell.indoors && !Map.getNeighbor(cell, {col: -1 , row: 0})){
      westWall();
      // rect(pos.x, pos.y, 10 , gridSize);
    }
    if(cell.indoors &&!Map.getNeighbor(cell, {col: 1 , row: 0})){
      // rect(pos.x+gridSize, pos.y, 10 , gridSize);
      eastWall();
    }
    if(cell.indoors &&!Map.getNeighbor(cell, {col: 0 , row: 1})){
        // rect(pos.x, pos.y, gridSize , 10);
        northWall();
    }
    if(cell.indoors && !Map.getNeighbor(cell, {col: 0 , row: -1})){
        // rect(pos.x, pos.y + gridSize, gridSize , 10);
        southWall();
    }
  }
  
  function drawMap(){
    for(var i = 0; i < Map.cells.length; i++){
      drawCell(Map.cells[i]);
      drawCellLabel(Map.cells[i]);
    }
  }
  
  function drawCellLabel(cell){
    pos = cellPos(cell);
    p.noStroke();
    // p.fill(25);
    p.fill(85,85,255);
    p.text(Map.partForCell(cell), pos.x +gridSize/2, pos.y+(gridSize/2));
  }
  
  function drawKey(){
    w = 354;
    h = 479;
  
    scaledW = 70;
    scaledH = (scaledW / 354) * h;
  
    col = 0;
    row = 0;
    p.noStroke();
    p.fill(125);
    p.textAlign(CENTER);
    p.textSize(14);
     
    for(var i = 0; i < images.length; i++){
      x = mapSize.width + col*90;
      y = 25 + scaledH*row;
      p.image(images[i], x, y + 20*row, 70, scaledH);
      p.text(filenames[i] + " [" + (partCount[filenames[i]] || 0) +"]", x + 30, y + scaledH + 20*row + 15);
  
      col++;
      if(col > 1){
        col = 0;
        row++;
      }
    }
  
    entry = [];
    console.log(filenames.join(","));
    for(var i = 0 ; i  < filenames.length; i++){
      entry.push("" + (partCount[filenames[i]] || 0) +"" );
    }
    console.log(entry.join(","));
  }
  
  function drawGridLabels(){
    cols = "abcdefghijklmnopqrstuvwxyz".split("").slice(0,Game.boardHeight)
    rows = [0,1,2,3,4,5,6,7,8].slice(0,Game.boardWidth)
  
    p.push();
      p.fill(255);
  
    p.push();
      p.translate(0, p.height-15);
      for(var i = 0; i < cols.length; i++){
        p.text(cols[i], gridSize + i*gridSize, 10);  
      }
      p.translate(0, -(p.height-15));
    
      p.translate(p.width/2, 10);
      p.rotate(p.PI);
      p.translate(-p.width/2, -10);
      cols.reverse();
      for(var i = 0; i < cols.length; i++){
        p.text(cols[i], gridSize + i*gridSize, 10);  
      }
    p.pop();
  
    p.push();
      rows.reverse();
      for(var i = 0; i < rows.length; i++){
          p.text(rows[i], 10, gridSize + i*gridSize);  
      }
  
      p.translate(10, p.height/2);
      p.rotate(p.PI);
      p.translate(-10, -p.height/2);
      rows.reverse();
      for(var i = 0; i < rows.length; i++){
          p.text(rows[i], -p.width + 30, gridSize + i*gridSize);  
      }
      p.pop();
    p.pop();
  }
  
  function drawExit(){
    x = Game.exit.col * gridSize + gridSize/2;
    y = ((Game.boardHeight-1)-Game.exit.row) * gridSize + gridSize/2;
  
    p.push();
  
    p.fill(255,0,0);
    p.rect(x + 25, y + 35, 40, 20);
    p.fill(255);
    p.textAlign(p.CENTER);
    // textSize(20);
    p.text("EXIT", x + 45, y +50);
    p.pop();
  }
  
  p.drawPrintable = function(){
    p.filter("gray");
    p.filter("invert");
    p.filter("threshold"); 
  }

  p.drawBlankBoard = function(){
    p.background(255);
    drawGrid();
    drawGridLabels();
    p.filter("gray");
  }

  p.draw = function(){
    // background(0,0,255);
    p.background(58, 85, 162);
    drawGrid();
    drawDoors();
    drawMap();
    drawExit();
    drawGridLabels();  
  
    // drawKey();
  }
}