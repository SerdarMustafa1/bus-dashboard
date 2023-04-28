import React, { Component } from "react";
import Table from '../utils/dataTable';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';


class Sales extends Component {
    state = {
      thead: ['ID',
          this.props.t('db.sales.table.userName'),
          this.props.t('db.sales.table.activeCampaigns'),
          this.props.t('db.sales.table.totalCampaigns'),
          this.props.t('db.sales.table.totalBudget')],
      columns: [
        {
          data: '_id',
          visible: false,
          orderable: false,
          searchable: false,
        },
        {
            data: 'name'
        },
        {
            data: 'running',
            searchable: false,
            orderable: false,
        },
        {
            data: 'campaigns',
            searchable: false,
            orderable: false,
        },
        {
            data: 'budget',
            searchable: false,
            orderable: false,
        }
      ],
      ajax: '/api/datatable/sales',
      // rowCallback: (el, data) => el.onclick = () => this.setState({redirect: data._id}),

      redirect: '',
    };

  componentDidMount() {
    console.log("Sales");
  }

  render() {
    // if (this.state.redirect) return <Redirect push to={`/dashboard/user/${this.state.redirect}`}/>;
    const { t } = this.props;
    return (
      <div className="container-fluid">
        <Row>
          <Col xs={12}>
            <Card className="m-b-20">
              <Card.Body>
                  <h4 className="mt-0 header-title">{t('db.sales.table.title')}</h4>

                  <Table ajax={this.state.ajax} columns={this.state.columns} thead={this.state.thead} rowCallback={this.state.rowCallback}/>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default translate()(Sales);
