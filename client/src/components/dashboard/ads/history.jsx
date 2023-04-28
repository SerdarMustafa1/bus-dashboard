import React, { Component } from 'react';
import Chart from "react-apexcharts";
import queryRequest from '../../../utils/queryRequest';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';

import {translate} from 'react-i18next';

class History extends Component {
    state = {
        options: {
            chart: {
                stacked: false,
            },
            xaxis: { type: 'bar', }
        },
        total: 0,
        series: [],
    };
    controller = new AbortController();
    
    componentWillUnmount() {
        this.controller.abort();
    }

    async componentDidMount() {
        const query = `query{place(_id:"${this.props.data._id}") {placements {count created_at}}}`;

        try {
            const { place } = await queryRequest(query, this.controller.signal);
            if (place && place.placements.length > 0) {
                const serial = { name: '', data: []};

                const data = {};
                let total = 0;

                for (const placement of place.placements) {
                    const date = new Date(parseInt(placement.created_at)).toISOString().split('T')[0].slice(0, -2) + '01';
                    
                    if (data[date]) {
                        data[date].y += placement.count;
                    } else {
                        const tempDate = new Date(date);
                        data[date] = { x: `${this.props.t('month.'+tempDate.getMonth())} ${tempDate.getFullYear()}`, y: placement.count }
                    }
                    total += placement.count;
                }
                serial.data.push(...Object.values(data));
                this.setState({series: [serial], total})
            }
        } catch (err) {
        }
    }

    render() {
        if (this.state.total <= 0) return null;
        return (
        <Col sm={12} md={6} xl={4}>
            <Card className="m-b-20">
                <Card.Body>
                    <Row className="pl-3 p-0 m-0">
                           {this.state.total} {this.props.data.name}
                    </Row>
                    <Chart
                        options={this.state.options}
                        series={this.state.series}
                        type="bar"
                        height="250"/>
                </Card.Body>
            </Card>
        </Col>
        );
    }
}

export default translate()(History);