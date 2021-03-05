import { Component } from 'react';
import { load } from "components/config";

export default class ConfigLoader extends Component {
    constructor(props) {
        super(props);
        this.state = { isLoaded: false };
    }

    async componentDidMount() {       
        const config = await load();

        this.setState({ isLoaded: true, config })
    }

    render() {
        if (!this.state.isLoaded) {
            return this.props.loading ? this.props.loading() : null;
        }

        return this.props.ready(this.state.config);
    }
}