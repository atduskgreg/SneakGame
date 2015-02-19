import PassManager from "../models/pass-manager";

export function initialize(container, application) {
  application.register('service:pass_manager', PassManager , { instantiate: false });
  application.inject('controller', 'pass_manager', 'service:pass_manager');
}

export default {
  name: 'passManager',
  initialize: initialize
};