import React, { Component } from "react";
import LiveMap from "../map/liveMap";
import queryRequest from "../../../utils/queryRequest";
import { vehID, vehTypeObject } from "../../../utils/vehicleProps";
import InstallationNotificationFeed from '../fleets/installationNotificationFeed';
import Table from '../utils/dataTable';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';

class FleetDetails extends Component {
  state = {
    thead: [
        // this.props.t('db.vehicle.ptable.installer'),
      this.props.t('db.vehicle.ptable.campaignName'),
      this.props.t('db.vehicle.ptable.place'),
      this.props.t('db.vehicle.ptable.amount'),
      this.props.t('db.vehicle.ptable.createdAt')], // "Email", 'Phone',
    columns: [
      {
        data: 'campaign'
      },
      {
        data: 'place',
      },
      {
        data: 'count',
        defaultContent: "0",
        searchable: false,
      },
      {
        data: 'created_at',
        render: (data) => {
          const date = new Date(data);
          return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
        },
        searchable: false,
      },
    ],
    ajax: '/api/datatable/vehicle/',

    vehicle: {},
    campaigns: [],
    loaded: false
  };

  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  async componentDidMount() {
    console.log("fleetFetails");

    const { id } = this.props.match.params;

    const query = `query{vehicle(_id:"${id}"){ _id numberPlate totalAds line city{name}type operator{company} latitude longitude } vehicleCampaigns(_id:"${id}"){ _id name }}`;

    try {
      const { vehicle, vehicleCampaigns } = await queryRequest(query, this.controller.signal);

      this.setState({ vehicle: (vehicle? vehicle:{}), loaded: true, campaigns: vehicleCampaigns });
    } catch (err) {
      if (err.name === 'SyntaxError') {
        console.log("No connection")
      } else {
        console.log("Ohnoo, ", err.toString());
        this.setState({ loaded: true });
      }
    }
  }

  campaignsOnTheFleet = () => {
    return this.state.campaigns.length;
  };

  getMapData = () => {
    const query = `query{vehicle(_id: "${this.state.vehicle._id}"){ _id haveAds longitude latitude line }}`;

    return {
      height: 254,
      query,
      latitude: this.state.vehicle.latitude,
      longitude: this.state.vehicle.longitude,
      getData: data => [data.vehicle,],
      smooth: true,
      zoom: 12
    };
  };


  render() {
    const { t } =this.props;
    if (!this.state.loaded)
      return (
        <div className="container-fluid text-center">
          <h3 className="text-white">{t('loading')}</h3>
        </div>
      );
    if (Object.keys(this.state.vehicle).length === 0)
      return (
        <div className="container-fluid text-center">
          <h3 className="text-white">{t('db.vehicle.404')}</h3>
        </div>
      );
    const { name, img } = vehTypeObject(this.state.vehicle._id);
    return (
      <div className="container-fluid">
        <Row className="border-bottom mb-4">
          <Col xs={12}>
            <h3 className="text-white">{name.toUpperCase() + " " + vehID(this.state.vehicle._id) + ( this.state.vehicle.numberPlate ? `(${this.state.vehicle.numberPlate})`: "" )}</h3>
          </Col>
        </Row>

        <Row>
          <Col xl={8}>
            <Row>
              <Col xl={6}>
                <Card className="m-b-20">
                  <Card.Body>
                    <div className="profile-widget text-center">

                      <Row className="mb-4">
                        <Col className="text-vehicle-info">
                          { this.state.vehicle.operator.company }
                        </Col>
                      </Row>

                      <Row className="text-vehicle-info">
                        <Col><img src={img} alt={name} height='60'/><br/>{this.state.vehicle.numberPlate || ''}</Col>
                        <Col><i className="fa fa-map-marker"/>{name}<br/>{vehID(this.state.vehicle._id)}<br/>{t('db.vehicle.line')} {this.state.vehicle.line}</Col>
                      </Row>

                      <ul className="list-inline row mt-3 mb-0">
                        <li className="col-md-6">
                          <p className="m-b-5 font-18 font-600">{this.campaignsOnTheFleet()}</p>
                          <p className="mb-0">{t('db.vehicle.campaigns')}</p>
                        </li>
                        <li className="col-md-6">
                          <p className="m-b-5 font-18 font-600">{this.state.vehicle.totalAds}</p>
                          <p className="mb-0">{t('db.vehicle.placements')}</p>
                        </li>
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xl={6} className="mb-3">
                <LiveMap data={this.getMapData()} />
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <Card>
                  <Card.Body>
                    <h4 className="mt-0 header-title">{t('db.vehicle.ptable.title')}</h4>
                    <Table order={this.state.order} ajax={`${this.state.ajax}${this.props.match.params.id}`} columns={this.state.columns} thead={this.state.thead}/>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xl={4}>
            <InstallationNotificationFeed id={this.state.vehicle._id} />
          </Col>

        </Row>
      </div>
    );
  }
}

export default translate()(FleetDetails);

// <Table title="Campaigns" className='col-xl-12' message="" doRenderHead={() => this.renderTableHead()} doRenderData={() => this.renderTableData()}/>
