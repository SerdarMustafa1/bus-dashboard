import React, { Component, useState } from "react";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import {translate} from 'react-i18next';
import queryRequest from "../../../utils/queryRequest";

const update = async (team, placement, count, refresh) => {
    const number = count ? parseInt(count) : 0;
    if (number === 0) return remove(team, placement, refresh);
    const query = `mutation{installOrderCreate(placement:"${placement}", team:"${team}", count:${number}){count}}`;

    try {
        const {installOrderCreate} = await queryRequest(query);
        if (installOrderCreate) refresh();
    } catch (err) {
        console.log("Ohnoo, ", err.toString());
    }
}

const remove = async (team, placement, refresh) => {

    const query = `mutation{installOrderRemove(placement:"${placement}", team:"${team}")}`;
    console.log(query);
    try {
        const {installOrderRemove} = await queryRequest(query);
        if (installOrderRemove) {
            refresh();
        } else {
            console.log('Cant Remove')
        }
    } catch (err) {
        console.log("Ohnoo, ", err.toString());
    }
}

const isNumber = (num) => {
    return num === "" || /^\d+$/.test(num);
}

const Column = translate()(({t, assigned, team, placement, refresh}) => {
    const [value, setValue] = useState(String(assigned));

    return (
        <td>
            <Form onSubmit={(e) => {
                e.preventDefault();
                if (value === '') setValue('0');
                update(team, placement, value, refresh)
            }} >
                <InputGroup>
                    <FormControl
                        value={value}
                        onChange={(e) => isNumber(e.target.value) ? setValue(e.target.value):undefined}
                        style={{maxWidth: "55px"}}
                        type='text'
                    />
                    {value !== String(assigned) && <InputGroup.Append>
                        <Button variant='primary' type='submit' ><i className='fa fa-paper-plane'/></Button>
                    </InputGroup.Append>}
                </InputGroup>
            </Form>
        </td>
    )
})

class Team extends Component {
    state = {
        campaign: {},
        teams: {},
        loaded: false,
    };

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        console.log("Assigns");
        this.loadFullData();
    }

    loadFullData = async () => {
        const query = `query{teams{_id company} campaign(_id:"${this.props.match.params.id}"){name placements {_id count place{name}installOrders{team{_id}count}}}}`;
        try {
            const {campaign, teams} = await queryRequest(query, this.controller.signal);
            const teamsObj = {}
            for (const team of teams) teamsObj[team._id] = team;

            for (const placement of campaign.placements) {
                placement.teamsInstallOrder = {};
                for (const order of placement.installOrders) placement.teamsInstallOrder[order.team._id] = order;
            }

            console.log(campaign)
            this.setState({campaign, teams: teamsObj, loaded: true});
        } catch (err) {
            console.log("Ohnoo, ", err.toString());
            this.setState({loaded: true});
        }
    }

    refresh = async () => {
        console.log('REFRESHING')
        const query = `query{campaign(_id:"${this.props.match.params.id}"){name placements {_id count place{name}installOrders{team{_id}count}}}}`;

        try {
            const {campaign} = await queryRequest(query, this.controller.signal);
            for (const placement of campaign.placements) {
                placement.teamsInstallOrder = {};
                for (const order of placement.installOrders) placement.teamsInstallOrder[order.team._id] = order;
            }
            this.setState({campaign});
        } catch (err) {
            console.log("Ohnoo, ", err.toString());
            this.setState({loaded: true});
        }
    }

    render() {
        if (!this.state.loaded) return null;
        const { t } = this.props;
        return (
            <div className="container-fluid">
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>{t('db.assign.table.title')} {this.state.campaign.name}</Card.Header>
                            <Card.Body>
                                <Table responsive striped bordered hover size='sm'>
                                    <thead>
                                    <tr>
                                        <th>{t('db.assign.table.placements')}</th>
                                        {Object.keys(this.state.teams).map(t_id => <th key={t_id}>{this.state.teams[t_id].company}</th>)}
                                        <th>{t('db.assign.table.total')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        { this.state.campaign.placements.map(p => {
                                            const now = p.installOrders.map(o => o.count).reduce((a,b) => a+b, 0);
                                            return (<tr key={p._id}>
                                                <td>{p.place.name} {p.count-now === 0 && <i className='text-lime fa fa-check'/>}</td>
                                                {Object.keys(this.state.teams).map(t_id =>
                                                        <Column key={t_id} assigned={p.teamsInstallOrder[t_id]? p.teamsInstallOrder[t_id].count:0} refresh={this.refresh}
                                                        placement={p._id} team={t_id}/>)}
                                                <td>{now}/{p.count}</td>
                                            </tr>)
                                        })}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default translate()(Team);
