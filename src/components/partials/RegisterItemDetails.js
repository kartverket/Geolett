// Dependencies
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Typeahead, withAsync } from "react-bootstrap-typeahead";
import { useNavigate, useParams } from "react-router-dom";
import '@mdxeditor/editor/style.css'
import { MDXEditor, headingsPlugin, listsPlugin,quotePlugin, thematicBreakPlugin, toolbarPlugin, BlockTypeSelect, UndoRedo,BoldItalicUnderlineToggles, CreateLink, ListsToggle, linkDialogPlugin, linkPlugin } from '@mdxeditor/editor'
import dibkplanscreenshot from "images/svg/plan-screenshot-clean.png";
import dibkbyggscreenshot from "images/svg/bygg-screenshot-clean.png";

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
    const [theme, setTheme] = useState(savedRegisterItem?.theme || "");
    
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
                                             
                registerItemStatus === 1 ? toastr.success("Veiledningsteksten ble lagret") : toastr.success("Veiledningsteksten ble publisert");
            })
            .catch(({ response }) => {
                toastr.error("Kunne ikke oppdatere veiledningsteksten");
                setValidationErrors(response.data);
                window.scroll(0, 0);
            });
    };

    const publishRegisterItem = () => {
        if(registerItemStatus !== 2) { 
            handleChange({name: "status", value: 2})       
            setRegisterItemStatus(2);     
        }        
        saveRegisterItem();                    
    
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
            name: "Veiledningstekster plan og bygg",
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
                            <h1 underline="true">{savedRegisterItem.title}</h1>
                        </heading-text>
                        <ValidationErrors errors={validationErrors} />                        
                        <div className={formsStyle.metadatafirst}>  
                            <div>
                           
                        {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                                       editable ? (<>
                                           {registerItemStatus === 1 ?  <button
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
                                    <gn-label block>
                            <label htmlFor="title">
                                {dispatch(translate("labelTitle", null, "Navn på veiledningstekst"))}
                                {theme === "Plan" ? <ToggleHelpText resourceKey="titleDescriptionPlan" showHelp={editable} /> : <ToggleHelpText resourceKey="titleDescriptionBygg" showHelp={editable} />}
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
                                    <gn-label block>
                            <label htmlFor="datasetTitle">
                                {dispatch(translate("labelDataSetTitle", null, "Velg datasett teksten skal knyttes til"))}
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


                                    <div className={formsStyle.row}>
                            <Heading-text>
                                <h5>Bruksområdet for veiledningsteksten</h5>
                            </Heading-text>                            
                            </div>
                            {editable ? (<>
                                <div className={formsStyle.infotext}>{dispatch(translate("introTheme", null, "tittel"))}</div>
                            <div className={formsStyle.radioRow}>
                                <div className={formsStyle.flexradio}>
                                    <input id="plan" name="theme" type="radio" value="Plan" onChange={event => {setTheme("Plan"); handleChange(event)}} defaultChecked={newRegisterItem.theme === "Plan"} />
                                    <label htmlFor="plan">Plan</label>
                                </div>
                                
                                <div className={formsStyle.flexradio}>
                                    <input id="bygg" name="theme" type="radio" value="Bygg" onChange={event => {setTheme("Bygg"); handleChange(event)}} defaultChecked={newRegisterItem.theme === "Bygg"} />
                                    <label htmlFor="bygg">Bygg</label>
                                </div>  
                                                          
                            </div>
                            </>
                            ) : (
                                <div className={formsStyle.row}>
                                    {theme === "Plan" ? "Plan" : theme === "Bygg" ? "Bygg" : "Ikke satt"}
                                </div>
                                
                                    
                            )}
                                <div className={formsStyle.row}>
                               <heading-text>
                                <h5>Grad av konflikt - type treff</h5>
                               </heading-text>
                               </div>
                            <div className={formsStyle.infotext}>{theme === "Bygg" ? dispatch(translate("introDegreeRiskBygg", null, "tittel")) : dispatch(translate("introDegreeRiskPlan", null, "tittel"))}</div>

                            {editable ? (
                            <div>
                                <div className={formsStyle.flexradio}>
                                    <input id="highrisk" name="risk" type="radio" value="high" onChange={event => {setRisk("high"); handleChange(event)}} defaultChecked={newRegisterItem.risk === "high"} />
                                    {theme === "Bygg" ? <label htmlFor="highrisk">Høy grad av konflikt, risiko for byggeforbud</label> : <label htmlFor="highrisk">Høy grad av konflikt, risiko for konsekvenser for planen</label>}
                                </div>
                                
                                <div className={formsStyle.flexradio}>
                                    <input id="lowrisk" name="risk" type="radio" value="low" onChange={event => {setRisk("low"); handleChange(event)}} defaultChecked={newRegisterItem.risk === "low"} />
                                    <label htmlFor="lowrisk">Lav grad av konflikt, informasjon om området</label>
                                </div>                            
                            </div>
                            ) : (<div className={formsStyle.row}>
                                {theme === "Bygg" ? <heading-text>
                                <h5>
                                    {risk === "high" ? "Høy grad av konflikt, risiko for byggeforbud" : risk === "low" ? "Lav grad av konflikt, informasjon om området" : "Ikke satt"}
                                </h5>
                                </heading-text>: 
                                <heading-text>
                                <h5>
                                    {risk === "high" ? "Høy grad av konflikt, risiko for konsekvenser for planen" : risk === "low" ? "Lav grad av konflikt, informasjon om området" : "Ikke satt"}
                                </h5>
                                </heading-text>}
                                </div>
                                    
                            )}

                            </div> 
                            </div>  
                             
                            {editable && savedRegisterItem.status === 1 ? 
                            <div className={formsStyle.introbox}> 
                                                  
                            <div className={formsStyle.textcontent}>{theme === "Bygg" ? dispatch(translate("introGeolettinternalBygg", null, "tittel")) : dispatch(translate("introGeolettinternalPlan", null, "tittel"))}
                             {theme === "Bygg" ? 
                            <div className={formsStyle.biocontainer}>
                                <div>
                                <div className={formsStyle.smallheader}>Hvorfor skrive veiledningstekster?</div>
                                {dispatch(translate("introGeolettDescriptionDel1Bygg", null, "tittel"))}
                            <div className={formsStyle.smallheader}>Tips til bruk av veiledningstekst-editoren</div>
                            {dispatch(translate("introGeolettDescriptionDel2Bygg", null, "tittel"))}
                            
                            {dispatch(translate("introGeolettDescriptionDel3Bygg", null, "tittel"))}
                            <a href="https://chatgpt.com/g/g-XcoxhsvyS-temadata-assistent" target="_blank" rel="noreferrer">Gå til TeA</a>
                                <div className={formsStyle.smallheader}>Brukereksempel</div>
                                {dispatch(translate("introGeolettDescriptionDel4Bygg", null, "tittel"))}
                                
                                {editable ? dispatch(translate('chatAIhelptext', null, 'tittel')): null}
                                </div>
                               
                                 
                                <img className={formsStyle.screenshot} src={dibkplanscreenshot} alt="Eksempel på veiledningstekst i kartløsning" />                            
                                
                             </div>
                       : 
                       <div className={formsStyle.biocontainer}>
                            <div>
                            <div className={formsStyle.smallheader}>Hvorfor skrive areaplanveiledere?</div>
                            {dispatch(translate("introGeolettDescriptionDel1Plan", null, "tittel"))}
                                <div className={formsStyle.smallheader}>Tips til bruk av veiledningstekst-editoren</div>
                                {dispatch(translate("introGeolettDescriptionDel2Plan", null, "tittel"))}
                                
                                {dispatch(translate("introGeolettDescriptionDel3Plan", null, "tittel"))}
                                <a href="https://chatgpt.com/g/g-XcoxhsvyS-temadata-assistent" target="_blank" rel="noreferrer">Gå til TeA</a>
                                    <div className={formsStyle.smallheader}>Brukereksempel</div>
                                    {dispatch(translate("introGeolettDescriptionDel4Plan", null, "tittel"))}
                                    {editable ? dispatch(translate('chatAIhelptext', null, 'tittel')): null}
                                    </div>
                            
                                
                                    <img className={formsStyle.screenshot} src={dibkbyggscreenshot} alt="Eksempel på veiledningstekst i kartløsning" />                                                      
                       
                    </div>}
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

                            

                        <gb-label block>
                            <label htmlFor="description">
                                {dispatch(translate("labelDescription", null, "Hva handler treffet om?"))}
                                {theme === "Bygg" ? <ToggleHelpText resourceKey="descriptionDescriptionBygg" showHelp={editable} /> : <ToggleHelpText resourceKey="descriptionDescriptionPlan" showHelp={editable} />}
                            </label>
                            </gb-label>
                            <div data-color-mode="light">
                                {editable ? (<>
                                   
                                 <MDXEditor 
                                    markdown={descriptionMarkdown || ""}
                                    placeholder={dispatch(translate("descriptionDescription", null, "Hva handler treffet om?"))}
                                    contentEditableClassName={formsStyle.mdxeditor}
                                    onChange={(value) => {
                                        setDescriptionMarkdown(value);
                                        handleChange({ name: "description", value: value });
                                    }}
                                    plugins={[
                                        toolbarPlugin({
                                            toolbarClassName: formsStyle.editortoolbar,
                                            toolbarContents: () => (
                                              <>
                                                {' '}
                                                <BoldItalicUnderlineToggles />
                                                <BlockTypeSelect />
                                                <UndoRedo />  
                                                <CreateLink />  
                                                <ListsToggle />                                                                                                  
                                              </>
                                            )
                                          }),
                                        headingsPlugin(),   
                                        linkDialogPlugin(),
                                        linkPlugin(),                                      
                                        listsPlugin(), 
                                        quotePlugin(), 
                                        thematicBreakPlugin()
                                    ]} />

                                        </>) : (
                                    <MDXEditor 
                                    markdown={descriptionMarkdown || ""}
                                    contentEditableClassName={formsStyle.mdxnoeditor}                                    
                                    plugins={[                                        
                                        headingsPlugin(),   
                                        linkDialogPlugin(),
                                        linkPlugin(),                                      
                                        listsPlugin(), 
                                        quotePlugin(), 
                                        thematicBreakPlugin()
                                    ]} />
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
                                    {theme === "Bygg" ? <ToggleHelpText resourceKey="possibleMeasuresDescriptionBygg" showHelp={editable}  /> : <ToggleHelpText resourceKey="possibleMeasuresDescriptionPlan" showHelp={editable}  /> }
                                </label>
                            </gn-label> }
                            
                            <div data-color-mode="light">
                            {risk === 'low' ? '' :                              
                            editable ? (<>
                                <MDXEditor 
                                    markdown={newRegisterItem.possibleMeasures || ""}
                                    placehoder={dispatch(translate("possibleMeasuresDescription", null, "Hvilke tiltak kan gjøres?"))}
                                    contentEditableClassName={formsStyle.mdxeditor}
                                    onChange={(value) => {
                                        setDescriptionMarkdown(value);
                                        handleChange({ name: "possibleMeasures", value: value });
                                    }}
                                    plugins={[
                                        toolbarPlugin({
                                            toolbarClassName: formsStyle.editortoolbar,
                                            toolbarContents: () => (
                                              <>
                                                {' '}
                                                <BoldItalicUnderlineToggles />
                                                <BlockTypeSelect />
                                                <UndoRedo />  
                                                <CreateLink />  
                                                <ListsToggle />                                                                                                  
                                              </>
                                            )
                                          }),
                                        headingsPlugin(),   
                                        linkDialogPlugin(),
                                        linkPlugin(),                                      
                                        listsPlugin(), 
                                        quotePlugin(), 
                                        thematicBreakPlugin()
                                    ]} />
                                </>
                            ) : (
                                
                                <MDXEditor 
                                markdown={newRegisterItem.possibleMeasures || ""}
                                contentEditableClassName={formsStyle.mdxnoeditor}                                    
                                plugins={[                                        
                                    headingsPlugin(),   
                                    linkDialogPlugin(),
                                    linkPlugin(),                                      
                                    listsPlugin(), 
                                    quotePlugin(), 
                                    thematicBreakPlugin()
                                ]} />
                               
                            ) 
                            }
                            </div>
                            <gn-label block>
                                <label htmlFor="guidance">
                                    {risk === 'low' ? dispatch(translate("labelGuidance", null, "Hva bør brukeren gjøre?")) : dispatch(translate("labelGuidance", null, "Hva bør brukeren gjøre?")) }
                                    {theme === "Bygg" ? <ToggleHelpText resourceKey="guidanceDescriptionBygg" showHelp={editable} /> : <ToggleHelpText resourceKey="guidanceDescriptionPlan" showHelp={editable} />}
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
                                <div id="guidance">{newRegisterItem.guidance}</div>
                            )}

                         
                              
                           <gn-label block>
                            <label>
                            Lenker
                            </label>
                        </gn-label>
                        {renderLinks(newRegisterItem.links)} 
                        
                        { risk === "low" ? '' : <ToggleBuffer onChange={handleDatasetChange} editable={editable} item={newRegisterItem} />}

                        </div>

                        <div>
                            <div>
                           
                          

                        

                           

                                                                                                    

                       


                        

                       
                        



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

                       
                        </div>
                        
                        </div>

                       
                        {editable && registerItemStatus !== 2 ? (<>
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
                       
                       <div className={formsStyle.block}>
                        {canEditRegisterItem(authInfo, savedRegisterItem?.owner) ? (
                                       editable ? (<>
                                           {registerItemStatus === 1 ?  
                                           <gn-button color="primary"><button
                                    disabled={
                                        !newRegisterItem?.title?.length
                                    }
                                    onClick={saveRegisterItem}                                   
                                >
                                    Lagre                                    
                                </button></gn-button> :
                                null }
                                       </> 
                                    ) : <gn-button color="primary"><button 
                                    onClick={() => {
                                        toggleEditable(true);
                                    }}
                                >
                                Redigere
                                </button></gn-button>) : null} 
                       {editable ? (<div>
                                <div className={formsStyle.btnGroup}>                                                                   
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
                            </div>
                            
                            <div className={formsStyle.btnGroup}>
                            {canDeleteRegisterItem(authInfo) && editable ? (
                                        <gn-button color="danger">
                                            <button onClick={openDialog}>Slett veiledningstekst</button>
                                        </gn-button>
                                    ) : null}
                                {editable ? (
                                    <gn-button color="success">
                                        {registerItemStatus === 1 ? <div className={formsStyle.inlinetext}>Er teksten ferdig og klar for å publiseres? Vær obs på at den da vil være tilgjengelig og synlig for alle som bruker Geonorge. Vil du fjerne en publisert tekst må teksten slettes.</div> : null}
                                    <button
                                        disabled={
                                            !newRegisterItem?.title?.length
                                        }
                                        onClick={publishRegisterItem}                                                    
                                    >
                                      {registerItemStatus === 1 ? 'Ja publisere teksten' : 'Publisere'} 
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
