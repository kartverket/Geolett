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

    renderOwner(owner){
        return owner ? (
            <div>
                <h2>Eier:</h2>
                <ul>
                    <li>name: {owner.name}</li>
                    <li>orgNumber: {owner.orgNumber}</li>
                </ul>
            </div>
        ) : '';
    }

    renderDatasetTypeReference(typeReference){
        return typeReference ? (
            <ul>
                <li>attribute: {typeReference.attribute}</li>
                <li>codeValue: {typeReference.codeValue}</li>
                <li>type: {typeReference.type}</li>
            </ul>
        ) : '';
    }

    renderDataset(dataset){
        return dataset ? (
            <div>
                <h2>Datasett:</h2>
                <ul>
                <li>title: {dataset.title}</li>
                <li>namespace: {dataset.namespace}</li>
                <li>bufferText: {dataset.bufferText}</li>
                <li>bufferDistance: {dataset.bufferDistance}</li>
                <li><a href={dataset.urlMetadata}>Metadata</a></li>
                <li><a href={dataset.urlGmlSchema}>GML-skjema</a></li>
                <li>typeReference: {this.renderDatasetTypeReference(dataset.typeReference)}</li>
                </ul>
            </div>
        ) : '';
    }

    renderLinks(links){
        const linkListElements =  links && links.length 
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
        const registerItem = this.props.selectedRegisterItem;
        return registerItem ? (
            <Container>
                <h1>{registerItem.title}</h1>
                <p>{registerItem.description}</p>
                <ul>
                    <li>contextType: {registerItem.contextType}</li>
                    <li>dialogText: {registerItem.dialogText}</li>
                    <li>guidance: {registerItem.guidance}</li>
                    <li>otherComment: {registerItem.otherComment}</li>
                    <li>possibleMeasures: {registerItem.possibleMeasures}</li>
                    <li>technicalComment: {registerItem.technicalComment}</li>
                </ul>
                {this.renderDataset(this.props.selectedRegisterItem.dataSet)}
                {this.renderOwner(this.props.selectedRegisterItem.owner)}
                {this.renderLinks(this.props.selectedRegisterItem.links)}
            </Container>
        ) : ''
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
