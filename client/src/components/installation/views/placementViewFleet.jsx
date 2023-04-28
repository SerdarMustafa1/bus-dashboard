import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";
import { Redirect} from "react-router-dom";
import { vehID, vehTypeObject } from "../../../utils/vehicleProps";

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from "react-bootstrap/Badge";

import {compressInstallsInVehicle, handleAdRemoving} from "../utils";

import { translate } from 'react-i18next';

const PlacementUninstallCard = translate()(({data, doRemoving, t}) => {
  return (
    <Row className="text-center p-2 pt-3 pb-3 shadow mt-2">
      <Col xs={8} className="m-auto">
        <strong>{data.count}x {data.placement.place.name}</strong>
        <div className='description'>{data.campaign.name}</div>
      </Col>
      <Col xs={4} className="m-auto" style={{ padding: 0 }}>
        <Button onClick={doRemoving} variant="danger" className="waves-effect" style={{ fontSize: "0.9rem" }}>{t('i.remove.form.button.label')}</Button>
      </Col>
    </Row>
  )
});

class PlacementViewFleet extends Component {
  // const { vehicle } = this.props.match.params;
  state = {
    installs: [],
    vehicle: null,
    redirect: false
  };

  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  componentDidMount() {
    this.handleVehicleLoad().then(() => {
      this.handlePlacementsLoad();
    }).catch(() =>{
      this.setState({redirect: true})
    });
  }

  handleVehicleLoad = async () => {
    const query = `query{ vehicle(_id:"${this.props.match.params.vehicle}"){ _id operator{company} listed}}`;

    try {
      const { vehicle } = await queryRequest(query, this.controller.signal);
      if (vehicle) {
        console.log('Vehicle loaded', vehicle);
        this.setState({vehicle});
      } else {
        console.log('Vehicle not found', vehicle);
        this.setState({redirect:true})
      }
    } catch (err) {
      console.log('ERROR', err);
      this.setState({redirect:true})
    }
  };

  handlePlacementsLoad = async () => {
    const query = `query{ vehicleInstalls(_id:"${this.state.vehicle._id}"){ id count campaign{ _id name } count placement{_id place{name}}}}`;

    try {
      const {vehicleInstalls} = await queryRequest(query, this.controller.signal);
      if (vehicleInstalls) this.setState({ installs: compressInstallsInVehicle(vehicleInstalls) });
    } catch (err) {
      console.log("error", err);
    }
  };

  render() {
    if (this.state.redirect) return <Redirect to="/install/f"/>;
    if (!this.state.vehicle) return null;
    const { t } = this.props;

    return (
      <Container>
        <Card className="mt-2 shadow" style={{border: 'none'}}>
          <Card.Body>
            <Row className='text-center'>
              <Col>
                <Row>
                  <Col xs={5} className='m-auto' style={{padding:0}}>
                    <img src={vehTypeObject(this.state.vehicle._id).img} alt={vehTypeObject(this.state.vehicle._id).name} height='60'/>
                  </Col>

                  <Col xs={7} style={{padding:0}}>
                    <strong>{vehID((this.state.vehicle._id))}{!this.state.vehicle.listed && <Badge variant="warning">{t('i.vehicle.unlisted')}</Badge>}</strong>
                    <div className='description'>{this.state.vehicle.operator.company}</div>
                  </Col>
                </Row>
              </Col>

              <Col className='m-auto p-0'>
                <strong>{this.state.installs.length && this.state.installs.map(i=> i.count).reduce((a,b) => a+b,0)}</strong>
                <div className='description'>{t('i.vehicle.placements')}</div>
              </Col>
            </Row>

            <div className="border-top mt-4" style={{marginLeft:10, marginRight:10}}>
              {this.state.installs.map(i => <PlacementUninstallCard key={i.id} doRemoving={() => handleAdRemoving(this.state.vehicle._id, i.placement._id, t, this.handlePlacementsLoad)} data={i}/>)}
            </div>

          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default translate()(PlacementViewFleet);
