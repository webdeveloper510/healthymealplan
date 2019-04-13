/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import autoBind from 'react-autobind';

import Autosuggest from "react-autosuggest";
import _ from "lodash";

// import NumberFormat from 'react-number-format';

import { MenuItem } from "material-ui/Menu";
import TextField from "material-ui/TextField";
// import IconButton from 'material-ui/IconButton';
// import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl, FormControlLabel } from "material-ui/Form";
import Radio, { RadioGroup } from "material-ui/Radio";

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText
} from "material-ui/Dialog";

import Button from "material-ui/Button";
import Chip from "material-ui/Chip";
import Paper from "material-ui/Paper";

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import Avatar from "material-ui/Avatar";

import { red } from "material-ui/colors";
import ChevronLeft from "material-ui-icons/ChevronLeft";
import Search from "material-ui-icons/Search";

import Loading from "../../components/Loading/Loading";
import validate from "../../../modules/validate";

const danger = red[700];

const styles = theme => ({});

class RestrictionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valueRestriction:
        this.props.restriction && !this.props.newRestriction
          ? this.props.restriction.restrictionType
          : "", // radio

      value: "",
      valueTypes: "",
      valueCategories: "",

      suggestions: [],
      suggestionsTypes: [],
      suggestionsCategories: [],

      // ingredients:
      //   this.props.restriction &&
      //   !this.props.newRestriction &&
      //   this.props.ingredients
      //     ? _.sortBy(
      //         this.props.ingredients.filter(
      //           (e, i) =>
      //             this.props.restriction.ingredients.indexOf(e._id) !== -1
      //         ),
      //         "title"
      //       )
      //     : [],

      ingredients:
        this.props.restriction &&
          !this.props.newRestriction &&
          this.props.ingredients
          ? this.props.restriction.ingredients
          : [],

      types:
        !this.props.newRestriction &&
          this.props.restriction &&
          this.props.ingredientTypes
          ? this.props.restriction.types
          : [],

      categories:
        !this.props.newRestriction &&
          this.props.restriction &&
          this.props.categories
          ? this.props.restriction.categories
          : [],

      deleteDialogOpen: false,
      hasFormChanged: false,

      valueDiscountOrExtra:
        !this.props.newRestriction &&
          this.props.restriction &&
          (this.props.restriction.hasOwnProperty("discount") ||
            this.props.restriction.hasOwnProperty("extra"))
          ? this.props.restriction.hasOwnProperty("discount")
            ? "discount"
            : "extra"
          : "none",

      discountOrExtraSelected: !!(
        !this.props.newRestriction &&
        this.props.restriction &&
        (this.props.restriction.hasOwnProperty("discount") ||
          this.props.restriction.hasOwnProperty("extra"))
      ),

      discountType:
        !this.props.newRestriction &&
          this.props.restriction &&
          this.props.restriction.discountOrExtraType
          ? this.props.restriction.discountOrExtraType
          : "Percentage",

      discountOrExtraAmount:
        !this.props.newRestriction &&
          this.props.restriction &&
          (this.props.restriction.hasOwnProperty("discount") ||
            this.props.restriction.hasOwnProperty("extra"))
          ? this.props.restriction.hasOwnProperty("discount")
            ? this.props.restriction.discount
            : this.props.restriction.extra
          : ""
    };

    autoBind(this);
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
          required: true,
        },
        restrictionType: {
          required: true,
        },
        discountOrExtraValue: {
          min: -100,
          max: 100,
        },
      },
      messages: {
        title: {
          required: "Name required.",
        },
        restrictionType: {
          required: "Restriction type required.",
        },
      },
