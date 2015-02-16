import Ember from "ember";
import GameManager from "../models/game-manager";

export default Ember.Route.extend({

  setupController : function(controller, model){
    GameManager.transitionTo("dialogReveal");
    // controller.set("model", currentPlayerKnowledge());
  }
});