// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { ContentContainer } from "@kartverket/geonorge-web-components";

// Components
import RegisterItemDetails from "components/partials/RegisterItemDetails";

// Actions
import { fetchRegisterItem } from "actions/RegisterItemActions";
import ShortcutButton from "components/partials/ShortcutButton";

const RegisterItem = ({userManager}) => {
    const dispatch = useDispatch();
    const params = useParams();
    console.log("RegisterItem : ", userManager);
    // Redux store
    const savedRegisterItem = useSelector((state) => state.selectedRegisterItem);

    // State
    const [registerItemFetched, setRegisterItemFetched] = useState(false);

    useEffect(() => {
        dispatch(fetchRegisterItem(params?.registerItemId)).then(() => {
            setRegisterItemFetched(true);
        });
    }, [dispatch, params?.registerItemId]);

    if (!registerItemFetched) {
        return "";
    }

    return savedRegisterItem && Object.keys(savedRegisterItem).length ? (
        <content-container>
            <ShortcutButton userManager={userManager} />              
            <RegisterItemDetails />
        </content-container>
    ) : null;
};

export default RegisterItem;
