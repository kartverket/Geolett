// Dependencies
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';

// Reducers
import createRootReducer from 'reducers';

export const history = createBrowserHistory();

const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});

export default function configureStore(preloadedState, userManager) {
  const middleware = [thunk];
  const history = createBrowserHistory();
  const store = createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        ...middleware,
        routerMiddleware(history)
      )
    )
  );
  // Replace loadUser with your own logic:
  return userManager.then((manager) => {
    manager.getUser().then((user) => {
      if (user && !user.expired) {
        store.dispatch({ type: 'USER_LOADED', payload: user });
      }
    });
    return store;
  });
}
