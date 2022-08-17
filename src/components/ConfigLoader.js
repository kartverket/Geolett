// Dependencies
import { useEffect, useState } from "react";

// Components
import { load } from "components/config";

// Config
import translations from "config/translations.json";

const ConfigLoader = (props) => {
    // State
    const [isLoaded, setIsLoaded] = useState(false);
    const [config, setConfig] = useState();

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await load();
            config.translations = translations;
            setIsLoaded(true);
            setConfig(config);
        };
        fetchConfig();
    }, []);

    if (!isLoaded) {
        return props.loading ? this.props.loading() : null;
    }
    return props.ready(config);
};

export default ConfigLoader;
