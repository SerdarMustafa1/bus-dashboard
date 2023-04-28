import React, { Component } from 'react';
import queryRequest from '../../utils/queryRequest';

import { translate } from 'react-i18next';

import CampaignDetails from './details';

import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import LanguageSelector from '../../utils/languageSelector';

import logo from '../../images/logo.svg';

const View = translate()(({ t, token, match }) => (
  <div id="wrapper">
    <div className="content-page" style={{ marginLeft: 0 }}>
      <div className="content">
        <div className="page-content-wrapper" style={{ paddingTop: 0 }}>
          <CampaignDetails token={token} match={match} client={true} />
        </div>
      </div>
      <footer className="footer">© {t('company.name')}</footer>
    </div>
  </div>
));

const AlertDismiss = ({ type, hide, message }) => (
  <Alert className="mt-2" variant={type} onClose={() => hide()} dismissible>
    {message}
  </Alert>
);

class ClientLogin extends Component {
  state = {
    password: '',
    logging: null,
    invalid: false,
    connection: false,
    token: '',
  };
  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!this.state.password) return;
    this.setState({ logging: true });
    const query = `query{campaignLogin(_id:"${this.props.match.params.id}",password:"${this.state.password}")}`;
    try {
      const { campaignLogin } = await queryRequest(
        query,
        this.controller.signal
      );
      if (campaignLogin) this.setState({ token: campaignLogin });
      else this.setState({ invalid: true, logging: false });
    } catch (err) {
      if (err.name === 'SyntaxError') {
        this.setState({ connection: true, logging: false });
      } else {
        this.setState({ invalid: true, logging: false });
      }
    }
  };

  handlePassChange = (evt) => this.setState({ password: evt.target.value });

  render() {
    if (this.state.token) {
      return <View token={this.state.token} match={this.props.match} />;
    }

    const { t } = this.props;
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
                <Form.Group>
                  <Form.Label>{t('login.password.label')}</Form.Label>
                  <Form.Control
                    pattern=".{6,}"
                    type="password"
                    placeholder={t('login.password.placeholder')}
                    value={this.state.password}
                    onChange={this.handlePassChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="m-t-20">
                  <Col xs={12} className="text-right">
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
                </Form.Group>
              </Form>

              <Row>
                <Col className="m-t-20 p-0"></Col>
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

export default translate()(ClientLogin);
