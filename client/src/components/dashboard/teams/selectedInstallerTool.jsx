import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Swal from "sweetalert2";

import { translate } from 'react-i18next';

class TeamsTool extends Component {

    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    handleDelete = async () => {
        const { t } = this.props;
        const query = `mutation{installerRemove(_id:"${this.props.selected._id}")}`;

        Swal.fire({
            title: t('db.installer.form.delete.warning.title'),
            text: t('db.installer.form.delete.warning.text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (!result.value) return;
            try {
                const { installerRemove } = await queryRequest(query, this.controller.signal);
                if (installerRemove) {
                    Swal.fire({
                        icon: 'success',
                        title: t('db.installer.form.delete.success.title'),
                        showConfirmButton: false,
                        timer: 1500
                    });
                    this.props.doRefresh();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: t('db.installer.form.delete.failed.title'),
                        text: t('db.installer.form.delete.failed.text'),
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            } catch (err) {
                console.log("Error while loading", err.toString());
            }
        });
    };

    render() {
        const { t } = this.props;
        return (
                <Card className="m-b-20">
                    <Card.Body>
                        <h4>{t('db.installer.form.title')}</h4>
                        <h6>{t('db.installers.table.name')}: {this.props.selected.name}</h6>
                        <Row>
                            <Col>
                                <Button onClick={this.handleDelete} block variant="primary" type="submit" className="waves-effect waves-light">
                                    {t('db.installer.form.button.remove')}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>);
    }
}

export default translate()(TeamsTool);
