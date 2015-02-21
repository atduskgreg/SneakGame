import Ember from "ember";
import GameManager from "../models/game-manager";
// import PassManager from "../models/pass-manager";

export default Ember.ObjectController.extend({
  actions : {
    next : function(){
      this.get("passManager").next();
      if(this.get("passManager").get("currentState.name") == "done"){
        this.transitionToRoute("moves");
      }
    }
  }
});