import Ember from "ember";

// TODO:
//  Horrible hack that should go away when Game
//  and Player become proper model objects.
export default Ember.Handlebars.makeBoundHelper(function(){
  var result = "<div id='debug'><table id='board'>"
  for(var i = Game.boardHeight-1; i >= 0; i--){
      result += "<tr>";
      for(var j = 0; j <= Game.boardWidth-1; j++){
        result += "<td id='"+j+"x"+i+"'><span class='squareDescription'>"+Util.squareDescription({col: j, row: i})+"</span></td>";  
      }
     result += "</tr>";
    }
  result += "</table><div id='playerDebug'></div></div>";

  return new Handlebars.SafeString(result);
});