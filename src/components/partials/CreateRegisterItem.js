// Dependencies
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Typeahead } from "react-bootstrap-typeahead";
import { toastr } from "react-redux-toastr";
import ValidationErrors from "components/partials/ValidationErrors";

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
    const [modalOpen, setModalOpen] = useState(false);
    const [registerItem, setRegisterItem] = useState(new RegisterItem());
    const [selectedOwner, setSelectedOwner] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);

    const handleOwnerSelect = (data) => {
        setSelectedOwner(data);
    };

    const handleChange = (data) => {
        const updatedRegisterItem = registerItem;
        const { name, value } = data.target ? data.target : data;
        console.log("data", value);
        const parsed = parseInt(value);

        updatedRegisterItem[name] = isNaN(parsed) ? value : parsed;
        console.log(updatedRegisterItem);
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
                setModalOpen(false);
                setValidationErrors([]);
                dispatch(fetchRegisterItems(token));
                toastr.success("En ny konteksttype ble lagt til");
            })
            .catch(({ response }) => {
                setValidationErrors(response.data);
                toastr.error("Kunne ikke opprette konteksttype");
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

    return dataFetched && showAddRegisterItemContent() ? (
        <React.Fragment>
            <Button variant="primary" className="marginB-20" onClick={() => setModalOpen(true)}>
                Opprett konteksttype
            </Button>
            <Modal
                show={modalOpen}
                onHide={() => setModalOpen(false)}
                backdrop="static"
                centered
                keyboard={false}
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Ny konteksttype</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ValidationErrors errors={validationErrors} />
                    <Form.Group controlId="contextType">
                        <Form.Label>Konteksttype (påkrevd felt)</Form.Label>
                        <Form.Control
                            type="text"
                            name="contextType"
                            defaultValue={registerItem.contextType}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="title">
                        <Form.Label>Tittel (påkrevd felt)</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            defaultValue={registerItem.title}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formName">
                        <Form.Label>Eier</Form.Label>
                        <Typeahead
                            id="basic-typeahead-single"
                            labelKey="name"
                            onChange={handleOwnerSelect}
                            options={organizations}
                            selected={selectedOwner}
                            disabled={!canEditRegisterItemOwner(authInfo)}
                            placeholder="Legg til eier..."
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>
                        Avbryt
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!registerItem?.contextType?.length || !registerItem?.title?.length}
                        onClick={saveRegisterItem}
                    >
                        Lagre
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    ) : null;
};

export default CreateRegisterItem;
