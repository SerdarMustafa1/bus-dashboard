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

class TeamsTool extends Component {
  state = {
    team: { _id: "", company: "" },
  };

  controller = new AbortController();
  static contextType = AuthContext;
  componentWillUnmount() {
    this.controller.abort();
  }

  componentWillReceiveProps(props) {
    console.log("teamsTool.props", props);
    this.setState({ team: { _id: "", company: "" } });
    if (Object.keys(props.selected).length) {
      this.setState({
        team: { _id: props.selected._id, company: props.selected.company },
      });
      this.loadTeamData(props.selected._id);
    }
  }

  async loadTeamData(id) {
    const query = `query{ team(_id: "${id}") { company }}`;
    try {
      const { team } = await queryRequest(query, this.controller.signal);
      if (team) this.setState({ team: { ...team, _id: id } });
    } catch (err) {
      console.log("Fetch failed: ", err.toString());
    }
  }

  handleDelete = async (evt) => {
    const { t } = this.props;
    const query = `mutation{teamHardDelete(_id:"${this.state.team._id}")}`;
    Swal.fire({
      title: t("db.team.form.delete.warning.title"),
      text: t("db.team.form.delete.warning.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.value) return;
      try {
        const { teamHardDelete } = await queryRequest(
          query,
          this.controller.signal
        );
        if (teamHardDelete) {
          Swal.fire({
            icon: "success",
            title: t("db.team.form.delete.success.title"),
            showConfirmButton: false,
            timer: 1500,
          });
          this.setState({ team: { _id: "", company: "" } });
          this.props.doRefresh();
        } else {
          Swal.fire({
            icon: "error",
            title: t("db.team.form.delete.failed.title"),
            text: t("db.team.form.delete.failed.text"),
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

    const { _id, company } = this.state.team;
    const query = _id
      ? `mutation{teamUpdate(_id:"${_id}" company:"${company}"){ _id }}`
      : `mutation{teamCreate(company:"${company}"){ _id company }}`;
    try {
      const res = await queryRequest(query, this.controller.signal);
      // const data = res.teamCreate || res.teamUpdate;
      this.props.doRefresh();
      // if (res.teamCreate) this.props.doSelect(data);
    } catch (err) {
      console.log(err);
    }
  }

  handleNameChange(evt) {
    this.state.team.company = evt.target.value;
    this.setState({ team: this.state.team });
  }

  render() {
    const { t } = this.props;
    return (
      <Card className="m-b-20">
        <Card.Body>
          <h4>
            {this.state.team._id ? (
              <React.Fragment>
                {t("db.team.form.title")}
                <RoleLink
                  to="team"
                  id={this.state.team._id}
                  className="pull-right"
                >
                  <i className="mdi mdi-arrow-expand-all m-r-5 text-primary" />
                </RoleLink>
              </React.Fragment>
            ) : (
              t("db.team.form.title.new")
            )}
          </h4>

          <Form onSubmit={(evt) => this.handleSubmit(evt)}>
            <Form.Group>
              <Form.Label>{t("db.team.form.company")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("db.team.form.company")}
                value={this.state.team.company}
                onChange={(evt) => this.handleNameChange(evt)}
                required
              />
            </Form.Group>

            <Row>
              {this.state.team._id && (
                <Col xs={12} className="mb-2">
                  <RoleLink
                    to="team"
                    id={this.state.team._id}
                    className="btn btn-block btn-primary waves-effect waves-light"
                  >
                    {t("db.team.form.button.view")}
                  </RoleLink>
                </Col>
              )}
              <Col>
                <Button
                  block
                  variant="success"
                  type="submit"
                  className="waves-effect waves-light"
                >
                  {this.state.team._id
                    ? t("db.team.form.button.update")
                    : t("db.team.form.button.create")}
                </Button>
              </Col>
              {this.state.team._id && [5, 11].includes(this.context.role) && (
                <Col>
                  <Button
                    variant="danger"
                    onClick={this.handleDelete}
                    block
                    className="waves-effect waves-light"
                  >
                    {t("db.team.form.button.delete")}
                  </Button>
                </Col>
              )}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    );
  }
}

export default translate()(TeamsTool);
