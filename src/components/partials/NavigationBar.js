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

  constructor(props) {
    super(props);
    this.state = {
      mainNavigationIsInitialized: false
    };
  }

  componentDidMount() {
    if (!this.props.oidc.isLoadingUser) {
      this.initMainNavigation();
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.state.mainNavigationIsInitialized) {
      this.initMainNavigation();
    }
    const wasLoggedIn = prevProps.oidc.user;
    const isLoggedIn = this.props.oidc.user;
    const hadAuthInfo = prevProps.authInfo && prevProps.authInfo.organizationNumber;
    const hasAuthInfo = this.props.authInfo && this.props.authInfo.organizationNumber;
    if ((isLoggedIn !== wasLoggedIn) || (hasAuthInfo !== hadAuthInfo)) {
      this.props.updateOidcCookie(this.props.oidc.user);
      this.props.updateAuthInfo();
    }
  }

  initMainNavigation() {
    const userManager = this.props.userManager;
    MainNavigation.setup('main-navigation', {
      onSignInClick: () => {
        userManager.signinRedirect();
      },
      onSignOutClick: () => {
        userManager.signoutRedirect({ 'id_token_hint': this.props.oidc.user.id_token });
        userManager.removeUser();
      },
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

  render() {
    const environment = getEnvironmentVariable('environment');
    const language = this.props.selectedLanguage === 'en-US' ? 'en' : 'no';
    return <main-navigation language={language} isLoggedIn={this.props.oidc.user ? true : false} environment={environment}></main-navigation>;
  }
}

const mapStateToProps = state => ({
  oidc: state.oidc,
  config: state.config,
  authInfo: state.authInfo,
  selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
  updateOidcCookie,
  updateAuthInfo,
  updateSelectedLanguage
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
