import React, { Component } from "react";

import {translate} from 'react-i18next';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "../utils/dataTable";
import TeamsTool from "../teams/teamsTool";


class Teams extends Component {
    state = {
        redirect: '',
        thead: [
            '#',
            this.props.t('db.teams.table.company'),
            this.props.t('db.teams.table.members'),
            this.props.t('db.teams.table.createdAt')], // "Email", 'Phone',
        columns: [
            {
                data: '_id',
                visible: false,
                searchable: false,
                orderable: false,
            },
            {
                data: "company"
            },
            {
                data: "members",
                searchable: false,
            },
            {
                data: 'created_at',
                render: (data) => {
                    const date = new Date(data);
                    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
                },
                searchable: false,
            }
        ],
        ajax: '/api/datatable/teams',
        rowCallback: (el, data) => el.onclick = () => this.handleSelection(data),
        selected: '',
        handleRefresh: () => {console.log('old')},
    };

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        console.log("Teams")
    }

    handleSelection(selected) {
        if (this.state.selected._id === selected._id) this.setState({ selected: {} });
        else this.setState({ selected });
    }

    setRefresh = (f) => this.setState({handleRefresh: f});

    render() {
        const { t } = this.props;
        return (
            <div className="container-fluid">

                <Row>
                    <Col xl={8}>
                        <Card className="m-b-20">
                            <Card.Body>
                                <h4 className="mt-0 header-title">{t('db.teams.table.title')}</h4>

                                <Table order={this.state.order} ajax={this.state.ajax} columns={this.state.columns} thead={this.state.thead} rowCallback={this.state.rowCallback} setRefresh={this.setRefresh} />
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xl={4}>
                        <TeamsTool
                            doRefresh={this.state.handleRefresh}
                            doSelect={this.handleSelection}
                            selected={this.state.selected}
                        />
                    </Col>
                </Row>

            </div>
        );
    }
}

export default translate()(Teams);
