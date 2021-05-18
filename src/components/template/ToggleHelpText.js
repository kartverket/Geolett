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
           open: false           
        };
     }


render() { 
    return (
    <React.Fragment>
        <FontAwesomeIcon className={style.icon} icon="info-circle" color="#007bff" onClick={() => { this.setState({ open: !this.state.open }) }}/>
            <div className={`${style.openInfo} ${this.state.open ? style.open : style.close}`}>
                {this.props.translate(this.props.resourceKey)}
            </div>
        </React.Fragment>
        );
    }
}
const mapDispatchToProps = {
    translate
 };
 
 export default connect(null, mapDispatchToProps)(ToggleHelpText);