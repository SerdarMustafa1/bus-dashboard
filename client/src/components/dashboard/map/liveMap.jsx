import React, { Component } from "react";
import L from "leaflet";
import "leaflet.marker.slideto";
import queryRequest from "../../../utils/queryRequest";
import ReactDOM from "react-dom";
import VehicleMarker from './marker';

import AuthContext from "../../../context/auth-context";

import blue from '../../../images/markers/dot_marker_blue_16.png';
import orange from '../../../images/markers/dot_marker_orange_16.png';
import green from '../../../images/markers/dot_marker_green_16.png';
import gray from '../../../images/markers/dot_marker_gray_16.png';

class LiveMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      size: props.data.height || 580,
      smooth: true,
      refreshRate: 10000,
      doSelection: props.doSelection,
    };
  }

  static contextType = AuthContext;
  
  intervalID = 0;
  controller = new AbortController();

  componentDidMount() {

    const { latitude, longitude } = this.props.data;
const { refreshRate } = this.state;
    this.map = L.map("map", {
      center: [latitude || 0, longitude || 0],
      zoom: this.props.data.zoom || 11,
      continuousWorld: true,
    });

    // const TILES = 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
    const TILES = 'https://4.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=fL46BlQybP6rGwlfCw9f&app_code=nbbrVKYICWOqgenUhmpEBg';

    L.tileLayer(TILES, {
      detectRetina: true,
      maxZoom: 19,
      maxNativeZoom: 17,
      minZoom: 8,
    }).addTo(this.map);


    this.dotIcon = L.icon({
      iconUrl: blue,
      iconSize: [13, 13],
      iconAnchor: [7, 7], // left-Right down-up
      popupAnchor: [0, 0]
    });

    this.dotIconActive = L.icon({
      iconUrl: green,
      iconSize: [13, 13],
      iconAnchor: [7, 7], // left-Right down-up
      popupAnchor: [0, 0]
    });

    this.dotIconSpecial = L.icon({
      iconUrl: orange,
      iconSize: [13, 13],
      iconAnchor: [7, 7], // left-Right down-up
      popupAnchor: [0, 0]
    });

    this.dotIconUnlisted = L.icon({
      iconUrl: gray,
      iconSize: [13, 13],
      iconAnchor: [7, 7], // left-Right down-up
      popupAnchor: [0, 0]
    });

    this.vehicles = {};

    this.refreshData();
    this.intervalID = setInterval(this.refreshData, refreshRate);
  }

  // Todo: Make filter by search

  doHighLight = (vehicles) => {
    this.removeHighLight();
    vehicles.forEach(vehicle_id =>vehicle_id in this.vehicles? this.vehicles[vehicle_id].setIcon(this.dotIconSpecial): '');
  };

  removeHighLight = () => {
    Object.values(this.vehicles).forEach(vehicle => vehicle.setIcon(vehicle.origIcon));
  };

  refreshData = async () => {
    try {
      const data = await queryRequest(this.props.data.query, this.controller.signal, this.props.data.token);
      const vehicles = this.props.data.getData(data);
      for (const vehicle of vehicles) {
        if (vehicle._id in this.vehicles) this.moveVehicle(vehicle);
        else this.createVehicle(vehicle);
      }
    } catch (err) {
      console.log(err);
    }
  };

  createVehicle = (vehicle) => {
    const { doSelection} = this.state;
    const { _id, latitude, longitude, haveAds, listed } = vehicle;
    const icon = listed !== false ? haveAds ? this.dotIconActive : this.dotIcon : this.dotIconUnlisted;

    let pointer = L.marker([latitude, longitude], {
      riseOnHover: true,
      icon,
      zIndexOffset: (vehicle.haveAds? 800: undefined),
    }).addTo(this.map);

    pointer.origIcon = icon;

    pointer.click = () => {
      const marker = this.vehicles[_id];
      if (!marker.getPopup()) {
        const popup = document.createElement('div');
        marker.vehicle = ReactDOM.render(<VehicleMarker data={vehicle} list={!(this.props.data.details === false)}  doUnHighLight={this.removeHighLight} doHighLight={this.doHighLight} cb={() => {
          marker.bindPopup(popup);
          marker.openPopup();
        }} />, popup);
      }
    };

    pointer.on("click", (ev) => {
      const marker = ev.target;
      if (doSelection) {
        if (this.props.selected !== _id) doSelection(_id);
      }
      else marker.click();
    });

    pointer.on("popupopen", () => {
      const marker = this.vehicles[_id];
      marker.setIcon(this.dotIconSpecial);
      marker.vehicle.handleClick();
    });

    pointer.on("popupclose", ev => {
      this.removeHighLight();
      if (this.props.doSelection) {
        if (this.props.selected === _id) {
          doSelection("");
        }
      }
    });
    this.vehicles[_id] = pointer;
  }

  moveVehicle = (veh) => {
    const { smooth, refreshRate} = this.state;
    const {_id, latitude, longitude} = veh;
    if (this.vehicles[_id].getLatLng().equals([latitude, longitude])) return;
    if (smooth && this.vehicles[_id].getLatLng().distanceTo([latitude, longitude]) < 500) {
      this.vehicles[_id].slideTo([latitude, longitude], {
        duration: refreshRate,
        keepAtCenter: false
      });
    }
    else this.vehicles[_id].setLatLng(new L.latLng(latitude, longitude));
  }

  hiLight = (selected) => {
    const marker = this.vehicles[selected];
    marker.click();
    if (marker.getPopup()) marker.openPopup();
  };

  unHiLight = () => {
    for (const vehicle of Object.values(this.vehicles)) {
      if (vehicle.isPopupOpen()) {
        vehicle.closePopup();
      }
    }
  };
  
  componentWillReceiveProps(props) {
    const {doSelection} = this.state;
    if (props.selected) {
      setTimeout(() => this.hiLight(props.selected), 1);
    } else if (doSelection) {
      this.unHiLight();
    }
  }

  componentWillUnmount() {
    this.controller.abort();
    clearInterval(this.intervalID);
  }

  render() {
    const {size, doSelection, smooth, refreshRate} = this.state;
    return (
        <div style={{ minHeight: size, borderRadius: 5 }} id="map" />
    );
  }
}

export default LiveMap;
