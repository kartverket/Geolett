import { FETCH_OPTIONS } from 'constants/types';

const initialState = {};

const reducer = (state = initialState, options) => {
	switch (options.type) {
		case FETCH_OPTIONS:
			return options.payload;
		default:
			return state;
	}
}

export default reducer;
