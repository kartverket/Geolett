import { UPDATE_CONFIG } from 'constants/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CONFIG:
      return action.payload;
    default:
      return state;
  }
}

export default reducer;