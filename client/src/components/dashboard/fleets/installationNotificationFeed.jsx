import React, { Component } from 'react';
import {ListFeed, loadMore} from "../utils/listFeed";
import activityTypes from "../../../utils/activityTypes";

class InstallationNotificationFeed extends Component {
    state = {
        feed: [],
        loading: true
    };
    loading = false;
    controller = new AbortController();
    activities = [activityTypes.INSTALL.NEW, activityTypes.REMOVE.NEW];
    limit = 4;

    componentWillUnmount() {
        this.controller.abort();
    }
    componentDidMount() {
        this.load();
    }
    load = () => loadMore(this, `query{vehicleActivities(_id:"${this.props.id}", types:${JSON.stringify(this.activities)}, skip:${this.state.feed.length}, limit:${this.limit}){ message created_at }}`);
    render = () => <ListFeed className='col-12' data={ {...this.state, title: 'db.feed.vehicle.activity'} } doLoadMore={this.load}/>;

}
 
export default InstallationNotificationFeed;