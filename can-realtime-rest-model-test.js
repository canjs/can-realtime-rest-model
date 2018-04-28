import QUnit from 'steal-qunit';
import plugin from './can-realtime-rest-model';

QUnit.module('can-realtime-rest-model');

QUnit.test('Initialized the plugin', function(){
  QUnit.equal(typeof plugin, 'function');
  QUnit.equal(plugin(), 'This is the can-realtime-rest-model plugin');
});
