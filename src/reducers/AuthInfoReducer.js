import { UPDATE_AUTH_INFO } from 'constants/types';

const initialState = null;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_AUTH_INFO:
      return action.payload;
    default:
      return state;
  }
}

export default reducer;