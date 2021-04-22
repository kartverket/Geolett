// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import { toastr } from 'react-redux-toastr';
import ValidationErrors from 'components/partials/ValidationErrors';

// Models
import { RegisterItem } from 'models/registerItem';

// Actions
import { fetchOrganizations } from 'actions/OrganizationsActions';
import { createRegisterItem, updateRegisterItem, fetchRegisterItems } from 'actions/RegisterItemActions';

// Helpers
import { canAddRegisterItem, canEditRegisterItem } from 'helpers/authorizationHelpers';

// Stylesheets
import 'react-bootstrap-typeahead/css/Typeahead.css';


class RegisterItemDetails extends Component {
   constructor(props) {
      super(props);

      this.state = {
         dataFetched: false,
         modalOpen: false,
         registerItem: props.newRegisterItem
            ? new RegisterItem()
            : props.selectedRegisterItem,
         selectedOwner: props.newRegisterItem
            ? []
            : [
               props.selectedRegisterItem.owner
            ],
         validationErrors: []
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleOwnerSelect = this.handleOwnerSelect.bind(this);
      this.openModal = this.openModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.saveRegisterItem = this.saveRegisterItem.bind(this);
   }

   componentDidMount() {
      this.props.fetchOrganizations()
         .then(() => {
            this.setState({ dataFetched: true });
         });
   }

   openModal() {
      this.setState({
         modalOpen: true
      });
   }

   closeModal() {
      this.setState({ modalOpen: false });
   }

   handleOwnerSelect(data) {
      this.setState({
         selectedOwner: data
      })
   }

   handleChange(data) {
      const registerItem = this.state.registerItem;
      const { name, value } = data.target ? data.target : data;   
      const parsed = parseInt(value);

      registerItem[name] = isNaN(parsed) ? value : parsed;

      this.setState({ registerItem });
   }

   saveRegisterItem() {
      const registerItem = this.state.registerItem;
      const token = this.props.authToken && this.props.authToken.access_token ? this.props.authToken.access_token : null;

      if (this.state.selectedOwner.length) {
         registerItem.owner.id = this.state.selectedOwner[0].id
      }

      this.props.newRegisterItem
         ? this.props.createRegisterItem(registerItem, token)
            .then(() => {
               this.closeModal();
               this.setState({ validationErrors: [] });
               this.props.fetchRegisterItems();
               toastr.success('En ny konteksttype ble lagt til');
            })
            .catch(({ response }) => {   
               toastr.error('Kunne ikke opprette konteksttype');            
               this.setState({ validationErrors: response.data });
            })            
         : this.props.updateRegisterItem(registerItem, token)
            .then(() => {
               this.closeModal();
               this.setState({ validationErrors: [] });
               toastr.success('Konteksttypen ble oppdatert');
            })
            .catch(({ response }) => {
               toastr.error('Kunne ikke oppdatere konteksttype');
               this.setState({ validationErrors: response.data });
            });
   }

   showAddRegisterItemContent(){
      return this.state.registerItem && this.props.newRegisterItem && canAddRegisterItem(this.props.authInfo);
   }

   showEditRegisterItemContent() {
      return this.state.registerItem && !this.props.newRegisterItem && canEditRegisterItem(this.props.authInfo);
   }

   render() {
      if (!this.state.dataFetched) {
         return '';
      }

      return this.showAddRegisterItemContent() || this.showEditRegisterItemContent() ? (
         <React.Fragment>
            <Button variant="primary" className="marginB-20" onClick={this.openModal}>{this.props.newRegisterItem ? 'Opprett konteksttype' : 'Rediger konteksttype'}</Button>
            <Modal
               show={this.state.modalOpen}
               onHide={this.closeModal}
               backdrop="static"
               centered
               keyboard={false}
               animation={false}
            >
               <Modal.Header closeButton>
                  <Modal.Title>{this.props.newRegisterItem ? 'Ny konteksttype' : `${this.state.registerItem.contextType}`}</Modal.Title>
               </Modal.Header>

               <Modal.Body>
                  <ValidationErrors errors={this.state.validationErrors} />
                  <Form.Group controlId="contextType">
                     <Form.Label>Konteksttype</Form.Label>
                     <Form.Control type="text" name="contextType" value={this.state.registerItem.contextType} onChange={this.handleChange} />
                  </Form.Group>

                  <Form.Group controlId="title">
                     <Form.Label>Title</Form.Label>
                     <Form.Control type="text" name="title" value={this.state.registerItem.title} onChange={this.handleChange} />
                  </Form.Group>

                  <Form.Group controlId="formName">
                     <Form.Label>Eier</Form.Label>
                     <Typeahead
                        id="basic-typeahead-single"
                        labelKey="name"
                        onChange={this.handleOwnerSelect}
                        options={this.props.organizations}
                        selected={this.state.selectedOwner}
                        placeholder="Legg til eier..."
                     />
                  </Form.Group>


                  
               </Modal.Body>

               <Modal.Footer>
                  <Button variant="secondary" onClick={this.closeModal}>Avbryt</Button>
                  <Button variant="primary" onClick={this.saveRegisterItem}>Lagre</Button>
               </Modal.Footer>
            </Modal>
         </React.Fragment>
      ) : '';
   }
}

const mapStateToProps = state => {
   return ({
      organizations: state.organizations,
      user: state.oidc.user,
      authInfo: state.authInfo,
      authToken: state.authToken
   });
};

const mapDispatchToProps = {
   fetchOrganizations,
   createRegisterItem,
   updateRegisterItem,
   fetchRegisterItems
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterItemDetails);