import React, { Component } from 'react';
import queryRequest from '../utils/queryRequest';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import { translate } from 'react-i18next';

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const RecoveryForm = translate()(
  ({ t, doSubmit, pass1, doPassword1Change, pass2, doPassword2Change }) => (
    <Form onSubmit={doSubmit}>
      <h4 className="mt-0 header-title">{t('reset.title')}</h4>
      <Form.Group>
        <Form.Label>{t('reset.form.password1.label')}</Form.Label>
        <Form.Control
          type="password"
          pattern=".{6,}"
          placeholder={t('reset.form.password1.placeholder')}
          value={pass1}
          onChange={doPassword1Change}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>{t('reset.form.password2.label')}</Form.Label>
        <Form.Control
          type="password"
          pattern=".{6,}"
          placeholder={t('reset.form.password2.placeholder')}
          value={pass2}
          onChange={doPassword2Change}
          required
        />
      </Form.Group>
      <Button
        variant="primary"
        className="w-md waves-effect waves-light"
        type="submit"
      >
        {t('reset.form.button.submit')}
      </Button>
    </Form>
  )
);

const Information = translate()(({ t }) => (
  <React.Fragment>
    <h4 className="mt-0 header-title">{t('reset.submit.title')}</h4>
    <p className="mb-10">{t('reset.submit.description')}</p>
    <Link className="btn btn-primary w-md waves-effect waves-light" to="/login">
      {t('reset.submit.button.redirect.login')}
    </Link>
  </React.Fragment>
));

const InvalidToken = translate()(({ t }) => (
  <React.Fragment>
    <h4 className="mt-0 header-title">{t('reset.invalid.title')}</h4>
    <p className="mb-10">{t('reset.invalid.description')}</p>
    <Link
      className="btn btn-primary w-md waves-effect waves-light"
      to="/reset_password"
    >
      {t('reset.invalid.button.redirect.reset')}
    </Link>
  </React.Fragment>
));

class NewPassword extends Component {
  state = {
    password1: '',
    password2: '',
    token: '',
    tokenError: false,
    success: false,
  };

  controller = new AbortController();
  componentDidMount() {
    this.validateToken(this.props.match.params.token);
  }
  componentWillUnmount() {
    this.controller.abort();
  }

  handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!this.state.token) return;
    if (!this.state.password1) return;
    if (!this.state.password2) return;
    if (this.state.password1 !== this.state.password2) return;

    const query = `mutation{resetPassword(token:"${this.state.token}", password:"${this.state.password1}")}`;
    try {
      const { resetPassword } = await queryRequest(
        query,
        this.controller.signal
      );
      const { t } = this.props;
      if (!resetPassword) {
        Swal.fire({
          icon: 'error',
          title: t('reset.form.invalid.title'),
          text: t('reset.form.invalid.text'),
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: t('reset.form.success.title'),
          showConfirmButton: false,
          timer: 1500,
        });
        this.setState({ success: true });
      }
    } catch (err) {
      console.log(err);
    }
  };

  validateToken = async (token) => {
    const query = `query{recoveryValidate(token:"${token}")}`;
    try {
      const { recoveryValidate } = await queryRequest(
        query,
        this.controller.signal
      );
      if (!recoveryValidate) this.setState({ tokenError: true });
      else this.setState({ token: recoveryValidate });
    } catch (err) {
      this.setState({ tokenError: true });
      console.log(err);
    }
  };

  handlePassword1Change = (evt) =>
    this.setState({ password1: evt.target.value });
  handlePassword2Change = (evt) =>
    this.setState({ password2: evt.target.value });

  render() {
    if (!this.state.token && !this.state.tokenError) return null;
    return (
      <div className="wrapper-page">
        <Card>
          <Card.Body>
            <div className="p-2">
              {this.state.tokenError && <InvalidToken />}
              {!this.state.tokenError && !this.state.success && (
                <RecoveryForm
                  doPassword1Change={this.handlePassword1Change}
                  doPassword2Change={this.handlePassword2Change}
                  doSubmit={this.handleSubmit}
                  pass1={this.state.password1}
                  pass2={this.state.password2}
                />
              )}
              {!this.state.tokenError && this.state.success && <Information />}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }
}
export default translate()(NewPassword);
