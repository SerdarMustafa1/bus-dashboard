import React, { Component } from "react";

import {translate} from 'react-i18next';
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "../utils/dataTable";
import AddInstallerTool from "../teams/addInstallerTool";
import SelectedInstallerTool from "../teams/selectedInstallerTool";
import Row from "react-bootstrap/Row";

class Team extends Component {
    state = {
        redirect: '',
        thead: [
            '#',
            this.props.t('db.installers.table.name'),
            // this.props.t('db.installers.table.installs'),
            this.props.t('db.installers.table.createdAt')],
        columns: [
            {
                data: '_id',
                visible: false,
                searchable: false,
                orderable: false,
            },
            {
                data: "name"
            },
            // {
            //     data: "installs",
            //     searchable: false,
            //     defaultContent: "0"
            // },
            {
                data: 'created_at',
                render: (data) => {
                    const date = new Date(data);
                    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
                },
                searchable: false,
            }
        ],
        ajax: '/api/datatable/team/' + this.props.match.params.id,
        rowCallback: (el, data) => el.onclick = () => this.handleSelection(data),
        selected: null,
        handleRefresh: () => {console.log('old')},
    };

    handleSelection = (data) => {
        if (this.state.selected && this.state.selected._id === data._id) return this.setState({selected: null});
        this.setState({selected: data});
    }

    setRefresh = (f) => this.setState({handleRefresh: () => {f(); this.setState({ selected: null })}});

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
                        {this.state.selected && <SelectedInstallerTool
                            team={this.props.match.params.id}
                            doRefresh={this.state.handleRefresh}
                            selected={this.state.selected}
                        />}
                        {!this.state.selected && <AddInstallerTool
                            team={this.props.match.params.id}
                            doRefresh={this.state.handleRefresh}
                        />}
                    </Col>
                </Row>
            </div>
        );
    }
}

export default translate()(Team);
