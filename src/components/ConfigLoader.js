// Dependencies
import { useEffect, useState } from "react";

// Components
import { load } from "components/config";

// Config
import translations from "config/translations.json";

const ConfigLoader = ({ ready, loading }) => {
    // State
    const [isLoaded, setIsLoaded] = useState(false);
    const [config, setConfig] = useState();

    useEffect(() => {
       load().then((config) => {
            setIsLoaded(true);
            setConfig({
                ...config,
                translations
            });
        });
    }, []);

    if (!isLoaded) {
        return loading ? loading() : null;
    }

    return ready(config);
};

export default ConfigLoader;
