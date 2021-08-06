// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MainNavigation } from '@kartverket/geonorge-web-components/MainNavigation';

// Actions
import { updateOidcCookie } from 'actions/AuthenticationActions';
import { updateAuthInfo } from 'actions/AuthorizationActions';
import { updateSelectedLanguage } from 'actions/SelectedLanguageActions';

// Helpers
import { getEnvironmentVariable } from 'helpers/environmentVariableHelpers.js';

class NavigationBar extends Component {

  // 
  // Language logic is commented out as long as app is monolingual
  //


  constructor(props) {
    super(props);
    this.state = {
      mainNavigationIsInitialized: false
    };
  }

  componentDidMount() {
    /*
    if (!this.props.oidc.isLoadingUser) {
      this.initMainNavigation();
    }
    */
  }

  componentDidUpdate(prevProps) {
    /*
    if (!this.state.mainNavigationIsInitialized) {
      this.initMainNavigation();
    }
    */

    const wasLoggedIn = prevProps.authToken && prevProps.authToken.access_token && prevProps.authToken.access_token.length ? true : false;
    const isLoggedIn = this.props.authToken && this.props.authToken.access_token && this.props.authToken.access_token.length ? true : false;

    const hadAuthInfo = prevProps.authInfo && prevProps.authInfo.organizationNumber;
    const hasAuthInfo = this.props.authInfo && this.props.authInfo.organizationNumber;
    if ((isLoggedIn !== wasLoggedIn) || (hasAuthInfo !== hadAuthInfo)) {
      this.props.updateOidcCookie(this.props.oidc.user);
      this.props.updateAuthInfo();
    }
  }

  /*
  initMainNavigation() {
    MainNavigation.setup('main-navigation', {
      onNorwegianLanguageSelect: () => {
        this.props.updateSelectedLanguage('nb-NO');
      },
      onEnglishLanguageSelect: () => {
        this.props.updateSelectedLanguage('en-US');
      }
    });
    this.setState({
      mainNavigationIsInitialized: true
    });
  }
*/

  render() {
    const environment = getEnvironmentVariable('environment');
    const signinurl = getEnvironmentVariable('signinurl');
    const signouturl = getEnvironmentVariable('signouturl');
    const isLoggedIn = this.props.authToken && this.props.authToken.access_token && this.props.authToken.access_token.length ? true : false;
   // const language = this.props.selectedLanguage === 'en-US' ? 'en' : 'no';
    return <main-navigation signinurl={signinurl} signouturl={signouturl} isLoggedIn={isLoggedIn} environment={environment}></main-navigation>;
  }
}

const mapStateToProps = state => ({
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
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
