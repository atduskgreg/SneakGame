import Ember from "ember";
import GameManager from "../models/game-manager";
import PassManager from "../models/pass-manager";

export default Ember.ObjectController.extend({

  summary : function(){
    return this.get("characters")[0].color + " (" + this.get("characters")[0].name + ") and " + this.get("characters")[1].color+ " (" + this.get("characters")[1].name + ")";
  }.property("characters")
});