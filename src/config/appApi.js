import axios from 'axios';

const createInstance = (token) => {
  const instance = axios.create({
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token && token.length ? `Bearer ${token}` : ''
    }
  });
  return instance;
}

export default createInstance;

