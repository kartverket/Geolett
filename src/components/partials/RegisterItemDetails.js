// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toastr } from 'react-redux-toastr'
import Modal from 'react-bootstrap/Modal';
import { Typeahead, withAsync } from 'react-bootstrap-typeahead';
import SimpleMDE from "react-simplemde-editor";

import { withRouter } from 'react-router-dom';

// Components
import ValidationErrors from 'components/partials/ValidationErrors';
import ToggleHelpText from 'components/template/ToggleHelpText';

// Actions
import { createRegisterItem, updateRegisterItem, deleteRegisterItem } from 'actions/RegisterItemActions';
import { fetchOrganizations } from 'actions/OrganizationsActions';
import { translate } from 'actions/ConfigActions';

// Helpers
import { canDeleteRegisterItem, canEditRegisterItem } from 'helpers/authorizationHelpers';
import { getEnvironmentVariable } from 'helpers/environmentVariableHelpers.js';

// Stylesheets
import formsStyle from 'components/partials/forms.module.scss';
import 'easymde/dist/easymde.min.css';


const AsyncTypeahead = withAsync(Typeahead);

class RegisterItemDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      registerItem: props.registerItem,
      selectedOwner: props.registerItem && props.registerItem.owner
        ? [
          props.registerItem.owner
        ] : [],
      selectedObjectTypeId: null,
      editable: false,
      newLinkText: '',
      newLinkUrl: '',
      dataFetched: false,
      modalOpen: false,
      validationErrors: [],
      datasetSearchIsLoading: false,
      datasetOptions: [],
      objectTypeOptions: []
    };

    this.getMdeInstance = this.getMdeInstance.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeReferenceTek17 = this.handleChangeReferenceTek17.bind(this);
    this.handleChangeReferenceOtherLaw = this.handleChangeReferenceOtherLaw.bind(this);
    this.handleChangeReferenceCircularFromMinistry = this.handleChangeReferenceCircularFromMinistry.bind(this);
    this.handleDatasetSelect = this.handleDatasetSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.getRegisterInfo = this.getRegisterInfo.bind(this);
    this.getObjectTypeInfo = this.getObjectTypeInfo.bind(this);
    this.handleDatasetTypeReferenceChange = this.handleDatasetTypeReferenceChange.bind(this);
    this.handleChangeLink = this.handleChangeLink.bind(this);
    this.handleOwnerSelect = this.handleOwnerSelect.bind(this);
    this.saveRegisterItem = this.saveRegisterItem.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }


  componentDidMount() {
    Promise.all([
      this.props.fetchOrganizations(),
    ]).then(() => {
      this.setState({ dataFetched: true });
    });
    const datasetUuid = this.props?.registerItem?.dataSet?.uuidMetadata;
    if (datasetUuid) { // TODO Check if applicationSchemaUrl can be saved on object
      this.fetchDatasetDetails(datasetUuid).then(dataset => {
        this.getRegisterInfo(dataset.ProductSpecificationUrl).then(registerInfo => {
          const gMLApplicationSchema = registerInfo?.GMLApplicationSchema;
          if (gMLApplicationSchema) {
            const applicationSchemaUrl = registerInfo.ApplicationSchema;
            if (applicationSchemaUrl) {
              this.getObjectTypeInfo(applicationSchemaUrl).then(objectTypeInfo => {
                const objectTypeOptions = this.getObjectTypeOptionsFromObjectTypeinfo(objectTypeInfo);
                this.setState({ objectTypeOptions }, () => {
                  const selectedObjectTypeOptionValue = this.props?.registerItem?.dataSet?.typeReference?.type;
                  if (selectedObjectTypeOptionValue) {
                    const selectedObjectTypeOption = this.getSelectedObjectTypeOptionFromOptionValue(selectedObjectTypeOptionValue);
                    this.setState({
                      selectedObjectTypeId: selectedObjectTypeOption?.id
                    });
                  }
                });
              })
            }
          }
        })
      })
    }
  }

  getRegisterItemId() {
    return this.props.match && this.props.match.params && this.props.match.params.registerItemId
      ? this.props.match.params.registerItemId
      : null;
  }

  handleChange(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;
    const parsed = parseInt(value);

    registerItem[name] = isNaN(parsed) ? value : parsed;

    this.setState({ registerItem });
  }

  handleDatasetChange(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;
    const parsed = parseInt(value);

    registerItem.dataSet = registerItem.dataSet || {};
    registerItem.dataSet[name] = isNaN(parsed) ? value : parsed;

    this.setState({ registerItem });
  }

  handleDatasetTypeReferenceChange(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;
    const parsed = parseInt(value);

    registerItem.dataSet = registerItem.dataSet || {};
    registerItem.dataSet.typeReference = registerItem.dataSet.typeReference || {};
    registerItem.dataSet.typeReference[name] = isNaN(parsed) ? value : parsed;


    this.setState({ registerItem });

    if (name === 'type') {
      const selectedObjectTypeOption = this.getSelectedObjectTypeOptionFromOptionValue(value);
      this.setState({
        selectedObjectTypeId: selectedObjectTypeOption?.id
      });
    }
  }

  handleChangeReferenceTek17(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;

    registerItem.reference = registerItem.reference || {};
    registerItem.reference.tek17 = registerItem.reference.tek17 || {};
    registerItem.reference.tek17[name] = value;

    this.setState({ registerItem });
  }

  handleChangeReferenceOtherLaw(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;

    registerItem.reference = registerItem.reference || {};
    registerItem.reference.otherLaw = registerItem.reference.otherLaw || {};
    registerItem.reference.otherLaw[name] = value;

    this.setState({ registerItem });
  }

  handleChangeReferenceCircularFromMinistry(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;

    registerItem.reference = registerItem.reference || {};
    registerItem.reference.circularFromMinistry = registerItem.reference.circularFromMinistry || {};
    registerItem.reference.circularFromMinistry[name] = value;

    this.setState({ registerItem });
  }

  handleOwnerSelect(data) {
    this.setState({
      selectedOwner: data
    })
  }


  handleDelete() {
    const registerItem = this.state.registerItem;
    const token = this.props.authToken && this.props.authToken.access_token ? this.props.authToken.access_token : null;

    this.props.deleteRegisterItem(registerItem, token)
      .then(() => {
        this.props.history.push(`/geolett`);
      });
  }


  handleAddLink() {
    const registerItem = this.state.registerItem;
    registerItem.links.push({
      link: {
        text: this.state.newLinkText,
        url: this.state.newLinkUrl
      }
    });
    this.setState(
      {
        registerItem,
        newLinkText: '',
        newLinkUrl: '',
      });
  }

  handleChangeLink(data) {
    const registerItem = this.state.registerItem;
    const { name, value } = data.target ? data.target : data;
    const linkIndex = data && data.target && data.target.dataset && data.target.dataset.linkIndex ? data.target.dataset.linkIndex : null;
    if (linkIndex !== null && registerItem.links[linkIndex]) {
      registerItem.links[linkIndex].link[name] = value;
      this.setState({ registerItem });
    }
  }

  handleDeleteLink(linkIndex) {
    const registerItem = this.state.registerItem;
    registerItem.links.splice(linkIndex, 1);
    this.setState({ registerItem });
  }

  fetchDatasetDetails(uuid) {
    const kartkatalogApiUrl = getEnvironmentVariable('kartkatalogApiUrl');
    const datasetApiUrl = `${kartkatalogApiUrl}/getdata/${uuid}`;
    return fetch(datasetApiUrl)
      .then(response => response.json())
      .then(result => {
        return result;
      }).catch((error) => {
        console.error('Error:', error);
      });
  }


  saveRegisterItem() {
    const registerItem = this.state.registerItem;
    const token = this.props.authToken && this.props.authToken.access_token ? this.props.authToken.access_token : null;

    if (this.state.selectedOwner.length && this.state.selectedOwner[0].organizationId) {
      registerItem.owner = {
        id: this.state.selectedOwner[0].organizationId
      }
    }

    this.props.updateRegisterItem(registerItem, token)
      .then(() => {
        this.setState({
          validationErrors: [],
          editable: false
        });
        toastr.success('Konteksttypen ble oppdatert');
      })
      .catch(({ response }) => {
        toastr.error('Kunne ikke oppdatere konteksttype');
        this.setState({
          validationErrors: response.data
        });
        window.scroll(0, 0);
      });
  }


  getMdeInstance(instance) {
    const container = instance.element.nextSibling;
    container.setAttribute('tabIndex', '0');

    if (!this.state.editable) {
      instance.togglePreview()
      container.classList.add(formsStyle.mdePreview);
    }
  }

  openModal() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  handleOnDatasetSearch(query) {
    this.setState({ datasetSearchIsLoading: true });
    const kartkatalogApiUrl = getEnvironmentVariable('kartkatalogApiUrl');
    fetch(`${kartkatalogApiUrl}/search?text=${query}&facets[0]name=type&facets[0]value=dataset&limit=25`)
      .then(resp => resp.json())
      .then(json => this.setState({
        datasetSearchIsLoading: false,
        datasetOptions: json.Results.map(dataset => {
          return {
            title: dataset.Title,
            urlMetadata: dataset.ShowDetailsUrl,
            uuidMetadata: dataset.Uuid,
            productSpecificationUrl: dataset.ProductSpecificationUrl
          }
        }),
      }));
  }

  handleDatasetSelect(datasetArray) {
    const dataset = Array.isArray(datasetArray) & datasetArray.length
      ? datasetArray[0]
      : {
        title: '',
        urlMetadata: '',
        uuidMetadata: '',
        productSpecificationUrl: ''
      };

    const registerItem = this.state.registerItem;
    registerItem.dataSet = registerItem.dataSet || {};
    registerItem.dataSet.title = dataset.title;
    registerItem.dataSet.urlMetadata = dataset.urlMetadata;
    registerItem.dataSet.uuidMetadata = dataset.uuidMetadata;

    if (dataset.productSpecificationUrl?.length) {
      this.getRegisterInfo(dataset.productSpecificationUrl).then(registerInfo => {
        const gMLApplicationSchema = registerInfo?.GMLApplicationSchema;
        if (gMLApplicationSchema) {
          registerItem.dataSet.urlGmlSchema = gMLApplicationSchema;
          registerItem.dataSet.namespace = gMLApplicationSchema.substring(0, gMLApplicationSchema.lastIndexOf("/"));

          const applicationSchemaUrl = registerInfo.ApplicationSchema;
          if (applicationSchemaUrl) {
            this.getObjectTypeInfo(applicationSchemaUrl).then(objectTypeInfo => {
              const objectTypeOptions = this.getObjectTypeOptionsFromObjectTypeinfo(objectTypeInfo);
              this.setState({ objectTypeOptions });
            })
          }
        }
        this.setState({ registerItem });
      })
    } else {
      this.setState({ registerItem });
    }
  }

  getObjectTypeOptionsFromObjectTypeinfo(objectTypeInfo) {
    return objectTypeInfo?.result?.SearchRecords?.length ? objectTypeInfo.result.SearchRecords.filter(searchRecord => {
      return searchRecord.status === "Gyldig" && searchRecord.stereotype === "objekttype";
    }).map(searchRecord => {
      return {
        id: searchRecord.id,  // Use display link to find attribute and code value ex: https://objektkatalog.geonorge.no/Objekttype/Index/EAID_0108C6D9_3D9C_47ba_AD4B_673A6E3327AE
        label: searchRecord.name
      };
    }) : null;
  }

  getRegisterInfo(url) {
    url = url + ".json";
    url = url.replace("geonorge.no/", "geonorge.no/api/");
    return fetch(url)
      .then(response => response.json())
      .then(result => {
        return result;
      }).catch((error) => {
        console.error('Error:', error);
      });
  };

  getObjectTypeInfo(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(results => {
        return results;
      }).catch((error) => {
        console.error('Error:', error);
      });
  };

  getSelectedDatasetOption() {
    const registerItem = this.state.registerItem || null;
    const dataset = registerItem?.dataSet || null;
    return dataset ? [{
      title: dataset.title,
      urlMetadata: dataset.urlMetadata,
      uuidMetadata: dataset.uuidMetadata,
      productSpecificationUrl: dataset.productSpecificationUrl
    }] : [];
  }

  getSelectedObjectTypeOptionFromOptionValue(optionValue) {
    return this.state.objectTypeOptions.find(objectTypeOption => {
      return objectTypeOption.label === optionValue;
    })
  }


  renderLinks(links) {
    const linkListElements = links && links.length
      ? links.filter(linkItem => {
        return linkItem && linkItem.link
      }).map((linkItem, linkIndex) => {
        const link = linkItem.link;
        return this.state.editable
          ? (
            <React.Fragment>
              <div key={linkIndex} className={formsStyle.flex}>
                <Form.Group controlId="labelLinkText" className={formsStyle.form}>
                  <Form.Label>
                    {this.props.translate('labelLinkText', null, 'Text')}
                    <ToggleHelpText resourceKey='linkTextDescription' />
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="text" data-link-index={linkIndex} value={link.text} onChange={this.handleChangeLink} />
                  </div>
                </Form.Group>
                <Form.Group controlId="labelLinkUrl" className={formsStyle.form}>
                  <Form.Label>
                    {this.props.translate('labelLinkUrl', null, 'URL')}
                    <ToggleHelpText resourceKey='linkUrlDescription' />
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="url" data-link-index={linkIndex} value={link.url} onChange={this.handleChangeLink} />
                  </div>
                </Form.Group>
                <Button variant="danger" className={formsStyle.form} onClick={(event) => { this.handleDeleteLink(linkIndex) }}>Fjern</Button>
              </div>

            </React.Fragment>
          )
          : (
            <div key={linkIndex}>
              <a href={link.url}>{link.text}</a>
            </div>
          );
      }) : null;
    return (<div>
      {linkListElements && linkListElements.length ? linkListElements : 'Ingen lenker er lagt til'}
      {
        this.state.editable
          ? (
            <React.Fragment>
              <h3>Legg til ny lenke</h3>
              <div key="newLink" className={formsStyle.flex}>
                <Form.Group controlId="newLinkText" className={formsStyle.form}>
                  <Form.Label>{this.props.translate('labelLinkText', null, 'Tekst')}</Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="text" value={this.state.newLinkText} onChange={event => this.setState({ newLinkText: event.target.value })} />
                  </div>
                </Form.Group>
                <Form.Group controlId="newLinkUrl" className={formsStyle.form}>
                  <Form.Label>{this.props.translate('labelLinkUrl', null, 'URL')}</Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="url" value={this.state.newLinkUrl} onChange={event => this.setState({ newLinkUrl: event.target.value })} />
                  </div>
                </Form.Group>
                <Button variant="primary" className={formsStyle.form} onClick={(event) => { this.handleAddLink() }}>Legg til</Button>
              </div>
            </React.Fragment>
          ) : ''
      }
    </div>)
  }


  render() {
    const registerItem = this.state.registerItem;
    if (!this.state.dataFetched) {
      return '';
    }
    return registerItem ? (
      <React.Fragment>
        <h1>{registerItem.contextType}</h1>

        <ValidationErrors errors={this.state.validationErrors} />

        <h2>Kontekstbeskrivelse</h2>

        <Form.Group controlId="labelContextType" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelContextType', null, 'Konteksttype')}
            <ToggleHelpText resourceKey='contextTypeDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control name="contextType" value={registerItem.contextType} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.contextType}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelId" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelId', null, 'ID')}
            <ToggleHelpText resourceKey='IdDescription' />
          </Form.Label>
          <div>{registerItem.id}</div>
        </Form.Group>

        <Form.Group controlId="labelTitle" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelTitle', null, 'Tittel')}
            <ToggleHelpText resourceKey='titleDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control name="title" value={registerItem.title} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.title}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelOwner" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelOwner', null, 'Eier')}
            <ToggleHelpText resourceKey='ownerDescription' />
          </Form.Label>
          {
            this.state.editable
              ? (
                <Typeahead
                  id="basic-typeahead-single"
                  labelKey="name"
                  onChange={this.handleOwnerSelect}
                  options={this.props.organizations}
                  selected={this.state.selectedOwner}
                  placeholder="Legg til eier..."
                />
              )
              : (
                <React.Fragment>
                  {registerItem.owner.name} ({registerItem.owner.orgNumber})
                </React.Fragment>
              )}
        </Form.Group>

        <Form.Group controlId="labelDescription" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDescription', null, 'Forklarende tekst')}
            <ToggleHelpText resourceKey='contextTypeDescription' />
          </Form.Label>

          {
            this.state.editable
              ? (
                <div className={formsStyle.comboInput} style={{ display: 'block' }}>
                  <SimpleMDE
                    value={registerItem.description || ''}
                    onChange={value => this.handleChange({ name: 'description', value })}
                    options={{ toolbar: ["bold", "italic", "link", "unordered-list", "|", "preview"] }}
                    getMdeInstance={this.getMdeInstance}
                  />
                </div>
              )
              : (
                <SimpleMDE
                  value={registerItem.description || ''}
                  options={{ toolbar: false, status: false }}
                  getMdeInstance={this.getMdeInstance} />
              )
          }
        </Form.Group>

        <Form.Group controlId="labelDialogText" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDialogText', null, 'Dialogtekst')}
            <ToggleHelpText resourceKey='dialogTextDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control name="dialogText" value={registerItem.dialogText} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.dialogText}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelPossibleMeasures" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelPossibleMeasures', null, 'Mulige tiltak')}
            <ToggleHelpText resourceKey='possibleMeasuresDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control as="textarea" rows={4} name="possibleMeasures" value={registerItem.possibleMeasures} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.possibleMeasures}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelGuidance" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelGuidance', null, 'Veiledning')}
            <ToggleHelpText resourceKey='guidanceDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control name="guidance" value={registerItem.guidance} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.guidance}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDataSetBufferText" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetBufferText', null, 'Buffertekst')}
            <ToggleHelpText resourceKey='dataSetBufferTextDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control
                  name="bufferText"
                  value={registerItem?.dataSet?.bufferText || ''}
                  onChange={this.handleDatasetChange} />
              </div>
            )
            : (
              <div>{registerItem?.dataSet?.bufferText || ''}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDataSetBufferDistance" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetBufferDistance', null, 'Buffer')}
            <ToggleHelpText resourceKey='dataSetBufferDistanceDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control
                  name="bufferDistance"
                  type="number"
                  value={registerItem?.dataSet?.bufferDistance || ''}
                  onChange={this.handleDatasetChange} />
              </div>
            )
            : (
              <div>{registerItem?.dataSet?.bufferDistance || ''}</div>
            )}
        </Form.Group>


        <h2>Lenker</h2>
        {this.renderLinks(registerItem.links)}


        <h2>Kommentarer</h2>

        <Form.Group controlId="labelTechnicalComment" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelTechnicalComment', null, 'Teknisk kommentar')}
            <ToggleHelpText resourceKey='technicalCommentDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control name="technicalComment" value={registerItem.technicalComment} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.technicalComment}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelOtherComment" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelOtherComment', null, 'Andre kommentarer')}
            <ToggleHelpText resourceKey='otherCommentDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control name="otherComment" value={registerItem.otherComment} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.otherComment}</div>
            )}
        </Form.Group>


        <h2>Datasett <ToggleHelpText resourceKey='dataSetTitleDescription' /></h2>


        <Form.Group controlId="labelDataSetTitle" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetTitle', null, 'Datasett-tittel')}
            <ToggleHelpText resourceKey='dataSetTitleDescription' />
          </Form.Label>
          {
            this.state.editable
              ? (
                <AsyncTypeahead
                  id="dataset-search"
                  isLoading={this.state.datasetSearchIsLoading}
                  labelKey={option => `${option.title}`}
                  onSearch={(query) => this.handleOnDatasetSearch(query)}
                  onChange={this.handleDatasetSelect}
                  options={this.state.datasetOptions}
                  defaultSelected={this.getSelectedDatasetOption()}
                  placeholder="Søk etter datasett"
                />
              )
              : (
                <a href={registerItem?.dataSet?.urlMetadata || ''}>
                  <h3>{registerItem?.dataSet?.title || ''}</h3>
                </a>
              )
          }
        </Form.Group>

        <Form.Group controlId="labelDataSetUrlMetadata" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetUrlMetadata', null, 'Datasett-meta-url')}
            <ToggleHelpText resourceKey='dataSetUrlMetadataDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control
                  name="urlMetadata"
                  value={registerItem?.dataSet?.urlMetadata || ''}
                  onChange={this.handleDatasetChange} />
              </div>
            )
            : ''}
        </Form.Group>

        <Form.Group controlId="labelDataSetTypeReferenceType" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetTypeReferenceType', null, 'Objekttype')}
            <ToggleHelpText resourceKey='dataSetTypeReferenceTypeDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <React.Fragment>
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="type"
                    as="select"
                    value={registerItem?.dataSet?.typeReference?.type || ''}
                    onChange={this.handleDatasetTypeReferenceChange}>
                    {this.state.objectTypeOptions.map(objectTypeOption => {
                      return (
                        <option key={objectTypeOption.id} value={objectTypeOption.label}>{objectTypeOption.label}</option>
                      )
                    })}
                  </Form.Control>
                </div>
                { registerItem?.dataSet?.typeReference?.type
                  ? (
                    <a href={`https://objektkatalog.geonorge.no/Objekttype/Index/${this.state.selectedObjectTypeId}`}>
                      Gå til objektkatalogen for å finne attributt og kodeverdi til {registerItem.dataSet?.typeReference?.type}
                    </a>
                  )
                  : ''
                }
              </React.Fragment>
            )
            : (
              <div>
                <a href={`https://objektkatalog.geonorge.no/Objekttype/Index/${this.state.selectedObjectTypeId}`}>{registerItem.dataSet?.typeReference?.type}</a>
              </div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDataSetTypeReferenceAttribute" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetTypeReferenceAttribute', null, 'Attributt')}
            <ToggleHelpText resourceKey='dataSetTypeReferenceAttributeDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control
                  name="attribute"
                  value={registerItem?.dataSet?.typeReference?.attribute || ''}
                  onChange={this.handleDatasetTypeReferenceChange} />
              </div>
            )
            : (
              <div>{registerItem?.dataSet?.typeReference?.attribute || ''}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDataSetTypeReferenceCodeValue" className={formsStyle.form}>
          <Form.Label>
            {this.props.translate('labelDataSetTypeReferenceCodeValue', null, 'Kodeverdi')}
            <ToggleHelpText resourceKey='dataSetTypeReferenceCodeValueDescription' />
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control
                  name="codeValue"
                  value={registerItem?.dataSet?.typeReference?.codeValue || ''}
                  onChange={this.handleDatasetTypeReferenceChange} />
              </div>
            )
            : (
              <div>{registerItem?.dataSet?.typeReference?.codeValue || ''}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDataSetNamespace" className={formsStyle.form}>
          <Form.Label>
            <ToggleHelpText resourceKey='dataSetNamespaceDescription' />
            {this.props.translate('labelDataSetNamespace', null, 'Navnerom')}
          </Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control
                  name="namespace"
                  value={registerItem?.dataSet?.namespace || ''}
                  onChange={this.handleDatasetChange} />
              </div>
            )
            : (
              <div>{registerItem?.dataSet?.namespace || ''}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDataSetUrlGmlSchema" className={formsStyle.form}>
          {this.state.editable
            ? (
              <React.Fragment>
                <Form.Label>
                  <ToggleHelpText resourceKey='dataSetUrlGmlSchemaDescription' />
                  {this.props.translate('dataSetUrlGmlSchemaDescription', null, 'GML-skjema')}
                </Form.Label>
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="urlGmlSchema"
                    value={registerItem?.dataSet?.urlGmlSchema || ''}
                    onChange={this.handleDatasetChange} />
                </div>
              </React.Fragment>
            )
            : (
              <div><a href={registerItem?.dataSet?.urlGmlSchema || ''}>Lenke til GML-skjema</a></div>
            )}
        </Form.Group>


        <h2>Referanser</h2>

        {
          this.state.editable
            ? (
              <div className={formsStyle.flex}>
                <Form.Group controlId="labelReferenceTek17Text" className={formsStyle.form}>
                  <Form.Label>
                    <ToggleHelpText resourceKey='referenceTek17TextDescription' />
                    {this.props.translate('referenceTek17TextDescription', null, 'ref-tek-17-tittel')}
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="text" value={registerItem?.reference?.tek17?.text || ''} onChange={this.handleChangeReferenceTek17} />
                  </div>
                </Form.Group>
                <Form.Group controlId="labelReferenceTek17Url" className={formsStyle.form}>
                  <Form.Label>
                    <ToggleHelpText resourceKey='referenceTek17UrlDescription' />
                    {this.props.translate('labelReferenceTek17Url', null, 'ref-tek-17-url')}
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="url" value={registerItem?.reference?.tek17?.url || ''} onChange={this.handleChangeReferenceTek17} />
                  </div>
                </Form.Group>
              </div>
            )
            : (
              <div>
                <a href={registerItem?.reference?.tek17?.url || ''}>{registerItem?.reference?.tek17?.text || ''}</a>
              </div>
            )
        }

        {
          this.state.editable
            ? (
              <div className={formsStyle.flex}>
                <Form.Group controlId="labelReferenceOtherLawText" className={formsStyle.form}>
                  <Form.Label>
                    <ToggleHelpText resourceKey='referenceOtherLawTextDescription' />
                    {this.props.translate('labelReferenceOtherLawText', null, 'ref-annen lov/forskrift')}
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="text" value={registerItem?.reference?.otherLaw?.text || ''} onChange={this.handleChangeReferenceOtherLaw} />
                  </div>
                </Form.Group>
                <Form.Group controlId="labelReferenceOtherLawUrl" className={formsStyle.form}>
                  <Form.Label>
                    <ToggleHelpText resourceKey='referenceOtherLawUrlDescription' />
                    {this.props.translate('labelReferenceOtherLawUrl', null, 'ref-annen lov/forskrift-url')}
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="url" value={registerItem?.reference?.otherLaw?.url || ''} onChange={this.handleChangeReferenceOtherLaw} />
                  </div>
                </Form.Group>
              </div>
            )
            : (
              <div>
                <a href={registerItem?.reference?.otherLaw?.url || ''}>{registerItem?.reference?.otherLaw?.text || ''}</a>
              </div>
            )
        }

        {
          this.state.editable
            ? (
              <div className={formsStyle.flex}>
                <Form.Group controlId="labelReferenceCircularFromMinistryText" className={formsStyle.form}>
                  <Form.Label>
                    <ToggleHelpText resourceKey='referenceCircularFromMinistryTextDescription' />
                    {this.props.translate('labelReferenceCircularFromMinistryText', null, 'ref-rundskriv fra dep')}
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="text" value={registerItem?.reference?.circularFromMinistry?.text || ''} onChange={this.handleChangeReferenceCircularFromMinistry} />
                  </div>
                </Form.Group>
                <Form.Group controlId="labelReferenceCircularFromMinistryUrl" className={formsStyle.form}>
                  <Form.Label>
                    <ToggleHelpText resourceKey='referenceCircularFromMinistryUrlDescription' />
                    {this.props.translate('labelReferenceCircularFromMinistryUrl', null, 'ref-rundskriv fra dep-url')}
                  </Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="url" value={registerItem?.reference?.circularFromMinistry?.url || ''} onChange={this.handleChangeReferenceCircularFromMinistry} />
                  </div>
                </Form.Group>
              </div>
            )
            : (
              <div>
                <a href={registerItem?.reference?.circularFromMinistry?.url || ''}>{registerItem?.reference?.circularFromMinistry?.text || ''}</a>
              </div>
            )
        }


        <div className={formsStyle.btngroup}>
          {this.state.editable ? (
            <div>
              {
                canEditRegisterItem(this.props.authInfo)
                  ? (
                    <React.Fragment>
                      <Button className="mr-2" variant="secondary" onClick={(event) => { this.setState({ editable: false }) }}>Avslutt redigering</Button>
                      <Button variant="primary" onClick={this.saveRegisterItem}>Lagre</Button>
                    </React.Fragment>
                  )
                  : ''
              }
            </div>
          ) : (
            <div>
              {
                canDeleteRegisterItem(this.props.authInfo)
                  ? <Button className="mr-2" variant="secondary" onClick={this.openModal} >Slett konteksttype</Button>
                  : ''
              }
              {
                canEditRegisterItem(this.props.authInfo)
                  ? <Button variant="primary" onClick={(event) => { this.setState({ editable: true }) }}>Rediger konteksttype</Button>
                  : ''
              }
            </div>
          )}
        </div>

        <Modal
          show={this.state.modalOpen}
          onHide={this.closeModal}
          keyboard={false}
          animation={false}
          centered
          backdrop="static"
          aria-labelledby="form-dialog-title">
          <Modal.Header closeButton>
            <Modal.Title>Slett konteksttype</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Er du sikker på at du vil slette {this.state.registerItem.name}?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>{this.props.translate('btnCancel', null, 'Avbryt')} </Button>
            <Button variant="danger" onClick={this.handleDelete}>{this.props.translate('btnDelete', null, 'Slett')} </Button>
          </Modal.Footer>
        </Modal>

      </React.Fragment>
    ) : ''
  }
}

const mapStateToProps = state => ({
  authInfo: state.authInfo,
  authToken: state.authToken,
  registerItem: state.selectedRegisterItem,
  organizations: state.organizations.map(organization => {
    return {
      organizationId: organization.id,
      name: organization.name
    };
  }),
  selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
  createRegisterItem,
  updateRegisterItem,
  deleteRegisterItem,
  fetchOrganizations,
  translate
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RegisterItemDetails));
