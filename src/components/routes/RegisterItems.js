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
         registerItemsFetched: false,
         registerItems: null,            
         sort: {
            column: null,
            direction: 'desc',
         }
      };
   }

   componentDidMount() {
      this.props.fetchRegisterItems() && this.props.fetchOptions().then(() => {
         this.setState({ registerItemsFetched: true });
      });
   }

   getStatusLabel(statuses, registerItem) {

      return statuses && registerItem.status && statuses[registerItem.status - 1] &&
        statuses[registerItem.status -1].label ? statuses[registerItem.status - 1].label : '';
   }

   setArrow = (column) => {
      let className = 'sort-direction';
      
      if (this.state.sort.column === column) {
        className += this.state.sort.direction === 'asc' ? ` ${style.asc}` : ` ${style.desc}`;
      }
      
      return className;
      };

   onSort = column => {
      return e => {
          const direction = this.state.sort.column ? (this.state.sort.direction === 'asc' ? 'desc' : 'asc') : 'asc'
          const sortedRegisterItems = this.props.registerItems.sort((a, b) => {
              if (column === 'contextType') {
               const nameA = a.contextType;
               const nameB = b.contextType;

               if (nameA < nameB)
                   return -1
               if (nameA < nameB)
                   return 1
               else return 0
               }
               else if (column === 'title') {
                  const nameA = a.title;
                  const nameB = b.title;
  
                  if (nameA < nameB)
                      return -1
                  if (nameA < nameB)
                      return 1
                  else return 0
               }
               else if (column === 'owner') {
                  const nameA = a.owner.name;
                  const nameB = b.owner.name;
  
                  if (nameA < nameB)
                      return -1
                  if (nameA < nameB)
                      return 1
                  else return 0
              }
               else if (column === 'status') {

                  const nameA = this.getStatusLabel(this.props.statuses, a)
                  const nameB = this.getStatusLabel(this.props.statuses, b)
   
                  if (nameA < nameB)
                     return -1
                  if (nameA < nameB)
                     return 1
                  else return 0

               }
              else {
                  return a.first - b.first
              }
          })

          if (direction === 'desc') {
            sortedRegisterItems.reverse()
          }
          

          this.setState({
            registerItems: sortedRegisterItems,
              sort: {
                  column,
                  direction,
              },
          })
      }
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
                     <th style={{cursor : 'pointer'}} onClick={this.onSort('contextType')}>Konteksttype<span className={this.setArrow('contextType')}></span></th>
                     <th style={{cursor : 'pointer'}} onClick={this.onSort('title')}>Tittel<span className={this.setArrow('title')}></span></th>
                     <th style={{cursor : 'pointer'}} onClick={this.onSort('owner')}>Eier<span className={this.setArrow('owner')}></span></th>
                     <th style={{cursor : 'pointer'}} onClick={this.onSort('status')}>Status<span className={this.setArrow('status')}></span></th>
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
