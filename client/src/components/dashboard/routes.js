import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../context/auth-context';

import Assign from './views/assign';
import Assignments from './views/assignments';
import Ads from './views/ads';
// import Client from "./views/clientDetails";
import Clients from './views/clients';
import Sales from './views/sales';
import Settings from './views/settings';
import Campaign from './views/campaignDetails';
import Campaigns from './views/campaigns';
// import User from "./views/userDetails";
import Mails from './views/mails';
import Users from './views/users';
import Operators from './views/operators';
import Teams from './views/teams';
import Team from './views/team';
import Vehicle from './views/fleetDetails';
import Vehicles from './views/fleet';
import General from './views/genaral';

const translatePref = 'db.navbar.';
const pathPref = '/dashboard';

const appRoutes = {
  general: {
    roles: [],
    path: '/general',
    component: General,
    nav: true,
    icon: 'mdi-chart-pie',
  },

  // user: { roles: [1,3,5,11], path: "/user/:id", component: User },
  users: {
    roles: [5, 11],
    path: '/users',
    component: Users,
    nav: true,
    icon: 'ion-android-social',
  },

  // client: { roles: [5,11], path: "/client/:id", component: Client },
  clients: {
    roles: [3, 5, 11],
    path: '/clients',
    component: Clients,
    nav: true,
    icon: 'ion-briefcase',
  },

  campaigns: {
    roles: [3, 5, 11],
    path: '/campaigns',
    component: Campaigns,
    nav: true,
    icon: 'mdi-calendar',
  },
  campaign: { roles: [3, 5, 11], path: '/campaign/:id', component: Campaign },

  sales: {
    roles: [5, 11],
    path: '/sales',
    component: Sales,
    nav: true,
    icon: 'mdi-briefcase-check',
  },

  operators: {
    roles: [5, 11],
    path: '/operators',
    component: Operators,
    nav: true,
    icon: 'mdi-bus',
  },

  vehicles: {
    roles: [5, 11],
    path: '/fleet',
    component: Vehicles,
    nav: true,
    icon: 'mdi-bus',
  },
  vehicle: { roles: [5, 11], path: '/vehicle/:id', component: Vehicle },

  teams: {
    roles: [1, 5, 11],
    path: '/teams',
    component: Teams,
    nav: true,
    icon: 'fa fa-cogs',
  },
  team: { roles: [1, 5, 11], path: '/team/:id', component: Team },

  assignments: {
    roles: [1, 5, 11],
    path: '/assignments',
    component: Assignments,
    nav: true,
    icon: 'fa fa-check',
  },
  assign: { roles: [1, 5, 11], path: '/assign/:id', component: Assign },

  mails: {
    roles: [5, 11],
    path: '/mails',
    component: Mails,
    nav: false,
    icon: 'mdi-email',
  },
  settings: {
    roles: [],
    path: '/settings',
    component: Settings,
    nav: false,
    icon: 'mdi-settings',
  },

  placements: {
    roles: [3, 5, 11],
    path: '/ads',
    component: Ads,
    nav: true,
    icon: 'mdi-animation',
  },
};

const isAllowed = (route, role) =>
  !route.roles.length || route.roles.includes(role);

export const RoleLink = ({
  to = '',
  className = '',
  react = true,
  id = '',
  children,
}) => {
  const context = useContext(AuthContext);
  const route = { ...appRoutes[to] };
  if (!Object.keys(route).length || !isAllowed(route, context.role))
    return <a className={className}>{children}</a>;
  route.path = pathPref + route.path;
  if (route.path.includes(':id')) route.path = route.path.replace(':id', id);
  if (react)
    return (
      <NavLink to={route.path} className={className}>
        {children}
      </NavLink>
    );
  return (
    <a href={route.path} className={className}>
      {children}
    </a>
  );
};

export const getRoutes = (role) =>
  Object.entries(appRoutes)
    .filter(([, route]) => isAllowed(route, role))
    .map(([key, route]) => {
      const r = { ...route };
      r.path = pathPref + route.path;
      r.translation = translatePref + key;
      return r;
    });

export const getNavs = (role) =>
  Object.entries(appRoutes)
    .filter(([, route]) => route.nav && isAllowed(route, role))
    .map(([key, route]) => {
      const r = { ...route };
      r.name = key;
      r.translation = translatePref + key;
      return r;
    });

// <Route path={"/dashboard/vehicle/:id"} component={Title({ component: FleetDetails, title: t('db.navbar.vehicleDetails') })}/>
// <Route path={"/dashboard/fleet"} component={Title({ component: Fleet, title: t('db.navbar.vehicles') })}/>
// <Route path={"/dashboard/ads"} component={Title({ component: Ads, title: 'Placements' })}/>
// <Route path={"/dashboard/client/:id"} component={Title({ component: ClientDetails, title: t('db.navbar.clientDetails') })}/>
// <Route path={"/dashboard/clients"} component={Title({ component: Clients, title: 'Clients' })}/>
// { [5,11].includes(context.role) && <Route path={"/dashboard/sales"} component={Title({ component: Sales, title: t('db.navbar.sales') })}/>}
// <Route path={"/dashboard/settings"} component={Title({ component: Settings, title: t('db.navbar.settings')})}/>
// <Route path={"/dashboard/campaign/:id"} component={Title({ component: CampaignDetails, title: t('db.navbar.campaignDetails')})}/>
// <Route path={"/dashboard/campaigns"} component={Title({ component: Campaigns, title: t('db.navbar.campaigns') })}/>
// <Route path={"/dashboard/user/:id"} component={Title({ component: UserDetails, title: t('db.navbar.userDetails')})}/>
// { [5,11].includes(context.role) && <Route path={"/dashboard/users/mails"} component={Title({ component: Mails, title: t('db.navbar.mails')})}/>}
// { [5,11].includes(context.role) && <Route path={"/dashboard/users"} component={Title({ component: Users, title: t('db.navbar.users') })}/>}
// { [1,5,11].includes(context.role) && <Route path={"/dashboard/teams"} component={Title({ component: Teams, title: t('db.navbar.teams') })}/>}
// { [1,5,11].includes(context.role) && <Route path={"/dashboard/team/:id"} component={Title({ component: Team, title: t('db.navbar.team') })}/>}
// { [1,5,11].includes(context.role) && <Route path={"/dashboard/team/:id"} component={Title({ component: Team, title: t('db.navbar.team') })}/>}
// <Route path={"/dashboard/general"} component={Title({ component: General, title: t('db.navbar.general') })}/>
