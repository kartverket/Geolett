import { FETCH_ORGANIZATIONS } from 'constants/types';
import { apiUrls } from 'components/config';
import axios from 'axios';

export const fetchOrganizations = () => async (dispatch, getState) => {
   let organizations = getState().organizations;

   if (!organizations || !organizations.length) {
      const apiUrl = apiUrls.organizations.getAll;
      const response = await axios.get(apiUrl);
      organizations = response.data;
   }

   dispatch({ type: FETCH_ORGANIZATIONS, payload: organizations });
}