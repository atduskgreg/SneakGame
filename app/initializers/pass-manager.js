import PassManager from "../models/pass-manager";

export function initialize(container, application) {
  application.register('service:pass_manager', PassManager , { instantiate: false, singleton: true });

  application.inject('controller', 'passManager', 'service:pass_manager');
  // application.inject('route', 'passManager', 'service:pass_manager');
  application.inject('stateManager', 'passManager', 'service:passManager');
}

export default {
  name: 'passManager',
  initialize: initialize
};