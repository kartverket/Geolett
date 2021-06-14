// Types
import { UPDATE_AUTH_TOKEN } from 'constants/types';

// Dependencies
import * as Cookies from 'js-cookie';

// Helpers
import { getEnvironmentVariable } from 'helpers/environmentVariableHelpers.js';

export const updateOidcCookie = (user) => dispatch => {
  if (user) {
    const accessToken = user.access_token
      ? user.access_token
      : null;
    const expiresAt = user.expires_at
      ? user.expires_at * 1000
      : null;
    if (accessToken && expiresAt) {
      Cookies.set('oidcAccessToken', accessToken, { expires: new Date(expiresAt) });
    }
  }
};


export const fetchAuthToken = () => (dispatch, getState) => {
 const authTokenUrl =  getEnvironmentVariable('tokenurl');
  if (authTokenUrl) {
    fetch(authTokenUrl, {
      method: 'GET',
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json()).then((authToken) => {
      dispatch({ type: UPDATE_AUTH_TOKEN, payload: authToken });
    });
  }
}