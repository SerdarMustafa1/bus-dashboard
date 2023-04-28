import React, { useContext } from "react";

import { getNavs, RoleLink } from '../routes';
import AuthContext from "../../../context/auth-context";

import {translate} from 'react-i18next';

import logo from '../../../images/logo.svg'

const NavbarItem = (props) => {
  return (
      <li>
        <RoleLink to={props.data.to} className='waves-effect'>
          <i className={"mdi " + props.data.icon}/>
          <span>{ props.data.name }</span>
        </RoleLink>
      </li>);
};

export default translate()(({t}) => {
  const context = useContext(AuthContext);
  return (
    <div className="left side-menu" style={{zIndex:1005}}>
    <div className="topbar-left">
      <a className="logo" href="/dashboard">
        <img src={logo} height="50" alt="logo" />
      </a>
    </div>
    <div className="sidebar-inner slimscrollleft">
      <div id="sidebar-menu">
        <ul>
          <li className="menu-title"/>
          { getNavs(context.role).map(n =>
              <NavbarItem key={n.path} data={{ name: t(n.translation), badge: "", icon: n.icon, to:n.name }}/>)}
        </ul>
      </div>
    </div>
  </div>);
})
