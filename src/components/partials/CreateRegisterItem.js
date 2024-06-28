// Dependencies
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typeahead } from "react-bootstrap-typeahead";
import { toastr } from "react-redux-toastr";
import ValidationErrors from "components/partials/ValidationErrors";

// Geonorge Webcomponents
// eslint-disable-next-line no-unused-vars
import { GnButton, GnDialog, GnLabel, HeadingText } from "@kartverket/geonorge-web-components";

// Models
import { RegisterItem } from "models/registerItem";

// Actions
import { fetchOrganizations } from "actions/OrganizationsActions";
import { createRegisterItem, fetchRegisterItems } from "actions/RegisterItemActions";

// Helpers
import { canAddRegisterItem, canEditRegisterItemOwner } from "helpers/authorizationHelpers";

// Stylesheets
import "react-bootstrap-typeahead/css/Typeahead.css";

const CreateRegisterItem = () => {
    const dispatch = useDispatch();

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

    const saveRegisterItem = () => {
        const updatedRegisterItem = registerItem;
        const token = authToken?.access_token || null;

        if (!!selectedOwner?.length) {
            updatedRegisterItem.owner.id = selectedOwner[0].id;
        }

        dispatch(createRegisterItem(registerItem, token))
            .then(() => {
                closeDialog();
                setValidationErrors([]);
                dispatch(fetchRegisterItems(token));
                toastr.success("En ny veiledningstekst ble lagt til");
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
            <gn-dialog show={dialogOpen}>
                <heading-text>
                    <h2>Ny veiledningstekst</h2>
                </heading-text>
                <ValidationErrors errors={validationErrors} />
                <gn-label block>
                    <label htmlFor="contextType">Veiledningstekst    (påkrevd felt)</label>
                </gn-label>

                <gn-input block fullWidth>
                    <input
                        id="contextType"
                        name="contextType"
                        type="text"
                        defaultValue={registerItem.contextType}
                        onChange={handleChange}
                        required
                    />
                </gn-input>

                <gn-label block>
                    <label htmlFor="title">Navn på veiledningstekst (påkrevd felt)</label>
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
                            disabled={!registerItem?.contextType?.length || !registerItem?.title?.length}
                            onClick={saveRegisterItem}
                        >
                            Lagre
                        </button>
                    </gn-button>
                </div>
            </gn-dialog>
        </React.Fragment>
    ) : null;
};

export default CreateRegisterItem;
