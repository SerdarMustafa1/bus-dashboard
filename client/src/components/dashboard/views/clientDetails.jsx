import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';


class ClientDetails extends Component {
  state = {
    client: {},
    loaded: false
  };

  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  async componentDidMount() {
    console.log("ClientDetails");
    const query = `query{client(_id:"${this.props.match.params}"){ _id company person email phone }}`;

    try {
      const { client } = await queryRequest(query, this.controller.signal);
      if (client) {
        this.setState({ client, loaded: true });
      } else {
        this.setState({ loaded: true });
      }
    } catch (err) {
      console.log("Ohnoo, ", err.toString());
      this.setState({ loaded: true });
    }
  }

  render() {
    const { t } = this.props;
    if (!this.state.loaded)
      return (
        <div className="container-fluid text-center">
          <h3 className="text-white">{t('loading')}</h3>
        </div>
      );
    if (Object.keys(this.state.client).length === 0)
      return (
        <div className="container-fluid text-center">
          <h3 className="text-white">{t('db.client.404')}</h3>
        </div>
      );
    return (
      <div className="container-fluid ">
        <Row className="border-bottom mb-4">
          <Col xs={12}>
            <h3 className="text-white">
              {this.state.client.company}
            </h3>
          </Col>
        </Row>

        <Row>
          <Col sm={12} md={12} lg={6}>
            <Card className="m-b-20">
              <Card.Body>
                <h4>Details:</h4>
                  <div>Contact person: {this.state.client.person}</div>
                  <div>Email: {this.state.client.email}</div>
                  <div>Phone: {this.state.client.phone}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </div>
    );
  }
}

export default translate()(ClientDetails);
