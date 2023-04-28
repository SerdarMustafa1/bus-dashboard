import React, {Component} from "react";
import {Link, Switch, Route, Redirect} from "react-router-dom";

import PlacementView from './placementView';

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Badge from 'react-bootstrap/Badge';
import { CampaignNav } from "../components/navs";
import {vehTypeObject, vehID} from "../../../utils/vehicleProps";

import { translate } from 'react-i18next';

const PlacementItem = ({data, doSelection, path}) => {
    const installed = data.installs.map(pl => pl.count).reduce((a, b) => a + b, 0);
    const all = data.count;
    return (
        <Col xs={6} md={4} onClick={doSelection}>
            <Link to={`${path}/${data._id}`} style={{color: 'black'}}>
                <Card className="text-center mb-1 mt-2 shadow">
                    <Card.Body className="waves-effect pl-1 pr-1">
                        <strong>{installed}/{all}</strong>
                        <div className='description font-sm'>{data.place.name}</div>
                    </Card.Body>
                    <ProgressBar className="card-bottom-progress" variant='success' now={installed * 100 / all}
                                 style={{borderRadius: 0}}/>
                </Card>
            </Link>
        </Col>
    );
};

const Placements = translate()(({t, campaign, doSelection, path}) => {
    return (
        <React.Fragment>
            <h4 className='text-center m-0'>{t('i.vehicle.placements.title')}</h4>
            <Row className="mt-3">
                {campaign.placements.map(placem => {
                    return <PlacementItem doSelection={() => doSelection(placem)} key={placem._id} path={path} data={placem}/>;
                })}
            </Row>
        </React.Fragment>
    )
});

class VehicleView extends Component {
    // const {campaign, vehicle} = this.props.match.params;
    state = {
        selectedPlacement: {}
    };

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        if (!this.props.vehicle._id) this.props.doVehicleLoad();
    }

    handlePlacementLoad = (_id) => {
        const placement = this.props.campaign.placements.find(placement => placement._id === _id);
        if (placement) this.setState({selectedPlacement: placement});
        else console.log("PLACEMENT DOES NOT EXIST")
    };
    
    handleSelection = (placement) => {
        this.setState({selectedPlacement: placement});
    };

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                <CampaignNav campaign={this.props.campaign}/>
                {!this.props.vehicle._id && null}
                {this.props.vehicle._id && (
                    <Container style={{marginTop: 135}}>
                        <Card className="mb-2 mt-2 shadow" style={{border: 'none'}}>
                            <Card.Body className="pb-3">
                                <h3 className='text-center mb-3 mt-0'>{t('i.vehicle.placement.title')}</h3>
                                <Row className='text-center font-sm'>
                                    <Col>
                                        <Row>
                                            <Col xs={5} className='m-auto' style={{padding: 0}}>
                                                <img src={vehTypeObject(this.props.vehicle._id).img}
                                                     alt={vehTypeObject(this.props.vehicle._id).name} height='60'/>
                                            </Col>

                                            <Col xs={7} style={{padding: 0}}>
                                                <strong>{vehID((this.props.vehicle._id))}{!this.props.vehicle.listed && <Badge variant="warning">{t('i.vehicle.unlisted')}</Badge>}</strong>
                                                <div className='description'>{this.props.vehicle.operator.company}</div>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col className='m-auto' style={{padding: 0}}>
                                        <strong>{this.props.vehicle.totalAds}</strong>
                                        <div className='description'>{t('i.vehicle.placements')}</div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        {/*  */}
                        <Card>
                            <Card.Body>
                                <Switch>
                                    <Route
                                        path="/install/c/:campaign/:vehicle/:placement"
                                        render={(props) => <PlacementView {...props}
                                                                          doPlacementLoad={this.handlePlacementLoad}
                                                                          doCampReload={this.props.doCampReload}
                                                                          doVehicleReload={this.props.doVehicleLoad}
                                                                          path={`/install/c/${props.match.params.campaign}/${props.match.params.vehicle}/${props.match.params.placement}`}
                                                                          placement={this.state.selectedPlacement}
                                                                          campaign={this.props.campaign}
                                                                          vehicle={this.props.vehicle}
                                        />}
                                    />
                                    <Route path="/install/c/:campaign/:vehicle/"
                                        render={(props) => <Placements doSelection={this.handleSelection}
                                                                       path={`/install/c/${props.match.params.campaign}/${props.match.params.vehicle}`}
                                                                       campaign={this.props.campaign}/>}/>
                                    <Route render={() => <Redirect to={`/install/c/${this.state.campaign}`}/>} />
                                </Switch>
                            </Card.Body>
                        </Card>
                    </Container>)}
            </React.Fragment>
        );
    }
}

export default translate()(VehicleView);
