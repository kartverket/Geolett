// Types
import { UPDATE_AUTH_INFO } from 'constants/types';

export const updateAuthInfo = () => (dispatch, getState) => {
  const store = getState();
  const token = store.authToken && store.authToken.access_token ? store.authToken.access_token : null;
  const savedAuthInfo = store && store.authInfo && Object.keys(store.authInfo).length
    ? store.authInfo
    : null;
  if (token && !savedAuthInfo) {
    const authInfoApiUrl = store && store.config && store.config.apiBaseURL ? `${store.config.apiBaseURL}/Authzinfo` : null;
    fetch(authInfoApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }).then((res) => res.json()).then((authInfo) => {
      dispatch({ type: UPDATE_AUTH_INFO, payload: authInfo });
    });

  }
}