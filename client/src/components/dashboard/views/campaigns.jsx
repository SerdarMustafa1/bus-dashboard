import React, { Component } from "react";
import CampaignTool from "../campaigns/campaignTool";
import Table from "../utils/dataTable";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';
import formatDate from "../../../utils/formatDate";

const CampaignsTable = translate()(({t, rowCallback, setRefresh}) => {
  const thead = ['ID',
     t('db.campaigns.table.name'),
     t('db.campaigns.table.company'),
     t('db.campaigns.table.budget'),
     t('db.campaigns.table.startDate'),
     t('db.campaigns.table.endDate'),
     t('db.campaigns.table.createdAt')];
  const columns = [
        {
          data: '_id',
          visible: false,
          searchable: false,
        },
        {
          data: 'name'
        },
        {
          data: 'company'
        },
        {
          data: 'budget'
        },
        {
          data: 'startDate',
          render: formatDate,
          searchable: false,
        },
        {
          data: 'endDate',
          render: formatDate,
          searchable: false,
        },
        {
          data: 'created_at',
          render: formatDate,
          searchable: false,
        },
      ];

  return (
      <Card className="m-b-20">
        <Card.Body>
          <h4 className="mt-0 header-title">{t('db.campaigns.table.title')}</h4>

          <Table ajax='/api/datatable/campaigns' order={[[6, 'desc']]} columns={columns} thead={thead} rowCallback={rowCallback} setRefresh={setRefresh}/>
        </Card.Body>
      </Card>)
});


class Campaigns extends Component {
  state = {
    selected: {},
    handleRefresh: () => {},
  };

  componentDidMount() {
    console.log('Campaigns')
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
          <Col xl={8}>
            <CampaignsTable setRefresh={this.setRefresh} rowCallback={(el, data) => el.onclick = () => this.handleSelection(data)}/>
          </Col>
          <CampaignTool
            doRefresh={this.state.handleRefresh}
            selected={this.state.selected._id}
          />
        </Row>
      </div>
    );
  }
}

export default Campaigns;
