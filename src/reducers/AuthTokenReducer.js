import { UPDATE_AUTH_TOKEN } from 'constants/types';

const initialState = null;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_AUTH_TOKEN:
      return action.payload;
    default:
      return state;
  }
}

export default reducer;