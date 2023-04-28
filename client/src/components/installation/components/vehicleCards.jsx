import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Link} from "react-router-dom";
import Card from "react-bootstrap/Card";
import {vehID, vehTypeObject} from "../../../utils/vehicleProps";
import ProgressBar from "react-bootstrap/ProgressBar";
import ActivityTypes from "../../../utils/activityTypes";
import Badge from "react-bootstrap/Badge";

import { translate } from 'react-i18next';

const VehicleByPlacement = translate()(({t,data}) => {
    return (
        <Link to={`/install/f/${data._id}`} style={{color: 'black'}}>
            <Card className="mb-3 mt-2 shadow" style={{border: 'none'} }>
                <Card.Body className="waves-effect pb-2">
                    <Row className='text-center'>
                        <Col xs={3} className='m-auto'>
                            <img src={vehTypeObject(data._id).img} alt={vehTypeObject(data._id).name} height='60'/>
                        </Col>

                        <Col xs={9} className='m-auto install-col-val' style={{lineHeight:'1.1rem'}}>
                            <strong>{vehID(data._id)}{!data.listed && <Badge variant="warning">{t('i.vehicle.unlisted')}</Badge>}</strong>
                            <div className='description'>{data.operator.company}</div>
                            <h4>{data.installs.map(i=> i.count).reduce((a,b) => a+b, 0)}x {t('i.vehicle.placements')}</h4>
                        </Col>
                    </Row>
                </Card.Body>
                <ProgressBar className="card-bottom-progress" variant='success' now={100} style={{borderRadius:0}}/>
            </Card>
        </Link>
    );
});

const VehicleByHistory = translate()(({t, data}) => {
    const install = data.activityType === ActivityTypes.INSTALL.NEW;
    const color = install ? 'green' : 'red';
    const date = new Date(parseInt(data.created_at));

    let object = install? data.install :data.remove;

    return (
        <Card className="mb-3 mt-2 shadow" style={{border: 'none'}}>
            <Link to={`/install/c/${data.campaign._id}/${data.vehicle._id}/${data.placement._id}`} style={{display: "flex", color: 'black'}}>
                <div className="vertical-text-wrapper" style={{backgroundColor: color}}>
                    <div className="vertical-text">{install ? 'INSTALLED' : 'REMOVED'}</div>
                </div>
                <Card.Body className="waves-effect p-2 pb-1">
                    <Row className='text-center'>
                        <Col xs={3} className='m-auto'>
                            <div>
                                <img src={vehTypeObject(data.vehicle._id).img}
                                     alt={vehTypeObject(data.vehicle._id).name} height='55'/>
                            </div>

                            <div style={{fontSize: '1rem'}}>
                                <strong>{vehID(data.vehicle._id)}</strong>
                            </div>
                            {!data.vehicle.listed && <Badge variant="warning">{t('i.vehicle.unlisted')}</Badge>}
                        </Col>

                        <Col xs={9} className='m-auto install-col-val'>
                            <div>{data.user.name}</div>
                            <h4>{object.count}x {data.placement.place.name}</h4>
                            <div className='description'>{data.campaign.name}</div>
                            <div className="float-right description">{date.getDate().toString().padStart(2, "0")}.{(date.getMonth()+1).toString().padStart(2, "0")}.{date.getFullYear()}</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Link>
            {data.vehicle.haveAds && <ProgressBar className="card-bottom-progress" variant='success' now={100}/>}
        </Card>
    );
});

const VehicleByCampaign = translate()(({t, path, doVehicleSelect, data}) => {
    return (
        <Link to={path} onClick={() => doVehicleSelect(data)} style={{color: 'black'}}>
            <Card className="mb-3 mt-2 shadow" style={{border: 'none'}}>
                <Card.Body className="waves-effect pb-2 pt-2">
                    <Row className='text-center font-sm'>
                        <Col>
                            <Row>
                                <Col xs={5} className='m-auto' style={{padding: 0}}>
                                    <img src={vehTypeObject(data._id).img}
                                         alt={vehTypeObject(data._id).name} height='60'/>
                                </Col>

                                <Col xs={7} className='install-col-val' style={{padding: 0}}>
                                    <strong>{vehID(data._id)}{!data.listed && <Badge variant="warning">{t('i.vehicle.unlisted')}</Badge>}</strong>
                                    <div >{data.operator.company}</div>
                                </Col>
                            </Row>
                        </Col>

                        <Col className='m-auto install-col-val' style={{padding: 0}}>
                            <strong>{data.totalAds}</strong>
                            <div className='description'>{t('i.vehicle.placements')}</div>
                        </Col>

                    </Row>
                </Card.Body>

                {!!data.totalAds &&
                <ProgressBar className="card-bottom-progress" variant='success' now={100}/>}
            </Card>
        </Link>
    );
});

export {
    VehicleByPlacement,
    VehicleByHistory,
    VehicleByCampaign
};
