import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";
import Select from "react-select";
// import { RoleLink } from "../routes";
import { roles, roleTranslate } from '../../../utils/roles';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import AuthContext from "../../../context/auth-context";

import {translate} from 'react-i18next';
import Swal from "sweetalert2";

class UserTool extends Component {
  state = {
    user: {
      _id: "",
      name: "",
      role: null,
      city: null,
      email: "",
      phone: ""
    },
    selection: {
      cities: [],
      roles: roles.map(k => {return { value: k, label: roleTranslate(k, this.props.t) }}),
    }
  };

  static contextType = AuthContext;

  empty = { ...this.state.user };
  edit = false;

  controller = new AbortController();

  componentDidMount() {
    this.loadAllCities();
  }
  componentWillUnmount() {
    this.controller.abort();
  }

  loadAllCities = async () => {
    const query = `query{cities{_id name}}`;
    try {
      const data = await queryRequest(query, this.controller.signal);
      this.state.selection.cities = data.cities.map(city => {
        return { value: city._id, label: city.name };
      });
      this.setState({ selection: this.state.selection });
    } catch (err) {
      console.log("City load failed: ", err.toString());
    }
  };

  componentWillReceiveProps = props => {
    if (props.selected) this.loadUserData(props.selected);
    else this.setState({ user: this.empty });
  };

  loadUserData = async id => {
    const query = `query{user(_id:"${id}"){name email phone city{_id name}role}}`

    try {
      const { user } = await queryRequest(query, this.controller.signal);
      console.log(user);

      if (user.city) {
        user.city = {
          value: user.city._id,
          label: user.city.name
        };
      }
      user.role = {
        value: user.role,
        label: roleTranslate(user.role, this.props.t),
      };
      if (!user.phone) {
        user.phone = '';
      }

      this.setState({ user: {...user, _id: id } });
    } catch (err) {
      console.log("Error finding user", err.toString());
    }
  };

  handleSubmit = async evt => {
    evt.preventDefault();

    const { _id, name, email, phone, city, role } = this.state.user;

    if (!city) {
      console.log("City is not selected");
      return;
    }
    if (!name || !email) return;

    let roleSave = "";
    if (role) {
      roleSave = role.value;
    }

    const query = _id ? `mutation{userUpdate(_id:"${_id}",name:"${name}",email:"${email}",phone:"${phone}",role:${roleSave}, city:"${city.value}"){_id}}`
        :`mutation{userCreate(name:"${name}",email:"${email}",phone:"${phone}",role:${roleSave}, city:"${city.value}"){_id}}`;

    try {
      const result = await queryRequest(query);
      if (result) {
        this.setState({user: {
            _id: "",
            name: "",
            role: null,
            city: null,
            email: "",
            phone: ""
          }});
        this.props.doRefresh()
      }
    } catch (err) {
      console.log("Fetch failed: ", err.toString());
    }
  };

  handleDelete = async (evt) => {
    const { t } = this.props;
    const query = `mutation{userHardDelete(_id:"${this.state.user._id}")}`;
    Swal.fire({
      title: t('db.user.form.delete.warning.title'),
      text: t('db.user.form.delete.warning.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (!result.value) return;
      try {
        const { userHardDelete } = await queryRequest(query, this.controller.signal);
        if (userHardDelete) {
          Swal.fire({
            icon: 'success',
            title: t('db.user.form.delete.success.title'),
            showConfirmButton: false,
            timer: 1500
          });
          // this.setState({ user: {_id: "", company: ""} });
          // Todo: deSelect
          this.props.doRefresh();
        } else {
          Swal.fire({
            icon: 'error',
            title: t('db.user.form.delete.failed.title'),
            text: t('db.user.form.delete.failed.text'),
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch (err) {
        console.log("Error while loading", err.toString());
      }
    });
  };

  handleNameChange = evt => {
    this.state.user.name = evt.target.value;
    this.setState({ user: this.state.user });
  };

  handleEmailChange = evt => {
    this.state.user.email = evt.target.value;
    this.setState({ user: this.state.user });
  };

  handlePhoneChange = evt => {
    this.state.user.phone = evt.target.value;
    this.setState({ user: this.state.user });
  };

  handleCityChange = selected => {
    this.state.user.city = selected;
    this.setState({ user: this.state.user });
  };
  handleRoleChange = selected => {
    this.state.user.role = selected;
    this.setState({ user: this.state.user });
  };

  render() {
    const { t } = this.props;
    return (
      <Col xl={4}>
        <Card className="m-b-20">
          <Card.Body >
            <h4>
              {this.state.user._id ?
                  <React.Fragment>
                    {t('db.user.form.title')}
                    {/*<RoleLink to='user' id={this.state.user._id} className="pull-right">*/}
                    {/*  <i className="mdi mdi-arrow-expand-all m-r-5 text-primary"/>*/}
                    {/*</RoleLink>*/}
                  </React.Fragment> : t('db.user.form.title.new')}
            </h4>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group className="form-group">
                <Form.Label>{t('db.user.form.name')}</Form.Label>
                <Form.Control type="text"
                              value={this.state.user.name}
                              onChange={this.handleNameChange}
                              required/>
              </Form.Group>

              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>{t('db.user.form.email')}</Form.Label>
                    <Form.Control type="email"
                                  value={this.state.user.email}
                                  onChange={this.handleEmailChange}
                                  required/>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>{t('db.user.form.phone')}</Form.Label>
                    <Form.Control type="text"
                                  value={this.state.user.phone}
                                  onChange={this.handlePhoneChange}/>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="mb-0">{t('db.user.form.city')}</Form.Label>
                    <Select
                      value={this.state.user.city}
                      onChange={this.handleCityChange}
                      options={this.state.selection.cities}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="mb-0">{t('db.user.form.role')}</Form.Label>
                    <Select
                      value={this.state.user.role}
                      onChange={this.handleRoleChange}
                      options={this.state.selection.roles}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Button variant="primary" type="submit" block className="waves-effect waves-light">
                    { this.state.user._id ? t('db.user.form.button.update'): t('db.user.form.button.create')}
                  </Button>
                </Col>
                { this.state.user._id && [5, 11].includes(this.context.role) &&
                <Col>
                  <Button variant="danger" onClick={this.handleDelete} block className="waves-effect waves-light">
                    {t('db.user.form.button.delete')}
                  </Button>
                </Col>}
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    );
  }
}

export default translate()(UserTool);
