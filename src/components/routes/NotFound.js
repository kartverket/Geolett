// Dependencies
import React from "react";

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { HeadingText } from "@kartverket/geonorge-web-components";

// Stylesheets
import style from "components/routes/NotFound.module.scss";

// Assets
import notFoundIllustration from "images/svg/404_illustration.svg";

const notFoundIllustrationStyle = {
    backgroundImage: `url(${notFoundIllustration})`
};

const NotFound = () => {
    return (
        <div className={style.content}>
            <heading>
                <heading-text>
                    <h1 underline="true">Siden finnes ikke</h1>
                </heading-text>
                <div className={style.illustration} style={notFoundIllustrationStyle}>
                    <div className={style.illustrationText}>
                        <p>Vennligst prøv igjen senere.</p>
                    </div>
                </div>
            </heading>
        </div>
    );
};

export default NotFound;
