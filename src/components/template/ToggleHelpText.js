// Dependencies
import React, { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";

// Actions
import { translate } from "actions/ConfigActions";

// Stylesheets
import style from "components/template/ToggleHelpText.module.scss";

const ToggleHelpText = (props) => {
    const dispatch = useDispatch();

    // State
    const [expanded, setExpanded] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const content = dispatch(translate(props.resourceKey));

    return content ? (
        <Fragment>
            <FontAwesomeIcon
                className={`${style.toggleIcon} ${expanded ? style.expanded : ""}`}
                icon="info-circle"
                color="#007bff"
                onClick={() => {
                    setExpanded(!expanded);
                    setInitialized(true);
                }}
            />
            <div
                className={`${style.content} ${initialized ? style.initialized : ""} ${expanded ? style.expanded : ""}`}
            >
                <div>{content}</div>
            </div>
        </Fragment>
    ) : null;
};

export default ToggleHelpText;
