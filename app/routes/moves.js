import Ember from "ember";
import GameManager from "../models/game-manager";

export default Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInput");
    currPlayer = Game.players[Object.keys(Game.players)[PassManager.playerIdx]];
    controller.set("model", currPlayer.legalMoves());
  }
});