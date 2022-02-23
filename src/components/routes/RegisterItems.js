// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

// Components
import Container from 'components/template/Container';
import CreateRegisterItem from 'components/partials/CreateRegisterItem';

// Actions
import { fetchRegisterItems } from 'actions/RegisterItemActions';
import { fetchOptions } from 'actions/OptionsActions';

// Stylesheets
import style from 'components/routes/RegisterItems.module.scss'


class RegisterItems extends Component {

   constructor(props) {
      super(props);
      this.state = {
         registerItemsFetched: false
      };
   }

   componentDidMount() {
      this.props.fetchRegisterItems().then(() => {
         this.setState({ registerItemsFetched: true });
      });
   }

   getStatusLabel(statuses, registerItem) {

      return statuses && registerItem.status && statuses[registerItem.status - 1] &&
        statuses[registerItem.status -1].label ? statuses[registerItem.status - 1].label : '';
    }

   renderRegisterItems(registerItems) {
      const registerItemRows = registerItems?.length
         ? registerItems.filter(registerItem => { return registerItem; }).map(registerItem => {
            return (<tr key={registerItem.id}>
               <td>
                  <Link to={`${process.env.PUBLIC_URL}/${registerItem.id}/`}>
                     {registerItem.contextType}
                  </Link>
               </td>
               <td>
                  {registerItem.title}
               </td>
               <td>
                  {registerItem.owner?.name || ''}
               </td>
               <td>
                  {this.getStatusLabel(this.props.statuses, registerItem )}
               </td>
            </tr>)
         }) : null;
      return registerItemRows
         ? (
            <table className={style.registerItemsTable}>
               <thead>
                  <tr>
                     <th>Konteksttype</th>
                     <th>Tittel</th>
                     <th>Eier</th>
                     <th>status</th>
                  </tr>
               </thead>
               <tbody>{registerItemRows}</tbody>
            </table>
         )
         : '';
   }

   render() {
      if (!this.state.registerItemsFetched) {
         return ''
      }
      const registerItems = this.props.registerItems;
      return (
         <Container>
            <h1>Konteksttyper</h1>
            <CreateRegisterItem newRegisterItem />
            {this.renderRegisterItems(registerItems)}
         </Container>
      );
   }
}

const mapStateToProps = state => ({
   authInfo: state.authInfo,
   registerItems: state.registerItems,
   options: state.options,
   selectedLanguage: state.selectedLanguage,
   statuses: state.options.statuses
});

const mapDispatchToProps = {
   fetchRegisterItems,
   fetchOptions
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterItems);
