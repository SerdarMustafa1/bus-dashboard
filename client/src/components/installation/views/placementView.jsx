import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";
import { compressInstallsInVehicle, handleAdRemoving } from '../utils';

import Swal from 'sweetalert2';

import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import { translate } from 'react-i18next';

const UninstallCard = translate()(({t, data, doRemove, displayCampaign}) => {

  return (
    <Row className="text-center p-2 pt-3 pb-3 shadow mt-2">
      <Col xs={8} className="m-auto">
        <strong>{data.count}x {data.placement.place.name}</strong>
        {!!displayCampaign && <div className='description'>{data.campaign.name}</div>}
      </Col>
      <Col xs={4} className="m-auto" style={{ padding: 0 }}>
        <Button onClick={doRemove} variant="danger" className="waves-effect" style={{ fontSize: "0.9rem" }}>{t('i.remove.form.button.label')}</Button>
      </Col>
    </Row>)
});

const OtherCampaignUninstallCard = (props) => {
  return <UninstallCard {...props} displayCampaign={true}/>
};


const successful = (t) => {
  Swal.fire({
    icon: 'success',
    title: t('i.install.form.successful.title'),
    showConfirmButton: false,
    timer: 1500
  });
};

const error = (t) => {
  Swal.fire({
    icon: 'error',
    title: t('i.install.form.invalid.unk.title'),
    showConfirmButton: false,
    timer: 1500
  });
};
const badRequest = (t) => {
  Swal.fire({
    icon: 'error',
    title: t('i.install.form.invalid.request.title'),
    showConfirmButton: false,
    timer: 1500
  });
};
const limit = (t) => {
  Swal.fire({
    icon: 'error',
    title: t('i.install.form.invalid.amount.title'),
    text: t('i.install.form.invalid.amount.text'),
    showConfirmButton: false,
    timer: 1800
  });
};


class PlacementView extends Component {
  state = {
    alert: true,
    installs: [],
    showOthers: false,
    count: '',
  };

  controller = new AbortController();
  componentWillUnmount() {
    this.controller.abort();
  }

  componentDidMount() {
    if (!this.props.placement._id) this.props.doPlacementLoad(this.props.match.params.placement);
    this.handlePlacementsLoad()
  }

  handlePlacementsLoad = async () =>{
    const query = `query{ vehicleInstalls(_id:"${this.props.vehicle._id}"){ id count campaign{ _id name } count placement{_id place{name}}}}`;

    try {
      const {vehicleInstalls} = await queryRequest(query, this.controller.signal);
      if (vehicleInstalls) {
        this.setState({installs: compressInstallsInVehicle(vehicleInstalls)});
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  handleInstall = async (count) => {
    if (count <= 0) return;
    const installed = this.props.placement.installs.filter(i=> i.installed).map(pl => pl.count).reduce((a,b) => a+b,0);
    if (count + installed > this.props.placement.count) {
      limit(this.props.t);
      return;
    }

    const query = `mutation{ installAd(vehicle:"${this.props.vehicle._id}", placement:"${this.props.placement._id}", count:${count})}`;

    try {
      const {installAd} = await queryRequest(query, this.controller.signal);
      if (installAd) {
        this.props.doCampReload().then(() => {
          this.props.doPlacementLoad(this.props.match.params.placement);
        });
        this.props.doVehicleReload();
        this.handlePlacementsLoad();
        successful(this.props.t);
      } else {
        error(this.props.t);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        badRequest(this.props.t);
      }
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.handleInstall(parseInt(this.state.count))
  };

  handleInstallCountChange = (e) => {
    if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
      this.setState({ count: e.target.value });
    }
  };

  handleFullRefresh = () => {
    this.props.doCampReload().then(() => {
      this.props.doPlacementLoad(this.props.match.params.placement);
    });
    this.props.doVehicleReload();
    this.handlePlacementsLoad();
  };

  render() {
    if (!this.props.placement._id) return null;

    const installed = this.props.placement.installs.filter(i=> i.installed).map(pl => pl.count).reduce((a,b) => a+b,0);
    const all = this.props.placement.count;

    const { t } = this.props;

    console.log('placementView.state', this.state);
    console.log('placementView.props', this.props);
    return (
      <React.Fragment>
        <h4 className='text-center mt-0'>{t('i.vehicle.placement.selected.title')}</h4>
        <Row className="text-center">
          <Col>
            <strong>{this.props.placement.place.name}</strong>
          </Col>
          <Col>
            {installed}/{all}
          </Col>
        </Row>
        <ProgressBar striped variant='success' now={installed*100/all}/>
        <form onSubmit={this.handleSubmit}>
          <InputGroup className="mt-2">
            <FormControl onChange={this.handleInstallCountChange}
              placeholder={t('i.install.form.input.placeholder')} value={this.state.count}
            />
            <InputGroup.Append>
              <Button className="waves-effect" variant="primary" type="submit">{t('i.install.form.button.label')}</Button>
            </InputGroup.Append>
          </InputGroup>
        </form>

        {this.state.installs.filter(install=> install.campaign._id === this.props.campaign._id).length > 0 && <h4 className='text-center mt-5'>{t('i.install.form.title.currentInstalls')}</h4>}
        <div className="mb-3" style={{ marginLeft: 10, marginRight: 10 }}>
          {this.state.installs.length > 0 && this.state.installs.filter(install=> install.campaign._id === this.props.campaign._id).map((install) => <UninstallCard key={install.id} doRemove={() => handleAdRemoving(this.props.vehicle._id ,install.placement._id, t, this.handleFullRefresh)} data={install}/>)}
        </div>

        <Alert show={!this.state.showOthers && this.state.installs.filter(p => p.campaign._id !== this.props.campaign._id).length > 0} variant="warning" className="mt-4 mb-0">
          <Alert.Heading>{t('i.install.form.others.title')}</Alert.Heading>
          <p>{t('i.install.form.others.text')}</p>
          <hr/>
          <div className="d-flex justify-content-end">
            <Button onClick={() => this.setState({ showOthers: true })} variant="outline-warning" style={{color:"#856404", borderColor:"#856404"}} >
              {t('i.install.form.others.button')}
            </Button>
          </div>
        </Alert>
        {this.state.showOthers && (
            <div className="mt-4 pt-4 mb-2" style={{ marginLeft: 10, marginRight: 10 }}>
              <h4 className="text-center">{t('i.install.form.title.otherCampaigns')} foo bar </h4>
              {this.state.installs.filter(p => p.campaign._id !== this.props.campaign._id).map((install) => <OtherCampaignUninstallCard key={install.id} doRemove={() => handleAdRemoving(this.props.vehicle._id, install.placement._id, t, this.handleFullRefresh)} data={install}/>)}
            </div>
        )}
      </React.Fragment>
    );
  }
}

export default translate()(PlacementView);
