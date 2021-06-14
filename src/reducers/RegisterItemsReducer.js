import { FETCH_REGISTER_ITEMS } from 'constants/types';

const initialState = [];

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_REGISTER_ITEMS:
            return action.payload
        default:
            return state;
    }
}

export default reducer;
