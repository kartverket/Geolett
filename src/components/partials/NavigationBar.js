// Dependencies
import React, { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";

// Geonorge Webcomponents
// eslint-disable-next-line no-unused-vars
import { MainNavigation } from "@kartverket/geonorge-web-components/MainNavigation";

// Actions
import { updateOidcCookie } from "actions/AuthenticationActions";
import { updateAuthInfo } from "actions/AuthorizationActions";
import { updateSelectedLanguage } from "actions/SelectedLanguageActions";

// Helpers
import { getEnvironmentVariable } from "helpers/environmentVariableHelpers.js";

const NavigationBar = () => {
    const dispatch = useDispatch();

    // Redux store
    const oidc = useSelector((state) => state.oidc);
    const authToken = useSelector((state) => state.authToken);
    const authInfo = useSelector((state) => state.authToken);

    useEffect(() => {
        const isLoggedIn = !!authToken?.access_token?.length;
        const hasAuthInfo = !!authInfo?.organizationNumber?.length;

        if (isLoggedIn || hasAuthInfo) {
            dispatch(updateOidcCookie(oidc.user));
            dispatch(updateAuthInfo());
        }
    }, [dispatch, authInfo?.organizationNumber, authToken?.access_token, oidc.user]);

    const environment = getEnvironmentVariable("environment");
    const signinurl = getEnvironmentVariable("signinurl");
    const signouturl = getEnvironmentVariable("signouturl");
    const isLoggedIn = !!authToken?.access_token?.length;
    return (
        <main-navigation
            signinurl={signinurl}
            signouturl={signouturl}
            isLoggedIn={isLoggedIn}
            environment={environment}
        ></main-navigation>
    );
};

const mapStateToProps = (state) => ({
    oidc: state.oidc,
    config: state.config,
    authInfo: state.authInfo,
    authToken: state.authToken,
    selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
    updateOidcCookie,
    updateAuthInfo,
    updateSelectedLanguage
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
