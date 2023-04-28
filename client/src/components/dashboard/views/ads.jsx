import React, { Component } from 'react';
import PlaceHistory from '../ads/history';
import queryRequest from '../../../utils/queryRequest';

import Row from 'react-bootstrap/Row';

class Ads extends Component {
    state = {
        places: []
    };
    controller = new AbortController();
    
    componentWillUnmount() {
        this.controller.abort();
    }

    async componentDidMount() {
        const query = `query{places { _id name }}`;

        try {
            const { places } = await queryRequest(query, this.controller.signal);
            if (places) {
                this.setState({places})
            }
        } catch (err) {
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <Row>
                    { this.state.places.map(place => { return <PlaceHistory key={place._id} data={place} />})}
                </Row>
            </div>
        );
    }
}

export default Ads;