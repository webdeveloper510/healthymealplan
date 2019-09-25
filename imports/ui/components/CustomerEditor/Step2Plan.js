import React from 'react';
import PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Switch from 'material-ui/Switch';
import Input from 'material-ui/Input';
import Typography from 'material-ui/Typography';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Checkbox from 'material-ui/Checkbox';

import Stepper, { Step, StepLabel } from 'material-ui/Stepper';

import moment from 'moment';

import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormGroup,
} from 'material-ui/Form';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import green from 'material-ui/colors/green';

import List, { ListItem, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import Autosuggest from 'react-autosuggest';
import _ from 'lodash';
import Search from 'material-ui-icons/Search';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

import $ from 'jquery';
import autoBind from 'react-autobind';

import validate from '../../../modules/validate';

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

/*
  REMOVE forceUpdate() it is not good to mutate state directly.
  shouldComponentUpdate causes problems as well.
*/

class Step2Plan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
      submitLoading: false,
      submitSuccess: false,
      subIngredients: [],
      specificRestrictions: [],
      deleteDialogOpen: false,
      addRestrictionType: 'Restriction',
      lifestyle: this.props.customerInfo.lifestyle
        ? this.props.customerInfo.lifestyle
        : 'traditional',
      isLifestyleCustom: false,

      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : 'none',

      restrictions: [],
      completeSchedule: [],
      scheduleReal: [
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
        sides: [],

        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
      ],
      platingNotes: '',

      activeMealScheduleStep: 0,
      subscriptionStartDate: moment(this.renderStartDays()[0]).format(
        'dddd MMMM Do YYYY',
      ),
      subscriptionStartDateRaw: this.renderStartDays()[0],

      // collapse
      activeImmediate: false,
      secondaryCollapses: [false, false, false, false, false, false],
      secondaryProfileCount: 0,
      secondaryProfilesData: [],

        selectedSide: '',
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
            .parent(),
        );
      },

      rules: {
        first_name: { required: true },
        first_name1: { required: true },
        first_name2: { required: true },
        first_name3: { required: true },
        first_name4: { required: true },
        first_name5: { required: true },
        first_name6: { required: true },
        first_name7: { required: true },

        last_name: { required: true },
        last_name1: { required: true },
        last_name2: { required: true },
        last_name3: { required: true },
        last_name4: { required: true },
        last_name5: { required: true },
        last_name6: { required: true },
        last_name7: { required: true },

        lifestyle: { required: true },
        lifestyle1: { required: true },
        lifestyle2: { required: true },
        lifestyle3: { required: true },
        lifestyle4: { required: true },
        lifestyle5: { required: true },
        lifestyle6: { required: true },
        lifestyle7: { required: true },

        discount: { required: true },
        discount1: { required: true },
        discount2: { required: true },
        discount3: { required: true },
        discount4: { required: true },
        discount5: { required: true },
        discount6: { required: true },
        discount7: { required: true },

        adultOrChild1: { required: true },
        adultOrChild2: { required: true },
        adultOrChild3: { required: true },
        adultOrChild4: { required: true },
        adultOrChild5: { required: true },
        adultOrChild6: { required: true },
        adultOrChild7: { required: true },

        type: {
          required: true,
        },
      },

      submitHandler() {
        component.handleSubmitStep();
      },
    });
  }

  handleActiveImmediate(event) {

    console.log(event.target.checked);

    this.setState({
      activeImmediate: event.target.checked,
    });
  }

  increaseProfileCount() {
    if (this.state.secondaryProfileCount === 7) {
      this.props.popTheSnackbar({
        message: 'Cannot add more than 7 profiles',
      });

      return;
    }

    const increasedProfileCount = this.state.secondaryProfileCount + 1;

    const currentSecondaryProfiles = this.state.secondaryProfilesData.slice();

    currentSecondaryProfiles.push({
      first_name: '',
      last_name: '',
      subIngredients: [],
      specificRestrictions: [],
      lifestyle: this.props.customerInfo.lifestyle
        ? this.props.customerInfo.lifestyle
        : 'traditional',
      isLifestyleCustom: false,
      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : 'none',
      restrictions: [],
      activeMealScheduleStep: 0,
      deleteDialogOpen: false,
      scheduleReal: [
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
                   chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
        {
          breakfast: { active: false, portions: 'regular', quantity: '1' },
          lunch: { active: false, portions: 'regular', quantity: '1' },
          dinner: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceBreakfast: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceLunch: { active: false, portions: 'regular', quantity: '1' },
          chefsChoiceDinner: { active: false, portions: 'regular', quantity: '1' },
          sides: [],
        },
      ],
      platingNotes: '',
      adultOrChild: 'adult',
    });

    this.setState({
      secondaryProfileCount: increasedProfileCount,
      secondaryProfilesData: currentSecondaryProfiles,
    });
  }

  removeProfile(index) {
    const decreasedProfileCount = this.state.secondaryProfileCount - 1;
    const profileToRemove = this.state.secondaryProfilesData.slice();

    profileToRemove.splice(index, 1);

    this.setState({
      secondaryProfileCount: decreasedProfileCount,
      secondaryProfilesData: profileToRemove,
    });
  }

  handleProfileOpen(primary, index) {
    const currentCollapseArr = this.state.secondaryCollapses.slice();

    currentCollapseArr[index] = !currentCollapseArr[index];

    this.setState({
      secondaryCollapses: currentCollapseArr,
    });
  }

  renderStartDays() {
    const allDates = [];

    for (let i = 1; i <= 5; i++) {
      allDates.push(moment().add(i, 'w').isoWeekday(1).toDate());
    }

    return allDates;
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

  deleteDialogHandleRequestCloseSecondary(profileIndex) {
    console.log(profileIndex);

    this.state.secondaryProfilesData[profileIndex].deleteDialogOpen = false;
    this.forceUpdate();

  }

  deleteDialogHandleOpenSecondary(profileIndex) {
    console.log(profileIndex);
    this.state.secondaryProfilesData[profileIndex].deleteDialogOpen = true;
    this.forceUpdate();

  }

  handleSubmitStep() {
    const scheduleSummation = [
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
      { breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0, },
    ];

    if (
      this.state.scheduleReal.find(
        el => el.breakfast.active || el.lunch.active || el.dinner.active || el.chefsChoiceBreakfast.active || el.chefsChoiceLunch.active || el.chefsChoiceDinner.active,
      ) === undefined
    ) {
      this.props.popTheSnackbar({
        message:
          'There should be at least one meal type selected in the primary profile.',
      });

      return;
    }

    if (this.state.secondaryProfileCount > 0) {
      for (
        let index = 0;
        index < this.state.secondaryProfilesData.length;
        index++
      ) {
        const element = this.state.secondaryProfilesData[index];
        if (
          element.scheduleReal.find(
            el => el.breakfast.active || el.lunch.active || el.dinner.active || el.chefsChoiceBreakfast.active || el.chefsChoiceLunch.active || el.chefsChoiceDinner.active,
          ) === undefined
        ) {
          this.props.popTheSnackbar({
            message: `There should be at least one meal type selected in one of the secondary profile ${index +
              1}.`,
          });

          return;
        }
      }
    }

    this.state.scheduleReal.forEach((e, i) => {
      if (e.breakfast.active) {
        scheduleSummation[i].breakfast += parseInt(e.breakfast.quantity, 10);
      }

      if (e.lunch.active) {
        scheduleSummation[i].lunch += parseInt(e.lunch.quantity, 10);
      }

      if (e.dinner.active) {
        scheduleSummation[i].dinner += parseInt(e.dinner.quantity, 10);
      }

      if (e.chefsChoiceBreakfast.active) {
        scheduleSummation[i].chefsChoiceBreakfast += parseInt(e.chefsChoiceBreakfast.quantity, 10);
      }

      if (e.chefsChoiceLunch.active) {
        scheduleSummation[i].chefsChoiceLunch += parseInt(e.chefsChoiceLunch.quantity, 10);
      }

      if (e.chefsChoiceDinner.active) {
        scheduleSummation[i].chefsChoiceDinner += parseInt(e.chefsChoiceDinner.quantity, 10);
      }

      if (e.sides.length > 0) {
        scheduleSummation[i].sides += e.sides.reduce((total, side) => total + parseInt(side.quantity, 10), 0);
      } else {
          scheduleSummation[i].sides = 0;
      }

    });

    this.state.secondaryProfilesData.forEach((e, i) => {
      e.scheduleReal.forEach((el, index) => {
        if (el.breakfast.active) {
          scheduleSummation[index].breakfast += parseInt(
            el.breakfast.quantity,
            10,
          );
        }

        if (el.lunch.active) {
          scheduleSummation[index].lunch += parseInt(el.lunch.quantity, 10);
        }

        if (el.dinner.active) {
          scheduleSummation[index].dinner += parseInt(el.dinner.quantity, 10);
        }

        if (el.chefsChoiceBreakfast.active) {
          scheduleSummation[index].chefsChoiceBreakfast += parseInt(el.chefsChoiceBreakfast.quantity, 10);
        }

        if (el.chefsChoiceLunch.active) {
          scheduleSummation[index].chefsChoiceLunch += parseInt(el.chefsChoiceLunch.quantity, 10);
        }
        
        if (el.chefsChoiceDinner.active) {
          scheduleSummation[index].chefsChoiceDinner += parseInt(el.chefsChoiceDinner.quantity, 10);
        }

        if (el.sides.length > 0) {
          scheduleSummation[index].sides += el.sides.reduce((total, side) => total + parseInt(side.quantity, 10), 0);
        } else {
          scheduleSummation[index].sides = 0;
        }
      });
    });

    this.props.saveValues({
      activeImmediate: this.state.activeImmediate,
      subIngredients: this.state.subIngredients,
      specificRestrictions: this.state.specificRestrictions,
      lifestyle: this.state.lifestyle,
      discount: this.state.discount,
      restrictions: this.state.restrictions,
      scheduleReal: this.state.scheduleReal,
      platingNotes: this.state.platingNotes,
      adultOrChild: this.state.adultOrChildValue,
      secondaryProfileCount: this.state.secondaryProfileCount,
      secondaryProfiles: this.state.secondaryProfilesData,
      subscriptionStartDate: this.state.subscriptionStartDate,
      subscriptionStartDateRaw: this.state.subscriptionStartDateRaw,
      completeSchedule: scheduleSummation,
    });

    if ($('#step3').valid()) {
      this.props.handleNext();
    }
  }

  // remove lifestyles that may have been already checked but get disabled when you select a lifestyle.
  handleChangeRadioLifestyle(event, value) {
    const getLifestyle = this.props.lifestyles.find(
      el => el.title === value,
    );

    const currentRestrictionsIds = [];

    currentRestrictionsIds.push(...getLifestyle.restrictions);

    this.setState({
      isLifestyleCustom: getLifestyle.custom,
      lifestyle: value,
      lifestyleRestrictions: currentRestrictionsIds,
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

  handleChangeRadioScheduleQuantitySecondary(
    profileIndex,
    index,
    mealType,
    event,
    value,
  ) {
    console.log(mealType);
    console.log(event.target.value);

    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].scheduleReal[index][
      mealType
    ].quantity =
      event.target.value;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
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

  handleChangeRadioSchedulePortionSecondary(
    profileIndex,
    index,
    mealType,
    event,
    value,
  ) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].scheduleReal[index][
      mealType
    ].portions =
      event.target.value;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
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

  handleScheduleMealTypeCheckSecondary(profileIndex, index, mealType, event) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].scheduleReal[index][
      mealType
    ].active = !secondaryProfilesDataCopy[profileIndex].scheduleReal[index][
      mealType
    ].active;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    });
  }

  handleChangeRadioAdultOrChild(profileIndex, event, value) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData;

    secondaryProfilesDataCopy[profileIndex].adultOrChild = event.target.value;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    });
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

  handleNextMealScheduleSecondary(profileIndex) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].activeMealScheduleStep =
      secondaryProfilesDataCopy[profileIndex].activeMealScheduleStep + 1;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    });
  }

  handleBackMealScheduleSecondary(profileIndex) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].activeMealScheduleStep =
      secondaryProfilesDataCopy[profileIndex].activeMealScheduleStep - 1;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    });
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

  handleChangeRadioLifestyleSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].lifestyle = value;

    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value,
    );

    // const currentRestrictionsIds = [this.state.secondaryProfilesData[i]
    //   .restrictions.length
    //   ? this.state.secondaryProfilesData[i].restrictions.slice()
    //   : [];]
    const currentRestrictionsIds = [];
    currentRestrictionsIds.push(...getLifestyleRestrictions.restrictions);

    this.state.secondaryProfilesData[
      i
    ].lifestyleRestrictions = currentRestrictionsIds;

    this.state.secondaryProfilesData[i].isLifestyleCustom = getLifestyleRestrictions.custom;

    this.forceUpdate();
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
      restrictions: clonedRestrictionIds,
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
      value: newValue,
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

  onSuggestionSelectedSecondary(
    index,
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    let clonedSubIngredients;

    console.log(index);

    if (this.state.addRestrictionType == 'Preference') {
      // subingredients
      let isThere = false;

      if (this.state.secondaryProfilesData[index].subIngredients.length > 0) {
        isThere = this.state.secondaryProfilesData[index].subIngredients.filter(
          present => suggestion._id === present._id,
        );
      }

      if (isThere != false) {
        return;
      }

      this.state.secondaryProfilesData[index].subIngredients.push({
        _id: suggestion._id,
        title: suggestion.title,
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
          present => suggestion._id === present._id,
        );
      }

      if (isThere != false) {
        return;
      }

      this.state.secondaryProfilesData[index].specificRestrictions.push({
        _id: suggestion._id,
        title: suggestion.title,
      });
    }

    this.state.secondaryProfilesData[index].deleteDialogOpen = false;
    this.state.value = '';

    this.forceUpdate();
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

  handlePlatingNotesChangeSecondary(profileIndex, event) {

    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].platingNotes = event.target.value;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
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

  renderMealStepsContent(index) {
    return (
      <Grid container flexWrap>
        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
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

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
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

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
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

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Chef's choice Breakfast
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={index}
                checked={this.state.scheduleReal[index].chefsChoiceBreakfast.active}
                onChange={this.handleScheduleMealTypeCheck.bind(
                  this,
                  index,
                  'chefsChoiceBreakfast',
                )}
                control={<Checkbox value={'value'} />}
                label={'Chef\'s choice Breakfast'}
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
              value={this.state.scheduleReal[index].chefsChoiceBreakfast.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(
                this,
                index,
                'chefsChoiceBreakfast',
              )}
              disabled={!this.state.scheduleReal[index].chefsChoiceBreakfast.active}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={index}
                value={'regular'}
                disabled={!this.state.scheduleReal[index].chefsChoiceBreakfast.active}
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={index}
                value={'athletic'}
                disabled={!this.state.scheduleReal[index].chefsChoiceBreakfast.active}
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={index}
                value={'bodybuilder'}
                disabled={!this.state.scheduleReal[index].chefsChoiceBreakfast.active}
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">

            <TextField
              name=""
              disabled={!this.state.scheduleReal[index].chefsChoiceBreakfast.active}
              value={this.state.scheduleReal[index].chefsChoiceBreakfast.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(
                this,
                index,
                'chefsChoiceBreakfast',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}

            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Chef's choice Lunch
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={index}
                checked={this.state.scheduleReal[index].chefsChoiceLunch.active}
                onChange={this.handleScheduleMealTypeCheck.bind(
                  this,
                  index,
                  'chefsChoiceLunch',
                )}
                control={<Checkbox value={'value'} />}
                label={'Chef\'s choice Lunch'}
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
              value={this.state.scheduleReal[index].chefsChoiceLunch.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(
                this,
                index,
                'chefsChoiceLunch',
              )}
              disabled={!this.state.scheduleReal[index].chefsChoiceLunch.active}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={index}
                value={'regular'}
                disabled={!this.state.scheduleReal[index].chefsChoiceLunch.active}
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={index}
                value={'athletic'}
                disabled={!this.state.scheduleReal[index].chefsChoiceLunch.active}
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={index}
                value={'bodybuilder'}
                disabled={!this.state.scheduleReal[index].chefsChoiceLunch.active}
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">

            <TextField
              name=""
              disabled={!this.state.scheduleReal[index].chefsChoiceLunch.active}
              value={this.state.scheduleReal[index].chefsChoiceLunch.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(
                this,
                index,
                'chefsChoiceLunch',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}

            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Chef's choice Dinner
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={index}
                checked={this.state.scheduleReal[index].chefsChoiceDinner.active}
                onChange={this.handleScheduleMealTypeCheck.bind(
                  this,
                  index,
                  'chefsChoiceDinner',
                )}
                control={<Checkbox value={'value'} />}
                label={'Chef\'s choice Dinner'}
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
              value={this.state.scheduleReal[index].chefsChoiceDinner.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(
                this,
                index,
                'chefsChoiceDinner',
              )}
              disabled={!this.state.scheduleReal[index].chefsChoiceDinner.active}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={index}
                value={'regular'}
                disabled={!this.state.scheduleReal[index].chefsChoiceDinner.active}
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={index}
                value={'athletic'}
                disabled={!this.state.scheduleReal[index].chefsChoiceDinner.active}
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={index}
                value={'bodybuilder'}
                disabled={!this.state.scheduleReal[index].chefsChoiceDinner.active}
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">

            <TextField
              name=""
              disabled={!this.state.scheduleReal[index].chefsChoiceDinner.active}
              value={this.state.scheduleReal[index].chefsChoiceDinner.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(
                this,
                index,
                'chefsChoiceDinner',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}

            />

          </FormControl>
        </Grid>

        <Grid item xs={12}>
            <Typography type="body1" className="text-uppercase">
                Sides
            </Typography>
            <Grid container style={{marginTop: '25px'}}>
                {this.state.scheduleReal[index].sides.map((side, ind) => {
                    const currentSide = this.props.sides.find(e => e._id === side._id);
                    return (
                        <Grid item xs={12} sm={4}>
                            <Typography type="body2">{currentSide.title}</Typography>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    aria-label=""
                                    name=""
                                    value={side.variantId}
                                    onChange={this.handleChangeSideVariant.bind(this, side._id, null)}
                                    style={{ flexDirection: 'row' }}
                                >
                                    {currentSide.variants.map(variant => (
                                        <FormControlLabel
                                            key={variant._id}
                                            value={variant._id}
                                            control={<Radio />}
                                            label={variant.name}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <Typography type="body1" className="text-uppercase">Quantity</Typography>
                            <FormControl component="fieldset">
                                <TextField
                                    value={this.state.scheduleReal[index].sides[ind].quantity}
                                    onChange={this.handleChangeSideQuantity.bind(this, side._id, null)}
                                    inputProps={{type: 'number', min: 1,}}
                                />
                            </FormControl>
                            <Button style={{display: 'block', marginTop: '15px'}} onClick={() => this.removeSideFromCurrentDay(side._id)}>Remove</Button>
                        </Grid>
                    )})}
            </Grid>
        </Grid>
      </Grid>
    );
  }

  renderMealStepsContentSecondary(profileIndex, stepIndex) {
    return (
      <Grid container>
        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Breakfast
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={stepIndex}
                checked={
                  this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].breakfast.active
                }
                onChange={this.handleScheduleMealTypeCheckSecondary.bind(
                  this,
                  profileIndex,
                  stepIndex,
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
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].breakfast.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].breakfast.portions
              }
              onChange={this.handleChangeRadioSchedulePortionSecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'breakfast',
              )}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={stepIndex}
                value={'regular'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].breakfast.active
                }
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'athletic'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].breakfast.active
                }
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'bodybuilder'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].breakfast.active
                }
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">

            <TextField
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].breakfast.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].breakfast.quantity
              }
              onChange={this.handleChangeRadioScheduleQuantitySecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'breakfast',
              )}
              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Lunch
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={stepIndex}
                checked={
                  this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].lunch.active
                }
                onChange={this.handleScheduleMealTypeCheckSecondary.bind(
                  this,
                  profileIndex,
                  stepIndex,
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
              disabled={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].lunch.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].lunch.portions
              }
              onChange={this.handleChangeRadioSchedulePortionSecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'lunch',
              )}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={stepIndex}
                value={'regular'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].lunch.active
                }
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'athletic'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].lunch.active
                }
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'bodybuilder'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].lunch.active
                }
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">

            <TextField
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].lunch.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].lunch.quantity
              }
              onChange={this.handleChangeRadioScheduleQuantitySecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'lunch',
              )}
              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Dinner
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={stepIndex}
                checked={
                  this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].dinner.active
                }
                onChange={this.handleScheduleMealTypeCheckSecondary.bind(
                  this,
                  profileIndex,
                  stepIndex,
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
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].dinner.portions
              }
              onChange={this.handleChangeRadioSchedulePortionSecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'dinner',
              )}
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].dinner.active
              }
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={stepIndex}
                value={'regular'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].dinner.active
                }
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'athletic'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].dinner.active
                }
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'bodybuilder'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].dinner.active
                }
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">
            <TextField
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].dinner.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].dinner.quantity
              }
              onChange={this.handleChangeRadioScheduleQuantitySecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'dinner',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Chef's Choice Breakfast
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={stepIndex}
                checked={
                  this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceBreakfast.active
                }
                onChange={this.handleScheduleMealTypeCheckSecondary.bind(
                  this,
                  profileIndex,
                  stepIndex,
                  'chefsChoiceBreakfast',
                )}
                control={<Checkbox value={'value'} />}
                label={'Chef\'s choice Breakfast'}
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
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceBreakfast.portions
              }
              onChange={this.handleChangeRadioSchedulePortionSecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'chefsChoiceBreakfast',
              )}
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceBreakfast.active
              }
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={stepIndex}
                value={'regular'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceBreakfast.active
                }
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'athletic'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceBreakfast.active
                }
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'bodybuilder'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceBreakfast.active
                }
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">
            <TextField
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceBreakfast.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceBreakfast.quantity
              }
              onChange={this.handleChangeRadioScheduleQuantitySecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'chefsChoiceBreakfast',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Chef's Choice Lunch
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={stepIndex}
                checked={
                  this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceLunch.active
                }
                onChange={this.handleScheduleMealTypeCheckSecondary.bind(
                  this,
                  profileIndex,
                  stepIndex,
                  'chefsChoiceLunch',
                )}
                control={<Checkbox value={'value'} />}
                label={'Chef\'s choice Lunch'}
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
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceLunch.portions
              }
              onChange={this.handleChangeRadioSchedulePortionSecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'chefsChoiceLunch',
              )}
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceLunch.active
              }
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={stepIndex}
                value={'regular'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceLunch.active
                }
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'athletic'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceLunch.active
                }
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'bodybuilder'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceLunch.active
                }
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">
            <TextField
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceLunch.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceLunch.quantity
              }
              onChange={this.handleChangeRadioScheduleQuantitySecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'chefsChoiceLunch',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} style={{ marginBottom: '2em' }}>
          <Typography type="body1" className="text-uppercase">
            Chef's Choice Dinner
          </Typography>
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                key={stepIndex}
                checked={
                  this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceDinner.active
                }
                onChange={this.handleScheduleMealTypeCheckSecondary.bind(
                  this,
                  profileIndex,
                  stepIndex,
                  'chefsChoiceDinner',
                )}
                control={<Checkbox value={'value'} />}
                label={'Chef\'s choice Dinner'}
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
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceDinner.portions
              }
              onChange={this.handleChangeRadioSchedulePortionSecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'chefsChoiceDinner',
              )}
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceDinner.active
              }
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel
                key={stepIndex}
                value={'regular'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceDinner.active
                }
                control={<Radio />}
                label={'Regular'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'athletic'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceDinner.active
                }
                control={<Radio />}
                label={'Athletic'}
              />

              <FormControlLabel
                key={stepIndex}
                value={'bodybuilder'}
                disabled={
                  !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                    stepIndex
                  ].chefsChoiceDinner.active
                }
                control={<Radio />}
                label={'Bodybuilder'}
              />
            </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">
            Quantity
          </Typography>
          <FormControl component="fieldset">
            <TextField
              disabled={
                !this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceDinner.active
              }
              value={
                this.state.secondaryProfilesData[profileIndex].scheduleReal[
                  stepIndex
                ].chefsChoiceDinner.quantity
              }
              onChange={this.handleChangeRadioScheduleQuantitySecondary.bind(
                this,
                profileIndex,
                stepIndex,
                'chefsChoiceDinner',
              )}

              inputProps={{
                type: 'number',
                min: 1,
              }}
            />

          </FormControl>
        </Grid>

      <Grid item xs={12}>
          <Typography type="body1" className="text-uppercase">
              Sides
          </Typography>
          <Grid container style={{marginTop: '25px'}}>
              {this.state.secondaryProfilesData[profileIndex].scheduleReal[stepIndex].sides.map((side, ind) => {
                  const currentSide = this.props.sides.find(e => e._id === side._id);
                  return (
                      <Grid item xs={12} sm={4}>
                          <Typography type="body2">{currentSide.title}</Typography>
                          <FormControl component="fieldset">
                              <RadioGroup
                                  aria-label=""
                                  name=""
                                  value={side.variantId}
                                  onChange={this.handleChangeSideVariant.bind(this, side._id, profileIndex)}
                                  style={{ flexDirection: 'row' }}
                              >
                                  {currentSide.variants.map(variant => (
                                      <FormControlLabel
                                          key={variant._id}
                                          value={variant._id}
                                          control={<Radio />}
                                          label={variant.name}
                                      />
                                  ))}
                              </RadioGroup>
                          </FormControl>
                          <Typography type="body1" className="text-uppercase">Quantity</Typography>
                          <FormControl component="fieldset">
                              <TextField
                                  value={this.state.secondaryProfilesData[profileIndex].scheduleReal[stepIndex].sides[ind].quantity}
                                  onChange={this.handleChangeSideQuantity.bind(this, side._id, profileIndex)}
                                  inputProps={{type: 'number', min: 1,}}
                              />
                          </FormControl>
                          <Button style={{display: 'block', marginTop: '15px'}} onClick={() => this.removeSideFromCurrentDay(side._id, profileIndex)}>Remove</Button>
                      </Grid>
                  )})}
          </Grid>
      </Grid>

      </Grid>
    );
  }
    removeSideFromCurrentDay(sideId, profileIndex = null) {
        if (profileIndex !== null ) {
            const secondaryProfilesData = this.state.secondaryProfilesData;
            const mealScheduleStep = this.state.secondaryProfilesData[profileIndex].activeMealScheduleStep;
            const scheduleRealCopy = this.state.secondaryProfilesData[profileIndex].scheduleReal;

            scheduleRealCopy[mealScheduleStep].sides = scheduleRealCopy[mealScheduleStep].sides.filter(e => e._id !== sideId);

            this.setState({
                scheduleReal: scheduleRealCopy
            });

        } else {
            console.log(sideId);
            const mealScheduleStep = this.state.activeMealScheduleStep;
            const scheduleRealCopy = this.state.scheduleReal;

            scheduleRealCopy[mealScheduleStep].sides = scheduleRealCopy[mealScheduleStep].sides.filter(e => e._id !== sideId);

            this.setState({
                scheduleReal: scheduleRealCopy
            });
        }


    }

    addSelectedSideToCurrentDay(event, profileIndex = null){
        console.log("Going here 1");
        console.log(event);
        console.log(profileIndex);
        if (profileIndex !== null) {
            console.log("going index");
            const secondaryProfilesData = this.state.secondaryProfilesData;
            const mealScheduleStep = secondaryProfilesData[profileIndex].activeMealScheduleStep;
            const selectedSide = this.props.sides.find(e => e._id === this.state.selectedSide);

            if (secondaryProfilesData[profileIndex].scheduleReal[mealScheduleStep].sides.findIndex(e => e._id === this.state.selectedSide) !== -1) {
                this.props.popTheSnackbar({
                    message: `${selectedSide.title} is already present on this day.`
                });

                return;
            }

            secondaryProfilesData[profileIndex].scheduleReal[mealScheduleStep].sides.push({
                _id: selectedSide._id,
                variantId: selectedSide.variants[0]._id,
                title: selectedSide.title,
                quantity: 1,
            });

            this.setState({
                secondaryProfilesData,
            });

        } else {

            const mealScheduleStep = this.state.activeMealScheduleStep;
            const scheduleRealCopy = this.state.scheduleReal;
            const selectedSide = this.props.sides.find(e => e._id === this.state.selectedSide);

            if (scheduleRealCopy[mealScheduleStep].sides.findIndex(e => e._id === this.state.selectedSide) !== -1) {
                this.props.popTheSnackbar({
                    message: `${selectedSide.title} is already present on this day.`
                });

                return;
            }

            scheduleRealCopy[mealScheduleStep].sides.push({
                _id: selectedSide._id,
                variantId: selectedSide.variants[0]._id,
                title: selectedSide.title,
                quantity: 1,
            });

            this.setState({
                scheduleReal: scheduleRealCopy,
            });

        }
    }

    handleChangeSideQuantity(sideId, profileIndex = null, event) {

        if (profileIndex !== null) {
            const secondaryProfilesData = this.state.secondaryProfilesData;
            const scheduleRealCopy = this.state.secondaryProfilesData[profileIndex].scheduleReal;
            const activeMealScheduleStep = secondaryProfilesData[profileIndex].activeMealScheduleStep;
            const sideIndex = scheduleRealCopy[activeMealScheduleStep].sides.findIndex(e => e._id === sideId);

            scheduleRealCopy[activeMealScheduleStep].sides[sideIndex].quantity = event.target.value;
            secondaryProfilesData[profileIndex].scheduleReal = scheduleRealCopy;

            this.setState({
                secondaryProfilesData
            });

        } else {
            const { activeMealScheduleStep, scheduleReal } = this.state;

            const sideIndex = scheduleReal[activeMealScheduleStep].sides.findIndex(e => e._id === sideId);
            scheduleReal[activeMealScheduleStep].sides[sideIndex].quantity = event.target.value;

            this.setState({
                scheduleReal,
            });
        }
    }

    handleChangeSideVariant(sideId, profileIndex = null, event, value){
        if (profileIndex !== null) {
            const secondaryProfilesData = this.state.secondaryProfilesData;
            const scheduleRealCopy = this.state.secondaryProfilesData[profileIndex].scheduleReal;
            const activeMealScheduleStep = secondaryProfilesData[profileIndex].activeMealScheduleStep;
            const sideIndex = scheduleRealCopy[activeMealScheduleStep].sides.findIndex(e => e._id === sideId);

            scheduleRealCopy[activeMealScheduleStep].sides[sideIndex].variantId = value;
            secondaryProfilesData[profileIndex].scheduleReal = scheduleRealCopy;

            this.setState({
                secondaryProfilesData
            });

        } else {
            const { activeMealScheduleStep, scheduleReal } = this.state;

            const sideIndex = scheduleReal[activeMealScheduleStep].sides.findIndex(e => e._id === sideId);
            scheduleReal[activeMealScheduleStep].sides[sideIndex].variantId = value;

            this.setState({
                scheduleReal,
            });
        }
    }

    selectSide(event) {
        this.setState({
            selectedSide: event.target.value,
        })
    }


    render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    const mealSteps = this.getMealSteps();
    const { activeMealScheduleStep } = this.state;

    return (
      <form
        id="step3"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: '50px', marginTop: '25px' }}
        >
          <Grid item xs={12}>
            <Paper elevation={2} className="paper-for-fields">
              <Typography type="headline" style={{ marginBottom: '25px' }}>
                {`${this.props.customerInfo.firstName}'s profile`}
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

              <Grid container style={{ marginTop: '25px' }}>
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

                <Grid item sm={6} xs={12}>
                  <Typography type="body1" className="text-uppercase font-medium">Activate subscription effective immediately?</Typography>
                  <FormControl component="fieldset">
                    <Switch
                      checked={this.state.activeImmediate}
                      onChange={this.handleActiveImmediate}
                    />
                  </FormControl>
                </Grid>
              </Grid>

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


                  <Grid container style={{marginTop: '30px'}}>
                      <Grid item xs={12}>
                          <Typography type="subheading">Add a side</Typography>
                      </Grid>
                      <Grid item xs={12}>
                          <select style={{padding: '8px', marginRight: '10px'}} onChange={this.selectSide}>
                              {this.props.sides.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1).map((side) => (
                                  <option value={side._id}>
                                      {side.title}
                                  </option>
                              ))}
                          </select>
                          <Button disabled={this.state.selectedSide === ""} onClick={() => this.addSelectedSideToCurrentDay(false)}>Add</Button>
                      </Grid>
                  </Grid>
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
                <Grid item xs={3}>
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
                <Grid item xs={3}>
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
                <Grid item xs={3}>
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

                  <Grid item xs={3}>
                      <FormControl component="fieldset">
                          <FormLabel component="legend">Preference</FormLabel>
                          <FormGroup>
                              {this.props.restrictions
                                  .filter(e => e.restrictionType === 'preference')
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
                      Select if it's an allergy or a dislike
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
                        label="Allergy"
                      />
                      <FormControlLabel
                        value="Preference"
                        control={<Radio />}
                        label="Dislike"
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
                        Allergies
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
                <Grid item xs={12} sm={6}>
                  <Typography
                    type="subheading"
                    className="text-uppercase font-medium"
                  >
                    Dislikes
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

              <Grid container style={{ marginTop: "25px" }}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Plating notes"
                    id="platingNotes"
                    name="platingNotes"
                    value={this.state.platingNotes}
                    fullWidth
                    multiline
                    onChange={(event) => { this.setState({ platingNotes: event.target.value }); }}
                  />
                </Grid>
              </Grid>
              {this.state.secondaryProfilesData.map((e, profileIndex) => (
                <div key={profileIndex}>
                  <ListItem
                    style={{ marginTop: '15px', marginBottom: '15px' }}
                    button
                    onClick={this.handleProfileOpen.bind(
                      this,
                      false,
                      profileIndex,
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
                    <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="first_name"
                            label="First name"
                            name={`first_name${profileIndex}`}
                            fullWidth
                            data-rule-required="true"
                            inputProps={{}}
                            value={this.state.secondaryProfilesData[profileIndex].first_name}
                            onChange={(event) => {
                              const cloneSecondaries = this.state.secondaryProfilesData.slice();

                              cloneSecondaries[profileIndex].first_name = event.target.value;

                              this.setState({
                                  secondaryProfilesData: cloneSecondaries,
                              });
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="last_name"
                            label="Last name"
                            name={`last_name${profileIndex + 1}`}
                            data-rule-required="true"
                            fullWidth
                            value={this.state.secondaryProfilesData[profileIndex].last_name}
                            onChange={(event) => {
                                const cloneSecondaries = this.state.secondaryProfilesData.slice();
                                cloneSecondaries[profileIndex].last_name = event.target.value;

                                this.setState({
                                    secondaryProfilesData: cloneSecondaries,
                                });
                            }}
                            inputProps={{}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                              name={`lifestyle${profileIndex + 1}`}
                              value={
                                this.state.secondaryProfilesData[profileIndex]
                                  .lifestyle
                              }
                              onChange={this.handleChangeRadioLifestyleSecondary.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ flexDirection: 'row' }}
                              data-rule-required="true"
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

                        <Grid item xs={12} sm={6}>
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
                              value={
                                this.state.secondaryProfilesData[profileIndex]
                                  .discount
                              }
                              onChange={this.handleChangeRadioDiscountSecondary.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                value="none"
                                control={<Radio />}
                                label="None"
                                selected
                                disabled={
                                  this.state.secondaryProfilesData[profileIndex]
                                    .lifestyle &&
                                  this.props.lifestyles.find(
                                    element =>
                                      element.title ==
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle &&
                                      !element.discountStudent &&
                                      !element.discountSenior,
                                  )
                                }
                              />
                              <FormControlLabel
                                value="student"
                                control={<Radio />}
                                label="Student"
                                disabled={
                                  this.state.secondaryProfilesData[profileIndex]
                                    .lifestyle &&
                                  this.props.lifestyles.find(
                                    element =>
                                      element.title ==
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle && !element.discountStudent,
                                  )
                                }
                              />
                              <FormControlLabel
                                value="senior"
                                control={<Radio />}
                                label="Senior"
                                disabled={
                                  this.state.secondaryProfilesData[profileIndex]
                                    .lifestyle &&
                                  this.props.lifestyles.find(
                                    element =>
                                      element.title ==
                                      this.state.secondaryProfilesData[
                                        profileIndex
                                      ].lifestyle && !element.discountSenior,
                                  )
                                }
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid item sm={6} xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">
                              <Typography
                                type="body1"
                                className="text-uppercase font-medium"
                              >
                                Type
                              </Typography>
                            </FormLabel>
                            <RadioGroup
                              aria-label="adultOrChild"
                              name={`adultOrChild${profileIndex + 1}`}
                              value={
                                this.state.secondaryProfilesData[profileIndex]
                                  .adultOrChild
                              }
                              onChange={this.handleChangeRadioAdultOrChild.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                value={'adult'}
                                control={<Radio />}
                                label={'Adult'}
                              />

                              <FormControlLabel
                                value={'child'}
                                control={<Radio />}
                                label={'Child'}
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Stepper
                        activeStep={
                          this.state.secondaryProfilesData[profileIndex]
                            .activeMealScheduleStep
                        }
                        style={{
                          marginTop: '40px',
                          marginBottom: '20px',
                          background: 'none !important',
                        }}
                      >
                        {mealSteps.map((label, index) => {
                          const props = {};
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
                        {this.renderMealStepsContentSecondary(
                          profileIndex,
                          this.state.secondaryProfilesData[profileIndex]
                            .activeMealScheduleStep,
                        )}

                        {this.state.secondaryProfilesData[profileIndex]
                          .activeMealScheduleStep >= 1 ? (
                            <Button
                              onClick={this.handleBackMealScheduleSecondary.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ marginTop: '20px' }}
                            >
                              Back
                            </Button>
                          ) : (
                            ''
                          )}

                        {this.state.secondaryProfilesData[profileIndex]
                          .activeMealScheduleStep < 6 ? (
                            <Button
                              onClick={this.handleNextMealScheduleSecondary.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ marginTop: '20px' }}
                            >
                              Next
                            </Button>
                          ) : (
                            ''
                          )}

                          <Grid container style={{marginTop: '30px'}}>
                              <Grid item xs={12}>
                                  <Typography type="subheading">Add a side</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                  <select style={{padding: '8px', marginRight: '10px'}} onChange={this.selectSide}>
                                      {this.props.sides.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1).map((side) => (
                                          <option value={side._id}>
                                              {side.title}
                                          </option>
                                      ))}
                                  </select>
                                  <Button disabled={this.state.selectedSide === ""} onClick={(e) => this.addSelectedSideToCurrentDay(e, profileIndex)}>Add</Button>
                              </Grid>
                          </Grid>

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
                        <Grid item xs={3}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Allergies</FormLabel>
                            <FormGroup>
                              {this.props.restrictions
                                .filter(e => e.restrictionType === 'allergy')
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
                                    ].lifestyleRestrictions.indexOf(e._id) !=
                                    -1
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
                                            e._id,
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
                        <Grid item xs={3}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Dietary</FormLabel>
                            <FormGroup>
                              {this.props.restrictions
                                .filter(e => e.restrictionType === 'dietary')
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
                                    ].lifestyleRestrictions.indexOf(e._id) !=
                                    -1
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
                                            e._id,
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
                          <Grid item xs={3}>
                              <FormControl component="fieldset">
                                  <FormLabel component="legend">Religious</FormLabel>
                                  <FormGroup>
                                      {this.props.restrictions
                                          .filter(e => e.restrictionType === 'religious')
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
                                                      ].lifestyleRestrictions.indexOf(e._id) !=
                                                  -1
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
                                                                  e._id,
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
                        <Grid item xs={3}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Preference</FormLabel>
                            <FormGroup>
                              {this.props.restrictions
                                .filter(e => e.restrictionType === 'preference')
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
                                    ].lifestyleRestrictions.indexOf(e._id) !=
                                    -1
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
                                            e._id,
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

                      <Dialog
                        open={this.state.secondaryProfilesData[profileIndex].deleteDialogOpen}
                        onClose={this.deleteDialogHandleRequestCloseSecondary.bind(
                          this,
                          profileIndex,
                        )}
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
                              Select if it's an allergy or a dislike
                          </DialogContentText>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="restritionOrPref"
                              name="restritionOrPref"
                              value={this.state.addRestrictionType}
                              onChange={this.handleChangeRadioRestriction.bind(
                                this,
                              )}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                value="Restriction"
                                control={<Radio selected />}
                                label="Allergy"
                              />
                              <FormControlLabel
                                value="Preference"
                                control={<Radio />}
                                label="Dislike"
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
                            onSuggestionSelected={this.onSuggestionSelectedSecondary.bind(
                              this,
                              profileIndex,
                            )}
                            getSuggestionValue={this.getSuggestionValue.bind(
                              this,
                            )}
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
                          <Button onClick={this.deleteDialogHandleRequestClose.bind(this, profileIndex)} color="default">Close</Button>
                        </DialogActions>
                      </Dialog>

                      <Grid container>
                          <Grid item xs={12} sm={6}>
                              <Typography
                                  type="body1"
                                  className="text-uppercase font-medium"
                              >
                                  Allergies
                              </Typography>

                              <div
                                  style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                      marginTop: '25px',
                                  }}
                              >
                                  {this.state.secondaryProfilesData[profileIndex]
                                      .specificRestrictions.length ? (
                                      this.state.secondaryProfilesData[
                                          profileIndex
                                          ].specificRestrictions.map((subIngredient, i) => (
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
                                              label={this.getSubIngredientTitle(
                                                  subIngredient,
                                              )}
                                              key={i}
                                              onDelete={this.handleSubIngredientChipDeleteSpecificRestriction.bind(
                                                  this,
                                                  subIngredient,
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

                          <Grid item xs={12} sm={6}>
                          <Typography
                            type="body1"
                            className="text-uppercase font-medium"
                            style={{ marginTop: '25px' }}
                          >
                            Dislikes
                          </Typography>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              marginTop: '25px',
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
                                    label={this.getSubIngredientTitle(
                                      subIngredient,
                                    )}
                                    key={i}
                                    onDelete={this.handleSubIngredientChipDelete.bind(
                                      this,
                                      subIngredient,
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


                      </Grid>

                      <Grid container>
                        <Grid item xs={12}>
                          <Button
                            color="primary"
                            onClick={this.deleteDialogHandleOpenSecondary.bind(this, profileIndex)}
                          >
                            Add a restriction
                          </Button>
                        </Grid>
                      </Grid>

                      <Grid container style={{ marginTop: "25px" }}>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            label="Plating notes"
                            id="platingNotes"
                            name="platingNotes"
                            value={this.state.secondaryProfilesData[profileIndex].platingNotes}
                            fullWidth
                            multiline
                            onChange={this.handlePlatingNotesChangeSecondary.bind(this, profileIndex)}
                          />
                        </Grid>
                      </Grid>

                      <Button
                        raised
                        onClick={this.removeProfile.bind(this, profileIndex)}
                        style={{ float: 'right', marginTop: '25px' }}
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
                style={{ marginTop: '50px', marginBottom: '50px' }}
              >
                Add a profile
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
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

Step2Plan.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default withStyles(styles)(Step2Plan);
