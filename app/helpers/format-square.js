import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper(function(square){
  return Util.squareDescription(square);
});