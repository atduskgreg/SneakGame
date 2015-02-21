import Ember from "ember";
import GameManager from "../models/game-manager";
// import PassManager from "../models/pass-manager";

export default Ember.Route.extend({

  setupController : function(controller, model){
    GameManager.transitionTo("dialogs");

    var dialogs = Game.currentDialogs();
    var result = [];
    var keys = Object.keys(dialogs);
    for(var i = 0; i < keys.length; i++){
      result.push(dialogs[keys[i]]);
    }

    controller.set("model", result);
  }
});