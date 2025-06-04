// Dependencies
import React, { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
// Geonorge Webcomponents
import { GnShortcutButton } from "@kartverket/geonorge-web-components/GnShortcutButton";

// Helpers
import { getEnvironmentVariable } from "helpers/environmentVariableHelpers.js";

const ShortcutButton = () => { 

function getToken() {
       return authToken?.access_token
    }

    // store
    const authToken = useSelector((state) => state.authToken);
    const selectedLanguage = useSelector((state) => state.selectedLanguage);

 useEffect(() => {
        const isLoggedIn = authToken?.access_token?.length;
        if (isLoggedIn) {
            GnShortcutButton.setup("gn-shortcut-button", {
                getAuthToken: getToken
            });
        }
    }, [getToken, authToken?.access_token]);

    return (
        <gn-shortcut-button language={selectedLanguage} environment={getEnvironmentVariable("environment")}           
        ></gn-shortcut-button>
    );
}
const mapStateToProps = (state) => ({
    oidc: state.oidc,
    config: state.config,    
    authToken: state.authToken,    
    selectedLanguage: state.selectedLanguage
});


export default connect(mapStateToProps, null)(ShortcutButton);

