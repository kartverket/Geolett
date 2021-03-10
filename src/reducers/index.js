// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import { reducer as oidcReducer } from 'redux-oidc';

// Reducers
import AuthInfoReducer from 'reducers/AuthInfoReducer';
import ConfigReducer from 'reducers/ConfigReducer';
import RegisterItemsReducer from 'reducers/RegisterItemsReducer';

const reducers = history => combineReducers({
  router: connectRouter(history),
  oidc: oidcReducer,
  authInfo: AuthInfoReducer,
  config: ConfigReducer,
  registerItems: RegisterItemsReducer
});

export default reducers
