import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from 'App';
import ConfigLoader from 'components/ConfigLoader';
import * as serviceWorker from './serviceWorker';
import WebFont from 'webfontloader';
import 'index.scss';


WebFont.load({
    google: {
      families: ['Raleway:100,400,500,700', 'Open Sans:400,600,700', 'sans-serif']
    }
 })

class Main extends Component {
    render() {
        return <ConfigLoader ready={(config) =>
            <App config={config} />
        } />;
    }
}


ReactDOM.render(<Main />, document.getElementById('root'));

serviceWorker.unregister();
