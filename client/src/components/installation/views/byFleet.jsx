import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";

import { SearchAndTriggerNav } from '../components/navs';
import { VehicleByPlacement} from '../components/vehicleCards';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { translate } from 'react-i18next';

class FleetList extends Component {
  constructor(props) {
    super(props);

    const { campaign } = this.props.match.params;

    this.state = {
      campaign,
      search: "",
      vehicles: [],
    };
  }

  controller = new AbortController();

  searchTimeout = 0;

  componentWillUnmount() {
    clearTimeout(this.searchTimeout);
    this.controller.abort();
  }

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(this.loadVehicles, 400)
  };
  handleSearchSubmit = (e) => {
    e.preventDefault();

  };
  componentDidMount() {
    this.loadVehicles();
  }

  loadVehicles = async () => {
    const query = `query{ activeVehicles(search:"${this.state.search}", skip:0){_id listed operator{company} installs{count}}}`;

    try {
      const {activeVehicles} = await queryRequest(query, this.controller.signal);
      if (activeVehicles) {
        this.setState({vehicles: activeVehicles});
        console.log('Active vehicles loaded', activeVehicles)
      }
    } catch (err) {
      if (err.name === 'SyntaxError') {
        // No Connection
      } else if (err.name === 'AbortError') {
        // Aborted
      } else {
        // Bad request
      }
      console.log("error", err);
    }
  };

  render() {
    return (
      <React.Fragment>
        <SearchAndTriggerNav value={this.state.search} onChange={this.handleSearchChange} onSubmit={this.handleSearchSubmit}
                placeholder="i.search.vehicle"/>
        <Container style={{marginTop:65}}>
          <Row className='border-bottom' style={{display:'block'}}>
            <h4 className="text-center text-white">{this.props.t('i.vehicles.title')}</h4>
          </Row>
          {this.state.vehicles.map(vehicle => <VehicleByPlacement key={vehicle._id} data={vehicle}/>)}
        </Container>
      </React.Fragment>

    );
  }
}

export default translate()(FleetList);
