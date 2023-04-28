import React from 'react';
import { translate } from 'react-i18next';

import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';
import queryRequest from "../../../utils/queryRequest";

function dateToString(date, t) {
    const realDate = new Date(parseInt(date));
    return `${new Date().getFullYear() !== realDate.getFullYear() ? `${new Date().getFullYear()} ` : ''}${t('month.' + realDate.getMonth()).toUpperCase()} ${realDate.getDate()}`
}

const ListFeedItem = translate()(({item, t}) => {
    return (
        <li className="feed-item">
            <span className="date">{dateToString(item.created_at, t)}</span>
            <span className="activity-text" dangerouslySetInnerHTML={{__html: item.message}}/>
        </li>
    );
});

const scrolling = (e, load) => {
    if (e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop < 90) load();
};

export const loadMore = async (component, query) => {
    if (!component.loading) {
        component.loading = true;
        component.setState({loading: true})

        try {
            const data = await queryRequest(query, component.controller.signal);
            if (Object.keys(data).length === 1) {
                const activities = data[Object.keys(data)[0]];
                if (activities && activities.length !== 0) {
                    component.setState({feed: [ ...component.state.feed, ...activities], loading: false});
                    component.loading = activities.length < component.limit;
                    return;
                }
            }
            component.setState({loading: false});
            component.loading = true;
        } catch (err) {
            if (err.name !== 'AbortError') console.log("Fetch failed: ", err.toString())
        }
    }
}

export const ListFeed = translate()(({t, data, className, doLoadMore}) => {
    return (<div className={className ? className : "col-md-6"}>
        <Card className="m-b-20">
            <Card.Body>
                <h4 className="mt-0 m-b-15 header-title">{t(data.title)}</h4>
                {data.feed.length <= 0 && !data.loading && t('db.feed.empty')}
                {data.feed.length > 0 &&
                <div className="scrollable mx-280" onScroll={(e) => scrolling(e, doLoadMore)}>
                    <ol className="activity-feed mb-0">
                        {data.feed.map((item, index) => <ListFeedItem key={index} item={item}/>)}
                    </ol>
                </div>}

                {data.loading && (
                    <div className="text-center m-3">
                        <Spinner animation='border' variant='warning'/>
                    </div>)}
            </Card.Body>
        </Card>
    </div>);
})