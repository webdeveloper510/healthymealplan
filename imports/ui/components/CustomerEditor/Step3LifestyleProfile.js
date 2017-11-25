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
  FormHelperText,
  FormGroup
} from "material-ui/Form";

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText
} from "material-ui/Dialog";

import classNames from "classnames";
import { withStyles } from "material-ui/styles";
import { CircularProgress } from "material-ui/Progress";
import green from "material-ui/colors/green";

import List, { ListItem, ListItemText } from "material-ui/List";
import Collapse from "material-ui/transitions/Collapse";
import ExpandLess from "material-ui-icons/ExpandLess";
import ExpandMore from "material-ui-icons/ExpandMore";

import Autosuggest from "react-autosuggest";
import _ from "lodash";
import Search from "material-ui-icons/Search";
import Chip from "material-ui/Chip";
import Avatar from "material-ui/Avatar";

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

class Step3LifestyleProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      suggestions: [],
      submitLoading: false,
      submitSuccess: false,
      subIngredients: [],
      specificRestrictions: [],
      deleteDialogOpen: false,
      addRestrictionType: "Restriction",
      lifestyle: this.props.customerInfo.adultOrChild
        ? this.props.customerInfo.adultOrChild
        : "traditional",
      extra: this.props.customerInfo.extra
        ? this.props.customerInfo.extra
        : "none",
      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : "none",

      peanuts: false,
      milk: false,
      egg: false,
      wheat: false,
      soy: false,
      fish: false,
      shellfish: false,

      ketogenic: false,
      glutenfree: false,
      lowcarb: false,
      nocarb: false,
      ovolacto: false,
      ovo: false,
      lacto: false,
      pescatarian: false,
      paleo: false,
      vegan: false,

      halal: false,
      kosher: false,

      // collapse

      primaryCollapse: false,
      secondaryCollapses: [false, false, false, false, false, false],
      secondaryProfileCount: 0,
      secondaryProfilesData: []
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
        first_name: {
          required: true
        },
        last_name: {
          required: true
        },
        email: {
          required: true,
          email: true
        },
        phoneNumber: {
          minlength: 10,
          maxlength: 10,
          number: true
        },
        type: {
          required: true
        }
      },

      submitHandler() {
        component.handleSubmitStep();
      }
    });
  }

  increaseProfileCount() {
    if (this.state.secondaryProfileCount === 6) {
      this.popTheSnackbar({
        message: "Cannot add more than"
      });

      return;
    }

    const increasedProfileCount = this.state.secondaryProfileCount + 1;

    let currentSecondaryProfiles = this.state.secondaryProfilesData.slice();

    currentSecondaryProfiles.push({
      value: "",
      suggestions: [],
      submitLoading: false,
      submitSuccess: false,
      subIngredients: [],
      specificRestrictions: [],
      deleteDialogOpen: false,
      addRestrictionType: "Restriction",
      lifestyle: this.props.customerInfo.adultOrChild
        ? this.props.customerInfo.adultOrChild
        : "traditional",
      extra: this.props.customerInfo.extra
        ? this.props.customerInfo.extra
        : "none",
      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : "none",

      peanuts: false,
      milk: false,
      egg: false,
      wheat: false,
      soy: false,
      fish: false,
      shellfish: false,

      ketogenic: false,
      glutenfree: false,
      lowcarb: false,
      nocarb: false,
      ovolacto: false,
      ovo: false,
      lacto: false,
      pescatarian: false,
      paleo: false,
      vegan: false,

      halal: false,
      kosher: false,
    });

    this.setState({
      secondaryProfileCount: increasedProfileCount,
      secondaryProfilesData: currentSecondaryProfiles
    });
  }

  handleProfileOpen(primary, index) {
    if (primary) {
      this.setState({
        primaryCollapse: !this.state.primaryCollapse
      });
    } else {
      let currentCollapseArr = this.state.secondaryCollapses.slice();

      currentCollapseArr[index] = !currentCollapseArr[index];

      this.setState({
        secondaryCollapses: currentCollapseArr
      });
    }
  }

  deleteDialogHandleRequestClose() {
    this.setState({
      deleteDialogOpen: false
    });
  }

  deleteDialogHandleOpen() {
    this.setState({
      deleteDialogOpen: true
    });
  }

  handleSubmitStep() {
    console.log("Reached");

    this.setState({
      submitSuccess: false,
      submitLoading: true
    });

    Meteor.call(
      "customers.step3",
      {
        id: this.props.customerInfo.id,
        firstName: $('[name="first_name"]')
          .val()
          .trim(),
        lastName: $('[name="last_name"]')
          .val()
          .trim(),
        email: $('[name="email"]')
          .val()
          .trim(),
        phoneNumber: $('[name="phoneNumber"]')
          .val()
          .trim(),
        adultOrChild: this.state.adultOrChildValue
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

          this.props.saveValues({
            firstName: $('[name="first_name"]')
              .val()
              .trim(),
            lastName: $('[name="last_name"]')
              .val()
              .trim(),
            email: $('[name="email"]')
              .val()
              .trim(),
            phoneNumber: $('[name="phoneNumber"]')
              .val()
              .trim(),
            adultOrChild: this.state.adultOrChildValue
          });

          this.props.handleNext();
        }
      }
    );
  }

  handleChangeRadioLifestyle(event, value) {
    this.setState({
      lifestyle: value
    });
  }

  handleChangeRadioRestriction(event, value) {
    this.setState({
      addRestrictionType: value
    });
  }

  handleChangeRadioExtra(event, value) {
    this.setState({
      extra: value
    });
  }

  handleChangeRadioDiscount(event, value) {
    this.setState({
      discount: value
    });
  }

  handleChange(name, event, checked) {
    this.setState({
      [name]: checked
    });
  }

  onChange(event, { newValue }) {
    this.setState({
      value: newValue
    });
  }

  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.potentialSubIngredients.filter(
          ingredient =>
            ingredient.title.toLowerCase().slice(0, inputLength) === inputValue
        );
  }

  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  onSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    let clonedSubIngredients;

    if (this.state.addRestrictionType == "Preference") {
      clonedSubIngredients = this.state.subIngredients
        ? this.state.subIngredients.slice()
        : [];
    } else {
      clonedSubIngredients = this.state.specificRestrictions
        ? this.state.specificRestrictions.slice()
        : [];
    }

    let isThere = false;

    if (clonedSubIngredients.length > 0) {
      isThere = clonedSubIngredients.filter(
        present => suggestion._id === present._id
      );
    }

    if (isThere != false) {
      return;
    }

    clonedSubIngredients.push({
      _id: suggestion._id,
      title: suggestion.title
    });

    if (this.state.addRestrictionType == "Preference") {
      this.setState({
        subIngredients: clonedSubIngredients
      });
    } else {
      this.setState({
        specificRestrictions: clonedSubIngredients
      });
    }
  }

  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }

  handleSubIngredientChipDelete(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.subIngredients.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      subIngredients: stateCopy
    });
  }

  handleSubIngredientChipDeleteSpecificRestriction(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.specificRestrictions.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      specificRestrictions: stateCopy
    });
  }

  getSubIngredientTitle(subIngredient) {
    // console.log(subIngredient);

    if (subIngredient.title) {
      return subIngredient.title;
    }

    if (this.props.allIngredients) {
      return this.props.allIngredients.find(el => el._id === subIngredient);
    }
  }

  getSubIngredientAvatar(subIngredient) {
    if (subIngredient.title) {
      return subIngredient.title.charAt(0);
    }

    if (this.props.potentialSubIngredients) {
      const avatarToReturn = this.props.potentialSubIngredients.find(
        el => el._id === subIngredient
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  renderInput(inputProps) {
    const { value, ...other } = inputProps;

    return (
      <TextField
        className={styles.textField}
        value={value}
        style={{ width: "100%" }}
        InputProps={{
          classes: {
            input: styles.input
          },
          ...other
        }}
      />
    );
  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess
    });

    return (
      <form
        id="step2"
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
                  Lifestyle
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <ListItem
                    style={{ marginBottom: "25px" }}
                    button
                    onClick={this.handleProfileOpen.bind(this, true, false)}
                  >
                    <ListItemText primary="Primary profile" />
                    {this.state.primaryCollapse ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItem>
                  <Collapse
                    in={this.state.primaryCollapse}
                    transitionDuration="auto"
                    component="div"
                  >
                    <Grid container>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">
                            Select lifestyle
                          </FormLabel>
                          <RadioGroup
                            aria-label="lifestyle"
                            name="lifestyle"
                            value={this.state.lifestyle}
                            onChange={this.handleChangeRadioLifestyle.bind(
                              this
                            )}
                            style={{ flexDirection: "row" }}
                          >
                            <FormControlLabel
                              value="Traditional"
                              control={<Radio />}
                              label="Traditional"
                              selected
                            />
                            <FormControlLabel
                              value="Vegetarian"
                              control={<Radio />}
                              label="Vegetarian"
                            />

                            <FormControlLabel
                              value="Chef's choice"
                              control={<Radio />}
                              label="Chef's choice"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Extras</FormLabel>
                          <RadioGroup
                            aria-label="extra"
                            name="extra"
                            value={this.state.extra}
                            onChange={this.handleChangeRadioExtra.bind(this)}
                            style={{ flexDirection: "row" }}
                          >
                            <FormControlLabel
                              value="none"
                              control={<Radio />}
                              label="None"
                              selected
                            />
                            <FormControlLabel
                              value="athletic"
                              control={<Radio />}
                              label="Athletic"
                              selected
                            />
                            <FormControlLabel
                              value="bodybuilder"
                              control={<Radio />}
                              label="Bodybuilder"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Discounts</FormLabel>
                          <RadioGroup
                            aria-label="discount"
                            name="discount"
                            value={this.state.discount}
                            onChange={this.handleChangeRadioDiscount.bind(this)}
                            style={{ flexDirection: "row" }}
                          >
                            <FormControlLabel
                              value="none"
                              control={<Radio />}
                              label="None"
                              selected
                            />
                            <FormControlLabel
                              value="student"
                              control={<Radio />}
                              label="Student"
                            />
                            <FormControlLabel
                              value="senior"
                              control={<Radio />}
                              label="Senior"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={12} style={{ marginTop: "25px" }}>
                        <Typography type="subheading">Restrictions</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Allergies</FormLabel>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.peanuts}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "peanuts"
                                  )}
                                  value="peanuts"
                                />
                              }
                              label="Peanuts"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.milk}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "milk"
                                  )}
                                  value="Milk"
                                />
                              }
                              label="Milk"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.egg}
                                  onChange={this.handleChange.bind(this, "egg")}
                                  value="egg"
                                />
                              }
                              label="Egg"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.wheat}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "wheat"
                                  )}
                                  value="wheat"
                                />
                              }
                              label="Wheat"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.soy}
                                  onChange={this.handleChange.bind(this, "soy")}
                                  value="soy"
                                />
                              }
                              label="Soy"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.fish}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "fish"
                                  )}
                                  value="fish"
                                />
                              }
                              label="Fish"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.shellfish}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "shellfish"
                                  )}
                                  value="shellfish"
                                />
                              }
                              label="Shellfish"
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Dietary</FormLabel>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.ketogenic}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "ketogenic"
                                  )}
                                  value="ketogenic"
                                />
                              }
                              label="Ketogenic"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.glutenfree}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "glutenfree"
                                  )}
                                  value="Gluten free"
                                />
                              }
                              label="Gluten free"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.lowcarb}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "lowcarb"
                                  )}
                                  value="Low carb"
                                />
                              }
                              label="Low carb"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.nocarb}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "nocarb"
                                  )}
                                  value="No carb"
                                />
                              }
                              label="No carb"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.ovolacto}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "ovolacto"
                                  )}
                                  value="Ovo-lacto"
                                />
                              }
                              label="Ovo-lacto"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.lacto}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "lacto"
                                  )}
                                  value="lacto"
                                />
                              }
                              label="Lacto"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.vegan}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "vegan"
                                  )}
                                  value="vegan"
                                />
                              }
                              label="Vegan"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.pescatarian}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "pescatarian"
                                  )}
                                  value="pescatarian"
                                />
                              }
                              label="Pescatarian"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.paleo}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "paleo"
                                  )}
                                  value="paleo"
                                />
                              }
                              label="Paleo"
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Religious</FormLabel>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.halal}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "halal"
                                  )}
                                  value="halal"
                                />
                              }
                              label="Halal"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={this.state.kosher}
                                  onChange={this.handleChange.bind(
                                    this,
                                    "kosher"
                                  )}
                                  value="Kosher"
                                />
                              }
                              label="Kosher"
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={12}>
                        <Button
                          style={{ float: "right" }}
                          color="primary"
                          onClick={this.deleteDialogHandleOpen.bind(this)}
                        >
                          Add a restriction
                        </Button>
                      </Grid>
                    </Grid>
                    <Dialog
                      open={this.state.deleteDialogOpen}
                      onRequestClose={this.deleteDialogHandleRequestClose.bind(
                        this
                      )}
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
                        Add a restriction
                      </Typography>

                      <DialogContent>
                        <DialogContentText>
                          Select if it's a preference or if it's a restriction
                        </DialogContentText>
                        <FormControl component="fieldset">
                          <RadioGroup
                            aria-label="restritionOrPref"
                            name="restritionOrPref"
                            value={this.state.addRestrictionType}
                            onChange={this.handleChangeRadioRestriction.bind(
                              this
                            )}
                            style={{ flexDirection: "row" }}
                          >
                            <FormControlLabel
                              value="Restriction"
                              control={<Radio selected />}
                              label="Restriction"
                            />
                            <FormControlLabel
                              value="Preference"
                              control={<Radio />}
                              label="Preference"
                              selected
                            />
                          </RadioGroup>
                        </FormControl>

                        {/* <Search className="autoinput-icon" /> */}
                        <Autosuggest
                          id="2"
                          className="autosuggest"
                          theme={{
                            container: {
                              flexGrow: 1,
                              position: "relative",
                              marginBottom: "2em"
                            },
                            suggestionsContainerOpen: {
                              position: "absolute",
                              left: 0,
                              right: 0
                            },
                            suggestion: {
                              display: "block"
                            },
                            suggestionsList: {
                              margin: 0,
                              padding: 0,
                              listStyleType: "none"
                            }
                          }}
                          renderInputComponent={this.renderInput.bind(this)}
                          suggestions={this.state.suggestions}
                          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(
                            this
                          )}
                          onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(
                            this
                          )}
                          onSuggestionSelected={this.onSuggestionSelected.bind(
                            this
                          )}
                          getSuggestionValue={this.getSuggestionValue.bind(
                            this
                          )}
                          renderSuggestion={this.renderSuggestion.bind(this)}
                          renderSuggestionsContainer={this.renderSuggestionsContainer.bind(
                            this
                          )}
                          fullWidth
                          focusInputOnSuggestionClick={false}
                          inputProps={{
                            placeholder: "Search",
                            value: this.state.value,
                            onChange: this.onChange.bind(this),
                            className: "autoinput"
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Grid container>
                      <Grid item xs={12} style={{ marginTop: "25px" }}>
                        <Typography type="subheading">Preferences</Typography>
                      </Grid>
                      <Grid item xs={12} style={{ marginTop: "25px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap"
                          }}
                        >
                          {this.state.subIngredients.length ? (
                            this.state.subIngredients.map(
                              (subIngredient, i) => (
                                <Chip
                                  avatar={
                                    <Avatar>
                                      {" "}
                                      {this.getSubIngredientAvatar(
                                        subIngredient
                                      )}{" "}
                                    </Avatar>
                                  }
                                  style={{
                                    marginRight: "8px",
                                    marginBottom: "8px"
                                  }}
                                  label={this.getSubIngredientTitle(
                                    subIngredient
                                  )}
                                  key={i}
                                  onRequestDelete={this.handleSubIngredientChipDelete.bind(
                                    this,
                                    subIngredient
                                  )}
                                />
                              )
                            )
                          ) : (
                            <Chip
                              className="chip--bordered"
                              label="Ingredient"
                            />
                          )}
                        </div>
                      </Grid>
                      <Grid item xs={12} style={{ marginTop: "25px" }}>
                        <Typography type="subheading">Restrictions</Typography>
                      </Grid>
                      <Grid item xs={12} style={{ marginTop: "25px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap"
                          }}
                        >
                          {this.state.specificRestrictions.length ? (
                            this.state.specificRestrictions.map(
                              (subIngredient, i) => (
                                <Chip
                                  avatar={
                                    <Avatar>
                                      {" "}
                                      {this.getSubIngredientAvatar(
                                        subIngredient
                                      )}{" "}
                                    </Avatar>
                                  }
                                  style={{
                                    marginRight: "8px",
                                    marginBottom: "8px"
                                  }}
                                  label={this.getSubIngredientTitle(
                                    subIngredient
                                  )}
                                  key={i}
                                  onRequestDelete={this.handleSubIngredientChipDeleteSpecificRestriction.bind(
                                    this,
                                    subIngredient
                                  )}
                                />
                              )
                            )
                          ) : (
                            <Chip
                              className="chip--bordered"
                              label="Ingredient"
                            />
                          )}
                        </div>
                      </Grid>
                    </Grid>
                  </Collapse>

                  {this.state.secondaryProfilesData.map((e, i) => (
                    <div key={i}>
                      <ListItem
                        style={{ marginTop: "15px", marginBottom: "15px" }}
                        button
                        onClick={this.handleProfileOpen.bind(this, false, i)}
                      >
                        <ListItemText primary={`Profile ${i + 2}`} />
                        {this.state.secondaryCollapses[i] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </ListItem>
                      <Collapse
                        in={this.state.secondaryCollapses[i]}
                        transitionDuration="auto"
                        component="div"
                      >
                        <div style={{ paddingLeft: "16px", paddingRight: "16px" }}>
                          <Grid container>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                margin="normal"
                                id="first_name"
                                label="First name"
                                name="first_name"
                                fullWidth
                                defaultValue={this.props.customerInfo.firstName}
                                inputProps={{}}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                margin="normal"
                                id="last_name"
                                label="Last name"
                                name="last_name"
                                fullWidth
                                defaultValue={this.props.customerInfo.lastName}
                                inputProps={{}}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Select lifestyle
                                </FormLabel>
                                <RadioGroup
                                  aria-label="lifestyle"
                                  name="lifestyle"
                                  value={this.state.lifestyle}
                                  onChange={this.handleChangeRadioLifestyle.bind(
                                    this
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  <FormControlLabel
                                    value="Traditional"
                                    control={<Radio />}
                                    label="Traditional"
                                    selected
                                  />
                                  <FormControlLabel
                                    value="Vegetarian"
                                    control={<Radio />}
                                    label="Vegetarian"
                                  />

                                  <FormControlLabel
                                    value="Chef's choice"
                                    control={<Radio />}
                                    label="Chef's choice"
                                  />
                                </RadioGroup>
                              </FormControl>
                            </Grid>
                          </Grid>

                          <Grid container>
                            <Grid item xs={12}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">Extras</FormLabel>
                                <RadioGroup
                                  aria-label="extra"
                                  name="extra"
                                  value={this.state.extra}
                                  onChange={this.handleChangeRadioExtra.bind(
                                    this
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  <FormControlLabel
                                    value="none"
                                    control={<Radio />}
                                    label="None"
                                    selected
                                  />
                                  <FormControlLabel
                                    value="athletic"
                                    control={<Radio />}
                                    label="Athletic"
                                    selected
                                  />
                                  <FormControlLabel
                                    value="bodybuilder"
                                    control={<Radio />}
                                    label="Bodybuilder"
                                  />
                                </RadioGroup>
                              </FormControl>
                            </Grid>
                          </Grid>

                          <Grid container>
                            <Grid item xs={12}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Discounts
                                </FormLabel>
                                <RadioGroup
                                  aria-label="discount"
                                  name="discount"
                                  value={this.state.discount}
                                  onChange={this.handleChangeRadioDiscount.bind(
                                    this
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  <FormControlLabel
                                    value="none"
                                    control={<Radio />}
                                    label="None"
                                    selected
                                  />
                                  <FormControlLabel
                                    value="student"
                                    control={<Radio />}
                                    label="Student"
                                  />
                                  <FormControlLabel
                                    value="senior"
                                    control={<Radio />}
                                    label="Senior"
                                  />
                                </RadioGroup>
                              </FormControl>
                            </Grid>
                          </Grid>

                          <Grid container>
                            <Grid item xs={12} style={{ marginTop: "25px" }}>
                              <Typography type="subheading">
                                Restrictions
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Allergies
                                </FormLabel>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.peanuts}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "peanuts"
                                        )}
                                        value="peanuts"
                                      />
                                    }
                                    label="Peanuts"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.milk}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "milk"
                                        )}
                                        value="Milk"
                                      />
                                    }
                                    label="Milk"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.egg}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "egg"
                                        )}
                                        value="egg"
                                      />
                                    }
                                    label="Egg"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.wheat}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "wheat"
                                        )}
                                        value="wheat"
                                      />
                                    }
                                    label="Wheat"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.soy}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "soy"
                                        )}
                                        value="soy"
                                      />
                                    }
                                    label="Soy"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.fish}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "fish"
                                        )}
                                        value="fish"
                                      />
                                    }
                                    label="Fish"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.shellfish}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "shellfish"
                                        )}
                                        value="shellfish"
                                      />
                                    }
                                    label="Shellfish"
                                  />
                                </FormGroup>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Dietary
                                </FormLabel>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.ketogenic}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "ketogenic"
                                        )}
                                        value="ketogenic"
                                      />
                                    }
                                    label="Ketogenic"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.glutenfree}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "glutenfree"
                                        )}
                                        value="Gluten free"
                                      />
                                    }
                                    label="Gluten free"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.lowcarb}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "lowcarb"
                                        )}
                                        value="Low carb"
                                      />
                                    }
                                    label="Low carb"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.nocarb}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "nocarb"
                                        )}
                                        value="No carb"
                                      />
                                    }
                                    label="No carb"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.ovolacto}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "ovolacto"
                                        )}
                                        value="Ovo-lacto"
                                      />
                                    }
                                    label="Ovo-lacto"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.lacto}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "lacto"
                                        )}
                                        value="lacto"
                                      />
                                    }
                                    label="Lacto"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.vegan}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "vegan"
                                        )}
                                        value="vegan"
                                      />
                                    }
                                    label="Vegan"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.pescatarian}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "pescatarian"
                                        )}
                                        value="pescatarian"
                                      />
                                    }
                                    label="Pescatarian"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.paleo}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "paleo"
                                        )}
                                        value="paleo"
                                      />
                                    }
                                    label="Paleo"
                                  />
                                </FormGroup>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Religious
                                </FormLabel>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.halal}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "halal"
                                        )}
                                        value="halal"
                                      />
                                    }
                                    label="Halal"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={this.state.kosher}
                                        onChange={this.handleChange.bind(
                                          this,
                                          "kosher"
                                        )}
                                        value="Kosher"
                                      />
                                    }
                                    label="Kosher"
                                  />
                                </FormGroup>
                              </FormControl>
                            </Grid>
                          </Grid>
                          <Grid container>
                            <Grid item xs={12}>
                              <Button
                                style={{ float: "right" }}
                                color="primary"
                                onClick={this.deleteDialogHandleOpen.bind(this)}
                              >
                                Add a restriction
                              </Button>
                            </Grid>
                          </Grid>
                          <Dialog
                            open={this.state.deleteDialogOpen}
                            onRequestClose={this.deleteDialogHandleRequestClose.bind(
                              this
                            )}
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
                              Add a restriction
                            </Typography>

                            <DialogContent>
                              <DialogContentText>
                                Select if it's a preference or if it's a
                                restriction
                              </DialogContentText>
                              <FormControl component="fieldset">
                                <RadioGroup
                                  aria-label="restritionOrPref"
                                  name="restritionOrPref"
                                  value={this.state.addRestrictionType}
                                  onChange={this.handleChangeRadioRestriction.bind(
                                    this
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  <FormControlLabel
                                    value="Restriction"
                                    control={<Radio selected />}
                                    label="Restriction"
                                  />
                                  <FormControlLabel
                                    value="Preference"
                                    control={<Radio />}
                                    label="Preference"
                                    selected
                                  />
                                </RadioGroup>
                              </FormControl>

                              {/* <Search className="autoinput-icon" /> */}
                              <Autosuggest
                                id="2"
                                className="autosuggest"
                                theme={{
                                  container: {
                                    flexGrow: 1,
                                    position: "relative",
                                    marginBottom: "2em"
                                  },
                                  suggestionsContainerOpen: {
                                    position: "absolute",
                                    left: 0,
                                    right: 0
                                  },
                                  suggestion: {
                                    display: "block"
                                  },
                                  suggestionsList: {
                                    margin: 0,
                                    padding: 0,
                                    listStyleType: "none"
                                  }
                                }}
                                renderInputComponent={this.renderInput.bind(
                                  this
                                )}
                                suggestions={this.state.suggestions}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(
                                  this
                                )}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(
                                  this
                                )}
                                onSuggestionSelected={this.onSuggestionSelected.bind(
                                  this
                                )}
                                getSuggestionValue={this.getSuggestionValue.bind(
                                  this
                                )}
                                renderSuggestion={this.renderSuggestion.bind(
                                  this
                                )}
                                renderSuggestionsContainer={this.renderSuggestionsContainer.bind(
                                  this
                                )}
                                fullWidth
                                focusInputOnSuggestionClick={false}
                                inputProps={{
                                  placeholder: "Search",
                                  value: this.state.value,
                                  onChange: this.onChange.bind(this),
                                  className: "autoinput"
                                }}
                              />
                            </DialogContent>
                          </Dialog>

                          <Grid container>
                            <Grid item xs={12} style={{ marginTop: "25px" }}>
                              <Typography type="subheading">
                                Preferences
                              </Typography>
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: "25px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  flexWrap: "wrap"
                                }}
                              >
                                {this.state.subIngredients.length ? (
                                  this.state.subIngredients.map(
                                    (subIngredient, i) => (
                                      <Chip
                                        avatar={
                                          <Avatar>
                                            {" "}
                                            {this.getSubIngredientAvatar(
                                              subIngredient
                                            )}{" "}
                                          </Avatar>
                                        }
                                        style={{
                                          marginRight: "8px",
                                          marginBottom: "8px"
                                        }}
                                        label={this.getSubIngredientTitle(
                                          subIngredient
                                        )}
                                        key={i}
                                        onRequestDelete={this.handleSubIngredientChipDelete.bind(
                                          this,
                                          subIngredient
                                        )}
                                      />
                                    )
                                  )
                                ) : (
                                  <Chip
                                    className="chip--bordered"
                                    label="Ingredient"
                                  />
                                )}
                              </div>
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: "25px" }}>
                              <Typography type="subheading">
                                Restrictions
                              </Typography>
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: "25px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  flexWrap: "wrap"
                                }}
                              >
                                {this.state.specificRestrictions.length ? (
                                  this.state.specificRestrictions.map(
                                    (subIngredient, i) => (
                                      <Chip
                                        avatar={
                                          <Avatar>
                                            {" "}
                                            {this.getSubIngredientAvatar(
                                              subIngredient
                                            )}{" "}
                                          </Avatar>
                                        }
                                        style={{
                                          marginRight: "8px",
                                          marginBottom: "8px"
                                        }}
                                        label={this.getSubIngredientTitle(
                                          subIngredient
                                        )}
                                        key={i}
                                        onRequestDelete={this.handleSubIngredientChipDeleteSpecificRestriction.bind(
                                          this,
                                          subIngredient
                                        )}
                                      />
                                    )
                                  )
                                ) : (
                                  <Chip
                                    className="chip--bordered"
                                    label="Ingredient"
                                  />
                                )}
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      </Collapse>
                    </div>
                  ))}
                  <Button raised onClick={this.increaseProfileCount.bind(this)} style={{ marginTop: "25px" }}>
                    Add a profile
                  </Button>
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

Step3LifestyleProfile.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired
};

export default withStyles(styles)(Step3LifestyleProfile);
