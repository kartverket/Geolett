import * as Cookies from 'js-cookie';

export const updateOidcCookie = (user) => dispatch => {
  if (user) {
    const accessToken = user.access_token
      ? user.access_token
      : null;
    const expiresAt = user.expires_at
      ? user.expires_at * 1000
      : null;
    if (accessToken && expiresAt) {
      Cookies.set('oidcAccessToken', accessToken, {expires: new Date(expiresAt)});
    }
  }
};
