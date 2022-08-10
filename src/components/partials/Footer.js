// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Geonorge Webcomponents
// eslint-disable-next-line no-unused-vars
import { GeonorgeFooter } from '@kartverket/geonorge-web-components/GeonorgeFooter';

// Helpers
import { getEnvironmentVariable } from 'helpers/environmentVariableHelpers.js';


export class Footer extends Component {
    render() {
        const isMapRoute = this.props.router?.location?.pathname === "/kart";
        return !isMapRoute ? (
            <React.Fragment>
                <geonorge-footer language={this.props.selectedLanguage} environment={getEnvironmentVariable('environment')} version={getEnvironmentVariable('BuildVersionNumber')} />
            </React.Fragment>
        ) : ''
    }
}


const mapStateToProps = state => ({
    router: state.router,
    resources: state.resources,
    selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
