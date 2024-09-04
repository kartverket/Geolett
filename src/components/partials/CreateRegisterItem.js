// Dependencies
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typeahead } from "react-bootstrap-typeahead";
import { toastr } from "react-redux-toastr";
import ValidationErrors from "components/partials/ValidationErrors";

import ToggleHelpText from "components/template/ToggleHelpText";

import dama from "images/svg/dama.svg";
import dibkscreenshot from "images/svg/dibk-screenshot.png";

// Geonorge Webcomponents
// eslint-disable-next-line no-unused-vars
import { GnButton, GnDialog, GnLabel, HeadingText } from "@kartverket/geonorge-web-components";

// Models
import { RegisterItem } from "models/registerItem";

// Actions
import { fetchOrganizations } from "actions/OrganizationsActions";
import { createRegisterItem, fetchRegisterItems } from "actions/RegisterItemActions";
import { translate } from "actions/ConfigActions";

// Helpers
import { canAddRegisterItem, canEditRegisterItemOwner } from "helpers/authorizationHelpers";

// Stylesheets
import "react-bootstrap-typeahead/css/Typeahead.css";
import formsStyle from "components/partials/forms.module.scss";
import { useNavigate } from "react-router";

const CreateRegisterItem = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux store
    const organizations = useSelector((state) => state.organizations);
    const authInfo = useSelector((state) => state.authInfo);
    const authToken = useSelector((state) => state.authToken);

    // State
    const [dataFetched, setDataFetched] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [registerItem, setRegisterItem] = useState(new RegisterItem());
    const [selectedOwner, setSelectedOwner] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);

    const handleOwnerSelect = (data) => {
        setSelectedOwner(data);
    };

    const handleChange = (data) => {
        const updatedRegisterItem = registerItem;
        const { name, value } = data.target ? data.target : data;
        const parsed = parseInt(value);

        updatedRegisterItem[name] = isNaN(parsed) ? value : parsed;
        setRegisterItem(updatedRegisterItem);
    };

    const gotToItem = (id) => {
        navigate(`/geolett/${id}/edit`);
    }

    const saveRegisterItem = () => {
        const updatedRegisterItem = registerItem;
        const token = authToken?.access_token || null;

        if (!!selectedOwner?.length) {
            updatedRegisterItem.owner.id = selectedOwner[0].id;
        }       
        dispatch(createRegisterItem(registerItem, token))
            .then((response) => {                
                setValidationErrors([]);
                dispatch(fetchRegisterItems(token));
                toastr.success("En ny veiledningstekst ble lagt til"); 
                gotToItem(response.data.id);
            })
            .catch(({ response }) => {
                setValidationErrors(response.data);
                toastr.error("Kunne ikke opprette veiledningstekst");
            });
    };

    const showAddRegisterItemContent = () => {
        return !!registerItem && !!canAddRegisterItem(authInfo);
    };

    const getPreSelectedOwnerFromAuthInfo = useCallback(() => {
        return organizations.find((organization) => {
            return organization.orgNumber === authInfo?.organizationNumber;
        });
    }, [authInfo?.organizationNumber, organizations]);

    useEffect(() => {
        if (!dataFetched) {
            dispatch(fetchOrganizations()).then(() => {
                const preSelectedOwner = getPreSelectedOwnerFromAuthInfo();
                setDataFetched(true);
                setSelectedOwner(preSelectedOwner ? [preSelectedOwner] : []);
            });
        }
    }, [dataFetched, dispatch, getPreSelectedOwnerFromAuthInfo]);

    const openDialog = () => {
        setDialogOpen(false);
        setTimeout(() => {
            setDialogOpen(true);
        });
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };

    return dataFetched && showAddRegisterItemContent() ? (
        <React.Fragment>
            <gn-button color="primary">
                <button onClick={() => openDialog()}>Opprett veiledningstekst</button>
            </gn-button>
            <gn-dialog overflow="auto" show={dialogOpen}>
                <heading-text>
                    <h2>Ny veiledningstekst</h2>
                </heading-text>
                <ValidationErrors errors={validationErrors} />
                <div className={formsStyle.introbox}>
                        <heading-text><h5>{dispatch(translate("introGeolettDescriptionTitle", null, "tittel"))}</h5></heading-text>
                        <div className={formsStyle.textcontent}>{dispatch(translate("introGeolettDescription", null, "tittel"))}</div>
                        
                        
                        </div>
                <gn-label block>
                    <label htmlFor="title">Navn på veiledningstekst (påkrevd felt)</label>
                    <ToggleHelpText expanded="true"  resourceKey="titleDescription" />
                </gn-label>
                <gn-input block fullWidth>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        defaultValue={registerItem.title}
                        onChange={handleChange}
                        required
                    />
                </gn-input>

                <gn-label block>
                    <label htmlFor="owner">Eier</label>
                </gn-label>
                <gn-input block fullWidth>
                    <Typeahead
                        id="owner"
                        labelKey="name"
                        onChange={handleOwnerSelect}
                        options={organizations}
                        selected={selectedOwner}
                        disabled={!canEditRegisterItemOwner(authInfo)}
                        placeholder="Legg til eier..."
                    />
                </gn-input>
                <div>
                    <gn-button color="default">
                        <button onClick={() => closeDialog()}>Avbryt</button>
                    </gn-button>
                    <gn-button color="primary">
                        <button
                            disabled={!registerItem?.title?.length}
                            onClick={saveRegisterItem}
                        >
                            Opprett og start redigering
                        </button>
                    </gn-button>
                </div>
            </gn-dialog>
        </React.Fragment>
    ) : null;
};

export default CreateRegisterItem;
