/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import Autosuggest from 'react-autosuggest';

import _ from 'lodash';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
// import Select from 'material-ui/Select';
// import Input, { InputLabel } from 'material-ui/Input';
// import { FormControl, FormHelperText } from 'material-ui/Form';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import { withStyles } from 'material-ui/styles';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';

import validate from '../../../modules/validate';
import Step1Eligibility from './Step1Eligibility';
import Step2Plan from './Step2Plan';
import Step3Delivery from './Step3Delivery';
import Step4Checkout from './Step4Checkout';
import moment from 'moment';
import assign from 'lodash/assign';

import $ from 'jquery';

// const primary = teal[500];
const danger = red[700];

const styles = theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});

function getSteps() {
  return ['Eligibility & Contact', 'Plan', 'Delivery', 'Checkout'];
}

$.validator.addMethod(
  'cdnPostal',
  function (postal, element) {
    return (
      this.optional(element) ||
      postal.match(/[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/)
    );
  },
  'Please specify a valid postal code.',
);

class CustomerEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // value: '', // Autosuggest
      // suggestions: [],
      // subIngredients: this.props.ingredient ? _.sortBy(this.props.ingredient.subIngredients, 'title') : [],
      // selectedType: this.props.ingredient.typeId,
      deleteDialogOpen: false,
      hasFormChanged: false,
      activeStep: 0,
      customerInfo: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        postalCode: '',
        phoneNumber: '',
        adultOrChild: '',

        // step3
        lifestyle: '',
        discount: '',
        extra: '',
        restrictions: [],
        specificRestrictions: [],
        preferences: [],

        scheduleReal: [
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

        secondaryProfileCount: 0,
        secondaryProfiles: [],

        address: {
          type: '',
          street: '',
          postalCode: '',
          notes: '',
        },
        coolerBag: false,
        completeSchedule: [
          { breakfast: 0, lunch: 0, dinner: 0 },
          { breakfast: 0, lunch: 0, dinner: 0 },
          { breakfast: 0, lunch: 0, dinner: 0 },
          { breakfast: 0, lunch: 0, dinner: 0 },
          { breakfast: 0, lunch: 0, dinner: 0 },
          { breakfast: 0, lunch: 0, dinner: 0 },
          { breakfast: 0, lunch: 0, dinner: 0 },
        ],
      },
    };

    this.getStepContent = this.getStepContent.bind(this);
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

  handleNext() {
    const { activeStep } = this.state;

    this.setState({
      activeStep: activeStep + 1,
    });
  }

  handleBack() {
    const { activeStep } = this.state;

    this.setState({
      activeStep: activeStep - 1,
    });
  }

  getStepContent(step) {
    // switch (step) {
    //   case 0:
    //     return (
    //       <Step1Eligibility
    //         handleNext={this.handleNext.bind(this)}
    //         saveValues={this.saveValues.bind(this)}
    //         customerInfo={this.state.customerInfo}
    //         popTheSnackbar={this.props.popTheSnackbar.bind(this)}
    //       />
    //     );

    //   case 1:
    //     return (
    //       <Step2Plan
    //         handleNext={this.handleNext.bind(this)}
    //         handleBack={this.handleBack.bind(this)}
    //         saveValues={this.saveValues.bind(this)}
    //         customerInfo={this.state.customerInfo}
    //         popTheSnackbar={this.props.popTheSnackbar.bind(this)}
    //         potentialSubIngredients={this.props.potentialSubIngredients}
    //         lifestyles={this.props.lifestyles}
    //         restrictions={this.props.restrictions}
    //         postalCodes={this.props.postalCodes}
    //       />
    //     );
    //   case 2:
    //     return (
    //       <Step3Delivery
    //         handleNext={this.handleNext.bind(this)}
    //         handleBack={this.handleBack.bind(this)}
    //         saveValues={this.saveValues.bind(this)}
    //         customerInfo={this.state.customerInfo}
    //         popTheSnackbar={this.props.popTheSnackbar.bind(this)}
    //       />
    //     );
    //   case 3:
    //     return (
    //       <Step4Checkout
    //         handleNext={this.handleNext.bind(this)}
    //         handleBack={this.handleBack.bind(this)}
    //         saveValues={this.saveValues.bind(this)}
    //         customerInfo={this.state.customerInfo}
    //         popTheSnackbar={this.props.popTheSnackbar.bind(this)}
    //         lifestyles={this.props.lifestyles}
    //         restrictions={this.props.restrictions}
    //         ingredients={this.props.potentialSubIngredients}
    //         postalCodes={this.props.postalCodes}
    //         history={this.props.history}
    //       />
    //     );
    //   default:
    //     return "Unknown step";
    // }


    return (
      <div>
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <Step1Eligibility
            activeStep={this.state.activeStep}
            handleNext={this.handleNext.bind(this)}
            saveValues={this.saveValues.bind(this)}
            customerInfo={this.state.customerInfo}
            popTheSnackbar={this.props.popTheSnackbar.bind(this)}
          />
        </div>
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Step2Plan
            activeStep={this.state.activeStep}
            handleNext={this.handleNext.bind(this)}
            handleBack={this.handleBack.bind(this)}
            saveValues={this.saveValues.bind(this)}
            customerInfo={this.state.customerInfo}
            popTheSnackbar={this.props.popTheSnackbar.bind(this)}
            potentialSubIngredients={this.props.potentialSubIngredients}
            lifestyles={this.props.lifestyles}
            restrictions={this.props.restrictions}
            postalCodes={this.props.postalCodes}
          />
        </div>
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <Step3Delivery
            activeStep={this.state.activeStep}
            handleNext={this.handleNext.bind(this)}
            handleBack={this.handleBack.bind(this)}
            saveValues={this.saveValues.bind(this)}
            customerInfo={this.state.customerInfo}
            popTheSnackbar={this.props.popTheSnackbar.bind(this)}
          />
        </div>

        <div style={{ display: step === 3 ? 'block' : 'none' }}>
          <Step4Checkout
            activeStep={this.state.activeStep}
            handleNext={this.handleNext.bind(this)}
            handleBack={this.handleBack.bind(this)}
            saveValues={this.saveValues.bind(this)}
            customerInfo={this.state.customerInfo}
            popTheSnackbar={this.props.popTheSnackbar.bind(this)}
            lifestyles={this.props.lifestyles}
            restrictions={this.props.restrictions}
            ingredients={this.props.potentialSubIngredients}
            postalCodes={this.props.postalCodes}
            history={this.props.history}
          />
        </div>
      </div>
    );
  }

  saveValues(fields) {
    // taken this from a nice blog article which explained multi step forms

    // Remember, `fieldValues` is set at the top of this file, we are simply appending
    // to and overriding keys in `fieldValues` with the `fields` using Object.assign
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    const clonedCustomerInfo = this.state.customerInfo;
    const newCustomerInfo =  assign({}, clonedCustomerInfo, fields);
    
    this.setState({
      customerInfo: newCustomerInfo
    });
  }

  render() {
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <div style={{ width: '100%' }}>
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
              style={{ fontWeight: 500 }}
            >
              Add customer
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
                onClick={() => this.props.history.push('/customers')}
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

        <Stepper className="customerStepsStepper" activeStep={activeStep}>
          {steps.map((label, index) => {
            const props = {};
            return (
              <Step key={label} {...props}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {this.getStepContent(activeStep)}
      </div>
    );
  }
}

CustomerEditor.defaultProps = {
  category: { title: '' },
};

CustomerEditor.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(CustomerEditor);
