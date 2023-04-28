import React, { Component } from "react";
// import queryRequest from "../../../utils/queryRequest";
//
// import Card from 'react-bootstrap/Card';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import {translate} from 'react-i18next';

// Todo: (Data)Table1 - Placements left Campaigns
// Todo: (Data)Table2 - All out Campaigns

class UserDetails extends Component {
    state = {

    };

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }


    async componentDidMount() {

    }

    render() {
        const { t } = this.props;
        return (
            <div className="container-fluid">

            </div>
        );
    }
}

export default translate()(UserDetails);
