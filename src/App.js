// Dependecies
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { OidcProvider } from 'redux-oidc';


// Utils
import configureStore, { history } from 'utils/configureStore';
import userManagerPromise from 'utils/userManager';

// Routes
import OidcCallback from 'components/routes/OidcCallback';
import OidcSignoutCallback from 'components/routes/OidcSignoutCallback';
import Home from 'components/routes/Home';
import NotFound from 'components/routes/NotFound';

// Actions
import { updateConfig } from 'actions/ConfigActions';

// Partials
import NavigationBar from 'components/partials/NavigationBar';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faTrashAlt, faEdit, faPlusCircle, faMinusCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

library.add(fab, faCheckSquare, faTrashAlt, faEdit,faPlusCircle,faMinusCircle,faInfoCircle)


console.log(userManagerPromise)
const initialState = {};
const storePromise = configureStore(initialState, userManagerPromise);
console.log(storePromise)

let store = null;
let userManager = null;

class App extends Component {
   constructor(props) {
      super(props);
      this.state = {
         storeIsLoaded: false,
         userManagerIsLoaded: false
      };
   }

   componentDidMount() {
      storePromise.then((storeConfig) => {
         console.log(storeConfig)
         store = storeConfig;
         store.dispatch(updateConfig(this.props.config));

         if (!this.state.userManagerIsLoaded) {
            this.setState({
               userManagerIsLoaded: true
            });
         }
      });
      userManagerPromise.then(userManagerConfig => {
         console.log("USmanagaer then")
         userManager = userManagerConfig;
         this.setState({
            storeIsLoaded: true
         })
      })
   }
   render() {
      if (this.state && userManager && this.state.userManagerIsLoaded && this.state.storeIsLoaded) {
         return (
            <Provider store={store}>
               <OidcProvider userManager={userManager} store={store}>
                  <ConnectedRouter history={history}>
                     <NavigationBar userManager={userManager} />
                     <Switch>
                        <Route exact={true} path="/" render={(props) => (<Home {...props} />)} />
                        <Route exact path="/signin-oidc" render={() => (<OidcCallback userManager={userManager}/>)} />
                        <Route exact path="/signout-callback-oidc" render={() => (<OidcSignoutCallback userManager={userManager}/>)} />
                        <Route render={() => (<NotFound />)} />
                     </Switch>
                  </ConnectedRouter>
               </OidcProvider>
            </Provider>
         );
      } else return ''
   }
}

export default App;
