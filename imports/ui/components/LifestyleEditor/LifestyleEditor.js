/* eslint-disable max-len, no-return-assign */

/* 
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch. 
*/

import React from "react";
import PropTypes from "prop-types";

import Autosuggest from "react-autosuggest";

import _ from "lodash";

import { Meteor } from "meteor/meteor";

import Button from "material-ui/Button";
import { MenuItem } from "material-ui/Menu";
import TextField from "material-ui/TextField";
import Input, { InputLabel, InputAdornment } from "material-ui/Input";
import {
  FormControl,
  FormHelperText,
  FormControlLabel
} from "material-ui/Form";

import Checkbox from "material-ui/Checkbox";
import Radio, { RadioGroup } from "material-ui/Radio";

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText
} from "material-ui/Dialog";

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow
} from "material-ui/Table";
import Chip from "material-ui/Chip";
import Paper from "material-ui/Paper";

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import Avatar from "material-ui/Avatar";

import { red } from "material-ui/colors";
import ChevronLeft from "material-ui-icons/ChevronLeft";
import Search from "material-ui-icons/Search";

import validate from "../../../modules/validate";

// const primary = teal[500];
const danger = red[700];

import "./LifestyleEditor.scss";

const styles = theme => ({});

class LifestyleEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //I know state is pretty shit and fucked up w.r.t. readability.

      valueDiscountOrExtraAthletic:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountAthletic") ||
          this.props.lifestyle.hasOwnProperty("extraAthletic"))
          ? this.props.lifestyle.hasOwnProperty("discountAthletic")
            ? "discount"
            : "extra"
          : "none",

      valueDiscountOrExtraBodybuilder:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountBodybuilder") ||
          this.props.lifestyle.hasOwnProperty("extraBodybuilder"))
          ? this.props.lifestyle.hasOwnProperty("discountBodybuilder")
            ? "discount"
            : "extra"
          : "none",

      valueDiscountOrExtraStudent:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountStudent") ||
          this.props.lifestyle.hasOwnProperty("extraStudent"))
          ? this.props.lifestyle.hasOwnProperty("discountStudent")
            ? "discount"
            : "extra"
          : "none",

      valueDiscountOrExtraSenior:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountSenior") ||
          this.props.lifestyle.hasOwnProperty("extraSenior"))
          ? this.props.lifestyle.hasOwnProperty("discountSenior")
            ? "discount"
            : "extra"
          : "none",

      valueTypes: "",
      suggestionsTypes: [],
      restrictions:
        this.props.lifestyle &&
        this.props.restrictions &&
        !this.props.newLifestyle
          ? _.sortBy(
              this.props.restrictions.filter(
                (e, i) =>
                  this.props.lifestyle.restrictions.indexOf(e._id) !== -1
              ),
              "title"
            )
          : [],
      deleteDialogOpen: false,
      hasFormChanged: false,

      custom:
        this.props.lifestyle && !this.props.newLifestyle
          ? this.props.lifestyle.custom
          : false,
      disableRestrictions:
        this.props.lifestyle && !this.props.newLifestyle
          ? this.props.lifestyle.disableRestrictions
          : false,

      // discountOrExtraSelectedAthletic: false,
      discountOrExtraSelectedAthletic: !!(
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountAthletic") ||
          this.props.lifestyle.hasOwnProperty("extraAthletic"))
      ),

      discountOrExtraSelectedBodybuilder: !!(
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountBodybuilder") ||
          this.props.lifestyle.hasOwnProperty("extraBodybuilder"))
      ),

      // discountOrExtraSelectedStudent: false,
      discountOrExtraSelectedStudent: !!(
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountStudent") ||
          this.props.lifestyle.hasOwnProperty("extraStudent"))
      ),

      // discountOrExtraSelectedSenior: false,
      discountOrExtraSelectedSenior: !!(
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountSenior") ||
          this.props.lifestyle.hasOwnProperty("extraSenior"))
      ),

      // discountTypeAthletic: 'Percentage',
      discountTypeAthletic:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        this.props.lifestyle.discountOrExtraTypeAthletic
          ? this.props.lifestyle.discountOrExtraTypeAthletic
          : "Percentage",

      discountTypeBodybuilder:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        this.props.lifestyle.discountOrExtraTypeBodybuilder
          ? this.props.lifestyle.discountOrExtraTypeBodybuilder
          : "Percentage",

      // discountTypeStudent: 'Percentage',
      discountTypeStudent:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        this.props.lifestyle.discountOrExtraTypeStudent
          ? this.props.lifestyle.discountOrExtraTypeStudent
          : "Percentage",

      // discountTypeSenior: 'Percentage',
      discountTypeSenior:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        this.props.lifestyle.discountOrExtraTypeSenior
          ? this.props.lifestyle.discountOrExtraTypeSenior
          : "Percentage",

      // discountOrExtraAmountAthletic: '',
      discountOrExtraAmountAthletic:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountAthletic") ||
          this.props.lifestyle.hasOwnProperty("extraAthletic"))
          ? this.props.lifestyle.hasOwnProperty("discountAthletic")
            ? this.props.lifestyle.discountAthletic
            : this.props.lifestyle.extraAthletic
          : "",

      discountOrExtraAmountBodybuilder:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountBodybuilder") ||
          this.props.lifestyle.hasOwnProperty("extraBodybuilder"))
          ? this.props.lifestyle.hasOwnProperty("discountBodybuilder")
            ? this.props.lifestyle.discountBodybuilder
            : this.props.lifestyle.extraBodybuilder
          : "",

      // discountOrExtraAmountStudent: '',
      discountOrExtraAmountStudent:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountStudent") ||
          this.props.lifestyle.hasOwnProperty("extraStudent"))
          ? this.props.lifestyle.hasOwnProperty("discountStudent")
            ? this.props.lifestyle.discountStudent
            : this.props.lifestyle.extraStudent
          : "",

      // discountOrExtraAmountSenior: '',
      discountOrExtraAmountSenior:
        !this.props.newLifestyle &&
        this.props.lifestyle &&
        (this.props.lifestyle.hasOwnProperty("discountSenior") ||
          this.props.lifestyle.hasOwnProperty("extraSenior"))
          ? this.props.lifestyle.hasOwnProperty("discountSenior")
            ? this.props.lifestyle.discountSenior
            : this.props.lifestyle.extraSenior
          : ""
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
        title: {
          required: true
        }
      },
      messages: {
        title: {
          required: "Name required."
        }
      },
      submitHandler() {
        component.handleSubmit();
      }
    });

    $('[name*="price_"]').on("change", () => {
      this.setState({
        hasFormChanged: true,
        restrictions: clonedRestrictions
      });
    });
  }

  /* Dialog box controls */
  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  onChangeTypes(event, { newValue }) {
    this.setState({
      valueTypes: newValue
    });
  }

  onSuggestionSelectedTypes(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    const clonedRestrictions = this.state.restrictions
      ? this.state.restrictions.slice()
      : [];

    let isThere = false;

    if (clonedRestrictions.length > 0) {
      isThere = clonedRestrictions.filter(
        present => suggestion._id === present._id
      );
    }

    if (isThere != false) {
      return;
    }

    clonedRestrictions.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      hasFormChanged: true,
      restrictions: clonedRestrictions
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.

  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value)
    });
  }

  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: []
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestionsTypes(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.restrictions.filter(
          type => type.title.toLowerCase().slice(0, inputLength) === inputValue
        );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValueTypes(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, category } = this.props;

    const existingLifestyle = category && category._id;
    localStorage.setItem("lifestyleDeleted", category.title);
    const lifestyleDeletedMessage = `${localStorage.getItem(
      "lifestyleDeleted"
    )} deleted from lifestyles.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call("lifestyles.remove", existingLifestyle, error => {
      if (error) {
        popTheSnackbar({
          message: error.reason
        });
      } else {
        popTheSnackbar({
          message: lifestyleDeletedMessage
        });

        history.push("/lifestyles");
      }
    });
  }

  //different function for each of the lifestyle discounts/extra types is bad,
  //make a single function for each (textfield, radiobutton, and selectfield) and pass what needs to
  //be changed via params
  //refactor v.75

  handleDiscountChangeAthletic(event, value) {
    // console.log(event.target.value);

    this.setState({
      discountTypeAthletic: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraValueChangeAthletic(event, value) {
    this.setState({
      discountOrExtraAmountAthletic: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountChangeBodybuilder(event, value) {
    // console.log(event.target.value);

    this.setState({
      discountTypeBodybuilder: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraValueChangeBodybuilder(event, value) {
    this.setState({
      discountOrExtraAmountBodybuilder: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraRadioChangeAthletic(event, value) {
    let discountOrExtraSelectedAthletic = true;

    if (value == "none") {
      discountOrExtraSelectedAthletic = false;
    }

    this.setState({
      discountOrExtraSelectedAthletic,
      valueDiscountOrExtraAthletic: value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraRadioChangeBodybuilder(event, value) {
    let discountOrExtraSelectedBodybuilder = true;

    if (value == "none") {
      discountOrExtraSelectedBodybuilder = false;
    }

    this.setState({
      discountOrExtraSelectedBodybuilder,
      valueDiscountOrExtraBodybuilder: value,
      hasFormChanged: true
    });
  }

  handleDiscountChangeStudent(event, value) {
    // console.log(event.target.value);

    this.setState({
      discountTypeStudent: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraValueChangeStudent(event, value) {
    this.setState({
      discountOrExtraAmountStudent: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraRadioChangeStudent(event, value) {
    let discountOrExtraSelectedStudent = true;

    if (value == "none") {
      discountOrExtraSelectedStudent = false;
    }

    this.setState({
      discountOrExtraSelectedStudent,
      valueDiscountOrExtraStudent: value,
      hasFormChanged: true
    });
  }

  handleDiscountChangeSenior(event, value) {
    // console.log(event.target.value);

    this.setState({
      discountTypeSenior: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraValueChangeSenior(event, value) {
    this.setState({
      discountOrExtraAmountSenior: event.target.value,
      hasFormChanged: true
    });
  }

  handleDiscountOrExtraRadioChangeSenior(event, value) {
    let discountOrExtraSelectedSenior = true;

    if (value == "none") {
      discountOrExtraSelectedSenior = false;
    }

    this.setState({
      discountOrExtraSelectedSenior,
      valueDiscountOrExtraSenior: value,
      hasFormChanged: true
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingLifestyle = this.props.lifestyle && this.props.lifestyle._id;
    const methodToCall = existingLifestyle
      ? "lifestyles.update"
      : "lifestyles.insert";

    let lifestyle = {
      title: document.querySelector("#title").value.trim(),
      restrictions: this.state.restrictions.map((e, i) => e._id),
      prices: {
        breakfast: [],
        lunch: [],
        dinner: []
      },
      custom: this.state.custom,
      disableRestrictions: this.state.disableRestrictions
    };

    if (this.state.discountOrExtraSelectedAthletic) {
      const discountOrExtraAthletic = `${
        this.state.valueDiscountOrExtraAthletic
      }Athletic`;

      lifestyle[discountOrExtraAthletic] = parseFloat(
        this.state.discountOrExtraAmountAthletic
      );
      lifestyle.discountOrExtraTypeAthletic = this.state.discountTypeAthletic;
    }

    if (this.state.discountOrExtraSelectedBodybuilder) {
      const discountOrExtraBodybuilder = `${
        this.state.valueDiscountOrExtraBodybuilder
      }Bodybuilder`;

      lifestyle[discountOrExtraBodybuilder] = parseFloat(
        this.state.discountOrExtraAmountBodybuilder
      );
      lifestyle.discountOrExtraTypeBodybuilder = this.state.discountTypeBodybuilder;
    }

    if (this.state.discountOrExtraSelectedStudent) {
      const discountOrExtraStudent = `${
        this.state.valueDiscountOrExtraStudent
      }Student`;

      lifestyle[discountOrExtraStudent] = parseFloat(
        this.state.discountOrExtraAmountStudent
      );
      lifestyle.discountOrExtraTypeStudent = this.state.discountTypeStudent;
    }

    if (this.state.discountOrExtraSelectedSenior) {
      const discountOrExtraSenior = `${
        this.state.valueDiscountOrExtraSenior
      }Senior`;
      lifestyle[discountOrExtraSenior] = parseFloat(
        this.state.discountOrExtraAmountSenior
      );
      lifestyle.discountOrExtraTypeSenior = this.state.discountTypeSenior;
    }

    if (existingLifestyle) {
      lifestyle._id = existingLifestyle;

      if (this.state.valueDiscountOrExtraAthletic == "none") {
        delete lifestyle.discountAthletic;
        delete lifestyle.extraAthletic;
        delete lifestyle.discountOrExtraTypeAthletic;
      }

      if (this.state.valueDiscountOrExtraBodybuilder == "none") {
        delete lifestyle.discountBodybuilder;
        delete lifestyle.extraBodybuilder;
        delete lifestyle.discountOrExtraTypeBodybuilder;
      }

      if (this.state.valueDiscountOrExtraStudent == "none") {
        delete lifestyle.discountStudent;
        delete lifestyle.extraStudent;
        delete lifestyle.discountOrExtraTypeStudent;
      }

      if (this.state.valueDiscountOrExtraSenior == "none") {
        delete lifestyle.discountSenior;
        delete lifestyle.extraSenior;
        delete lifestyle.discountOrExtraTypeSenior;
      }
    }

    for (let i = 1; i <= 8; i += 1) {
      const brekafastInput = `input[name='price_breakfast_${i}']`;
      const lunchInput = `input[name='price_lunch_${i}']`;
      const dinnerInput = `input[name='price_dinner_${i}']`;

      lifestyle.prices.breakfast.push(parseFloat($(brekafastInput).val()));
      lifestyle.prices.lunch.push(parseFloat($(lunchInput).val()));
      lifestyle.prices.dinner.push(parseFloat($(dinnerInput).val()));
    }

    console.log(lifestyle);

    Meteor.call(methodToCall, lifestyle, (error, lifestyleId) => {
      console.log("Inside Method");

      if (error) {
        console.log(error);

        popTheSnackbar({
          message: error.reason
        });
      } else {
        localStorage.setItem(
          "lifestyleForSnackbar",
          lifestyle.title || $('[name="title"]').val()
        );

        const confirmation = existingLifestyle
          ? `${localStorage.getItem("lifestyleForSnackbar")} lifestyle updated.`
          : `${localStorage.getItem("lifestyleForSnackbar")} lifestyle added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: "View",
          buttonLink: `/lifestyles/${lifestyleId}/edit`
        });

        history.push("/lifestyles");
      }
    });
  }

  renderDeleteDialog() {
    return (
      <Dialog
        open={this.state.deleteDialogOpen}
        onRequestClose={this.deleteDialogHandleRequestClose.bind(this)}
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
          Delete{" "}
          {this.props.lifestyle ? this.props.lifestyle.title.toLowerCase() : ""}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{" "}
            {this.props.lifestyle
              ? this.props.lifestyle.title.toLowerCase()
              : ""}?
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
    );
  }

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }

  renderSuggestionTypes(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
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

  renderInputTypes(inputProps) {
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

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  renderSuggestionsContainerTypes(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  handleTypeChange(event, name) {
    console.log(`Type changed ${event.target.value}`);
    this.setState({ selectedType: event.target.value, hasFormChanged: true });
  }

  handleRestrictionChipDelete(type) {
    const stateCopy = this.state.restrictions.slice();

    stateCopy.splice(stateCopy.indexOf(type), 1);

    this.setState({
      restrictions: stateCopy,
      hasFormChanged: true
    });
  }

  getTypeTitle(type) {
    // console.log(type);

    if (type.title) {
      return type.title;
    }

    if (this.props.restrictions) {
      return this.props.restrictions.find(el => el._id === type);
    }
  }

  getTypeAvatar(type) {
    if (type.title) {
      return type.title.charAt(0);
    }

    if (this.props.restrictions) {
      const avatarToReturn = this.props.restrictions.find(
        el => el._id === type._id
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  titleFieldChanged(e) {
    // console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged
    });
  }

  changeTableField() {
    this.setState({
      hasFormChanged: true
    });
  }

  render() {
    // console.log(this.props);
    const { lifestyle, history } = this.props;
    return (
      <form
        style={{ width: "100%" }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push("/lifestyles")}
              className="button button-secondary button-secondary--top"
            >
              <Typography
                type="subheading"
                className="subheading font-medium"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <ChevronLeft style={{ marginRight: "4px" }} /> Lifestyles
              </Typography>
            </Button>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: "50px" }}>
          <Grid item xs={4}>
            <Typography
              type="headline"
              className="headline"
              style={{ fontWeight: 500 }}
            >
              {lifestyle && lifestyle._id
                ? `${lifestyle.title}`
                : "Add lifestyle"}
            </Typography>

            {lifestyle ? (
              <Typography
                type="body1"
                style={{ color: "rgba(0, 0, 0, 0.54)" }}
                className="body1"
              >
                {lifestyle.SKU ? lifestyle.SKU : ""}{" "}
              </Typography>
            ) : (
              ""
            )}
          </Grid>
          <Grid item xs={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Button
                style={{ marginRight: "10px" }}
                onClick={() => history.push("/lifestyles")}
              >
                Cancel
              </Button>
              <Button
                disabled={!this.state.hasFormChanged}
                className="btn btn-primary"
                raised
                type="submit"
                color="contrast"
              >
                Save
              </Button>
            </div>
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
                  Lifestyle
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    fullWidth
                    defaultValue={lifestyle && lifestyle.title}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged.bind(this)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.custom}
                        onChange={(event, checked) => {
                          this.setState({
                            custom: checked,
                            hasFormChanged: true
                          });
                        }}
                        value="checked"
                      />
                    }
                    label="Custom"
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Restrictions
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.disableRestrictions}
                        onChange={(event, checked) => {
                          this.setState({
                            disableRestrictions: checked,
                            hasFormChanged: true
                          });
                        }}
                      />
                    }
                    label="Disable restrictions"
                  />

                  <Grid item xs={12} style={{ position: "relative" }}>
                    <Search
                      className="autoinput-icon"
                      style={{ right: "0 !important" }}
                    />
                    <Autosuggest
                      id="1"
                      className="autosuggest"
                      theme={{
                        container: {
                          flexGrow: 1,
                          position: "relative"
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
                      renderInputComponent={this.renderInputTypes.bind(this)}
                      suggestions={this.state.suggestionsTypes}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedTypes.bind(
                        this
                      )}
                      onSuggestionsClearRequested={this.onSuggestionsClearRequestedTypes.bind(
                        this
                      )}
                      onSuggestionSelected={this.onSuggestionSelectedTypes.bind(
                        this
                      )}
                      getSuggestionValue={this.getSuggestionValueTypes.bind(
                        this
                      )}
                      renderSuggestion={this.renderSuggestionTypes.bind(this)}
                      renderSuggestionsContainer={this.renderSuggestionsContainerTypes.bind(
                        this
                      )}
                      focusInputOnSuggestionClick={false}
                      inputProps={{
                        placeholder: "Search",
                        value: this.state.valueTypes,
                        onChange: this.onChangeTypes.bind(this),
                        className: "auto type-autocomplete"
                      }}
                    />
                  </Grid>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: "25px"
                    }}
                  >
                    {this.state.restrictions.length ? (
                      this.state.restrictions.map((e, i) => (
                        <Chip
                          avatar={<Avatar> {this.getTypeAvatar(e)} </Avatar>}
                          style={{ marginRight: "8px", marginBottom: "8px" }}
                          label={e.title}
                          key={i}
                          onRequestDelete={this.handleRestrictionChipDelete.bind(
                            this,
                            e
                          )}
                        />
                      ))
                    ) : (
                      <Chip className="chip--bordered" label="Restriction" />
                    )}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Price
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Table className="table-lifestyles">
                        <TableHead>
                          <TableRow>
                            <TableCell />

                            <TableCell style={{ textAlign: "center" }}>
                              <Typography
                                type="subheading"
                                className="font-medium font-uppercase"
                              >
                                Breakfast
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <Typography
                                type="subheading"
                                className="font-medium font-uppercase"
                              >
                                Lunch
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <Typography
                                type="subheading"
                                className="font-medium font-uppercase"
                              >
                                Dinner
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Individual
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[0]
                                }
                                name="price_breakfast_1"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[0]
                                }
                                name="price_lunch_1"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[0]
                                }
                                name="price_dinner_1"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Two
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[1]
                                }
                                name="price_breakfast_2"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[1]
                                }
                                name="price_lunch_2"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[1]
                                }
                                name="price_dinner_2"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Three
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[2]
                                }
                                name="price_breakfast_3"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[2]
                                }
                                name="price_lunch_3"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[2]
                                }
                                name="price_dinner_3"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Four
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[3]
                                }
                                name="price_breakfast_4"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[3]
                                }
                                name="price_lunch_4"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[3]
                                }
                                name="price_dinner_4"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Five
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[4]
                                }
                                name="price_breakfast_5"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[4]
                                }
                                name="price_lunch_5"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[4]
                                }
                                name="price_dinner_5"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Six
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[5]
                                }
                                name="price_breakfast_6"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[5]
                                }
                                name="price_lunch_6"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[5]
                                }
                                name="price_dinner_6"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Seven
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[6]
                                }
                                name="price_breakfast_7"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[6]
                                }
                                name="price_lunch_7"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[6]
                                }
                                name="price_dinner_7"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Typography
                                type="subheading"
                                style={{ marginTop: "10px" }}
                              >
                                Eight
                              </Typography>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.breakfast[7]
                                }
                                name="price_breakfast_8"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.lunch[7]
                                }
                                name="price_lunch_8"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <TextField
                                fullWidth
                                margin="normal"
                                style={{
                                  fontSize: "1rem",
                                  maxWidth: "100px",
                                  minWidth: "100px"
                                }}
                                inputProps={{ type: "number" }}
                                defaultValue={
                                  this.props.newLifestyle
                                    ? ""
                                    : this.props.lifestyle.prices.dinner[7]
                                }
                                name="price_dinner_8"
                                onChange={this.changeTableField.bind(this)}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

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
                  Applying a discount or extra will affect the total amount of a
                  lifestyle's price plan.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography
                        type="subheading"
                        className="font-uppercase font-medium"
                      >
                        Athletic
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="discountOrExtra"
                          name="discountOrExtra"
                          value={this.state.valueDiscountOrExtraAthletic}
                          onChange={this.handleDiscountOrExtraRadioChangeAthletic.bind(
                            this
                          )}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="none"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtraAthletic ===
                                  "none"
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
                                  this.state.valueDiscountOrExtraAthletic ===
                                  "extra"
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
                        disabled={!this.state.discountOrExtraSelectedAthletic}
                        fullWidth
                        id="select-discount-type"
                        select
                        label="Type"
                        value={
                          this.state.discountTypeAthletic
                            ? this.state.discountTypeAthletic
                            : ""
                        }
                        onChange={this.handleDiscountChangeAthletic.bind(this)}
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
                        value={this.state.discountOrExtraAmountAthletic}
                        id="discountOrExtraValue"
                        name="discountOrExtraValue"
                        disabled={!this.state.discountOrExtraSelectedAthletic}
                        onChange={this.handleDiscountOrExtraValueChangeAthletic.bind(
                          this
                        )}
                        label="Amount"
                        inputProps={{
                          "aria-label": "Description",
                          type: "number"
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container style={{ marginTop: "50px" }}>
                    <Grid item xs={12}>
                      <Typography
                        type="subheading"
                        className="font-uppercase font-medium"
                      >
                        Bodybuilder
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="discountOrExtra"
                          name="discountOrExtra"
                          value={this.state.valueDiscountOrExtraBodybuilder}
                          onChange={this.handleDiscountOrExtraRadioChangeBodybuilder.bind(
                            this
                          )}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="none"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtraBodybuilder ===
                                  "none"
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
                                  this.state.valueDiscountOrExtraBodybuilder ===
                                  "extra"
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
                        disabled={
                          !this.state.discountOrExtraSelectedBodybuilder
                        }
                        fullWidth
                        id="select-discount-type"
                        select
                        label="Type"
                        value={
                          this.state.discountTypeBodybuilder
                            ? this.state.discountTypeBodybuilder
                            : ""
                        }
                        onChange={this.handleDiscountChangeBodybuilder.bind(
                          this
                        )}
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
                        value={this.state.discountOrExtraAmountBodybuilder}
                        id="discountOrExtraValue"
                        name="discountOrExtraValue"
                        disabled={
                          !this.state.discountOrExtraSelectedBodybuilder
                        }
                        onChange={this.handleDiscountOrExtraValueChangeBodybuilder.bind(
                          this
                        )}
                        label="Amount"
                        inputProps={{
                          "aria-label": "Description",
                          type: "number"
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container style={{ marginTop: "50px" }}>
                    <Grid item xs={12}>
                      <Typography
                        type="subheading"
                        className="font-uppercase font-medium"
                      >
                        Student
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="discountOrExtra"
                          name="discountOrExtra"
                          value={this.state.valueDiscountOrExtraStudent}
                          onChange={this.handleDiscountOrExtraRadioChangeStudent.bind(
                            this
                          )}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="none"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtraStudent ===
                                  "none"
                                }
                              />
                            }
                            label="None"
                          />
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="discount"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtraStudent ===
                                  "discount"
                                }
                              />
                            }
                            label="Discount"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        disabled={!this.state.discountOrExtraSelectedStudent}
                        fullWidth
                        id="select-discount-type"
                        select
                        label="Type"
                        value={
                          this.state.discountTypeStudent
                            ? this.state.discountTypeStudent
                            : ""
                        }
                        onChange={this.handleDiscountChangeStudent.bind(this)}
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
                        value={this.state.discountOrExtraAmountStudent}
                        id="discountOrExtraValue"
                        name="discountOrExtraValue"
                        disabled={!this.state.discountOrExtraSelectedStudent}
                        onChange={this.handleDiscountOrExtraValueChangeStudent.bind(
                          this
                        )}
                        label="Amount"
                        inputProps={{
                          "aria-label": "Description",
                          type: "number"
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container style={{ marginTop: "50px" }}>
                    <Grid item xs={12}>
                      <Typography
                        type="subheading"
                        className="font-uppercase font-medium"
                      >
                        Senior
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="discountOrExtra"
                          name="discountOrExtra"
                          value={this.state.valueDiscountOrExtraSenior}
                          onChange={this.handleDiscountOrExtraRadioChangeSenior.bind(
                            this
                          )}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="none"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtraSenior ===
                                  "none"
                                }
                              />
                            }
                            label="None"
                          />
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="discount"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtraSenior ===
                                  "discount"
                                }
                              />
                            }
                            label="Discount"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        disabled={!this.state.discountOrExtraSelectedSenior}
                        fullWidth
                        id="select-discount-type"
                        select
                        label="Type"
                        value={
                          this.state.discountTypeSenior
                            ? this.state.discountTypeSenior
                            : ""
                        }
                        onChange={this.handleDiscountChangeSenior.bind(this)}
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
                        value={this.state.discountOrExtraAmountSenior}
                        id="discountOrExtraValue"
                        name="discountOrExtraValue"
                        disabled={!this.state.discountOrExtraSelectedSenior}
                        onChange={this.handleDiscountOrExtraValueChangeSenior.bind(
                          this
                        )}
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

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {//                      style={{ backgroundColor: danger, color: '#FFFFFF' }}
                this.props.newLifestyle ? (
                  ""
                ) : (
                  <Button
                    raised
                    onClick={
                      lifestyle && lifestyle._id
                        ? this.handleRemove.bind(this)
                        : () => this.props.history.push("/lifestyles")
                    }
                    disabled={true}
                  >
                    Delete
                  </Button>
                )}
              </Grid>

              <Grid item xs={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end"
                  }}
                >
                  <Button
                    style={{ marginRight: "10px" }}
                    onClick={() => history.push("/lifestyles")}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!this.state.hasFormChanged}
                    type="submit"
                    className="btn btn-primary"
                    raised
                    color="contrast"
                  >
                    Save
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {this.renderDeleteDialog()}
      </form>
    );
  }
}

LifestyleEditor.defaultProps = {
  category: { title: "" }
};

LifestyleEditor.propTypes = {
  category: PropTypes.object,
  restrictions: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default LifestyleEditor;
