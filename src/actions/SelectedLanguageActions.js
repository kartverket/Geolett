import { UPDATE_SELECTED_LANGUAGE } from 'constants/types';

export const updateSelectedLanguage = language => dispatch => {
    dispatch({ type: UPDATE_SELECTED_LANGUAGE, payload: language });
}
