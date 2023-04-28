import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { translate } from 'react-i18next';
import Select from "react-select";

class TeamsTool extends Component {
    state = {
        options: [],
        selected: {}
    };
    controller = new AbortController();

    componentDidMount() {
        this.loadInstallers();
    }
    componentWillUnmount() {
        this.controller.abort();
    }

    async loadInstallers() {
        const query = `query{ installersValid { _id name }}`;
        try {
            const {installersValid} = await queryRequest(query, this.controller.signal);
            if (installersValid) this.setState({options: installersValid.map(u =>{ return {value:u._id, label:u.name } }) })
        } catch (err) {
            console.log("Fetch failed: ", err.toString());
        }
    }

    async handleSubmit(evt) {
        evt.preventDefault();
        const query = `mutation{installerCreate(team:"${this.props.team}", user:"${this.state.selected.value}"){ _id }}`;
        try {
            const {installerCreate} = await queryRequest(query, this.controller.signal);
            if (installerCreate) {
                this.setState({selected:{}});
                this.loadInstallers();
                this.props.doRefresh();
            }
        } catch (err) {
            console.log(err);
        }
    }

    handleInstallerChange = selected => {
        this.setState({selected});
    };

    render() {
        const { t } = this.props;
        return (
                <Card className="m-b-20">
                    <Card.Body>
                        <h4>{t('db.installer.form.title.new')}</h4>
                        <Form onSubmit={evt => this.handleSubmit(evt)}>
                            <Form.Group>
                                <Form.Label className="mb-0">{t('db.installer.form.installer')}</Form.Label>
                                <Select
                                    value={this.state.selected}
                                    onChange={this.handleInstallerChange}
                                    options={this.state.options}
                                    required/>
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Button block variant="primary" type="submit" className="waves-effect waves-light">
                                        {t('db.installer.form.button.add')}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>
        );
    }
}

export default translate()(TeamsTool);
