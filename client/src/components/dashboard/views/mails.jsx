import React, {Component} from "react";
import queryRequest from "../../../utils/queryRequest";
import Table from '../utils/dataTable';
import ReactDOM from "react-dom";
import {getBadgeColor, roleTranslate} from '../../../utils/roles';
import Swal from 'sweetalert2';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { translate } from 'react-i18next';


class MailingCheckbox extends Component {
    constructor(props) {
        super(props);
        this.state = {checked: props.checked}
    }

    handleClick = async (e) => {
        const value = e.target.checked;
        if (await this.props.doChange(value)) this.setState({checked: value})
    };

    render() {
        return (
            <React.Fragment>
                <input type="checkbox" id={this.props.id} switch="none" checked={this.state.checked ? "checked" : ""}
                       onChange={this.handleClick}/>
                <label htmlFor={this.props.id} data-on-label="Yes" data-off-label="No" style={{margin: 'auto'}}/>
            </React.Fragment>
        )
    }
}

class Mails extends Component {
    state = {
            thead: ['ID', 'Role', 'User', 'Email','Camp. Created', 'Camp. Changed', 'Camp. Pre-Start', 'Camp. Start', 'Camp. Pre-End', 'Camp. End', "Install Done", "Remove Done"],
            columns: [
                {
                    data: '_id',
                    visible: false,
                    orderable: false,
                    searchable: false,
                },
                {
                    data: 'role',
                    render: (data) => {
                        return `<div style="width: 100%; text-align: center"><span class="badge badge-${getBadgeColor(data)}">${roleTranslate(data, this.props.t)}</span></div>`;
                    },
                },
                {
                    data: 'name'
                },
                {
                    data: 'email'
                },
                {
                    data: 'mailCampCreated',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailCampCreated')
                },
                {
                    data: 'mailCampChanged',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailCampChanged')
                },
                {
                    data: 'mailPreStart',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailPreStart')
                },
                {
                    data: 'mailStart',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailStart')
                },
                {
                    data: 'mailPreEnd',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailPreEnd')
                },
                {
                    data: 'mailEnd',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailEnd')
                },
                {
                    data: 'mailInstallDone',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailInstallDone')
                },
                {
                    data: 'mailRemoveDone',
                    defaultContent: "",
                    searchable: false,
                    createdCell: (td, dataCell, dataRow) => this.createCell(td, dataCell, dataRow, 'mailRemoveDone')
                }
            ],
            ajax: '/api/datatable/mails'
        };


    createCell = (td, dataCell, dataRow, type) => {
        const value = (!!dataCell);
        ReactDOM.render(<MailingCheckbox id={`${type}${dataRow._id}`} checked={value}
                                         doChange={(change) => this.handleCheckboxClick(type, dataRow._id, change)}/>, td)
    };

    componentDidMount() {
        console.log("Mailing");
    }

    handleCheckboxClick = async (type, id, value) => {
        const query = `mutation{ userMailing(_id: "${id}", mail:"${type}", value:${value}) }`;

        try {
            const {userMailing} = await queryRequest(query, this.controller.signal);
            return userMailing;
        } catch (err) {
            if (err.name === 'SyntaxError') {
                // No Connection
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Check internet connection',
                    showConfirmButton: false,
                    timer: 1800
                });
            } else if (err.name === 'AbortError') {
                // Aborted
            } else {
                // Bad request
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Bad request',
                    showConfirmButton: false,
                    timer: 1800
                });
            }
            return false;
        }
    };

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    render() {
        return (
            <div className="container-fluid">
                <Row>
                    <Col xs={12}>
                        <Card className="m-b-20">
                            <Card.Body>
                                <Table ajax={this.state.ajax} columns={this.state.columns} thead={this.state.thead}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default translate()(Mails);
