/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.                                                                              *
 ******************************************************************************************************************** */

// REACT
import { ComponentType, FunctionComponent } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Authentication
import Amplify from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// import awsExports from './aws-exports';

// UI and components
import NorthStarThemeProvider from 'aws-northstar/components/NorthStarThemeProvider';
import AppLayout from './components/AppLayout';
import AccountList from './components/Accounts/AccountList';
import AccountEdit from './components/Accounts/AccountEdit';
import RegionList from './components/Regions/RegionList';
import RegionAdd from './components/Regions/RegionAdd';
import AccountAdd from './components/Accounts/AccountAdd';
import AdminList from './components/Admins/AdminList';
import AdminAdd from './components/Admins/AdminAdd';
import Logout from './components/Logout';
import awsconfig from 'aws-amplify';

Amplify.configure(awsconfig);

const withLayout =
    (Component: ComponentType): FunctionComponent =>
    (props) =>
        (
            <AppLayout>
                <Component {...props} />
            </AppLayout>
        );

const App = () => {
    return (
        <NorthStarThemeProvider>
                        <Router>
                            <Switch>
                                <Route exact path="/" component={withLayout(AccountList)}></Route>
                                <Route exact path="/regionAdd" component={withLayout(RegionAdd)}></Route>
                                <Route exact path="/regionList" component={withLayout(RegionList)}></Route>
                                <Route exact path="/accountAdd" component={withLayout(AccountAdd)}></Route>
                                <Route exact path="/accountEdit" component={withLayout(AccountEdit)}></Route>
                                <Route exact path="/adminAdd" component={withLayout(AdminAdd)}></Route>
                                <Route exact path="/adminList" component={withLayout(AdminList)}></Route>
                                <Route exact path="/logout" component={withLayout(Logout)}></Route>
                            </Switch>
                        </Router>
        </NorthStarThemeProvider>
    );
};

export default withAuthenticator(App);
