import React, { Component } from "react";
import queryRequest from "../../../utils/queryRequest";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { RoleLink } from "../routes";
import Swal from "sweetalert2";
import et from "date-fns/locale/et";

import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { FullView, TitleContainer } from './CampaignTool.styles';
import AuthContext from "../../../context/auth-context";

import { translate } from "react-i18next";

registerLocale("et", et);

const Place = (props) => {
  return (
    <Col sm={6} md={6} lg={4} xl={6}>
      <label className="mb-0">{props.label}</label>
      <InputGroup className="mb-3 place-field">
        <InputGroup.Prepend>
          <Button
            variant="primary"
            onClick={(e) => props.doButtonPress(e, -10)}
          >
            -
          </Button>
        </InputGroup.Prepend>
        <FormControl
          type="text"
          value={props.value}
          onChange={props.doChange}
        />
        <InputGroup.Append>
          <Button variant="primary" onClick={(e) => props.doButtonPress(e, 10)}>
            +
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Col>
  );
};

class CampaignTool extends Component {
  state = {
    campaign: {
      _id: "",
      name: "",
      client: "",
      budget: "",
      priority: false,
      cities_selected: [],
      places: {},
      start_date: new Date(),
      end_date: new Date(),
      contactEmail: "",
    },
    places: [],
    clients: [],
    cities: [],
  };

  static contextType = AuthContext;

  empty = { ...this.state.campaign };
  controller = new AbortController();

  componentDidMount() {
    this.initialLoad();
  }

  componentWillUnmount() {
    this.controller.abort();
  }

  componentWillReceiveProps(props) {
    this.setState({ campaign: { ...this.empty, places: {} } });

    if (props.selected) {
      this.loadCampaignData(props.selected);
    }
  }
  loadCampaignData = async (id) => {
    console.log(id);
    const query = `query{campaign(_id:"${id}"){name client{_id email}creator{_id}budget cities{_id}placements{place{_id}count}endDate startDate priority}}`;

    try {
      const { campaign } = await queryRequest(query, this.controller.signal);

      if (!campaign.cities) {
        console.log("No cities defined");
        return;
      }
      if (!campaign.client) {
        console.log("No client defined");
        return;
      }
      const email = campaign.client.email;
      campaign.cities_selected = campaign.cities.map((city) => {
        return this.state.cities.find(
          (citySelection) => citySelection.value === city._id
        );
      });
      campaign.client = this.state.clients.find(
        (client) => client.value === campaign.client._id
      );
      delete campaign.cities;
      campaign.places = {};
      campaign.placements.forEach((placement) => {
        campaign.places[placement.place._id] = placement.count;
      });
      delete campaign.placements;

      campaign.end_date = new Date(parseInt(campaign.endDate));
      campaign.start_date = new Date(parseInt(campaign.startDate));

      delete campaign.endDate;
      delete campaign.startDate;
      delete campaign.placements;

      this.setState({
        campaign: { ...campaign, _id: id, contactEmail: email },
      });
    } catch (err) {
      console.log("Error finding user", err.toString());
    }
  };

