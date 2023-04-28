import React, { Component } from 'react';
import { ListFeed, loadMore } from "../utils/listFeed";
import activityTypes from "../../../utils/activityTypes";


class CampaignNotificationFeed extends Component {
    state = {
        feed: [],
        loading: true
    };
    loading = false;
    controller = new AbortController();
    limit = 8;
    activities = [
        activityTypes.CAMPAIGN.NOTIFICATION.END,
        activityTypes.CAMPAIGN.NOTIFICATION.PRE_END,
        activityTypes.CAMPAIGN.NOTIFICATION.START,
        activityTypes.CAMPAIGN.NOTIFICATION.PRE_START
    ];

    componentWillUnmount() {
        this.controller.abort();
    }
    componentDidMount() {
        this.load();
    }
    load = () => loadMore(this, `query{activities(types:${JSON.stringify(this.activities)}, skip:${this.state.feed.length}, limit:${this.limit}){ message created_at }}`)
    render = () => <ListFeed data={{...this.state, title: 'db.feed.campaigns.notification'}} doLoadMore={this.load} className="col-xl-12 col-md-6 col-sm-12"/>;
}
 
export default CampaignNotificationFeed;