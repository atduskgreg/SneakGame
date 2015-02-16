import Ember from "ember";
import PassManager from "../models/pass-manager";

export default Ember.Handlebars.registerBoundHelper('currentPlayerPublic',function(){
  return "Player " + (PassManager.playerIdx + 1) ;
});