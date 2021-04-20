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
      dataFetched: false,
      modalOpen: false,
      validationErrors: []
    };

    this.getMdeInstance = this.getMdeInstance.bind(this);
    this.handleChange = this.handleChange.bind(this);
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


  saveRegisterItem() {
    this.props.updateActivity(this.state.activity, this.props.user)
      .then(_ => {
        this.setState({ validationErrors: [] });
        toastr.success('Aktiviteten ble oppdatert');
      })
      .catch(({ response }) => {
        toastr.error('Kunne ikke oppdatere aktivitet');
        this.setState({ validationErrors: response.data });
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
      }).map(linkItem => {
        const link = linkItem.link;
        return <li key={link.id}><a href={link.url}>{link.text}</a></li>
      }) : null;
    const linkList = linkListElements
      ? (<ul>
        {linkListElements}
      </ul>) : '';
    return (<div>
      <h2>Lenker:</h2>
      {linkList}
    </div>)
  }


  render() {
    const registerItem = this.state.registerItem;
    if (!this.state.dataFetched) {
      return '';
    }
    return registerItem ? (
      <React.Fragment>
        <ValidationErrors errors={this.state.validationErrors} />

        <Form.Group controlId="labelDescription" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelDescription', null, 'Forklarende tekst')}</Form.Label>
          {this.state.editable
            ? (
              <div className={formsStyle.comboInput}>
                <Form.Control name="description" value={registerItem.description} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.description}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelContextType" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelContextType', null, 'Konteksttype')}</Form.Label>
          {this.state.editable
            ? (
              <div className={formsStyle.comboInput}>
                <Form.Control name="contextType" value={registerItem.contextType} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.contextType}</div>
            )}
        </Form.Group>

        <Form.Group controlId="labelDialogText" className={formsStyle.form}>
          <Form.Label>{this.props.translate('labelDialogText', null, 'Dialogtekst')}</Form.Label>
          {this.state.editable
            ? (
              <div className={formsStyle.comboInput}>
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
              <div className={formsStyle.comboInput}>
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
              <div className={formsStyle.comboInput}>
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
              <div className={formsStyle.comboInput}>
                <Form.Control name="possibleMeasures" value={registerItem.possibleMeasures} onChange={this.handleChange} />
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
              <div className={formsStyle.comboInput}>
                <Form.Control name="technicalComment" value={registerItem.technicalComment} onChange={this.handleChange} />
              </div>
            )
            : (
              <div>{registerItem.technicalComment}</div>
            )}
        </Form.Group>


        {
          registerItem.dataSet
            ? (<React.Fragment>
              <h2>Datasett:</h2>
              <Form.Group controlId="labelDataSetTitle" className={formsStyle.form}>
                <Form.Label>{this.props.translate('labelDataSetTitle', null, 'Tittel')}</Form.Label>
                {this.state.editable
                  ? (
                    <div className={formsStyle.comboInput}>
                      <Form.Control name="dataSetTitle" value={registerItem.dataSet.title} onChange={this.handleChange} />
                    </div>
                  )
                  : (
                    <div>{registerItem.dataSet.title}</div>
                  )}
              </Form.Group>

              <Form.Group controlId="labelDataSetNamespace" className={formsStyle.form}>
                <Form.Label>{this.props.translate('labelDataSetNamespace', null, 'Navnerom')}</Form.Label>
                {this.state.editable
                  ? (
                    <div className={formsStyle.comboInput}>
                      <Form.Control name="dataSetNamespace" value={registerItem.dataSet.namespace} onChange={this.handleChange} />
                    </div>
                  )
                  : (
                    <div>{registerItem.dataSet.namespace}</div>
                  )}
              </Form.Group>

              <Form.Group controlId="labelDataSetBufferText" className={formsStyle.form}>
                <Form.Label>{this.props.translate('labelDataSetBufferText', null, 'Buffertekst')}</Form.Label>
                {this.state.editable
                  ? (
                    <div className={formsStyle.comboInput}>
                      <Form.Control name="dataSetBufferText" value={registerItem.dataSet.bufferText} onChange={this.handleChange} />
                    </div>
                  )
                  : (
                    <div>{registerItem.dataSet.bufferText}</div>
                  )}
              </Form.Group>


              <Form.Group controlId="labelDataSetBufferDistance" className={formsStyle.form}>
                <Form.Label>{this.props.translate('labelDataSetBufferDistance', null, 'Buffer')}</Form.Label>
                {this.state.editable
                  ? (
                    <div className={formsStyle.comboInput}>
                      <Form.Control name="dataSetBufferDistance" value={registerItem.dataSet.bufferDistance} onChange={this.handleChange} />
                    </div>
                  )
                  : (
                    <div>{registerItem.dataSet.bufferDistance}</div>
                  )}
              </Form.Group>


              <Form.Group controlId="labelDataSetUrlMetadata" className={formsStyle.form}>
                {this.state.editable
                  ? (
                    <React.Fragment>
                      <Form.Label>{this.props.translate('labelDataSetUrlMetadata', null, 'Metadata')}</Form.Label>
                      <div className={formsStyle.comboInput}>
                        <Form.Control name="dataSetUrlMetadata" value={registerItem.dataSet.urlMetadata} onChange={this.handleChange} />
                      </div>
                    </React.Fragment>
                  )
                  : (
                    <div><a href={registerItem.dataSet.urlMetadata}>Lenke til metadata</a></div>
                  )}
              </Form.Group>


              <Form.Group controlId="labelDataSetUrlGmlSchema" className={formsStyle.form}>
                {this.state.editable
                  ? (
                    <React.Fragment>
                      <Form.Label>{this.props.translate('labelDataSetUrlGmlSchema', null, 'GML-skjema')}</Form.Label>
                      <div className={formsStyle.comboInput}>
                        <Form.Control name="dataSetUrlGmlSchema" value={registerItem.dataSet.urlGmlSchema} onChange={this.handleChange} />
                      </div>
                    </React.Fragment>
                  )
                  : (
                    <div><a href={registerItem.dataSet.urlGmlSchema}>Lenke til metadata</a></div>
                  )}
              </Form.Group>

              <h3>Referanse til type</h3>
              <div>attribute: {registerItem.dataSet.typeReference.attribute}</div>
              <div>codeValue: {registerItem.dataSet.typeReference.codeValue}</div>
              <div>type: {registerItem.dataSet.typeReference.type}</div>
              <ul>


              </ul>
            </React.Fragment>)
            : ''
        }

        {
          registerItem.owner
            ? (
              <React.Fragment>
                <h2>Eier:</h2>

              </React.Fragment>
            )
            : ''
        }

        <Form.Group controlId="formName">
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
                <ul>
                  <li>name: {registerItem.owner.name}</li>
                  <li>orgNumber: {registerItem.owner.orgNumber}</li>
                </ul>
              )}

        </Form.Group>


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
            <Button variant="secondary" onClick={this.closeModal}>{this.props.translate('btnCancel')} </Button>
            <Button variant="danger" onClick={this.handleDelete}>{this.props.translate('btnDelete')} </Button>
          </Modal.Footer>
        </Modal>

      </React.Fragment>
    ) : ''
  }
}

const mapStateToProps = state => ({
  authInfo: state.authInfo,
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
