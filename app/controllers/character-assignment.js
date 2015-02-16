import Ember from "ember";
import GameManager from "../models/game-manager";
import PassManager from "../models/pass-manager";

export default Ember.ObjectController.extend({
  actions : {
    next : function(){
      PassManager.next();
      if(PassManager.get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      } else {

      }
    }
  }
});