// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import { reducer as oidcReducer } from 'redux-oidc';
import { reducer as toastrReducer } from 'react-redux-toastr'

// Reducers
import AuthInfoReducer from 'reducers/AuthInfoReducer';
import AuthTokenReducer from 'reducers/AuthTokenReducer';
import ConfigReducer from 'reducers/ConfigReducer';
import OrganizationsReducer from 'reducers/OrganizationsReducer';
import RegisterItemsReducer from 'reducers/RegisterItemsReducer';
import SelectedLanguageReducer from 'reducers/SelectedLanguageReducer';
import SelectedRegisterItemReducer from 'reducers/SelectedRegisterItemReducer';

const reducers = history => combineReducers({
  router: connectRouter(history),
  oidc: oidcReducer,
  toastr: toastrReducer,
  authInfo: AuthInfoReducer,
  authToken: AuthTokenReducer,
  config: ConfigReducer,
  organizations: OrganizationsReducer,
  registerItems: RegisterItemsReducer,
  selectedLanguage: SelectedLanguageReducer,
  selectedRegisterItem: SelectedRegisterItemReducer
});

export default reducers
