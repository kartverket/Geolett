// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import { reducer as toastrReducer } from 'react-redux-toastr'

// Reducers
import AuthInfoReducer from 'reducers/AuthInfoReducer';
import AuthTokenReducer from 'reducers/AuthTokenReducer';
import ConfigReducer from 'reducers/ConfigReducer';
import OptionsReducer from 'reducers/OptionsReducer';
import OrganizationsReducer from 'reducers/OrganizationsReducer';
import RegisterItemsReducer from 'reducers/RegisterItemsReducer';
import SelectedLanguageReducer from 'reducers/SelectedLanguageReducer';
import SelectedRegisterItemReducer from 'reducers/SelectedRegisterItemReducer';
import authReducer from 'reducers/authReducer';

const reducers = history => combineReducers({
  router: connectRouter(history),
  auth: authReducer,
  toastr: toastrReducer,
  authInfo: AuthInfoReducer,
  authToken: AuthTokenReducer,
  config: ConfigReducer,
  organizations: OrganizationsReducer,
  options: OptionsReducer,
  registerItems: RegisterItemsReducer,
  selectedLanguage: SelectedLanguageReducer,
  selectedRegisterItem: SelectedRegisterItemReducer
});

export default reducers
