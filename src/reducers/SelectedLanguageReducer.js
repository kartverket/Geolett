import { UPDATE_SELECTED_LANGUAGE } from 'constants/types';

const initialState = 'nb-NO';

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_SELECTED_LANGUAGE:
            return action.payload;
        default:
            return state;
    }
}

export default reducer;
