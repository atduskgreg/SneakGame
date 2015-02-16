import Ember from "ember";
import PassManager from "../models/pass-manager";

export default Ember.Handlebars.makeBoundHelper(function(){
  return "Player " + (PassManager.playerIdx + 1) ;
});