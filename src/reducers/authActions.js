export const SET_USER = "SET_USER";

export const userLoaded = (user) => ({
  type: SET_USER,
  payload: user,
});