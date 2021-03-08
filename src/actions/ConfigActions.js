import { UPDATE_CONFIG } from 'constants/types';

export const updateConfig = (config) => dispatch => {
  dispatch({ type: UPDATE_CONFIG, payload: config });
}

export const translate = (resourceKey, language) => (dispatch, getState) => {
  const store = getState();
  const translations = store.config.translations;
  language = language ? language : store.selectedLanguage;

  const translationsForLanguage = translations.find(translation => {
    return translation.culture === language;
  });

  return translationsForLanguage && translationsForLanguage.texts && translationsForLanguage.texts[resourceKey]
    ? translationsForLanguage.texts[resourceKey]
    : null
}
