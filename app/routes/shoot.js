import Ember from "ember";
import GameManager from "../models/game-manager";

export default Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("pickTarget");
    currPlayerKey = Object.keys(Game.players)[PassManager.playerIdx];
    currPlayer = Game.players[currPlayerKey];
    targets = Game.targetsFor(currPlayer);
    targetColors = [];
    for(var i = 0; i < targets.length; i++){
      targetColors.push(targets[i].color);
    }

    controller.set("targets", targetColors);
  }
});