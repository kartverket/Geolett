// Types
import { UPDATE_AUTH_INFO } from 'constants/types';
import * as Cookies from 'js-cookie';

export const updateAuthInfo = () => (dispatch, getState) => {
  const store = getState();
  const user = store && store.oidc && store.oidc.user
    ? store.oidc.user
    : null;
  const savedAuthInfo = store && store.authInfo && Object.keys(store.authInfo).length
    ? store.authInfo
    : null;
  if (user && user.profile && user.profile.sub && !savedAuthInfo) {
    const accessToken = user.access_token
      ? user.access_token
      : null;
    const expiresAt = user.expires_at
      ? user.expires_at * 1000
      : null;

    if (accessToken && expiresAt) {
      const authInfoApiUrl = store && store.config && store.config.apiBaseURL ? `${store.config.apiBaseURL}/authzinfo` : null;
      fetch(authInfoApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken
        }
      }).then((res) => res.json()).then((authInfo) => {
        Cookies.set('authInfo', authInfo, { expires: new Date(expiresAt) });
        dispatch({ type: UPDATE_AUTH_INFO, payload: authInfo });
      });
    }
  }
}