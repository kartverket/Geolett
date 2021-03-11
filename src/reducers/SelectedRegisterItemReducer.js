import { FETCH_REGISTER_ITEM } from 'constants/types';

const initialState = [];

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_REGISTER_ITEM:
            return action.payload
        default:
            return state;
    }
}

export default reducer;
