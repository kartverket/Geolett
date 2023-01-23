// Dependencies
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toastr } from "react-redux-toastr";
import Modal from "react-bootstrap/Modal";
import { Typeahead, withAsync } from "react-bootstrap-typeahead";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";

// Components
import { SelectDropdown } from "components/custom-elements";
import ValidationErrors from "components/partials/ValidationErrors";
import ToggleHelpText from "components/template/ToggleHelpText";

// Actions
import { updateRegisterItem, deleteRegisterItem, cloneRegisterItem } from "actions/RegisterItemActions";
import { fetchOrganizations } from "actions/OrganizationsActions";
import { translate } from "actions/ConfigActions";
import { fetchOptions } from "actions/OptionsActions";

// Helpers
import { canDeleteRegisterItem, canEditRegisterItem, canEditRegisterItemOwner } from "helpers/authorizationHelpers";
import { getEnvironmentVariable } from "helpers/environmentVariableHelpers.js";

// Stylesheets
import formsStyle from "components/partials/forms.module.scss";

const AsyncTypeahead = withAsync(Typeahead);

const RegisterItemDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux store
    const savedRegisterItem = useSelector((state) => state.selectedRegisterItem);
    const statuses = useSelector((state) => state.options.statuses);
    const authToken = useSelector((state) => state.authToken);
    const authInfo = useSelector((state) => state.authInfo);
    const organizations = useSelector((state) =>
        state.organizations.map((organization) => {
            return {
                organizationId: organization.id,
                name: organization.name
            };
        })
    );

    // State
    const [newRegisterItem, setNewRegisterItem] = useState(savedRegisterItem);
    const [selectedOwner, setSelectedOwner] = useState(
        savedRegisterItem?.owner?.length ? [savedRegisterItem.owner] : []
    );
    const [selectedObjectTypeId, setSelectedObjectTypeId] = useState(null);
    const [editable, setEditable] = useState(false);
    const [newLinkText, setNewLinkText] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [dataFetched, setDataFetched] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [datasetSearchIsLoading, setDatasetSearchIsLoading] = useState(false);
    const [datasetOptions, setDatasetOptions] = useState([]);
    const [objectTypeOptions, setObjectTypeOptions] = useState([]);

    const handleChange = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target || data;
        const parsed = parseInt(value);
        registerItem[name] = isNaN(parsed) ? value : parsed;
        setNewRegisterItem(registerItem);
    };

    const handleDatasetChange = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target || data;
        const parsed = parseInt(value);
        registerItem.dataSet = registerItem.dataSet || {};
        registerItem.dataSet[name] = isNaN(parsed) ? value : parsed;
        setNewRegisterItem(registerItem);
    };

    const handleDatasetTypeReferenceChange = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target || data;
        const parsed = parseInt(value);
        registerItem.dataSet = registerItem.dataSet || {};
        registerItem.dataSet.typeReference = registerItem.dataSet.typeReference || {};
        registerItem.dataSet.typeReference[name] = isNaN(parsed) ? value : parsed;
        setNewRegisterItem(registerItem);

        if (name === "type") {
            const selectedObjectTypeOption = getSelectedObjectTypeOptionFromOptionValue(value);
            setSelectedObjectTypeId(selectedObjectTypeOption?.id);
        }
    };

    const handleChangeReferenceTek17 = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target || data;
        registerItem.reference = registerItem.reference || {};
        registerItem.reference.tek17 = registerItem.reference.tek17 || {};
        registerItem.reference.tek17[name] = value;
        setNewRegisterItem(registerItem);
    };

    const handleChangeReferenceOtherLaw = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target || data;
        registerItem.reference = registerItem.reference || {};
        registerItem.reference.otherLaw = registerItem.reference.otherLaw || {};
        registerItem.reference.otherLaw[name] = value;
        setNewRegisterItem(registerItem);
    };

    const handleChangeReferenceCircularFromMinistry = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target ? data.target : data;
        registerItem.reference = registerItem.reference || {};
        registerItem.reference.circularFromMinistry = registerItem.reference.circularFromMinistry || {};
        registerItem.reference.circularFromMinistry[name] = value;
        setNewRegisterItem(registerItem);
    };

    const handleOwnerSelect = (data) => {
        setSelectedOwner(data);
    };

    const handleDelete = () => {
        const registerItem = savedRegisterItem;
        const token = authToken?.access_token || null;

        dispatch(deleteRegisterItem(registerItem, token)).then(() => {
            navigate("/geolett");
        });
    };

    const handleAddLink = () => {
        const registerItem = savedRegisterItem;
        registerItem.links.push({
            link: {
                text: newLinkText,
                url: newLinkUrl
            }
        });
        setNewRegisterItem(registerItem);
        setNewLinkText("");
        setNewLinkUrl("");
    };

    const handleChangeLink = (data) => {
        const registerItem = savedRegisterItem;
        const { name, value } = data.target || data;
        const linkIndex = data?.target?.dataset?.linkIndex || null;
        if (!!linkIndex && registerItem?.links?.[linkIndex]) {
            registerItem.links[linkIndex].link[name] = value;
            setNewRegisterItem(registerItem);
        }
    };

    const handleDeleteLink = (linkIndex) => {
        const registerItem = savedRegisterItem;
        registerItem.links.splice(linkIndex, 1);
        setNewRegisterItem(registerItem);
    };

    const fetchDatasetDetails = (uuid) => {
        const kartkatalogApiUrl = getEnvironmentVariable("kartkatalogApiUrl");
        const datasetApiUrl = `${kartkatalogApiUrl}/getdata/${uuid}`;
        return fetch(datasetApiUrl)
            .then((response) => response.json())
            .then((result) => {
                return result;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const saveRegisterItem = () => {
        const registerItem = savedRegisterItem;
        const token = authToken?.access_token || null;

        if (selectedOwner?.[0]?.organizationId?.length) {
            registerItem.owner = {
                id: selectedOwner[0].organizationId
            };
        }

        dispatch(updateRegisterItem(registerItem, token))
            .then(() => {
                setValidationErrors([]);
                setEditable(false);
                toastr.success("Konteksttypen ble oppdatert");
            })
            .catch(({ response }) => {
                toastr.error("Kunne ikke oppdatere konteksttype");
                setValidationErrors(response.data);
                window.scroll(0, 0);
            });
    };

    const openModal = () => {
        setModalOpen(true);
    };

    const cloneRegister = () => {
        const registerItem = savedRegisterItem;
        const token = authToken?.access_token || null;

        if (selectedOwner?.[0]?.organizationId) {
            registerItem.owner = {
                id: selectedOwner[0].organizationId
            };
        }

        dispatch(cloneRegisterItem(registerItem, token))
            .then((result) => {
                setNewRegisterItem(result?.data);
                setValidationErrors([]);
                setEditable(true);
                toastr.success("Konteksttypen ble opprettet");
                window.scroll(0, 0);
                navigate(`/geolett/${result.data.id}`);
            })
            .catch((response) => {
                console.log(response);
                toastr.error("Kunne ikke opprette konteksttype");
                setValidationErrors(response?.data);
                window.scroll(0, 0);
            });
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleOnDatasetSearch = (query) => {
        setDatasetSearchIsLoading(true);
        const kartkatalogApiUrl = getEnvironmentVariable("kartkatalogApiUrl");
        fetch(`${kartkatalogApiUrl}/search?text=${query}&facets[0]name=type&facets[0]value=dataset&limit=25`, {
            headers: { "Accept-Language": "no" }
        }) // As long as app is monolingual
            .then((resp) => resp.json())
            .then((json) => {
                setDatasetSearchIsLoading(false);
                setDatasetOptions(
                    json.Results.map((dataset) => {
                        return {
                            title: dataset.Title,
                            urlMetadata: dataset.ShowDetailsUrl,
                            uuidMetadata: dataset.Uuid,
                            productSpecificationUrl: dataset.ProductSpecificationUrl
                        };
                    })
                );
            });
    };

    const handleDatasetSelect = (datasetArray) => {
        const dataset =
            datasetArray?.length && Array.isArray(datasetArray)
                ? datasetArray[0]
                : {
                      title: "",
                      urlMetadata: "",
                      uuidMetadata: "",
                      productSpecificationUrl: ""
                  };

        const registerItem = savedRegisterItem;
        registerItem.dataSet = registerItem.dataSet || {};
        registerItem.dataSet.title = dataset.title;
        registerItem.dataSet.urlMetadata = dataset.urlMetadata;
        registerItem.dataSet.uuidMetadata = dataset.uuidMetadata;

        if (dataset.productSpecificationUrl?.length) {
            getRegisterInfo(dataset.productSpecificationUrl).then((registerInfo) => {
                const gMLApplicationSchema = registerInfo?.GMLApplicationSchema;
                if (gMLApplicationSchema) {
                    registerItem.dataSet.urlGmlSchema = gMLApplicationSchema;
                    registerItem.dataSet.namespace = gMLApplicationSchema.substring(
                        0,
                        gMLApplicationSchema.lastIndexOf("/")
                    );
                    const applicationSchemaUrl = registerInfo.ApplicationSchema;
                    if (applicationSchemaUrl) {
                        getObjectTypeInfo(applicationSchemaUrl).then((objectTypeInfo) => {
                            const newObjectTypeOptions = getObjectTypeOptionsFromObjectTypeinfo(objectTypeInfo);
                            if (newObjectTypeOptions.length === 0) {
                                newObjectTypeOptions.unshift({
                                    id: "",
                                    label: "Ingen funnet"
                                });
                            } else {
                                newObjectTypeOptions.unshift({
                                    id: "",
                                    label: "Vennligst velg"
                                });
                            }
                            setObjectTypeOptions(newObjectTypeOptions);
                        });
                    }
                }
                setNewRegisterItem(registerItem);
            });
        } else {
            setObjectTypeOptions([{ id: "", label: "Ingen funnet" }]);
            registerItem.dataSet.urlGmlSchema = "";
            registerItem.dataSet.namespace = "";
            registerItem.dataSet.typeReference.type = "";
            registerItem.dataSet.typeReference.attribute = "";
            registerItem.dataSet.typeReference.codeValue = "";
            setNewRegisterItem(registerItem);
        }
    };

    const getObjectTypeOptionsFromObjectTypeinfo = (objectTypeInfo) => {
        return objectTypeInfo?.result?.SearchRecords?.length ? objectTypeInfo.result.SearchRecords.filter(searchRecord => {
            return (searchRecord.status === "Gyldig" || searchRecord.status === "Foreslått" || searchRecord.status === "Utkast") && searchRecord.stereotype === "objekttype";
        }).map(searchRecord => {
            return {
                id: searchRecord.id,  // Use display link to find attribute and code value ex: https://objektkatalog.geonorge.no/Objekttype/Index/EAID_0108C6D9_3D9C_47ba_AD4B_673A6E3327AE
                label: searchRecord.name
            };
        }) : null;
    }

    

    const getRegisterInfo = (url) => {
        url = url + ".json";
        url = url.replace("geonorge.no/", "geonorge.no/api/");
        return fetch(url)
            .then((response) => response.json())
            .then((result) => {
                return result;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const getObjectTypeInfo = (url) => {
        return fetch(url, { headers: { Accept: "application/json" } })
            .then((response) => response.json())
            .then((results) => {
                return results;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const getSelectedDatasetOption = () => {
        const registerItem = savedRegisterItem || null;
        const dataset = registerItem?.dataSet || null;
        return dataset
            ? [
                  {
                      title: dataset.title,
                      urlMetadata: dataset.urlMetadata,
                      uuidMetadata: dataset.uuidMetadata,
                      productSpecificationUrl: dataset.productSpecificationUrl
                  }
              ]
            : [];
    };

    const getStatusLabel = (statuses, registerItem) => {
        return statuses && registerItem.status && statuses[registerItem.status - 1]?.label
            ? statuses[registerItem.status - 1].label
            : "";
    };

    const getSelectedObjectTypeOptionFromOptionValue = useCallback(
        (optionValue) => {
            return objectTypeOptions.find((objectTypeOption) => {
                return objectTypeOption.label === optionValue;
            });
        },
        [objectTypeOptions]
    );

    useEffect(() => {
        if (!dataFetched) {
            Promise.all([dispatch(fetchOrganizations()), dispatch(fetchOptions())]).then(() => {
                const datasetUuid = savedRegisterItem?.dataSet?.uuidMetadata;
                if (datasetUuid) {
                    // TODO Check if applicationSchemaUrl can be saved on object
                    fetchDatasetDetails(datasetUuid).then((dataset) => {
                        if (dataset.ProductSpecificationUrl?.length) {
                            getRegisterInfo(dataset.ProductSpecificationUrl).then((registerInfo) => {
                                const gMLApplicationSchema = registerInfo?.GMLApplicationSchema;
                                if (gMLApplicationSchema) {
                                    const applicationSchemaUrl = registerInfo.ApplicationSchema;
                                    if (applicationSchemaUrl) {
                                        getObjectTypeInfo(applicationSchemaUrl).then((objectTypeInfo) => {
                                            setObjectTypeOptions(
                                                getObjectTypeOptionsFromObjectTypeinfo(objectTypeInfo)
                                            );
                                            const selectedObjectTypeOptionValue =
                                                savedRegisterItem?.dataSet?.typeReference?.type;
                                            if (selectedObjectTypeOptionValue) {
                                                setSelectedObjectTypeId(
                                                    getSelectedObjectTypeOptionFromOptionValue(
                                                        selectedObjectTypeOptionValue
                                                    )?.id
                                                );
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                setDataFetched(true);
            });
        }
    }, [
        dispatch,
        getSelectedObjectTypeOptionFromOptionValue,
        savedRegisterItem?.dataSet?.typeReference?.type,
        savedRegisterItem?.dataSet?.uuidMetadata,
        dataFetched
    ]);

    const renderLinks = (links) => {
        const linkListElements = links?.length
            ? links
                  .filter((linkItem) => {
                      return linkItem && linkItem.link;
                  })
                  .map((linkItem, linkIndex) => {
                      const link = linkItem.link;
                      return editable ? (
                          <div key={linkIndex} className={formsStyle.flex}>
                              <Form.Group controlId="labelLinkText" className={formsStyle.form}>
                                  <Form.Label>
                                      {dispatch(translate("labelLinkText", null, "Text"))}
                                      <ToggleHelpText resourceKey="linkTextDescription" />
                                  </Form.Label>
                                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                                      <Form.Control
                                          name="text"
                                          data-link-index={linkIndex}
                                          value={link.text}
                                          onChange={handleChangeLink}
                                      />
                                  </div>
                              </Form.Group>
                              <Form.Group controlId="labelLinkUrl" className={formsStyle.form}>
                                  <Form.Label>
                                      {dispatch(translate("labelLinkUrl", null, "URL"))}
                                      <ToggleHelpText resourceKey="linkUrlDescription" />
                                  </Form.Label>
                                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                                      <Form.Control
                                          name="url"
                                          data-link-index={linkIndex}
                                          value={link.url}
                                          onChange={handleChangeLink}
                                      />
                                  </div>
                              </Form.Group>
                              <Button
                                  variant="danger"
                                  className={formsStyle.form}
                                  onClick={() => {
                                      handleDeleteLink(linkIndex);
                                  }}
                              >
                                  Fjern
                              </Button>
                          </div>
                      ) : (
                          <div key={linkIndex}>
                              <a href={link.url}>{link.text}</a>
                          </div>
                      );
                  })
            : null;
        return (
            <div>
                {linkListElements?.length ? linkListElements : "Ingen lenker er lagt til"}
                {editable ? (
                    <React.Fragment>
                        <h3>Legg til ny lenke</h3>
                        <div key="newLink" className={formsStyle.flex}>
                            <Form.Group controlId="labelnewLinkText" className={formsStyle.form}>
                                <Form.Label>{dispatch(translate("labelnewLinkText", null, "Tekst"))}</Form.Label>
                                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                                    <Form.Control
                                        name="text"
                                        value={newLinkText}
                                        onChange={(event) => setNewLinkText(event.target.value)}
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group controlId="labelNewLinkUrl" className={formsStyle.form}>
                                <Form.Label>{dispatch(translate("labelNewLinkUrl", null, "URL"))}</Form.Label>
                                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                                    <Form.Control
                                        name="url"
                                        value={newLinkUrl}
                                        onChange={(event) => setNewLinkUrl(event.target.value)}
                                    />
                                </div>
                            </Form.Group>
                            <Button variant="primary" className={formsStyle.form} onClick={(event) => handleAddLink()}>
                                Legg til
                            </Button>
                        </div>
                    </React.Fragment>
                ) : null}
            </div>
        );
    };

    const registerItem = savedRegisterItem;
    if (!dataFetched) {
        return null;
    }

    return registerItem ? (
        <React.Fragment>
            <h1>{registerItem.contextType}</h1>

            <ValidationErrors errors={validationErrors} />

            <h2>Kontekstbeskrivelse</h2>

            <Form.Group controlId="labelContextType" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelContextType", null, "Konteksttype"))}
                    <ToggleHelpText resourceKey="contextTypeDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control name="contextType" value={registerItem.contextType} onChange={handleChange} />
                    </div>
                ) : (
                    <div>{registerItem.contextType}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelId" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelId", null, "ID"))}
                    <ToggleHelpText resourceKey="IdDescription" />
                </Form.Label>
                <div>{registerItem.id}</div>
            </Form.Group>

            <Form.Group controlId="labelTitle" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelTitle", null, "Tittel"))}
                    <ToggleHelpText resourceKey="titleDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control name="title" value={registerItem.title} onChange={handleChange} />
                    </div>
                ) : (
                    <div>{registerItem.title}</div>
                )}
            </Form.Group>

            <Form.Group controlId="formName" className={formsStyle.form}>
                <Form.Label>Status </Form.Label>
                {editable ? (
                    <div className={formsStyle.comboInput}>
                        <SelectDropdown
                            name="status"
                            value={registerItem.status || 1}
                            options={statuses}
                            onSelect={handleChange}
                            className={formsStyle.statusSelect}
                        />
                    </div>
                ) : (
                    <span>{getStatusLabel(statuses, newRegisterItem)}</span>
                )}
            </Form.Group>

            <Form.Group controlId="labelOwner" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelOwner", null, "Eier"))}
                    <ToggleHelpText resourceKey="ownerDescription" />
                </Form.Label>
                {editable ? (
                    <Typeahead
                        id="basic-typeahead-single"
                        labelKey="name"
                        onChange={handleOwnerSelect}
                        options={organizations}
                        selected={selectedOwner}
                        disabled={!canEditRegisterItemOwner(authInfo)}
                        placeholder="Legg til eier..."
                    />
                ) : (
                    <React.Fragment>
                        {registerItem.owner.name} ({registerItem.owner.orgNumber})
                    </React.Fragment>
                )}
            </Form.Group>

            <gb-label block>
                <label htmlFor="description">
                    {dispatch(translate("labelDescription", null, "Forklarende tekst"))}
                    <ToggleHelpText resourceKey="descriptionDescription" />
                </label>
            </gb-label>
            <div data-color-mode="light">
                { editable ? (
                    <MDEditor id="description" preview="edit" height={200} name="description" value={descriptionMarkdown || ''} onChange={(value) => {setDescriptionMarkdown(value); handleChange({name: "description", value: value})}} />
                ) : (
                <MDEditor.Markdown id="description" source={descriptionMarkdown}/>
                )
                }
                    </div>

            <Form.Group controlId="labelDialogText" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDialogText", null, "Dialogtekst"))}
                    <ToggleHelpText resourceKey="dialogTextDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control name="dialogText" value={registerItem.dialogText} onChange={handleChange} />
                    </div>
                ) : (
                    <div>{registerItem.dialogText}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelPossibleMeasures" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelPossibleMeasures", null, "Mulige tiltak"))}
                    <ToggleHelpText resourceKey="possibleMeasuresDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="possibleMeasures"
                            value={registerItem.possibleMeasures}
                            onChange={handleChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem.possibleMeasures}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelGuidance" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelGuidance", null, "Veiledning"))}
                    <ToggleHelpText resourceKey="guidanceDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control name="guidance" value={registerItem.guidance} onChange={handleChange} />
                    </div>
                ) : (
                    <div>{registerItem.guidance}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetBufferText" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetBufferText", null, "Buffertekst"))}
                    <ToggleHelpText resourceKey="dataSetBufferTextDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            name="bufferText"
                            value={registerItem?.dataSet?.bufferText || ""}
                            onChange={handleDatasetChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem?.dataSet?.bufferText || ""}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelBufferPossibleMeasures" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelBufferPossibleMeasures", null, "Mulige tiltak buffer"))}
                    <ToggleHelpText resourceKey="bufferPossibleMeasuresDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="bufferPossibleMeasures"
                            value={registerItem?.dataSet?.bufferPossibleMeasures || ""}
                            onChange={handleDatasetChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem?.dataSet?.bufferPossibleMeasures || ""}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetBufferDistance" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetBufferDistance", null, "Buffer"))}
                    <ToggleHelpText resourceKey="dataSetBufferDistanceDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            name="bufferDistance"
                            type="number"
                            value={registerItem?.dataSet?.bufferDistance || ""}
                            onChange={handleDatasetChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem?.dataSet?.bufferDistance || ""}</div>
                )}
            </Form.Group>

            <h2>Lenker</h2>
            {renderLinks(registerItem.links)}

            <h2>Kommentarer</h2>

            <Form.Group controlId="labelTechnicalComment" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelTechnicalComment", null, "Teknisk kommentar"))}
                    <ToggleHelpText resourceKey="technicalCommentDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            name="technicalComment"
                            value={registerItem.technicalComment}
                            onChange={handleChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem.technicalComment}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelOtherComment" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelOtherComment", null, "Andre kommentarer"))}
                    <ToggleHelpText resourceKey="otherCommentDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control name="otherComment" value={registerItem.otherComment} onChange={handleChange} />
                    </div>
                ) : (
                    <div>{registerItem.otherComment}</div>
                )}
            </Form.Group>

            <h2>
                Datasett
                <ToggleHelpText resourceKey="dataSetTitleDescription" />
            </h2>

            <Form.Group controlId="labelDataSetTitle" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetTitle", null, "Datasett-tittel"))}
                    <ToggleHelpText resourceKey="dataSetTitleDescription" />
                </Form.Label>
                {editable ? (
                    <AsyncTypeahead
                        id="dataset-search"
                        isLoading={datasetSearchIsLoading}
                        labelKey={(option) => `${option.title}`}
                        onSearch={(query) => handleOnDatasetSearch(query)}
                        onChange={handleDatasetSelect}
                        options={datasetOptions}
                        defaultSelected={getSelectedDatasetOption()}
                        placeholder="Søk etter datasett"
                    />
                ) : (
                    <a href={registerItem?.dataSet?.urlMetadata || ""}>
                        <h3>{registerItem?.dataSet?.title || ""}</h3>
                    </a>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetUrlMetadata" className={formsStyle.form}>
                {editable ? (
                    <React.Fragment>
                        <Form.Label>
                            {dispatch(translate("labelDataSetUrlMetadata", null, "Datasett-meta-url"))}
                            <ToggleHelpText resourceKey="dataSetUrlMetadataDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="urlMetadata"
                                value={registerItem?.dataSet?.urlMetadata || ""}
                                onChange={handleDatasetChange}
                            />
                        </div>
                    </React.Fragment>
                ) : null}
            </Form.Group>

            <Form.Group controlId="labelDataSetTypeReferenceType" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetTypeReferenceType", null, "Objekttype"))}
                    <ToggleHelpText resourceKey="dataSetTypeReferenceTypeDescription" />
                </Form.Label>
                {editable ? (
                    <React.Fragment>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="type"
                                as="select"
                                value={registerItem?.dataSet?.typeReference?.type || ""}
                                onChange={handleDatasetTypeReferenceChange}
                            >
                                {objectTypeOptions.map((objectTypeOption) => {
                                    return (
                                        <option key={objectTypeOption.id} value={objectTypeOption.label}>
                                            {objectTypeOption.label}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                        </div>
                        {registerItem?.dataSet?.typeReference?.type ? (
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={`https://objektkatalog.geonorge.no/Objekttype/Index/${selectedObjectTypeId}`}
                            >
                                Gå til objektkatalogen for å finne attributt og kodeverdi til{" "}
                                {registerItem.dataSet?.typeReference?.type}
                            </a>
                        ) : (
                            ""
                        )}
                    </React.Fragment>
                ) : (
                    <div>
                        <a href={`https://objektkatalog.geonorge.no/Objekttype/Index/${selectedObjectTypeId}`}>
                            {registerItem.dataSet?.typeReference?.type}
                        </a>
                    </div>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetTypeReferenceAttribute" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetTypeReferenceAttribute", null, "Attributt"))}
                    <ToggleHelpText resourceKey="dataSetTypeReferenceAttributeDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            name="attribute"
                            value={registerItem?.dataSet?.typeReference?.attribute || ""}
                            onChange={handleDatasetTypeReferenceChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem?.dataSet?.typeReference?.attribute || ""}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetTypeReferenceCodeValue" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetTypeReferenceCodeValue", null, "Kodeverdi"))}
                    <ToggleHelpText resourceKey="dataSetTypeReferenceCodeValueDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            name="codeValue"
                            value={registerItem?.dataSet?.typeReference?.codeValue || ""}
                            onChange={handleDatasetTypeReferenceChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem?.dataSet?.typeReference?.codeValue || ""}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetNamespace" className={formsStyle.form}>
                <Form.Label>
                    {dispatch(translate("labelDataSetNamespace", null, "Navnerom (skjemaplassering)"))}
                    <ToggleHelpText resourceKey="dataSetNamespaceDescription" />
                </Form.Label>
                {editable ? (
                    <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                        <Form.Control
                            name="namespace"
                            value={registerItem?.dataSet?.namespace || ""}
                            onChange={handleDatasetChange}
                        />
                    </div>
                ) : (
                    <div>{registerItem?.dataSet?.namespace || ""}</div>
                )}
            </Form.Group>

            <Form.Group controlId="labelDataSetUrlGmlSchema" className={formsStyle.form}>
                {editable ? (
                    <React.Fragment>
                        <Form.Label>
                            {dispatch(translate("labelDataSetUrlGmlSchema", null, "Lenke til GML-skjemaet"))}
                            <ToggleHelpText resourceKey="dataSetUrlGmlSchemaDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="urlGmlSchema"
                                value={registerItem?.dataSet?.urlGmlSchema || ""}
                                onChange={handleDatasetChange}
                            />
                        </div>
                    </React.Fragment>
                ) : registerItem?.dataSet?.urlGmlSchema?.length ? (
                    <div>
                        <a href={registerItem.dataSet.urlGmlSchema}>Lenke til GML-skjema</a>
                    </div>
                ) : (
                    ""
                )}
            </Form.Group>

            <h2>Referanser</h2>

            {editable ? (
                <div className={formsStyle.flex}>
                    <Form.Group controlId="labelReferenceTek17Text" className={formsStyle.form}>
                        <Form.Label>
                            {dispatch(translate("referenceTek17TextDescription", null, "ref-tek-17-tittel"))}
                            <ToggleHelpText resourceKey="referenceTek17TextDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="text"
                                value={registerItem?.reference?.tek17?.text || ""}
                                onChange={handleChangeReferenceTek17}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group controlId="labelReferenceTek17Url" className={formsStyle.form}>
                        <Form.Label>
                            {dispatch(translate("labelReferenceTek17Url", null, "ref-tek-17-url"))}
                            <ToggleHelpText resourceKey="referenceTek17UrlDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="url"
                                value={registerItem?.reference?.tek17?.url || ""}
                                onChange={handleChangeReferenceTek17}
                            />
                        </div>
                    </Form.Group>
                </div>
            ) : (
                <div>
                    <a href={registerItem?.reference?.tek17?.url || ""}>{registerItem?.reference?.tek17?.text || ""}</a>
                </div>
            )}

            {editable ? (
                <div className={formsStyle.flex}>
                    <Form.Group controlId="labelReferenceOtherLawText" className={formsStyle.form}>
                        <Form.Label>
                            {dispatch(translate("labelReferenceOtherLawText", null, "ref-annen lov/forskrift"))}
                            <ToggleHelpText resourceKey="referenceOtherLawTextDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="text"
                                value={registerItem?.reference?.otherLaw?.text || ""}
                                onChange={handleChangeReferenceOtherLaw}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group controlId="labelReferenceOtherLawUrl" className={formsStyle.form}>
                        <Form.Label>
                            {dispatch(translate("labelReferenceOtherLawUrl", null, "ref-annen lov/forskrift-url"))}
                            <ToggleHelpText resourceKey="referenceOtherLawUrlDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="url"
                                value={registerItem?.reference?.otherLaw?.url || ""}
                                onChange={handleChangeReferenceOtherLaw}
                            />
                        </div>
                    </Form.Group>
                </div>
            ) : (
                <div>
                    <a href={registerItem?.reference?.otherLaw?.url || ""}>
                        {registerItem?.reference?.otherLaw?.text || ""}
                    </a>
                </div>
            )}

            {editable ? (
                <div className={formsStyle.flex}>
                    <Form.Group controlId="labelReferenceCircularFromMinistryText" className={formsStyle.form}>
                        <Form.Label>
                            {dispatch(
                                translate("labelReferenceCircularFromMinistryText", null, "ref-rundskriv fra dep")
                            )}
                            <ToggleHelpText resourceKey="referenceCircularFromMinistryTextDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="text"
                                value={registerItem?.reference?.circularFromMinistry?.text || ""}
                                onChange={handleChangeReferenceCircularFromMinistry}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group controlId="labelReferenceCircularFromMinistryUrl" className={formsStyle.form}>
                        <Form.Label>
                            {dispatch(
                                translate("labelReferenceCircularFromMinistryUrl", null, "ref-rundskriv fra dep-url")
                            )}
                            <ToggleHelpText resourceKey="referenceCircularFromMinistryUrlDescription" />
                        </Form.Label>
                        <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                            <Form.Control
                                name="url"
                                value={registerItem?.reference?.circularFromMinistry?.url || ""}
                                onChange={handleChangeReferenceCircularFromMinistry}
                            />
                        </div>
                    </Form.Group>
                </div>
            ) : (
                <div>
                    <a href={registerItem?.reference?.circularFromMinistry?.url || ""}>
                        {registerItem?.reference?.circularFromMinistry?.text || ""}
                    </a>
                </div>
            )}

            <div className={formsStyle.btngroup}>
                {editable ? (
                    <div>
                        {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                            <React.Fragment>
                                <Button
                                    className="mr-2"
                                    variant="secondary"
                                    onClick={() => {
                                        setEditable(false);
                                    }}
                                >
                                    Avslutt redigering
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={!newRegisterItem?.contextType?.length || !newRegisterItem?.title?.length}
                                    onClick={saveRegisterItem}
                                >
                                    Lagre
                                </Button>
                            </React.Fragment>
                        ) : null}
                    </div>
                ) : (
                    <div>
                        {canDeleteRegisterItem(authInfo) ? (
                            <Button className="mr-2" variant="secondary" onClick={openModal}>
                                Slett konteksttype
                            </Button>
                        ) : null}
                        {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                            <Button className="mr-2" variant="secondary" onClick={cloneRegister}>
                                Dupliser konteksttype
                            </Button>
                        ) : null}
                        {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setEditable(true);
                                }}
                            >
                                Rediger konteksttype
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>

            <Modal
                show={modalOpen}
                onHide={closeModal}
                keyboard={false}
                animation={false}
                centered
                backdrop="static"
                aria-labelledby="form-dialog-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Slett konteksttype</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Er du sikker på at du vil slette {newRegisterItem.name}?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        {dispatch(translate("btnCancel", null, "Avbryt"))}{" "}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        {dispatch(translate("btnDelete", null, "Slett"))}{" "}
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    ) : (
        ""
    );
};

export default RegisterItemDetails;
