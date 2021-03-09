// Dependencies
import React from 'react';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { NavLink } from 'react-router-dom'
import { useSelector } from "react-redux";

// Stylesheets
import style from 'components/partials/Breadcrumbs.module.scss'

const SelectedMeasureBreadcrumb = () => {
   const selectedMeasure = useSelector(state => state.measures.selectedMeasure);

   return selectedMeasure ? (
      <span>{selectedMeasure.no} - {selectedMeasure.name}</span>
   ) : '';
};

const SelectedActivityBreadcrumb = () => {
   const selectedActivity = useSelector(state => state.activities.selectedActivity);

   return selectedActivity ? (
      <span>{selectedActivity.no} - {selectedActivity.name}</span>
   ) : '';
};

const routes = [
   { path: '/', breadcrumb: 'Tiltaksplan' },
   { path: '/tiltak/:measureId', breadcrumb: SelectedMeasureBreadcrumb },
   { path: '/tiltak/:measureId/ny-aktivitet', breadcrumb: 'Ny aktivitet' },
   { path: '/tiltak/:measureId/aktivitet/:activityId', breadcrumb: SelectedActivityBreadcrumb }
];

const options = {
   excludePaths: [
      '/tiltak',
      '/tiltak/:measureId/aktivitet'
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