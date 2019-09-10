@module {function} can-realtime-rest-model
@parent can-data-modeling
@collection can-core
@package ./package.json
@outline 2

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
automatically. This is detailed in the [Purpose](#Purpose) section below.

If your service layer matches what `realtimeRestModel` expects, configuring `realtimeRestModel` is very simple. For example, the following extends a `Todo` type with the ability to connect to a restful service layer:

```js
import { Todo, todoFixture, TodoList } from "//unpkg.com/can-demo-models@6";
import { realtimeRestModel } from "can";

// Creates a mock backend with 5 todos
todoFixture(5);

Todo.connection = realtimeRestModel({
    ArrayType: TodoList,
    ObjectType: Todo,
    url: "/api/todos/{id}"
});

// Prints out all todo names

Todo.getList().then(todos => {
    todos.forEach(todo => {
        console.log(todo.name);
    });
});
```
  @codepen

@param {Object} options Configuration options supported by all the mixed-in behaviors:

- [can-connect/can/map/map._Map ObjectType] - The map type constructor function used to create
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

- [can-connect/can/map/map._List ArrayType] - The list type constructor function used to create
  a list of instances of the raw record data retrieved from the server. <span style="display:none">_</span>
- [can-connect/data/url/url.url] - Configure the URLs used to create, retrieve, update and
  delete data. It can be configured with a single url like:

  ```js
  url: "/services/todos/{_id}"
  ```

  Or an object that configures how to create, retrieve, update and delete individually:

  ```js
  url: {
    getListData: "GET /api/todos/find",
    getData: "GET /api/todo/get/{id}",
    createData: "POST /api/todo/create",
    updateData: "POST /api/todo/update?id={id}",
    destroyData: "POST /api/todo/delete?id={id}"
  }
  ```
- [can-connect/data/url/url.ajax] - Specify a method to use to make requests; [can-ajax] is used by default, but jQuery’s `.ajax` method can be passed.
- [can-connect/data/parse/parse.parseInstanceProp] - Specify the property to find the data that represents an instance item.
- [can-connect/data/parse/parse.parseInstanceData] - Returns the properties that should be used to
  [can-connect/constructor/constructor.hydrateInstance make an instance]
  given the results of [can-connect/connection.getData], [can-connect/connection.createData],
  [can-connect/connection.updateData],
  and [can-connect/connection.destroyData].
- [can-connect/data/parse/parse.parseListProp] Specify the property to find the list data within a `getList` response.
- [can-connect/data/parse/parse.parseListData] Return the correctly formatted data for a `getList` response.
- [can-connect/base/base.queryLogic] - Specify the identity properties of the
  type. This is built automatically from the `ObjectType` if [can-observable-object] is used.

@return {connection} A connection that is the combination of the options and all the behaviors
that `realtimeRestModel` adds.

@signature `realtimeRestModel(url)`

Create a connection with just a url. Use this if you do not need to pass in any other `options` to configure the connection.

For example, the following creates a `Todo` type with the ability to connect to a restful service layer:

```js
import {todoFixture} from "//unpkg.com/can-demo-models@6";
import {realtimeRestModel} from "can";

// Creates a mock backend with 5 todos
todoFixture(5);

const Todo = realtimeRestModel("/api/todos/{id}").ObjectType;

// Prints out all todo names
Todo.getList().then(todos => {
    todos.forEach(todo => {
        console.log(todo.name);
    });
});
```
  @codepen

@param {String} url The [can-connect/data/url/url.url] used to create, retrieve, update and
  delete data.

@return {connection} A connection that is the combination of the options and all the behaviors
that `realtimeRestModel` adds. The `connection` includes an `ObjectType` property which is the type
constructor function used to create instances of the raw record data retrieved from the server.


@body

## Purpose

`realtimeRestModel` extends [can-rest-model] with two new features:

- Automatic list management
- Unified instances and lists across requests with list and instance stores.

### Automatic list management

`realtimeRestModel` allows you to make changes to instances
and have the lists in the page update themselves
automatically. This can remove a lot of boilerplate from your
application. For example, if you make a simple component that
displays only completed todos sorted by name like:

```html
<completed-todos />

<script>
import { StacheElement } from "can";
import { Todo } from "../models/todo";

class CompletedTodos extends StacheElement {
    static view = `
        <h2>Completed Todos</h2>
        {{#each(todosPromise.value)}}
            <li>{{name}}</li>
        {{/each}}
    `;

    static props = {
        todosPromise: {
            get default() {
                return Todo.getList({
                    filter: {complete: true},
                    sort: "name"
                });
            }
        }
    };
}
customElements.define("completed-todos", CompletedTodos);
</script>
```

If other components are creating, updating, or destroying todos, this component
will update automatically. For example:

- Creating a completed todo as follows will automatically insert the todo
  in the `<completed-todos>` element’s list sorted by its name:

  ```js
  new Todo({name: "walk dog", complete: true}).save();
  ```
  This works because [can-query-logic] is able to know that the query
  `{ filter: {complete: true}, sort: "name" }` doesn’t contain data like
  `{name: "walk dog", complete: true}`.

- Creating a todo with `complete: false` will __not__ update the `<completed-todos>`’s ArrayType:
  ```js
  new Todo({name: "walk dog", complete: false}).save();
  ```
  This works because [can-query-logic] is able to know that the query
  `{ filter: {complete: true}, sort: "name" }` doesn’t contain data like
  `{name: "walk dog", complete: false}`.

- Updating a todo’s `name` or `complete` value will move the todo
  in or out of the `<completed-todos>`’s list and put it in the
  right position.  For example, a todo that’s not complete can be
  moved into the list like:

  ```js
  todo.complete = true;
  todo.save();
  ```
- Destroying a todo will remove the todo from all lists:
  ```js
  todo.destroy();
  ```

The following code example uses `realtimeRestModel` to create a list of todos that automatically updates itself when new todos are created.

```html
<todo-create></todo-create>
<todo-list></todo-list>

<script type="module">
import { realtimeRestModel, StacheElement } from "can";
import { Todo, todoFixture, TodoList } from "//unpkg.com/can-demo-models@6";

// Creates a mock backend with 5 todos
todoFixture(5);

Todo.connection = realtimeRestModel({
    ArrayType: TodoList,
    ObjectType: Todo,
    url: "/api/todos/{id}"
});

class TodoList extends StacheElement {
    static view = `
      <ul>
          {{# if(this.todosPromise.isResolved) }}
              {{# for(todo of this.todosPromise.value) }}
                  <li>
                      <label>{{todo.name}}</label>
                  </li>
              {{/ for }}
          {{/ if }}
      </ul>
    `;

    static props = {
        todosPromise: {
            get() {
                return Todo.getList();
            }
        }
    };
}

customElements.define("todo-list", TodoList);

class TodoCreate extends StacheElement {
    static view = `
        <form on:submit="createTodo(scope.event)">
            <p>
                <label>Name</label>
                <input on:input:value:bind="this.todo.name" />
            </p>
            <button disabled:from="this.todo.isSaving()">Create Todo</button>
            {{# if(this.todo.isSaving()) }}Creating…{{/ if }}
        </form>
    `;

    static props = {
        todo: {
            get default() {
                return new Todo();
            }
        }
    };

    createTodo(event) {
        event.preventDefault();
        this.todo.save().then((createdTodo) => {
            this.todo = new Todo();
        });
    }
}
customElements.define("todo-create", TodoCreate);
</script>
```
@codepen

### List and instance stores

Additionally, `realtimeRestModel` unifies record and list instances.  This means that if you
request the same data twice, only one instance will be created
and shared. For example, if a `<todo-details>` widget loads the `id=5` todo, and another `<todo-edit>` widget loads the same data independently like:

```html
<todo-edit></todo-edit>
<br /></br />
<todo-details></todo-details>

<script type="module">
import { realtimeRestModel, StacheElement } from "can";
import { Todo, todoFixture, TodoList } from "//unpkg.com/can-demo-models@6";

// Creates a mock backend with 6 todos
todoFixture(6);

Todo.connection = realtimeRestModel({
    ArrayType: TodoList,
    ObjectType: Todo,
    url: "/api/todos/{id}"
});

class TodoDetails extends StacheElement {
    static view = `
        Todo name is: {{ this.todoPromise.value.name }}
    `;

    static props = {
        todoPromise: {
            get default() {
                return Todo.get({
                    id: 5
                });
            }
        }
    };
}

customElements.define("todo-details", TodoDetails);

class TodoEdit extends StacheElement {
    static view = `
        Todo name is: <input value:bind="this.todoPromise.value.name"/>
    `;

    static props = {
        todoPromise: {
            get default() {
                return Todo.get({
                    id: 5
                });
            }
        }
    };
}

customElements.define("todo-edit", TodoEdit);

</script>
```
@codepen

If the user changes the todo’s name in the `<todo-edit>` widget, the` <todo-details>`
widget will be automatically updated.

Furthermore, if you wish to update the data in the page, you simply need to re-request the
data like:

```js
// Updates the id=5 todo instance
Todo.get({ id: 5 });

// Updates all incomplete todos
Todo.getList({ filter: { complete: false } });
```


## Use

Use `realtimeRestModel` to build a connection to a restful service
layer. `realtimeRestModel` builds on top of [can-rest-model]. Please
read the _"Use"_ section of [can-rest-model] before reading this _"Use"_ section.
This _"Use"_ section details knowledge needed in addition to  [can-rest-model]
to use `realtimeRestModel`, such as:

- Configuring [can-connect/base/base.queryLogic]
- Updating the page from server-side events  
- Simulating server-side events with [can-fixture]

### Configuring queryLogic

`realtimeRestModel` requires a properly
configured [can-connect/base/base.queryLogic]. If your server supports
`getList` parameters that match [can-query-logic/query can-query-logic’s default query structure], then no configuration
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

There’s a:

- [filter](http://jsonapi.org/format/#fetching-filtering) property for filtering records,
- [sort](http://jsonapi.org/format/#fetching-sorting) property for specifying the order to sort records, and
- [page](http://jsonapi.org/format/#fetching-pagination) property that selects a range of the sorted result. _The range indexes are inclusive_. Example: `{page: 0, end: 9}` returns 10 records.

> __NOTE__: [can-connect] does not follow the rest of the JSONAPI specification. Specifically
> [can-connect] expects your server to send back JSON data in a format described in [can-rest-model].

If you control the service layer, we __encourage__ you to make it match the default
[can-query-logic/query].  The default query structure also supports the following [can-query-logic/comparison-operators]: `$eq`, `$gt`, `$gte`, `$in`, `$lt`, `$lte`, `$ne`, `$nin`.

For more information on this `query` structure and how to configure a query logic
to match your service layer, read
[the configuration section of can-query-logic](./can-query-logic.html#Configuration).


### Updating the page from server-side events  

If your service layer can push events, you can call the connection’s
[can-connect/real-time/real-time.createInstance],
[can-connect/real-time/real-time.updateInstance], and [can-connect/real-time/real-time.destroyInstance]
to update the lists and instances on the page.  For example, if you have a socket.io connection,
you can listen to events and call these methods on the `connection` as follows:

```js
import io from "steal-socket.io";

const todoConnection = realtimeRestModel({
    ArrayType: TodoList,
    ObjectType: Todo,
    url: "/api/todos/{id}"
});

socket.on("todo created", (todo) => {
  todoConnection.createInstance(todo);
});

socket.on("todo updated", (todo) => {
  todoConnection.updateInstance(todo);
});

socket.on("todo removed", (todo) => {
  todoConnection.destroyInstance(todo);
});
```

### Simulating server-side events with can-fixture

[can-fixture] does not allow you to simulate server-side events. However, this
can be done relatively easily by calling [can-connect/real-time/real-time.createInstance],
[can-connect/real-time/real-time.updateInstance], or [can-connect/real-time/real-time.destroyInstance]
on your connection directly as follows:

```js
test("widget response to server-side events", function(assert) {
    const todoList = new TodoListComponent();

    todoConnection.createInstance({
        id: 5,
        name: "learn how to test",
        complete: false
    }).then(function() {
        // check to see that the list has been updated
        assert.ok( /learn how to test/.test(todoList.element.innerHTML) );
    });
});
```

While this works, it doesn’t make sure the record’s data is in the fixture
[can-fixture.store]. The fixture store also will add a unique `id`
property. To make sure the record is in the store, use `store.createInstance` on the store and
pass the result to `connection.createInstance` as follows:

```js
test("widget response to server-side events", function(assert) {
    const todoList = new TodoListComponent();

    todoStore.createInstance({
        name: "learn how to test",
        complete: false
    }).then(function(record) {
        return todoConnection.createInstance(record);
    }).then(function() {
        // check to see that the list has been updated
        assert.ok( /learn how to test/.test(todoList.element.innerHTML) );
    });
});
```
