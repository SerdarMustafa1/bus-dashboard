import React, {useContext, useState} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';

import { translate } from 'react-i18next';
import ProgressBar from "react-bootstrap/ProgressBar";
import ImagesView from "./uploadImage";
import AuthContext from "../../../context/auth-context";

import Swal from 'sweetalert2';

const uploadImage = async (t, campaign_id, file) => {
    let token;

    if (sessionStorage.getItem("_t")) {
        token = sessionStorage.getItem("_t")
    } else if (localStorage.getItem("_t")) {
        token = localStorage.getItem("_t")
    }
    const fd = new FormData();
    fd.append('campaign_id', campaign_id);
    fd.append('img', file);

    Swal.fire({
        title: 'Uploading image...',
        text: 'Please wait',
        timerProgressBar: true,
        onBeforeOpen: async () => {
            Swal.showLoading();
            Swal.close(await fetch("/api/upload/picture", {
                method: "POST",
                body: fd,
                headers: {
                    "Authorization": token ? `Bearer ${token}`:"",
                }
            }));
        }
    }).then((result) => {
        if (result.status === 200)
            Swal.fire({ icon: 'success',
                title: t('i.image.uploading.success.title'),
                text: t('i.image.uploading.success.text'),
                showConfirmButton: false, timer: 1500
            })

        else
            Swal.fire({icon: 'error',
                title: t('i.image.uploading.failed.title'),
                text: t('i.image.uploading.failed.text'),
                showConfirmButton: false, timer: 1500
            });
    })

};

const SearchAndTriggerNav = translate()(({t, mt, onSubmit, value, onChange,placeholder, trigger}) => {
    return (
        <Navbar fixed='top' className='pl-1 pr-1 pb-0 navbar-container'>
            <Container>
                <Row className='pl-1 pr-2'>
                    <Col>
                        <form onSubmit={onSubmit}>
                            <InputGroup>
                                <FormControl placeholder={t(placeholder)} value={value} onChange={onChange}/>
                                <InputGroup.Append>
                                    <Button variant="outline-secondary" type="submit">
                                        <i className="fa fa-search"/>
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </form>
                    </Col>
                    <Col xs={3}>
                        {trigger && <React.Fragment>
                            <input type="checkbox" id='h' switch={trigger.type} checked={trigger.value}
                                   onChange={trigger.click}/>
                            <label htmlFor='h' data-on-label={t(trigger.on)} data-off-label={t(trigger.off)}
                                   style={{marginTop: 7, marginBottom:0}}/>
                        </React.Fragment>}
                    </Col>
                </Row>
            </Container>
        </Navbar>
    )
});

const CampaignNav = translate()(({t, onSubmit, mt, placeholder, value, onChange, campaign}) => {
    const name = campaign.name;
    const start = new Date(parseInt(campaign.startDate));
    const end = new Date(parseInt(campaign.endDate));

    const placements = campaign.placements.map(pl => pl.count).reduce((a,b) => a+b,0);
    const installs = campaign.placements.map(pl => pl.installs.map(i => i.count).reduce((a,b) => a+b, 0) ).reduce((a,b) => a+b, 0);

    const [show, setState] = useState(false);
    let uploadBtn;
    return (
        <Navbar fixed='top' className='pl-1 pr-1 navbar-container'>
            <Container className="text-center text-white" style={{lineHeight:0.9}}>
                {!!onSubmit && <Row className='pl-1 pr-2'>
                    <Col>
                        <form onSubmit={onSubmit}>
                            <InputGroup>
                                <FormControl placeholder={t(placeholder)} value={value} onChange={onChange}/>
                                <InputGroup.Append>
                                    <Button variant="outline-secondary" type="submit">
                                        <i className="fa fa-search"/>
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </form>
                    </Col>
                </Row>}
                <h5 className="m-0 mb-1">{name}</h5>
                <Row>
                    <Col>
                        <Row>
                            <Col>
                                <strong>{start.getDate()} {t('month.'+start.getMonth())}</strong>
                                <div className='description'>{t('i.campaign.startDate')}</div>
                            </Col>

                            <Col>
                                <strong>{end.getDate()} {t('month.'+end.getMonth())}</strong>
                                <div className='description'>{t('i.campaign.endDate')}</div>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <strong>{installs}/{placements}</strong>
                        <div className='description'>{t('i.campaign.placements')}</div>
                    </Col>
                </Row>
                <ProgressBar className='campaign-progress' variant='warning' now={installs * 100 / placements}/>
                <Row className='campaign-images mt-2'>
                    <Col onClick={() => setState(true)}>
                        <i className="fa fa-th-list"/>
                    </Col>
                    <Col>
                        <i className="ion ion-images" onClick={() => uploadBtn.click()}/>
                        <input hidden type="file" name="file" ref={input => uploadBtn = input} onChange={(e) => uploadImage(t, campaign._id,e.target.files[0])}/>
                    </Col>
                </Row>
            </Container>
            {show && <ImagesView id={campaign._id} handleClose={() => setState(false)}/>}
        </Navbar>
    )
});

const HomeNav = translate()(({t, i18n, placeholder, onSubmit, onChange, value}) => {
    const context = useContext(AuthContext);
    return (
        <Navbar fixed='top' style={{justifyContent:'space-between'}}>
            <NavDropdown title={i18n.language.toUpperCase()} className='lang' id='install-navbar'>
                { i18n.validLangs.map(({short, name}) =>
                    <NavDropdown.Item key={short} onClick={() => i18n.changeLanguage(short)}>{name}</NavDropdown.Item>
                    )}
            </NavDropdown>

            <form onSubmit={onSubmit} style={{maxWidth:'150px'}}>
                <InputGroup className="p-1">
                    <FormControl placeholder={t(placeholder)} value={value} onChange={onChange}/>
                    <InputGroup.Append>
                        <Button variant="outline-secondary" type="submit">
                            <i className="fa fa-search"/>
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
            </form>

            <Button variant="primary" onClick={context.logout}>
                <i className="dripicons-exit"/> Logout
            </Button>
        </Navbar>)
});

export {
    CampaignNav,
    SearchAndTriggerNav,
    HomeNav
};
