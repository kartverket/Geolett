export const config = {};
export const apiUrls = {};

async function load() {
    const result = await fetch('/config.json');
    const newconfig = await result.json();

    for (let prop in config) {
        delete config[prop];
    }

    for (let prop_1 in newconfig) {
        config[prop_1] = newconfig[prop_1];
    }

    await loadConfigFromApi(`${config.apiBaseURL}/config`);

    return config;
}


async function loadConfigFromApi(url) {
    const response = await fetch(url);
    const apiConfig = await response.json();

    for (let prop in apiConfig) {
        config[prop] = apiConfig[prop];
    }

    for (let prop in config.apiUrls) {
        apiUrls[prop] = config.apiUrls[prop]
    }
}

export { load };
