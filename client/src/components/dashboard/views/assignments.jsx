import React, { Component } from "react";

import {translate} from 'react-i18next';
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "../utils/dataTable";
import Row from "react-bootstrap/Row";
import {Redirect} from "react-router-dom";

class Team extends Component {
    state = {
        redirect: '',
        thead: ['#',
            this.props.t('db.assignments.table.name'),
            this.props.t('db.assignments.table.placements'),
            this.props.t('db.assignments.table.assigned'),
            this.props.t('db.assignments.table.start'), // "Email", 'Phone',
            this.props.t('db.assignments.table.end')], // "Email", 'Phone',
        columns: [
            {
                data: "_id",
                visible: false,
                searchable: false,
            },
            {
                data: "name",
                render: (data,_, more) => {
                    return `${data}${more.priority?' <badge class="badge badge-danger ml-2">Removal priority</badge>' : ''}`
                },
            },
            {
                data: "placements",
                defaultContent: "0"
            },
            {
                data: "assigned",
                defaultContent: "0"
            },
            {
                data: 'startDate',
                render: (data) => {
                    const date = new Date(data);
                    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
                },
                searchable: false,
            },
            {
                data: 'endDate',
                render: (data) => {
                    const date = new Date(data);
                    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
                },
                searchable: false,
            },
        ],
        ajax: '/api/datatable/assignments',
        rowCallback: (el, data) => {
            el.classList.add("click");
            el.onclick = () => this.setState({redirect: data._id})
        }
    };

    componentDidMount() {
        console.log('assignments')
    }

    render() {
        if (this.state.redirect) return <Redirect push to={`/dashboard/assign/${this.state.redirect}`}/>;
        const { t } = this.props;
        return (
            <div className="container-fluid">
                <Row>
                    <Col xs={12}>
                        <Card className="m-b-20">
                            <Card.Body>
                                <h4 className="mt-0 header-title">{t('db.assignments.table.title')}</h4>
                                <Table ajax={this.state.ajax} columns={this.state.columns} thead={this.state.thead} rowCallback={this.state.rowCallback}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default translate()(Team);
