var connect = require("can-connect");

var constructor = require("can-connect/constructor/constructor");
var canMap = require("can-connect/can/map/map");
var constructorStore = require("can-connect/constructor/store/store");
var dataCallbacks = require("can-connect/data/callbacks/callbacks");
var dataParse = require("can-connect/data/parse/parse");
var dataUrl = require("can-connect/data/url/url");
var realTime = require("can-connect/real-time/real-time");
var callbacksOnce = require("can-connect/constructor/callbacks-once/callbacks-once");
var namespace = require("can-namespace");

function realtimeRestModel(options){

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

	return connect(behaviors,options);
}

module.exports = namespace.realtimeRestModel = realtimeRestModel;
