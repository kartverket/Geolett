import { FETCH_REGISTER_ITEMS, FETCH_REGISTER_ITEM, CREATE_REGISTER_ITEM, UPDATE_REGISTER_ITEM, DELETE_REGISTER_ITEM, CLONE_REGISTER_ITEM } from 'constants/types';
import { apiUrls } from 'components/config';
import appApi from 'config/appApi';

export const fetchRegisterItems = () => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.getAll;   
   const response = await appApi().get(apiUrl);
   dispatch({ type: FETCH_REGISTER_ITEMS, payload: response.data });
}

export const fetchRegisterItem = id => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.get.format({ id })
   const response = await appApi().get(apiUrl);
   dispatch({ type: FETCH_REGISTER_ITEM, payload: response.data });
}

export const createRegisterItem = (registerItem, token) => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.create;
   const response = await appApi(token).post(apiUrl, registerItem);

   dispatch({ type: CREATE_REGISTER_ITEM, payload: response.data });
}

export const updateRegisterItem = (registerItem, token) => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.update.format({ id: registerItem.id });
   const response = await appApi(token).put(apiUrl, registerItem);

   dispatch({ type: UPDATE_REGISTER_ITEM, payload: response.data });
}

export const deleteRegisterItem = (registerItem, token) => async (dispatch) => {
   const apiUrl = apiUrls.registerItem.delete.format({ id: registerItem.id });
   const response = await appApi(token).delete(apiUrl);

   dispatch({ type: DELETE_REGISTER_ITEM, payload: response.data });
}

export const cloneRegisterItem = (registerItem, token) => async (dispatch) => {
   let apiUrl = apiUrls.registerItem.clone;
   apiUrl = apiUrl.replace("{id}", registerItem.id);
   console.log(apiUrl);
   const response = await appApi(token).post(apiUrl , null);

   dispatch({ type: CLONE_REGISTER_ITEM, payload: response.data });
}
