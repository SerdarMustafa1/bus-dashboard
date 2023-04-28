import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";
import { RoleLink } from "../routes";

import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import AuthContext from "../../../context/auth-context";
import Swal from "sweetalert2";

import { translate } from "react-i18next";

class ClientTool extends Component {
  state = {
    client: { _id: "", company: "", person: "", email: "", phone: "" },
  };

  controller = new AbortController();
  static contextType = AuthContext;

  componentWillReceiveProps(props) {
    this.setState({
      client: { _id: "", company: "", person: "", email: "", phone: "" },
    });
    if (props.selected) {
      this.loadClientData(props.selected);
    }
  }

  async loadClientData(id) {
    const query = `query{ client(_id: "${id}"){ company person email phone }}`;
    try {
      const { client } = await queryRequest(query, this.controller.signal);
      if (client) {
        if (!client.email) client.email = "";
        if (!client.phone) client.phone = "";
        this.setState({ client: { ...client, _id: id } });
      }
    } catch (err) {
      console.log("Fetch failed: ", err.toString());
    }
  }

  handleDelete = async (evt) => {
    const { t } = this.props;
    const query = `mutation{clientHardDelete(_id:"${this.state.client._id}")}`;
    Swal.fire({
      title: t("db.client.form.delete.warning.title"),
      text: t("db.client.form.delete.warning.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.value) return;
      try {
        const { clientHardDelete } = await queryRequest(
          query,
          this.controller.signal
        );
        if (clientHardDelete) {
          Swal.fire({
            icon: "success",
            title: t("db.client.form.delete.success.title"),
            showConfirmButton: false,
            timer: 1500,
          });
          this.setState({
            client: { _id: "", company: "", person: "", email: "", phone: "" },
          });
          this.props.doRefresh();
        } else {
          Swal.fire({
            icon: "error",
            title: t("db.client.form.delete.failed.title"),
            text: t("db.client.form.delete.failed.text"),
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (err) {
        console.log("Error while loading", err.toString());
      }
    });
  };

  async handleSubmit(evt) {
    evt.preventDefault();

    const { _id, company, email, person, phone } = this.state.client;
    const query = _id
      ? `mutation{clientUpdate(_id:"${_id}" company:"${company}",person:"${person}",email:"${email}",phone:"${phone}"){ company }}`
      : `mutation{clientCreate(company:"${company}",person:"${person}",email:"${email}",phone:"${phone}"){ company }}`;
    try {
      await queryRequest(query, this.controller.abort());
      this.setState({
        client: { _id: "", company: "", person: "", email: "", phone: "" },
      });
      this.props.doRefresh();
    } catch (err) {
      console.log(err);
    }
  }

  handleNameChange(evt) {
    this.state.client.company = evt.target.value;
    this.setState({ client: this.state.client });
  }

  handlePersonChange(evt) {
    this.state.client.person = evt.target.value;
    this.setState({ client: this.state.client });
  }

  handleEmailChange(evt) {
    this.state.client.email = evt.target.value;
    this.setState({ client: this.state.client });
  }

  handlePhoneChange(evt) {
    this.state.client.phone = evt.target.value;
    this.setState({ client: this.state.client });
  }

  render() {
    const { t } = this.props;
    return (
      <Col xl={4}>
        <Card className="m-b-20">
          <Card.Body>
            <h4>
              {this.state.client._id ? (
                <React.Fragment>
                  {t("db.client.form.title")}
                  <RoleLink
                    to="client"
                    id={this.state.client._id}
                    className="pull-right"
                  >
                    <i className="mdi mdi-arrow-expand-all m-r-5 text-primary" />
                  </RoleLink>
                </React.Fragment>
              ) : (
                t("db.client.form.title.new")
              )}
            </h4>

            <Form onSubmit={(evt) => this.handleSubmit(evt)}>
              <Form.Group>
                <Form.Label>{t("db.client.form.name")}</Form.Label>
                <Form.Control
                  type="text"
                  value={this.state.client.company}
                  onChange={(evt) => this.handleNameChange(evt)}
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>{t("db.client.form.person")}</Form.Label>
                <Form.Control
                  type="text"
                  value={this.state.client.person}
                  onChange={(evt) => this.handlePersonChange(evt)}
                  required
                />
              </Form.Group>

              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>{t("db.client.form.email")}</Form.Label>
                    <Form.Control
                      type="email"
                      value={this.state.client.email}
                      onChange={(evt) => this.handleEmailChange(evt)}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>{t("db.client.form.phone")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={this.state.client.phone}
                      onChange={(evt) => this.handlePhoneChange(evt)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Button
                    block
                    variant="primary"
                    type="submit"
                    className="waves-effect waves-light"
                  >
                    {this.state.client._id
                      ? t("db.client.form.button.update")
                      : t("db.client.form.button.create")}
                  </Button>
                </Col>
                {this.state.client._id && [5, 11].includes(this.context.role) && (
                  <Col>
                    <Button
                      variant="danger"
                      onClick={this.handleDelete}
                      block
                      className="waves-effect waves-light"
                    >
                      {t("db.client.form.button.delete")}
                    </Button>
                  </Col>
                )}
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    );
  }
}

export default translate()(ClientTool);
