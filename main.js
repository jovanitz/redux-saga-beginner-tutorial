import "babel-polyfill"

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import Counter from './Counter'
import reducer from './reducers'
import { delay } from 'redux-saga'
import { put, takeEvery, call } from 'redux-saga/effects'

export function request({
  url,
  body,
  method = 'get',
  token = false,
  accept = 'text/plain,text/html,application/json',
  contentType = 'application/json',
} = {}) {
  const baseHeaders = { Accept: accept };
  const headersWithToken = token ? { ...baseHeaders, Authorization: `Token ${ token }` } : baseHeaders;
  const headersWithContentType = contentType ? { ...headersWithToken, 'Content-Type': contentType } : headersWithToken;
  const init = { method, headers: headersWithContentType };
  const options = ![ 'get', 'head' ].includes(method.toLowerCase()) ? { ...init, body } : init;

  return fetch(url, options)
         .then(res => res.json() )
         .then(data => ({ data }) )
         .catch(ex => {
            console.log('parsing failed', ex);
            return ({ ex });
         });
}

function* onLogin() {
  console.log('algo');
  const options = {
    url: 'https://api-dev.urbvan.com/users/login/clients/',
    method:'post',
    body: JSON.stringify({
      email: 'dhararon@urbvan.com',
      password: 'urbvan1'
    })
  };
  const data = yield call(() =>request(options));
  console.log(data);
  if (data){
    yield put({ type: 'REQUEST_DONE', data });
  } else {
    yield () => console.log('error');
  }

}

// Our worker Saga: will perform the async increment task
function* incrementAsync() {
  yield delay(1000)
  yield put({ type: 'INCREMENT' })
}

// Our watcher Saga: spawn a new incrementAsync task on each INCREMENT_ASYNC
function* watchIncrementAsync() {
  yield takeEvery('INCREMENT_ASYNC', incrementAsync)
}

function* watchOnLogin() {
  yield takeEvery('ON_LOGIN', onLogin)
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
);

function* helloSaga() {
  console.log('Hello Sagas!')
}

function* helloSaga2() {

}

sagaMiddleware.run(watchIncrementAsync);
sagaMiddleware.run(watchOnLogin);

const action = type => store.dispatch({type})

function render() {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => action('INCREMENT')}
      onDecrement={() => action('DECREMENT')}
      onIncrementAsync={() => action('INCREMENT_ASYNC')}
      onLogin={() => action('ON_LOGIN')} />,
    document.getElementById('root')
  )
}

render()
store.subscribe(render)
