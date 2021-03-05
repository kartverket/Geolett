// Dependencies
import { createUserManager } from 'redux-oidc';

// Config
import { config } from 'components/config';

const configIsLoaded = () => {
  return new Promise((resolve, reject) => {
    if (config && config.oidc) {
      resolve(config);
    } else {
      window.setTimeout(() => {
        resolve(configIsLoaded());
      }, 100)
    }
  });
}

const getUserManagerConfigWhenReady = configIsLoaded().then((config) => {
  const userManagerConfig = config.oidc;
  return createUserManager(userManagerConfig);
})

export default getUserManagerConfigWhenReady;
