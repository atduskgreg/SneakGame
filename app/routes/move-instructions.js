import Ember from "ember";
import GameManager from "../models/game-manager";
// import PassManager from "../models/pass-manager";

export default Ember.Route.extend({
  setupController : function(controller, model){
    GameManager.transitionTo("moveInstructions");

    controller.set('instructions', Game.moveInstructions);
    controller.set('victims', Game.newShootingVictims());
  }
});