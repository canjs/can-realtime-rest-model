var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var realtimeRestModel = require("./can-realtime-rest-model");
var GLOBAL = require("can-globals/global/global");
//var stealClone = require("steal-clone");
var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");

QUnit.module("can-realtime-rest-model");


QUnit.test("basics", function(assert){

    var Status = canReflect.assignSymbols({},{
        "can.new": function(val){

            return val.toLowerCase();
        },
        "can.getSchema": function(){
            return {
                type: "Or",
                values: ["new","assigned","complete"]
            };
        }
    });

    var Todo = DefineMap.extend("Todo",{
        _id: {identity: true, type: "number"},
        name: "string",
        complete: "boolean",
        dueDate: "date",
        points: "number",
        status: Status
    });
    var TodoList = DefineList.extend({
        "#": Todo
    });

    var connection = realtimeRestModel({
        Map: Todo,
        List: TodoList,
        url: "/api/todos/{_id}"
    });

    var todoStore = fixture.store([],new QueryLogic(Todo));

    fixture("/api/todos/{_id}",todoStore);
    QUnit.stop();

    var createdTodo,
        allList,
        pushCreatedTodo,
        listHandler = function(){};

    Todo.getList({}).then(function(list){
        assert.equal(list.length,0, "no items");
        allList = list;
        allList.on("length", listHandler);

        createdTodo = new Todo({
            name: "lawn",
            status: "NEW",
            dueDate: new Date(2017,3,30).toString()
        });
        return createdTodo.save();
    })
    // Test PUSH CREATE
    .then(function(todo){
        assert.equal(createdTodo, todo, "same todo after create");
        assert.equal(todo.status, "new", "converted through status");
        assert.equal(allList.length, 1, "one item added");

        return todoStore.createInstance({
            name: "push instance",
            complete: true,
            dueDate: new Date(2018,3,30).toString(),
            points: 10,
            status: "new"
        }).then(function(instance){
            return connection.createInstance(instance);
        }).then(function(created){
            pushCreatedTodo = created;
            QUnit.ok(created._id, "has an id");
            assert.equal(allList.length, 2, "one item added");
        });
    })
    // test UPDATE
    .then(function(){
        // going to create one more todo to also test gt
        return new Todo({
            name: "third todo",
            status: "NEW",
            dueDate: new Date(2000,3,30).toString()
        }).save().then(function(){

            createdTodo.assign({
                points: 20
            });
            return createdTodo.save()
            .then(function(){

                return Todo.getList({
                    sort: "-points",
                    filter: {dueDate: {$gt: new Date(2001,3,30).toString()}}
                }).then(function(list){
                    QUnit.deepEqual(list.serialize(),[
                        {
                            _id: 1,
                            name: "lawn",
                            status: "new",
                            dueDate: new Date(2017,3,30),
                            points: 20
                        },
                        {
                            _id: 2,
                            name: "push instance",
                            complete: true,
                            dueDate: new Date(2018,3,30),
                            points: 10,
                            status: "new"
                        }
                    ], "get list works");
                });

            });
        });
    })
    .then(function(){
        QUnit.start();
    },function(err){
        QUnit.ok(false,err);
        QUnit.start();
    });

});

QUnit.test("uses idProp", function(){

	var Restaurant = Map.extend({});

	var connection = realtimeRestModel({
		url: "/api/restaurants",
		queryLogic: new QueryLogic({
			identity: ["id"]
		}),
		Map: Restaurant,
		List: Restaurant.List,
		name: "restaurant"
	});

	fixture({
		"GET /api/restaurants/{_id}": function(request){
			return {id: 5};
		}
	});

	stop();
	connection.getData({_id: 5}).then(function(data){
		deepEqual(data, {id: 5}, "findOne");
		start();
	});


});



QUnit.skip("uses jQuery if loaded", 2, function() {
	stop();
	var old$ = GLOBAL().$;
	var fake$ = {
		ajax: function() {}
	};
	GLOBAL().$ = fake$;
	stealClone({}).import("can-connect/can/base-map/base-map").then(function(baseMap) {
		var connection = baseMap({
			Map: function() {},
			List: function() {},
			url: "/fake"
		});
		QUnit.equal(connection.ajax, fake$.ajax, "ajax is set from existing $");
	}).then(function() {
		GLOBAL().$ = undefined;
		return stealClone({}).import("can-connect/can/base-map/base-map");
	}).then(function(baseMap) {
		var connection = baseMap({
			Map: function() {},
			List: function() {},
			url: ''
		});
		QUnit.equal(connection.ajax, undefined, "ajax is not set when no $");
		GLOBAL().$ = old$;
		start();
	});
});
