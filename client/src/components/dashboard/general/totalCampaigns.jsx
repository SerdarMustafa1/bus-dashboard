import React, {Component} from "react";
import SmallInfoCard from "../utils/smallInfoCard";
import queryRequest from "../../../utils/queryRequest";

import { translate } from 'react-i18next';

class TotalCampaigns extends Component {
    state = {
        main: 0,
        description: `${this.props.t('db.stat.card.totalCampaigns.addition')} 0 €`,
        budgets: [],
        loaded: false,
    };

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    async componentDidMount() {
        const query = `query{campaigns{ budget }}`;

        try {
            const {campaigns} = await queryRequest(query, this.controller.signal);
            if (!campaigns) return;
            const total = campaigns.map(camp => camp.budget).reduce((a, b) => {
                return a + b;
            }, 0);
            this.setState({description: `${this.props.t('db.stat.card.totalCampaigns.addition')} ${total} €`, main: campaigns.length, loaded: true});
        } catch (err) {
            if (err.name !== 'AbortError') this.setState({loaded:true });
        }
    }

    render = () => <SmallInfoCard item={{...this.state, title:this.props.t('db.stat.card.totalCampaigns.title')}}/>;
}

export default translate()(TotalCampaigns);
