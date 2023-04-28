import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import AuthContext from '../context/auth-context';

import Navbar from '../components/dashboard/all/navbar';
import Toolbar from '../components/dashboard/all/toolbar';
import { getRoutes } from '../components/dashboard/routes';
import Title from '../components/dashboard/all/title';
import { translate } from 'react-i18next';

const handleNavBar = () =>
  document.getElementById('wrapper').classList.toggle('enlarged');

export default translate()(({ t }) => {
  const context = useContext(AuthContext);
  return (
    <div id="wrapper">
      <Navbar />
      <div className="content-page">
        <div className="content">
          <Toolbar doNavbarDisplay={handleNavBar} />
          <div className="page-content-wrapper">
            <Switch>
              {getRoutes(context.role).map((r) => (
                <Route
                  key={r.path}
                  path={r.path}
                  component={Title({
                    component: r.component,
                    title: t(r.translation),
                  })}
                />
              ))}
              <Route
                path={'/dashboard/:sth'}
                render={() => <Redirect to="/dashboard/general" />}
              />
              <Route
                path={'/dashboard/'}
                render={() => <Redirect to="/dashboard/general" />}
              />
            </Switch>
          </div>
        </div>
        <footer className="footer">© {t('company.name')}</footer>
      </div>
    </div>
  );
});
