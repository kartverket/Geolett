import { FETCH_OPTIONS } from 'constants/types';
import { apiUrls } from 'components/config';
import axios from 'axios';

export const fetchOptions = () => async (dispatch, getState) => {
   let options = getState().options;

   if (objectIsEmpty(options)) {
      const apiUrl = apiUrls.options.getAll;
      const response = await axios.get(apiUrl);
      options = response.data;
   }

   dispatch({ type: FETCH_OPTIONS, payload: options });
}

const objectIsEmpty = (obj) => {
   return Object.keys(obj).length === 0 && obj.constructor === Object;
}