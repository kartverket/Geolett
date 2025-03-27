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
import { authInfo } from "helpers/authorizationHelpers.js";

import Cookies from 'js-cookie';
import {useSearchParams} from "react-router-dom";

const NavigationBar = () => {
    const dispatch = useDispatch();
    let [searchParams] = useSearchParams();

    // Redux store
    const oidc = useSelector((state) => state.oidc);
    const authToken = useSelector((state) => state.authToken);
    const authInfo = useSelector((state) => state.authInfo);    
    useEffect(() => {
        const isLoggedIn = !!authToken?.access_token?.length;
        const hasAuthInfo = !!authInfo?.organizationNumber?.length;       

        if (isLoggedIn || hasAuthInfo) {
            dispatch(updateOidcCookie(oidc.user));
            dispatch(updateAuthInfo());
        }
    }, [dispatch, authInfo?.organizationNumber, authToken?.access_token, oidc.user]);

    const environment = getEnvironmentVariable("environment");
    let signinurl = getEnvironmentVariable("signinurl");
    const signouturl = getEnvironmentVariable("signouturl");
    const selectedLanguage = useSelector((state) => state.selectedLanguage);
    const isLoggedIn = !!authToken?.access_token?.length;

    var loggedInCookie = Cookies.get('_loggedInOtherApp');
    console.log("Logged in cookie: " + loggedInCookie);
    console.log("isLoggedIn: " + isLoggedIn);

    let returnGeoid = searchParams.get("login");

    if(!isLoggedIn && loggedInCookie === "true" && returnGeoid !== "true")
    {
        var pathName = window.location.pathname;
        var path = pathName.substring(1); //remove first / from path
        path = path.replace("geolett", "");
        signinurl = signinurl + path + "?login=true";
        console.log("Redirecting to signin page with return url: " + signinurl);
        window.location.href = signinurl;
    }

    // Redirect to signin page after token expire, todo handle browser reload using localstorage and date
    if (isLoggedIn || loggedInCookie === "true") {
        setTimeout(() => 
            {                
                console.log("Token expires, redirecting to signin page");
                location.href = signinurl;
            }, 1440000);
    }

    return (<>
        <main-navigation
            signinurl={signinurl}
            signouturl={signouturl}
            isLoggedIn={isLoggedIn}
            environment={environment}           
            language={selectedLanguage}
            userinfo={JSON.stringify(authInfo)}
            organization={JSON.stringify(authInfo)}    
        ></main-navigation></>
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
