// Dependencies
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Typeahead, withAsync } from "react-bootstrap-typeahead";
import { useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import dibkscreenshot from "images/svg/screenshot-clean.png";

// Geonorge WebComponents
/* eslint-disable */
import {
    BreadcrumbList,
    GnButton,
    GnDialog,
    GnInput,
    GnLabel,
    GnSelect,
    GnTextarea,
    HeadingText
} from "@kartverket/geonorge-web-components";
/* eslint-enable */

// Components
import ValidationErrors from "components/partials/ValidationErrors";
import ToggleHelpText from "components/template/ToggleHelpText";
import ToggleBuffer from "components/template/ToggleBuffer";

// Actions
import { updateRegisterItem, deleteRegisterItem, cloneRegisterItem } from "actions/RegisterItemActions";
import { fetchOrganizations } from "actions/OrganizationsActions";
import { translate } from "actions/ConfigActions";
import { fetchOptions } from "actions/OptionsActions";

// Helpers
import { canDeleteRegisterItem, canEditRegisterItem, canEditRegisterItemOwner } from "helpers/authorizationHelpers";
import { getEnvironmentVariable } from "helpers/environmentVariableHelpers.js";
const urlAI = 'https://chatgpt.com/g/g-XcoxhsvyS-temadata-assistent'

// Stylesheets
import formsStyle from "components/partials/forms.module.scss";

const AsyncTypeahead = withAsync(Typeahead);

const RegisterItemDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    // Redux store
    const savedRegisterItem = useSelector((state) => state.selectedRegisterItem);
    const statuses = useSelector((state) => state.options.statuses);
    const authToken = useSelector((state) => state.authToken);
    const authInfo = useSelector((state) => state.authInfo);
    const config = useSelector((state) => state.config);
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
    const [selectedObjectTypeAttributes, setSelectedObjectTypeAttributes] = useState(null);
    const [selectedObjectTypeAttributeName, setSelectedObjectTypeAttributeName] = useState(
        savedRegisterItem?.dataSet?.typeReference?.attribute
    );
    const [selectedObjectTypeAttributeCodeValues, setSelectedObjectTypeAttributeCodeValues] = useState(null);
    const [selectedObjectTypeAttributeCodeValueValue, setSelectedObjectTypeAttributeCodeValueValue] = useState(
        newRegisterItem?.dataSet?.typeReference?.codeValue
    );
    const [editable, setEditable] = useState(!!params.edit);
    const [newLinkText, setNewLinkText] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [dataFetched, setDataFetched] = useState(false);
    const [dialogOpen, setDialogOpen]   = useState(false);
    const [screenDialogOpen, setScreenDialogOpen]   = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [validationErrors, setValidationErrors] = useState([]);
    const [datasetSearchIsLoading, setDatasetSearchIsLoading] = useState(false);
    const [datasetOptions, setDatasetOptions] = useState([]);
    const [objectTypeOptions, setObjectTypeOptions] = useState([]);

    const [descriptionMarkdown, setDescriptionMarkdown] = useState(savedRegisterItem?.description || "");
    const [possibleMeasuresMarkdown, setPossbileMeasuresMarkdown] = useState(savedRegisterItem?.possibleMeasures || "");
    const [registerItemTitle, setRegisterItemTitle] = useState(savedRegisterItem?.contextType || "");
    const [registerItemStatus, setRegisterItemStatus] = useState(savedRegisterItem?.status || "");
    const [risk, setRisk] = useState(savedRegisterItem?.risk || "");
    
    useEffect(() => {
        setEditable(!!params.edit);
    }, [params.edit]);

  
    // Refs
    const selectedObjectTypeAttributeNameRef = useRef(null);
    const selectedObjectTypeAttributeCodeValueValueRef = useRef(null);

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
        registerItem.dataSet.typeReference[name] = isNaN(value) ? value : parsed;

        if (name === "type") {
            registerItem.dataSet.typeReference.attribute = null;
            registerItem.dataSet.typeReference.codeValue = null;

            setSelectedObjectTypeAttributeName(null);
            selectedObjectTypeAttributeNameRef.current.value = "";

            setSelectedObjectTypeAttributeCodeValues(null);

            setSelectedObjectTypeAttributeCodeValueValue(null);
            selectedObjectTypeAttributeCodeValueValueRef.current.value = "";

            const selectedObjectTypeOption = getSelectedObjectTypeOptionFromOptionValue(value);
            setSelectedObjectTypeId(selectedObjectTypeOption?.id);
        }

        if (name === "attribute") {
            registerItem.dataSet.typeReference.codeValue = null;

            setSelectedObjectTypeAttributeCodeValueValue(null);
            selectedObjectTypeAttributeCodeValueValueRef.current.value = "";

            const selectedAttribute =
                selectedObjectTypeAttributes?.Attributes?.length &&
                selectedObjectTypeAttributes.Attributes.find((attribute) => {
                    return attribute.Name === value;
                });
            setSelectedObjectTypeAttributeName(selectedAttribute?.Name?.length ? selectedAttribute.Name : null);
            setSelectedObjectTypeAttributeCodeValues(
                selectedAttribute?.CodeValues ? selectedAttribute.CodeValues : null
            );
        }

        if (name === "codeValue") {
            setSelectedObjectTypeAttributeCodeValueValue(value);
        }

        setNewRegisterItem(registerItem);
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
        setNewRegisterItem({ ...registerItem});
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

    const fetchObjectTypeAttributes = (objectTypeId) => {
        const objectTypeAttributesApiUrl = `https://objektkatalog.geonorge.no/api/attributes/${objectTypeId}`;
        const apiOptions = {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        };
        fetch(objectTypeAttributesApiUrl, apiOptions)
            .then((res) => res.json())
            .then((objectTypeAttributes) => {
                setSelectedObjectTypeAttributes(objectTypeAttributes);
            });
    };

    useEffect(() => {
        if (selectedObjectTypeId?.length) {
            fetchObjectTypeAttributes(selectedObjectTypeId);
        }
    }, [selectedObjectTypeId]);


    
    const saveRegisterItem = () => {
        const registerItem = newRegisterItem;
        const token = authToken?.access_token || null;

        if (selectedOwner?.[0]?.organizationId?.length) {
            registerItem.owner = {
                id: selectedOwner[0].organizationId
            };
        }

       
        //set to empty since removed from UI
        registerItem.reference = {};

        dispatch(updateRegisterItem(registerItem, token))
            .then(() => {
                setValidationErrors([]);
                toggleEditable(false);                  
                registerItem.status = 1;              
                toastr.success("Veiledningsteksten ble lagret");
            })
            .catch(({ response }) => {
                toastr.error("Kunne ikke oppdatere veiledningsteksten");
                setValidationErrors(response.data);
                window.scroll(0, 0);
            });
    };

    const publishRegisterItem = () => {
        if(registerItemStatus !== 2) { 
            handleChange({name: "status", value: 2});
        }        
        saveRegisterItem();

        //set to empty since removed from UI     
    }

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
                toggleEditable(true);
                toastr.success("Veiledningsteksten ble opprettet");
                window.scroll(0, 0);
                navigate(`/geolett/${result.data.id}`);
            })
            .catch((response) => {
                console.log(response);
                toastr.error("Kunne ikke opprette veilendningsteksten");
                setValidationErrors(response?.data);
                window.scroll(0, 0);
            });
    };

    const openDialog = () => {
        setDialogOpen(false);
        setTimeout(() => {
            setDialogOpen(true);
        });
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };
    const openscreenDialog = () => {
        setScreenDialogOpen(false);
        setTimeout(() => {
            setScreenDialogOpen(true);
        });
    };

    const closescreenDialog = () => {
        setScreenDialogOpen(false);
    };

    const toggleMetadata = () => {
        setIsActive(!isActive);
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
            registerItem.dataset = {
                ...registerItem?.dataset,
                urlGmlSchema: "",
                namespace: "",
                typeReference: {
                    ...registerItem?.dataset?.typeReference,
                    type: "",
                    attribute: "",
                    codeValue: ""
                }
            };
            setNewRegisterItem(registerItem);
        }
    };

    const getObjectTypeOptionsFromObjectTypeinfo = (objectTypeInfo) => {
        return objectTypeInfo?.result?.SearchRecords?.length
            ? objectTypeInfo.result.SearchRecords.filter((searchRecord) => {
                  return (
                      (searchRecord.status === "Gyldig" ||
                          searchRecord.status === "Foreslått" ||
                          searchRecord.status === "Utkast") &&
                      searchRecord.stereotype === "objekttype"
                  );
              }).map((searchRecord) => {
                  return {
                      id: searchRecord.id, // Use display link to find attribute and code value ex: https://objektkatalog.geonorge.no/Objekttype/Index/EAID_0108C6D9_3D9C_47ba_AD4B_673A6E3327AE
                      label: searchRecord.name
                  };
              })
            : null;
    };

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

    const toggleEditable = (toggle) => {
        const edit = toggle ? "edit" : "";         
        navigate(`/geolett/${params.registerItemId}/${edit}`);
    }

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

    useEffect(() => {
        if (savedRegisterItem?.dataSet?.typeReference?.type?.length) {
            const selectedObjectTypeOption = getSelectedObjectTypeOptionFromOptionValue(
                savedRegisterItem.dataSet.typeReference.type
            );
            setSelectedObjectTypeId(selectedObjectTypeOption?.id);
        }
    }, [getSelectedObjectTypeOptionFromOptionValue, savedRegisterItem?.dataSet?.typeReference?.type]);

    useEffect(() => {
        if (savedRegisterItem?.dataSet?.typeReference?.attribute?.length) {
            const selectedAttribute =
                selectedObjectTypeAttributes?.Attributes?.length &&
                selectedObjectTypeAttributes.Attributes.find((attribute) => {
                    return attribute.Name === savedRegisterItem.dataSet.typeReference.attribute;
                });
            setSelectedObjectTypeAttributeName(selectedAttribute?.Name?.length ? selectedAttribute.Name : null);
            setSelectedObjectTypeAttributeCodeValues(
                selectedAttribute?.CodeValues ? selectedAttribute.CodeValues : null
            );
        }
    }, [savedRegisterItem?.dataSet?.typeReference?.attribute, selectedObjectTypeAttributes?.Attributes]);

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
                              <div className={formsStyle.flex1}>
                                  <gn-label block>
                                      <label htmlFor={`linkText-${linkIndex}`}>
                                          {dispatch(translate("labelLinkText", null, "Tekst"))}
                                          <ToggleHelpText resourceKey="linkTextDescription" showHelp={editable} />
                                      </label>
                                  </gn-label>
                                  <gn-input block fullWidth>
                                      <input
                                          id={`linkText-${linkIndex}`}
                                          name="text"
                                          defaultValue={link.text}
                                          data-link-index={linkIndex}
                                          onChange={handleChangeLink}
                                      />
                                  </gn-input>
                              </div>

                              <div className={formsStyle.flex1}>
                                  <gn-label block>
                                      <label htmlFor={`linkUrl-${linkIndex}`}>
                                          {dispatch(translate("labelLinkUrl", null, "URL"))}
                                          <ToggleHelpText resourceKey="linkUrlDescription" showHelp={editable} />
                                      </label>
                                  </gn-label>
                                  <gn-input block fullWidth>
                                      <input
                                          id={`linkUrl-${linkIndex}`}
                                          name="url"
                                          defaultValue={link.url}
                                          data-link-index={linkIndex}
                                          onChange={handleChangeLink}
                                      />
                                  </gn-input>
                              </div>
                              <div>
                                  <gn-button color="danger">
                                      <button
                                          onClick={() => {
                                              handleDeleteLink(linkIndex);
                                          }}
                                          style={{ marginBottom: "10px" }}
                                      >
                                          Fjern
                                      </button>
                                  </gn-button>
                              </div>
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
                    <Fragment>
                        
                        <div key="newLink" className={formsStyle.flex}>
                            <div className={formsStyle.flex1}>
                                <gn-label block>
                                    <label htmlFor="newLinkText">
                                        {dispatch(translate("labelnewLinkText", null, "Tekst"))}
                                    </label>
                                </gn-label>
                                <gn-input block fullWidth>
                                    <input
                                        id="newLinkText"
                                        name="text"
                                        defaultValue={newLinkText}
                                        onChange={(event) => setNewLinkText(event.target.value)}
                                    />
                                </gn-input>
                            </div>
                            <div className={formsStyle.flex1}>
                                <gn-label block>
                                    <label htmlFor="newLinkUrl">
                                        {dispatch(translate("labelNewLinkUrl", null, "URL"))}
                                    </label>
                                </gn-label>
                                <gn-input block fullWidth>
                                    <input
                                        id="newLinkUrl"
                                        name="url"
                                        defaultValue={newLinkUrl}
                                        onChange={(event) => setNewLinkUrl(event.target.value)}
                                    />
                                </gn-input>
                            </div>
                            <div>
                                <gn-button color="primary">
                                    <button onClick={(event) => handleAddLink()} style={{ marginBottom: "10px" }}>
                                        Legg til
                                    </button>
                                </gn-button>
                            </div>
                        </div>
                    </Fragment>
                ) : null}
            </div>
        );
    };

    if (!dataFetched) {
        return null;
    }

   

    const breadcrumbs = [
        {
            name: "Registrene",
            url: config?.registerUrl || ""
        },
        {
            name: "Planguider",
            url: "/geolett"
        },
        {
            name: newRegisterItem.title,
            url: params?.registerItemId && `/geolett/${params?.registerItemId}/`
        }
    ];    

   
    return (
        <Fragment>
            <breadcrumb-list id="breadcrumb-list" breadcrumbs={JSON.stringify(breadcrumbs)}></breadcrumb-list>
            {newRegisterItem ? (
                <Fragment>
                    
                    <div className={formsStyle.form}>
                        <heading-text>
                            <h1 underline="true">{newRegisterItem?.contextType.length ? newRegisterItem?.contextType  :  savedRegisterItem.title}</h1>
                        </heading-text>

                        <ValidationErrors errors={validationErrors} />                        <div className={formsStyle.metadatafirst}>  
                            <div>
                           
                        {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                                       editable ? (<>
                                           {savedRegisterItem.status === 1 ?  <button
                                    disabled={
                                        !newRegisterItem?.title?.length
                                    }
                                    onClick={saveRegisterItem}
                                   
                                >
                                    Lagre
                                    
                                </button> :
                                <button
                                disabled={
                                    !newRegisterItem?.title?.length
                                }
                                onClick={publishRegisterItem}
                               
                            >
                                Publisere
                                
                            </button> }
                                       </> 
                                    ) : <button
                                    onClick={() => {
                                        toggleEditable(true);
                                    }}
                                >
                                Redigere
                                </button>) : null} 
                                    </div>
                                    <div>
                      
                            
                            <heading-text>
                                <h5>Navn i Geonorge</h5>
                            </heading-text>
                          
                            
                            {editable ? (<>
                                 <div className={formsStyle.infotext}>{dispatch(translate("contextTypeDescription", null, "tittel"))}</div>
                                <gn-input block fullWidth>
                                    <input
                                    id="contextType"
                                    name="contextType"
                                    placeholder={dispatch(translate("contextTypeDescription", null, "titleDescription"))}
                                    defaultValue={newRegisterItem.contextType}
                                    onChange={(event) => {
                                        handleChange({ name: "contextType", value: event.target.value });
                                        setRegisterItemTitle(event.target.value);
                                    }}
                                />
                            </gn-input></>
                            
                            ) : (
                                <div id="contextType">{newRegisterItem.contextType}</div>
                            )} 
                                
                               <heading-text>
                                <h5>Grad av konflikt - type treff</h5>
                               </heading-text>
                           
                            <div className={formsStyle.infotext}>{dispatch(translate("introDegreeRisk", null, "tittel"))}</div>

                            {editable ? (
                            <div>
                                <div className={formsStyle.flexradio}>
                                    <input id="highrisk" name="risk" type="radio" value="high" onChange={event => {setRisk("high"); handleChange(event)}} defaultChecked={newRegisterItem.risk === "high"} />
                                    <label htmlFor="highrisk">Høy grad av konflikt, risiko for byggeforbud</label>
                                </div>
                                
                                <div className={formsStyle.flexradio}>
                                    <input id="lowrisk" name="risk" type="radio" value="low" onChange={event => {setRisk("low"); handleChange(event)}} defaultChecked={newRegisterItem.risk === "low"} />
                                    <label htmlFor="lowrisk">Lav grad av konflikt, informasjon om området</label>
                                </div>                            
                            </div>
                            ) : (
                                <heading-text>
                                <h5>
                                    {risk === "high" ? "Høy grad av konflikt, risiko for byggeforbud" : risk === "low" ? "Lav grad av konflikt, informasjon om området" : "Ikke satt"}
                                </h5>
                                </heading-text>
                                    
                            )}

                            </div> 
                            </div>  
                             
                            {editable && savedRegisterItem.status === 1 ? 
                            <div className={formsStyle.introbox}>                        
                            <div className={formsStyle.textcontent}>{dispatch(translate("introGeolettinternal", null, "tittel"))}
                          
                            <div className={formsStyle.biocontainer}>
                                <div>
                                <div className={formsStyle.smallheader}>Hvorfor lage disse veiledningstekstene?</div>
                                {dispatch(translate("introGeolettDescriptionDel1", null, "tittel"))}
                            <div className={formsStyle.smallheader}>Tips til bruk av editor</div>
                            {dispatch(translate("introGeolettDescriptionDel2", null, "tittel"))}
                            
                            {dispatch(translate("introGeolettDescriptionDel3", null, "tittel"))}
                            
                                <div className={formsStyle.smallheader}>Brukereksempel</div>
                                {dispatch(translate("introGeolettDescriptionDel4", null, "tittel"))}
                                {editable ? dispatch(translate('chatAIhelptext', null, 'tittel')): null}
                                </div>
                               
                                 
                                <img className={formsStyle.screenshot} src={dibkscreenshot} alt="Eksempel på veiledningstekst i kartløsning" />                            
                                
                             </div>
                       
                            </div>                        
                            </div>
                            : null}                    
                        <heading-text>
                        <h2>Veiledningstekst </h2>
                        </heading-text>
    
                        <div className={formsStyle.opendata}>                           
                            <gn-label block>
                            <label htmlFor="owner">
                                {dispatch(translate("labelOwner", null, "Eier"))}
                                <ToggleHelpText resourceKey="ownerDescription" show={editable} />
                            </label>
                            </gn-label>
                            {editable ? (
                                <Typeahead
                                    id="owner"
                                    labelKey="name"
                                    onChange={handleOwnerSelect}
                                    options={organizations}
                                    selected={selectedOwner}
                                    disabled={!canEditRegisterItemOwner(authInfo)}
                                    placeholder="Legg til eier..."
                                />
                            ) : (
                                <div id="owner">
                                    {newRegisterItem.owner.name} ({newRegisterItem.owner.orgNumber})
                                </div>
                            )}

                            <gn-label block>
                            <label htmlFor="title">
                                {dispatch(translate("labelTitle", null, "Navn på veiledningstekst"))}
                                <ToggleHelpText resourceKey="titleDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="title"                                    
                                    name="title"
                                    placeholder={dispatch(translate("titleDescription", null, "titleDescription   "))}
                                    defaultValue={newRegisterItem.title}
                                    onChange={handleChange}
                                />
                            </gn-input>
                        ) : (
                            <div id="title">{newRegisterItem.title}</div>
                        )}

                        <gb-label block>
                            <label htmlFor="description">
                                {dispatch(translate("labelDescription", null, "Hva handler treffet om?"))}
                                <ToggleHelpText resourceKey="descriptionDescription" showHelp={editable} />
                            </label>
                            </gb-label>
                            <div data-color-mode="light">
                                {editable ? (
                                    <MDEditor
                                        textareaProps={{ placeholder:  dispatch(translate("descriptionDescription", null, "Hva handler treffet om?")) }}
                                        id="description"
                                        preview="edit"                                   
                                        height={200}
                                        name="description"
                                        value={descriptionMarkdown || ""}
                                        onChange={(value) => {
                                            setDescriptionMarkdown(value);
                                            handleChange({ name: "description", value: value });
                                        }}
                                    />
                                ) : (
                                    <MDEditor.Markdown id="description" source={descriptionMarkdown} />
                                )}
                            </div>

                        <gn-label block>
                            <label htmlFor="dialogText">
                                {risk === "low" ? dispatch(translate("labelDialogText", null, "Informasjonsvarsel")) : dispatch(translate("labelDialogText", null, "Varsel"))}
                                <ToggleHelpText resourceKey="dialogTextDescription" showHelp={editable}  />
                            </label>
                        </gn-label>
                        
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="dialogText"
                                    name="dialogText"
                                    defaultValue={newRegisterItem.dialogText}
                                    onChange={handleChange}
                                />
                            </gn-input>
                            ) : (
                                <div id="dialogText">{newRegisterItem.dialogText}</div>
                            )}

                            { risk === 'low'? '' : <gn-label block>
                                <label htmlFor="possibleMeasures">
                                    {dispatch(translate("labelPossibleMeasures", null, "Hvilke tiltak kan gjøres?"))}
                                    <ToggleHelpText resourceKey="possibleMeasuresDescription" showHelp={editable}  />
                                </label>
                            </gn-label> }
                            
                            <div data-color-mode="light">
                            {risk === 'low' ? '' :                              
                            editable ? (
                                
                                <MDEditor
                                    textareaProps={{placeholder: dispatch(translate("possibleMeasuresDescription", null, "Hvilke tiltak kan gjøres?"))}}
                                    id="possibleMeasures"
                                    preview="edit"
                                    name="possibleMeasures"
                                    value={newRegisterItem.possibleMeasures || ""}
                                    onChange={(value) => {
                                        setPossbileMeasuresMarkdown(value);
                                        handleChange({ name: "possibleMeasures", value: value });
                                    }} />
                            ) : (
                                
                                <MDEditor.Markdown id="possibleMeasures" source={possibleMeasuresMarkdown} />
                               
                            ) 
                            }
                            </div>
                            <gn-label block>
                                <label htmlFor="guidance">
                                    {risk === 'low' ? dispatch(translate("labelGuidance", null, "Hvordan bruke denne informasjonen")) : dispatch(translate("labelGuidance", null, "Tips til hvordan følge opp tiltak")) }
                                    <ToggleHelpText resourceKey="guidanceDescription" showHelp={editable} />
                                </label>
                            </gn-label>
                            {editable ? (
                                <gn-textarea block fullWidth>
                                    <textarea
                                        id="guidance"
                                        name="guidance"
                                        rows="6"
                                        placeholder={dispatch(translate("guidanceDescription", null, "Tips til hvordan følge opp tiltak"))}
                                        defaultValue={newRegisterItem.guidance}
                                        onChange={handleChange}
                                    />
                                </gn-textarea>
                            ) : (
                                <div id="guidance">{newRegisterItem.dialogText}</div>
                            )}

                         
                              
                           <gn-label block>
                            <label>
                            Lenker
                            </label>
                        </gn-label>
                        {renderLinks(newRegisterItem.links)} 
                        
                        { risk === "low" ? '' : <ToggleBuffer onChange={handleDatasetChange} editable={editable} item={newRegisterItem} />}

                        </div>

                        <div className={isActive ? `${formsStyle.metadata} ${formsStyle.open}` : formsStyle.metadata}>
                            <div>
                            <div className={formsStyle.flexhorizontal}>
                            <button onClick={toggleMetadata} >{isActive ? 'Vis': 'Skjul'}</button>
                            <header-text><h2>Metadata </h2></header-text>
                            </div>
                            <em>Data om dataene, til bruk i Geonorge</em>

                            <gn-label block>
                                <label htmlFor="id">
                                    {dispatch(translate("labelId", null, "ID"))}
                                    <ToggleHelpText resourceKey="IdDescription" showHelp={editable} />
                                </label>
                            </gn-label>
                            <div id="id">{newRegisterItem.id}</div>

                                                   


                            <gn-label>
                            <label>Kommentarer</label>
                            </gn-label>

                        <gn-label block>
                            <label htmlFor="technicalComment">
                                {dispatch(translate("labelTechnicalComment", null, "Teknisk kommentar"))}
                                <ToggleHelpText resourceKey="technicalCommentDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="technicalComment"
                                    name="technicalComment"
                                    defaultValue={newRegisterItem.technicalComment}
                                    onChange={handleChange}
                                />
                            </gn-input>
                        ) : (
                            <div id="technicalComment">{newRegisterItem.technicalComment}</div>
                        )}

                        <gn-label block>
                            <label htmlFor="otherComment">
                                {dispatch(translate("labelOtherComment", null, "Andre kommentarer"))}
                                <ToggleHelpText resourceKey="otherCommentDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="otherComment"
                                    name="otherComment"
                                    defaultValue={newRegisterItem.otherComment}
                                    onChange={handleChange}
                                />
                            </gn-input>
                        ) : (
                            <div id="otherComment">{newRegisterItem.otherComment}</div>
                        )}

                        <gn-label>
                            <label>  Datasett
                                <ToggleHelpText resourceKey="dataSetTitleDescription" showHelp={editable}  /></label>
                            </gn-label>
                           

                        <gn-label block>
                            <label htmlFor="datasetTitle">
                                {dispatch(translate("labelDataSetTitle", null, "Datasett-tittel"))}
                                <ToggleHelpText resourceKey="dataSetTitleDescription" showHelp={editable}  />
                            </label>
                        </gn-label>
                        {editable ? (
                            <AsyncTypeahead
                                id="dataset-search"
                                isLoading={datasetSearchIsLoading}
                                labelKey={(option) => `${option.title}`}
                                onSearch={(query) => handleOnDatasetSearch(query)}
                                onChange={handleDatasetSelect}
                                options={datasetOptions}
                                defaultValue={getSelectedDatasetOption()}
                                placeholder="Søk etter datasett"
                            />
                        ) : (
                            <a id="datasetTitle" href={newRegisterItem?.dataSet?.urlMetadata || ""}>
                                <h3>{newRegisterItem?.dataSet?.title || ""}</h3>
                            </a>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetUrlMetadata">
                                {dispatch(translate("labelDataSetUrlMetadata", null, "Datasett-meta-url"))}
                                <ToggleHelpText resourceKey="dataSetUrlMetadataDescription" showHelp={editable}  />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="datasetUrlMetadata"
                                    name="urlMetadata"
                                    defaultValue={newRegisterItem?.dataSet?.urlMetadata || ""}
                                    onChange={handleDatasetChange}
                                />
                            </gn-input>
                        ) : null}

                        <gn-label block>
                            <label htmlFor="datasetTypeReferenceType">
                                {dispatch(translate("labelDataSetTypeReferenceType", null, "Objekttype"))}
                                <ToggleHelpText resourceKey="dataSetTypeReferenceTypeDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <Fragment>
                                <gn-select block fullWidth>
                                    <select
                                        id="datasetTypeReferenceType"
                                        name="type"
                                        defaultValue={newRegisterItem?.dataSet?.typeReference?.type || ""}
                                        onChange={handleDatasetTypeReferenceChange}
                                    >
                                        {objectTypeOptions.map((objectTypeOption) => {
                                            return (
                                                <option key={objectTypeOption.id} value={objectTypeOption.label}>
                                                    {objectTypeOption.label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </gn-select>
                                {newRegisterItem?.dataSet?.typeReference?.type ? (
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={`https://objektkatalog.geonorge.no/Objekttype/Index/${selectedObjectTypeId}`}
                                    >
                                        Gå til objektkatalogen for detaljer om attributt og kodeverdi til{" "}
                                        {newRegisterItem.dataSet?.typeReference?.type}
                                    </a>
                                ) : null}
                            </Fragment>
                        ) : (
                            <div>
                                <a
                                    id="datasetTypeReferenceType"
                                    href={`https://objektkatalog.geonorge.no/Objekttype/Index/${selectedObjectTypeId}`}
                                >
                                    {newRegisterItem.dataSet?.typeReference?.type}
                                </a>
                            </div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetTypeReferenceAttribute">
                                {dispatch(translate("labelDataSetTypeReferenceAttribute", null, "Attributt"))}
                                <ToggleHelpText resourceKey="dataSetTypeReferenceAttributeDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    name="attribute"
                                    defaultValue={selectedObjectTypeAttributeName || ""}
                                    placeholder={dispatch(translate("dataSetTypeReferenceAttributeDescription", null, "Beskrives av attributt   "))}
                                    onChange={handleDatasetTypeReferenceChange}
                                    list="attribute-list"
                                    autoComplete="off"
                                    ref={selectedObjectTypeAttributeNameRef}
                                />
                                <datalist id="attribute-list">
                                    {selectedObjectTypeAttributes?.Attributes.length
                                        ? selectedObjectTypeAttributes.Attributes.map((attribute) => {
                                              return (
                                                  <option key={attribute.Nalue} value={attribute.Name}>
                                                      {attribute.Name}
                                                  </option>
                                              );
                                          })
                                        : null}
                                </datalist>
                            </gn-input>
                        ) : (
                            <div id="datasetTypeReferenceAttribute">
                                {newRegisterItem?.dataSet?.typeReference?.attribute || ""}
                            </div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetTypeReferenceCodeValue">
                                {dispatch(translate("labelDataSetTypeReferenceCodeValue", null, "Kodeverdi"))}
                                <ToggleHelpText resourceKey="dataSetTypeReferenceCodeValueDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="datasetTypeReferenceCodeValue"
                                    name="codeValue"
                                    defaultValue={selectedObjectTypeAttributeCodeValueValue || ""}
                                    onChange={handleDatasetTypeReferenceChange}
                                    list="codeValue-list"
                                    autoComplete="off"
                                    ref={selectedObjectTypeAttributeCodeValueValueRef}
                                />
                                <datalist id="codeValue-list">
                                    {selectedObjectTypeAttributeCodeValues?.length
                                        ? selectedObjectTypeAttributeCodeValues.map((codeValue) => {
                                              return (
                                                  <option key={codeValue.Value} value={codeValue.Value}>
                                                      {codeValue.Name}
                                                  </option>
                                              );
                                          })
                                        : null}
                                </datalist>
                            </gn-input>
                        ) : (
                            <div id="datasetTypeReferenceCodeValue">
                                {newRegisterItem?.dataSet?.typeReference?.codeValue || ""}
                            </div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetNamespace">
                                {dispatch(translate("labelDataSetNamespace", null, "Navnerom (skjemaplassering)"))}
                                <ToggleHelpText resourceKey="dataSetNamespaceDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="datasetNamespace"
                                    name="namespace"
                                    defaultValue={newRegisterItem?.dataSet?.namespace || ""}
                                    onChange={handleDatasetChange}
                                />
                            </gn-input>
                        ) : (
                            <div id="datasetNamespace">{newRegisterItem?.dataSet?.namespace || ""}</div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetUrlGmlSchema">
                                {dispatch(translate("labelDataSetUrlGmlSchema", null, "Lenke til GML-skjemaet"))}
                                <ToggleHelpText resourceKey="dataSetUrlGmlSchemaDescription" showHelp={editable} />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="datasetUrlGmlSchema"
                                    name="urlGmlSchema"
                                    defaultValue={newRegisterItem?.dataSet?.urlGmlSchema || ""}
                                    onChange={handleDatasetChange}
                                />
                            </gn-input>
                        ) : newRegisterItem?.dataSet?.urlGmlSchema?.length ? (
                            <div>
                                <a id="datasetUrlGmlSchema" href={newRegisterItem.dataSet.urlGmlSchema}>
                                    Lenke til GML-skjema
                                </a>
                            </div>
                        ) : (
                            <div id="datasetUrlGmlSchema">{newRegisterItem?.dataSet?.urlGmlSchema || ""}</div>
                        )}
                        </div>
                        
                        </div>

                       
                        {editable ? (<>
                             <gn-label block>
                             <label htmlFor="status">Status</label>
                            </gn-label>
                            <gn-select>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={newRegisterItem.status || 1}
                                    onChange={handleChange}
                                >
                                    {statuses.map((status) => {
                                        return (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </gn-select></>
                        ) : null}
                       
                       {editable ? (<div>
                                <div className={formsStyle.btnGroup}>
                                    
                                    {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                                        <Fragment>
                                          
                                            <gn-button color="primary">
                                            {newRegisterItem?.status === 2 ? (
                                               null ) : (<button
                                                    disabled={
                                                        !newRegisterItem?.title?.length
                                                    }
                                                    onClick={saveRegisterItem}
                                                >
                                                    Lagre
                                                </button>  ) }
                                            </gn-button>
                                         
                                            
                                        </Fragment>                                        
                                    ) :   null}
                                </div>
                                </div>) : (<>                                
                                <div className={formsStyle.btnGroup}>
                                   
                                    {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                                        <gn-button color="default">
                                            <button onClick={cloneRegister}>Dupliser veiledningstekst</button>
                                        </gn-button>
                                    ) : null}
                                </div>
                            </>)}
                            
                            
                            <div className={formsStyle.btnGroup}>
                            {canDeleteRegisterItem(authInfo) ? (
                                        <gn-button color="danger">
                                            <button onClick={openDialog}>Slett veiledningstekst</button>
                                        </gn-button>
                                    ) : null}
                                {editable ? (
                                    <gn-button color="success">
                                    <button
                                        disabled={
                                            !newRegisterItem?.title?.length
                                        }
                                        onClick={publishRegisterItem}                                                    
                                    >
                                        Ja publiser teksten
                                    </button>
                                </gn-button>
                                ) : null}
                            </div>
                        
                    </div>

                    <gn-dialog show={dialogOpen}>
                        <heading-text>
                            <h2>Slett veiledningstekst</h2>
                        </heading-text>
                        <p>Er du sikker på at du vil slette {newRegisterItem.name}?</p>
                        <div>
                            <gn-button color="default">
                                <button onClick={closeDialog}>
                                    {dispatch(translate("btnCancel", null, "Avbryt"))}{" "}
                                </button>
                            </gn-button>
                            <gn-button color="danger">
                                <button onClick={handleDelete}>
                                    {dispatch(translate("btnDelete", null, "Slett"))}{" "}
                                </button>
                            </gn-button>
                        </div>
                    </gn-dialog>
                </Fragment>
            ) : null}
        </Fragment>
    );
};

export default RegisterItemDetails;
