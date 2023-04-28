import React, { useState, useContext } from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Title from '../components/dashboard/all/title';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import { translate } from 'react-i18next';
import AuthContext from '../context/auth-context';

import CampaignsList from '../components/installation/views/campaignsList';
import History from '../components/installation/views/history';

import ByCampaign from '../components/installation/views/byCampaign';
import ByFleet from '../components/installation/views/byFleet';
import PlacementViewFleet from '../components/installation/views/placementViewFleet';

import queryRequest from '../utils/queryRequest';
import Button from 'react-bootstrap/Button';

const getInstallerId = async (setInstaller) => {
  const query = `query{ installerMe{ _id }}`;
  try {
    const { installerMe } = await queryRequest(query);
    if (installerMe) setInstaller(installerMe);
    else setInstaller(null);
  } catch (err) {
    setInstaller(null);
  }
};

export default translate()(({ t }) => {
  const [intaller, setInstaller] = useState('');

  if (intaller === null) {
    const context = useContext(AuthContext);
    return (
      <Container className="mt-5">
        <Card>
          <Card.Body className="text-center">
            <h4 className="text-center">{t('i.noTeam')}</h4>
            <Button variant="primary" onClick={context.logout}>
              <i className="dripicons-exit" /> {t('i.logout')}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  if (intaller === '') {
    getInstallerId(setInstaller);
    return null;
  }

  return (
    <React.Fragment>
      <div style={{ marginBottom: 80 }}>
        {/*<Toolbar/>*/}

        <Switch>
          <Route
            path="/install/f/:vehicle/"
            component={Title({
              component: PlacementViewFleet,
              title: t('i.navbar.vehicle'),
            })}
          />
          <Route
            path="/install/f"
            component={Title({
              component: ByFleet,
              title: t('i.navbar.vehicles'),
            })}
          />
          <Route path="/install/c/:campaign" component={ByCampaign} />
          <Route
            path="/install/h"
            component={Title({
              component: History,
              title: t('i.navbar.history'),
            })}
          />
          <Route
            path="/install"
            component={Title({
              component: CampaignsList,
              title: t('i.navbar.campaigns'),
            })}
          />
        </Switch>
      </div>

      <Navbar fixed="bottom" className="navbar-container bg-main">
        <Container>
          <Row className="text-white text-center i-bot-nav">
            <Col xs={4}>
              <NavLink to="/install" exact>
                <i className="fa fa-home" />
              </NavLink>
            </Col>
            <Col xs={4}>
              <NavLink to="/install/f">
                <i className="fa fa-bus" />
              </NavLink>
            </Col>
            <Col xs={4}>
              <NavLink to="/install/h">
                <i className="fa fa-history" />
              </NavLink>
            </Col>
          </Row>
        </Container>
      </Navbar>
    </React.Fragment>
  );
});
