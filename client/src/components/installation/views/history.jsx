import React, {Component} from "react";
import queryRequest from "../../../utils/queryRequest";

import { SearchAndTriggerNav } from '../components/navs';
import {VehicleByHistory} from '../components/vehicleCards';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { translate } from 'react-i18next';

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: '',
            history: [],
            loading: true,
            me: true,
        };
    }

    controller = new AbortController();
    searchTimeout = 0;

    componentWillUnmount() {
        this.controller.abort();
        clearTimeout(this.searchTimeout);
    }

    componentDidMount() {
        this.installsLoadIn()
    }

    installsLoadIn = async () => {
        const query = `query{ history(search:"${this.state.search}", skip:${this.state.history.length}, all:${this.state.me ? 'false':'true'}){ 
        id user{name}
        vehicle{_id haveAds listed}
        campaign{_id name}
        placement{_id place{name}}
        install{count}
        remove{count}
        activityType created_at }}`;
        try {
            const {history} = await queryRequest(query, this.controller.signal);
            if (history) this.setState({history});
        } catch (err) {
          console.log(err)
        }
    };

    handleSearchChange = (e) => {
        this.setState({search: e.target.value, history:[]});
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(this.installsLoadIn, 600)
    };

    handleSearchSubmit = (e) => {
        e.preventDefault();
    };
    handleSwitchTrigger = () => {
      this.setState({me: !this.state.me, history:[]});
      setTimeout(this.installsLoadIn, 10);
    };

    scrolling = (e, load) => {
        // if (e.target.scrollTopMax - e.target.scrollTop < 90) load();
    };

    render() {
        return (
            <React.Fragment>
                <SearchAndTriggerNav value={this.state.search} onChange={this.handleSearchChange}
                                  placeholder="i.search.vehicle"
                                  onSubmit={this.handleSearchSubmit} trigger={{
                    value: this.state.me, on: 'i.switch.me', off: 'i.switch.all', type: 'none',
                    click: this.handleSwitchTrigger
                }}/>

                <Container style={{marginTop: 65}}>
                    <Row className='border-bottom' style={{display: 'block'}}>
                        <h4 className="text-center text-white">{this.props.t('i.history.title')}</h4>
                    </Row>
                    <div>
                        {this.state.history.length > 0 && this.state.history.map(history =>
                            <VehicleByHistory key={history.id} data={history}/>)}
                    </div>
                </Container>
            </React.Fragment>
        );
    }
}

export default translate()(History);
