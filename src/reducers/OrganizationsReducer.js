import { FETCH_ORGANIZATIONS } from 'constants/types';

const initialState = [];

const reducer = (state = initialState, options) => {
	switch (options.type) {
		case FETCH_ORGANIZATIONS:
			return options.payload;
		default:
			return state;
	}
}

export default reducer;
