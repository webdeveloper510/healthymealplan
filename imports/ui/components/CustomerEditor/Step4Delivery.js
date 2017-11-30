import React from "react";
import PropTypes from "prop-types";

import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import { MenuItem } from "material-ui/Menu";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import Radio, { RadioGroup } from "material-ui/Radio";

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

class Step4Delivery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,
      addressType: "hotel",
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
  }

  handleSubmitStep() {
    console.log("Reached");

    this.setState({
      submitSuccess: false,
      submitLoading: true
    });

    Meteor.call(
      "customers.step2",
      {
        id: this.props.customerInfo.id,
        addressType: this.state.addressType
      },
      (err, returnVal) => {
        if (err) {
          console.log(err);

          // this.props.popTheSnackbar({
          //   message: err.reason,
          // });

          this.setState({
            submitSuccess: false,
            submitLoading: false
          });
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false
          });

          console.log("Reached no error");

          this.props.saveValues({});

          this.props.handleNext();
        }
      }
    );
  }

  handleChangeRadioAddressType(event, value) {
    this.setState({
      addressType: value
    });
  }

  changeDormName(event, value) {
    let changedResidence = "";

    switch (event.target.value) {
      case "Algonquin College":
        changedResidence = "Student Residence";

      case "Carleton University":
        changedResidence = "Dundas House";

      case "University of Ottawa":
        changedResidence = "90 U Residence";

      default:
        changedResidence = "Student Residence";
    }

    this.setState({
      dormName: event.target.value,
      dormResidence: changedResidence
    });
  }

  changeDormResidence(event, value) {
    console.log(event.target.value);

    this.setState({
      dormResidence: event.target.value
    });
  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess
    });

    return (
      <form
        id="step1"
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
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Delivery
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="subheading" className="font-uppercase">
                        Address Type
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        {/* <FormLabel component="legend">Type</FormLabel> */}
                        <RadioGroup
                          aria-label="account-type"
                          name="type"
                          value={this.state.addressType}
                          onChange={this.handleChangeRadioAddressType.bind(
                            this
                          )}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            value="apartment"
                            control={<Radio />}
                            label="Apartment"
                          />
                          <FormControlLabel
                            value="business"
                            control={<Radio />}
                            label="Business"
                          />

                          <FormControlLabel
                            value="dormitory"
                            control={<Radio />}
                            label="Dormitory"
                          />

                          <FormControlLabel
                            value="hotel"
                            control={<Radio />}
                            label="Hotel"
                          />

                          <FormControlLabel
                            value="house"
                            control={<Radio />}
                            label="House"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {this.state.addressType == "apartment" ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography
                            type="subheading"
                            className="font-uppercase"
                          >
                            Apartment
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            margin="normal"
                            id="apartmentName"
                            label="Apartment name"
                            name="apartment_name"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.apartmentName
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="unit"
                            label="Unit"
                            name="unit"
                            fullWidth
                            defaultValue={this.props.customerInfo.address.unit}
                            inputProps={{}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="buzzer"
                            label="Buzzer"
                            name="buzzer"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.buzzer
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    ""
                  )}

                  {this.state.addressType == "business" ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography
                            type="subheading"
                            className="font-uppercase"
                          >
                            Business
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            margin="normal"
                            id="businessName"
                            label="Business name"
                            name="business_name"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.businessName
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="businessUnit"
                            label="Unit"
                            name="businessUnit"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.businessUnit
                            }
                            inputProps={{}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="businessBuzzer"
                            label="Buzzer"
                            name="businessBuzzer"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.businessBuzzer
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    ""
                  )}

                  {this.state.addressType == "dormitory" ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography
                            type="subheading"
                            className="font-uppercase"
                          >
                            Dormitory
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            margin="normal"
                            id="dormitoryName"
                            label="Dormitory name"
                            name="dormitory_name"
                            select
                            value={
                              this.state.dormName
                                ? this.state.dormName
                                : "Algonquin College"
                            }
                            onChange={this.changeDormName.bind(this)}
                            fullWidth
                            SelectProps={{ native: false }}
                          >
                            <MenuItem key={1} value="Algonquin College">
                              Algonquin College
                            </MenuItem>

                            <MenuItem key={3} value="Carleton University">
                              Carleton University
                            </MenuItem>
                            <MenuItem key={4} value="University of Ottawa">
                              University of Ottawa
                            </MenuItem>
                          </TextField>
                        </Grid>

                        <Grid item xs={12}>
                          {this.state.dormName &&
                          this.state.dormName === "Algonquin College" ? (
                            <TextField
                              margin="normal"
                              id="dormResidence"
                              label="Dormitory Residence"
                              name="dormitory_residence"
                              select
                              value={
                                this.state.dormResidence
                                  ? this.state.dormResidence
                                  : "Student Residence"
                              }
                              fullWidth
                              onChange={this.changeDormResidence.bind(this)}
                            >
                              <div>
                                <MenuItem key={1} value="Student Residence">
                                  Student Residence
                                </MenuItem>
                              </div>
                            </TextField>
                          ) : (
                            ""
                          )}
                          {this.state.dormName &&
                          this.state.dormName === "Carleton University" ? (
                            <TextField
                              margin="normal"
                              id="dormResidence"
                              label="Dormitory Residence"
                              name="dormitory_residence"
                              select
                              value={
                                this.state.dormResidence
                                  ? this.state.dormResidence
                                  : "Dundas House"
                              }
                              fullWidth
                              onChange={this.changeDormResidence.bind(this)}
                            >
                              <MenuItem key={1} value="Dundas House">
                                Dundas House
                              </MenuItem>
                              <MenuItem key={2} value="Glengarry House">
                                Glengarry House
                              </MenuItem>
                              <MenuItem key={3} value="Grenville House">
                                Grenville House
                              </MenuItem>
                              <MenuItem key={4} value="Lanark House">
                                Lanark House
                              </MenuItem>
                              <MenuItem
                                key={5}
                                value="Lennox & Addington House"
                              >
                                Lennox & Addington House
                              </MenuItem>
                              <MenuItem key={6} value="Renfrew House">
                                Renfrew House
                              </MenuItem>
                              <MenuItem key={7} value="Russell House">
                                Russell House
                              </MenuItem>
                              <MenuItem key={8} value="Stormont House">
                                Stormont House
                              </MenuItem>
                            </TextField>
                          ) : (
                            ""
                          )}

                          {this.state.dormName &&
                          this.state.dormName === "University of Ottawa" ? (
                            <TextField
                              margin="normal"
                              id="dormResidence"
                              label="Dormitory Residence"
                              name="dormitory_residence"
                              select
                              value={
                                this.state.dormResidence
                                  ? this.state.dormResidence
                                  : "90 U Residence"
                              }
                              fullWidth
                              onChange={this.changeDormResidence.bind(this)}
                            >
                              <MenuItem key={1} value="90 U Residence">
                                90 U Residence
                              </MenuItem>
                              <MenuItem key={2} value="Hyman Soloway Residence">
                                Hyman Soloway Residence
                              </MenuItem>
                              <MenuItem key={3} value="Marchand Residence">
                                Marchand Residence
                              </MenuItem>
                              <MenuItem key={4} value="Stanton Residence">
                                Stanton Residence
                              </MenuItem>
                              <MenuItem key={5} value="Thompson Residence">
                                Thompson Residence
                              </MenuItem>
                            </TextField>
                          ) : (
                            ""
                          )}
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="roomNumber"
                            label="Room number"
                            name="roomNumber"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.roomNumber
                            }
                            inputProps={{}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="buzzer"
                            label="Buzzer"
                            name="buzzer"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.buzzer
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    ""
                  )}

                  {this.state.addressType &&
                  this.state.addressType === "hotel" ? (
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography
                          type="subheading"
                          className="font-uppercase"
                        >
                          Hotel
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          margin="normal"
                          id="hotelName"
                          label="Hotel name"
                          name="hotelName"
                          fullWidth
                          defaultValue={
                            this.props.customerInfo.address.hotelNumber
                          }
                          inputProps={{}}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          margin="normal"
                          id="roomNumber"
                          label="Room number"
                          name="roomNumber"
                          fullWidth
                          defaultValue={
                            this.props.customerInfo.address.roomNumber
                          }
                          inputProps={{}}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Checkbox value="leaveAtFrontDesk" />}
                          label="Leave at front desk"
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    ""
                  )}

                  {this.state.addressType &&
                  this.state.addressType === "house" ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography
                            type="subheading"
                            className="font-uppercase"
                          >
                            House
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            margin="normal"
                            id="unitHouse"
                            label="Unit"
                            name="unitHouse"
                            fullWidth
                            defaultValue={
                              this.props.customerInfo.address.unitHouse
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    ""
                  )}

                  {this.state.addressType ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            label="Street Address"
                            id="streetAddress"
                            name="streetAddress"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Postal Code"
                            id="postalCode"
                            name="postalCode"
                            defaultValue={this.props.customerInfo.postalCode}
                            fullWidth
                          />
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            label="Notes"
                            id="notes"
                            name="notes"
                            fullWidth
                            multiline
                            defaultValue={this.props.customerInfo.address.notes}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                    ""
                  )}
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

Step4Delivery.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired
};

export default withStyles(styles)(Step4Delivery);
