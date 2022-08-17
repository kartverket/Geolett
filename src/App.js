// Dependecies
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from "react-router";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { OidcProvider } from 'redux-oidc';
import ReduxToastr from 'react-redux-toastr';

// Utils
import configureStore, { history } from 'utils/configureStore';
import userManagerPromise from 'utils/userManager';

// Routes
import OidcCallback from 'components/routes/OidcCallback';
import OidcSignoutCallback from 'components/routes/OidcSignoutCallback';
import NotFound from 'components/routes/NotFound';
import RegisterItems from 'components/routes/RegisterItems';
import RegisterItem from 'components/routes/RegisterItem';

// Actions
import { updateConfig } from 'actions/ConfigActions';
import { fetchAuthToken } from 'actions/AuthenticationActions';

// Partials
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faTrashAlt, faEdit, faPlusCircle, faMinusCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

library.add(fab, faCheckSquare, faTrashAlt, faEdit, faPlusCircle, faMinusCircle, faInfoCircle)


const initialState = {};
const storePromise = configureStore(initialState, userManagerPromise);

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
         store = storeConfig;
         store.dispatch(fetchAuthToken());
         store.dispatch(updateConfig(this.props.config));

         if (!this.state.userManagerIsLoaded) {
            this.setState({
               userManagerIsLoaded: true
            });
         }
      });
      userManagerPromise.then(userManagerConfig => {
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
                  <Router history={history}>
                     <NavigationBar userManager={userManager} />
                     <Routes>
                        <Route exact path="/" element={<RegisterItems/>} />
                        <Route exact path="/geolett" element={<RegisterItems/>} />
                        <Route exact path="/geolett/:registerItemId/" element={<RegisterItem />} />
                        <Route exact path="/signin-oidc" element={<OidcCallback userManager={userManager} />} />
                        <Route exact path="/signout-callback-oidc" element={<OidcSignoutCallback userManager={userManager} />} />
                        <Route path="*" element={<NotFound />} />
                     </Routes>
                     <Footer />
                     <ReduxToastr
                        timeOut={2000}
                        newestOnTop={false}
                        preventDuplicates
                        position="top-right"
                        getState={(state) => state.toastr}
                        transitionIn="fadeIn"
                        transitionOut="fadeOut"
                        progressBar
                        closeOnToastrClick
                     />
                  </Router>
               </OidcProvider>
            </Provider>
         );
      } else return ''
   }
}

export default App;
