// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toastr } from 'react-redux-toastr'
import Modal from 'react-bootstrap/Modal';
import { Typeahead } from 'react-bootstrap-typeahead';


// Components
import ValidationErrors from 'components/partials/ValidationErrors';

// Actions
import { createRegisterItem, updateRegisterItem, deleteRegisterItem } from 'actions/RegisterItemActions';
import { fetchOrganizations } from 'actions/OrganizationsActions';
import { translate } from 'actions/ConfigActions';

// Helpers
import { canDeleteRegisterItem, canEditRegisterItem } from 'helpers/authorizationHelpers';

// Stylesheets
import formsStyle from 'components/partials/forms.module.scss';


class RegisterItemDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      registerItem: props.registerItem,
      selectedOwner: props.registerItem && props.registerItem.owner
        ? [
          props.registerItem.owner
        ] : [],
      editable: false,
      newLinkText: '',
      newLinkUrl: '',
      dataFetched: false,
      modalOpen: false,
      validationErrors: []
    };

    this.getMdeInstance = this.getMdeInstance.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleDatasetTypeReferenceChange = this.handleDatasetTypeReferenceChange.bind(this);
    this.handleOwnerSelect = this.handleOwnerSelect.bind(this);
    this.saveRegisterItem = this.saveRegisterItem.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }


  componentDidMount() {
    Promise.all([
      this.props.fetchOrganizations(),
    ])
      .then(() => {
        this.setState({ dataFetched: true });
      });
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
  }

  handleOwnerSelect(data) {
    this.setState({
      selectedOwner: data
    })
  }


  handleDelete() {
    this.props.deleteActivity(this.state.activity, this.props.user)
      .then(() => {
        this.props.history.push(`/geolett/${this.getMeasureNumber()}`);
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

  handleDeleteLink(linkIndex) {
    const registerItem = this.state.registerItem;
    registerItem.links.splice(linkIndex, 1);
    this.setState({ registerItem });
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
                  <Form.Label>{this.props.translate('labelLinkText', null, 'Text')}</Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="text" value={link.text} onChange={this.handleChange} />
                  </div>
                </Form.Group>
                <Form.Group controlId="labelLinkUrl" className={formsStyle.form}>
                  <Form.Label>{this.props.translate('labelLinkUrl', null, 'URL')}</Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control name="url" value={link.url} onChange={this.handleChange} />
                  </div>
                </Form.Group>
                <Form.Group controlId="labelDeleteLink" className={formsStyle.form}>
                  <Button variant="danger" onClick={(event) => { this.handleDeleteLink(linkIndex) }}>Fjern</Button>
                </Form.Group>
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
      <h2>Lenker</h2>
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
                <Form.Group controlId="labelAddNewLink" className={formsStyle.form}>
                  <Button variant="primary" onClick={(event) => { this.handleAddLink() }}>Legg til</Button>
                </Form.Group>
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

        <Form.Group controlId="labelContextType" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelContextType', null, 'Konteksttype')}</Form.Label>
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

        <Form.Group controlId="labelTitle" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelTitle', null, 'Tittel')}</Form.Label>
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
          <Form.Label>Eier</Form.Label>
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
          <Form.Label>{this.props.translate('labelDescription', null, 'Forklarende tekst')}</Form.Label>
          {this.state.editable
            ? (
              <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                <Form.Control as="textarea" rows={4} name="description" value={registerItem.description} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.description}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDialogText" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelDialogText', null, 'Dialogtekst')}</Form.Label>
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

        <Form.Group controlId="labelGuidance" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelGuidance', null, 'Veiledning')}</Form.Label>
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

        <Form.Group controlId="labelOtherComment" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelOtherComment', null, 'Andre kommentarer')}</Form.Label>
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

        <Form.Group controlId="labelPossibleMeasures" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelPossibleMeasures', null, 'Mulige tiltak')}</Form.Label>
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

        <Form.Group controlId="labelTechnicalComment" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelTechnicalComment', null, 'Teknisk kommentar')}</Form.Label>
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

        <React.Fragment>
          <h2>Datasett</h2>
          <Form.Group controlId="labelDataSetTitle" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetTitle', null, 'Tittel')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="title"
                    value={registerItem.dataSet && registerItem.dataSet.title ? registerItem.dataSet.title : ''}
                    onChange={this.handleDatasetChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.title ? registerItem.dataSet.title : ''}</div>
              )}
          </Form.Group>

          <Form.Group controlId="labelDataSetNamespace" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetNamespace', null, 'Navnerom')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="namespace"
                    value={registerItem.dataSet && registerItem.dataSet.namespace ? registerItem.dataSet.namespace : ''}
                    onChange={this.handleDatasetChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.namespace ? registerItem.dataSet.namespace : ''}</div>
              )}
          </Form.Group>

          <Form.Group controlId="labelDataSetBufferText" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetBufferText', null, 'Buffertekst')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="bufferText"
                    value={registerItem.dataSet && registerItem.dataSet.bufferText ? registerItem.dataSet.bufferText : ''}
                    onChange={this.handleDatasetChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.bufferText ? registerItem.dataSet.bufferText : ''}</div>
              )}
          </Form.Group>


          <Form.Group controlId="labelDataSetBufferDistance" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetBufferDistance', null, 'Buffer')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="bufferDistance"
                    type="number"
                    value={registerItem.dataSet && registerItem.dataSet.bufferDistance ? registerItem.dataSet.bufferDistance : ''}
                    onChange={this.handleDatasetChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.bufferDistance ? registerItem.dataSet.bufferDistance : ''}</div>
              )}
          </Form.Group>


          <Form.Group controlId="labelDataSetUrlMetadata" className={formsStyle.form}>
            {this.state.editable
              ? (
                <React.Fragment>
                  <Form.Label>{this.props.translate('labelDataSetUrlMetadata', null, 'Metadata')}</Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control
                      name="urlMetadata"
                      value={registerItem.dataSet && registerItem.dataSet.urlMetadata ? registerItem.dataSet.urlMetadata : ''}
                      onChange={this.handleDatasetChange} />
                  </div>
                </React.Fragment>
              )
              : (
                <div><a href={registerItem.dataSet && registerItem.dataSet.urlMetadata ? registerItem.dataSet.urlMetadata : ''}>Lenke til metadata</a></div>
              )}
          </Form.Group>


          <Form.Group controlId="labelDataSetUrlGmlSchema" className={formsStyle.form}>
            {this.state.editable
              ? (
                <React.Fragment>
                  <Form.Label>{this.props.translate('labelDataSetUrlGmlSchema', null, 'GML-skjema')}</Form.Label>
                  <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                    <Form.Control
                      name="urlGmlSchema"
                      value={registerItem.dataSet && registerItem.dataSet.urlGmlSchema ? registerItem.dataSet.urlGmlSchema : ''}
                      onChange={this.handleDatasetChange} />
                  </div>
                </React.Fragment>
              )
              : (
                <div><a href={registerItem.dataSet && registerItem.dataSet.urlGmlSchema ? registerItem.dataSet.urlGmlSchema : ''}>Lenke til metadata</a></div>
              )}
          </Form.Group>

          <h3>Referanse til type</h3>
          <Form.Group controlId="labelDataSetTypeReferenceAttribute" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetTypeReferenceAttribute', null, 'Attributt')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="attribute"
                    value={registerItem.dataSet && registerItem.dataSet.typeReference && registerItem.dataSet.typeReference.attribute ? registerItem.dataSet.typeReference.attribute : ''}
                    onChange={this.handleDatasetTypeReferenceChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.typeReference && registerItem.dataSet.typeReference.attribute ? registerItem.dataSet.typeReference.attribute : ''}</div>
              )}
          </Form.Group>

          <Form.Group controlId="labelDataSetTypeReferenceCodeValue" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetTypeReferenceCodeValue', null, 'Kodeverdi')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="codeValue"
                    value={registerItem.dataSet && registerItem.dataSet.typeReference && registerItem.dataSet.typeReference.codeValue ? registerItem.dataSet.typeReference.codeValue : ''}
                    onChange={this.handleDatasetTypeReferenceChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.typeReference && registerItem.dataSet.typeReference.codeValue ? registerItem.dataSet.typeReference.codeValue : ''}</div>
              )}
          </Form.Group>

          <Form.Group controlId="labelDataSetTypeReferenceType" className={formsStyle.form}>
            <Form.Label>{this.props.translate('labelDataSetTypeReferenceType', null, 'Objekttype')}</Form.Label>
            {this.state.editable
              ? (
                <div className={`${formsStyle.comboInput} ${formsStyle.fullWidth}`}>
                  <Form.Control
                    name="type"
                    value={registerItem.dataSet && registerItem.dataSet.typeReference && registerItem.dataSet.typeReference.type ? registerItem.dataSet.typeReference.type : ''}
                    onChange={this.handleDatasetTypeReferenceChange} />
                </div>
              )
              : (
                <div>{registerItem.dataSet && registerItem.dataSet.typeReference && registerItem.dataSet.typeReference.type ? registerItem.dataSet.typeReference.type : ''}</div>
              )}
          </Form.Group>
        </React.Fragment>


        {this.renderLinks(registerItem.links)}

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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterItemDetails);
