import React, {Component} from "react";
import AuthContext from "../../../context/auth-context";
import queryRequest from "../../../utils/queryRequest";
import { vehID, vehTypeStr } from "../../../utils/vehicleProps";

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';

import {translate} from 'react-i18next';
import formatDate from "../../../utils/formatDate";

const ListItem = translate()(({t, campaign, selected, click}) =>
    <Card style={{backgroundColor:'rgba(0,0,0,0)', border:'unset'}}>
        <Accordion.Toggle as={Card.Header} eventKey={campaign._id} style={{border:'unset'}} onClick={click} className="p-1">
            <strong><a href={`/dashboard/campaign/${campaign._id}`} className='text-orange'> {campaign.name}</a></strong> <i className={`fa ${ selected ?'fa-angle-up' : 'fa-angle-down'}`} style={{cursor:'pointer'}}/>
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={campaign._id}>
            <Card.Body className="p-2">
                <Col>
                    <Row>
                        {t('map.marker.pre.client')}&nbsp;<strong><a href={`/dashboard/client/${campaign.client._id}`} className='text-orange'>{campaign.client.company}</a></strong>
                    </Row>
                    <Row>
                        {t('map.marker.pre.startDate')}&nbsp;<strong>{formatDate(parseInt(campaign.startDate))}</strong>
                    </Row>
                    <Row>
                        {t('map.marker.pre.endDate')}&nbsp;<strong>{formatDate(parseInt(campaign.endDate))}</strong>
                    </Row>
                </Col>
            </Card.Body>
        </Accordion.Collapse>
    </Card>);

const Empty = translate()(({ t }) => <div>{t('map.marker.empty')}</div>);

const VehicleLink = translate()(({t, data, list }) => {
    if (!list)
        return <span>{vehTypeStr(data._id, t).toUpperCase()} {vehID(data._id)} {(data.line ? `(${data.line})` : "")} {data.vehicleNumber ? `: ${data.vehicleNumber}` : ''}</span>
    return <a href={`/dashboard/vehicle/${data._id}`}>{vehTypeStr(data._id, t).toUpperCase()} {vehID(data._id)} {(data.line ? `(${data.line})` : "")} {data.vehicleNumber ? `: ${data.vehicleNumber}` : ''}</a>
});

class Marker extends Component {
    state = {
        selected: null,
        campaigns: []
    };

    controller = new AbortController();

    static contextType = AuthContext;

    async componentDidMount() {
        await this.loadCampaigns();
        this.props.cb();
    }

    handleClick = async () => {
        if (!this.state.selected) return;
        const query = `query{campaignVehicles(_id:"${this.state.selected}"){ _id }}`;
        try {
            const { campaignVehicles } = await queryRequest(query, this.controller.signal);
            if (!campaignVehicles) return;

            this.props.doHighLight(campaignVehicles.map(vehObj => vehObj._id))
        } catch (e) {
            console.log(e)
        }
    };

    loadCampaigns = async () => {
        const query = `query{vehicleCampaigns(_id:"${this.props.data._id}"){ _id name startDate endDate client {_id company}}}`;
        try {
            const { vehicleCampaigns } = await queryRequest(query, this.controller.signal);
            this.setState({campaigns: vehicleCampaigns})
        } catch (e) {
            console.log(e)
        }
    };

    handleAccordionClick = (_id) => {
        if (this.state.selected === _id) {
            this.setState({selected: null})
        } else {
            this.setState({selected: _id})
        }
    };

    render() {
        if (this.state.selected) this.handleClick();
        else this.props.doUnHighLight();
        return (
            <div>
                <strong>
                    <VehicleLink data={this.props.data} list={this.props.list}/>
                </strong>
                { this.state.campaigns.length > 0 && this.props.list &&
                    <div className="scrollable" style={{maxHeight: 140, width:'max-content'}}>
                        <Accordion>
                            {this.state.campaigns.map(campaign => <ListItem key={campaign._id} campaign={campaign} selected={campaign._id === this.state.selected} click={() => this.handleAccordionClick(campaign._id)}/>)}
                        </Accordion>
                    </div>
                }
                { this.state.campaigns.length === 0 && this.props.list && <Empty/>}
            </div>)
    }
}

export default Marker;
