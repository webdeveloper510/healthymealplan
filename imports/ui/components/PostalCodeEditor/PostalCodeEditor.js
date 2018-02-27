/* eslint-disable max-len, no-return-assign */

import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";
import { MenuItem } from "material-ui/Menu";
import TextField from "material-ui/TextField";
import $ from "jquery";
import { FormGroup, FormControlLabel, FormControl } from "material-ui/Form";
import Radio, { RadioGroup } from "material-ui/Radio";

import Checkbox from "material-ui/Checkbox";

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText
} from "material-ui/Dialog";

import validate from "../../../modules/validate";
import { teal, red } from "material-ui/colors";
import ChevronLeft from "material-ui-icons/ChevronLeft";
import Paper from "material-ui/Paper";
import Loading from "../Loading/Loading";

const primary = teal[500];
const danger = red[700];

const styles = theme => ({
  icon: {
    margin: theme.spacing.unit
  }
});

$.validator.addMethod(
  "cdnPostalStart",
  function(postal, element) {
    return this.optional(element) || postal.match(/[a-zA-Z][0-9][a-zA-Z]/);
  },
  "Please specify a valid postal code."
);

class PostalCodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteDialogOpen: false,
      hasFormChanged: false,
      city: this.props.newPostalCode ? "Ottawa" : this.props.postalCode.city,
      route:
        !this.props.newPostalCode && this.props.postalCode
          ? this.props.postalCode.route
          : "",
      limitedChecked: this.props.newPostalCode
        ? false
        : this.props.postalCode.limited,
      extraSelected: !!(
        !this.props.newPostalCode &&
        this.props.postalCode &&
        this.props.postalCode.hasOwnProperty("extraSurcharge")
      ),
      extraType:
        !this.props.newPostalCode &&
        this.props.postalCode &&
        this.props.postalCode.extraSurchargeType
          ? this.props.postalCode.extraSurchargeType
          : "Percentage",
      valueExtraSurcharge:
        !this.props.newPostalCode &&
        this.props.postalCode &&
        this.props.postalCode.hasOwnProperty("extraSurcharge")
          ? "extra"
          : "none",
      extraAmount:
        !this.props.newPostalCode &&
        this.props.postalCode &&
        this.props.postalCode.hasOwnProperty("extraSurcharge")
          ? this.props.postalCode.extraSurcharge
          : ""
    };
  }

  componentDidMount() {
    const component = this;
    console.log(component.form);
    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent()
        );
      },

      rules: {
        title: {
          required: true,
          cdnPostalStart: true,
          minlength: 3,
          maxlength: 3
        },

        city: {
          requred: true
        },

        route: {
          requred: true
        }
      },

      submitHandler() {
        component.handleSubmit();
      }
    });
  }

  /* Dialog box controls */
  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  handleChange(event, checked) {
    this.setState({
      hasFormChanged: true,
      limitedChecked: checked
    });
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, postalCode } = this.props;

    const existingPostalCode = postalCode && postalCode._id;

    localStorage.setItem("postalCodeDeleted", postalCode.title);

    const postalCodeDeletedMessage = `${localStorage.getItem(
      "postalCodeDeleted"
    )} deleted from postal codes.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call("postalCodes.remove", existingPostalCode, error => {
      if (error) {
        popTheSnackbar({
          message: error.reason
        });
      } else {
        popTheSnackbar({
          message: mealDeletedMessage
        });

        history.push("/postal-codes");
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    console.log("Reached handle submti");
    const { history, popTheSnackbar } = this.props;
    const existingPostalCode =
      this.props.postalCode && this.props.postalCode._id;
    const methodToCall = existingPostalCode
      ? "postalCodes.update"
      : "postalCodes.insert";

    const postalCode = {
      title: document.querySelector("#title").value.trim(),
      city: this.state.city,
      route: this.state.route,
      limited: this.state.limitedChecked
    };

    localStorage.setItem(
      "postalCode",
      existingPostalCode ? this.props.postalCode.title : postalCode.title
    );

    if (this.state.extraSelected) {
      postalCode.extraSurcharge = parseFloat(this.state.extraAmount);
      postalCode.extraSurchargeType = this.state.extraType;
    }

    if (existingPostalCode) {
      postalCode._id = existingPostalCode;

      if (this.state.valueExtraSurcharge == "none") {
        delete postalCode.extraSurcharge;
        delete postalCode.extraSurchargeType;
      }
    }

    console.log(postalCode);

    Meteor.call(methodToCall, postalCode, (error, postalCodeId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason
        });
      } else {
        const confirmation = existingPostalCode
          ? `${localStorage.getItem("postalCode")} postal code updated`
          : `${localStorage.getItem("postalCode")} postal code added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: "View",
          buttonLink: `/postal-codes/${postalCodeId}/edit`
        });

        history.push("/postal-codes");
      }
    });
  }

  titleFieldChanged(e) {
    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged
    });
  }

  handleCityChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      city: event.target.value,
      hasFormChanged: true
    });
  }

  handleRouteChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      route: event.target.value,
      hasFormChanged: true
    });
  }

  handleExtraTypeChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      extraType: event.target.value
    });
  }

  handleExtraValueChange(event, value) {
    this.setState({
      extraAmount: event.target.value,
      hasFormChanged: true
    });
  }

  handleExtraRadioChange(event, value) {
    let extraSelected = true;

    if (value == "none") {
      extraSelected = false;
    }

    this.setState({
      extraSelected,
      valueExtraSurcharge: value,
      hasFormChanged: true
    });
  }

  render() {
    const { postalCode, history, loading } = this.props;

    return (
      <form
        style={{ width: "100%" }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container>
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push("/postal-codes")}
              className="button button-secondary button-secondary--top"
            >
              <Typography
                type="subheading"
                className="subheading font-medium"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  fontWeight: "medium"
                }}
              >
                <ChevronLeft style={{ marginRight: "4px" }} /> Postal codes
              </Typography>
            </Button>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: "50px" }}>
          <Grid item xs={6}>
            <Typography type="headline" className="headline font-medium">
              Add postal code
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Button
                style={{ marginRight: "10px" }}
                onClick={() => history.push("/postal-codes")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                raised
                disabled={!this.state.hasFormChanged}
                className="btn btn-primary"
                color="contrast"
              >
                Save
              </Button>
            </div>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: "50px" }}>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              Postal Code
            </Typography>
            <Typography style={{ paddingRight: "80px" }}>
              {"Enter the first three characters of the postal code route."}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    id="title"
                    label="Name"
                    margin="normal"
                    name="title"
                    fullWidth
                    onChange={this.titleFieldChanged.bind(this)}
                    defaultValue={postalCode && postalCode.title}
                    ref={title => (this.title = title)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.limitedChecked}
                        onChange={this.handleChange.bind(this)}
                        value="limitedChecked"
                      />
                    }
                    label="Limited"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: "50px" }}>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              City
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <TextField
                fullWidth
                id="select-discount-type"
                select
                label="City"
                value={this.state.city ? this.state.city : ""}
                onChange={this.handleCityChange.bind(this)}
                SelectProps={{ native: false }}
              >
                <MenuItem key={1} value="Ottawa">
                  Ottawa
                </MenuItem>
                <MenuItem key={2} value="Gatineau">
                  Gatineau
                </MenuItem>
              </TextField>

              <TextField
                fullWidth
                id="select-discount-type"
                select
                label="Route"
                name="route"
                value={this.state.route}
                onChange={this.handleRouteChange.bind(this)}
                SelectProps={{ native: false }}
                style={{ marginTop: "20px" }}
              >
                {this.props.routes &&
                  this.props.routes.map(e => (
                    <MenuItem key={e._id} value={e._id}>
                      {e.title}
                    </MenuItem>
                  ))}
              </TextField>
            </Paper>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Value
                </Typography>
                <Typography style={{ paddingRight: "80px" }}>
                  Applying an extra will affect the total amount of a
                  lifestyle's price plan if route requires a surcharge.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="subheading" className="font-uppercase">
                        Surcharge
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="discountOrExtra"
                          name="discountOrExtra"
                          value={this.state.valueExtraSurcharge}
                          onChange={this.handleExtraRadioChange.bind(this)}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="none"
                            control={
                              <Radio
                                checked={
                                  this.state.valueExtraSurcharge === "none"
                                }
                              />
                            }
                            label="None"
                          />
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="extra"
                            control={
                              <Radio
                                checked={
                                  this.state.valueExtraSurcharge === "extra"
                                }
                              />
                            }
                            label="Extra"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        disabled={!this.state.extraSelected}
                        fullWidth
                        id="select-discount-type"
                        select
                        label="Type"
                        value={this.state.extraType ? this.state.extraType : ""}
                        onChange={this.handleExtraTypeChange.bind(this)}
                        SelectProps={{ native: false }}
                      >
                        <MenuItem key={1} value="Percentage">
                          Percentage
                        </MenuItem>
                        <MenuItem key={2} value="Fixed amount">
                          Fixed amount
                        </MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        value={this.state.extraAmount}
                        id="discountOrExtraValue"
                        name="discountOrExtraValue"
                        disabled={!this.state.extraSelected}
                        onChange={this.handleExtraValueChange.bind(this)}
                        label="Amount"
                        inputProps={{
                          "aria-label": "Description",
                          type: "number"
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={6}>
            {postalCode ? (
              <Button
                raised
                onClick={this.handleRemove.bind(this)}
                className="btn btn-danger"
                style={{ backgroundColor: danger, color: "#FFFFFF" }}
                disabled
              >
                Delete
              </Button>
            ) : (
              <Button raised onClick={() => history.push("/postal-codes")}>
                Cancel
              </Button>
            )}
          </Grid>

          <Grid item xs={6}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Button
                type="submit"
                raised
                disabled={!this.state.hasFormChanged}
                className="btn btn-primary"
                color="contrast"
              >
                Save
              </Button>
            </div>
          </Grid>
        </Grid>

        {postalCode ? (
          <Dialog
            open={this.state.deleteDialogOpen}
            onClose={this.deleteDialogHandleRequestClose.bind(this)}
          >
            <Typography
              style={{
                flex: "0 0 auto",
                margin: "0",
                padding: "24px 24px 20px 24px"
              }}
              className="title font-medium"
              type="title"
            >
              Delete {postalCode ? postalCode.title.toLowerCase() : ""}?
            </Typography>
            <DialogContent>
              <DialogContentText className="subheading">
                Are you sure you want to delete {postalCode.title.toLowerCase()}{" "}
                ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.deleteDialogHandleRequestClose.bind(this)}
                color="default"
              >
                Cancel
              </Button>
              <Button
                stroked
                className="button--bordered button--bordered--accent"
                onClick={this.handleRemoveActual.bind(this)}
                color="accent"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        ) : (
          ""
        )}
      </form>
    );
  }
}

PostalCodeEditor.propTypes = {
  postalCode: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default PostalCodeEditor;
