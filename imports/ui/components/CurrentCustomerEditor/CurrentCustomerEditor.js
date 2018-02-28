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

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';

import Radio, { RadioGroup } from 'material-ui/Radio';
import Checkbox from 'material-ui/Checkbox';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import moment from 'moment';

import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormGroup,
} from 'material-ui/Form';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

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

const styles = theme => ({});

class CurrentCustomerEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      // ui
      currentTab: 0,
      activeMealScheduleStep: 0,


      // customer - step 2
      value: '',
      suggestions: [],
      submitLoading: false,
      submitSuccess: false,
      subIngredients: this.props.customer && this.props.customer.prefernces && this.props.customer.preferences.length > 0 ? this.props.customer.preferences : [],
      specificRestrictions: this.props.customer && this.props.customer.specificRestrictions && this.props.customer.specificRestrictions.length > 0 ? this.props.customer.specificRestrictions : [],
      deleteDialogOpen: false,
      addRestrictionType: 'Restriction',

      lifestyle: this.props.lifestyles && this.props.customer && this.props.customer.lifestyle ?
        this.props.lifestyles.find(e => e._id === this.props.customer.lifestyle).title : 'Traditional',

      isLifestyleCustom: this.props.lifestyles && this.props.customer &&
        this.props.customer.lifestyle &&
        this.props.lifestyles.find(e => e._id == this.props.customer.lifestyle).custom ?
        this.props.lifestyles.find(e => e._id == this.props.customer.lifestyle).custom : false,

      discount: this.props.customer && this.props.customer.discount
        ? this.props.customer.discount
        : 'none',
      restrictions: this.props.customer && this.props.customer.restrictions && this.props.customer.restrictions.length > 0 ?
        this.props.customer.restrictions : [],
      completeSchedule: [],
      scheduleReal: this.props.customer && this.props.customer.schedule ? this.props.customer.schedule : [
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
        },
      ],

    };

    this.handleTabChange = this.handleTabChange.bind(this);
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
        first_name: {
          required: true,
        },

        last_name: {
          required: true,
        },

        email: {
          required: true,
          email: true,
        },

        phoneNumber: {
          minlength: 10,
          maxlength: 10,
          number: true,
        },

        type: {
          required: true,
        },

        postal_code: {
          minlength: 6,
          maxlength: 6,
          cdnPostal: true,
          required: true,
        },
      },
      submitHandler() {
        component.handleSubmitStep();
      },
    });
  }

  renderStartDays() {
    const allDates = [];
    // thanks stackoverflow
    function nextDay(x) {
      const now = new Date();
      now.setDate(now.getDate() + (x + (7 - now.getDay())) % 7);
      return now;
    }

    const immediateMonday = nextDay(1);

    allDates.push(new Date(immediateMonday));

    for (i = 1; i <= 4; i++) {
      const nextMonday = immediateMonday.setDate(immediateMonday.getDate() + 7);
      allDates.push(new Date(nextMonday));
    }

    return allDates;
  }

  handleTabChange(event, value) {
    this.setState({
      currentTab: value,
    });
  }

  // Step 2 Methods
  handleChangeRadioLifestyle(event, value) {
    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value,
    );

    const currentRestrictionsIds = [];

    currentRestrictionsIds.push(...getLifestyleRestrictions.restrictions);

    this.setState({
      isLifestyleCustom: getLifestyleRestrictions.custom,
      lifestyle: value,
      lifestyleRestrictions: currentRestrictionsIds,
    });
  }

  handleChangeRadioRestriction(event, value) {
    this.setState({
      addRestrictionType: value,
    });
  }

  handleChangeRadioDiscount(event, value) {
    this.setState({
      discount: value,
    });
  }
  renderDiscountValue(discountType) {
    const lifestyle = this.props.lifestyles.find(
      e => e.title == this.state.lifestyle,
    );

    if (discountType == 'student') {
      if (lifestyle.discountStudent) {
        return lifestyle.discountStudent;
      }
    }

    if (discountType == 'senior') {
      if (lifestyle.discountSenior) {
        return lifestyle.discountSenior;
      }
    }

    return '';
  }


  handleNextMealSchedule() {
    const { activeMealScheduleStep } = this.state;

    this.setState({
      activeMealScheduleStep: activeMealScheduleStep + 1,
    });
  }


  handleBackMealSchedule() {
    const { activeMealScheduleStep } = this.state;

    this.setState({
      activeMealScheduleStep: activeMealScheduleStep - 1,
    });
  }

  handleChangeRadioScheduleQuantity(index, mealType, event, value) {
    console.log(mealType);
    console.log(event.target.value);

    const scheduleRealCopy = this.state.scheduleReal.slice();

    scheduleRealCopy[index][mealType].quantity = event.target.value;

    this.setState({
      scheduleReal: scheduleRealCopy,
    });
  }

  handleChangeRadioSchedulePortion(index, mealType, event, value) {
    console.log(mealType);
    console.log(event.target.value);

    const scheduleRealCopy = this.state.scheduleReal.slice();

    scheduleRealCopy[index][mealType].portions = event.target.value;

    this.setState({
      scheduleReal: scheduleRealCopy,
    });
  }

  handleScheduleMealTypeCheck(index, mealType, event) {
    const scheduleRealCopy = this.state.scheduleReal.slice();

    scheduleRealCopy[index][mealType].active = !scheduleRealCopy[index][
      mealType
    ].active;

    this.setState({
      scheduleReal: scheduleRealCopy,
    });
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
      restrictions: clonedRestrictionIds,
    });
  }

  deleteDialogHandleRequestClose() {
    this.setState({
      deleteDialogOpen: false,
    });
  }

  deleteDialogHandleOpen() {
    this.setState({
      deleteDialogOpen: true,
    });
  }

  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
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

  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  }

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.potentialSubIngredients.filter(
        ingredient =>
          ingredient.title.toLowerCase().slice(0, inputLength) === inputValue,
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
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    let clonedSubIngredients;

    if (this.state.addRestrictionType == 'Preference') {
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
        present => suggestion._id === present._id,
      );
    }

    if (isThere != false) {
      return;
    }

    clonedSubIngredients.push(suggestion);

    if (this.state.addRestrictionType == 'Preference') {
      this.setState({
        subIngredients: clonedSubIngredients,
        value: '',
      });
    } else {
      this.setState({
        specificRestrictions: clonedSubIngredients,
        value: '',
      });
    }

    this.deleteDialogHandleRequestClose();
  }


  handleSubIngredientChipDelete(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.subIngredients.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      subIngredients: stateCopy,
    });
  }

  handleSubIngredientChipDeleteSpecificRestriction(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.specificRestrictions.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      specificRestrictions: stateCopy,
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
        el => el._id === subIngredient,
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  renderMealStepsContent(index) {
    return (
      <Grid container>
        <Grid item xs={12} sm={4}>
          <Typography type="body1" className="text-uppercase">
            Breakfast
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={index}
                checked={this.state.scheduleReal[index].breakfast.active}
                onChange={this.handleScheduleMealTypeCheck.bind(
                  this,
                  index,
                  'breakfast',
                )}
                control={<Checkbox value={'breakfast'} />}
                label={'Breakfast'}
              />
            </FormGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Portion
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label=""
              name=""
              disabled={!this.state.scheduleReal[index].breakfast.active}
              value={this.state.scheduleReal[index].breakfast.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(
                this,
                index,
                'breakfast',
              )}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={index}
                value={'regular'}
                disabled={!this.state.scheduleReal[index].breakfast.active}
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={index}
                value={'athletic'}
                disabled={!this.state.scheduleReal[index].breakfast.active}
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={index}
                value={'bodybuilder'}
                disabled={!this.state.scheduleReal[index].breakfast.active}
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">
            {/* {this.state.isLifestyleCustom ? ( */}

            <TextField
              disabled={!this.state.scheduleReal[index].breakfast.active}
              value={this.state.scheduleReal[index].breakfast.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(
                this,
                index,
                'breakfast',
              )}
              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

            {/* ) : (
                <RadioGroup
                  aria-label=""
                  name=""
                  disabled={!this.state.scheduleReal[index].breakfast.active}
                  value={this.state.scheduleReal[index].breakfast.quantity}
                  onChange={this.handleChangeRadioScheduleQuantity.bind(
                    this,
                    index,
                    'breakfast',
                  )}
                  style={{ flexDirection: 'row' }}
                >
                  <FormControlLabel
                    value={'1'}
                    control={<Radio />}
                    label={'1'}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].breakfast.active}
                  />

                  <FormControlLabel
                    value={'2'}
                    control={<Radio />}
                    label={'2'}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].breakfast.active}
                  />
                </RadioGroup>

              )} */}

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography type="body1" className="text-uppercase">
            Lunch
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={index}
                checked={this.state.scheduleReal[index].lunch.active}
                onChange={this.handleScheduleMealTypeCheck.bind(
                  this,
                  index,
                  'lunch',
                )}
                control={<Checkbox value={'value'} />}
                label={'Lunch'}
              />
            </FormGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Portion
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label=""
              name=""
              disabled={this.state.scheduleReal[index].lunch.active}
              value={this.state.scheduleReal[index].lunch.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(
                this,
                index,
                'lunch',
              )}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={index}
                value={'regular'}
                disabled={!this.state.scheduleReal[index].lunch.active}
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={index}
                value={'athletic'}
                disabled={!this.state.scheduleReal[index].lunch.active}
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={index}
                value={'bodybuilder'}
                disabled={!this.state.scheduleReal[index].lunch.active}
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">

            {/* {this.state.isLifestyleCustom ? ( */}

            <TextField
              disabled={!this.state.scheduleReal[index].lunch.active}
              value={this.state.scheduleReal[index].lunch.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(
                this,
                index,
                'lunch',
              )}
              inputProps={{
                type: 'number',
                min: 1,
              }}

            />

            {/* ) : ( */}

            {/* <RadioGroup
                  aria-label=""
                  name=""
                  disabled={!this.state.scheduleReal[index].lunch.active}
                  value={this.state.scheduleReal[index].lunch.quantity}
                  onChange={this.handleChangeRadioScheduleQuantity.bind(
                    this,
                    index,
                    'lunch',
                  )}
                  style={{ flexDirection: 'row' }}
                >
                  <FormControlLabel
                    value={'1'}
                    control={<Radio />}
                    label={'1'}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].lunch.active}
                  />

                  <FormControlLabel
                    value={'2'}
                    control={<Radio />}
                    label={'2'}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].lunch.active}
                  />
                </RadioGroup>
              )} */}


          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography type="body1" className="text-uppercase">
            Dinner
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={index}
                checked={this.state.scheduleReal[index].dinner.active}
                onChange={this.handleScheduleMealTypeCheck.bind(
                  this,
                  index,
                  'dinner',
                )}
                control={<Checkbox value={'value'} />}
                label={'Dinner'}
              />
            </FormGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Portion
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label=""
              name=""
              value={this.state.scheduleReal[index].dinner.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(
                this,
                index,
                'dinner',
              )}
              disabled={!this.state.scheduleReal[index].dinner.active}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={index}
                value={'regular'}
                disabled={!this.state.scheduleReal[index].dinner.active}
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={index}
                value={'athletic'}
                disabled={!this.state.scheduleReal[index].dinner.active}
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={index}
                value={'bodybuilder'}
                disabled={!this.state.scheduleReal[index].dinner.active}
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">
            {/* {this.state.isLifestyleCustom ? ( */}
            <TextField
              name=""
              disabled={!this.state.scheduleReal[index].dinner.active}
              value={this.state.scheduleReal[index].dinner.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(
                this,
                index,
                'dinner',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}

            />
            {/* ) : (

                <RadioGroup
                  aria-label=""
                  name=""
                  disabled={!this.state.scheduleReal[index].dinner.active}
                  value={this.state.scheduleReal[index].dinner.quantity}
                  onChange={this.handleChangeRadioScheduleQuantity.bind(
                    this,
                    index,
                    'dinner',
                  )}
                  style={{ flexDirection: 'row' }}
                >
                  <FormControlLabel
                    value={'1'}
                    control={<Radio />}
                    label={'1'}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].dinner.active}
                  />

                  <FormControlLabel
                    value={'2'}
                    control={<Radio />}
                    label={'2'}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].dinner.active}
                  />
                </RadioGroup>
              )} */}

          </FormControl>
        </Grid>
      </Grid >
    );
  }

  getMealSteps() {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
  }

  render() {
    const { customer, history } = this.props;
    const { activeMealScheduleStep } = this.state;
    const mealSteps = this.getMealSteps();

    return (
      <form
        style={{ width: '100%' }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push('/customers')}
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
                <ChevronLeft style={{ marginRight: '4px' }} /> Customers
              </Typography>
            </Button>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={4}>
            <Typography
              type="headline"
              className="headline"
              style={{ fontWeight: 500, alignItems: 'center', display: 'flex' }}
            >
              {customer.profile ? `${customer.profile.name.first} ${customer.profile.name.last}` : ''}
              {customer.secondary && <Chip style={{ marginLeft: "20px" }} label="Secondary" />}
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
                onClick={() => history.push('/customers')}
              >
                Cancel
              </Button>
              <Button
                // disabled={!this.state.hasFormChanged}
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

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <AppBar position="static" className="appbar--no-background appbar--no-shadow">
              <Tabs indicatorColor="#000" value={this.state.currentTab} onChange={this.handleTabChange}>
                <Tab label="Basic" />
                <Tab label="Plan" />
                <Tab label="Delivery" />
                <Tab label="Subscription" />
              </Tabs>
            </AppBar>
          </Grid>

          {this.state.currentTab === 0 && (
            <Paper elevation={2} style={{ width: '100%' }} className="paper-for-fields">
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    id="first_name"
                    label="First name"
                    name="first_name"
                    fullWidth
                    defaultValue={customer.profile.name.first}
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
                    defaultValue={customer.profile.name.last ? customer.profile.name.last : ''}
                    inputProps={{}}
                  />
                </Grid>
              </Grid>

              {customer.secondary ? (

                <TextField
                  margin="normal"
                  id="username"
                  label="Username"
                  name="username"
                  fullWidth
                  defaultValue={customer.username}
                  readOnly
                />

              ) : (
                  <TextField
                    margin="normal"
                    id="email"
                    label="Email"
                    name="email"
                    fullWidth
                    defaultValue={customer.emails[0].address}
                    readOnly
                  />
                )}
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    id="phoneNumber"
                    label="Phone number"
                    name="phoneNumber"
                    fullWidth
                    defaultValue={customer.phone ? customer.phone : ''}
                    inputProps={{}}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    id="postalCode"
                    label="Postal code"
                    name="postal_code"
                    fullWidth
                    defaultValue={customer.postalCode}
                    inputProps={{}}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {this.state.currentTab === 1 && (
            <Paper elevation={2} style={{ width: '100%' }} className="paper-for-fields">
              <Typography type="headline" style={{ marginBottom: '25px' }}>
                {`${customer.profile.name.first}'s profile`}
              </Typography>

              <Grid container>
                <Grid item xs={12} sm={6} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      <Typography
                        type="body1"
                        className="text-uppercase font-medium"
                      >
                        Plan
                      </Typography>
                    </FormLabel>
                    <RadioGroup
                      aria-label="lifestyle"
                      name="lifestyle"
                      value={this.state.lifestyle}
                      onChange={this.handleChangeRadioLifestyle.bind(this)}
                      style={{ flexDirection: 'row' }}
                    >
                      {this.props.lifestyles.map((e, i) => (
                        <FormControlLabel
                          value={e.title}
                          control={<Radio />}
                          label={e.title}
                          selected
                          key={i}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>


                <Grid item xs={12} sm={6} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      <Typography
                        type="body1"
                        className="text-uppercase font-medium"
                      >
                        Discount
                      </Typography>
                    </FormLabel>
                    <RadioGroup
                      aria-label="discount"
                      name="discount"
                      value={this.state.discount}
                      onChange={this.handleChangeRadioDiscount.bind(this)}
                      style={{ flexDirection: 'row' }}
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
                              !element.discountSenior,
                          )
                        }
                      />
                      <FormControlLabel
                        value="student"
                        control={<Radio />}
                        label={'Student'}
                        disabled={
                          this.state.lifestyle &&
                          this.props.lifestyles.find(
                            element =>
                              element.title == this.state.lifestyle &&
                              !element.discountStudent,
                          )
                        }
                      />
                      {this.renderDiscountValue.bind(this, 'student')}
                      <FormControlLabel
                        value="senior"
                        control={<Radio />}
                        label={'Senior'}
                        disabled={
                          this.state.lifestyle &&
                          this.props.lifestyles.find(
                            element =>
                              element.title == this.state.lifestyle &&
                              !element.discountSenior,
                          )
                        }
                      />
                      {this.renderDiscountValue.bind(this, 'senior')}
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>

              {/* <Grid container style={{ marginTop: '25px' }}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    type="body1"
                    className="text-uppercase font-medium"
                  >
                    Subscription
                  </Typography>

                  <TextField
                    select
                    id="startDate"
                    label="Select a start date"
                    name="startDate"
                    fullWidth
                    value={this.state.subscriptionStartDate}
                    SelectProps={{ native: false }}
                    onChange={(event) => {
                      this.setState({
                        subscriptionStartDate: event.target.value,
                        subscriptionStartDateRaw: new Date(
                          event.currentTarget.getAttribute('data-original-date'),
                        ),
                      });
                    }}
                  >
                    {this.renderStartDays().map((e, i) => (
                      <MenuItem
                        key={i}
                        value={moment(e).format('dddd MMMM Do YYYY')}
                        data-original-date={e}
                      >
                        {moment(e).format('dddd MMMM Do YYYY')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid> */}

              <Stepper
                activeStep={activeMealScheduleStep}
                style={{
                  marginTop: '40px',
                  marginBottom: '20px',
                  background: 'none !important',
                }}
              >
                {mealSteps.map((label, index) => {
                  const props = {};

                  const momentDateObj = moment();

                  const stepLabel = `${label} ${moment(
                    this.state.subscriptionStartDateRaw,
                  )
                    .add(index, 'd')
                    .format('DD')}`;

                  return (
                    <Step key={index} {...props}>
                      <StepLabel>{stepLabel}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              <div style={{ marginBottom: '30px' }}>
                {this.renderMealStepsContent(this.state.activeMealScheduleStep)}

                {activeMealScheduleStep >= 1 ? (
                  <Button
                    onClick={this.handleBackMealSchedule.bind(this)}
                    style={{ marginTop: '20px' }}
                  >
                    Back
                  </Button>
                ) : (
                    ''
                  )}

                {activeMealScheduleStep < 6 ? (
                  <Button
                    onClick={this.handleNextMealSchedule.bind(this)}
                    style={{ marginTop: '20px' }}
                  >
                    Next
                  </Button>
                ) : (
                    ''
                  )}
              </div>
              <Grid container>
                <Grid item xs={12} style={{ marginTop: '25px' }}>
                  <Typography
                    type="body1"
                    className="text-uppercase font-medium"
                  >
                    Restrictions
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Allergies</FormLabel>
                    <FormGroup>
                      {this.props.restrictions
                        .filter(e => e.restrictionType === 'allergy')
                        .map((e, i) => {
                          const isSelected = this.state.restrictions.length
                            ? this.state.restrictions.indexOf(e._id) != -1
                            : false;

                          const isAlreadyChecked = this.state
                            .lifestyleRestrictions
                            ? this.state.lifestyleRestrictions.indexOf(e._id) !=
                            -1
                            : false;
                          return (
                            <FormControlLabel
                              key={i}
                              disabled={isAlreadyChecked}
                              control={
                                <Checkbox
                                  checked={isSelected || isAlreadyChecked}
                                  onChange={this.handleChange.bind(this, e._id)}
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
                        .filter(e => e.restrictionType === 'dietary')
                        .map((e, i) => {
                          const isSelected = this.state.restrictions.length
                            ? this.state.restrictions.indexOf(e._id) != -1
                            : false;

                          const isAlreadyChecked = this.state
                            .lifestyleRestrictions
                            ? this.state.lifestyleRestrictions.indexOf(e._id) !=
                            -1
                            : false;
                          return (
                            <FormControlLabel
                              key={i}
                              disabled={isAlreadyChecked}
                              control={
                                <Checkbox
                                  checked={isSelected || isAlreadyChecked}
                                  onChange={this.handleChange.bind(this, e._id)}
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
                        .filter(e => e.restrictionType === 'religious')
                        .map((e, i) => {
                          const isSelected = this.state.restrictions.length
                            ? this.state.restrictions.indexOf(e._id) != -1
                            : false;

                          const isAlreadyChecked = this.state
                            .lifestyleRestrictions
                            ? this.state.lifestyleRestrictions.indexOf(e._id) !=
                            -1
                            : false;
                          return (
                            <FormControlLabel
                              key={i}
                              disabled={isAlreadyChecked}
                              control={
                                <Checkbox
                                  checked={isSelected || isAlreadyChecked}
                                  onChange={this.handleChange.bind(this, e._id)}
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

              <Dialog
                maxWidth={false}
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
                      onChange={this.handleChangeRadioRestriction.bind(this)}
                      style={{ flexDirection: 'row' }}
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
                        position: 'relative',
                        marginBottom: '2em',
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
                    renderInputComponent={this.renderInput.bind(this)}
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(
                      this,
                    )}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(
                      this,
                    )}
                    onSuggestionSelected={this.onSuggestionSelected.bind(this)}
                    getSuggestionValue={this.getSuggestionValue.bind(this)}
                    renderSuggestion={this.renderSuggestion.bind(this)}
                    renderSuggestionsContainer={this.renderSuggestionsContainer.bind(
                      this,
                    )}
                    fullWidth
                    focusInputOnSuggestionClick={false}
                    inputProps={{
                      placeholder: 'Search',
                      value: this.state.value,
                      onChange: this.onChange.bind(this),
                      className: 'autoinput',
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.deleteDialogHandleRequestClose.bind(this)} color="default">Close</Button>
                </DialogActions>
              </Dialog>

              <Grid container>
                <Grid item xs={12} sm={6}>
                  <Typography
                    type="subheading"
                    className="text-uppercase font-medium"
                  >
                    Preferences
                  </Typography>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginTop: '25px',
                    }}
                  >
                    {this.state.subIngredients.length ? (
                      this.state.subIngredients.map((subIngredient, i) => (
                        <Chip
                          avatar={
                            <Avatar>
                              {' '}
                              {this.getSubIngredientAvatar(subIngredient)}{' '}
                            </Avatar>
                          }
                          style={{
                            marginRight: '8px',
                            marginBottom: '8px',
                          }}
                          label={this.getSubIngredientTitle(subIngredient)}
                          key={i}
                          onDelete={this.handleSubIngredientChipDelete.bind(
                            this,
                            subIngredient,
                          )}
                        />
                      ))
                    ) : (
                        <Chip className="chip--bordered" label="Ingredient" />
                      )}
                  </div>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    type="subheading"
                    className="text-uppercase font-medium"
                  >
                    Restrictions
                  </Typography>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginTop: '25px',
                    }}
                  >
                    {this.state.specificRestrictions.length ? (
                      this.state.specificRestrictions.map(
                        (subIngredient, i) => (
                          <Chip
                            avatar={
                              <Avatar>
                                {' '}
                                {this.getSubIngredientAvatar(
                                  subIngredient,
                                )}{' '}
                              </Avatar>
                            }
                            style={{
                              marginRight: '8px',
                              marginBottom: '8px',
                            }}
                            label={this.getSubIngredientTitle(subIngredient)}
                            key={i}
                            onDelete={this.handleSubIngredientChipDeleteSpecificRestriction.bind(
                              this,
                              subIngredient,
                            )}
                          />
                        ),
                      )
                    ) : (
                        <Chip className="chip--bordered" label="Ingredient" />
                      )}
                  </div>
                </Grid>
              </Grid>
              <Grid container>
                <Grid item xs={12}>
                  <Button
                    style={{ marginTop: '25px' }}
                    color="primary"
                    onClick={this.deleteDialogHandleOpen.bind(this)}
                  >
                    Add a restriction
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {this.state.currentTab === 2 && (
            <Grid
              container
              justify="center"
              style={{ marginBottom: '50px', marginTop: '25px' }}
            >
              <Grid item xs={12} sm={12}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="body1" className="text-uppercase font-medium">Address Type</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        {/* <FormLabel component="legend">Type</FormLabel> */}
                        <RadioGroup
                          aria-label="account-type"
                          name="addressType"
                          value={this.state.addressType}
                          onChange={this.handleChangeRadioAddressType.bind(this)}
                          style={{ flexDirection: 'row' }}
                        >
                          <FormControlLabel
                            value="house"
                            control={<Radio />}
                            label="House"
                          />

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


                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {this.state.addressType == 'apartment' ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography type="subheading" className="font-uppercase">
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
                            value={this.state.apartmentName}
                            onChange={(event) => { this.setState({ apartmentName: event.target.value }); }}
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
                            name="apartmentUnit"
                            fullWidth
                            onChange={(event) => { this.setState({ unit: event.target.value }); }}

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
                            onChange={(event) => { this.setState({ buzzer: event.target.value }); }}

                            defaultValue={this.props.customerInfo.address.buzzer}
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                      ''
                    )}

                  {this.state.addressType == 'business' ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography type="subheading" className="font-uppercase">
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
                            onChange={(event) => { this.setState({ businessName: event.target.value }); }}

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
                            onChange={(event) => { this.setState({ unit: event.target.value }); }}

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
                            onChange={(event) => { this.setState({ buzzer: event.target.value }); }}

                            defaultValue={
                              this.props.customerInfo.address.businessBuzzer
                            }
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                      ''
                    )}

                  {this.state.addressType == 'dormitory' ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography type="subheading" className="font-uppercase">
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
                                : 'Algonquin College'
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
                            this.state.dormName === 'Algonquin College' ? (
                              <TextField
                                margin="normal"
                                id="dormResidence"
                                label="Dormitory Residence"
                                name="dormitory_residence"
                                select
                                value={
                                  this.state.dormResidence
                                  // ? this.state.dormResidence
                                  // : "Student Residence"
                                }
                                fullWidth
                                onChange={this.changeDormResidence.bind(this)}
                              >

                                <MenuItem key={1} value="Student Residence">
                                  Student Residence
                                </MenuItem>

                              </TextField>
                            ) : (
                              ''
                            )}
                          {this.state.dormName &&
                            this.state.dormName === 'Carleton University' ? (
                              <TextField
                                margin="normal"
                                id="dormResidence"
                                label="Dormitory Residence"
                                name="dormitory_residence"
                                select
                                value={
                                  this.state.dormResidence
                                  // ? this.state.dormResidence
                                  // : "Dundas House"
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
                                <MenuItem key={5} value="Lennox & Addington House">
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
                              ''
                            )}

                          {this.state.dormName &&
                            this.state.dormName === 'University of Ottawa' ? (
                              <TextField
                                margin="normal"
                                id="dormResidence"
                                label="Dormitory Residence"
                                name="dormitory_residence"
                                select
                                value={
                                  this.state.dormResidence
                                  // ? this.state.dormResidence
                                  // : "90 U Residence"
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
                              ''
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
                            onChange={(event) => { this.setState({ roomNumber: event.target.value }); }}

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
                            onChange={(event) => { this.setState({ buzzer: event.target.value }); }}

                            defaultValue={this.props.customerInfo.address.buzzer}
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                      ''
                    )}

                  {this.state.addressType && this.state.addressType === 'hotel' ? (
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography type="subheading" className="font-uppercase">
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
                          onChange={(event) => { this.setState({ hotelNumber: event.target.value }); }}

                          defaultValue={this.props.customerInfo.address.hotelNumber}
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
                          onChange={(event) => { this.setState({ roomNumber: event.target.value }); }}

                          defaultValue={this.props.customerInfo.address.roomNumber}
                          inputProps={{}}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormGroup>
                          <FormControlLabel
                            control={<Checkbox checked />}
                            disabled
                            checked
                            label="Leave at front desk"
                          />
                        </FormGroup>
                      </Grid>
                    </Grid>
                  ) : (
                      ''
                    )}

                  {this.state.addressType && this.state.addressType === 'house' ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography type="subheading" className="font-uppercase">
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
                            onChange={(event) => { this.setState({ unit: event.target.value }); }}

                            defaultValue={this.props.customerInfo.address.unitHouse}
                            inputProps={{}}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                      ''
                    )}

                  {this.state.addressType ? (
                    <div>
                      <Grid container>
                        <Grid item xs={12} sm={8}>

                          <Geosuggest
                            className="geosuggest-input-material"
                            placeholder="Street address"
                            onChange={(value) => { this.setState({ streetAddress: value }); }}
                            onSuggestSelect={(suggest) => { this.setState({ streetAddress: suggest.label }); }}
                            name="streetAddress"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Postal Code"
                            id="postalCode"
                            name="postalCode"
                            value={this.state.postalCode}
                            fullWidth
                            readonly
                            disabled
                          />
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            label="Notes"
                            id="notes"
                            name="notes"
                            value={this.state.notes}
                            fullWidth
                            multiline
                            onChange={(event) => { this.setState({ notes: event.target.value }); }}
                            defaultValue={this.props.customerInfo.address.notes}
                          />
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid item xs={12}>
                          <FormGroup>
                            <FormControlLabel
                              control={<Checkbox
                                checked={this.state.coolerBag}
                                onChange={this.setCoolerbagCheckbox.bind(this)}
                              />}
                              label="Cooler bag (One time fee - $20)"
                            />
                          </FormGroup>
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid item xs={12} style={{ marginTop: '25px' }}>
                          <Typography
                            type="body1"
                            className="text-uppercase font-medium"
                          >
                            Complete Schedule
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Table className="table-lifestyles">
                            <TableHead>
                              <TableRow>
                                <TableCell />

                                <TableCell style={{ textAlign: 'center' }}>
                                  <Typography
                                    type="subheading"
                                    className="font-medium font-uppercase"
                                  >
                                    Breakfast
                                  </Typography>
                                </TableCell>

                                <TableCell style={{ textAlign: 'center' }}>
                                  <Typography
                                    type="subheading"
                                    className="font-medium font-uppercase"
                                  >
                                    Lunch
                                  </Typography>
                                </TableCell>

                                <TableCell style={{ textAlign: 'center' }}>
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
                              {this.state.completeSchedule.map((e, i) => {
                                const days = [
                                  'Monday',
                                  'Tuesday',
                                  'Wednesday',
                                  'Thursday',
                                  'Friday',
                                  'Saturday',
                                  'Sunday',
                                ];

                                return (
                                  <TableRow key={i}>
                                    <TableCell>
                                      <Typography
                                        type="subheading"
                                        style={{ marginTop: '10px' }}
                                      >
                                        {days[i]}
                                      </Typography>
                                    </TableCell>

                                    <TableCell style={{ textAlign: 'center' }}>
                                      <TextField
                                        fullWidth
                                        margin="normal"
                                        style={{
                                          fontSize: '1rem',
                                          maxWidth: '100px',
                                          minWidth: '100px',
                                        }}
                                        disabled
                                        value={
                                          this.state.completeSchedule[i]
                                            .breakfast
                                        }
                                        name={`all_breakfast_${i}`}
                                      />
                                    </TableCell>

                                    <TableCell style={{ textAlign: 'center' }}>
                                      <TextField
                                        fullWidth
                                        margin="normal"
                                        style={{
                                          fontSize: '1rem',
                                          maxWidth: '100px',
                                          minWidth: '100px',
                                        }}
                                        disabled
                                        value={
                                          this.state.completeSchedule[i].lunch
                                        }
                                        name={`all_lunch_${i}`}
                                      />
                                    </TableCell>

                                    <TableCell style={{ textAlign: 'center' }}>
                                      <TextField
                                        fullWidth
                                        margin="normal"
                                        style={{
                                          fontSize: '1rem',
                                          maxWidth: '100px',
                                          minWidth: '100px',
                                        }}
                                        disabled
                                        value={
                                          this.state.completeSchedule[i].dinner
                                        }
                                        name={`all_dinner_${i}`}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Grid>
                      </Grid>

                      <Grid container style={{ marginTop: '25px' }}>
                        <Grid item xs={12}>
                          <Typography
                            type="body1"
                            className="text-uppercase font-medium"
                          >
                            Delivery type
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>

                          <Stepper
                            activeStep={activeDeliveryScheduleStep}
                            style={{ background: 'none !important' }}
                          >
                            {steps.map((label, index) => {
                              const props = {};
                              let stepLabel = `${label} ${moment(
                                new Date(this.props.customerInfo.subscriptionStartDateRaw),
                              )
                                .add(index, 'd')
                                .format('DD')}`;

                              if (index == 5) {
                                stepLabel = `${label.split('/')[0]} ${moment(
                                  new Date(this.props.customerInfo.subscriptionStartDateRaw),
                                )
                                  .add(index, 'd')
                                  .format('DD')} & ${label.split('/')[1]} ${moment(
                                    new Date(this.props.customerInfo.subscriptionStartDateRaw),
                                  )
                                    .add(index + 1, 'd')
                                    .format('DD')}`;
                              }

                              return (
                                <Step key={index} {...props}>
                                  <StepLabel>{stepLabel}</StepLabel>
                                </Step>
                              );
                            })}
                          </Stepper>

                          {this.state.completeSchedule.map((label, index) => {
                            if (index >= 1) {
                              return;
                            }

                            return this.renderOptionsForTheDay(
                              activeDeliveryScheduleStep,
                            );
                          })}

                          {activeDeliveryScheduleStep >= 1 ? (
                            <Button
                              onClick={this.handleBackDeliverySchedule.bind(this)}
                            >
                              Back
                            </Button>
                          ) : (
                              ''
                            )}

                          {activeDeliveryScheduleStep < 5 ? (
                            <Button
                              onClick={this.handleNextDeliverySchedule.bind(this)}
                            >
                              Next
                            </Button>
                          ) : (
                              ''
                            )}
                        </Grid>
                      </Grid>
                    </div>
                  ) : (
                      ''
                    )}
                </Paper>
              </Grid>
            </Grid>
          )}

        </Grid>
      </form >
    );
  }
}

CurrentCustomerEditor.defaultProps = {
};

CurrentCustomerEditor.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default CurrentCustomerEditor;
