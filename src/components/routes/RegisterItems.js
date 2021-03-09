// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Components
import Container from 'components/template/Container';
import { translate } from 'actions/ConfigActions';

// Actions
import { fetchRegisterItems } from 'actions/RegisterItemActions';


class RegisterItems extends Component {

   render() {
      return (
         <Container>
            <h1>{this.props.translate('MeasureActivitiesTitle')}</h1>
         </Container>
      )
   }
}

const mapStateToProps = state => ({
   authInfo: state.authInfo,
   registerItems: state.registerItems,
   options: state.options,
   selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
   fetchRegisterItems,
   translate
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterItems);
