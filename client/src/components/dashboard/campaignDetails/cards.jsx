import {translate} from "react-i18next";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";
import SmallInfoCard from "../utils/smallInfoCard";
import {RoleLink} from "../routes";
import LiveMap from "../map/liveMap";
import {vehID} from "../../../utils/vehicleProps";
import DataTable from "../utils/dataTable";
import formatDate from "../../../utils/formatDate";


export const TimeSpan = translate()(({data, t}) =>
    <Card style={{minHeight: 156}}>
        <Card.Body>
            {!data.loaded && (<div className="text-center m-3">
                <Spinner variant="warning" animation='border'/>
            </div>)}
            {data.loaded &&
            <React.Fragment>
                <Row className="text-center" style={{marginTop: 0}}>
                    <Col>
                        {t('db.campaign.card.date.start')}
                        <div className="mini-stat-info">
              <span className="counter text-primary">
                {formatDate(parseInt(data.startDate))}
              </span>
                        </div>
                    </Col>
                    <Col>
                        {t('db.campaign.card.date.end')}
                        <div className="mini-stat-info">
              <span className="counter text-orange">
                {formatDate(parseInt(data.endDate))}
              </span>
                        </div>
                    </Col>
                </Row>
            </React.Fragment>}
        </Card.Body>
        {data.loaded &&
        <ProgressBar className="card-bottom-progress" variant='warning' now={data.now} style={{borderRadius: 0}}/>}
    </Card>);

export const Cities = translate()(({t, data}) => <SmallInfoCard item={{
    title: t('db.campaign.card.cities.title'),
    main: data.cities,
    description: `${t('db.campaign.card.cities.text')} ${data.vehicles}`,
    loaded: data.loaded,
}}/>);

export const SaleBy = translate()(({t, data}) => <SmallInfoCard item={{
    title: t('db.campaign.card.saleBy.title'),
    main: <RoleLink to='user' id={data.creator._id}>
        <span className="counter text-success">{data.creator.name}</span>
    </RoleLink>,
    description: formatDate(parseInt(data.date)),
    loaded: data.loaded,
}}/>);

export const Budget = translate()(({t, data}) => <SmallInfoCard item={{
    title: t('db.campaign.card.budget.title'),
    main: data.budget,
    description: `${t('db.campaign.card.budget.text')} ${data.placements}`,
    loaded: data.loaded,
}}/>);

export const Live = translate()(({t, data}) => <Card className="m-b-10">
    <Card.Body>
        <h4 className="mt-0 header-title">{t('db.campaign.live.title')}</h4>
        {!data.loaded &&
        <div className="text-center m-3">
            <Spinner variant="warning" animation="border"/>
        </div>}
        {data.loaded && <LiveMap data={data.mapData} selected={data.selected} doSelection={data.handleSelection}/>}
    </Card.Body>
</Card>);

const InstallPlacementStat = (props) => {
    const total = props.data.installs.filter(i => i.installed).map(i => i.count).reduce((a, b) => a + b, 0);

    return (
        <div className="m-3">
            <Row className="text-center">
                <Col>
                    <strong>{props.data.place.name}</strong>
                </Col>
                <Col>
                    {total}/{props.data.count}
                </Col>
            </Row>
            <ProgressBar striped variant={props.data.count <= total ? 'success' : 'warning'}
                         now={total * 100 / props.data.count}/>
        </div>)
};

export const InstallProgress = translate()(({ t, data }) =>
    <Card className="m-b-20">
        <Card.Body>
            <h4 className="mt-0 mb-2 header-title">{t('db.campaign.progress.title')}</h4>
            {!data.loaded && (
                <div className="text-center m-3">
                    <Spinner variant="warning" animation="border"/>
                </div>)}
            {data.loaded && <React.Fragment>
                {data.placements.map(p => <InstallPlacementStat key={p._id} data={p}/>)}
            </React.Fragment>}
        </Card.Body>
    </Card>);

const renderTableData = (placements) => {
    const fleet = {};

    for (const placement of placements) {
        for (const install of placement.installs) {
            if (!(install.vehicle._id in fleet)) fleet[install.vehicle._id] = {...install.vehicle, ads: 0, removed: 0}

            if (install.installed) fleet[install.vehicle._id].ads += install.count
            else fleet[install.vehicle._id].removed += install.count
        }
    }
    return Object.values(fleet).map((fleet) => {
        if (!fleet) return null;
        const {_id, operator, city, ads, removed} = fleet;

        return {
            _id, city: city.name,
            operator: operator.company || operator.operatorId,
            ads, removed
        };
    });
}

export const ActivityTable = translate()(({t, data}) => {
    const thead = [t('db.campaign.atable.id'),
        t('db.campaign.atable.city'),
        t('db.campaign.atable.operator'),
        t('db.campaign.atable.ads'),
        t('db.campaign.atable.removed')];
    const columns = [
        {
            data: '_id',
            render: (data) => {
                return vehID(data);
            }
        },
        {
            data: 'city'
        },
        {
            data: 'operator'
        },
        {
            data: 'ads'
        },
        {
            data: 'removed'
        }
    ];

    return (<Card className="m-b-20">
        <Card.Body>
            <h4 className="mt-0 header-title">{t('db.campaign.atable.title')}</h4>
            <DataTable data={renderTableData(data.placements)} columns={columns} thead={thead} rowCallback={data.rowCallback}/>
        </Card.Body>
    </Card>)
});
