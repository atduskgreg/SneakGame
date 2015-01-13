var Countdown = function(elem, options) {

  var timer  = elem,
      offset,
      clock,
      interval;

  // default options
  options = options || {};
  options.delay = options.delay || 1;

  // append elements     
  // elem.append(timer);

  // initialize
  reset();

  // private functions
  function createTimer() {
    return document.createElement("span");
  }

  function start() {
    if (!interval) {
      offset   = Date.now();
      interval = setInterval(update, options.delay);
    }
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
      if(options.onStop){
        options.onStop();
      }
    }
  }

  function reset() {
    clock = 0;
    render();
  }

  function update() {
    clock += delta();
    if(clock >= options.duration){
      clock = options.duration;
      stop();
    }
    render();
  }

  function render() {
    timer.html((options.duration - clock)/1000); 
  }

  function delta() {
    var now = Date.now(),
        d   = now - offset;

    offset = now;
    return d;
  }

  function getElapsed(){
    return clock;
  }

  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.elapsed = getElapsed;
};