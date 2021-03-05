// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import { reducer as oidcReducer } from 'redux-oidc';

// Reducers
import AuthInfoReducer from 'reducers/AuthInfoReducer';
import ConfigReducer from 'reducers/ConfigReducer';

const reducers = history => combineReducers({
  router: connectRouter(history),
  oidc: oidcReducer,
  authInfo: AuthInfoReducer,
  config: ConfigReducer
});

export default reducers
