// Dependencies
import React from "react";
import { connect } from "react-redux";
import { CallbackComponent } from "redux-oidc";
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';


class CallbackPage extends React.Component {
  successCallback = () => {
    const pathname = this.props && this.props.oidc && this.props.oidc.user && this.props.oidc.user.state && this.props.oidc.user.state.pathname ? this.props.oidc.user.state.pathname : '';
    this.props.history.push(pathname);
  };

  render() {
    return (
      <CallbackComponent
        userManager={this.props.userManager}
        successCallback={this.successCallback}
        errorCallback={error => {
          this.props.history.push("/");
          console.error(error);
        }}
      >
        <div>Logger inn...</div>
      </CallbackComponent>
    );
  }
}

CallbackPage.propTypes = {
  userManager: PropTypes.object.isRequired,
  pathname: PropTypes.string
};

const mapStateToProps = state => ({oidc: state.oidc});

export default withRouter(connect(mapStateToProps, null)(CallbackPage));
