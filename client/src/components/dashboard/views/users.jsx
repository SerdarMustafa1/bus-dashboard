import React, { Component } from "react";
import Table from "../utils/dataTable";
import UserTool from "../users/userTool";
import { roleTranslate, getBadgeColor } from '../../../utils/roles';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';


class Users extends Component {
  state = {
    thead: [
      this.props.t('db.users.table.role'),
      this.props.t('db.users.table.name'),
      this.props.t('db.users.table.email'),
      this.props.t('db.users.table.phone'),
      this.props.t('db.users.table.createdAt')],
    columns: [
      {
        data: 'role',
        render: (data) => {
          return `<span style="width: 100%;" class="badge badge-${getBadgeColor(data)}">${roleTranslate(data, this.props.t)}</span>`;
        },
      },
      {
        data: 'name'
      },
      {
        data: 'email',
        render: (data) => {
          // return data.length > 22 ? `${data.substring(0, 20)}...` : data;
          return data;
        },
      },
      {
        data: 'phone',
        render: (data) => {
          return !!data? data : "<i>Not set</i>";
        },
      },
      {
        data: 'created_at',
        render: (data) => {
          const date = new Date(data);
          return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
        },
        searchable: false,
      },
    ],
    order: [[4, 'desc']],
    ajax: '/api/datatable/users',
    rowCallback: (el, data) => el.onclick = () => this.handleSelection(data),

    selected: {},
    handleRefresh: () => {console.log('old')},
  };

  componentDidMount() {
    console.log("users")
  }

  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  handleSelection(selected) {
    if (this.state.selected === selected) this.setState({ selected: {} });
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
                <h4 className="mt-0 header-title">{t('db.users.table.title')}</h4>

                <Table order={this.state.order} ajax={this.state.ajax} columns={this.state.columns} thead={this.state.thead} rowCallback={this.state.rowCallback} setRefresh={this.setRefresh} />
              </Card.Body>
            </Card>
          </Col>

          <UserTool
            doRefresh={this.state.handleRefresh}
            selected={this.state.selected._id}
          />
        </Row>
      </div>
    );
  }
}

export default translate()(Users);
