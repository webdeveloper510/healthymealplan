import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';

import Input from 'material-ui/Input';
import Typography from 'material-ui/Typography';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Checkbox from 'material-ui/Checkbox';

import Stepper, { Step, StepLabel } from 'material-ui/Stepper';

import Divider from 'material-ui/Divider';

import moment from 'moment';

import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormGroup,
} from 'material-ui/Form';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from 'material-ui/Table';

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

import update from 'react-addons-update';

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

class Step3LifestyleProfile extends React.Component {
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
      lifestyle: this.props.customerInfo.adultOrChild
        ? this.props.customerInfo.adultOrChild
        : 'traditional',
      extra: this.props.customerInfo.extra
        ? this.props.customerInfo.extra
        : 'none',
      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : 'none',

      restrictions: [],

      scheduleReal: [
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
        { breakfast: { active: false, portions: "regular", quantity: 1, }, lunch: { active: false, portions: "regular", quantity: 1, }, dinner: { active: false, portions: "regular", quantity: 1, } },
      ],
      

      schedule: [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ],
      subscriptionSchedule: [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ],
      activeDeliveryScheduleStep: 0,
      activeMealScheduleStep: 0,
      subscriptionStartDate: moment(this.renderStartDays()[0]).format(
        'dddd, MMMM Do YYYY',
      ),
      subscriptionStartDateRaw: this.renderStartDays()[0],
      subscriptionStartDateFormatted: moment(this.renderStartDays()[0]).format(
        'dddd, MMMM Do YYYY',
      ),
      deliveryType: ['', '', '', '', '', '', ''],
      nextFewMondays: null,

