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

class Step6Payment extends React.Component {
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
            message:
              "Successfully created customer profile and subscription with subscription Id:" +
              res.subscriptionId
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
              <Grid item xs={12} sm={8}>
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
              <Grid item xs={12} sm={4}>
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
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Traditional
                      </Typography>
                      <Grid container>
                        <Grid item xs={6}>
                          <Typography type="subheading">10 meals</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: "right" }}
                          >
                            $10/meal
                          </Typography>
                        </Grid>
                      </Grid>

                      <Typography
                        type="title"
                        className="font-medium font-uppercase"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Restrictions
                      </Typography>

                      <Typography
                        type="title"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
                      >
                        Dietary
                      </Typography>
                      <Grid container>
                        <Grid item xs={6}>
                          <Typography type="subheading">Gluten free</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: "right" }}
                          >
                            15%
                          </Typography>
                        </Grid>
                      </Grid>

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

                      <Typography
                        type="title"
                        className="font-medium font-uppercase"
                        style={{ marginTop: ".75em", marginBottom: ".75em" }}
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
                            style={{ textAlign: "right" }}
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
                            style={{ textAlign: "right" }}
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
                            style={{ textAlign: "right" }}
                          >
                            $135.00
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Delviery</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: "right" }}
                          >
                            $135.00
                          </Typography>

                          <Grid item xs={12} sm={6}>
                            <Typography type="title">Taxes</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: "right" }}
                            >
                              $135.00
                            </Typography>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Total</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="display1"
                            style={{
                              textAlign: "right",
                              color: "#000"
                            }}
                          >
                            $129.95/week
                          </Typography>
                        </Grid>
                      </Grid>
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
            justifyContent: "flex-end"
          }}
        >
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

Step6Payment.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired
};

export default withStyles(styles)(Step6Payment);
