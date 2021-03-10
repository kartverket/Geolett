// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

// Components
import Container from 'components/template/Container';
import { translate } from 'actions/ConfigActions';

// Actions
import { fetchRegisterItems } from 'actions/RegisterItemActions';


class RegisterItems extends Component {

   componentDidMount(){
      this.props.fetchRegisterItems();
   }

   renderRegisterItems(registerItems) {
      return registerItems && registerItems.length
         ? registerItems.map(registerItem => {
            return (
               <div>
                  <Link to={`registerItem/${registerItem.id}`}>
                     {registerItem.title}
                  </Link>
               </div>
            )
         }) : '';
   }

   render() {
      return (
         <Container>
            <h1>{this.props.translate('MeasureActivitiesTitle')}</h1>
            {this.renderRegisterItems(this.props.registerItems)}
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
