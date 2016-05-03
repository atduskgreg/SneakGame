//based on 
 //http://joakim.beng.se/blog/posts/a-javascript-router-in-20-lines.html
(function () {

 
  // A hash to store our routes:
  var routes = {};
  // An array of the current route's events:
  var events = [];
  // The element where the routes are rendered:
  var el = null;
  // Context functions shared between all controllers:
  var ctx = {
    refresh: function (listeners) {
      listeners.forEach(function (fn) { fn(); });
    }
  };

  function route (path, controller) {
    var listeners = []; 
    controller["$refresh"] = ctx.refresh.bind(undefined, listeners);

    routes[path] = {templateId: controller.template, controller: controller, onRefresh: listeners.push.bind(listeners)};
  }

  function component (selector, controller){
    listeners = [];
    controller["$refresh"] = ctx.refresh.bind(undefined, listeners);

    for(var i = 0; i < $(selector).length; i++){
      render(controller.template, controller, $(selector)[i]);
    }
    controller.$refresh();
  }

  routeHistory = [];

  function render(templateId, ctrl, target){
    template = Handlebars.compile($("#"+templateId).html());
    if(ctrl.getData){
      target.innerHTML = template(ctrl.getData());
    } else {
      target.innerHTML = template();
    }


  console.log("binding actions for " + templateId ); 
    for(action in ctrl.actions){


      ele = $("."+action);

      if(ele.is("form")){
        ele.unbind("submit");
        ele.bind("submit", ctrl.actions[action]);
        // ele.bind("submit", ctrl.$refresh);
      } else if(ele.is("select")){
        ele.unbind("change");
        // ele.bind("change", ctrl.actions[action]);
        // ele.bind("change", ctrl.$refresh);
      }
      else {
        ele.unbind("click");
        ele.bind("click", ctrl.actions[action]);
        // ele.bind("click", ctrl.$refresh);
      }
      
    }
  }

  function router () {
    // TODO: make this setable in the api
    // Lazy load view element:
    el = el || document.getElementById('view');
    // events = [];
    // Current route url (getting rid of '#' in hash as well):
    var url = location.hash.slice(1) || '/';
    // Get route by url or fallback if it does not exist:

    var route = routes[url] || routes['*'];

    // Do we have a controller:
    if (route && route.controller) {
      var ctrl = route.controller;

      if(routeHistory.length > 0){
        prevRoute = routeHistory[routeHistory.length-1];
        if(prevRoute.controller.exit){
          prevRoute.controller.exit();
        }
      }
      
      routeHistory.push(route);

      if(route.controller.enter){
        route.controller.enter();
      }


      if (!el || !route.templateId) {
        // If there's nothing to render, abort:
        return;
      }
      // Listen on route refreshes:
      route.onRefresh(function () {
        render(route.templateId, route.controller, el);
      });
      // Trigger the first refresh:
      ctrl.$refresh();
    }
  }
  // Listen on hash change:
  this.addEventListener('hashchange', router);
  // Listen on page load:
  this.addEventListener('load', router);



  //public api

  Dog = {
    routes : routes,
    route : route,
    goToRoute : function(route){
      document.location.hash = "#/" + route;
    },
    Controller : function(args){
      for(val in args){
        this[val] = args[val];
      }
    },
    component : component
  }
  this.Dog = Dog;


})();
