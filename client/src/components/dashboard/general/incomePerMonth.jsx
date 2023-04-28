import React, { Component } from 'react';
import SmallInfoCardWithIcon from '../utils/smallInfoCard';
import queryRequest from "../../../utils/queryRequest";

import { translate } from 'react-i18next';

class IncomePerMonth extends Component {
    state = {
        main: "0 €",
        description: `${this.props.t('db.stat.card.revenueThisMonth.addition')} 0`,
        loaded: false,
    };

    controller = new AbortController();
    
    componentWillUnmount() {
        this.controller.abort();
    }

    async componentDidMount() {
        const now = new Date();
        const query = `query{campaignsTil(date:"${new Date(now.getFullYear(), now.getMonth()-1).getTime()}"){ budget created_at }}`;
        try {
            const {campaignsTil} = await queryRequest(query, this.controller.signal);
            const thisMonth = new Date(now.getFullYear(), now.getMonth()-1).getTime();
            let revThis = 0, revLast = 0;
            for (const cmp of campaignsTil) parseInt(cmp.created_at) < thisMonth ? revLast+=cmp.budget : revThis += cmp.budget;
            this.setState({ main: `${revThis} €`, description: `${this.props.t('db.stat.card.revenueThisMonth.addition')} ${revLast} €`, loaded: true});
        } catch (err) {
            if (err.name !== 'AbortError') this.setState({loaded:true });
        }
      }

    render = () => <SmallInfoCardWithIcon item={{...this.state, title: this.props.t('db.stat.card.revenueThisMonth.title')}} />;

}
 
export default translate()(IncomePerMonth);