  initialLoad = async () => {
    const query = `query{cities{ _id name } places{ _id name } clients{ _id company }}`;

    try {
      const { cities, clients, places } = await queryRequest(
        query,
        this.controller.signal
      );

      this.setState({
        places,
        clients: clients.map((client) => {
          return { value: client._id, label: client.company };
        }),
        cities: cities.map((city) => {
          return { value: city._id, label: city.name };
        }),
      });
    } catch (err) {
      console.log("Error while loading", err.toString());
    }
  };
  handleDelete = async () => {
    const { t } = this.props;

    const query = `mutation{campaignHardDelete(_id:"${this.state.campaign._id}")}`;
    Swal.fire({
      title: t("db.campaign.form.delete.warning.title"),
      text: t("db.campaign.form.delete.warning.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (!result.value) return;
      try {
        const { campaignHardDelete } = await queryRequest(
          query,
          this.controller.signal
        );
        if (campaignHardDelete) {
          Swal.fire({
            icon: "success",
            title: t("db.campaign.form.delete.success.title"),
            showConfirmButton: false,
            timer: 1500,
          });
          this.setState({
            campaign: {
              _id: "",
              name: "",
              client: "",
              budget: "",
              cities_selected: [],
              places: {},
              start_date: new Date(),
              end_date: new Date(),
              contactEmail: "",
            },
          });
          this.props.doRefresh();
        } else {
          Swal.fire({
            icon: "error",
            title: t("db.campaign.form.delete.failed.title"),
            text: t("db.campaign.form.delete.failed.text"),
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (err) {
        console.log("Error while loading", err.toString());
      }
    });
  };

  handleShare = async (e) => {
    e.preventDefault();
    const { t } = this.props;
    const def = this.state.campaign.contactEmail || "";
    Swal.fire({
      title: t("db.campaign.form.share.title"),
      input: "text",
      inputValue: def,
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Share",
      showLoaderOnConfirm: true,
      preConfirm: (email) => {
        return (async () => {
          const query = `mutation{campaignShare(_id:"${this.state.campaign._id}", email:"${email}")}`;

          try {
            const { campaignShare } = await queryRequest(
              query,
              this.controller.signal
            );
            if (campaignShare) return campaignShare;
            Swal.showValidationMessage(`Invalid input`);
          } catch (err) {
            console.log("Error", err);
            Swal.showValidationMessage(`Invalid request`);
          }
        })();
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          icon: "success",
          title: t("db.campaign.form.share.title"),
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  handleSubmit = async (evt) => {
    evt.preventDefault();
    const {
      _id,
      name,
      client,
      budget,
      start_date,
      end_date,
      cities_selected,
      places,
      priority,
    } = this.state.campaign;
    const { t } = this.props;

    if (!cities_selected || cities_selected.length <= 0) {
      Swal.fire({
        icon: "error",
        title: t("db.campaign.form.submit.invalid.city.title"),
        text: t("db.campaign.form.submit.invalid.city.text"),
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    let havePlace = false;
    let placesSave = [];
    Object.keys(places).forEach((key) => {
      const value = this.state.campaign.places[key];
      if (!value || parseInt(value) === 0) return;
      havePlace = true;
      placesSave.push(`{ place: "${key}", count: ${parseInt(value)}}`);
    });
    if (!havePlace) {
      Swal.fire({
        icon: "error",
        title: t("db.campaign.form.submit.invalid.places.title"),
        text: t("db.campaign.form.submit.invalid.places.text"),
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }
    placesSave = `[${placesSave.join(",")}]`;

    const query = _id
      ? `mutation{campaignUpdate(_id:"${_id}",name:"${name}",client:"${
          client.value
        }",budget:${budget},priority: ${
          priority ? "true" : "false"
        },cities:${JSON.stringify(
          cities_selected.map((city) => city.value)
        )},startDate:"${start_date.getTime()}",endDate:"${end_date.getTime()}",places:${placesSave}) { _id }}`
      : `mutation{campaignCreate(name:"${name}",client:"${
          client.value
        }",budget:${budget},priority:${
          priority ? "true" : "false"
        },cities:${JSON.stringify(
          cities_selected.map((city) => city.value)
        )},startDate:"${start_date.getTime()}",endDate:"${end_date.getTime()}",places:${placesSave}) { _id }}`;

    try {
      let data;
      if (_id) {
        const { campaignUpdate } = await queryRequest(
          query,
          this.controller.signal
        );
        data = campaignUpdate;
      } else {
        const { campaignCreate } = await queryRequest(
          query,
          this.controller.signal
        );
        data = campaignCreate;
      }

      if (!data) {
        Swal.fire({
          icon: "error",
          title: this.state.campaign._id
            ? t("db.campaign.form.submit.invalid.update")
            : t("db.campaign.form.submit.invalid.create"),
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: this.state.campaign._id
          ? t("db.campaign.form.submit.success.update")
          : t("db.campaign.form.submit.success.create"),
        showConfirmButton: false,
        timer: 1500,
      });
      this.setState({
        campaign: {
          _id: "",
          name: "",
          client: "",
          budget: "",
          cities_selected: [],
          places: {},
          start_date: new Date(),
          end_date: new Date(),
          contactEmail: "",
        },
      });
      this.props.doRefresh();
    } catch (err) {
      console.log("Fetch failed: ", err.toString());
    }
  };

  handleCityChange = (selected) => {
    this.state.campaign.cities_selected = selected;
    this.setState({ campaign: this.state.campaign });
  };

  handleClientChange = (selected) => {
    this.state.campaign.client = selected;
    this.setState({ campaign: this.state.campaign });
  };

  handleStart = (date) => {
    this.state.campaign.start_date = date;
    this.setState({ campaign: this.state.campaign });
  };

  handleEnd = (date) => {
    this.state.campaign.end_date = date;
    this.setState({ campaign: this.state.campaign });
  };

  handleBudgetChange = (evt) => {
    this.state.campaign.budget = evt.target.value;
    this.setState({ campaign: this.state.campaign });
  };

  handleNameChange = (evt) => {
    this.state.campaign.name = evt.target.value;
    this.setState({ campaign: this.state.campaign });
  };
  handlePriorityChange = (e) => {
    this.state.campaign.priority = e.target.checked;
    this.setState({ campaign: this.state.campaign });
  };

  handlePlaceButtonPress = (e, place, count) => {
    e.preventDefault();
    const now = this.state.campaign.places[place]
      ? parseInt(this.state.campaign.places[place])
      : 0;
    const sum = now + count;
    this.state.campaign.places[place] = sum > 0 ? sum : 0;
    this.setState({ campaign: this.state.campaign });
  };
  handlePlaceCountChange = (e, place) => {
    if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
      this.state.campaign.places[place] = e.target.value;
      this.setState({ campaign: this.state.campaign });
    }
  };
  handlePlaceGetCount = (id) => {
    if (!(id in this.state.campaign.places)) return "";
    return this.state.campaign.places[id];
  };

  render() {
    const { t } = this.props;
    return (
      <Col xl={4}>
        <Card className="m-b-20">
          <Card.Body>
            <h4>
              {this.state.campaign._id ? (
                <TitleContainer>
                  {t('db.campaign.form.title')}
                  <FullView >
                    <RoleLink
                      to="campaign"
                      id={this.state.campaign._id}
                      className="btn btn-block btn-primary waves-effect waves-light"
                    >
                      {t('db.campaign.form.button.fullView')}
                    </RoleLink>
                  </FullView>
                </TitleContainer>
              ) : (
                t('db.campaign.form.title.new')
              )}
            </h4>

            <Form onSubmit={this.handleSubmit}>
              <Form.Group className="form-group">
                <Form.Label className="mb-0">
                  {t('db.campaign.form.name')}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={this.state.campaign.name}
                  onChange={this.handleNameChange}
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="mb-0">
                  {t('db.campaign.form.client')}
                </Form.Label>
                <Select
                  value={this.state.campaign.client}
                  onChange={this.handleClientChange}
                  options={this.state.clients}
                  required
                />
              </Form.Group>

              <Row>
                <Col>
                  <div>
                    <label className="mb-0">
                      {t('db.campaign.form.startDate')}
                    </label>
                  </div>
                  <DatePicker
                    className="form-control"
                    selected={this.state.campaign.start_date}
                    onSelect={this.handleStart}
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                </Col>
                <Col className="text-right">
                  <div>
                    <label className="mb-0">
                      {t('db.campaign.form.endDate')}
                    </label>
                  </div>
                  <DatePicker
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    selected={this.state.campaign.end_date}
                    onSelect={this.handleEnd}
                    required
                  />
                </Col>
              </Row>

              <Form.Group>
                <Form.Label className="mb-0">
                  {t('db.campaign.form.cities')}
                </Form.Label>
                <Select
                  value={this.state.campaign.cities_selected}
                  onChange={this.handleCityChange}
                  options={this.state.cities}
                  isMulti={true}
                  required
                />
              </Form.Group>

              {/* {this.state.campaign._id && <Map data={this.getMapData()} />} */}

              <Row>
                {this.state.places &&
                  this.state.places.map((place) => {
                    return (
                      <Place
                        key={place._id}
                        value={this.handlePlaceGetCount(place._id)}
                        label={place.name}
                        doButtonPress={(e, count) =>
                          this.handlePlaceButtonPress(e, place._id, count)
                        }
                        doChange={(e) =>
                          this.handlePlaceCountChange(e, place._id)
                        }
                      />
                    );
                  })}
              </Row>

              <Row>
                <Col sm={6}>
                  <label className="mb-0">{t('db.campaign.form.budget')}</label>
                  <Form.Group className="input-group mb-3">
                    <FormControl
                      type="text"
                      value={this.state.campaign.budget}
                      onChange={(evt) => this.handleBudgetChange(evt)}
                      required
                    />

                    <InputGroup.Append>
                      <span className="input-group-text">€</span>
                    </InputGroup.Append>
                  </Form.Group>
                </Col>
                <Col>
                  <label className="mb-0">
                    {t('db.campaign.form.priority')}
                  </label>
                  <Form.Group className="input-group mb-3">
                    <input
                      type="checkbox"
                      id="priority"
                      switch="danger"
                      checked={this.state.campaign.priority}
                      onChange={this.handlePriorityChange}
                    />
                    <label
                      htmlFor="priority"
                      data-on-label={t('db.campaign.form.priority.on')}
                      data-off-label={t('db.campaign.form.priority.off')}
                      className="mt-1"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {this.state.campaign._id ? (
                <Row>
                  <Col sm={12} className="text-right">
                    <button
                      className="btn btn-block btn-warning waves-effect waves-light"
                      onClick={this.handleShare}
                    >
                      {t('db.campaign.form.button.share')}
                    </button>
                  </Col>
                </Row>
              ) : null}

              <Row className="mt-2">
                <Col>
                  <button
                    type="submit"
                    className="btn btn-success btn-block waves-effect waves-light"
                  >
                    {this.state.campaign._id
                      ? t('db.campaign.form.button.update')
                      : t('db.campaign.form.button.create')}
                  </button>
                </Col>
                {this.state.campaign._id &&
                  [5, 11].includes(this.context.role) && (
                    <Col>
                      <Button
                        variant="danger"
                        onClick={this.handleDelete}
                        block
                        className="waves-effect waves-light"
                      >
                        {t('db.campaign.form.button.delete')}
                      </Button>
                    </Col>
                  )}
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    );
  }
}

export default translate()(CampaignTool);
