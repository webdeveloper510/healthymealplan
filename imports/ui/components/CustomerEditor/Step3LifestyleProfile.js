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

import update from "react-addons-update";

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

      restrictions: [],

      // peanuts: false,
      // milk: false,
      // egg: false,
      // wheat: false,
      // soy: false,
      // fish: false,
      // shellfish: false,

      // ketogenic: false,
      // glutenfree: false,
      // lowcarb: false,
      // nocarb: false,
      // ovolacto: false,
      // ovo: false,
      // lacto: false,
      // pescatarian: false,
      // paleo: false,
      // vegan: false,

      // halal: false,
      // kosher: false,

      // collapse
      primaryCollapse: true,
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

    const currentSecondaryProfiles = this.state.secondaryProfilesData.slice();

    currentSecondaryProfiles.push({
      first_name: "",
      last_name: "",
      subIngredients: [],
      specificRestrictions: [],
      lifestyle: this.props.customerInfo.adultOrChild
        ? this.props.customerInfo.adultOrChild
        : "traditional",
      extra: this.props.customerInfo.extra
        ? this.props.customerInfo.extra
        : "none",
      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : "none",
      restrictions: []
    });

    this.setState({
      secondaryProfileCount: increasedProfileCount,
      secondaryProfilesData: currentSecondaryProfiles
    });
  }

  removeProfile(index) {
    if (this.secondaryProfileCount < 1) {
      return;
    }

    const decreasedProfileCount = this.state.secondaryProfileCount - 1;
    const profileToRemove = this.state.secondaryProfilesData.slice();

    profileToRemove.splice(profileToRemove.indexOf(index), 1);

    this.setState({
      secondaryProfileCount: decreasedProfileCount,
      secondaryProfilesData: profileToRemove
    });
  }

  handleProfileOpen(primary, index) {
    if (primary) {
      this.setState({
        primaryCollapse: !this.state.primaryCollapse
      });
    } else {
      const currentCollapseArr = this.state.secondaryCollapses.slice();

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
    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value
    );

    const currentRestrictionsIds = this.state.restrictions.length
      ? this.state.restrictions.slice()
      : [];

    currentRestrictionsIds.push(...getLifestyleRestrictions.restrictions);

    this.setState({
      lifestyle: value,
      lifestyleRestrictions: currentRestrictionsIds
    });
  }

  handleChangeRadioLifestyleSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].lifestyle = value;

    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value
    );

    const currentRestrictionsIds = this.state.secondaryProfilesData[i]
      .restrictions.length
      ? this.state.secondaryProfilesData[i].restrictions.slice()
      : [];

    currentRestrictionsIds.push(...getLifestyleRestrictions.restrictions);

    this.state.secondaryProfilesData[
      i
    ].lifestyleRestrictions = currentRestrictionsIds;

    this.forceUpdate();
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

  handleChangeRadioExtraSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].extra = value;
    this.forceUpdate();
  }

  handleChangeRadioDiscount(event, value) {
    this.setState({
      discount: value
    });
  }

  handleChangeRadioDiscountSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].discount = value;
    this.forceUpdate();
  }

  handleChange(id, event, checked) {
    const clonedRestrictionIds = this.state.restrictions
      ? this.state.restrictions.slice()
      : [];

    if (clonedRestrictionIds.indexOf(id) != -1) {
      clonedRestrictionIds.splice(clonedRestrictionIds.indexOf(id), 1);
    } else {
      clonedRestrictionIds.push(id);
    }

    this.setState({
      restrictions: clonedRestrictionIds
    });
  }

  handleChangeSecondary(index, id, event, checked) {
    const clonedRestrictionIds = this.state.secondaryProfilesData[index]
      .restrictions
      ? this.state.secondaryProfilesData[index].restrictions.slice()
      : [];

    if (clonedRestrictionIds.indexOf(id) != -1) {
      clonedRestrictionIds.splice(clonedRestrictionIds.indexOf(id), 1);
    } else {
      clonedRestrictionIds.push(id);
    }

    this.state.secondaryProfilesData[index].restrictions = clonedRestrictionIds;

    this.forceUpdate();
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

    this.deleteDialogHandleRequestClose();
  }

  onSuggestionSelectedSecondary(
    index,
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    let clonedSubIngredients;

    console.log(index);

    if (this.state.addRestrictionType == "Preference") {
      // subingredients
      let isThere = false;

      if (this.state.secondaryProfilesData[index].subIngredients.length > 0) {
        isThere = this.state.secondaryProfilesData[index].subIngredients.filter(
          present => suggestion._id === present._id
        );
      }

      if (isThere != false) {
        return;
      }

      this.state.secondaryProfilesData[index].subIngredients.push({
        _id: suggestion._id,
        title: suggestion.title
      });
    } else {
      // specificRestrictions

      let isThere = false;

      if (
        this.state.secondaryProfilesData[index].specificRestrictions.length > 0
      ) {
        isThere = this.state.secondaryProfilesData[
          index
        ].specificRestrictions.filter(
          present => suggestion._id === present._id
        );
      }

      if (isThere != false) {
        return;
      }

      this.state.secondaryProfilesData[index].specificRestrictions.push({
        _id: suggestion._id,
        title: suggestion.title
      });
    }

    this.deleteDialogHandleRequestClose();

    this.forceUpdate();
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
                            {this.props.lifestyles.map(e => (
                              <FormControlLabel
                                value={e.title}
                                control={<Radio />}
                                label={e.title}
                                selected
                              />
                            ))}
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
                              disabled={
                                this.state.lifestyle &&
                                this.props.lifestyles.find(
                                  element =>
                                    element.title == this.state.lifestyle &&
                                    !element.extraAthletic &&
                                    !element.extraBodybuilder
                                )
                              }
                            />
                            <FormControlLabel
                              value="athletic"
                              control={<Radio />}
                              label="Athletic"
                              disabled={
                                this.state.lifestyle &&
                                this.props.lifestyles.find(
                                  element =>
                                    element.title == this.state.lifestyle &&
                                    !element.extraAthletic
                                )
                              }
                            />
                            <FormControlLabel
                              value="bodybuilder"
                              control={<Radio />}
                              label="Bodybuilder"
                              disabled={
                                this.state.lifestyle &&
                                this.props.lifestyles.find(
                                  element =>
                                    element.title == this.state.lifestyle &&
                                    !element.extraBodybuilder
                                )
                              }
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
                              disabled={
                                this.state.lifestyle &&
                                this.props.lifestyles.find(
                                  element =>
                                    element.title == this.state.lifestyle &&
                                    !element.discountStudent &&
                                    !element.discountSenior
                                )
                              }
                            />
                            <FormControlLabel
                              value="student"
                              control={<Radio />}
                              label="Student"
                              disabled={
                                this.state.lifestyle &&
                                this.props.lifestyles.find(
                                  element =>
                                    element.title == this.state.lifestyle &&
                                    !element.discountStudent
                                )
                              }
                            />
                            <FormControlLabel
                              value="senior"
                              control={<Radio />}
                              label="Senior"
                              disabled={
                                this.state.lifestyle &&
                                this.props.lifestyles.find(
                                  element =>
                                    element.title == this.state.lifestyle &&
                                    !element.discountSenior
                                )
                              }
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
                            {this.props.restrictions
                              .filter(e => e.restrictionType === "allergy")
                              .map((e, i) => {
                                const isSelected = this.state.restrictions
                                  .length
                                  ? this.state.restrictions.indexOf(e._id) != -1
                                  : false;

                                const isAlreadyChecked = this.state
                                  .lifestyleRestrictions
                                  ? this.state.lifestyleRestrictions.indexOf(
                                      e._id
                                    ) != -1
                                  : false;
                                return (
                                  <FormControlLabel
                                    key={i}
                                    disabled={isAlreadyChecked}
                                    control={
                                      <Checkbox
                                        checked={isSelected || isAlreadyChecked}
                                        onChange={this.handleChange.bind(
                                          this,
                                          e._id
                                        )}
                                        value={e.title.toLowerCase()}
                                      />
                                    }
                                    label={e.title}
                                  />
                                );
                              })}
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Dietary</FormLabel>
                          <FormGroup>
                            {this.props.restrictions
                              .filter(e => e.restrictionType === "dietary")
                              .map((e, i) => {
                                const isSelected = this.state.restrictions
                                  .length
                                  ? this.state.restrictions.indexOf(e._id) != -1
                                  : false;

                                const isAlreadyChecked = this.state
                                  .lifestyleRestrictions
                                  ? this.state.lifestyleRestrictions.indexOf(
                                      e._id
                                    ) != -1
                                  : false;
                                return (
                                  <FormControlLabel
                                    key={i}
                                    disabled={isAlreadyChecked}
                                    control={
                                      <Checkbox
                                        checked={isSelected || isAlreadyChecked}
                                        onChange={this.handleChange.bind(
                                          this,
                                          e._id
                                        )}
                                        value={e.title.toLowerCase()}
                                      />
                                    }
                                    label={e.title}
                                  />
                                );
                              })}
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Religious</FormLabel>
                          <FormGroup>
                            {this.props.restrictions
                              .filter(e => e.restrictionType === "religious")
                              .map((e, i) => {
                                const isSelected = this.state.restrictions
                                  .length
                                  ? this.state.restrictions.indexOf(e._id) != -1
                                  : false;

                                const isAlreadyChecked = this.state
                                  .lifestyleRestrictions
                                  ? this.state.lifestyleRestrictions.indexOf(
                                      e._id
                                    ) != -1
                                  : false;
                                return (
                                  <FormControlLabel
                                    key={i}
                                    disabled={isAlreadyChecked}
                                    control={
                                      <Checkbox
                                        checked={isSelected || isAlreadyChecked}
                                        onChange={this.handleChange.bind(
                                          this,
                                          e._id
                                        )}
                                        value={e.title.toLowerCase()}
                                      />
                                    }
                                    label={e.title}
                                  />
                                );
                              })}
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

                  {this.state.secondaryProfilesData.map((e, profileIndex) => (
                    <div key={profileIndex}>
                      <ListItem
                        style={{ marginTop: "15px", marginBottom: "15px" }}
                        button
                        onClick={this.handleProfileOpen.bind(
                          this,
                          false,
                          profileIndex
                        )}
                      >
                        <ListItemText
                          primary={
                            this.state.secondaryProfilesData[profileIndex]
                              .first_name
                              ? `${
                                  this.state.secondaryProfilesData[profileIndex]
                                    .first_name
                                }'s Profile`
                              : `Profile ${profileIndex + 2}`
                          }
                        />
                        {this.state.secondaryCollapses[profileIndex] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </ListItem>
                      <Collapse
                        in={this.state.secondaryCollapses[profileIndex]}
                        transitionDuration="auto"
                        component="div"
                      >
                        <div
                          style={{ paddingLeft: "16px", paddingRight: "16px" }}
                        >
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
                                onChange={event => {
                                  this.state.secondaryProfilesData[
                                    profileIndex
                                  ].first_name =
                                    event.target.value;
                                  this.forceUpdate();
                                }}
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
                                  value={
                                    this.state.secondaryProfilesData[
                                      profileIndex
                                    ].lifestyle
                                  }
                                  onChange={this.handleChangeRadioLifestyleSecondary.bind(
                                    this,
                                    profileIndex
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  {this.props.lifestyles.map(e => (
                                    <FormControlLabel
                                      value={e.title}
                                      control={<Radio />}
                                      label={e.title}
                                      selected
                                    />
                                  ))}
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
                                  value={
                                    this.state.secondaryProfilesData[
                                      profileIndex
                                    ].extra
                                  }
                                  onChange={this.handleChangeRadioExtraSecondary.bind(
                                    this,
                                    profileIndex
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  <FormControlLabel
                                    value="none"
                                    control={<Radio />}
                                    label="None"
                                    selected
                                    disabled={
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      this.props.lifestyles.find(
                                        element =>
                                          element.title ==
                                            this.state.secondaryProfilesData[
                                              profileIndex
                                            ].lifestyle &&
                                          !element.extraAthletic &&
                                          !element.extraBodybuilder
                                      )
                                    }
                                  />
                                  <FormControlLabel
                                    value="athletic"
                                    control={<Radio />}
                                    label="Athletic"
                                    disabled={
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      this.props.lifestyles.find(
                                        element =>
                                          element.title ==
                                            this.state.secondaryProfilesData[
                                              profileIndex
                                            ].lifestyle &&
                                          !element.extraAthletic
                                      )
                                    }
                                  />
                                  <FormControlLabel
                                    value="bodybuilder"
                                    control={<Radio />}
                                    label="Bodybuilder"
                                    disabled={
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      this.props.lifestyles.find(
                                        element =>
                                          element.title ==
                                            this.state.secondaryProfilesData[
                                              profileIndex
                                            ].lifestyle &&
                                          !element.extraBodybuilder
                                      )
                                    }
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
                                  value={
                                    this.state.secondaryProfilesData[
                                      profileIndex
                                    ].discount
                                  }
                                  onChange={this.handleChangeRadioDiscountSecondary.bind(
                                    this,
                                    profileIndex
                                  )}
                                  style={{ flexDirection: "row" }}
                                >
                                  <FormControlLabel
                                    value="none"
                                    control={<Radio />}
                                    label="None"
                                    selected
                                    disabled={
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      this.props.lifestyles.find(
                                        element =>
                                          element.title ==
                                            this.state.secondaryProfilesData[
                                              profileIndex
                                            ].lifestyle &&
                                          !element.discountStudent &&
                                          !element.discountSenior
                                      )
                                    }
                                  />
                                  <FormControlLabel
                                    value="student"
                                    control={<Radio />}
                                    label="Student"
                                    disabled={
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      this.props.lifestyles.find(
                                        element =>
                                          element.title ==
                                            this.state.secondaryProfilesData[
                                              profileIndex
                                            ].lifestyle &&
                                          !element.discountStudent
                                      )
                                    }
                                  />
                                  <FormControlLabel
                                    value="senior"
                                    control={<Radio />}
                                    label="Senior"
                                    disabled={
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      this.props.lifestyles.find(
                                        element =>
                                          element.title ==
                                            this.state.secondaryProfilesData[
                                              profileIndex
                                            ].lifestyle &&
                                          !element.discountSenior
                                      )
                                    }
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
                                  {this.props.restrictions
                                    .filter(
                                      e => e.restrictionType === "allergy"
                                    )
                                    .map((e, i) => {
                                      const isSelected = this.state
                                        .secondaryProfilesData[profileIndex]
                                        .restrictions
                                        ? this.state.secondaryProfilesData[
                                            profileIndex
                                          ].restrictions.indexOf(e._id) != -1
                                        : false;

                                      const isAlreadyChecked = this.state
                                        .secondaryProfilesData[profileIndex]
                                        .lifestyleRestrictions
                                        ? this.state.secondaryProfilesData[
                                            profileIndex
                                          ].lifestyleRestrictions.indexOf(
                                            e._id
                                          ) != -1
                                        : false;
                                      return (
                                          <FormControlLabel
                                            key={i}
                                            disabled={isAlreadyChecked}
                                            control={
                                              <Checkbox
                                                checked={
                                                  isSelected || isAlreadyChecked
                                                }
                                                onChange={this.handleChangeSecondary.bind(
                                                  this,
                                                  profileIndex,
                                                  e._id
                                                )}
                                                value={e.title.toLowerCase()}
                                              />
                                            }
                                            label={e.title}
                                          />
                                      );
                                    })}
                                </FormGroup>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Dietary
                                </FormLabel>
                                <FormGroup>
                                  {this.props.restrictions
                                    .filter(
                                      e => e.restrictionType === "dietary"
                                    )
                                    .map((e, i) => {
                                      const isSelected = this.state
                                        .secondaryProfilesData[profileIndex]
                                        .restrictions
                                        ? this.state.secondaryProfilesData[
                                            profileIndex
                                          ].restrictions.indexOf(e._id) != -1
                                        : false;
                                      const isAlreadyChecked = this.state
                                        .secondaryProfilesData[profileIndex]
                                        .lifestyleRestrictions
                                        ? this.state.secondaryProfilesData[
                                            profileIndex
                                          ].lifestyleRestrictions.indexOf(
                                            e._id
                                          ) != -1
                                        : false;

                                      return (
                                        <FormControlLabel
                                          key={i}
                                          disabled={isAlreadyChecked}
                                          control={
                                            <Checkbox
                                              checked={
                                                isSelected || isAlreadyChecked
                                              }
                                              onChange={this.handleChangeSecondary.bind(
                                                this,
                                                profileIndex,
                                                e._id
                                              )}
                                              value={e.title.toLowerCase()}
                                            />
                                          }
                                          label={e.title}
                                        />
                                      );
                                    })}
                                </FormGroup>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl component="fieldset">
                                <FormLabel component="legend">
                                  Religious
                                </FormLabel>
                                <FormGroup>
                                  {this.props.restrictions
                                    .filter(
                                      e => e.restrictionType === "religious"
                                    )
                                    .map((e, i) => {
                                      const isSelected = this.state
                                        .secondaryProfilesData[profileIndex]
                                        .restrictions
                                        ? this.state.secondaryProfilesData[
                                            profileIndex
                                          ].restrictions.indexOf(e._id) != -1
                                        : false;
                                      const isAlreadyChecked = this.state
                                        .secondaryProfilesData[profileIndex]
                                        .lifestyleRestrictions
                                        ? this.state.secondaryProfilesData[
                                            profileIndex
                                          ].lifestyleRestrictions.indexOf(
                                            e._id
                                          ) != -1
                                        : false;
                                      return (
                                        <FormControlLabel
                                          key={i}
                                          disabled={isAlreadyChecked}
                                          control={
                                            <Checkbox
                                              checked={
                                                isSelected || isAlreadyChecked
                                              }
                                              onChange={this.handleChangeSecondary.bind(
                                                this,
                                                profileIndex,
                                                e._id
                                              )}
                                              value={e.title.toLowerCase()}
                                            />
                                          }
                                          label={e.title}
                                        />
                                      );
                                    })}
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
                                onSuggestionSelected={this.onSuggestionSelectedSecondary.bind(
                                  this,
                                  profileIndex
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
                                {this.state.secondaryProfilesData[profileIndex]
                                  .subIngredients.length ? (
                                  this.state.secondaryProfilesData[
                                    profileIndex
                                  ].subIngredients.map((subIngredient, i) => (
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
                                  ))
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
                                {this.state.secondaryProfilesData[profileIndex]
                                  .specificRestrictions.length ? (
                                  this.state.secondaryProfilesData[
                                    profileIndex
                                  ].specificRestrictions.map(
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
                          <Button
                            raised
                            onClick={this.removeProfile.bind(
                              this,
                              profileIndex
                            )}
                            style={{ float: "right" }}
                          >
                            Remove profile
                          </Button>
                        </div>
                      </Collapse>
                    </div>
                  ))}
                  <Button
                    color="danger"
                    onClick={this.increaseProfileCount.bind(this)}
                    style={{ marginTop: "25px" }}
                  >
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
