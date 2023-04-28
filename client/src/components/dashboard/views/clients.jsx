import React, { Component } from "react";
import ClientTool from "../clients/clientTool";
import Table from '../utils/dataTable';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';


const ClientsTable = translate()(({t, rowCallback, setRefresh}) => {
  const thead = ['ID',
    t('db.clients.table.name'),
    t('db.clients.table.person'),
    t('db.clients.table.campaigns'),
    t('db.clients.table.totalBudget'),
    t('db.clients.table.createdAt')]; // "Email", 'Phone',
  const columns = [
    {
      data: '_id',
      visible: false,
      searchable: false,
    },
    {
      data: 'company',
      render: (data) => {
        return data.length > 22? data.slice(0,21) + '...' : data
      }
    },
    {
      data: 'person'
    },
    {
      data: 'campaigns',
      defaultContent: '0',
      searchable: false,
    },
    {
      data: 'totalBudget',
      defaultContent: "0",
      render: (data) => {
        return `${data} €`;
      },
      searchable: false,
    },
    {
      data: 'created_at',
      render: (data) => {
        const date = new Date(data);
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}`
      },
      searchable: false,
    },
  ];

  return (
      <Card className="m-b-20">
        <Card.Body>
          <h4 className="mt-0 header-title">{t('db.clients.table.title')}</h4>
          <Table ajax='/api/datatable/clients' order={[[5, 'desc']]} columns={columns} thead={thead} rowCallback={rowCallback} setRefresh={setRefresh}/>
        </Card.Body>
      </Card>)
});

class Clients extends Component {
  state = {
    selected: {},
    handleRefresh: () =>{}
  };

  componentDidMount() {
    console.log("Clients")
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
    return (
      <div className="container-fluid">
        <Row>
          <Col xs={12} xl={8}>
            <ClientsTable setRefresh={this.setRefresh} rowCallback={(el, data) => el.onclick = () => this.handleSelection(data)}/>
          </Col>
          <ClientTool
            doRefresh={this.state.handleRefresh}
            selected={this.state.selected._id}/>
        </Row>
      </div>
    );
  }
}

export default Clients;
