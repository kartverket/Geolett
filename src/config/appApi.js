import axios from 'axios';

const createInstance = (user) => {
  const instance = axios.create({
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': user && user.access_token ? `Bearer ${user.access_token}` : ''
    }
  });
  return instance;
}

export default createInstance;

