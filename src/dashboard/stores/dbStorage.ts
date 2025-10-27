import type { Todo, TodoDiff } from '../types/todo';
import type {Response} from './google.script.run';
import {run} from './google.script.run';
import {default as Actions} from '../../common/actions.js';
import {default as TodoDBError} from '../../common/todoDBError.js';

export default {load, insert, update, remove};

function _strToDateOne(record: any){
  record.createdAt = new Date(record.createdAt);
  record.updatedAt = new Date(record.updatedAt);
  return record;
};

function _strToDate(records: any[]){
  for (let i=0, l=records.length; i<l; ++i) {
    _strToDateOne(records[i]);
  };
  return records;
};

function _dateToNumberOne(todo: Todo){
  return {
    id       : todo.id,
    label    : todo.label,
    completed: todo.completed,
    createdAt: todo.createdAt?.getTime(),
    updatedAt: todo.updatedAt?.getTime()
  };
};

function load(todos: Todo[]) {
  run(
    function(error: number, result?: Response) {
        if (error) {
          // TODO BUSY
        } else {
          console.log(result)
          const records = _strToDate((result as Response).records as any[]);
          todos.push.apply(todos, records as Todo[]);
        };
    },
    Actions.get
  );
};

function insert(todos: Todo[], newTodo: Todo) {
  todos.push(newTodo);
  run(
    function(error, result) {
        const index = todos.indexOf(newTodo);
        if (error) {
          if (0 <= index) {
            todos.splice(index, 1);
            // error
          };
        } else {
          todos.splice(index, 1, _strToDateOne((result as Response).inserted as any));
        };
    },
    Actions.insert,
    // @ts-ignore
    {sheetIndex: 0, record: newTodo}
  );
};


function update(todos: Todo[], targetTodoOrTodos: Todo | Todo[], diff: TodoDiff) {
  if(Array.isArray(targetTodoOrTodos)){
    let query = '';
    for (let i=0, l=targetTodoOrTodos.length; i<l; ++i) {
      query += ',id=' + targetTodoOrTodos[i].id;
    };
    run(
      function(error, result) {
        console.log(error, result)
          if (error || !result?.updated) {

          } else {
            for (let i = targetTodoOrTodos.length; i;) {
              const todo = targetTodoOrTodos[--i];
              todos.splice(todos.indexOf(todo), 1, {...todo, ...diff});
            };
          };
      },
      Actions.update,
      // @ts-ignore
      {sheetIndex: 0, query: query.substr(1), diff}
    );
  } else {
    run(
      function(error, result) {
          if (error || !result?.updated) {

          } else {
            todos.splice(todos.indexOf(targetTodoOrTodos), 1, {...targetTodoOrTodos, ...diff});
          };
      },
      Actions.update,
      // @ts-ignore
      {sheetIndex: 0, record: {...diff, id:targetTodoOrTodos.id}}
    );
  };
};

function remove(todos: Todo[], targetTodoOrTodos: Todo | Todo[]) {
  if(Array.isArray(targetTodoOrTodos)){
    let query = '';
    for (let i=0, l=targetTodoOrTodos.length; i<l; ++i) {
      query += ',id=' + targetTodoOrTodos[i].id;
    };
    run(
      function(error, result) {
          if (error || !result?.deleted) {

          } else {
            for (let i = targetTodoOrTodos.length; i;) {
              const index = todos.indexOf(targetTodoOrTodos[--i]);
              todos.splice(index, 1);
            };
          };
      },
      Actions.delete,
      // @ts-ignore
      {sheetIndex: 0, query: query.substr(1)}
    );
  } else {
    run(
      function(error, result) {
          if (error || !result?.deleted) {

          } else {
            const index = todos.indexOf(targetTodoOrTodos as Todo);
            todos.splice(index, 1);
          };
      },
      Actions.delete,
      // @ts-ignore
      {sheetIndex: 0, record: _dateToNumberOne(targetTodoOrTodos)}
    );
  };
};
