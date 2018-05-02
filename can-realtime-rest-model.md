@module {function} can-realtime-rest-model
@parent can-data-modeling
@collection can-core

@description Connect a type to a restful data source and automatically manage
lists.

@signature `realtimeRestModel(options)`

`realtimeRestModel` is the base model layer that most CanJS applications should
use. It requires a properly configured [can-query-logic] which experimenters might
find cumbersome to configure. If you are experimenting with CanJS, or have a
very irregular service layer, [can-rest-model] might be a better fit.  For
everyone else, use `realtimeRestModel` as it adds the following behaviors on top of [can-rest-model]:


- [can-connect/constructor/store/store] - Unify instances and lists across requests.
- [can-connect/real-time/real-time] - Add, remove, and move items between lists automatically.


`realtimeRestModel` is useful even if you are not building a realtime
application. It allows you to make changes to instances
and have the lists in the page update themselves
automatically.  

If your service layer matches what `realtimeRestModel` expects, configuring  
`realtimeRestModel` is very simple.  For example,
the following defines a `Todo` and `TodoList` type and extends them
with the ability to connect to a restful service layer:

```js
import {DefineMap, DefineList, realtimeRestModel} from "can";

const Todo = DefineMap.extend("Todo",{
    id: {identity: true},
    name: "string",
    complete: "boolean"
})

const TodoList = DefineList.extend("TodoList",{
    get completeCount(){
        return this.filter({complete: true}).length;
    }
})

realtimeRestModel({
    Map: Todo,
    List: TodoList,
    url: "/todos/{id}"
});
```

@param {Object} options Configuration options supported by all the mixed-in behaviors:

- [can-connect/can/map/map._Map] - The map type constructor function used to create
  instances of the raw record data retrieved from the server.
  The type will also be decorated
  with the following methods:
  - [can-connect/can/map/map.getList]
  - [can-connect/can/map/map.get]
  - [can-connect/can/map/map.prototype.save]
  - [can-connect/can/map/map.prototype.destroy]
  - [can-connect/can/map/map.prototype.isSaving]
  - [can-connect/can/map/map.prototype.isDestroying]
  - [can-connect/can/map/map.prototype.isNew]

- [can-connect/can/map/map._List] - The list type constructor function used to create
  a list of instances of the raw record data retrieved from the server. <span style="display:none">_</span>
- [can-connect/data/url/url.url] - Configure the URLs used to create, retrieve, update and
  delete data. It can be configured with a single url like:

  ```js
  url: "/services/todos/{_id}"
  ```

  Or an object that configures how to create, retrieve, update and delete individually:

  ```js
  url: {
    getListData: "GET /services/todos",
    getData: "GET /services/todo/{id}",
    createData: "POST /services/todo",
    updateData: "PUT /services/todo/{id}",
    destroyData: "DELETE /services/todo/{id}"
  }
  ```
- [can-connect/data/url/url.ajax] - Specify a method to use to make requests. [can-ajax] is used by default.  But jQuery's `.ajax` method can be passed.
- [can-connect/data/parse/parse.parseInstanceProp] - Specify the property to find the data that represents an instance item.
- [can-connect/data/parse/parse.parseInstanceData] - Returns the properties that should be used to
  [can-connect/constructor/constructor.hydrateInstance make an instance]
  given the results of [can-connect/connection.getData], [can-connect/connection.createData],
  [can-connect/connection.updateData],
  and [can-connect/connection.destroyData].
- [can-connect/data/parse/parse.parseListProp]
- [can-connect/data/parse/parse.parseListData]
- [can-connect/base/base.queryLogic] - Specify the identity properties of the
  type. This is built automatically from the `Map` if [can-define/map/map] is used.

@return {connection} A connection that is the combination of the options and all the behaviors
that `realtimeRestModel` adds.


@body

## Purpose

`realtimeRestModel` allows you to make changes to instances
and have the lists in the page update themselves
automatically. This can remove a lot of boilerplate from your
application. For example, if you make a simple component that
displays only completed todos sorted by name like:

```js
import {Component} from "can";
import Todo from "../models/todo";

Component.extend({
    tag: "completed-todos",
    view: `
        <h2>Completed Todos</h2>
        {{#each(todosPromise.value)}}
            <li>{{name}}</li>
        {{/each}}
    `,
    ViewModel: {
        todosPromise: {
            value: () => Todo.getList({
                filter: {complete: true},
                sort: "name"
            })
        }
    }
})
```

If other components are creating, updating, or destroying todos, this component
will update automatically. For example:

- Creating a completed todo as follows will automatically insert the todo
  in the `<completed-todos>` element's list sorted by its name:

  ```js
  new Todo({name: "walk dog", complete: true}).save();
  ```
  This works because [can-query-logic] is able to know that the query
  `{ filter: {complete: true}, sort: "name" }` doesn't contain data like
  `{name: "walk dog", complete: true}`.

- Creating an incomplete todo will __not__ update the `<completed-todos>`'s list:
  ```js
  new Todo({name: "walk dog", complete: false}).save();
  ```
  This works because [can-query-logic] is able to know that the query
  `{ filter: {complete: true}, sort: "name" }` doesn't contain data like
  `{name: "walk dog", complete: false}`.

- Updating a todo's `name` or `complete` value will move the todo
  in or out of the `<completed-todos>`'s list and put it in the
  right position.  For example, a todo that's incomplete will be
  moved into the list like:

  ```js
  todo.complete = true;
  todo.save();
  ```
- Destroying a todo will remove the todo from all lists:
  ```js
  todo.destroy();
  ```

## Use

Use `realtimeRestModel` to build a connection to a restful service
layer. `realtimeRestModel` builds on top of [can-rest-model]. Please
read the _"Use"_ section of [can-rest-model] before reading this _"Use"_ section.  
This _"Use"_ section details the knowledge needed in addition to  [can-rest-model]
to make `realtimeRestModel` work.

`realtimeRestModel` requires a properly
configured [can-connect/base/base.queryLogic]. If you server supports
`getList` parameters that match [can-query-logic/query can-query-logic's default query structure], then no configuration
is likely necessary. The default `query` structure looks like:

```js
Todo.getList({
    // Selects only the todos that match.
    filter: {
        complete: {$in: [false, null]}
    },
    // Sort the results of the selection
    sort: "-name",
    // Selects a range of the sorted result
    page: {start: 0, end: 19}
})
```

This structures follows the [Fetching Data JSONAPI specification](http://jsonapi.org/format/#fetching).

There's:

- a [filter](http://jsonapi.org/format/#fetching-filtering) property for filtering records,
- a [sort](http://jsonapi.org/format/#fetching-sorting) property for specifying the order to sort records, and
- a [page](http://jsonapi.org/format/#fetching-pagination) property that selects a range of the sorted result. _The range indexes are inclusive_.

> __NOTE__: [can-connect] does not follow the rest of the JSONAPI specification. Specifically
> [can-connect] expects your server to send back JSON data in a format described in [can-rest-model].

If you control the service layer, we __encourage__ you to make it match the default
[can-query-logic/query].  The default query structure also supports the following [can-query-logic/comparison-operators]: `$eq`, `$gt`, `$gte`, `$in`, `$lt`, `$lte`, `$ne`, `$nin`.

For more information on this `query` structure and how to configure a query logic
to match your service layer, read
[the configuration section of can-query-logic](./can-query-logic.html#Configuration).
