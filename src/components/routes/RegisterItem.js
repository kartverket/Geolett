// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Components
import Container from 'components/template/Container';

// Actions
import { fetchRegisterItem } from 'actions/RegisterItemActions';


class RegisterItem extends Component {

    componentDidMount() {
        this.props.fetchRegisterItem(this.getRegisterItemId())
            .then(() => {
                this.setState({ dataFetched: true });
            });
    }

    getRegisterItemId() {
        return this.props.match && this.props.match.params && this.props.match.params.registerItemId
            ? this.props.match.params.registerItemId
            : null;
    }


    render() {
        return (
            <Container>
                {this.props.selectedRegisterItem.title}
            </Container>
        )
    }
}

const mapStateToProps = state => ({
    authInfo: state.authInfo,
    selectedRegisterItem: state.selectedRegisterItem,
    options: state.options,
    selectedLanguage: state.selectedLanguage
});

const mapDispatchToProps = {
    fetchRegisterItem
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterItem);
