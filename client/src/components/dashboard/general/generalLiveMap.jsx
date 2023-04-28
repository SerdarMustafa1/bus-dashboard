import React, { Component } from "react";
import LiveMap from "../map/liveMap";
import queryRequest from "../../../utils/queryRequest";
import Select from "react-select";

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';

import { translate } from 'react-i18next';
import AuthContext from "../../../context/auth-context";

import blue from '../../../images/markers/dot_marker_blue_32.png';
import orange from '../../../images/markers/dot_marker_orange_32.png';
import green from '../../../images/markers/dot_marker_green_32.png';
import gray from '../../../images/markers/dot_marker_gray_32.png';

class GeneralLiveMap extends Component {
  state = {
    cities: [],
    operator_selected: null,
    city_selected: null
  };

  static contextType = AuthContext;
  controller = new AbortController();

  componentWillUnmount() {
    this.controller.abort();
  }

  async componentDidMount() {
    const query = `query{cities{ _id name longitude latitude operators { _id operatorId company } }}`;

    try {
      let { cities } = await queryRequest(query, this.controller.signal);
      cities = cities.filter(city => city.operators.length > 0);
      cities = cities.map(city => {
        return {
          ...city,
          label: city.name,
          value: city._id,
          operators: city.operators.map(operator => {
            const label = operator.company
              ? operator.company
              : operator.operatorId;
            return { ...operator, label, value: operator._id };
          })
        };
      });
      const openCityDefault = cities.map(city => city.label).indexOf('Helsinki');
      this.setState({
        cities,
        city_selected: cities.length > 0 ? (openCityDefault !== -1? cities[openCityDefault]:cities[0]) : null
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.log("Fetch failed: ", err.toString());
    }
  }

  getMapData = () => {
    if (this.state.city_selected === null) return;
    const { _id, longitude, latitude } = this.state.city_selected;

    let getData, query;

    if (!this.state.operator_selected) {
      query = `query{cityVehicles(_id: "${_id}"){ _id haveAds longitude latitude listed }}`;
      getData = data => data.cityVehicles;
    } else {
      query = `query{operatorVehicles(_id: "${this.state.operator_selected.value}"){ _id haveAds longitude latitude listed }}`;
      getData = data => data.operatorVehicles;
    }

    return {
      height: 624,
      query,
      latitude,
      longitude,
      getData
    };
  };

  handleCityChange = selected => {
    this.setState({ city_selected: null, operator_selected: null });
    setTimeout(() => this.setState({ city_selected: selected }), 0);
  };

  handleOperatorChange = selected => {
    const tempCity = this.state.city_selected;
    const tempOperator = this.state.operator_selected;

    this.setState({ city_selected: null, operator_selected: null });

    setTimeout(() => {
      if (tempOperator && selected.value === tempOperator.value) {
        this.setState({city_selected: tempCity, operator_selected:null})
      } else {
        this.setState({ city_selected: tempCity, operator_selected: selected });
      }
    }, 0);
  };

  render() {
    const { role } = this.context;
    const { t } = this.props;
    return (
      <React.Fragment>
          <Card className="m-b-10">
            <Card.Body>
              <h4 className="mt-0 mb-3 header-title">{t('db.general.map.title')}</h4>
              <Row className="mb-1">
                <Col sm={6}>
                  <div className='m-auto'>

                  <Col className="mb-2" style={{ zIndex:1004 }}>
                    <Select
                      value={this.state.city_selected}
                      onChange={this.handleCityChange}
                      options={this.state.cities}
                      required
                    />
                  </Col>
                  {this.state.city_selected &&
                    this.state.city_selected.operators.length > 1 && (
                      <Col style={{ zIndex:1001 }}>
                        <Select
                          value={this.state.operator_selected}
                          onChange={this.handleOperatorChange}
                          options={this.state.city_selected.operators}
                        />
                      </Col>
                    )}
                  </div>
                </Col>
                <Col sm={6} >
                  <div className="mb-2"><img src={blue} alt='blue'/> {t('map.marker.blue')}</div>
                  <div className="mb-2"><img src={green} alt='green'/> {t('map.marker.green')}</div>
                  <div className="mb-2"><img src={orange} alt='orange'/> {t('map.marker.orange')}</div>
                  {[5,11].includes(role) && <div className="mb-2"><img src={gray} alt='blue'/> {t('map.marker.gray')}</div> }
                </Col>
              </Row>
              <div style={{minHeight:350}}>
                {this.state.city_selected !== null && <LiveMap data={this.getMapData()}/>}
              </div>
            </Card.Body>
          </Card>
      </React.Fragment>
    );
  }
}

export default translate()(GeneralLiveMap);
