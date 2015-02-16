import Ember from "ember";
import GameManager from "../models/game-manager";
import PassManager from "../models/pass-manager";

export default Ember.ObjectController.extend({
  model : {},
  instructions : null,
  actions : {
    confirm : function(){
      console.log("confirm moves");
      // Game.makeMoves();

      this.transitionToRoute("dialogs");
    }
  }
});