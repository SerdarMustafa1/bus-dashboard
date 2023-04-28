import React, { Component } from 'react';
import queryRequest from '../../utils/queryRequest';
import FleetDetails from '../dashboard/campaigns/fleetDetails';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { translate } from 'react-i18next';
import Lightbox from 'react-image-lightbox';

import AuthContext from '../../context/auth-context';
import Badge from 'react-bootstrap/Badge';
import Swal from 'sweetalert2';

import {
  TimeSpan,
  SaleBy,
  Cities,
  Live,
  InstallProgress,
  ActivityTable,
} from '../dashboard/campaignDetails/cards';

class Details extends Component {
  state = {
    campaign: {},
    loaded: false,
    selected: '',

    progress: {},
    index: 0,
    lightbox: false,
  };

  controller = new AbortController();
  static contextType = AuthContext;

  componentWillUnmount() {
    this.controller.abort();
  }

  async componentDidMount() {
    const query = `query{campaign(_id:"${this.props.match.params.id}"){
            _id name client{_id company}creator{_id name}budget startDate endDate created_at cities{name latitude longitude}
            pictures { path thumbnail created_at }
            placements{_id place{name} installs{installed vehicle{_id city{name}operator{company operatorId}}created_at count}
      count isPublic}}}`;

    try {
      const { campaign } = await queryRequest(
        query,
        this.controller.signal,
        this.props.token
      );
      if (campaign) this.setState({ campaign, loaded: true });
      else this.setState({ loaded: true });
    } catch (err) {
      console.log('Ohnoo, ', err.toString());
      this.setState({ loaded: true });
    }
  }

  getMapData() {
    const query = `query{campaignVehicles(_id: "${this.state.campaign._id}"){_id haveAds longitude latitude}}`;

    return {
      height: 530,
      query: query,
      latitude: this.state.campaign.cities[0].latitude,
      longitude: this.state.campaign.cities[0].longitude,
      zoom: 7,
      getData: (data) => data.campaignVehicles,
      smooth: true,
      token: this.props.token,
      details: false,
    };
  }

  handleSelection = (selection) => {
    if (this.state.selected !== selection)
      this.setState({ selected: selection });
    else this.setState({ selected: '' });
  };

  totalFleets() {
    const countList = [];
    for (const placement of this.state.campaign.placements)
      for (const install of placement.installs)
        countList.push(install.vehicle._id);

    return new Set(countList).size;
  }

  timeLeftPercent() {
    return (
      ((new Date().getTime() - this.state.campaign.startDate) /
        (this.state.campaign.endDate - this.state.campaign.startDate)) *
      100
    );
  }

  openLightBox = () => {
    const { t } = this.props;
    if (
      this.state.campaign &&
      this.state.campaign.pictures &&
      this.state.campaign.pictures.length > 0
    )
      this.setState({ lightbox: true });
    else {
      Swal.fire({
        icon: 'info',
        title: t('db.campaign.images.info.empty.title'),
        text: t('db.campaign.images.info.empty.text'),
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  render() {
    const { t } = this.props;
    if (this.state.loaded && Object.keys(this.state.campaign).length === 0)
      return (
        <div className="container-fluid text-center">
          <h3 className="text-white">{t('db.campaign.404')}</h3>
        </div>
      );
    const { pictures } = this.state.campaign;
    const { index } = this.state;

    return (
      <div className="container-fluid">
        {this.state.lightbox && (
          <Lightbox
            mainSrc={pictures[index].path}
            nextSrc={pictures[(index + 1) % pictures.length].path}
            prevSrc={
              pictures[(index + pictures.length - 1) % pictures.length].path
            }
            onCloseRequest={() => this.setState({ lightbox: false })}
            onMovePrevRequest={() =>
              this.setState({
                index: (index + pictures.length - 1) % pictures.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({ index: (index + 1) % pictures.length })
            }
          />
        )}
        <Row className="border-bottom mb-4">
          <Col xs={12}>
            <h3 className="text-white">
              {!this.state.loaded && 'Loading...'}
              {this.state.loaded &&
                this.state.campaign.client.company +
                  ': ' +
                  this.state.campaign.name}
              {this.state.loaded && (
                <div
                  className="float-right campview-images"
                  onClick={this.openLightBox}
                >
                  <i className="ion ion-images" /> Images{' '}
                  <Badge variant={pictures.length ? 'success' : 'danger'}>
                    {pictures.length}
                  </Badge>
                </div>
              )}
            </h3>
          </Col>
        </Row>

        <Row>
          <Col md={12} xl={4} className="mb-4">
            <TimeSpan
              data={{
                loaded: this.state.loaded,
                startDate: this.state.loaded && this.state.campaign.startDate,
                endDate: this.state.loaded && this.state.campaign.endDate,
                now: this.state.loaded && this.timeLeftPercent(),
              }}
            />
          </Col>
          <Col md={6} xl={4}>
            <Cities
              data={{
                loaded: this.state.loaded,
                cities:
                  this.state.loaded &&
                  this.state.campaign.cities
                    .map((city) => city.name)
                    .join(', '),
                vehicles: this.state.loaded && this.totalFleets(),
              }}
            />
          </Col>

          <Col md={6} xl={4}>
            <SaleBy
              data={{
                loaded: this.state.loaded,
                creator: this.state.loaded && this.state.campaign.creator,
                date: this.state.loaded && this.state.campaign.created_at,
              }}
            />
          </Col>
        </Row>

        <Row>
          <Col xl={8}>
            <Live
              data={{
                loaded: this.state.loaded,
                mapData: this.state.loaded && this.getMapData(),
                selected: this.state.selected,
                handleSelection: this.handleSelection,
              }}
            />
          </Col>

          <Col xl={4}>
            <InstallProgress
              data={{
                loaded: this.state.loaded,
                placements: this.state.loaded && this.state.campaign.placements,
              }}
            />
          </Col>
        </Row>

        <Row>
          {this.state.loaded && (
            <Col xl={8}>
              <ActivityTable
                data={{
                  placements: this.state.campaign.placements,
                  rowCallback: (el, data) =>
                    (el.onclick = () => this.handleSelection(data._id)),
                }}
              />
            </Col>
          )}

          {this.state.selected && (
            <Col xl={4}>
              <FleetDetails
                data={this.state.selected}
                token={this.props.token}
              />
            </Col>
          )}
        </Row>
      </div>
    );
  }
}

export default translate()(Details);
