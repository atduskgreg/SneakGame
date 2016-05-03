var gridSize = 50;
var wallThickness = 5;
var mapSize = {};
var images = [];
var filenames = ["emt", "wll", "dor", "hll", "hdr", "cnr", "cd1"];
var partCount = {};


// function preload(){

//   for(var i = 0; i < filenames.length; i++){
//     images.push(loadImage( "public/pieces/" + filenames[i] +".png"));
//   }
// }


function setup(){
  Map.setup();
  console.log(Game.boardWidth + "," + Game.boardHeight)
  mapSize = {width : (50*Game.boardWidth + 50), height : (50*Game.boardHeight+50)}
  canvas = createCanvas(mapSize.width,mapSize.height);
  canvas.parent("blueprint");
  noLoop()
}


function drawGrid(){
  strokeWeight(0.1);
  squaresPerCell = 4;


  for(var row = 0; row < Game.boardHeight*4+1; row++){
    for(var col = 0; col < Game.boardWidth*4+1; col++){
      x = 25 + col*gridSize/squaresPerCell;
      y = 25 + Game.boardHeight*gridSize;
      
      stroke(230);
      // stroke(75,75,255);

      if(col % 4 == 0){
        strokeWeight(1);
      } else {
        strokeWeight(0.5);
        stroke(215);
//        stroke(40,40, 255);
      }
      line(x, 25, x, y);


      line(25,x,y,x);



      // Debug: draw coordinate labels
      // if(col < Game.boardWidth && row < Game.boardHeight){
      //   stroke(125);
      //   text(col + "," + row,  col * gridSize , mapSize.height - row*gridSize );
      // }
    }
  }
}

function cellPos(cell){
  x = gridSize/2 + gridSize * cell.col - 5;
  y = (mapSize.height-gridSize/2) - gridSize*(cell.row+1) - 5;
  return {x: x, y: y};
}


function drawDoors(){
  noFill();
  doorCells = Map.getDoorCells();
  strokeWeight(1);
  for(var i = 0; i < doorCells.length; i++){
    doorDir = Map.doorDirection(doorCells[i]);
    pos = cellPos(doorCells[i]);
    stroke(175);

    if(doorDir == "n"){
      arc(pos.x+gridSize+5, pos.y+5, 100, 100, HALF_PI, PI);
      line(pos.x+gridSize+5,pos.y+5, pos.x+gridSize+5, pos.y+gridSize+5);
    }

    if(doorDir == "s"){
      arc(pos.x+gridSize+5,pos.y+gridSize+5, 100, 100, PI, PI+HALF_PI);
      line(pos.x+gridSize+5,pos.y+gridSize+5, pos.x+gridSize+5, pos.y+5);

    }

    if(doorDir == "w"){
      arc(pos.x+5, pos.y+5, 100, 100, 0, HALF_PI);
      line(pos.x+5,pos.y+5, pos.x+gridSize+5, pos.y+5);
    }

    if(doorDir == "e"){
      arc(pos.x+5+gridSize, pos.y+5, 100, 100, HALF_PI, PI);
      line(pos.x+5,pos.y+5, pos.x+gridSize+5, pos.y+5);
    }
  }
}

function westWall(){
  rect(pos.x+5, pos.y+5, wallThickness, gridSize);
  // line(pos.x, pos.y, pos.x, pos.y+gridSize);
  // line(pos.x+10, pos.y, pos.x+10, pos.y+gridSize);
}
function eastWall(){
  rect(pos.x+gridSize, pos.y+5, wallThickness, gridSize);
  // line(pos.x+gridSize, pos.y, pos.x+gridSize, pos.y+gridSize);
  // line(pos.x+gridSize+10, pos.y+10, pos.x+gridSize+10, pos.y+gridSize+10);
}
function northWall(){
  rect(pos.x+5, pos.y+5, gridSize, wallThickness);
  // line(pos.x, pos.y, pos.x+gridSize, pos.y);
  // line(pos.x, pos.y+10, pos.x+gridSize, pos.y+10);
}

function southWall(){
  rect(pos.x+5,pos.y+gridSize, gridSize, wallThickness);
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

  noFill();
  strokeWeight(1);
  stroke(200);

  if(!cell.indoors){
    nHatches = 5;
    for(var i = 0; i < nHatches; i++){
      line(pos.x+5, pos.y+5 +  gridSize/nHatches * i, pos.x  +5+  gridSize/nHatches * i, pos.y +5);

      line(pos.x+5 +  gridSize/nHatches * i, pos.y +gridSize+5, pos.x +gridSize+5, pos.y +  gridSize/nHatches * i + 5);

    }
  } 

  strokeWeight(1);
  stroke(0);

  rect(pos.x+5, pos.y+5, gridSize, gridSize);

  fill(0);
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
  noStroke();
  fill(230);
  // fill(85,85,255);
  text(Map.partForCell(cell), pos.x +20, pos.y+(gridSize-15));
}

function drawKey(){
  w = 354;
  h = 479;

  scaledW = 70;
  scaledH = (scaledW / 354) * h;

  col = 0;
  row = 0;
  noStroke();
  fill(125);
  textAlign(CENTER);
  textSize(14);
   
  for(var i = 0; i < images.length; i++){
    x = mapSize.width + col*90;
    y = 25 + scaledH*row;
    image(images[i], x, y + 20*row, 70, scaledH);
    text(filenames[i] + " [" + (partCount[filenames[i]] || 0) +"]", x + 30, y + scaledH + 20*row + 15);

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
  cols = ["a", "b", "c", "d" ,"e", "f","g","h","i"];
  rows = [0,1,2,3,4,5,6,7,8];

  push();
    fill(0);

  push();
    translate(0, height-15);
    for(var i = 0; i < cols.length; i++){
      text(cols[i], 50 + i*50, 10);  
    }
    translate(0, -(height-15));
  
    translate(width/2, 10);
    rotate(PI);
    translate(-width/2, -10);
    cols.reverse();
    for(var i = 0; i < cols.length; i++){
      text(cols[i], 50 + i*50, 10);  
    }
  pop();

  push();
    rows.reverse();
    for(var i = 0; i < rows.length; i++){
        text(rows[i], 10, 50 + i*50);  
    }

    translate(10, height/2);
    rotate(PI);
    translate(-10, -height/2);
    rows.reverse();
    for(var i = 0; i < rows.length; i++){
        text(rows[i], -width + 30, 50 + i*50);  
    }
    pop();
  pop();
}

function drawExit(){
  x = Game.exit.col * gridSize + 25;
  y = (8-Game.exit.row) * gridSize + 25;

  push();

  fill(255,0,0);
  rect(x + 5, y + 15, 40, 20);
  fill(255);
  textAlign(CENTER);
  // textSize(20);
  text("EXIT", x + 25, y +30);
  pop();
}

function draw(){
  // background(0,0,255);
  background(255);
  drawGrid();
  drawDoors();
  drawMap();
  drawExit();
  drawGridLabels();


  // drawKey();
}