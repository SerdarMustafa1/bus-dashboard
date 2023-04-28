import jwt_decode from 'jwt-decode';
import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { translate } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router-dom';

import AuthContext from '../context/auth-context';

import Dashboard from '../pages/dashboard';
import Installation from '../pages/installation';
import Login from '../pages/login/login';

import queryRequest from '../utils/queryRequest';

const rolesToDashboard = [1, 3, 5];

const LoggingIn = translate()(({ t }) => (
  <div className="wrapper-page">
    <Card>
      <Card.Body>
        <div className="p-2">
          <div className="text-center m-3">
            <Spinner
              animation="border"
              variant="info"
              style={{ width: '4rem', height: '4rem' }}
            />
          </div>
          <h4 className="mt-0 header-title text-center">
            {t('login.logging')}
          </h4>
        </div>
      </Card.Body>
    </Card>
  </div>
));

class Auth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      validated: null,
      expired: false,
      connection: false,
      token: null,
      user: {
        name: null,
        role: null,
      },
      tokenExpiration: null,
    };
    if (sessionStorage.getItem('ACCESS_TOKEN')) {
      sessionStorage.setItem('_t', sessionStorage.getItem('ACCESS_TOKEN'));
      sessionStorage.removeItem('ACCESS_TOKEN');
    }
    if (localStorage.getItem('ACCESS_TOKEN')) {
      localStorage.setItem('_t', localStorage.getItem('ACCESS_TOKEN'));
      localStorage.removeItem('ACCESS_TOKEN');
    }
    if (sessionStorage.getItem('_t') || localStorage.getItem('_t')) {
      this.state.token =
        sessionStorage.getItem('_t') || localStorage.getItem('_t');
      this.tokenValidate();
    }
  }
  controller = new AbortController();
  componentWillUnmount() {
    this.controller.abort();
  }

  tokenValidate = async () => {
    const query = 'query{tokenValidate}';
    try {
      const { tokenValidate } = await queryRequest(
        query,
        this.controller.signal
      );
      this.login(tokenValidate, true);
    } catch (err) {
      if (err.name === 'SyntaxError') {
        this.setState({ validated: false, connection: true });
      } else {
        this.setState({ validated: false, expired: true });
      }
    }
  };

  login = (token, remember) => {
    if (!token) return;
    if (remember) {
      localStorage.setItem('_t', token);
      sessionStorage.removeItem('_t');
    } else {
      localStorage.removeItem('_t');
      sessionStorage.setItem('_t', token);
    }
    const token_data = jwt_decode(token);
    this.setState({
      token,
      user: {
        _id: token_data.userId,
        name: token_data.userName,
        role: token_data.userRole,
      },
      tokenExpiration: token_data.exp,
      validated: true,
      connection: false,
      expired: false,
    });
  };

  logout = () => {
    localStorage.removeItem('_t');
    sessionStorage.removeItem('_t');
    this.setState({
      token: null,
      user: { name: null, role: null },
      tokenExpiration: null,
      validated: null,
    });
  };

  render() {
    const {
      validated,
      token,
      user,
      expired,
      connection,
      tokenExpiration,
    } = this.state;
    if (validated === null && token !== null) return <LoggingIn />;

    return (
      <AuthContext.Provider
        value={{
          tokenExpiration: tokenExpiration,
          token: token,
          _id: user._id,
          name: user.name,
          role: user.role,
          validated: validated,
          login: this.login,
          logout: this.logout,
        }}
      >
        {!validated && <Login expired={expired} connection={connection} />}
        {validated && (
          <Switch>
            <Route path="/install" component={Installation} />
            {rolesToDashboard.includes(user.role) && (
              <Route path="/dashboard" component={Dashboard} />
            )}

            <Route component={() => <RootRedirect role={user.role} />} />
          </Switch>
        )}
      </AuthContext.Provider>
    );
  }
}

const RootRedirect = ({ role }) => {
  if (rolesToDashboard.includes(role)) return <Redirect to="/dashboard" />;
  return <Redirect to="/install" />;
};

export default Auth;
