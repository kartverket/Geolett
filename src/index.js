// Dependencies
import React from "react";
import { createRoot } from "react-dom/client";
import * as serviceWorker from "./serviceWorker";
import WebFont from "webfontloader";
import "extensions";

// Components
import App from "App";
import ConfigLoader from "components/ConfigLoader";

// Stylesheets
import "index.scss";

WebFont.load({
    google: {
        families: ["Raleway:100,400,500,700", "Open Sans:400,600,700", "sans-serif"]
    }
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ConfigLoader ready={(config) => <App config={config} />} />);

serviceWorker.unregister();
