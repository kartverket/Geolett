// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import style from 'components/template/Container.module.scss';

// Components
import Breadcrumbs from 'components/partials/Breadcrumbs';


class ContentContainer extends Component {
   render() {
      return (
         <div className={style.container}>
            <Breadcrumbs />
            {this.props.children}
         </div>
      );
   }
}

export default connect(null, null)(ContentContainer);
