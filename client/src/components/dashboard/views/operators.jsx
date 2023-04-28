import React, { Component, useState } from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import queryRequest from "../../../utils/queryRequest";

import {translate} from 'react-i18next';


const CityAccordion = translate()(({t, data, doChange}) => {
    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle as={Row} variant="link" eventKey={data._id}>
                    <Col xs={12} sm={6}>{data.name}</Col>
                    <Col className='align-self-end text-right text-secondary font-md' >
                        {t('db.operators.vehicles')} {data.operatorsAll.map(op => op.vehicles.length).reduce((a,b) => a+b, 0)} | {t('db.operators.operators')} {data.operatorsAll.length}
                    </Col>
                </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={data._id}>
                <React.Fragment>
                    {data.operatorsAll.map(op => <OperatorAccordion key={op._id} data={op} doChange={doChange} />)}
                </React.Fragment>
            </Accordion.Collapse>
        </Card>)
})

const OperatorToggle = translate()(({t, eventKey, data, doChange}) => {
    const decOnClick = useAccordionToggle(eventKey);

    const [company, setCompany] = useState(data.company || '');
    const [edit, setEdit] = useState(false);

    const query = `mutation{operatorUpdate(_id:"${data._id}",company:"${company}"){_id}}`;

    return (<Row>
            <Col sm={12} md={6} className='ml-3'>
                {edit &&
                <InputGroup>
                    <FormControl value={company} onChange={(e) => setCompany(e.target.value)} type='text'/>
                    <InputGroup.Append>
                        {company !== data.company && <Button variant='primary' onClick={() => {
                            doChange(query, cb => setEdit(false));
                        }}>
                            <i className='fa fa-paper-plane'/></Button>}
                        <Button variant='outline-danger' onClick={() => {
                            setEdit(false);
                            setCompany(data.company || '')
                        }}>
                            <i className='fa fa-close'/>
                        </Button>
                    </InputGroup.Append>

                </InputGroup>}
                {!edit && <React.Fragment>
                    <a href='#' className='' onClick={(e) => {
                        e.preventDefault();
                        decOnClick(e);
                    }}>{data.company || data.operatorId}</a>
                    <a href='#' onClick={(e) => {
                        e.preventDefault();
                        setEdit(true)
                    }} className='fa fa-edit font-md ml-1'/>
                </React.Fragment>}
            </Col>
            <Col className='align-self-end text-right text-secondary font-md'>
                {t('db.operators.vehicles')} {data.vehicles.length}
            </Col>
        </Row>)
})

const OperatorAccordion = translate()(({t, data, doChange}) => {
   return (<Accordion>
       <Card className={data.listed ? 'operator-active': data.visible? 'operator-visible':'operator-disabled'}>
           <Card.Header>
               <OperatorToggle eventKey={data._id} data={data} doChange={doChange}/>
           </Card.Header>
           <Accordion.Collapse eventKey={data._id}>
               <Card.Body className='font-md'>
                   <Form>
                       <Form.Group as={Row} className='mb-0'>
                           <Form.Label column sm="2">
                               {t('db.operators.listed')}
                           </Form.Label>
                           <Col sm="10">
                               <input onChange={()=>{
                                   console.log('yep');
                                   doChange(`mutation{operatorUpdate(_id:"${data._id}",listed:${!data.listed}){_id}}`)
                               }} type="checkbox" id={data._id + 's'} switch='primary' checked={data.listed}/>
                               <label htmlFor={data._id + 's'} className='mb-0' data-on-label={t('db.operators.switch.yes')} data-off-label={t('db.operators.switch.no')}/>
                           </Col>
                       </Form.Group>

                       <Form.Group as={Row} >
                           <Form.Label column sm="2">
                               {t('db.operators.visible')}
                           </Form.Label>
                           <Col sm="10">
                               <input disabled={data.listed} onChange={()=>{
                                   console.log('nope')
                                   doChange(`mutation{operatorUpdate(_id:"${data._id}",visible:${!data.visible}){_id}}`)
                               }} type="checkbox" id={data._id + 'd'} switch={data.listed?"default":'primary'} checked={data.visible}/>
                               <label htmlFor={data._id + 'd'} className='mb-0' data-on-label={t('db.operators.switch.yes')} data-off-label={t('db.operators.switch.no')}/>
                           </Col>
                       </Form.Group>
                   </Form>
                   <Row>
                       <Col>
                           {t('db.operators.placements')} {data.vehicles.map(v => v.totalAds).reduce((a,b) => a+b, 0)}
                       </Col>
                   </Row>
               </Card.Body>
           </Accordion.Collapse>
       </Card>
   </Accordion>)
});

class Operators extends Component {
    state = {
        cities: [],
        loaded: false
    }

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        this.loadCityOperators();
    }

    loadCityOperators = async () => {
        const query = `query{cities{_id name operatorsAll{_id operatorId company vehicles{totalAds} listed visible}}}`;

        try {
            const {cities} = await queryRequest(query, this.controller.signal, this.props.token);
            this.setState({cities: cities || [] ,loaded: true});
        } catch (err) {
            console.log("Ohnoo, ", err.toString());
            this.setState({loaded: true});
        }
    }
    handleOperatorChange = async (query, cb) => {
        try {
            await queryRequest(query, this.controller.signal, this.props.token);
            if (cb) cb();
            //Todo: SWAL2 Success
            this.loadCityOperators();
        } catch (err) {
            console.log("Ohnoo, ", err.toString());
            //Todo: SWAL2 Error
        }
    }

    render() {
        const { t } = this.props;

        return (
            <div className="container-fluid">
                <h3 className="text-white border-bottom mb-4">
                    {t('db.operators.title')}
                </h3>

                {this.state.loaded && <Accordion>
                    {this.state.cities.map(city => <CityAccordion key={city._id} data={city} doChange={this.handleOperatorChange}/>)}
                </Accordion>}
            </div>
        );
    }
}

export default translate()(Operators);