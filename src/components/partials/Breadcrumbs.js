// Dependencies
import React from 'react';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { NavLink } from 'react-router-dom'
import { useSelector } from "react-redux";

// Stylesheets
import style from 'components/partials/Breadcrumbs.module.scss'

const SelectedRegisterItemBreadcrumb = () => {
   const selectedRegisterItem = useSelector(state => state.selectedRegisterItem);
   return selectedRegisterItem ? (
      <span>{selectedRegisterItem.title}</span>
   ) : '';
};

const routes = [
   { path: '/', breadcrumb: 'Geolett' },
   { path: '/registerItem/:registerItemId', breadcrumb: SelectedRegisterItemBreadcrumb },
   { path: '/registerItem/:registerItemId/ny-registerItem', breadcrumb: 'Ny registerItem' },
];

const options = {
   excludePaths: [
      '/registerItem'
   ]
};

const Breadcrumbs = ({ breadcrumbs }) => {
   const translations = useSelector(state => state.config.translations);
   const selectedLanguage = useSelector(state => state.selectedLanguage);
   const translationTexts = translations && translations.length && selectedLanguage ? translations.find(translation => {
      return translation.culture === selectedLanguage
   }).texts : null;
   const breadcrumbTranslation = translationTexts && translationTexts.Breadcrumb ? translationTexts.Breadcrumb : 'Du er her:';

   return (
      <div className={style.breadcrumbs}>
         <span>{breadcrumbTranslation} </span>
         <div>
            {breadcrumbs.map(({ match, breadcrumb }, index) => {
               return (
                  <span key={match.url}>
                     {
                        index < breadcrumbs.length - 1 ?
                           <NavLink to={match.url}>{breadcrumb}</NavLink> :
                           <span>{breadcrumb}</span>
                     }
                  </span>
               );
            })}
         </div>
      </div>
   );
};

export default withBreadcrumbs(routes, options)(Breadcrumbs);