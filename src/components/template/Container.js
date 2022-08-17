// Dependencies
import React from "react";

// Components
import Breadcrumbs from "components/partials/Breadcrumbs";

// Stylesheets
import style from "components/template/Container.module.scss";

const ContentContainer = (props) => {
    return (
        <div className={style.container}>
            <Breadcrumbs />
            {props.children}
        </div>
    );
};

export default ContentContainer;
