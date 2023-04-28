import React, { Component } from 'react';
import SmallInfoCardWithIcon from '../utils/smallInfoCard';
import queryRequest from "../../../utils/queryRequest";

import { translate } from 'react-i18next';

class ActiveCampaigns extends Component {
    state = {
        main: 0,
        description: `${this.props.t('db.stat.card.activeCampaigns.addition')} 0 €`,
        loaded: false,
    };

    controller = new AbortController();
    
    componentWillUnmount() {
        this.controller.abort();
    }

    async componentDidMount() {
        const query = `query{campaignsActive{ budget }}`;
        try {
            const {campaignsActive} = await queryRequest(query, this.controller.signal);
            if (!campaignsActive) return;
            const total = campaignsActive.map(camp => camp.budget).reduce((a, b) => {return a + b;}, 0);
            this.setState({ description: `${this.props.t('db.stat.card.activeCampaigns.addition')} ${total} €`, main: campaignsActive.length, loaded:true });
        } catch (err) {
            if (err.name !== 'AbortError') this.setState({loaded:true });
        }
    }
    
    render = () => <SmallInfoCardWithIcon item={{...this.state, title: this.props.t('db.stat.card.activeCampaigns.title')}} /> ;
}
 
export default translate()(ActiveCampaigns);