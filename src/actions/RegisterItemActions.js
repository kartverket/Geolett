import { FETCH_REGISTER_ITEMS, FETCH_SELECTED_REGISTER_ITEM, CREATE_REGISTER_ITEM, UPDATE_REGISTER_ITEM, DELETE_REGISTER_ITEM } from 'constants/types';
import { apiUrls } from 'components/config';
import appApi from 'config/appApi';

export const fetchRegisterItems = () => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.getAll;   
   const response = await appApi().get(apiUrl);
   dispatch({ type: FETCH_REGISTER_ITEMS, payload: response.data });
}

export const fetchRegisterItem = (id) => async (dispatch) => {
   const apiUrl = apiUrls.measure.get.format({ id })
   const response = await appApi().get(apiUrl);
   dispatch({ type: FETCH_SELECTED_REGISTER_ITEM, payload: response.data });
}

export const createMeasure = (registerItem, user) => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.create;
   const response = await appApi(user).post(apiUrl, registerItem);

   dispatch({ type: CREATE_REGISTER_ITEM, payload: response.data });
}

export const updateRegisterItem = (registerItem, user) => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.update.format({ id: registerItem.id });
   const response = await appApi(user).put(apiUrl, registerItem);

   dispatch({ type: UPDATE_REGISTER_ITEM, payload: response.data });
}

export const deleteRegisterItem = (registerItem, user) => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.delete.format({ id: registerItem.id });
   const response = await appApi(user).delete(apiUrl);

   dispatch({ type: DELETE_REGISTER_ITEM, payload: response.data });
}
