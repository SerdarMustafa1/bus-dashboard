import React, {useContext} from 'react';
// import DoughnutGraph from "../utils/doughnutGraph";
import ActiveCampaigns from "../general/activeCampaigns";
import TotalCampaigns from "../general/totalCampaigns";
import LatestCampaigns from "../general/latestCampaigns";
import IncomePerMonth from "../general/incomePerMonth";
import SalesNotificationFeed from "../general/salesNotificationFeed";
import CampaignNotificationFeed from "../general/campaignNotificationFeed";
import GeneralLiveMap from "../general/generalLiveMap";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import AuthContext from "../../../context/auth-context";
import SmallInfoCard from "../utils/smallInfoCard";

export default () => {
    const context = useContext(AuthContext);
    return (
        <div className="container-fluid">
            { context.role === 5 && <Row>
                <Col sm={6} xl={3}>
                    <TotalCampaigns/>
                </Col>
                <Col sm={6} xl={3}>
                    <ActiveCampaigns/>
                </Col>
                <Col sm={6} xl={3}>
                    <LatestCampaigns/>
                </Col>
                <Col sm={6} xl={3}>
                    <IncomePerMonth/>
                </Col>
            </Row> }
            <Row>
                <Col xl={8}>
                    <GeneralLiveMap/>
                </Col>

                <Col md={12} xl={4}>
                    <Row>
                        <SalesNotificationFeed/>
                        <CampaignNotificationFeed/>
                    </Row>
                </Col>
            </Row>
        </div>
    )
};
