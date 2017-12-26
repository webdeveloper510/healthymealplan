import React from "react";
import PropTypes from "prop-types";

import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import { MenuItem } from "material-ui/Menu";
import Input from "material-ui/Input";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import Radio, { RadioGroup } from "material-ui/Radio";
import Geosuggest from "react-geosuggest";
import "./GeoSuggest.scss";

import Payment from "payment";

import Checkbox from "material-ui/Checkbox";
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText
} from "material-ui/Form";

import classNames from "classnames";
import { withStyles } from "material-ui/styles";
import { CircularProgress } from "material-ui/Progress";
import green from "material-ui/colors/green";

import _ from "lodash";
import $ from "jquery";
import validate from "../../../modules/validate";

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: "relative"
  },
  buttonSuccess: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700]
    }
  },
  fabProgress: {
    color: green[500],
    position: "absolute",
    top: -6,
    left: -6,
    zIndex: 1
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
});

class Step4Checkout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,
      paymentMethod: "card",
      dormName: "Algonquin College",
      dormResidence: "Algonquin College"
    };
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent()
        );
      },

      rules: {
        addressType: {
          required: true
        }
      },

      submitHandler() {
        component.handleSubmitStep();
      }
    });

    Payment.formatCardNumber(document.querySelector("#cardNumber"));
    Payment.formatCardExpiry(document.querySelector("#expiry"));
    Payment.formatCardCVC(document.querySelector("#cvc"));

    /*
    * The best way to refactor the below bill calculator is to separate it
    * into a billing module which can be imported here instead.
    */

    const primaryCustomer = {
      lifestyle: "",
      breakfastPrice: 0,
      lunchPrice: 0,
      dinnerPrice: 0,
      breakfast: {
        totalQty: 0,
        regularQty: 0,
        athleticQty: 0,
        bodybuilderQty: 0
      },
      lunch: {
        totalQty: 0,
        regularQty: 0,
        athleticQty: 0,
        bodybuilderQty: 0
      },
      dinner: {
        totalQty: 0,
        regularQty: 0,
        athleticQty: 0,
        bodybuilderQty: 0
      },
      discount: this.props.customerInfo.discount,
      discountActual: 0,
      restrictions: this.props.customerInfo.restrictions,
      restrictionsActual: [],
      restrictionsSurcharges: [],
      specificRestrictions: this.props.customerInfo.specificRestrictions,
      specificRestrictionsActual: [],
      specificRestrictionsSurcharges: [],
      preferences: this.props.customerInfo.preferences,
      total: 0
    };

    const secondaryCustomers = [];

    primaryCustomer.lifestyle = this.props.lifestyles.find(
      elem => elem.title === this.props.customerInfo.lifestyle
    );

    // calculating basePrices for Breakfast, lunch and dinner
    const numberOfProfiles = this.props.customerInfo.secondaryProfileCount;

    primaryCustomer.breakfastPrice =
      primaryCustomer.lifestyle.prices.breakfast[numberOfProfiles];

    primaryCustomer.lunchPrice =
      primaryCustomer.lifestyle.prices.lunch[numberOfProfiles];

    primaryCustomer.dinnerPrice =
      primaryCustomer.lifestyle.prices.dinner[numberOfProfiles];

    // calculating total quantities and extra quantities and regular quantites
    this.props.customerInfo.scheduleReal.forEach((e, i) => {
      if (e.breakfast.active) {
        primaryCustomer.breakfast.totalQty =
          primaryCustomer.breakfast.totalQty +
          parseInt(e.breakfast.quantity, 10);

        if (e.breakfast.portions == "regular") {
          primaryCustomer.breakfast.regularQty += parseInt(
            e.breakfast.quantity,
            10
          );
        } else if (e.breakfast.portions == "athletic") {
          primaryCustomer.breakfast.athleticQty += parseInt(
            e.breakfast.quantity,
            10
          );
        } else if ((e.breakfast.portions = "bodybuilder")) {
          primaryCustomer.breakfast.bodybuilderQty += parseInt(
            e.breakfast.quantity,
            10
          );
        }
      }

      if (e.lunch.active) {
        primaryCustomer.lunch.totalQty =
          primaryCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

        if (e.lunch.portions == "regular") {
          primaryCustomer.lunch.regularQty += parseInt(e.lunch.quantity, 10);
        } else if (e.lunch.portions == "athletic") {
          primaryCustomer.lunch.athleticQty += parseInt(e.lunch.quantity, 10);
        } else if ((e.lunch.portions = "bodybuilder")) {
          primaryCustomer.lunch.bodybuilderQty += parseInt(
            e.lunch.quantity,
            10
          );
        }
      }

      if (e.dinner.active) {
        primaryCustomer.dinner.totalQty =
          primaryCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

        if (e.dinner.portions == "regular") {
          primaryCustomer.dinner.regularQty += parseInt(e.dinner.quantity, 10);
        } else if (e.dinner.portions == "athletic") {
          primaryCustomer.dinner.athleticQty += parseInt(e.dinner.quantity, 10);
        } else if ((e.dinner.portions = "bodybuilder")) {
          primaryCustomer.dinner.bodybuilderQty += parseInt(
            e.dinner.quantity,
            10
          );
        }
      }
    });

    // total base price based on per meal type base price, (before restrictions and extras and discounts)
    primaryCustomer.baseMealPriceTotal =
      primaryCustomer.breakfast.totalQty * primaryCustomer.breakfastPrice +
      primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
      primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

    // discounted basePrice -- this is the actual base price to add up in the total

    if (primaryCustomer.discount == "senior") {
      let discountAmount = 0;

      if (primaryCustomer.lifestyle.discountOrExtraTypeSenior == "Percentage") {
        discountAmount =
          primaryCustomer.lifestyle.discountSenior /
          100 *
          primaryCustomer.baseMealPriceTotal;
      }

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeSenior == "Fixed amount"
      ) {
        discountAmount = primaryCustomer.lifestyle.discountSenior;
      }

      primaryCustomer.discountActual = discountAmount;
    }

    if (primaryCustomer.discount == "student") {
      let discountAmount = 0;

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeStudent == "Percentage"
      ) {
        discountAmount =
          primaryCustomer.lifestyle.discountStudent /
          100 *
          primaryCustomer.baseMealPriceTotal;
      }

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeStudent == "Fixed amount"
      ) {
        discountAmount = primaryCustomer.lifestyle.discountStudent;
      }

      primaryCustomer.discountActual = discountAmount;
    }

    // calculating restrictions and specificRestrictions surcharges
    if (primaryCustomer.restrictions.length > 0) {
      primaryCustomer.restrictions.forEach((e, i) => {
        primaryCustomer.restrictionsActual.push(
          this.props.restrictions.find(elem => elem._id === e)
        );
      });

      primaryCustomer.restrictionsActual.forEach((e, i) => {
        let totalRestrictionsSurcharge = 0;
        console.log(e);

        const totalBaseMealsCharge =
          primaryCustomer.breakfast.totalQty * primaryCustomer.breakfastPrice +
          primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
          primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

        if (e.discountOrExtraType == "Percentage") {
          totalRestrictionsSurcharge = e.extra / 100 * totalBaseMealsCharge;
        }

        if (e.discountOrExtraType == "Fixed amount") {
          totalRestrictionsSurcharge =
            (primaryCustomer.breakfast.totalQty +
              primaryCustomer.lunch.totalQty +
              primaryCustomer.dinner.totalQty) *
            e.extra;
        }

        primaryCustomer.restrictionsSurcharges.push(totalRestrictionsSurcharge);
      });
    }

    if (primaryCustomer.specificRestrictions.length > 0) {
      primaryCustomer.specificRestrictions.forEach((e, i) => {
        primaryCustomer.specificRestrictionsActual.push(
          this.props.ingredients.find(elem => elem._id === e)
        );
      });
    }

    // calculating athletic surcharge for all meals
    if (
      primaryCustomer.breakfast.athleticQty > 0 ||
      primaryCustomer.lunch.athleticQty > 0 ||
      primaryCustomer.dinner.athleticQty > 0
    ) {
      const totalAthleticSurcharge = 0;

      if (primaryCustomer.breakfast.athleticQty > 0) {
        if (
          primaryCustomer.lifestyle.discountOrExtraTypeAthletic == "Percentage"
        ) {
          const extraAthleticPerBreakfast =
            primaryCustomer.lifestyle.extraAthletic /
            100 *
            primaryCustomer.breakfastPrice;

          totalAthleticSurcharge +=
            primaryCustomer.breakfast.athleticQty * extraAthleticPerBreakfast;
        }

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
          "Fixed amount"
        ) {
          totalAthleticSurcharge +=
            primaryCustomer.breakfast.athleticQty *
            primaryCustomer.lifestyle.extraAthletic;
        }
      }

      if (primaryCustomer.lunch.athleticQty > 0) {
        if (
          primaryCustomer.lifestyle.discountOrExtraTypeAthletic == "Percentage"
        ) {
          const extraAthleticPerLunch =
            primaryCustomer.lifestyle.extraAthletic /
            100 *
            primaryCustomer.lunchPrice;

          totalAthleticSurcharge +=
            primaryCustomer.lunch.athleticQty * extraAthleticPerLunch;
        }

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
          "Fixed amount"
        ) {
          totalAthleticSurcharge +=
            primaryCustomer.lunch.athleticQty *
            primaryCustomer.lifestyle.extraAthletic;
        }
      }

      if (primaryCustomer.dinner.athleticQty > 0) {
        if (
          primaryCustomer.lifestyle.discountOrExtraTypeAthletic == "Percentage"
        ) {
          const extraAthleticPerDinner =
            primaryCustomer.lifestyle.extraAthletic /
            100 *
            primaryCustomer.dinnerPrice;

          totalAthleticSurcharge +=
            primaryCustomer.dinner.athleticQty * extraAthleticPerDinner;
        }

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
          "Fixed amount"
        ) {
          totalAthleticSurcharge +=
            primaryCustomer.breakfast.athleticQty *
            primaryCustomer.lifestyle.extraAthletic;
        }
      }

      primaryCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
    }

    // calculating bodybuilder surcharge for all meals
    if (
      primaryCustomer.breakfast.bodybuilderQty > 0 ||
      primaryCustomer.lunch.bodybuilderQty > 0 ||
      primaryCustomer.dinner.bodybuilderQty > 0
    ) {
      const totalBodybuilderSurcharge = 0;

      if (primaryCustomer.breakfast.bodybuilderQty > 0) {
        if (
          primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
          "Percentage"
        ) {
          const extraBodybuilderPerBreakfast =
            primaryCustomer.lifestyle.extraBodybuilder /
            100 *
            primaryCustomer.breakfastPrice;

          totalBodybuilderSurcharge +=
            primaryCustomer.breakfast.bodybuilderQty *
            extraBodybuilderPerBreakfast;
        }

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
          "Fixed amount"
        ) {
          totalBodybuilderSurcharge +=
            primaryCustomer.breakfast.athleticQty *
            primaryCustomer.lifestyle.extraBodybuilder;
        }
      }

      if (primaryCustomer.lunch.bodybuilderQty > 0) {
        const extraBodybuilderPerLunch =
          primaryCustomer.lifestyle.extraBodybuilder /
          100 *
          primaryCustomer.lunchPrice;

        totalBodybuilderSurcharge +=
          primaryCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
      }

      if (primaryCustomer.dinner.bodybuilderQty > 0) {
        const extraBodybuilderPerDinner =
          primaryCustomer.lifestyle.extraBodybuilder /
          100 *
          primaryCustomer.dinnerPrice;

        totalBodybuilderSurcharge +=
          primaryCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
      }

      primaryCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
    }

    console.log(primaryCustomer);

    // all of the above for all the secondary profiles
    if (this.props.customerInfo.secondaryProfileCount > 0) {
      this.props.customerInfo.secondaryProfiles.forEach((el, index) => {
        const currentCustomer = {
          lifestyle: "",
          breakfastPrice: 0,
          lunchPrice: 0,
          dinnerPrice: 0,
          breakfast: {
            totalQty: 0,
            regularQty: 0,
            athleticQty: 0,
            bodybuilderQty: 0
          },
          lunch: {
            totalQty: 0,
            regularQty: 0,
            athleticQty: 0,
            bodybuilderQty: 0
          },
          dinner: {
            totalQty: 0,
            regularQty: 0,
            athleticQty: 0,
            bodybuilderQty: 0
          },
          restrictions: [],
          specificRestrictions: [],
          total: 0
        };

        currentCustomer.lifestyle = this.props.lifestyles.find(
          elem => elem.title === el.lifestyle
        );

        const numberOfProfiles = this.props.customerInfo.secondaryProfiles
          .length;

        currentCustomer.breakfastPrice =
          currentCustomer.lifestyle.prices.breakfast[numberOfProfiles];

        currentCustomer.lunchPrice =
          currentCustomer.lifestyle.prices.lunch[numberOfProfiles];

        currentCustomer.dinnerPrice =
          currentCustomer.lifestyle.prices.dinner[numberOfProfiles];

        el.scheduleReal.forEach((e, i) => {
          if (e.breakfast.active) {
            currentCustomer.breakfast.totalQty =
              currentCustomer.breakfast.totalQty +
              parseInt(e.breakfast.quantity, 10);

            if (e.breakfast.portions == "regular") {
              currentCustomer.breakfast.regularQty += parseInt(
                e.breakfast.quantity,
                10
              );
            } else if (e.breakfast.portions == "athletic") {
              currentCustomer.breakfast.athleticQty += parseInt(
                e.breakfast.quantity,
                10
              );
            } else if ((e.breakfast.portions = "bodybuilder")) {
              currentCustomer.breakfast.bodybuilderQty += parseInt(
                e.breakfast.quantity,
                10
              );
            }
          }

          if (e.lunch.active) {
            currentCustomer.lunch.totalQty =
              currentCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

            if (e.lunch.portions == "regular") {
              currentCustomer.lunch.regularQty += parseInt(
                e.lunch.quantity,
                10
              );
            } else if (e.lunch.portions == "athletic") {
              currentCustomer.lunch.athleticQty += parseInt(
                e.lunch.quantity,
                10
              );
            } else if ((e.lunch.portions = "bodybuilder")) {
              currentCustomer.lunch.bodybuilderQty += parseInt(
                e.lunch.quantity,
                10
              );
            }
          }

          if (e.dinner.active) {
            currentCustomer.dinner.totalQty =
              currentCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

            if (e.dinner.portions == "regular") {
              currentCustomer.dinner.regularQty += parseInt(
                e.dinner.quantity,
                10
              );
            } else if (e.dinner.portions == "athletic") {
              currentCustomer.dinner.athleticQty += parseInt(
                e.dinner.quantity,
                10
              );
            } else if ((e.dinner.portions = "bodybuilder")) {
              currentCustomer.dinner.bodybuilderQty += parseInt(
                e.dinner.quantity,
                10
              );
            }
          }
        });

        secondaryCustomers.push(currentCustomer);
      });
    }

    this.setState({ primaryProfileBilling: primaryCustomer });
    this.setState({ secondaryProfilesBilling: secondaryCustomers });
  }

  handleSubmitStep() {
    console.log("Reached");

    this.setState({
      submitSuccess: false,
      submitLoading: true
    });

    const authData = {};
    authData.clientKey = Meteor.settings.public.clientKey;
    authData.apiLoginID = Meteor.settings.public.apiLoginKey;

    const expiration = document
      .getElementById("expiry")
      .value.trim()
      .split("/");

    const cardData = {};
    cardData.cardNumber = document
      .getElementById("cardNumber")
      .value.trim()
      .split(" ")
      .join("");
    cardData.month = expiration[0].trim();
    cardData.year = expiration[1].trim();
    cardData.cardCode = document.getElementById("cvc").value.trim();

    console.log(cardData);
    const secureData = {};
    secureData.authData = authData;
    secureData.cardData = cardData;

    Accept.dispatchData(secureData, response => {
      console.log(response);

      if (response.messages.resultCode === "Ok" && response.opaqueData) {
        Meteor.call("customers.step5", response.opaqueData, (err, res) => {
          if (err) {
            console.log(err);

            this.setState({
              submitSuccess: false,
              submitLoading: false
            });

            this.props.popTheSnackbar({
              message: "There was an error saving customer data"
            });
          }

          console.log(res);

          this.setState({
            submitSuccess: true,
            submitLoading: false
          });

          this.props.popTheSnackbar({
            message: `Successfully created customer profile and subscription with subscription Id:${
              res.subscriptionId
            }`
          });
        });
      } else {
        this.setState({
          submitSuccess: false,
          submitLoading: false
        });

        this.props.popTheSnackbar({
          message: response.messages.message[0].text
        });
      }
    });
  }

  handleChangeRadioPaymentMethod(event, value) {
    this.setState({
      paymentMethod: value
    });
  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess
    });

    return (
      <form
        id="step6"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: "50px", marginTop: "25px" }}
        >
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={7}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="subheading" className="font-uppercase">
                        Payment Method
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        {/* <FormLabel component="legend">Type</FormLabel> */}
                        <RadioGroup
                          aria-label="payment-method"
                          name="paymentMethod"
                          value={this.state.paymentMethod}
                          onChange={this.handleChangeRadioPaymentMethod.bind(
                            this
                          )}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            value="card"
                            control={<Radio />}
                            label="Credit card"
                            checked
                            selected
                          />
                          <FormControlLabel
                            value="interac"
                            control={<Radio />}
                            label="Interac e-transfer"
                          />

                          <FormControlLabel
                            value="cash"
                            control={<Radio />}
                            label="Cash"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <div
                    className={
                      this.state.paymentMethod == "card" ? "show" : "hidden"
                    }
                  >
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography
                          type="subheading"
                          className="font-uppercase"
                        >
                          Payment
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Input
                          placeholder="Name on card"
                          inputProps={{
                            name: "nameOnCard",
                            id: "nameOnCard"
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Input
                          placeholder="Card number"
                          inputProps={{
                            name: "cardNumber",
                            id: "cardNumber"
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={4}>
                        <Input
                          placeholder="Expiration"
                          inputProps={{ name: "expiry", id: "expiry" }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Input
                          placeholder="CVC"
                          inputProps={{ name: "cvc", id: "cvc" }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Input
                          placeholder="Postal code"
                          inputProps={{
                            name: "postalCode",
                            id: "postalCode"
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={<Checkbox value="taxExempt" />}
                          label="Customer is tax exempt"
                        />
                      </Grid>
                    </Grid>
                  </div>

                  {this.state.paymentMethod == "interac" ||
                  this.state.paymentMethod == "cash" ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox value="taxExempt" />}
                            label="Customer is tax exempt"
                          />
                          <FormControlLabel
                            control={<Checkbox value="noReceipts" />}
                            label="Do not generate receipts"
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    ""
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12} sm={12}>
                      <Typography
                        type="headline"
                        style={{ marginBottom: "25px" }}
                      >
                        Overview
                      </Typography>
                      <Typography
                        type="title"
                        className="font-medium font-uppercase"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Lifestyle
                      </Typography>

                      <Typography
                        type="title"
                        style={{
                          marginTop: ".75em",
                          marginBottom: ".75em"
                        }}
                      >
                        {this.state.primaryProfileBilling
                          ? this.state.primaryProfileBilling.lifestyle.title
                          : ""}
                      </Typography>

                      <Grid container>
                        <Grid item xs={6}>
                          <Typography type="subheading">
                            {this.state.primaryProfileBilling
                              ? `${this.state.primaryProfileBilling.breakfast
                                  .totalQty +
                                  this.state.primaryProfileBilling.lunch
                                    .totalQty +
                                  this.state.primaryProfileBilling.dinner
                                    .totalQty} meals`
                              : ""}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: "right" }}
                          >
                            ${this.state.primaryProfileBilling
                              ? this.state.primaryProfileBilling.breakfast
                                  .totalQty *
                                  this.state.primaryProfileBilling
                                    .breakfastPrice +
                                this.state.primaryProfileBilling.lunch
                                  .totalQty *
                                  this.state.primaryProfileBilling.lunchPrice +
                                this.state.primaryProfileBilling.dinner
                                  .totalQty *
                                  this.state.primaryProfileBilling.dinnerPrice
                              : ""}
                          </Typography>
                        </Grid>
                      </Grid>

                      {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.discountActual ? (
                        <Grid container>
                          <Grid item xs={12}>
                            <Typography
                              type="body2"
                              className="font-medium font-uppercase"
                              style={{ marginTop: ".75em" }}
                            >
                              Discount
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography type="subheading">
                              {this.state.primaryProfileBilling.discount
                                .charAt(0)
                                .toUpperCase() +
                                this.state.primaryProfileBilling.discount.substr(
                                  1,
                                  this.state.primaryProfileBilling.discount
                                    .length
                                )}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: "right" }}
                            >
                              -${
                                this.state.primaryProfileBilling.discountActual
                              }{" "}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        ""
                      )}

                      {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.totalAthleticSurcharge >
                        0 ? (
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography type="subheading">Athletic</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: "right" }}
                            >
                              ${
                                this.state.primaryProfileBilling
                                  .totalAthleticSurcharge
                              }{" "}
                              ({this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeAthletic == "Fixed amount"
                                ? "$"
                                : ""}
                              {
                                this.state.primaryProfileBilling.lifestyle
                                  .extraAthletic
                              }
                              {this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeAthletic == "Percentage"
                                ? "%"
                                : ""})
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        ""
                      )}

                      {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling
                        .totalBodybuilderSurcharge > 0 ? (
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography type="subheading">
                              Bodybuilder
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: "right" }}
                            >
                              ${
                                this.state.primaryProfileBilling
                                  .totalBodybuilderSurcharge
                              }{" "}
                              ({this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeBodybuilder ==
                              "Fixed amount"
                                ? "$"
                                : ""}
                              {
                                this.state.primaryProfileBilling.lifestyle
                                  .extraBodybuilder
                              }
                              {this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeBodybuilder == "Percentage"
                                ? "%"
                                : ""})
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        ""
                      )}

                      <Typography
                        type="body2"
                        className="font-medium font-uppercase"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Restrictions
                      </Typography>
                      {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.restrictionsActual
                        .length > 0
                        ? this.state.primaryProfileBilling.restrictionsActual.map(
                            (e, i) => (
                              <Grid container key={i}>
                                <Grid item xs={12} sm={6}>
                                  <Typography type="subheading">
                                    {e.title} ({e.discountOrExtraType ==
                                    "Fixed amount"
                                      ? "$"
                                      : ""}
                                    {e.extra}
                                    {e.discountOrExtraType == "Percentage"
                                      ? "%"
                                      : ""})
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: "right" }}
                                  >
                                    ${
                                      this.state.primaryProfileBilling
                                        .restrictionsSurcharges[i]
                                    }
                                  </Typography>
                                </Grid>
                              </Grid>
                            )
                          )
                        : ""}

                      <Typography
                        type="title"
                        className="font-medium font-uppercase"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Delivery
                      </Typography>

                      <Typography
                        type="title"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Night Before
                      </Typography>
                      <Grid container>
                        <Grid item xs={6}>
                          <Typography type="subheading">
                            Minimum two meals in a day
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: "right" }}
                          >
                            Free
                          </Typography>
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid item xs={6}>
                          <Typography type="subheading">Cooler bag</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: "right" }}
                          >
                            $20.00
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* <Typography
                        type="title"
                        className="font-medium font-uppercase"
                        style={{ marginTop: '.75em', marginBottom: '.75em' }}
                      >
                        Price
                      </Typography>

                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Subtotal</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            $135.00
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Extras</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            $135.00
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Discounts</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            $135.00
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Delivery</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            $135.00
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Taxes</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            $135.00
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Total</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="display1"
                            style={{
                              textAlign: 'right',
                              color: '#000',
                            }}
                          >
                            $129.95/week
                          </Typography>
                        </Grid>
                      </Grid> */}
                      {/* Container Price  */}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Button color="primary" onClick={this.props.handleBack}>
            Back
          </Button>
          <Button
            disabled={this.state.submitLoading}
            raised
            className={`${buttonClassname}`}
            color="primary"
            type="submit"
          >
            Next
            {this.state.submitLoading && (
              <CircularProgress
                size={24}
                className={this.props.classes.buttonProgress}
              />
            )}
          </Button>
        </div>
      </form>
    );
  }
}

Step4Checkout.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired
};

export default withStyles(styles)(Step4Checkout);
