import { USER_LOADED } from './authActions';

const initialState = {
  user: null,
  isAuthenticated: false,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    default:
      return state;
  }
}