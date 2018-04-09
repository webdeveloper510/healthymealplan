/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';

import _ from 'lodash';

import { Meteor } from 'meteor/meteor';

import { Random } from 'meteor/random';


import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import {
  FormControl,
  FormHelperText,
  FormControlLabel,
} from 'material-ui/Form';

import Checkbox from 'material-ui/Checkbox';
import Radio, { RadioGroup } from 'material-ui/Radio';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';

import validate from '../../../modules/validate';

// const primary = teal[500];
const danger = red[700];

import './DiscountEditor.scss';

const styles = theme => ({});

class DiscountEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // I know state is pretty shit and fucked up w.r.t. readability.

      valueDiscountOrExtraAthletic:
        !this.props.newLifestyle &&
          this.props.lifestyle &&
          (this.props.lifestyle.hasOwnProperty('discountAthletic') ||
            this.props.lifestyle.hasOwnProperty('extraAthletic'))
          ? this.props.lifestyle.hasOwnProperty('discountAthletic')
            ? 'discount'
            : 'extra'
          : 'none',

      valueDiscountOrExtraBodybuilder:
        !this.props.newLifestyle &&
          this.props.lifestyle &&
          (this.props.lifestyle.hasOwnProperty('discountBodybuilder') ||
            this.props.lifestyle.hasOwnProperty('extraBodybuilder'))
          ? this.props.lifestyle.hasOwnProperty('discountBodybuilder')
            ? 'discount'
            : 'extra'
          : 'none',

      valueDiscountOrExtraStudent:
        !this.props.newLifestyle &&
          this.props.lifestyle &&
          (this.props.lifestyle.hasOwnProperty('discountStudent') ||
            this.props.lifestyle.hasOwnProperty('extraStudent'))
          ? this.props.lifestyle.hasOwnProperty('discountStudent')
            ? 'discount'
            : 'extra'
          : 'none',

      valueDiscountOrExtraSenior:
        !this.props.newLifestyle &&
          this.props.lifestyle &&
          (this.props.lifestyle.hasOwnProperty('discountSenior') ||
            this.props.lifestyle.hasOwnProperty('extraSenior'))
          ? this.props.lifestyle.hasOwnProperty('discountSenior')
            ? 'discount'
            : 'extra'
          : 'none',

      valueTypes: '',
      suggestionsTypes: [],
      restrictions:
        this.props.lifestyle &&
          this.props.restrictions &&
          !this.props.newLifestyle
          ? _.sortBy(
            this.props.restrictions.filter(
              (e, i) =>
                this.props.lifestyle.restrictions.indexOf(e._id) !== -1,
            ),
            'title',
          )
          : [],
      deleteDialogOpen: false,
      hasFormChanged: false,


      // discountTypeAthletic: 'Percentage',
      discountTypeAthletic:
        !this.props.newLifestyle &&
          this.props.lifestyle &&
          this.props.lifestyle.discountOrExtraTypeAthletic
          ? this.props.lifestyle.discountOrExtraTypeAthletic
          : 'Percentage',

      // discountOrExtraAmountAthletic: '',
      discountOrExtraAmountAthletic:
        !this.props.newLifestyle &&
          this.props.lifestyle &&
          (this.props.lifestyle.hasOwnProperty('discountAthletic') ||
            this.props.lifestyle.hasOwnProperty('extraAthletic'))
          ? this.props.lifestyle.hasOwnProperty('discountAthletic')
            ? this.props.lifestyle.discountAthletic
            : this.props.lifestyle.extraAthletic
          : '',

      discountCode: '',

      valueAppliesTo: '',
      valueAppliesToLifestyle: '',

      minimumRequiredType: '',
      minimumRequiredValue: '',


      customerEligibilityType: '',
      customerEligibilityValue: '',

      usageLimitType: '',
      usageLimitValue: '',

      startDateValue: '',
      endDate: false,
      endDateValue: '',

      status: '',

    };
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent(),
        );
      },

      rules: {
        title: {
          required: true,
        },
      },
      messages: {
        title: {
          required: 'Name required.',
        },
      },
      submitHandler() {
        component.handleSubmit();
      },
    });

    $('[name*="price_"]').on('change', () => {
      this.setState({
        hasFormChanged: true,
        restrictions: clonedRestrictions,
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
      valueTypes: newValue,
    });
  }

  onSuggestionSelectedTypes(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    const clonedRestrictions = this.state.restrictions
      ? this.state.restrictions.slice()
      : [];

    let isThere = false;

    if (clonedRestrictions.length > 0) {
      isThere = clonedRestrictions.filter(
        present => suggestion._id === present._id,
      );
    }

    if (isThere != false) {
      return;
    }

    clonedRestrictions.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      hasFormChanged: true,
      restrictions: clonedRestrictions,
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.

  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value),
    });
  }

  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: [],
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestionsTypes(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.restrictions.filter(
        type => type.profile.name.first.toLowerCase().slice(0, inputLength) === inputValue,
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
    localStorage.setItem('lifestyleDeleted', category.title);
    const lifestyleDeletedMessage = `${localStorage.getItem(
      'lifestyleDeleted',
    )} deleted from lifestyles.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('lifestyles.remove', existingLifestyle, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: lifestyleDeletedMessage,
        });

        history.push('/discounts');
      }
    });
  }

  // different function for each of the lifestyle discounts/extra types is bad,
  // make a single function for each (textfield, radiobutton, and selectfield) and pass what needs to
  // be changed via params
  // refactor v.75

  handleDiscountChangeAthletic(event, value) {
    this.setState({
      discountTypeAthletic: event.target.value,
      hasFormChanged: true,
    });
  }

  handleDiscountOrExtraValueChangeAthletic(event, value) {
    this.setState({
      discountOrExtraAmountAthletic: event.target.value,
      hasFormChanged: true,
    });
  }

  handleDiscountOrExtraRadioChangeAthletic(event, value) {
    let discountOrExtraSelectedAthletic = true;

    if (value == 'none') {
      discountOrExtraSelectedAthletic = false;
    }

    this.setState({
      discountOrExtraSelectedAthletic,
      valueDiscountOrExtraAthletic: value,
      hasFormChanged: true,
    });
  }

  handleDiscountOrExtraRadioChangeAppliesTo(event, value) {
    this.setState({
      valueAppliesTo: value,
      hasFormChanged: true,
    });
  }

  handleRadioChangeMinimumReqType(event, value) {
    this.setState({
      minimumRequiredType: value,
      hasFormChanged: true,
    });
  }

  handleRadioChangeCustomerEligibility(event, value) {
    this.setState({
      customerEligibilityType: value,
      hasFormChanged: true,
    });
  }

  handleRadioChangeUsageLimitType(event, value) {
    this.setState({
      usageLimitType: value,
      hasFormChanged: true,
    });
  }

  handleRadioChangeEndDate(event, value) {
    this.setState({
      endDate: !this.state.endDate,
      hasFormChanged: true,
    });
  }

  handleAppliesToLifestyleChange(event, value) {
    this.setState({
      valueAppliesToLifestyle: event.target.value,
      hasFormChanged: true,
    });
  }


  handleStartDateChange(event, value) {
    this.setState({
      startDateValue: event.target.value,
      hasFormChanged: true,
    });
  }

  handleEndDateChange(event, value) {
    this.setState({
      endDateValue: event.target.value,
      hasFormChanged: true,
    });
  }



  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingLifestyle = this.props.lifestyle && this.props.lifestyle._id;
    const methodToCall = existingLifestyle
      ? 'lifestyles.update'
      : 'lifestyles.insert';

    const lifestyle = {
      title: document.querySelector('#title').value.trim(),
      restrictions: this.state.restrictions.map((e, i) => e._id),
      prices: {
        breakfast: [],
        lunch: [],
        dinner: [],
      },
    };

    if (this.state.discountOrExtraSelectedAthletic) {
      const discountOrExtraAthletic = `${
        this.state.valueDiscountOrExtraAthletic
        }Athletic`;

      lifestyle[discountOrExtraAthletic] = parseFloat(
        this.state.discountOrExtraAmountAthletic,
      );
      lifestyle.discountOrExtraTypeAthletic = this.state.discountTypeAthletic;
    }

    if (existingLifestyle) {
      lifestyle._id = existingLifestyle;

      if (this.state.valueDiscountOrExtraAthletic == 'none') {
        delete lifestyle.discountAthletic;
        delete lifestyle.extraAthletic;
        delete lifestyle.discountOrExtraTypeAthletic;
      }

      if (this.state.valueDiscountOrExtraBodybuilder == 'none') {
        delete lifestyle.discountBodybuilder;
        delete lifestyle.extraBodybuilder;
        delete lifestyle.discountOrExtraTypeBodybuilder;
      }

      if (this.state.valueDiscountOrExtraStudent == 'none') {
        delete lifestyle.discountStudent;
        delete lifestyle.extraStudent;
        delete lifestyle.discountOrExtraTypeStudent;
      }

      if (this.state.valueDiscountOrExtraSenior == 'none') {
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
      console.log('Inside Method');

      if (error) {
        console.log(error);

        popTheSnackbar({
          message: error.reason,
        });
      } else {
        localStorage.setItem(
          'lifestyleForSnackbar',
          lifestyle.title || $('[name="title"]').val(),
        );

        const confirmation = existingLifestyle
          ? `${localStorage.getItem('lifestyleForSnackbar')} lifestyle updated.`
          : `${localStorage.getItem('lifestyleForSnackbar')} lifestyle added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/discounts/${lifestyleId}/edit`,
        });

        history.push('/discounts');
      }
    });
  }

  renderDeleteDialog() {
    return (
      <Dialog
        open={this.state.deleteDialogOpen}
        onClose={this.deleteDialogHandleRequestClose.bind(this)}
      >
        <Typography
          style={{
            flex: '0 0 auto',
            margin: '0',
            padding: '24px 24px 20px 24px',
          }}
          className="title font-medium"
          type="title"
        >
          Delete{' '}
          {this.props.lifestyle ? this.props.lifestyle.title.toLowerCase() : ''}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{' '}
            {this.props.lifestyle
              ? this.props.lifestyle.title.toLowerCase()
              : ''}?
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
        style={{ width: '100%' }}
        InputProps={{
          classes: {
            input: styles.input,
          },
          ...other,
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
        style={{ width: '100%' }}
        InputProps={{
          classes: {
            input: styles.input,
          },
          ...other,
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
      hasFormChanged: true,
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
        el => el._id === type._id,
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  generateDiscountCode() {

    this.setState({
      discountCode: Random.id().toUpperCase().substring(0, 9)
    })

  }

  titleFieldChanged(e) {
    console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged,
    });
  }

  changeTableField() {
    this.setState({
      hasFormChanged: true,
    });
  }

  render() {
    // console.log(this.props);
    const { lifestyle, history } = this.props;
    return (
      <form
        style={{ width: '100%' }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Grid container justify="center">
            <Grid item xs={12}>
              <Button
                onClick={() => this.props.history.push('/discounts')}
                className="button button-secondary button-secondary--top"
              >
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <ChevronLeft style={{ marginRight: '4px' }} /> Discounts
                </Typography>
              </Button>
            </Grid>
          </Grid>
          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={4}>
              <Typography
                type="headline"
                className="headline"
                style={{ fontWeight: 500 }}
              >
                {lifestyle && lifestyle._id
                  ? `${lifestyle.title}`
                  : 'Create discount code'}
              </Typography>


            </Grid>
            <Grid item xs={8}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  style={{ marginRight: '10px' }}
                  onClick={() => history.push('/discounts')}
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

          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                  >
                    Discount code
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    <Button size="small" style={{ float: 'right', marginBottom: "20px" }} onClick={this.generateDiscountCode.bind(this)}>Generate code</Button>

                    <TextField
                      id="title"
                      label="Code"
                      name="title"
                      fullWidth
                      value={this.state.discountCode}
                      onChange={this.titleFieldChanged.bind(this)}
                    />

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />


          <Grid container justify="center" style={{ marginBottom: '50px' }}>
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
                    <Grid container>
                      <Grid item xs={12}>

                        {/* <FormControl component="fieldset">
                          <RadioGroup
                            aria-label="discountOrExtra"
                            name="discountOrExtra"
                            value={this.state.valueDiscountOrExtraAthletic}
                            onChange={this.handleDiscountOrExtraRadioChangeAthletic.bind(
                              this,
                            )}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="none"
                              control={
                                <Radio
                                  checked={
                                    this.state.valueDiscountOrExtraAthletic ===
                                    'none'
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
                                    'extra'
                                  }
                                />
                              }
                              label="Extra"
                            />
                          </RadioGroup>
                        </FormControl> */}
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <TextField
                          fullWidth
                          id="select-discount-type"
                          select
                          label="Type"
                          value={
                            this.state.discountTypeAthletic
                              ? this.state.discountTypeAthletic
                              : ''
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
                          onChange={this.handleDiscountOrExtraValueChangeAthletic.bind(this)}
                          label="Amount"
                          inputProps={{
                            'aria-label': 'Description',
                            type: 'number',
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


          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                  >
                    Applies to
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
                            value={this.state.valueAppliesTo}
                            onChange={this.handleDiscountOrExtraRadioChangeAppliesTo.bind(
                              this,
                            )}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="whole"
                              control={
                                <Radio
                                  checked={
                                    this.state.valueAppliesTo ===
                                    'whole'
                                  }
                                />
                              }
                              label="Whole order"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="lifestyle"
                              control={
                                <Radio
                                  checked={
                                    this.state.valueAppliesTo ===
                                    'lifestyle'
                                  }
                                />
                              }
                              label="Specific lifestyle"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {this.state.valueAppliesTo == 'lifestyle' && (
                        <Grid item xs={12} sm={12}>
                          <TextField
                            fullWidth
                            id="select-lifestyle"
                            select
                            label="Lifestyle"
                            value={
                              this.state.valueAppliesToLifestyle
                                ? this.state.valueAppliesToLifestyle
                                : ''
                            }
                            onChange={this.handleAppliesToLifestyleChange.bind(this)}
                            SelectProps={{ native: false }}
                          >
                            {this.props.lifestyles.map((e, i) => (
                              <MenuItem key={i} value={e.title}>
                                {e.title}
                              </MenuItem>
                            ))}

                          </TextField>
                        </Grid>
                      )}

                    </Grid>

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                  >
                    Minimum requirement
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
                            value={this.state.minimumRequiredType}
                            onChange={this.handleRadioChangeMinimumReqType.bind(
                              this,
                            )}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="none"
                              control={
                                <Radio
                                  checked={
                                    this.state.minimumRequiredType ===
                                    'none'
                                  }
                                />
                              }
                              label="None"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="purchaseAmount"
                              control={
                                <Radio
                                  checked={
                                    this.state.minimumRequiredType ===
                                    'purchaseAmount'
                                  }
                                />
                              }
                              label="Minimum purchase amount"
                            />

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="mealItems"
                              control={
                                <Radio
                                  checked={
                                    this.state.minimumRequiredType ===
                                    'mealItems'
                                  }
                                />
                              }
                              label="Minimum meal items"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {this.state.minimumRequiredType == 'purchaseAmount' && (
                        <Grid item xs={12} sm={12}>
                          <TextField
                            fullWidth
                            inputProps={{
                              type: 'number'
                            }}
                            label="Subscription amount"
                            value={
                              this.state.minimumrequiredValue
                                ? this.state.minimumrequiredValue
                                : ''
                            }
                            onChange={this.handleAppliesToLifestyleChange.bind(this)}
                          />

                        </Grid>
                      )}

                      {this.state.minimumRequiredType == 'mealItems' && (
                        <Grid item xs={12} sm={12}>
                          <TextField
                            fullWidth
                            inputProps={{
                              type: 'number'
                            }}
                            label="Number of meals"
                            value={
                              this.state.minimumrequiredValue
                                ? this.state.minimumrequiredValue
                                : ''
                            }
                            onChange={this.handleAppliesToLifestyleChange.bind(this)}
                          />

                        </Grid>
                      )}

                    </Grid>

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                  >
                    Customer eligibility
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
                            value={this.state.customerEligibilityType}
                            onChange={this.handleRadioChangeCustomerEligibility.bind(
                              this,
                            )}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="everyone"
                              control={
                                <Radio
                                  checked={
                                    this.state.customerEligibilityType ===
                                    'everyone'
                                  }
                                />
                              }
                              label="Everyone"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="specific"
                              control={
                                <Radio
                                  checked={
                                    this.state.customerEligibilityType ===
                                    'specific'
                                  }
                                />
                              }
                              label="Specific Customer"
                            />


                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {this.state.customerEligibilityType == 'specific' && (
                        <div style={{ width: '100%' }}>
                          <Grid item xs={12} style={{ position: 'relative' }}>
                            <Search
                              className="autoinput-icon"
                              style={{ right: '0 !important' }}
                            />
                            <Autosuggest
                              id="1"
                              className="autosuggest"
                              theme={{
                                container: {
                                  flexGrow: 1,
                                  position: 'relative',
                                },
                                suggestionsContainerOpen: {
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                },
                                suggestion: {
                                  display: 'block',
                                },
                                suggestionsList: {
                                  margin: 0,
                                  padding: 0,
                                  listStyleType: 'none',
                                },
                              }}
                              renderInputComponent={this.renderInputTypes.bind(this)}
                              suggestions={this.state.suggestionsTypes}
                              onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedTypes.bind(
                                this,
                              )}
                              onSuggestionsClearRequested={this.onSuggestionsClearRequestedTypes.bind(
                                this,
                              )}
                              onSuggestionSelected={this.onSuggestionSelectedTypes.bind(
                                this,
                              )}
                              getSuggestionValue={this.getSuggestionValueTypes.bind(
                                this,
                              )}
                              renderSuggestion={this.renderSuggestionTypes.bind(this)}
                              renderSuggestionsContainer={this.renderSuggestionsContainerTypes.bind(
                                this,
                              )}
                              focusInputOnSuggestionClick={false}
                              inputProps={{
                                placeholder: 'Search',
                                value: this.state.valueTypes,
                                onChange: this.onChangeTypes.bind(this),
                                className: 'auto type-autocomplete',
                              }}
                            />
                          </Grid>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              marginTop: '25px',
                            }}
                          >
                            {this.state.restrictions.length ? (
                              this.state.restrictions.map((e, i) => (
                                <Chip
                                  avatar={<Avatar> {this.getTypeAvatar(e)} </Avatar>}
                                  style={{ marginRight: '8px', marginBottom: '8px' }}
                                  label={e.title}
                                  key={i}
                                  onDelete={this.handleRestrictionChipDelete.bind(
                                    this,
                                    e,
                                  )}
                                />
                              ))
                            ) : (
                                <Chip className="chip--bordered" label="Customer" />
                              )}
                          </div>
                        </div>
                      )}


                    </Grid>

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                  >
                    Usage limits
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
                            value={this.state.usageLimitType}
                            onChange={this.handleRadioChangeUsageLimitType.bind(
                              this,
                            )}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="numberOfTimes"
                              control={
                                <Checkbox
                                  checked={
                                    this.state.usageLimitType ===
                                    'numberOfTimes'
                                  }
                                />
                              }
                              label="Limit number of times this discount can be used in total"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="oneUsePerCustomer"
                              disabled
                              control={
                                <Checkbox
                                  disabled
                                  checked={
                                    this.state.usageLimitType ===
                                    'oneUsePerCustomer'
                                  }
                                />
                              }
                              label="Limit to one use per customer"
                            />


                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {this.state.minimumRequiredType == 'numberOfTimes' && (
                        <Grid item xs={12} sm={12}>
                          <TextField
                            fullWidth
                            inputProps={{
                              type: 'number'
                            }}
                            // label=""
                            value={
                              this.state.minimumrequiredValue
                                ? this.state.minimumrequiredValue
                                : ''
                            }
                            onChange={this.handleAppliesToLifestyleChange.bind(this)}
                          />

                        </Grid>
                      )}


                    </Grid>

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                  >
                    Active dates
                  </Typography>

                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    <Grid container>

                      <Grid item xs={12} sm={12}>
                        <Typography type="body2">Start date</Typography>
                        <TextField
                          fullWidth
                          inputProps={{
                            type: 'date'
                          }}
                          value={
                            this.state.startDateValue
                              ? this.state.startDateValue
                              : ''
                          }
                          onChange={this.handleStartDateChange.bind(this)}
                        />

                      </Grid>

                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <RadioGroup
                            aria-label="discountOrExtra"
                            name="discountOrExtra"
                            value={this.state.endDate}
                            onChange={this.handleRadioChangeEndDate.bind(
                              this,
                            )}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="endDate"
                              control={
                                <Checkbox
                                  checked={this.state.endDate}
                                />
                              }
                              label="End date"
                            />

                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {this.state.endDate && (
                        <Grid item xs={12} sm={12}>
                          <Typography type="body2">End date</Typography>
                          <TextField
                            fullWidth
                            inputProps={{
                              type: 'date'
                            }}
                            value={
                              this.state.endDateValue
                                ? this.state.endDateValue
                                : ''
                            }
                            onChange={this.handleEndDateChange.bind(this)}
                          />

                        </Grid>
                      )}


                    </Grid>

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={4}>
                  {//                      style={{ backgroundColor: danger, color: '#FFFFFF' }}
                    this.props.newLifestyle ? (
                      ''
                    ) : (
                        <Button
                          raised
                          onClick={
                            lifestyle && lifestyle._id
                              ? this.handleRemove.bind(this)
                              : () => this.props.history.push('/discounts')
                          }
                        >
                          Delete
                        </Button>
                      )}
                </Grid>

                <Grid item xs={8}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      style={{ marginRight: '10px' }}
                      onClick={() => history.push('/discounts')}
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
        </div>

        {this.renderDeleteDialog()}
      </form>
    );
  }
}

DiscountEditor.defaultProps = {
  category: { title: '' },
};

DiscountEditor.propTypes = {
  category: PropTypes.object,
  restrictions: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default DiscountEditor;
