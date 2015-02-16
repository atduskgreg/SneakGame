import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('/');
  this.resource("setup");
  this.resource("characterAssignment");
  this.resource("moves");
  this.resource("moveInstructions");
  this.resource("dialogs");
  this.resource("dialogReveals");
  this.resource("shoot");
  this.resource("victory");
});

export default Router;
