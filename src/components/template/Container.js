// Dependencies
import React from "react";

// Stylesheets
import style from "components/template/Container.module.scss";

const ContentContainer = (props) => {
    return (
        <div className={style.container}>
            {props.children}
        </div>
    );
};

export default ContentContainer;