      // collapse
      secondaryCollapses: [false, false, false, false, false, false],
      secondaryProfileCount: 0,
      secondaryProfilesData: [],
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
      },

      submitHandler() {
        component.handleSubmitStep();
      },
    });
  }

  handleSubscriptionScheduleChange() {
    const finalSchedule = _.cloneDeep(this.state.schedule);
    const secondarySchedules = [];

    if (this.state.secondaryProfileCount > 0) {
      this.state.secondaryProfilesData.forEach((e, index) => {
        for (i = 0; i <= 6; i++) {
          finalSchedule[i].breakfast =
            parseInt(finalSchedule[i].breakfast) +
            parseInt(e.schedule[i].breakfast);
          finalSchedule[i].lunch =
            parseInt(finalSchedule[i].lunch) + parseInt(e.schedule[i].lunch);
          finalSchedule[i].dinner =
            parseInt(finalSchedule[i].dinner) + parseInt(e.schedule[i].dinner);
        }
      });
    }
    console.log(finalSchedule);

    this.setState({
      subscriptionSchedule: finalSchedule,
    });
  }

  increaseProfileCount() {
    if (this.state.secondaryProfileCount === 6) {
      this.popTheSnackbar({
        message: 'Cannot add more than 6 profiles',
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
      lifestyle: this.props.customerInfo.adultOrChild
        ? this.props.customerInfo.adultOrChild
        : 'traditional',
      extra: this.props.customerInfo.extra
        ? this.props.customerInfo.extra
        : 'none',
      discount: this.props.customerInfo.discount
        ? this.props.customerInfo.discount
        : 'none',
      restrictions: [],
      schedule: [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ],
      scheduleType: '',
    });

    this.setState({
      secondaryProfileCount: increasedProfileCount,
      secondaryProfilesData: currentSecondaryProfiles,
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
      secondaryProfilesData: profileToRemove,
    });
  }

  handleProfileOpen(primary, index) {
    if (primary) {
      this.setState({
        primaryCollapse: !this.state.primaryCollapse,
      });
    } else {
      const currentCollapseArr = this.state.secondaryCollapses.slice();

      currentCollapseArr[index] = !currentCollapseArr[index];

      this.setState({
        secondaryCollapses: currentCollapseArr,
      });
    }
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

  handleSubmitStep() {
    console.log('Reached');

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    Meteor.call(
      'customers.step3',
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
        adultOrChild: this.state.adultOrChildValue,
      },
      (err, returnVal) => {
        if (err) {
          console.log(err);

          // this.props.popTheSnackbar({
          //   message: err.reason,
          // });

          this.setState({
            submitSuccess: false,
            submitLoading: false,
          });
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          console.log('Reached no error');

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
            adultOrChild: this.state.adultOrChildValue,
          });

          this.props.handleNext();
        }
      },
    );
  }

  handleChangeRadioLifestyle(event, value) {
    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value,
    );

    const currentRestrictionsIds = this.state.restrictions.length
      ? this.state.restrictions.slice()
      : [];

    currentRestrictionsIds.push(...getLifestyleRestrictions.restrictions);

    this.setState({
      lifestyle: value,
      lifestyleRestrictions: currentRestrictionsIds,
    });
  }

  handleChangeRadioScheduleQuantity(index, mealType, event, value){
    console.log(mealType)
    console.log(event.target.value)

    const scheduleRealCopy = this.state.scheduleReal.slice();

    scheduleRealCopy[index][mealType].quantity = event.target.value

    this.setState({
      scheduleReal: scheduleRealCopy
    })
  }

  handleChangeRadioSchedulePortion(index, mealType, event, value){
    console.log(mealType)
    console.log(event.target.value)


    const scheduleRealCopy = this.state.scheduleReal.slice();

    scheduleRealCopy[index][mealType].portions = event.target.value

    this.setState({
      scheduleReal: scheduleRealCopy
    })
  }
  
  
  handleScheduleMealTypeCheck(index, mealType, event){

    const scheduleRealCopy = this.state.scheduleReal.slice();

    scheduleRealCopy[index][mealType].active = !scheduleRealCopy[index][mealType].active;

    this.setState({
      scheduleReal: scheduleRealCopy
    })
  }

  handleChangeRadioscheduleType(event, value) {
    const scheduleCopy = _.cloneDeep(this.state.schedule);
    const subscriptionScheduleCopy = _.cloneDeep(
      this.state.subscriptionSchedule,
    );

    if (value == 'weekdays') {
      for (let i = 0; i <= 6; i += 1) {
        if (i <= 4) {
          scheduleCopy[i].breakfast = 1;
          scheduleCopy[i].lunch = 1;
          scheduleCopy[i].dinner = 1;

          subscriptionScheduleCopy[i].breakfast = 1;
          subscriptionScheduleCopy[i].lunch = 1;
          subscriptionScheduleCopy[i].dinner = 1;
        } else {
          scheduleCopy[i].breakfast = 0;
          scheduleCopy[i].lunch = 0;
          scheduleCopy[i].dinner = 0;

          subscriptionScheduleCopy[i].breakfast = 0;
          subscriptionScheduleCopy[i].lunch = 0;
          subscriptionScheduleCopy[i].dinner = 0;
        }
      }
    }

    if (value == 'weekends') {
      for (let i = 0; i <= 6; i += 1) {
        if (i >= 5) {
          scheduleCopy[i].breakfast = 1;
          scheduleCopy[i].lunch = 1;
          scheduleCopy[i].dinner = 1;

          subscriptionScheduleCopy[i].breakfast = 1;
          subscriptionScheduleCopy[i].lunch = 1;
          subscriptionScheduleCopy[i].dinner = 1;
        } else {
          scheduleCopy[i].breakfast = 0;
          scheduleCopy[i].lunch = 0;
          scheduleCopy[i].dinner = 0;

          subscriptionScheduleCopy[i].breakfast = 0;
          subscriptionScheduleCopy[i].lunch = 0;
          subscriptionScheduleCopy[i].dinner = 0;
        }
      }
    }

    if (value == 'custom') {
      for (let i = 0; i <= 6; i += 1) {
        scheduleCopy[i].breakfast = 1;
        scheduleCopy[i].lunch = 1;
        scheduleCopy[i].dinner = 1;

        subscriptionScheduleCopy[i].breakfast = 1;
        subscriptionScheduleCopy[i].lunch = 1;
        subscriptionScheduleCopy[i].dinner = 1;
      }
    }

    this.setState({
      schedule: scheduleCopy,
      scheduleType: value,
      subscriptionSchedule: subscriptionScheduleCopy,
    });
  }

  handleChangeRadioscheduleTypeSecondary(profileIndex, event, value) {
    if (value == 'weekdays') {
      for (let i = 0; i <= 6; i += 1) {
        if (i <= 4) {
          this.state.secondaryProfilesData[profileIndex].schedule[
            i
          ].breakfast = 1;
          this.state.secondaryProfilesData[profileIndex].schedule[i].lunch = 1;
          this.state.secondaryProfilesData[profileIndex].schedule[i].dinner = 1;

          this.state.subscriptionSchedule[i].breakfast = 1;
          this.state.subscriptionSchedule[i].lunch = 1;
          this.state.subscriptionSchedule[i].dinner = 1;
        } else {
          this.state.secondaryProfilesData[profileIndex].schedule[
            i
          ].breakfast = 0;
          this.state.secondaryProfilesData[profileIndex].schedule[i].lunch = 0;
          this.state.secondaryProfilesData[profileIndex].schedule[i].dinner = 0;

          this.state.subscriptionSchedule[i].breakfast = 0;
          this.state.subscriptionSchedule[i].lunch = 0;
          this.state.subscriptionSchedule[i].dinner = 0;
        }
      }
    }

    if (value == 'weekends') {
      for (let i = 0; i <= 6; i += 1) {
        if (i >= 5) {
          this.state.secondaryProfilesData[profileIndex].schedule[
            i
          ].breakfast = 1;
          this.state.secondaryProfilesData[profileIndex].schedule[i].lunch = 1;
          this.state.secondaryProfilesData[profileIndex].schedule[i].dinner = 1;

          this.state.subscriptionSchedule[i].breakfast = 1;
          this.state.subscriptionSchedule[i].lunch = 1;
          this.state.subscriptionSchedule[i].dinner = 1;
        } else {
          this.state.secondaryProfilesData[profileIndex].schedule[
            i
          ].breakfast = 0;
          this.state.secondaryProfilesData[profileIndex].schedule[i].lunch = 0;
          this.state.secondaryProfilesData[profileIndex].schedule[i].dinner = 0;

          this.state.subscriptionSchedule[i].breakfast = 0;
          this.state.subscriptionSchedule[i].lunch = 0;
          this.state.subscriptionSchedule[i].dinner = 0;
        }
      }
    }

    if (value == 'custom') {
      for (let i = 0; i <= 6; i += 1) {
        this.state.secondaryProfilesData[profileIndex].schedule[
          i
        ].breakfast = 1;
        this.state.secondaryProfilesData[profileIndex].schedule[i].lunch = 1;
        this.state.secondaryProfilesData[profileIndex].schedule[i].dinner = 1;

        this.state.subscriptionSchedule[i].breakfast = 1;
        this.state.subscriptionSchedule[i].lunch = 1;
        this.state.subscriptionSchedule[i].dinner = 1;
      }
    }

    this.state.secondaryProfilesData[profileIndex].scheduleType = value;

    this.forceUpdate();
  }

  changeRadioDeliveryType(index, event, value) {
    // console.log(index)
    // console.log(element)
    // console.log(value);

    const clonedDeliveryType = this.state.deliveryType.slice();

    clonedDeliveryType[index] = value;

    this.setState({
      deliveryType: clonedDeliveryType,
    });

    this.forceUpdate();
  }

  checkPairings() {
    const daysMealSum = [];
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const pairings = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    this.state.subscriptionSchedule.forEach((e, i) => {
      daysMealSum.push(e.breakfast + e.lunch + e.dinner);
    });

    for (let i = 0; i <= daysMealSum.length; i++) {
      const primary = daysMealSum[i];
      for (let j = i + 1; j <= daysMealSum.length - 1; j++) {
        if (j == 3) {
          break;
        }

        if (primary > 0 && daysMealSum[j] > 0 && daysMealSum[j + 1] > 0) {
          pairings[days[i]].push(`${i},${j},${j + 1}`);
        } else if (primary > 0 && daysMealSum[j] > 0) {
          pairings[days[i]].push(`${i},${j}`);
        }
      }
    }

    // console.log(pairings);
  }

  handleNextDeliverySchedule() {
    const { activeDeliveryScheduleStep } = this.state;

    this.setState({
      activeDeliveryScheduleStep: activeDeliveryScheduleStep + 1,
    });
  }

  handleBackDeliverySchedule() {
    const { activeDeliveryScheduleStep } = this.state;

    this.setState({
      activeDeliveryScheduleStep: activeDeliveryScheduleStep - 1,
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

  getSteps() {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday/Sunday',
    ];
  }

  getMealSteps() {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];
  }


  renderOptionsForTheDay(step) {
    const previousIndex = step == 0 ? null : step - 1;

    const dayBeforeYestMealSum = step >= 2 ?
      parseInt(this.state.subscriptionSchedule[previousIndex - 1].breakfast, 10) +
    parseInt(this.state.subscriptionSchedule[previousIndex - 1].lunch, 10) +
    parseInt(this.state.subscriptionSchedule[previousIndex - 1].dinner, 10) : null;

    const previousDaysMealSum = step == 0 ? null :
      parseInt(this.state.subscriptionSchedule[previousIndex].breakfast, 10) +
    parseInt(this.state.subscriptionSchedule[previousIndex].lunch, 10) +
    parseInt(this.state.subscriptionSchedule[previousIndex].dinner, 10);

    const daysMealSum =
      parseInt(this.state.subscriptionSchedule[step].breakfast, 10) +
      parseInt(this.state.subscriptionSchedule[step].lunch, 10) +
      parseInt(this.state.subscriptionSchedule[step].dinner, 10);

    const nextDaysSum =
      parseInt(this.state.subscriptionSchedule[step + 1].breakfast, 10) +
      parseInt(this.state.subscriptionSchedule[step + 1].lunch, 10) +
      parseInt(this.state.subscriptionSchedule[step + 1].dinner, 10);

    let radioGroup = (
      <RadioGroup
        aria-label={`delivery_${step}`}
        name={`delivery_${step}`}
        style={{ flexDirection: 'row' }}
        value={this.state.deliveryType[step]}
        onChange={this.changeRadioDeliveryType.bind(this, step)}
        disabled
      >
        <Typography type="body2">No meals on this day</Typography>
      </RadioGroup>
    );

    if (this.state.activeDeliveryScheduleStep == 0) {


      if (daysMealSum == 0) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'row' }}
            value={this.state.deliveryType[step]}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            disabled
          >
            <Typography type="body2">N/a</Typography>
          </RadioGroup>
        );
      }

      if (daysMealSum == 1) {

        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );
      }

      if (daysMealSum > 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >
            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );
      }


    }

    if (this.state.activeDeliveryScheduleStep == 1) {


      if (daysMealSum == 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >
            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );

        if (previousDaysMealSum > 0 && this.state.deliveryType[0] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[0] == 'dayOf') { // daysMealSum == 1
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`Day of 2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0) { // daysMealSum == 1
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="sundayNight"
                control={<Radio />}
                label={`Sunday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        }
      }// daysMealSum == 1

      if (daysMealSum > 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >
            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );

        if (previousDaysMealSum > 0 && this.state.deliveryType[0] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[0] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`Day of 2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0) {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="sundayNight"
                control={<Radio />}
                label={`Sunday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        }// previousDaysMealSum == 0
      }// daysMealSum > 1
    }// tuesday

    if (this.state.activeDeliveryScheduleStep == 2) {

      if (daysMealSum == 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >
            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );

        if (previousDaysMealSum > 0 && this.state.deliveryType[1] == 'nightBeforePaired') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[1] == 'dayOfPaired') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="sundayNight"
                control={<Radio />}
                label={`Sunday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeMonday"
                control={<Radio />}
                label={`Monday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum == 0 && this.state.deliveryType[1] == 'sundayNight') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum == 0 && this.state.deliveryType[1] == 'dayOfMonday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum == 0 && this.state.deliveryType[1] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum == 0 && this.state.deliveryType[1] == 'dayOfMonday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[0] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[0] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum == 0 && this.state.deliveryType[1] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        }

      }// daysMealSum == 1

      if (daysMealSum > 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >
            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );
        console.log(dayBeforeYestMealSum);
        if (previousDaysMealSum > 0 && this.state.deliveryType[1] == 'nightBeforePaired') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[1] == 'dayOfPaired') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="sundayNight"
                control={<Radio />}
                label={`Sunday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeMonday"
                control={<Radio />}
                label={`Monday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum === 0 && this.state.deliveryType[1] == 'sundayNight') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum === 0 && this.state.deliveryType[1] == 'dayOfMonday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum === 0 && this.state.deliveryType[1] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum === 0 && this.state.deliveryType[1] == 'dayOfMonday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - Free`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[0] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[0] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum == 0 && this.state.deliveryType[1] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        }
      }// daysMealSum > 1

    }

    if (this.state.activeDeliveryScheduleStep == 3) {


      if (daysMealSum == 0) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'row' }}
            value={this.state.deliveryType[step]}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            disabled
          >
            <Typography type="body2">N/a</Typography>
          </RadioGroup>
        );
      }

      if (daysMealSum == 1) {

        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );
        //
        if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'dayOf') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );


        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'dayOfMonday') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );


        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'dayOfTuesday') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );


        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'nightBefore') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'nightBeforeMonday') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'dayOfMonday' && this.state.deliveryType[2] == "dayOfPaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'dayOfPaired') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'nightBeforePaired') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="mondayNight"
                control={<Radio />}
                label={`Monday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeTuesday"
                control={<Radio />}
                label={`Tuesday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } 


      }// daysMealSum == 1


      if (daysMealSum > 1) {

        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );
        if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'dayOf') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );


        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'dayOfMonday') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );


        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'dayOfTuesday') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );


        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'nightBefore') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && this.state.deliveryType[2] == 'nightBeforeMonday') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'dayOfMonday' && this.state.deliveryType[2] == "dayOfPaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'dayOfPaired') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'nightBeforePaired') {

          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'sundayNight' && this.state.deliveryType[2] == "nightBeforePaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
  
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="mondayNight"
                control={<Radio />}
                label={`Monday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeTuesday"
                control={<Radio />}
                label={`Tuesday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[1] == 'dayOfMonday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );

        } 

      }// daysMealSum > 1
    }// thursday

    if (this.state.activeDeliveryScheduleStep == 4) {


      if (daysMealSum == 0) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'row' }}
            value={this.state.deliveryType[step]}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            disabled
          >
            <Typography type="body2">N/a</Typography>
          </RadioGroup>
        );
      }

      if (daysMealSum == 1) {

        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );

        if (this.state.deliveryType[3] === 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing  ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[3] === 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[3] === 'dayOfWednesday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[3] === 'nightBeforeTuesday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'nightBefore' && this.state.deliveryType[3] === "nightBeforePaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing  ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'dayOf' && this.state.deliveryType[3] === "dayOfPaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day-of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="tuesdayNight"
                control={<Radio />}
                label={`Tuesday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeWednesday"
                control={<Radio />}
                label={`Wednesday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfThursday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        
        } else if(previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == "dayOf"){
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day-of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if(previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == "nightBefore"){
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        }

      }


      if (daysMealSum > 1) {

        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value="nightBefore"
              control={<Radio />}
              label={`Night before ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .subtract(1, 'd')
                .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('dddd')} ${moment(this.renderStartDays()[0])
                .add(step, 'd')
                .format('DD')} - $2.50`}
            />
          </RadioGroup>
        );
        if (this.state.deliveryType[3] === 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`2-day pairing  ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[3] === 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[3] === 'dayOfWednesday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`2-day pairing day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[3] === 'nightBeforeTuesday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'nightBefore' && this.state.deliveryType[3] === "nightBeforePaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing  ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'dayOf' && this.state.deliveryType[3] === "dayOfPaired") {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day-of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="tuesdayNight"
                control={<Radio />}
                label={`Tuesday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeWednesday"
                control={<Radio />}
                label={`Wednesday evening ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfThursday'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd').subtract(1, 'd')
                  .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        
        } else if(previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == "dayOf"){
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="dayOfPaired"
                control={<Radio />}
                label={`3-day pairing day-of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if(previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == "nightBefore"){
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >
              <FormControlLabel
                value="nightBeforePaired"
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
              />
  
              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('dddd')} ${moment(this.renderStartDays()[0])
                  .add(step, 'd')
                  .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } 
      }
    }// friday

    if (this.state.activeDeliveryScheduleStep == 5) {
      // saturday & sunday

      const totalMealSum = daysMealSum + nextDaysSum;

      if (totalMealSum > 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value={'nightBefore'}
              control={<Radio />}
              label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
              
              ${moment(this.renderStartDays()[0])
            .add(step, 'd').subtract(2, 'd')
            .format('DD')} evening - Free`}
            />


            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
              
              ${moment(this.renderStartDays()[0])
            .add(step, 'd').subtract(1, 'd')
            .format('DD')} - $2.50`}
            />


          </RadioGroup>
        );

        if (previousDaysMealSum > 0 && this.state.deliveryType[4] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'nightBefore'}
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
              
                ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(2, 'd')
              .format('DD')} evening - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(1, 'd')
              .format('DD')} - $2.50`}
              />


            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[4] == 'dayOfThursday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'nightBefore'}
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(2, 'd')
              .format('DD')} evening - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(1, 'd')
              .format('DD')} - $2.50`}
              />

            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[4] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'nightBefore'}
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(1, 'd')
              .format('DD')} - $2.50`}
              />

            </RadioGroup>
          );
        } else if ( this.state.deliveryType[4] == 'dayOfPaired' && this.state.deliveryType[3] == 'dayOf'){
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'dayOfThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(2, 'd')
              .format('DD')} evening - $2.50`}
              />

            </RadioGroup>
          );

        }


      }// totalMealSum > 1

      if (totalMealSum == 1) {
        radioGroup = (
          <RadioGroup
            aria-label={`delivery_${step}`}
            name={`delivery_${step}`}
            style={{ flexDirection: 'column' }}
            onChange={this.changeRadioDeliveryType.bind(this, step)}
            value={this.state.deliveryType[step]}
          >

            <FormControlLabel
              value={'nightBefore'}
              control={<Radio />}
              label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
                  
                ${moment(this.renderStartDays()[0])
            .add(step, 'd').subtract(2, 'd')
            .format('DD')} evening - $2.50`}
            />


            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
            .add(step, 'd').subtract(1, 'd')
            .format('DD')} - $2.50`}
            />


          </RadioGroup>
        );

        if (previousDaysMealSum > 0 && this.state.deliveryType[4] == 'nightBefore') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'nightBefore'}
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(2, 'd')
              .format('DD')} evening - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(1, 'd')
              .format('DD')} - $2.50`}
              />

            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[4] == 'dayOfThursday') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'nightBefore'}
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(2, 'd')
              .format('DD')} evening - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of  ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(1, 'd')
              .format('DD')} - $2.50`}
              />


            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && this.state.deliveryType[4] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'nightBefore'}
                control={<Radio />}
                label={`3-day pairing day of ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(1, 'd')
              .format('DD')} - $2.50`}
              />

            </RadioGroup>
          );
        } else if ( this.state.deliveryType[4] == 'dayOfPaired' && this.state.deliveryType[3] == 'dayOf'){
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >

              <FormControlLabel
                value={'dayOfThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(this.renderStartDays()[0]).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(this.renderStartDays()[0])
              .add(step, 'd').subtract(2, 'd')
              .format('DD')} evening - $2.50`}
              />

            </RadioGroup>
          );

        }


      }// totalMealSum == 1

    }// saturday/sunday


    return radioGroup;
  }

  handleChangeRadioLifestyleSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].lifestyle = value;

    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value,
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
      addRestrictionType: value,
    });
  }

  handleChangeRadioExtra(event, value) {
    this.setState({
      extra: value,
    });
  }

  handleChangeRadioExtraSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].extra = value;
    this.forceUpdate();
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

    clonedSubIngredients.push({
      _id: suggestion._id,
      title: suggestion.title,
    });

    if (this.state.addRestrictionType == 'Preference') {
      this.setState({
        subIngredients: clonedSubIngredients,
      });
    } else {
      this.setState({
        specificRestrictions: clonedSubIngredients,
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

    this.deleteDialogHandleRequestClose();

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


  renderMealStepsContent(index){


    return(

      <Grid container>

        <Grid xs={12} sm={4}>
        
          <Typography type="body1" className="text-uppercase">Breakfast</Typography>
          <FormControl component="fieldset">
            <FormGroup>
        
              <FormControlLabel
                key={index}
                onChange={this.handleScheduleMealTypeCheck.bind(this, index, "breakfast")}
                control={
                  <Checkbox
                    value={"breakfast"}
                  />
                }
                label={"Breakfast"}
              />
          
            </FormGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">Portion</Typography>
          <FormControl component="fieldset">
              <RadioGroup
                  aria-label=""
                  name=""
                  disabled={!this.state.scheduleReal[index].breakfast.active}
                  value={this.state.scheduleReal[index].breakfast.portions}
                  onChange={this.handleChangeRadioSchedulePortion.bind(this, index, "breakfast")}
                  style={{ flexDirection: 'row' }}
                >
            
                <FormControlLabel
                  key={index}
                  value={"regular"}
                  disabled={!this.state.scheduleReal[index].breakfast.active}

                  control={
                    <Radio />
                  }
                  label={"Regular"}
                />

                <FormControlLabel
                  key={index}
                  value={"athletic"}
                  disabled={!this.state.scheduleReal[index].breakfast.active}

                  control={
                    <Radio />
                  }
                  label={"Athletic"}
                />


                <FormControlLabel
                  key={index}
                  value={"bodybuilder"}
                  disabled={!this.state.scheduleReal[index].breakfast.active}

                  control={
                    <Radio />
                  }
                  label={"Bodybuilder"}
                />
                  
              </RadioGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">Quantity</Typography>
          <FormControl component="fieldset">
                <RadioGroup
                aria-label=""
                name=""
                disabled={!this.state.scheduleReal[index].breakfast.active}
                value={this.state.scheduleReal[index].breakfast.quantity}
                onChange={this.handleChangeRadioScheduleQuantity.bind(this, index, "breakfast")}
                style={{ flexDirection: 'row' }}
              >
                  <FormControlLabel
                    value={"1"}
                    control={<Radio />}
                    label={"1"}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].breakfast.active}

                  />

                  <FormControlLabel
                    value={"2"}
                    control={<Radio />}
                    label={"2"}
                    selected
                    key={index}
                    disabled={!this.state.scheduleReal[index].breakfast.active}

                  />
                
              </RadioGroup>
          </FormControl>
        </Grid>
        


        <Grid xs={12} sm={4}>
        
          <Typography type="body1" className="text-uppercase">Lunch</Typography>
          <FormControl component="fieldset">
            <FormGroup>
              
              <FormControlLabel
                key={index}
                onChange={this.handleScheduleMealTypeCheck.bind(this, index, "lunch")}

                control={
                  <Checkbox
                    value={"value"}
                  />
                }
                label={"Lunch"}
              />
          
            </FormGroup>
          </FormControl>
          
          <Typography type="body1" className="text-uppercase">Portion</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label=""
              name=""
              disabled={this.state.scheduleReal[index].lunch.active}
              value={this.state.scheduleReal[index].lunch.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(this, index, "lunch")}
              style={{ flexDirection: 'row' }}
            >
        
            <FormControlLabel
              key={index}
              value={"regular"}
              disabled={!this.state.scheduleReal[index].lunch.active}
              control={
                <Radio />
              }
              label={"Regular"}
            />

            <FormControlLabel
              key={index}
              value={"athletic"}
              disabled={!this.state.scheduleReal[index].lunch.active}
              control={
                <Radio />
              }
              label={"Athletic"}
            />


            <FormControlLabel
              key={index}
              value={"bodybuilder"}
              disabled={!this.state.scheduleReal[index].lunch.active}
              control={
                <Radio />
              }
              label={"Bodybuilder"}
            />
              
          </RadioGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">Quantity</Typography>
          <FormControl component="fieldset">
              <RadioGroup
              aria-label=""
              name=""
              disabled={!this.state.scheduleReal[index].lunch.active}
              value={this.state.scheduleReal[index].lunch.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(this, index, "lunch")}
              style={{ flexDirection: 'row' }}
              
            >
                <FormControlLabel
                  value={"1"}
                  control={<Radio />}
                  label={"1"}
                  selected
                  key={index}
                  disabled={!this.state.scheduleReal[index].lunch.active}
                />

                <FormControlLabel
                  value={"2"}
                  control={<Radio />}
                  label={"2"}
                  selected
                  key={index}
                  disabled={!this.state.scheduleReal[index].lunch.active}
                />
              
            </RadioGroup>
          </FormControl>

        </Grid>


        <Grid xs={12} sm={4}>
        
          <Typography type="body1" className="text-uppercase">Dinner</Typography>
          <FormControl component="fieldset">
            <FormGroup>
          
                <FormControlLabel
                  key={index}
                  onChange={this.handleScheduleMealTypeCheck.bind(this, index, "dinner")}
                  control={
                    <Checkbox
                      value={"value"}
                    />
                  }
                  label={"Dinner"}
                />
                
            </FormGroup>
          </FormControl>

          <Typography type="body1" className="text-uppercase">Portion</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label=""
              name=""
              value={this.state.scheduleReal[index].dinner.portions}
              onChange={this.handleChangeRadioSchedulePortion.bind(this, index, "dinner")}
              disabled={!this.state.scheduleReal[index].dinner.active}
              style={{ flexDirection: 'row' }}
            >
        
            <FormControlLabel
              key={index}
              value={"regular"}
              disabled={!this.state.scheduleReal[index].dinner.active}
              control={
                <Radio />
              }
              label={"Regular"}
            />

            <FormControlLabel
              key={index}
              value={"athletic"}
              disabled={!this.state.scheduleReal[index].dinner.active}
              control={
                <Radio />
              }
              label={"Athletic"}
            />


            <FormControlLabel
              key={index}
              value={"bodybuilder"}
              disabled={!this.state.scheduleReal[index].dinner.active}
              control={
                <Radio />
              }
              label={"Bodybuilder"}
            />
              
          </RadioGroup>
          </FormControl>
          <Typography type="body1" className="text-uppercase">Quantity</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label=""
              name=""
              disabled={!this.state.scheduleReal[index].dinner.active}
              value={this.state.scheduleReal[index].dinner.quantity}
              onChange={this.handleChangeRadioScheduleQuantity.bind(this, index, "dinner")}
              style={{ flexDirection: 'row' }}
            >
                <FormControlLabel
                  value={"1"}
                  control={<Radio />}
                  label={"1"}
                  selected
                  key={index}
                  disabled={!this.state.scheduleReal[index].dinner.active}
                />

                <FormControlLabel
                  value={"2"}
                  control={<Radio />}
                  label={"2"}
                  selected
                  key={index}
                  disabled={!this.state.scheduleReal[index].dinner.active}
                />
              
            </RadioGroup>
          </FormControl>

        </Grid>

      </Grid>
    )

  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    const steps = this.getSteps();
    const mealSteps = this.getMealSteps();
    const { activeDeliveryScheduleStep, activeMealScheduleStep } = this.state;

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
              <Typography type="headline"
                style={{ marginBottom: '25px' }}
              >
               {`${this.props.customerInfo.firstName}'s profile`}
              </Typography>
            
                <Grid container>
                  <Grid item xs={12} sm={6} md={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">
                        <Typography type="body1" className="text-uppercase font-medium">Plan</Typography>
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
{/*                         
                <Grid container>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend"><Typography type="body1" className="text-uppercase font-medium">Extras</Typography></FormLabel>
                      <RadioGroup
                        aria-label="extra"
                        name="extra"
                        value={this.state.extra}
                        onChange={this.handleChangeRadioExtra.bind(this)}
                        style={{ flexDirection: 'row' }}
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
                                !element.extraBodybuilder,
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
                                !element.extraAthletic,
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
                                !element.extraBodybuilder,
                            )
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid> */}

                

                  <Grid item xs={12} sm={6} md={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend"><Typography type="body1" className="text-uppercase font-medium">Discount</Typography></FormLabel>
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
                          label="Student"
                          disabled={
                            this.state.lifestyle &&
                            this.props.lifestyles.find(
                              element =>
                                element.title == this.state.lifestyle &&
                                !element.discountStudent,
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
                                !element.discountSenior,
                            )
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container style={{ marginTop: "25px" }}>
                  <Grid item xs={12} sm={6}>
                  <Typography type="body1" className="text-uppercase font-medium">Subscription</Typography>

                    <TextField
                      select
                      id="startDate"
                      label="Select a start date"
                      name="startDate"
                      fullWidth
                      value={this.state.subscriptionStartDateFormatted}
                      SelectProps={{ native: false }}
                      onChange={(event) => {
                        this.setState({
                          subscriptionStartDate: event.target.value,
                          subscriptionStartDateRaw: event.target.value,
                          subscriptionStartDateFormatted: moment(event.target.value).format('dddd, MMMM Do YYYY')
                        });
                      }}
                    >
                      {this.renderStartDays().map((e, i) => (
                        <MenuItem
                          key={i}
                          value={e}
                        >
                          {moment(e).format('dddd, MMMM Do YYYY')}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item sm={6} xs={12}>
                    <Typography type="body1" className="text-uppercase font-medium">Frequency</Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        aria-label="scheduleType"
                        name="scheduleType"
                        value={this.state.scheduleType}
                        onChange={this.handleChangeRadioscheduleType.bind(this)}
                        style={{ flexDirection: 'row' }}
                      >
                        <FormControlLabel
                          value={'weekdays'}
                          control={<Radio />}
                          label={'Weekdays'}
                          selected
                        />

                        <FormControlLabel
                          value={'everyday'}
                          control={<Radio />}
                          label={'Everyday'}
                          selected
                        />

                        <FormControlLabel
                          value={'custom'}
                          control={<Radio />}
                          label={'Custom'}
                          selected
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                </Grid>
                
                <Stepper
                    activeStep={activeMealScheduleStep}
                    style={{ background: 'none !important' }}
                  >
                    {mealSteps.map((label, index) => {
                      const props = {};
                      const stepLabel = `${label} ${moment(
                        this.renderStartDays()[0],
                      ).add(index, 'd').format('DD')}`;

                      return (
                        <Step key={index} {...props}>
                          <StepLabel>{stepLabel}</StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>
                
                {this.renderMealStepsContent(activeMealScheduleStep)}



                  {activeMealScheduleStep >= 1 ? (
                    <Button
                      onClick={this.handleBackMealSchedule.bind(this)}
                    >
                      Back
                    </Button>
                  ) : (
                    ''
                  )}

                  {activeMealScheduleStep < 6 ? (
                    <Button onClick={this.handleNextMealSchedule.bind(this)}>
                      Next
                    </Button>
                    
                  ) : (
                    ''
                  )}

                <Grid container>
                  <Grid item xs={12} style={{ marginTop: '25px' }}>
                    <Typography type="body1" className="text-uppercase font-medium">Restrictions</Typography>
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
                              ? this.state.lifestyleRestrictions.indexOf(
                                e._id,
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
                              ? this.state.lifestyleRestrictions.indexOf(
                                e._id,
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
                              ? this.state.lifestyleRestrictions.indexOf(
                                e._id,
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
                  open={this.state.deleteDialogOpen}
                  onRequestClose={this.deleteDialogHandleRequestClose.bind(
                    this,
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
                      onSuggestionSelected={this.onSuggestionSelected.bind(
                        this,
                      )}
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
                </Dialog>

                <Grid container>

                  <Grid item xs={12} sm={6}>
                    <Typography type="subheading" className="text-uppercase font-medium">Preferences</Typography>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginTop: "25px"
                      }}
                    >
                      {this.state.subIngredients.length ? (
                        this.state.subIngredients.map((subIngredient, i) => (
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
                            onRequestDelete={this.handleSubIngredientChipDelete.bind(
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
                    <Typography type="subheading" className="text-uppercase font-medium">Restrictions</Typography>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginTop: "25px"
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
                              onRequestDelete={this.handleSubIngredientChipDeleteSpecificRestriction.bind(
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
                <Grid container style={{ marginTop: '50px' }}>
                  <Grid item xs={12}>
                    <Typography className="font-uppercase" type="subheading">
                      Schedule
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        aria-label="scheduleType"
                        name="scheduleType"
                        value={this.state.scheduleType}
                        onChange={this.handleChangeRadioscheduleType.bind(this)}
                        style={{ flexDirection: 'row' }}
                      >
                        <FormControlLabel
                          value={'weekdays'}
                          control={<Radio />}
                          label={'Weekdays'}
                          selected
                        />

                        <FormControlLabel
                          value={'weekends'}
                          control={<Radio />}
                          label={'Weekends'}
                          selected
                        />

                        <FormControlLabel
                          value={'custom'}
                          control={<Radio />}
                          label={'Custom'}
                          selected
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container style={{ marginTop: '20px' }}>
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
                      {this.state.schedule.map((e, i) => {
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
                                value={this.state.schedule[i].breakfast}
                                onChange={(event) => {
                                  const currentSchedule = this.state.schedule.slice();

                                  currentSchedule[i].breakfast =
                                    event.target.value;

                                  this.setState({
                                    schedule: currentSchedule,
                                  });

                                  this.handleSubscriptionScheduleChange();
                                }}
                                inputProps={{
                                  type: 'number',
                                  min: '0',
                                  max: '3',
                                }}
                                name={`breakfast_${i}`}
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
                                onChange={(event) => {
                                  const currentSchedule = this.state.schedule.slice();

                                  currentSchedule[i].lunch = event.target.value;

                                  this.setState({
                                    schedule: currentSchedule,
                                  });
                                  this.handleSubscriptionScheduleChange();
                                }}
                                value={this.state.schedule[i].lunch}
                                inputProps={{
                                  type: 'number',
                                  min: '0',
                                  max: '3',
                                }}
                                name={`lunch_${i}`}
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
                                onChange={(event) => {
                                  const currentSchedule = this.state.schedule.slice();

                                  currentSchedule[i].dinner =
                                    event.target.value;

                                  this.setState({
                                    schedule: currentSchedule,
                                  });
                                  this.handleSubscriptionScheduleChange();
                                }}
                                value={this.state.schedule[i].dinner}
                                inputProps={{
                                  type: 'number',
                                  min: '0',
                                  max: '3',
                                }}
                                name={`dinner_${i}`}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
                            name="first_name"
                            fullWidth
                            defaultValue={this.props.customerInfo.secondaryProfiles[profileIndex] ? this.props.customerInfo.secondaryProfiles[profileIndex].firstName  : ""}
                            inputProps={{}}
                            onChange={(event) => {
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
                            defaultValue={this.props.customerInfo.secondaryProfiles[profileIndex] ? this.props.customerInfo.secondaryProfiles[profileIndex].lastName  : ""}                            
                            inputProps={{}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">
                              <Typography type="body1" className="text-uppercase font-medium">Plan</Typography>

                            </FormLabel>
                            <RadioGroup
                              aria-label="lifestyle"
                              name="lifestyle"
                              value={
                                this.state.secondaryProfilesData[profileIndex]
                                  .lifestyle
                              }
                              onChange={this.handleChangeRadioLifestyleSecondary.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ flexDirection: 'row' }}
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

                      {/* <Grid container>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Extras</FormLabel>
                            <RadioGroup
                              aria-label="extra"
                              name="extra"
                              value={
                                this.state.secondaryProfilesData[profileIndex]
                                  .extra
                              }
                              onChange={this.handleChangeRadioExtraSecondary.bind(
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
                                      !element.extraAthletic &&
                                      !element.extraBodybuilder,
                                  )
                                }
                              />
                              <FormControlLabel
                                value="athletic"
                                control={<Radio />}
                                label="Athletic"
                                disabled={
                                  this.state.secondaryProfilesData[profileIndex]
                                    .lifestyle &&
                                  this.props.lifestyles.find(
                                    element =>
                                      element.title ==
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].lifestyle && !element.extraAthletic,
                                  )
                                }
                              />
                              <FormControlLabel
                                value="bodybuilder"
                                control={<Radio />}
                                label="Bodybuilder"
                                disabled={
                                  this.state.secondaryProfilesData[profileIndex]
                                    .lifestyle &&
                                  this.props.lifestyles.find(
                                    element =>
                                      element.title ==
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].lifestyle && !element.extraBodybuilder,
                                  )
                                }
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid> */}

                        <Grid item xs={12} sm={6}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend"><Typography type="body1" className="text-uppercase font-medium">Discount</Typography></FormLabel>
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
                        <Grid item xs={12} style={{ marginTop: '25px' }}>
                          <Typography type="body1" className="text-uppercase font-medium">Restrictions</Typography>
                        
                        </Grid>
                        <Grid item xs={4}>
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
                        <Grid item xs={4}>
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
                        <Grid item xs={4}>
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
                      </Grid>
               
                      <Dialog
                        open={this.state.deleteDialogOpen}
                        onRequestClose={this.deleteDialogHandleRequestClose.bind(
                          this,
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
                            Select if it's a preference or if it's a restriction
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
                      </Dialog>

                      <Grid container>
                  
                        <Grid item xs={12} sm={6}>
                          <Typography type="body1" className="text-uppercase font-medium" style={{ marginTop: '25px' }}>Preferences</Typography>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                marginTop: "25px"
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
                                    onRequestDelete={this.handleSubIngredientChipDelete.bind(
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
                          <Typography type="body1" className="text-uppercase font-medium">Restrictions</Typography>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                marginTop: "25px"
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
                                    onRequestDelete={this.handleSubIngredientChipDeleteSpecificRestriction.bind(
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
                            onClick={this.deleteDialogHandleOpen.bind(this)}
                          >
                            Add a restriction
                          </Button>
                        </Grid>
                      </Grid>

                      <Grid container style={{ marginTop: '50px' }}>
                        <Grid item xs={12}>
                        <Typography type="body1" className="text-uppercase font-medium">Schedule</Typography>

                        </Grid>

                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="scheduleType"
                              name="scheduleType"
                              value={
                                this.state.secondaryProfilesData[profileIndex]
                                  .scheduleType
                              }
                              onChange={this.handleChangeRadioscheduleTypeSecondary.bind(
                                this,
                                profileIndex,
                              )}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                value={'weekdays'}
                                control={<Radio />}
                                label={'Weekdays'}
                                selected
                              />

                              <FormControlLabel
                                value={'weekends'}
                                control={<Radio />}
                                label={'Weekends'}
                                selected
                              />

                              <FormControlLabel
                                value={'custom'}
                                control={<Radio />}
                                label={'Custom'}
                                selected
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Grid container style={{ marginTop: '20px' }}>
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
                            {this.state.schedule.map((e, i) => {
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
                                      value={
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].schedule[i].breakfast
                                      }
                                      onChange={(event) => {
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].schedule[i].breakfast =
                                          event.target.value;
                                        this.forceUpdate();
                                        this.handleSubscriptionScheduleChange();
                                      }}
                                      inputProps={{
                                        type: 'number',
                                        min: '0',
                                        max: '3',
                                      }}
                                      name={`${profileIndex}_breakfast_${i}`}
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
                                      onChange={(event) => {
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].schedule[i].lunch =
                                          event.target.value;
                                        this.forceUpdate();
                                        this.handleSubscriptionScheduleChange();
                                      }}
                                      value={
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].schedule[i].lunch
                                      }
                                      inputProps={{
                                        type: 'number',
                                        min: '0',
                                        max: '3',
                                      }}
                                      name={`${profileIndex}_lunch_${i}`}
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
                                      onChange={(event) => {
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].schedule[i].dinner =
                                          event.target.value;
                                        this.forceUpdate();
                                        this.handleSubscriptionScheduleChange();
                                      }}
                                      value={
                                        this.state.secondaryProfilesData[
                                          profileIndex
                                        ].schedule[i].dinner
                                      }
                                      inputProps={{
                                        type: 'number',
                                        min: '0',
                                        max: '3',
                                      }}
                                      name={`${profileIndex}_dinner_${i}`}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
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

              <Grid container>
                
                <Grid item xs={12} style={{ marginTop: '25px' }}>

                  <Typography type="body1" className="text-uppercase font-medium">Complete Schedule</Typography>

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
                      {this.state.schedule.map((e, i) => {
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
                                  this.state.subscriptionSchedule[i].breakfast
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
                                value={this.state.subscriptionSchedule[i].lunch}
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
                                  this.state.subscriptionSchedule[i].dinner
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
        
                  <Typography type="body1" className="text-uppercase font-medium">Delivery type</Typography>

                </Grid>
                <Grid item xs={12}>
                  {this.state.subscriptionSchedule.map(
                    (e, i) => '',
                    // this.renderOptions(e, i),
                  )}

                  <Stepper
                    activeStep={activeDeliveryScheduleStep}
                    style={{ background: 'none !important' }}
                  >
                    {steps.map((label, index) => {
                      const props = {};
                      const stepLabel = `${label} ${moment(
                        this.renderStartDays()[0],
                      )
                        .add(index, 'd')
                        .format('DD')}`;

                      if (index == 5) {
                        stepLabel = `${label.split('/')[0]} ${moment(
                          this.renderStartDays()[0],
                        )
                          .add(index, 'd')
                          .format('DD')} & ${label.split('/')[1]} ${moment(
                          this.renderStartDays()[0],
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

                  {this.state.subscriptionSchedule.map((label, index) => {
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
                    <Button onClick={this.handleNextDeliverySchedule.bind(this)}>
                      Next
                    </Button>
                    
                  ) : (
                    ''
                  )}
                 
                </Grid>
              </Grid>
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

Step3LifestyleProfile.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default withStyles(styles)(Step3LifestyleProfile);
