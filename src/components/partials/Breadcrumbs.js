// Dependencies
import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

// Stylesheets
import style from "components/partials/Breadcrumbs.module.scss";

// Helpers
import { getEnvironmentVariable } from "helpers/environmentVariableHelpers.js";

const SelectedRegisterItemBreadcrumb = () => {
    const selectedRegisterItem = useSelector((state) => state.selectedRegisterItem);
    return selectedRegisterItem ? <span>{selectedRegisterItem.title}</span> : null;
};

const routes = [
    { path: "/", breadcrumb: "" },
    { path: "/geolett", breadcrumb: "Geolett" },
    { path: "/geolett/:registerItemId", breadcrumb: SelectedRegisterItemBreadcrumb },
    { path: "/geolett/:registerItemId/ny-registerItem", breadcrumb: "Ny registerItem" }
];

const options = {
    excludePaths: ["/registerItem"]
};

const Breadcrumbs = () => {
    const breadcrumbs = useBreadcrumbs(routes, options);

    const translations = useSelector((state) => state.config.translations);
    const selectedLanguage = useSelector((state) => state.selectedLanguage);

    const translationTexts =
        translations?.length && selectedLanguage
            ? translations.find((translation) => {
                  return translation.culture === selectedLanguage;
              }).texts
            : null;

    const breadcrumbTranslation = translationTexts?.Breadcrumb || "Du er her:";

    return (
        <div className={style.breadcrumbs}>
            <span>{breadcrumbTranslation}</span>
            <span>
                {" "}
                <a href={getEnvironmentVariable("registerUrl")} target="_top">
                    Registrene
                </a>
            </span>
            <div>
                {breadcrumbs.map(({ match, breadcrumb }, index) => {
                    return (
                        <span key={match.pathname}>
                            {index < breadcrumbs.length - 1 ? (
                                <NavLink to={match.pathname}>{breadcrumb}</NavLink>
                            ) : (
                                <span>{breadcrumb}</span>
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default Breadcrumbs;
