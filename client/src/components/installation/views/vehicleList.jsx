import React, {Component} from 'react';

import {VehicleByCampaign} from '../components/vehicleCards';

import Container from 'react-bootstrap/Container';
import {CampaignNav} from "../components/navs";
import queryRequest from "../../../utils/queryRequest";

import { translate } from 'react-i18next';

class VehicleList extends Component {

    state = {
        inUse: false,
        search: '',
        vehicles: [],
    }

    searchTimeout = 0;
    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
        clearTimeout(this.searchTimeout);
    }

    componentDidMount() {
        this.handleLoadIn()
    }

    handleSwitchTrigger = () => {
        this.setState({inUse: !this.state.inUse});
        setTimeout(this.handleLoadIn, 10);
    };

    handleSearch = async (e) => {
        this.setState({search: e.target.value});
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(this.handleLoadIn, 600)
    };

    handleLoadIn = () => {
        if (!this.state.search) this.loadCampaign();
        else this.loadAll();
    };

    loadCampaign = async () => {
        const query = `query{campaignVehiclesForInstallers(_id: "${this.props.campaign._id}", search:"${this.state.search}", skip:0){_id listed operator{company} totalAds}}`;
        try {
            const {campaignVehiclesForInstallers} = await queryRequest(query, this.controller.signal);
            if (campaignVehiclesForInstallers) {
                this.setState({vehicles: campaignVehiclesForInstallers});
                console.log(campaignVehiclesForInstallers)
            }
        } catch (err) {
            console.log("error", err);
        }
    };

    loadAll = async () => {
        const query = `query{vehiclesForInstallers(search:"${this.state.search}", skip:0){_id listed operator{company} totalAds}}`;

        try {
            const {vehiclesForInstallers} = await queryRequest(query, this.controller.signal);
            if (vehiclesForInstallers) {
                this.setState({vehicles: vehiclesForInstallers});
            }
        } catch (err) {
            console.log("error", err);
        }
    };

    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.handleLoadIn()
    };

    render() {
        const { t } = this.props;
        return (
            <Container style={{marginTop: 170}}>
                <CampaignNav value={this.state.search} onSubmit={this.handleSearchSubmit}
                             placeholder="i.search.vehicle" onChange={this.handleSearch}
                             campaign={this.props.campaign}
                             goBack={this.props.history.goBack}/>

                    {this.state.vehicles.map(veh => <VehicleByCampaign key={veh._id}
                                                                       doVehicleSelect={this.props.doVehicleSelect}
                                                                       path={`${this.props.path}/${veh._id}`}
                                                                       data={veh}/>)}
                {this.state.vehicles.length === 0 && <h3 className='pt-2 text-white text-center'>{t('i.campaign.fleet.empty')}</h3>}
            </Container>

        )
    }
}

export default translate()(VehicleList);
