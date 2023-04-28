import React, { Component } from 'react';
import {ListFeed, loadMore} from "../utils/listFeed";
import activityTypes from "../../../utils/activityTypes";

class SalesNotificationFeed extends Component {
    state = {
        feed: [],
        loading: true
    };
    loading = false;
    controller = new AbortController();
    activities = [activityTypes.CAMPAIGN.NEW, activityTypes.CAMPAIGN.DELETE];
    limit = 8;

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        this.load();
    }
    load = () => loadMore(this, `query{activities(types:${JSON.stringify(this.activities)}, skip:${this.state.feed.length}, limit:${this.limit}){ message created_at }}`)
    render = () => <ListFeed data={{...this.state, title:'db.feed.sales.activity'}} doLoadMore={this.load} className="col-xl-12 col-md-6 col-sm-12"/>
}

export default SalesNotificationFeed;