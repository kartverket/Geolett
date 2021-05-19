// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import style from 'components/template/ToggleHelpText.module.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translate } from 'actions/ConfigActions';


class ToggleHelpText extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            content: this.props.translate(this.props.resourceKey)
        };
    }


    render() {
        return this.state.content?.length 
        ? (
            <React.Fragment>
                <FontAwesomeIcon className={`${style.toggleIcon} ${this.state.expanded ? style.expanded : ''}`} icon="info-circle" color="#007bff" onClick={() => { this.setState({ expanded: !this.state.expanded }) }} />
                <div className={`${style.content} ${this.state.expanded ? style.expanded : ''}`}>
                  <div>{this.state.content}</div>
                </div>
            </React.Fragment>
        ) : '';
    }
}
const mapDispatchToProps = {
    translate
};

export default connect(null, mapDispatchToProps)(ToggleHelpText);