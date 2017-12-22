import React from "react";
import PropTypes from "prop-types";

import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import { MenuItem } from "material-ui/Menu";
import Input from "material-ui/Input";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import Radio, { RadioGroup } from "material-ui/Radio";
import Geosuggest from "react-geosuggest";
import "./GeoSuggest.scss";

import Checkbox from "material-ui/Checkbox";
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText
} from "material-ui/Form";

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow
} from "material-ui/Table";

import Stepper, { Step, StepLabel } from "material-ui/Stepper";
import moment from "moment";

import classNames from "classnames";
import { withStyles } from "material-ui/styles";
import { CircularProgress } from "material-ui/Progress";
import green from "material-ui/colors/green";

import $ from "jquery";
import validate from "../../../modules/validate";
import FormGroup from "material-ui/Form/FormGroup";

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
      dormResidence: "Algonquin College",
      activeDeliveryScheduleStep: 0,
 
      subscriptionSchedule: [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ],
      deliveryType: ["", "", "", "", "", "", ""],

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
      dormResidence: event.currentTarget.value
    });
  }

  changeRadioDeliveryType(index, event, value) {

    const clonedDeliveryType = this.state.deliveryType.slice();

    clonedDeliveryType[index] = value;

    this.setState({
      deliveryType: clonedDeliveryType
    });

    this.forceUpdate();
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

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess
    });

    const steps = this.getSteps();
    const { activeDeliveryScheduleStep } = this.state;

    return (
      <form
        id="step4"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: "50px", marginTop: "25px" }}
        >
          <Grid item xs={12} sm={12}>
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
                      onChange={this.handleChangeRadioAddressType.bind(this)}
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
                        defaultValue={this.props.customerInfo.address.buzzer}
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
                        defaultValue={this.props.customerInfo.address.buzzer}
                        inputProps={{}}
                      />
                    </Grid>
                  </Grid>
                </div>
              ) : (
                ""
              )}

              {this.state.addressType && this.state.addressType === "hotel" ? (
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
                      defaultValue={this.props.customerInfo.address.roomNumber}
                      inputProps={{}}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox value="leaveAtFrontDesk" />}
                        label="Leave at front desk"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              ) : (
                ""
              )}

              {this.state.addressType && this.state.addressType === "house" ? (
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
                        defaultValue={this.props.customerInfo.address.unitHouse}
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
                      {/* <TextField

                          /> */}

                      <Geosuggest className="geosuggest-input-material" />
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

                  <Grid container>
                    <Grid item xs={12}>
                      <FormGroup>
                        <FormControlLabel
                          control={<Checkbox value="leaveAtFrontDesk" />}
                          label="Cooler bag (One time fee - $20)"
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item xs={12} style={{ marginTop: "25px" }}>
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
                          {this.state.subscriptionSchedule.map((e, i) => {
                            const days = [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday"
                            ];

                            return (
                              <TableRow key={i}>
                                <TableCell>
                                  <Typography
                                    type="subheading"
                                    style={{ marginTop: "10px" }}
                                  >
                                    {days[i]}
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
                                    disabled
                                    value={
                                      this.state.subscriptionSchedule[i]
                                        .breakfast
                                    }
                                    name={`all_breakfast_${i}`}
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
                                    disabled
                                    value={
                                      this.state.subscriptionSchedule[i].lunch
                                    }
                                    name={`all_lunch_${i}`}
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

                  <Grid container style={{ marginTop: "25px" }}>
                    <Grid item xs={12}>
                      <Typography
                        type="body1"
                        className="text-uppercase font-medium"
                      >
                        Delivery type
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      {this.state.subscriptionSchedule.map(
                        (e, i) => ""
                        // this.renderOptions(e, i),
                      )}

                      <Stepper
                        activeStep={activeDeliveryScheduleStep}
                        style={{ background: "none !important" }}
                      >
                        {steps.map((label, index) => {
                          const props = {};
                          const stepLabel = `${label} ${moment(
                            this.renderStartDays()[0]
                          )
                            .add(index, "d")
                            .format("DD")}`;

                          if (index == 5) {
                            stepLabel = `${label.split("/")[0]} ${moment(
                              this.renderStartDays()[0]
                            )
                              .add(index, "d")
                              .format("DD")} & ${label.split("/")[1]} ${moment(
                              this.renderStartDays()[0]
                            )
                              .add(index + 1, "d")
                              .format("DD")}`;
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
                          activeDeliveryScheduleStep
                        );
                      })}

                      {activeDeliveryScheduleStep >= 1 ? (
                        <Button
                          onClick={this.handleBackDeliverySchedule.bind(this)}
                        >
                          Back
                        </Button>
                      ) : (
                        ""
                      )}

                      {activeDeliveryScheduleStep < 5 ? (
                        <Button
                          onClick={this.handleNextDeliverySchedule.bind(this)}
                        >
                          Next
                        </Button>
                      ) : (
                        ""
                      )}
                    </Grid>
                  </Grid>
                </div>
              ) : (
                ""
              )}
            </Paper>
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
