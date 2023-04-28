import React, {Component} from "react";

import AuthContext from "../../../context/auth-context";
import {roleTranslate} from '../../../utils/roles';

import {translate} from 'react-i18next';

// function invertColor(hex) {
//     if (hex.indexOf('#') === 0) hex = hex.slice(1);
//     // convert 3-digit hex to 6-digits.
//     if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
//     if (hex.length !== 6) throw new Error('Invalid HEX color.');
//     // invert color components
//     let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
//         g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
//         b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
//     // pad each with zeros and return
//     return '#' + padZero(r) + padZero(g) + padZero(b);
// }
// function padZero(str, len) {
//     len = len || 2;
//     return (new Array(len).join('0') + str).slice(-len);
// }

const initialColors = {
    0: '#355fa7',
    1: '#4ac18e',
    3: '#ffbb44',
    5: '#ea553d',
    11: '#ea553d',
}

function getInitials(fullName, role) {
    let f, l;
    const nameTrim = fullName && fullName.trim();
    if (!fullName || nameTrim.length === 0) f = '-';
    else if (nameTrim.length === 1) f = nameTrim[0];
    else if (nameTrim.split(' ').length > 1) {
        const split = nameTrim.split(' ');
        f = split[0][0]
        l = split[split.length - 1][0]
    } else {
        f = nameTrim[0]
        l = nameTrim[1]
    }

    let canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = 32;
    canvas.height = 32;
    document.body.appendChild(canvas);
    let context = canvas.getContext('2d');
    context.fillStyle = initialColors[role];
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "18px Cousine, monospace";
    context.fillStyle = '#fff';

    let initials = l ? f + l : f;
    context.fillText(initials.toUpperCase(), l ? 5: 10, 22);

    let data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
}

class Toolbar extends Component {

  static contextType = AuthContext;
  static imgUrl = "https://picsum.photos/100";

  state = {
      title: this.props.t('dashboard'),
      lang_toggle: false,
      user_toggle: false
  };

  togglescreen = (e) => {
      if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
          if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
      } else {
          if (document.cancelFullScreen) {
              document.cancelFullScreen();
          } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
          } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
          }
      }
  };

  componentDidMount() {
    if (this.context.role) this.setState({title:`${roleTranslate(this.context.role, this.props.t)} ${this.props.t('dashboard').toLowerCase()}`});
  }

  handleLogout(evt) {
    evt.preventDefault();
    this.context.logout();
  }

  render() {
      const { t, i18n } = this.props;
    return (
      <div className="topbar" style={{zIndex:1010}}>
        <nav className="navbar-custom">
          {/*<div className="search-wrap" id="search-wrap">*/}
          {/*  <div className="search-bar">*/}
          {/*    <input className="search-input" type="search" placeholder="Search" />*/}
          {/*    <span className="close-search toggle-search" data-target="#search-wrap">*/}
          {/*      <i className="mdi mdi-close-circle"/>*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*</div>*/}

          <ul className="list-inline float-right mb-0">
            {/* <li className="list-inline-item dropdown notification-list">*/}
            {/*  <span className="nav-link waves-effect toggle-search" data-target="#search-wrap">*/}
            {/*    <i className="mdi mdi-magnify noti-icon"/>*/}
            {/*  </span>*/}
            {/*</li>*/}
            <li className="list-inline-item dropdown notification-list hidden-xs-down">
              <span className="nav-link waves-effect" onClick={this.togglescreen}>
                <i className="mdi mdi-fullscreen noti-icon"/>
              </span>
            </li>
            <li onClick={() =>this.setState({lang_toggle: !this.state.lang_toggle})}
                className={"list-inline-item dropdown notification-list hidden-xs-down" + (this.state.lang_toggle ? ' show': '')}>
              <span className="nav-link dropdown-toggle arrow-none waves-effect text-muted" data-toggle="dropdown">
                {i18n.language.toUpperCase()}
              </span>
              <div className="dropdown-menu dropdown-menu-right language-switch" style={{minWidth:'5rem'}}>
                  { i18n.validLangs.map(({short, name}) =>
                      <span className="dropdown-item" key={short} style={{cursor:"pointer"}}>
                        {/*<img src="/assets/images/flags/germany_flag.jpg" height="16"/>*/}
                        <span onClick={() => i18n.changeLanguage(short)}>{name}</span>
                      </span>)}
              </div>
            </li>
            <li onClick={() => this.setState({user_toggle: !this.state.user_toggle})}
                className={"list-inline-item dropdown notification-list" + (this.state.user_toggle ? ' show': '')}>
              <span className="nav-link dropdown-toggle arrow-none waves-effect nav-user" data-toggle="dropdown">
                <img src={ getInitials(this.context.name, this.context.role) } alt="usr" className="init-logo"/>
              </span>
              <div className="dropdown-menu dropdown-menu-right profile-dropdown">
                <span className="dropdown-item">
                  <i className="dripicons-user text-muted"/>{t('toolbar.profile')}
                </span>
                <div className="dropdown-divider"/>
                <span className="dropdown-item" onClick={ (evt) => this.handleLogout(evt) }>
                  <i className="dripicons-exit text-muted"/>{t('toolbar.logout')}
                </span>
              </div>
            </li>
          </ul>
          <ul className="list-inline menu-left mb-0">
            <li className="list-inline-item">
              <button type="button" className="button-menu-mobile open-left waves-effect" onClick={this.props.doNavbarDisplay}>
                <i className="ion-navicon"/>
              </button>
            </li>
            <li className="hide-phone list-inline-item app-search">
              <h3 className="page-title text-capitalize">{this.state.title}</h3>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default translate()(Toolbar);
