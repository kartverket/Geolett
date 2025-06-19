// Dependencies
import React from "react";
import { createRoot } from "react-dom/client";
import * as serviceWorker from "./serviceWorker";
import "extensions";

// Components
import App from "App";

import ConfigLoader from "components/ConfigLoader";


// Stylesheets
import "index.scss";
import "@kartverket/geonorge-web-components/index.css";


const Main = () => {
    return <ConfigLoader ready={(config) => <App config={config} />} />;
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Main />);

serviceWorker.unregister();