/*      submitHandler() {
        component.handleSubmit();
      }*/
    });
  }

  /* Dialog box controls */
  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  handleDiscountChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      discountType: event.target.value
    });
  }

  handleDiscountOrExtraValueChange(event, value) {
    this.setState({
      hasFormChanged: true,
      discountOrExtraAmount: event.target.value
    });
  }

  handleDiscountOrExtraRadioChange(event, value) {
    let discountOrExtraSelected = true;

    if (value == "none") {
      discountOrExtraSelected = false;
    }

    this.setState({
      discountOrExtraSelected,
      valueDiscountOrExtra: value,
      hasFormChanged: true
    });
  }

  handleRestrictionTypeChange(event, value) {
    this.setState({
      valueRestriction: value,
      hasFormChanged: true
    });
  }
  // Use your imagination to render suggestions.

  onChange(event, { newValue }) {
    this.setState({
      value: newValue
    });
  }

  onChangeTypes(event, { newValue }) {
    this.setState({
      valueTypes: newValue
    });
  }

  onChangeCategories(event, { newValue }) {
    this.setState({
      valueCategories: newValue
    });
  }

  onSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    console.log(suggestion);

    const clonedIngredients = this.state.ingredients
      ? this.state.ingredients.slice()
      : [];

    let isThere = false;

    if (clonedIngredients.length > 0) {
      isThere = clonedIngredients.filter(
        present => suggestion._id === present._id
      );
    }

    if (isThere != false) {
      return;
    }

    clonedIngredients.push(suggestion._id);

    this.setState({
      hasFormChanged: true,
      ingredients: clonedIngredients
    });
  }

  onSuggestionSelectedTypes(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    console.log(suggestion);

    const clonedTypes = this.state.types ? this.state.types.slice() : [];

    let isThere = false;

    if (clonedTypes.length > 0) {
      isThere = clonedTypes.filter(present => suggestion._id === present._id);
    }

    if (isThere != false) {
      return;
    }

    clonedTypes.push(suggestion._id);

    this.setState({
      hasFormChanged: true,
      types: clonedTypes
    });
  }

  onSuggestionSelectedCategories(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) {
    console.log(suggestion);

    const clonedCats = this.state.categories
      ? this.state.categories.slice()
      : [];

    let isThere = false;

    if (clonedCats.length > 0) {
      isThere = clonedCats.filter(present => suggestion._id === present._id);
    }

    if (isThere != false) {
      return;
    }

    clonedCats.push(suggestion._id);

    this.setState({
      hasFormChanged: true,
      categories: clonedCats
    });
  }

  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value)
    });
  }

  onSuggestionsFetchRequestedCategories({ value }) {
    this.setState({
      suggestionsCategories: this.getSuggestionsCategories(value)
    });
  }

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: []
    });
  }

  onSuggestionsClearRequestedCategories() {
    this.setState({
      suggestionsCategories: []
    });
  }

  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.ingredients.filter(
        ingredient =>
          ingredient.title.toLowerCase().slice(0, inputLength) === inputValue
      );
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestionsTypes(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.ingredientTypes.filter(
        type => type.title.toLowerCase().slice(0, inputLength) === inputValue
      );
  }

  getSuggestionsCategories(value) {
    // console.log(value);
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.categories.filter(
        category =>
          category.title.toLowerCase().slice(0, inputLength) === inputValue
      );
  }

  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValueTypes(suggestion) {
    return suggestion.title;
  }

  getSuggestionValueCategories(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, restriction } = this.props;

    const existingRestriction = restriction && restriction._id;
    localStorage.setItem("restrictionDeleted", restriction.title);
    const restrictionDeletedMessage = `${localStorage.getItem(
      "restrictionDeleted"
    )} deleted from restrictions.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call("restrictions.remove", existingRestriction, error => {
      if (error) {
        popTheSnackbar({
          message: error.reason
        });
      } else {
        popTheSnackbar({
          message: restrictionDeletedMessage
        });

        history.push("/restrictions");
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    if (!$(this.form).valid()) {
      return;
    }

    if ( this.state.discountOrExtraSelected ) {
      if ( this.state.discountOrExtraAmount === '' ) {
        this.props.popTheSnackbar({
            message: 'Please enter the discount or extra amount',
        });

        return;
      }
    }

    const { history, popTheSnackbar } = this.props;
    const existingRestriction =
      this.props.restriction && this.props.restriction._id;
    const methodToCall = existingRestriction
      ? "restrictions.update"
      : "restrictions.insert";

    const restriction = {
      title: document.querySelector("#title").value.trim(),
      ingredients: this.state.ingredients,
      types: this.state.types,
      categories: this.state.categories,
      restrictionType: this.state.valueRestriction
    };

    if (this.state.discountOrExtraSelected) {
      const discountOrExtra = this.state.valueDiscountOrExtra;
      restriction[discountOrExtra] = parseFloat(this.state.discountOrExtraAmount);
      restriction.discountOrExtraType = this.state.discountType;
    }

    if (existingRestriction) {
      restriction._id = existingRestriction;

      if (this.state.valueDiscountOrExtra === "none") {
        delete restriction.discount;
        delete restriction.extra;
        delete restriction.discountOrExtraType;
      }
    }

    console.log(restriction);

    Meteor.call(methodToCall, restriction, (error, restrictionId) => {
      if (error) {

        console.log(error);

        popTheSnackbar({
          message: error.reason || error
        });
      } else {
        localStorage.setItem(
          "restrictionForSnackbar",
          restriction.title || $('[name="title"]').val()
        );

        const confirmation = existingRestriction
          ? `${localStorage.getItem(
            "restrictionForSnackbar"
          )} restriction updated.`
          : `${localStorage.getItem(
            "restrictionForSnackbar"
          )} restriction added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: "View",
          buttonLink: `/restrictions/${restrictionId}/edit`
        });

        history.push("/restrictions");
      }
    });
  }

  renderDeleteDialog() {
    return this.props.restriction ? (
      <Dialog
        open={this.state.deleteDialogOpen}
        onClose={this.deleteDialogHandleRequestClose}
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
          {this.props.restriction && this.props.restriction.title.toLowerCase()}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{" "}
            {this.props.restriction &&
              this.props.restriction.title.toLowerCase()}{" "}
            {this.props.restriction && this.props.restriction.typeMain
              ? `from ${this.props.restriction.typeMain.title.toLowerCase()}?`
              : "?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.deleteDialogHandleRequestClose}
            color="default"
          >
            Cancel
          </Button>
          <Button
            stroked
            className="button--bordered button--bordered--accent"
            onClick={this.handleRemoveActual}
            color="accent"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    ) : (
        ""
      );
  }

  renderSuggestion(suggestion) {
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

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  handleIngredientsChipDelete(type) {
    const stateCopy = this.state.ingredients.slice();

    stateCopy.splice(stateCopy.indexOf(type), 1);

    this.setState({
      ingredients: stateCopy,
      hasFormChanged: true
    });
  }

  handleTypeChipDelete(type) {
    const stateCopy = this.state.types.slice();

    stateCopy.splice(stateCopy.indexOf(type), 1);

    this.setState({
      types: stateCopy,
      hasFormChanged: true
    });
  }

  handleCategoryChipDelete(category) {
    console.log(category);

    const stateCopy = this.state.categories.slice();

    stateCopy.splice(stateCopy.indexOf(category), 1);

    this.setState({
      categories: stateCopy,
      hasFormChanged: true
    });
  }

  getIngredientTitle(ingredient) {
    if (ingredient.title) {
      return ingredient.title;
    }

    if (this.props.ingredients) {
      return this.props.ingredients.find(el => el._id === ingredient);
    }
  }

  getTypeTitle(type) {
    if (type.title) {
      return type.title;
    }

    if (this.props.ingredientTypes) {
      return this.props.ingredientTypes.find(el => el._id === type);
    }
  }

  getCategoryTitle(category) {
    if (category.title) {
      return category.title;
    }

    if (this.props.categories) {
      return this.props.categories.find(el => el._id === category);
    }
  }

  getIngredientAvatar(ingredient) {
    if (ingredient.title) {
      return ingredient.title.charAt(0);
    }

    if (this.props.ingredients) {
      return this.props.ingredients
        .find(el => el._id === ingredient._id)
        .title.charAt(0);
    }
  }

  getTypeAvatar(type) {
    if (type.title) {
      return type.title.charAt(0);
    }

    if (this.props.ingredientTypes) {
      const avatarToReturn = this.props.ingredientTypes.find(
        el => el._id === type._id
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  getCategoryAvatar(category) {
    if (category.title) {
      return category.title.charAt(0);
    }

    if (this.props.categories) {
      const avatarToReturn = this.props.categories.find(
        el => el._id === category._id
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

  render() {
    const {
      restriction,
      categories,
      ingredientTypes,
      history,
      loading
    } = this.props;

    return !loading ? (
      <form
        style={{ width: "100%" }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push("/restrictions")}
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
                <ChevronLeft style={{ marginRight: "4px" }} /> Restrictions
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
              {restriction && restriction._id
                ? `${restriction.title}`
                : "Add restriction"}
            </Typography>

            {this.props.restriction ? (
              <Typography
                type="body1"
                style={{ color: "rgba(0, 0, 0, 0.54)" }}
                className="body1"
              >
                {restriction.SKU ? restriction.SKU : ""}{" "}
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
                onClick={() => history.push("/restrictions")}
              >
                Cancel
              </Button>
              <Button
                className="btn btn-primary"
                raised
                type="submit"
                color="contrast"
                onClick={this.handleSubmit}
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
                  Restriction
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    fullWidth
                    defaultValue={restriction && restriction.title}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged}
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
                  Value
                </Typography>
                <Typography style={{ paddingRight: "80px" }}>
                  Applying a discount or extra will affect the total amount of a
                  lifestyle's price plan if ingredients are restricted.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="discountOrExtra"
                          name="discountOrExtra"
                          value={this.state.valueDiscountOrExtra}
                          onChange={this.handleDiscountOrExtraRadioChange}
                          style={{ flexDirection: "row" }}
                        >
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="none"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtra === "none"
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
                                  this.state.valueDiscountOrExtra === "discount"
                                }
                              />
                            }
                            label="Discount"
                          />
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="extra"
                            control={
                              <Radio
                                checked={
                                  this.state.valueDiscountOrExtra === "extra"
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
                        disabled={!this.state.discountOrExtraSelected}
                        fullWidth
                        id="select-discount-type"
                        select
                        label="Type"
                        value={
                          this.state.discountType ? this.state.discountType : ""
                        }
                        onChange={this.handleDiscountChange}
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
                        value={this.state.discountOrExtraAmount}
                        id="discountOrExtraValue"
                        name="discountOrExtraValue"
                        disabled={!this.state.discountOrExtraSelected}
                        onChange={this.handleDiscountOrExtraValueChange}
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

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Category
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <FormControl component="fieldset">
                    <RadioGroup
                      aria-label="RestrictionType"
                      name="restrictionType"
                      value={this.state.valueRestriction}
                      style={{ flexDirection: "row" }}
                      onChange={this.handleRestrictionTypeChange}
                    >
                      <FormControlLabel
                        className="radiobuttonlabel"
                        value="allergy"
                        control={<Radio />}
                        label="Allergy"
                      />
                      <FormControlLabel
                        className="radiobuttonlabel"
                        value="dietary"
                        control={<Radio />}
                        label="Dietary"
                      />
                      <FormControlLabel
                        className="radiobuttonlabel"
                        value="religious"
                        control={<Radio />}
                        label="Religious"
                      />
                      <FormControlLabel
                        className="radiobuttonlabel"
                        value="preference"
                        control={<Radio />}
                        label="Preference"
                      />
                    </RadioGroup>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: "75px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Ingredients
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Search className="autoinput-icon" />
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
                    renderInputComponent={this.renderInput}
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    onSuggestionSelected={this.onSuggestionSelected}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    renderSuggestionsContainer={this.renderSuggestionsContainer}
                    focusInputOnSuggestionClick={false}
                    inputProps={{
                      placeholder: "Search",
                      value: this.state.value,
                      onChange: this.onChange.bind(this),
                      className: "autoinput"
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap"
                    }}
                  >
                    {this.props.ingredients && this.state.ingredients ? (
                      this.props.ingredients
                        .filter(e => this.state.ingredients.indexOf(e._id) >= 0)
                        .map((e, i) => (
                          <Chip
                            avatar={
                              <Avatar>{this.getIngredientAvatar(e)}</Avatar>
                            }
                            style={{
                              marginRight: "8px",
                              marginBottom: "8px"
                            }}
                            label={e.title}
                            key={i}
                            onDelete={this.handleIngredientsChipDelete.bind(
                              this,
                              e
                            )}
                          />
                        ))
                    ) : (
                        <Chip className="chip--bordered" label="Ingredient" />
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
                  Type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Search className="autoinput-icon" />
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
                    renderInputComponent={this.renderInput.bind(this)}
                    suggestions={this.state.suggestionsTypes}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedTypes}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequestedTypes}
                    onSuggestionSelected={this.onSuggestionSelectedTypes}
                    getSuggestionValue={this.getSuggestionValueTypes}
                    renderSuggestion={this.renderSuggestion}
                    renderSuggestionsContainer={this.renderSuggestionsContainer}
                    focusInputOnSuggestionClick={false}
                    inputProps={{
                      placeholder: "Search",
                      value: this.state.valueTypes,
                      onChange: this.onChangeTypes.bind(this),
                      className: "auto type-autocomplete"
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: "25px"
                    }}
                  >
                    {this.props.ingredientTypes && this.state.types ? (
                      this.props.ingredientTypes
                        .filter((e, i) => {
                          if (this.state.types.indexOf(e._id) >= 0) {
                            return e;
                          }
                        })
                        .map((e, i) => (
                          <Chip
                            avatar={<Avatar>{this.getTypeAvatar(e)}</Avatar>}
                            style={{
                              marginRight: "8px",
                              marginBottom: "8px"
                            }}
                            label={e.title}
                            key={i}
                            onDelete={this.handleTypeChipDelete.bind(
                              this,
                              e
                            )}
                          />
                        ))
                    ) : (
                        <Chip className="chip--bordered" label="Type" />
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
                  Category
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Search className="autoinput-icon" />
                  <Autosuggest
                    id="2"
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
                    renderInputComponent={this.renderInput}
                    suggestions={this.state.suggestionsCategories}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedCategories}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequestedCategories}
                    onSuggestionSelected={this.onSuggestionSelectedCategories}
                    getSuggestionValue={this.getSuggestionValueCategories}
                    renderSuggestion={this.renderSuggestion}
                    renderSuggestionsContainer={this.renderSuggestionsContainer}
                    focusInputOnSuggestionClick={false}
                    inputProps={{
                      placeholder: "Search",
                      value: this.state.valueCategories,
                      onChange: this.onChangeCategories.bind(this),
                      className: "auto type-autocomplete"
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: "25px"
                    }}
                  >
                    {this.props.categories && this.state.categories ? (
                      this.props.categories
                        .filter(e => this.state.categories.indexOf(e._id) >= 0)
                        .map((e, i) => (
                          <Chip
                            avatar={
                              <Avatar>{this.getCategoryAvatar(e)}</Avatar>
                            }
                            style={{
                              marginRight: "8px",
                              marginBottom: "8px"
                            }}
                            label={e.title}
                            key={i}
                            onDelete={this.handleCategoryChipDelete.bind(
                              this,
                              e
                            )}
                          />
                        ))
                    ) : (
                        <Chip className="chip--bordered" label="Category" />
                      )}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {this.props.newRestriction ? (
                  ""
                ) : (
                    <Button
                      style={{ backgroundColor: danger, color: "#FFFFFF" }}
                      raised
                      onClick={
                        restriction && restriction._id
                          ? this.handleRemove.bind(this)
                          : () => this.props.history.push("/restrictions")
                      }
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
                    onClick={() => history.push("/restrictions")}
                  >
                    Cancel
                  </Button>
                  <Button

                    type="submit"
                    className="btn btn-primary"
                    raised
                    color="contrast"
                    onClick={this.handleSubmit}
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
    ) : (
        <Loading />
      );
  }
}

RestrictionEditor.defaultProps = {};

RestrictionEditor.propTypes = {
  restriction: PropTypes.object.isRequired,
  newRestriction: PropTypes.bool.isRequired,
  ingredient: PropTypes.array.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default RestrictionEditor;
