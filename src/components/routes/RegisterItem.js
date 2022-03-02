// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Components
import Container from 'components/template/Container';
import RegisterItemDetails from 'components/partials/RegisterItemDetails';

// Actions
import { fetchRegisterItem } from 'actions/RegisterItemActions';
import { fetchOptions } from 'actions/OptionsActions';


class RegisterItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            registerItemFetched: false
        };
      }

    componentDidMount() {
        this.props.fetchRegisterItem(this.getRegisterItemId())
            .then(() => {
                this.setState({ registerItemFetched: true });
            });
    }

    getRegisterItemId() {
        return this.props.match && this.props.match.params && this.props.match.params.registerItemId
            ? this.props.match.params.registerItemId
            : null;
    }

    render() {
        if (!this.state.registerItemFetched) {
            return ''
        }
        const registerItem = this.props.registerItem;
        return registerItem && Object.keys(registerItem).length ? (
            <Container>
                <RegisterItemDetails />
            </Container>
        ) : ''
    }
}

const mapStateToProps = state => ({
    registerItem: state.selectedRegisterItem,
});

const mapDispatchToProps = {
    fetchRegisterItem,
    fetchOptions
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterItem);
