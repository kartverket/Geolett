// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

// Components
import Container from "components/template/Container";
import RegisterItemDetails from "components/partials/RegisterItemDetails";

// Actions
import { fetchRegisterItem } from "actions/RegisterItemActions";

const RegisterItem = () => {
    const dispatch = useDispatch();
    const params = useParams();

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
        <Container>
            <RegisterItemDetails />
        </Container>
    ) : null;
};

export default RegisterItem;
