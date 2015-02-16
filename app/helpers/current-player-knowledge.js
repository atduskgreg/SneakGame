import Ember from "ember";
import PassManager from "../models/pass-manager";

export default Ember.Handlebars.registerBoundHelper('currentPlayerKnowledge',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];

  // itemize (highlight) new knowledge gained
  // show total knowledge
  var result = "";

  if(Object.keys(currPlayer.knowledge).length > 0){

    for(i in currPlayer.knowledge){
  
       result += "<li>"
      if(currPlayer.knowledge[i].acquired == Game.roundNum ){
        result += "<b>NEW</b> "
      }
      result += Util.knowledgeDescription(currPlayer.knowledge[i]) + "</li>";
    }
  } else {
    result += "<li>You know nothing.</li>"
  }

  return new Handlebars.SafeString(result);
});