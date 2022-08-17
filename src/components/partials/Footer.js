// Dependencies
import React from "react";
import { useSelector } from "react-redux";

// Geonorge Webcomponents
// eslint-disable-next-line no-unused-vars
import { GeonorgeFooter } from "@kartverket/geonorge-web-components/GeonorgeFooter";

// Helpers
import { getEnvironmentVariable } from "helpers/environmentVariableHelpers.js";

const Footer = () => {
    // Redux store
    const selectedLanguage = useSelector((state) => state.selectedLanguage);

    return (
        <geonorge-footer
            language={selectedLanguage}
            environment={getEnvironmentVariable("environment")}
            version={getEnvironmentVariable("BuildVersionNumber")}
        />
    );
};

export default Footer;
