import React, {Component} from "react";
import Table from '../utils/dataTable';
import { Redirect } from "react-router-dom";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';
import {vehID} from "../../../utils/vehicleProps";

class Fleet extends Component {
    state = {
        redirect: '',
        thead: ['#',
            this.props.t('db.vehicles.table.id'),
            this.props.t('db.vehicles.table.numberPlate'),
            this.props.t('db.vehicles.table.operator'),
            this.props.t('db.vehicles.table.placements')], // "Email", 'Phone',
        columns: [
            {
                data: "nr"
            },
            {
                data: "_id",
                render: (data) => {
                    return vehID(data);
                }
            },
            {
                data: 'numberPlate',
                defaultContent: "<i>Not set</i>",
                searchable: true,
            },
            {

                data: 'company',
                defaultContent: "<i>Not set</i>",
                searchable: true,
            },
            {
                data: 'totalAds',
                render: (data) => {
                    return `<div style="width: 100%;text-align: center;">${data > 0 ? `<span class="badge badge-success">${data}</span>`:`<span class="badge badge-danger">${data}</span>`}</div>`;
                },
                searchable: false,
                orderable: true,
            }
        ],
        ajax: '/api/datatable/fleet',
        rowCallback: (el, data) => {
            el.classList.add("click");
            el.onclick = () => this.setState({redirect: data._id})
        }
    };

    componentDidMount() {
        console.log("Fleet");
    }

    render() {
        if (this.state.redirect) return <Redirect push to={`/dashboard/vehicle/${this.state.redirect}`}/>;
        const { t } = this.props;
        return (
            <div className="container-fluid">
                <Row>
                    {/* <GeneralLiveMap /> */}
                </Row>

                <Row>
                    <Col xs={12}>
                        <Card className="m-b-20">
                            <Card.Body>
                                <h4 className="mt-0 header-title">{t('db.vehicles.table.title')}</h4>
                                <Table ajax={this.state.ajax} columns={this.state.columns} thead={this.state.thead} rowCallback={this.state.rowCallback}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default translate()(Fleet);
