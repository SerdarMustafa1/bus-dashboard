import React, { Component } from 'react';
import { Link } from "react-router-dom";
import queryRequest from '../../../utils/queryRequest';

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { HomeNav } from '../components/navs';

import { translate } from 'react-i18next';

function placesLeftPercent(placements, installs) {
    return installs * 100 / placements;
}

const CampaignItem = translate() (({campaign, t}) => {
    const name = campaign.name;
    const company = campaign.client.company;
    const start = new Date(parseInt(campaign.startDate));
    const end = new Date(parseInt(campaign.endDate));

    const placements = campaign.placements.map(pl => pl.count).reduce((a,b) => a+b,0);
    const installs = campaign.placements.map(pl => pl.installs.map(i => i.count).reduce((a,b) => a+b, 0) ).reduce((a,b) => a+b, 0);

    const statusSize = placesLeftPercent(placements, installs);

    return (
      <Link to={'/install/c/'+ campaign._id} style={{color: 'black'}}>
        <Card className="mb-3 mt-2 shadow" style={{border: 'none'}}>
          <Card.Body className="waves-effect p-3">
            <Card.Title className={`text-center text-vehicle-info ${campaign.priority && 'text-danger'}`}>
                {name}
            </Card.Title>
              <div className='text-center font-sm'>{company}</div>
            <Row className='text-center font-sm'>
              <Col>
                <Row>
                  <Col className='install-col-val'>
                    <strong>{start.getDate()} {t('month.'+ start.getMonth())}</strong>
                    <div className='description'>{t('i.campaign.startDate')}</div>
                  </Col>

                  <Col className='install-col-val'>
                    <strong>{end.getDate()} {t('month.'+ end.getMonth())}</strong>
                    <div className='description'>{t('i.campaign.endDate')}</div>
                  </Col>
                </Row>
              </Col>

              <Col className='install-col-val'>
                <strong>{installs}/{placements}</strong>
                <div className='description'>{t('i.campaign.placements')}</div>
              </Col>
            </Row>
          </Card.Body>

          <ProgressBar className="card-bottom-progress" striped variant={statusSize >= 100 ? 'success': 'warning'} now={statusSize} label/>
        </Card>
      </Link>
    );
});


class CampaignList extends Component {
    state = {
        search: '',
        campaigns: [],
    };

    controller = new AbortController();
    searchTimeout = 0;
    componentDidMount() {
      this.loadInCampaigns();
    }
    componentWillUnmount() {
        this.controller.abort();
    }

    loadInCampaigns = async () => {
      const query = `query{ campaignsForInstallers(search:"${this.state.search}"){ _id name client{company} priority startDate endDate placements { count installs { count }} }}`;
      try {
        const { campaignsForInstallers } = await queryRequest(query, this.controller.signal);
        if (campaignsForInstallers) this.setState({campaigns: campaignsForInstallers});
      } catch (err) {
        console.log("error", err);
      }
    };

    handleSearchChange = (e) => {
        this.setState({search: e.target.value});
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(this.loadInCampaigns, 600);
    };

    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.loadInCampaigns();
    };

    render() {
        return (
          <React.Fragment>
            <HomeNav onSubmit={this.handleSearchSubmit} placeholder="i.search.campaign"
                    onChange={this.handleSearchChange} value={this.state.search}/>
            <Container style={{marginTop:65}}>
              <Row className='border-bottom' style={{display:'block'}}>
                <h4 className="text-center text-white">{this.props.t('i.campaigns.title')}</h4>
              </Row>
                {this.state.campaigns.length > 0 && this.state.campaigns.map(camp => {
                    return <CampaignItem key={camp._id} campaign={camp} />
                })}
            </Container>
          </React.Fragment>
        );
    }
}

export default translate()(CampaignList);
