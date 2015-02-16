import Ember from "ember";
import PassManager from "../models/pass-manager";

export default Ember.Handlebars.registerBoundHelper('currentPlayerInventory',function(){
  currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
  currPlayer = Game.players[currPlayerKey];

  var result = "";

  if(currPlayer.inventory.length > 0){
    for(var k =0; k < currPlayer.inventory.length; k++){
      result += "<li>" + currPlayer.inventory[k].name + "</li>";
    }
  } else {
    result += "<li>You have no items</li>";
  }
  
  return new Handlebars.SafeString(result);
});
