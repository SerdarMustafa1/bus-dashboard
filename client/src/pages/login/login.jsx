import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { translate } from 'react-i18next';
import { Link } from 'react-router-dom';

import AuthContext from '../../context/auth-context';

import logo from '../../images/logo.svg';

import LanguageSelector from '../../utils/languageSelector';
import queryRequest from '../../utils/queryRequest';

import './loginPage.styles';
import { HideIcon, InputWrapper, LoginInput } from './loginPage.styles';

const AlertDismiss = (props) => {
  return (
    <Alert
      className="mt-2"
      variant={props.type}
      onClose={() => props.hide()}
      dismissible
    >
      {props.message}
    </Alert>
  );
};

class Login extends Component {
  state = {
    email: '',
    password: '',
    remember: true,
    logging: null,
    expired: this.props.expired,
    invalid: false,
    connection: this.props.connection,
    hidden: true,
  };

  controller = new AbortController();
  static contextType = AuthContext;

  componentWillUnmount() {
    this.controller.abort();
  }

  handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!this.state.email || !this.state.password) return;
    this.setState({ logging: true });
    const query = `query{login(email:"${this.state.email}",password:"${this.state.password}")}`;

    try {
      const { login } = await queryRequest(query, this.controller.signal);
      if (!login)
        this.setState({ invalid: true, logging: false, expired: false });
      else this.context.login(login, this.state.remember);
    } catch (err) {
      if (err.name === 'SyntaxError') {
        this.setState({ connection: true, logging: false, expired: false });
      } else {
        this.setState({ invalid: true, logging: false, expired: false });
      }
    }
  };

  handlePasswordToggle = () => {
    this.setState((prevState) => ({ hidden: !prevState.hidden }));
  };

  handleUserChange = (evt) => {
    this.setState({
      email: evt.target.value,
    });
  };

  handlePassChange = (evt) => {
    this.setState({
      password: evt.target.value,
    });
  };

  handleRemeber = (evt) => {
    this.setState({
      remember: evt.target.checked,
    });
  };

  render() {
    const { t } = this.props;
    const hidden = this.state.hidden;
    return (
      <div className="wrapper-page">
        <Card>
          <Card.Body>
            <div className="p-2">
              <h3 className="text-center m-0">
                <a href="/" className="logo logo-admin">
                  <img src={logo} height="100" alt="logo" />
                </a>
              </h3>

              {this.state.expired && (
                <AlertDismiss
                  message={t('login.failed.session')}
                  hide={() => this.setState({ expired: false })}
                  type="warning"
                />
              )}
              {this.state.invalid && (
                <AlertDismiss
                  message={t('login.failed.invalid')}
                  hide={() => this.setState({ invalid: false })}
                  type="danger"
                />
              )}
              {this.state.connection && (
                <AlertDismiss
                  message={t('login.failed.connection')}
                  hide={() => this.setState({ connection: false })}
                  type="warning"
                />
              )}

              <Form onSubmit={this.handleSubmit}>
                <InputWrapper>
                  <Form.Group>
                    <Row>
                      <Form.Label>{t('login.email.label')}</Form.Label>
                    </Row>
                    <Row>
                      <LoginInput
                        type="email"
                        name="email"
                        autoComplete="username"
                        placeholder={t('login.email.placeholder')}
                        value={this.state.username}
                        onChange={this.handleUserChange}
                        required
                      />
                    </Row>
                  </Form.Group>
                  <Form.Group>
                    <Row>
                      <Form.Label>{t('login.password.label')}</Form.Label>
                    </Row>
                    <Row>
                      <LoginInput
                        // pattern=".{6,}"
                        minLength="6"
                        type={hidden === true ? 'password' : 'text'}
                        name="password"
                        autoComplete="password"
                        placeholder={t('login.password.placeholder')}
                        value={this.state.password}
                        onChange={this.handlePassChange}
                        required
                      />

                      <HideIcon onClick={this.handlePasswordToggle}>
                        {hidden === true ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </HideIcon>
                    </Row>
                  </Form.Group>
                </InputWrapper>
                <Row className="m-t-20">
                  <Col xs={6}>
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customControlInline"
                        checked={this.state.remember}
                        onChange={this.handleRemeber}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customControlInline"
                      >
                        {t('login.remember.label')}
                      </label>
                    </div>
                  </Col>
                  <Col xs={6} className="text-right">
                    <Button
                      variant="primary"
                      className="w-md waves-effect waves-light"
                      type="submit"
                    >
                      {this.state.logging && (
                        <Spinner
                          animation="border"
                          size="sm"
                          className="mr-1"
                        />
                      )}
                      {t('login.button.submit.label')}
                    </Button>
                  </Col>
                </Row>
              </Form>
              <Row>
                <Col className="m-t-20 p-0 d-flex align-items-center">
                  <Link className="text-muted" to="/reset_password">
                    <i className="mdi mdi-lock" />
                    {t('login.forget.label')}
                  </Link>
                </Col>
                <Col xs={2} className="m-t-20 p-0">
                  <LanguageSelector />
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }
}
export default translate()(Login);
