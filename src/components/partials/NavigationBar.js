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

import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

const NavigationBar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    var loggedInCookie = Cookies.get('_loggedIn');
    console.log("Logged in cookie: " + loggedInCookie);
    console.log("isLoggedIn: " + isLoggedIn);
    let autoRedirectPath = null;

    var redirectCookie = Cookies.get('_redirect');

    if(!isLoggedIn && window.location.pathname.length > 1)
    {
        Cookies.set('_redirect', window.location.pathname);
    }

    // Redirect to signin page after token expire, todo handle browser reload using localstorage and date
    if (isLoggedIn || loggedInCookie === "true") {
        setTimeout(() => 
            {                
                console.log("Token expires, redirecting to signin page");
                location.href = signinurl;
            }, 1440000);
    }

    if (!isLoggedIn && loggedInCookie === "true") {
        location.href = signinurl;
    }        

    if(redirectCookie !== undefined && redirectCookie.length > 0 && isLoggedIn){
        autoRedirectPath = redirectCookie;
        Cookies.set('_redirect', '');
        navigate(autoRedirectPath);
    }

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
    statuses: state.options.statuses,
    selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
    updateOidcCookie,
    updateAuthInfo,
    updateSelectedLanguage
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
