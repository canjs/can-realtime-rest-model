/*can-realtime-rest-model@0.0.0#can-realtime-rest-model*/
define([
    'require',
    'exports',
    'module',
    'can-connect',
    'can-connect/constructor',
    'can-connect/can/map',
    'can-connect/constructor/store',
    'can-connect/data/callbacks',
    'can-connect/data/parse',
    'can-connect/data/url',
    'can-connect/real-time',
    'can-connect/constructor/callbacks-once',
    'can-namespace'
], function (require, exports, module) {
    var connect = require('can-connect');
    var constructor = require('can-connect/constructor');
    var canMap = require('can-connect/can/map');
    var constructorStore = require('can-connect/constructor/store');
    var dataCallbacks = require('can-connect/data/callbacks');
    var dataParse = require('can-connect/data/parse');
    var dataUrl = require('can-connect/data/url');
    var realTime = require('can-connect/real-time');
    var callbacksOnce = require('can-connect/constructor/callbacks-once');
    var namespace = require('can-namespace');
    function realtimeRestModel(options) {
        var behaviors = [
            constructor,
            canMap,
            constructorStore,
            dataCallbacks,
            dataParse,
            dataUrl,
            realTime,
            callbacksOnce
        ];
        return connect(behaviors, options);
    }
    module.exports = namespace.realtimeRestModel = realtimeRestModel;
});