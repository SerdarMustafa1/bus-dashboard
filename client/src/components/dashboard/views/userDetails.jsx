import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';


class UserDetails extends Component {
  state = { 
    user: {},
    loaded: false,
  };

  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }


  async componentDidMount() {
    const { id } = this.props.match.params;

    const query = `query{user(_id:"${id}"){ _id name email phone city {name} created_at }}`;

    try {
      const { user } = await queryRequest(query, this.controller.signal);
      if (user) {
        this.setState({ user, loaded: true });
      } else {
        this.setState({ loaded: true });
      }
    } catch (err) {
      console.log("Ohnoo, ", err.toString());
      this.setState({loaded: true})
    }
  }
  
  render() {
    const { t } = this.props;
    if (!this.state.loaded) return (
    <div className="container-fluid text-center">
      <h3 className="text-white">{t('loading')}</h3>
    </div>);
    if (Object.keys(this.state.user).length === 0) return (
      <div className="container-fluid text-center">
        <h3 className="text-white">{t('db.user.404')}</h3>
      </div>);
    return (
      <div className="container-fluid">
        <Row className="border-bottom mb-4">
          <Col xs={6}>
            <h3 className="text-white">{this.state.user.name}</h3>
          </Col>
        </Row>

        <Row>
          <Col sm={12} md={12} lg={6}>
            <Card className="m-b-20">
              <Card.Body>
                <h4>Details:</h4>
                  <div>Email: {this.state.user.email}</div>
                  <div>Phone: {this.state.user.phone}</div>
                  <div>City: {this.state.user.city.name}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      {/*  Todo: Add Role based statistics here.  */}
        
      </div>
    );
  }
}

export default translate()(UserDetails);
