import React, { Component } from 'react';
import SmallInfoCardWithIcon from '../utils/smallInfoCard';
import queryRequest from "../../../utils/queryRequest";

import { translate } from 'react-i18next';

class LatestCampaigns extends Component {
    state = {
        main: "-",
        description: `${this.props.t('db.stat.card.latestCampaign.addition')} 0 €`,
        loaded: false
    };
    controller = new AbortController();
    componentWillUnmount() {
        this.controller.abort();
    }
    async componentDidMount() {
        const query = `query{ campaign { _id name budget }}`;
        try {
            const {campaign} = await queryRequest(query, this.controller.signal);
            this.setState({main: campaign.name,link:'campaign', id: campaign._id, description: `${this.props.t('db.stat.card.latestCampaign.addition')} ${campaign.budget} €`, loaded: true });
        } catch (err) {
            if (err.name !== 'AbortError') this.setState({loaded:true });
        }
    }
    render = () => <SmallInfoCardWithIcon item={{...this.state, title: this.props.t('db.stat.card.latestCampaign.title')}}/>
}
 
export default translate()(LatestCampaigns);