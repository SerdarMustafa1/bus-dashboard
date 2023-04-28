import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";
import { Switch, Route, Redirect } from "react-router-dom";

// import Title from "../../dashboard/all/title";

import VehicleList from "./vehicleList";
import VehicleView from "./vehicleView";

class ByCampaign extends Component {
  // const { campaign } = this.props.match.params;

  state = {
    selectedCampaign: {},
    selectedVehicle: {},
    redirect: false,
  };

  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  componentDidMount() {
    this.handleCampaignLoading(this.props.match.params.campaign)
  }

  handleCampaignLoading = async (_id) => {
    const query = `query{campaign(_id:"${_id}"){ _id name startDate endDate } placementsForInstaller(_id:"${_id}") { _id count place { name } installs { count installed } } }`;
    try {
      const { campaign, placementsForInstaller } = await queryRequest(query, this.controller.signal);
      campaign.placements = placementsForInstaller;

      if (campaign) {
        this.setState({selectedCampaign: campaign});
      } else {
        console.log('Campaign not found', campaign);
        this.setState({redirect:true})
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  handleVehicleSelect = (vehicle) => {
    this.setState({selectedVehicle: vehicle});
  };

  handleVehicleLoading = async (_id) => {
    const query = `query{ vehicle(_id:"${_id}"){ _id operator{company} totalAds listed}}`;

    try {
      const { vehicle } = await queryRequest(query, this.controller.signal);
      if (vehicle) {
        this.setState({selectedVehicle: vehicle});
      } else {
        this.setState({redirect:true})
      }
    } catch (err) {
      console.log('ERROR', err);
      this.setState({redirect:true})
    }
  };

  render() {
    if (this.state.redirect) return <Redirect push to={"/install"}/>;
    if (!this.state.selectedCampaign._id) return null;

    return (
          <Switch>
            <Route
              path="/install/c/:campaign/:vehicle"
              render= { (props) => {
                return (<VehicleView {...props} campaign={this.state.selectedCampaign} doVehicleLoad={async () =>  { await this.handleVehicleLoading(props.match.params.vehicle)}} doCampReload={async () => { await this.handleCampaignLoading(props.match.params.campaign)}} vehicle={this.state.selectedVehicle}/>);
              }}
            />
            <Route
              path="/install/c/:campaign"
              render= { (props) => {
                return (<VehicleList {...props} path={`/install/c/${props.match.params.campaign}`} doVehicleSelect={this.handleVehicleSelect} campaign={this.state.selectedCampaign}/>);
              }}
            />
          </Switch>
    );
  }
}

export default ByCampaign;
