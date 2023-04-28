import React, {Component}  from 'react';
import queryRequest from "../../../utils/queryRequest";

import AuthContext from "../../../context/auth-context";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import Swal from 'sweetalert2';

import { translate } from 'react-i18next';

const removeImg = async (id, reload, t) => {
    const query = `mutation{ pictureDelete(id:"${id}")}`;
    try {
        const { pictureDelete } = await queryRequest(query);
        if (pictureDelete) {
            Swal.fire({
                icon: 'success',
                title: t('i.image.remove.form.success.title'),
                showConfirmButton: false,
                timer: 1500
            });
            reload();
        }
        else
            Swal.fire({
                icon: 'error',
                title: t('i.image.remove.form.failed.title'),
                text: t('i.image.remove.form.failed.text'),
                showConfirmButton: false,
                timer: 1500
            });
    } catch (err) {
        console.log(err)
    }
}

const Img = translate()(({t, data, me, reload, openLB}) => {
    const splited = data.path.split('/');
    return (
        <Row className='pt-2 pb-2 border-bottom border-top font-xs'>
            <Col onClick={openLB} >
                <img src={data.thumbnail || data.path} alt='i' style={{maxHeight:60, maxWidth:73}}/>
            </Col>
            <Col className='align-self-center'>
                {splited[splited.length-1]}
            </Col>
            {data.user_id === me && <Col className='align-self-center'>
                <Button className='images' variant='danger' onClick={() => removeImg(data.id, reload, t)}>
                    {t('i.image.list.remove')}
                </Button>
            </Col>}
        </Row>
    )
});

class Images extends Component {
    state = {
        images: [],
        index: 0,
        lightbox: false
    };

    static contextType = AuthContext;
    controller = new AbortController();

    componentWillUnmount() {
        this.controller.abort();
    }

    componentDidMount() {
        this.loadImages()
    }

    loadImages = async () => {
        const query = `query{campaignPictures(_id:"${this.props.id}"){ id path thumbnail user_id }}`;
        try {
            const { campaignPictures } = await queryRequest(query, this.controller.signal);
            this.setState({ images: campaignPictures})
        } catch (err) {
        }
    };

    openLightbox = (index) => {
        this.setState({lightbox: true, index})
    }

    render() {
        const { t } = this.props;
        const { images, index } = this.state;
        return (<Modal centered scrollable onHide={this.props.handleClose} keyboard={false} animation={true} show={true} className='text-center'>
            <Modal.Header style={{display:'unset', borderBottom: 'unset'}}>
                <Modal.Title>{t('i.image.campaign.title')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {images.length > 0 &&
                    <React.Fragment>
                        {images.map((i, index) => <Img key={i.path} openLB={() => this.openLightbox(index)} data={i} me={this.context._id} reload={this.loadImages}/>)}
                    </React.Fragment>
                }
                {images.length === 0 && <h5>{t('i.image.list.empty')}</h5>}
                {images.length > 0 && this.state.lightbox && <Lightbox
                    mainSrc={images[index].path}
                    nextSrc={images[(index + 1) % images.length].path}
                    prevSrc={images[(index + images.length - 1) % images.length].path}
                    onCloseRequest={() => this.setState({ lightbox: false })}
                    onMovePrevRequest={() => this.setState({index: (index + images.length - 1) % images.length,})}
                    onMoveNextRequest={() => this.setState({index: (index + 1) % images.length,})}
                />}
            </Modal.Body>
            <Modal.Footer style={{display:'unset', borderTop:'unset'}}>
                <Button className='w-sm' variant="success" onClick={this.props.handleClose}>{t('i.image.list.close')}</Button>
            </Modal.Footer>
        </Modal>)
    }
}
export default translate()(Images);
