import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/custom.css';
import './css/style.css';
import 'leaflet/dist/leaflet.css';
import './css/icons/css/materialdesignicons.css';
import './css/icons/css/fontawesome.css';
import './css/icons/css/ionicons.css';
import './css/icons/css/dripicons.css';

import ErrorBoundary from './components/dashboard/ErrorBoundary/ErrorBoundaryComponent';
import Spinner from './components/dashboard/Spinner/SpinnerComponent'
import './i18n';
import Auth from './utils/withAuth';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import * as serviceWorker from './serviceWorker';

const PasswordRecovery = lazy(() => import('./pages/passwordRecovery'));
const NewPassword = lazy(() => import('./pages/newPassword'));
const ClientLogin = lazy(() => import('./components/client/login'));

const MainRouting = () => {
  return (
    <Router history={history}>
      <Switch>
        <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <Route path="/reset_password" component={PasswordRecovery} />
            <Route path="/new_password/:token" component={NewPassword} />
            <Route path="/campaign/:id" component={ClientLogin} />
            <Route component={Auth} />
          </Suspense>
        </ErrorBoundary>
      </Switch>
    </Router>
  );
};

ReactDOM.render(<MainRouting />, document.getElementById('root'));

serviceWorker.register();
