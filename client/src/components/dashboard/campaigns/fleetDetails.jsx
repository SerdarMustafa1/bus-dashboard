import React, {Component} from 'react';
import queryRequest from "../../../utils/queryRequest";
import {vehID, vehTypeStr} from "../../../utils/vehicleProps";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";

import {translate} from 'react-i18next';

class FleetDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            vehicle: {},
            installs: []
        }
    }

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        this.refreshData(this.props.data);
    }

    async refreshData(_id) {
        this.setState({loaded: false, vehicle: {}});
        const query = `query{vehicle(_id:"${_id}"){_id type city{name}}
        vehicleInstalls(_id:"${_id}"){count placement{_id place{name}}campaign{ _id name startDate endDate client{_id company}}}}`;

        try {
            const {vehicle, vehicleInstalls} = await queryRequest(query, this.controller.signal, this.props.token);

            const uniqueInstalls = {};
            for (const inst of vehicleInstalls) {
                if (inst["placement"]["_id"] in uniqueInstalls) {
                    uniqueInstalls[inst["placement"]["_id"]].count += inst.count;
                } else {
                    uniqueInstalls[inst["placement"]["_id"]] = inst;
                }
            }
            if (vehicle && vehicleInstalls) {
                this.setState({vehicle, installs: Object.values(uniqueInstalls), loaded: true});
            } else {
                this.setState({loaded: true});
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.log("Ohnoo, ", err.toString());
                this.setState({loaded: true});
            }
        }
    }

    componentWillReceiveProps(props) {
        if (props.data === this.state.vehicle._id) return;
        this.refreshData(props.data);
    }

    content = () => {
        const { t } = this.props;
        if (!this.state.loaded) return (
            <div className="text-center m-3">
                <Spinner animation='border' variant='warning'/>
            </div>);

        if (this.state.loaded && !this.state.vehicle._id) return (<h4 className="text-center">{t('error')}</h4>);

        return (
            <React.Fragment>
                <h4 className="mb-1">{vehTypeStr(this.state.vehicle._id, t).toUpperCase()} {vehID(this.state.vehicle._id)}</h4>
                <h5 className="mt-1">{this.state.vehicle.city.name}</h5>
                <h5 className="mb-0 border-bottom">{t('db.campaign.vehicle.list.title')}</h5>
                <p>{JSON.stringify(this.state.placements)}</p>
                {this.state.installs && this.state.installs.map(install => {
                    return (
                        <Row key={install.placement._id}>
                            <Col className="shadow p-3 mb-2 bg-white rounded">
                                <h6>{install.campaign.name}: {install.count}x {install.placement.place.name}</h6>
                            </Col>
                        </Row>)
                })}
            </React.Fragment>);
    };

    render() {
        return (
            <Card className="m-b-20">
                <Card.Body>
                    {this.content()}
                </Card.Body>
            </Card>
        )
    }
}

export default translate()(FleetDetails);