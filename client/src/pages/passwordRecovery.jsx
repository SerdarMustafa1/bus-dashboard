import React, { Component } from 'react';
import queryRequest from '../utils/queryRequest';

import { translate } from 'react-i18next';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const RecoveryForm = translate()(({ t, doSubmit, value, doEmailChange }) => {
  return (
    <Form onSubmit={doSubmit}>
      <h4 className="mt-0 header-title">{t('forget.title')}</h4>
      <p className="mb-10">{t('forget.from.email.label')}</p>
      <Form.Group>
        <Form.Control
          type="email"
          name="email"
          autoComplete="username"
          placeholder={t('forget.form.email.placeholder')}
          value={value}
          onChange={doEmailChange}
          required
        />
      </Form.Group>
      <Button
        variant="primary"
        className="w-md waves-effect waves-light"
        type="submit"
      >
        {t('forget.form.button.label')}
      </Button>
    </Form>
  );
});

const Information = translate()(({ t }) => {
  return (
    <React.Fragment>
      <h4 className="mt-0 header-title">{t('forget.submit.title')}</h4>
      <p className="mb-10">{t('forget.submit.description')}</p>
    </React.Fragment>
  );
});

class PasswordRecovery extends Component {
  state = {
    email: '',
    submit: false,
  };
  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!this.state.email) return;
    const query = `query{passwordRecovery(email:"${this.state.email}")}`;

    try {
      await queryRequest(query, this.controller.signal);
      this.setState({ submit: true });
    } catch (err) {
      console.log(err);
    }
  };

  handleEmailChange = (evt) => this.setState({ email: evt.target.value });

  render() {
    return (
      <div className="wrapper-page">
        <Card>
          <Card.Body>
            <div className="p-2">
              {!this.state.submit && (
                <RecoveryForm
                  doEmailChange={this.handleEmailChange}
                  doSubmit={this.handleSubmit}
                  value={this.state.email}
                />
              )}
              {this.state.submit && <Information />}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default PasswordRecovery;
