/* eslint-disable max-len, no-return-assign */

/*
  THIS COMPONENT RIGHT NOW IS ONE BIG MESS, IT'S JUST ALL THE STEPS CLUBBED INTO ONE
*/

import React from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';

import _ from 'lodash';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import Switch from 'material-ui/Switch';

import Radio, { RadioGroup } from 'material-ui/Radio';
import Checkbox from 'material-ui/Checkbox';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
// import Input, { InputLabel } from 'material-ui/Input';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import moment from 'moment';

import Geosuggest from 'react-geosuggest';
import '../CustomerEditor/GeoSuggest.scss';


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

import List, { ListItem, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import green from 'material-ui/colors/green';
import { red } from 'material-ui/colors';
import { CircularProgress } from 'material-ui/Progress';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';
import autoBind from 'react-autobind';

import validate from '../../../modules/validate';

import Step4CheckoutCurrent from './Step4CheckoutCurrent'

import OrderSummary from '../../pages/OrderSummary/OrderSummary';

import Loading from '../Loading/Loading';


const danger = red[700];

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
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
});


class CurrentCustomerEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      // ui
      currentTab: 0,
      activeMealScheduleStep: 0,

      birthDay: props.customer.profile.hasOwnProperty('birthday') ? parseInt(props.customer.profile.birthday.day, 10) : '',
      birthMonth: props.customer.profile.hasOwnProperty('birthday') ? parseInt(props.customer.profile.birthday.month, 10) : '',
      // Step 2 - Plan
      value: '',
      suggestions: [],
      subIngredients: !this.props.loading && this.props.customer && this.props.customer.preferences && this.props.customer.preferences.length > 0 ? this.props.customer.preferences : [],
      specificRestrictions: !this.props.loading && this.props.customer && this.props.customer.specificRestrictions && this.props.customer.specificRestrictions.length > 0 ? this.props.customer.specificRestrictions : [],
      deleteDialogOpen: false,
      addRestrictionType: 'Restriction',

      lifestyle: '',

      isLifestyleCustom: false,

      discountCode: !this.props.loading && this.props.subscription && this.props.subscription.hasOwnProperty('discountApplied') ? this.props.subscription.discountApplied : '', 
      
      discount: !this.props.loading && this.props.customer && this.props.customer.discount
        ? this.props.customer.discount
        : 'none',
      restrictions: this.props.customer && this.props.customer.restrictions && this.props.customer.restrictions.length > 0 ?
        this.props.customer.restrictions : [],
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
      platingNotes: this.props.customer.platingNotes ? this.props.customer.platingNotes : '',

      secondaryCollapses: [false, false, false, false, false, false],
      secondaryProfileCount: this.props.customer && this.props.customer.associatedProfiles > 0 ? this.props.customer.associatedProfiles : 0,
      secondaryProfilesData: this.props.customer && this.props.lifestyles && this.props.secondaryAccounts ? this.props.secondaryAccounts.map((e) => {
        return {
          _id: e._id,
          first_name: e.profile.name.first,
          last_name: e.profile.name.last ? e.profile.name.last : '',
          subIngredients: e.preferences,
          specificRestrictions: e.specificRestrictions,
          lifestyle: this.props.lifestyles.find(lifestyle => lifestyle._id === e.lifestyle).title,
          isLifestyleCustom: this.props.lifestyles.find(lifestyle => lifestyle._id == e.lifestyle).custom,
          discount: e.discount,
          restrictions: e.restrictions, //fix here
          activeMealScheduleStep: 0,
          deleteDialogOpen: false,
          scheduleReal: e.schedule,
          platingNotes: e.platingNotes ? e.platingNotes : '',
          adultOrChild: e.adultOrChild,
        }
      }) : [],
      secondaryProfilesRemoved: [],
      
      orderSummaryDialogOpen: false,


      // Step 3: Delivery

      addressType: !this.props.loading && this.props.customer.secondary == undefined && this.props.customer.address ? this.props.customer.address.type : '',

      apartmentName: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.apartmentName ? this.props.customer.address.apartmentName : '',
      unit: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.unit ? this.props.customer.address.unit : '',
      buzzer: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.buzzer ? this.props.customer.address.buzzer : '',

      businessName: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.businessName ? this.props.customer.address.businessName : '',

      roomNumber: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.roomNumber ? this.props.customer.address.roomNumber : '',

      hotelName: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.hotelName ? this.props.customer.address.hotelName : '',
      hotelFrontDesk: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.leaveAtFrontDesk ? this.props.customer.address.leaveAtFrontDesk : '',

      dormName: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.dormName ? this.props.customer.address.dormName : 'Algonquin College',
      dormResidence: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.dormResidence ? this.props.customer.address.dormResidence : 'Student Residence',

      streetAddress: !this.props.customer.secondary && this.props.customer.address && this.props.customer.address.streetAddress ? this.props.customer.address.streetAddress : '',
      postalCode: !this.props.customer.secondary && this.props.customer.postalCode,

      notes: !this.props.customer.secondary && this.props.customer.secondary === undefined && this.props.customer.address && this.props.customer.address && this.props.customer.address && this.props.customer.address.notes ?
        this.props.customer.address.notes : '',

      coolerBag: !this.props.customer.secondary && this.props.customer.secondary === undefined && this.props.customer.coolerBag != undefined ? this.props.customer.coolerBag : false,


      deliveryNotifcations: !this.props.customer.secondary && this.props.customer.secondary === undefined && this.props.customer.notifications ?
        {
          email: this.props.customer.notifications.delivery.email,
          sms: this.props.customer.notifications.delivery.sms,
        }
        : {
          email: false,
          sms: false
        },
        
      activeDeliveryScheduleStep: 0,

      completeSchedule: !this.props.loading && this.props.subscription ? this.props.subscription.completeSchedule : [],
      deliveryType: !this.props.loading &&  this.props.subscription ? this.props.subscription.delivery : [],

      subscriptionStartDate: moment(this.renderStartDays()[0]).format(
        'dddd MMMM Do YYYY',
      ),
      subscriptionStartDateRaw: this.renderStartDays()[0],

      submitLoading: false,
      submitSuccess: false,

      submitLoadingReset: false,
      submitSuccessReset: false,


      secondTime: false, //Step2 modal save

      discountApplied: !this.props.loading && this.props.subscription && this.props.subscription.hasOwnProperty('discountApplied') ? this.props.subscription.discountApplied : '',

      primaryProfileBilling: null,
      secondaryProfilesBilling: null,

    };

    autoBind(this)
  }

  handleSelectChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      hasFormChanged: true,
    });
  }
  
  renderMonths() {
    const options = [];

    options.push(<MenuItem key={0} value=""></MenuItem>);

    for (let i = 1; i <= 12; i++) {
      options.push(<MenuItem key={i} value={i}>{moment().month(i - 1).format('MMMM')}</MenuItem>);
    }

    return options.map(e => e);
  }

  renderDays() {
    const options = [];

    options.push(<MenuItem key={0} value=""></MenuItem>);

    for (let i = 1; i <= 31; i++) {
      options.push(<MenuItem key={i} value={i}>{i}</MenuItem>);
    }

    return options.map(e => e);
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
          required: this.props.customer.secondary === undefined,
        },

        email: {
          required: true,
          email: this.props.customer.secondary === undefined,
        },

        phoneNumber: {
          minlength: 10,
          maxlength: 10,
          number: this.props.customer.secondary === undefined,
        },

        postal_code: {
          minlength: 6,
          maxlength: 6,
          cdnPostal: true,
          required: this.props.customer.secondary === undefined,
        },
        birthMonth: {
          number: true,
          maxlength: 2,
          max: 12,
          min: 1,
        },
        birthDay: {
          number: true,
          maxlength: 2,
          max: 31,
          min: 1,
        }
      },
      submitHandler() {
        component.saveFirstStep();
      },
    });
  }

  handleResetPassword(){

    this.setState({
      submitLoadingReset: true,
      submitSuccessReset: false,
    })

    console.log(this.props.customer._id)

    Meteor.call('users.resetPassword', this.props.customer._id, (err, res) => {
      if(err){
        this.setState({
          submitLoadingReset: false,
          submitSuccessReset: false,
        })

        this.props.popTheSnackbar({
          message: 'There was a problem sending the reset password email.'
        })
    
      } else{
        this.setState({
          submitLoadingReset: false,
          submitSuccessReset: false,
        })
        
        this.props.popTheSnackbar({
          message: 'Successfully sent a reset password email.'
        })
      }
    })
  }

  componentWillReceiveProps(nextProps, prevState){
    
    if(!nextProps.loading) {
      if(nextProps.lifestyles && nextProps.customer && nextProps.customer.lifestyle && nextProps.subscription && nextProps.secondaryAccounts) {

        const secondaryAccounts = nextProps.secondaryAccounts.map((e) => {
          return {
            _id: e._id,
            first_name: e.profile.name.first,
            last_name: e.profile.name.last ? e.profile.name.last : '',
            subIngredients: e.preferences,
            specificRestrictions: e.specificRestrictions,
            lifestyle: nextProps.lifestyles.find(lifestyle => lifestyle._id === e.lifestyle).title,
            isLifestyleCustom: nextProps.lifestyles.find(lifestyle => lifestyle._id == e.lifestyle).custom,
            discount: e.discount,
            restrictions: e.restrictions, //fix here
            activeMealScheduleStep: 0,
            deleteDialogOpen: false,
            scheduleReal: e.schedule,
            platingNotes: e.platingNotes ? e.platingNotes : '',
            adultOrChild: e.adultOrChild,
          }
        });
        
        const discountApplied = nextProps.subscription.hasOwnProperty('discountApplied') ? nextProps.subscription.discountApplied : '';

        
        // console.log(nextProps)
        const currentLifestyle = nextProps.lifestyles.find(e => e._id === nextProps.customer.lifestyle);
        const isLifestyleCustom = currentLifestyle != undefined && currentLifestyle.custom ? currentLifestyle.custom : false;

        if(currentLifestyle != undefined){
          this.setState({
            lifestyle: currentLifestyle.title,
            lifestyleCustom: isLifestyleCustom,
            completeSchedule:  nextProps.subscription.completeSchedule,
            deliveryType:  nextProps.subscription.delivery,
            discountApplied: discountApplied,
            secondaryProfilesData: secondaryAccounts,
          })
        }
      }
    }
    
  }
  
  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentTab == 1) {
      validate(this.secondForm, {
        errorPlacement(error, element) {
          error.insertAfter(
            $(element)
              .parent()
              .parent(),
          );
        },

        rules: {
          first_name: { required: true },

          last_name: { required: this.props.customer.secondary === undefined },

          lifestyle: { required: true },

          discount: { required: true },

          first_name1: { required: true },
          first_name2: { required: true },
          first_name3: { required: true },
          first_name4: { required: true },
          first_name5: { required: true },
          first_name6: { required: true },
          first_name7: { required: true },

          lifestyle1: { required: true },
          lifestyle2: { required: true },
          lifestyle3: { required: true },
          lifestyle4: { required: true },
          lifestyle5: { required: true },
          lifestyle6: { required: true },
          lifestyle7: { required: true },

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

          //delivery
          addressType: {
            required: true,
          },
          apartmentUnit: {
            required: true,
          },
          business_name: {
            required: true,
          },
          hotelName: {
            required: true,
          },
          streetAddress: {
            required: true,
          },
        },

        submitHandler() {
          this.saveSecondStep();
        },
      });
    }

  }

  saveFirstStep() {
    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    const step1Data = {
      id: this.props.customer._id,
      firstName: $('[name="first_name"]').val().trim(),
      lastName: $('[name="last_name"]').val().trim(),
      postalCode: $('[name="postal_code"]').val().trim(),
      phoneNumber: $('[name="phoneNumber"]').val().trim(),
      birthDay: this.state.birthDay,
      birthMonth: this.state.birthMonth,
    };



    if (this.props.customer.secondary) {
      step1Data.username = $('[name="username"]').val().trim();
      step1Data.secondary = true;
    } else {
      step1Data.email = $('[name="email"]').val().trim();
    }

    console.log(step1Data);


    Meteor.call('edit.customer.step1', step1Data, (err, res) => {
      if (err) {
        this.setState({
          submitSuccess: false,
          submitLoading: false,
        }, () => {
          this.props.popTheSnackbar({
            message: err.reason,
          });
        });
      } else {
        this.setState({
          submitSuccess: true,
          submitLoading: false,
        }, () => {
          this.props.popTheSnackbar({
            message: 'Customer details updated successfully.',
          });
        });
      }
    });
  }

  saveSecondStep() {
    console.log($('#step2').valid());

    if (!$('#step2').valid()) {
      this.setState({
        secondTime: false,
        orderSummaryDialogOpen: false,
      });

      return;
    }

    if (
      this.state.scheduleReal.find(
        el => el.breakfast.active || el.lunch.active || el.dinner.active,
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
            el => el.breakfast.active || el.lunch.active || el.dinner.active,
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

    const scheduleSummation = [
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
    ];


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
      });
    });

    const check = this.state.completeSchedule.map(day => (day.breakfast + day.lunch + day.dinner) > 0);

    console.log(check);

    for (let index = 0; index < this.state.deliveryType.length; index++) {
      const element = this.state.deliveryType[index];

      if (((element == "" || element == "false") && check[index] > 0 && index != 6)) {
        this.props.popTheSnackbar({
          message: "Please select all the delivery options in the schedule."
        });

        return;
      }
    }

    const address = {
      type: this.state.addressType,
      streetAddress: this.state.streetAddress,
      postalCode: this.state.postalCode,
      notes: this.state.notes,
    };

    if (this.state.addressType == 'apartment') {
      address.apartmentName = this.state.apartmentName;
      address.unit = this.state.unit;
      address.buzzer = this.state.buzzer;
    } else if (this.state.addressType == 'hotel') {
      address.hotelName = this.state.hotelName;
      address.roomNumber = this.state.roomNumber;
      address.leaveAtFrontDesk = true;
    } else if (this.state.addressType == 'house') {
      address.unit = this.state.unit;
    } else if (this.state.addressType == 'business') {
      address.businessName = this.state.businessName;
      address.unit = this.state.unit;
      address.buzzer = this.state.buzzer;
    } else if (this.state.addressType == 'dormitory') {
      address.dormName = this.state.dormName;
      address.dormResidence = this.state.dormResidence;
      address.roomNumber = this.state.roomNumber;
      address.buzzer = this.state.buzzer;
    }

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    const step2Data = {
      id: this.props.customer._id,
      address,
      subscriptionId: this.props.subscription ? this.props.subscription._id : '',
      subIngredients: this.state.subIngredients,
      specificRestrictions: this.state.specificRestrictions,
      lifestyle: this.props.lifestyles.find(e => e.title === this.state.lifestyle)._id,
      discount: this.state.discount,
      discountCode: this.state.discountCode,
      restrictions: this.state.restrictions,
      scheduleReal: this.state.scheduleReal,
      platingNotes: this.state.platingNotes,
      secondary: this.props.customer.secondary != undefined,
      secondaryProfiles: this.state.secondaryProfilesData,
      secondaryProfilesRemoved: this.state.secondaryProfilesRemoved,
      completeSchedule: this.state.completeSchedule,
      delivery: this.state.deliveryType,
      coolerBag: this.state.coolerBag,
      notifications: {
        delivery: {
          sms: this.state.deliveryNotifcations.sms,
          email: this.state.deliveryNotifcations.email
        }
      }
    };

    console.log(step2Data);

    if (!this.state.secondTime) {

      Meteor.call('edit.customer.generateBillData', step2Data, (err, res) => {

        if (err) {
          this.setState({
            submitSuccess: false,
            submitLoading: false,
          }, () => {
            this.props.popTheSnackbar({
              message: err.reason,
            });
          })
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
            primaryProfileBilling: res.primaryProfileBilling,
            secondaryProfilesBilling: res.secondaryProfilesBilling,
          }, () => {
            this.setState({
              orderSummaryDialogOpen: true,
              secondTime: true,
            })
          });
        }

      });

      return;
    }

    // console.log("Calling this func second time");

    Meteor.call('edit.customer.step2', step2Data, (err, res) => {
      if (err) {
        this.setState({
          submitSuccess: false,
          submitLoading: false,
          secondTime: false,
        }, () => {
          this.props.popTheSnackbar({
            message: err.reason,
          });
        });
      } else {
        this.setState({
          submitSuccess: true,
          submitLoading: false,
          secondTime: false,
        }, () => {

          if (typeof res == "object" && res.hasOwnProperty('subUpdateScheduled')) {
            this.props.popTheSnackbar({
              message: 'Customer details update scheduled for friday night.',
            });
          } else {
            this.props.popTheSnackbar({
              message: 'Customer details updated successfully.',
            });
          }

          this.setState({
            orderSummaryDialogOpen: false
          })

        });
      }
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

    const scheduleSummation = [
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
    ];

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
      });
    });

    this.setState({
      scheduleReal: scheduleRealCopy,
      completeSchedule: scheduleSummation
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
    }, () => {
      const scheduleSummation = [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ];

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
        });
      });

      this.setState({
        completeSchedule: scheduleSummation,
        deliveryType: ['', '', '', '', '', '', ''],
      });
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

  // STEP 2: Secondary Profiles

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
      lifestyle: 'Traditional',
      isLifestyleCustom: false,
      discount: 'none',
      restrictions: [],
      activeMealScheduleStep: 0,
      deleteDialogOpen: false,
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
      platingNotes: '',
      adultOrChild: 'adult',
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

    const toBeRemoved = profileToRemove.splice(profileToRemove.indexOf(index), 1);

    const secondaryProfilesRemovedCopy = this.state.secondaryProfilesRemoved.slice();

    if (toBeRemoved[0].hasOwnProperty('_id')) {
      secondaryProfilesRemovedCopy.push(toBeRemoved[0]._id);
    }
    console.log(toBeRemoved);

    const scheduleSummation = [
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
      { breakfast: 0, lunch: 0, dinner: 0 },
    ];

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
      });
    });

    this.setState({
      completeSchedule: scheduleSummation,
      secondaryProfileCount: decreasedProfileCount,
      secondaryProfilesData: profileToRemove,
      secondaryProfilesRemoved: secondaryProfilesRemovedCopy,
      deliveryType: ['', '', '', '', '', '', ''],
    });


  }

  handleProfileOpen(primary, index) {
    const currentCollapseArr = this.state.secondaryCollapses.slice();

    currentCollapseArr[index] = !currentCollapseArr[index];

    this.setState({
      secondaryCollapses: currentCollapseArr,
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
    }, () => {

      const scheduleSummation = [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ];

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
        });
      });

      this.setState({
        completeSchedule: scheduleSummation
      })

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
  handleScheduleMealTypeCheckSecondary(profileIndex, index, mealType, event) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].scheduleReal[index][
      mealType
    ].active = !secondaryProfilesDataCopy[profileIndex].scheduleReal[index][
      mealType
    ].active;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    }, () => {
      const scheduleSummation = [
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
        { breakfast: 0, lunch: 0, dinner: 0 },
      ];

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
        });
      });

      this.setState({
        completeSchedule: scheduleSummation,
        deliveryType: ['', '', '', '', '', '', ''],
      });
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

  handleChangeRadioLifestyleSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].lifestyle = value;

    const getLifestyleRestrictions = this.props.lifestyles.find(
      el => el.title === value,
    );

    const currentRestrictionsIds = [];
    currentRestrictionsIds.push(...getLifestyleRestrictions.restrictions);

    this.state.secondaryProfilesData[
      i
    ].lifestyleRestrictions = currentRestrictionsIds;

    this.state.secondaryProfilesData[i].isLifestyleCustom = getLifestyleRestrictions.custom;

    this.forceUpdate();
  }

  handleChangeRadioDiscountSecondary(i, event, value) {
    this.state.secondaryProfilesData[i].discount = value;
    this.forceUpdate();
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

  onSuggestionSelectedSecondary(
    index,
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    let clonedSubIngredients;

    console.log(index);

    if (this.state.addRestrictionType == 'Preference') {
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

  handlePlatingNotesChangeSecondary(profileIndex, event) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData.slice();

    secondaryProfilesDataCopy[profileIndex].platingNotes = event.target.value;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    });
  }

  renderMealStepsContentSecondary(profileIndex, stepIndex) {
    return (
      <Grid container>
        <Grid item xs={12} sm={4}>
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

        <Grid item xs={12} sm={4}>
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

        <Grid item xs={12} sm={4}>
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
      </Grid >
    );
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


  handleChangeRadioAdultOrChild(profileIndex, event, value) {
    const secondaryProfilesDataCopy = this.state.secondaryProfilesData;

    secondaryProfilesDataCopy[profileIndex].adultOrChild = event.target.value;

    this.setState({
      secondaryProfilesData: secondaryProfilesDataCopy,
    });
  }


  // STEP 3: Delivery
  handleDeliveryNotification(type, event) {

    const notificationClone = this.state.deliveryNotifcations;

    notificationClone[type] = event.target.checked;

    this.setState({
      deliveryNotifcations: notificationClone
    });
  }

  handleChangeRadioAddressType(event, value) {
    this.setState({
      addressType: value,
    });
  }

  handleClose() {
    this.setState({
      orderSummaryDialogOpen: false,
      secondTime: false,
    })
  }

  changeDormName(event, value) {
    // console.log(event.target.value);

    if (event.target.value == 'Algonquin College') {
      var changedResidence = 'Student Residence';
    }

    if (event.target.value == 'Carleton University') {
      var changedResidence = 'Dundas House';
    }

    if (event.target.value == 'University of Ottawa') {
      var changedResidence = '90 U Residence';
    }

    this.setState({
      dormName: event.target.value,
      dormResidence: changedResidence,
    });
  }

  changeDormResidence(event, value) {
    // console.log(event.target.value);

    this.setState({
      dormResidence: event.target.value,
    });
  }

  changeRadioDeliveryType(index, event, value) {
    const clonedDeliveryType = this.state.deliveryType.slice();

    clonedDeliveryType[index] = value;

    this.setState({
      deliveryType: clonedDeliveryType,
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

  renderOptionsForTheDay(step) {
    const previousIndex = step == 0 ? null : step - 1;

    const dayBeforeYestMealSum = step >= 2 ?
      parseInt(this.state.completeSchedule[previousIndex - 1].breakfast, 10) +
      parseInt(this.state.completeSchedule[previousIndex - 1].lunch, 10) +
      parseInt(this.state.completeSchedule[previousIndex - 1].dinner, 10) : null;

    const previousDaysMealSum = step == 0 ? null :
      parseInt(this.state.completeSchedule[previousIndex].breakfast, 10) +
      parseInt(this.state.completeSchedule[previousIndex].lunch, 10) +
      parseInt(this.state.completeSchedule[previousIndex].dinner, 10);

    const daysMealSum =
      parseInt(this.state.completeSchedule[step].breakfast, 10) +
      parseInt(this.state.completeSchedule[step].lunch, 10) +
      parseInt(this.state.completeSchedule[step].dinner, 10);

    const nextDaysSum =
      parseInt(this.state.completeSchedule[step + 1].breakfast, 10) +
      parseInt(this.state.completeSchedule[step + 1].lunch, 10) +
      parseInt(this.state.completeSchedule[step + 1].dinner, 10);

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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Day of 2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Sunday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Day of 2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Sunday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Sunday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeMonday"
                control={<Radio />}
                label={`Monday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Sunday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfMonday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeMonday"
                control={<Radio />}
                label={`Monday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum === 0 && this.state.deliveryType[1] == 'nightBefore') { // check this once
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        }
      }// daysMealSum > 1
    }// wednesday

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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'dayOfMonday' && this.state.deliveryType[2] == 'dayOfPaired') {
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
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[1] == 'dayOfPaired' && this.state.deliveryType[2] == 'dayOfPaired') {
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
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[1] == 'nightBeforePaired' && this.state.deliveryType[2] == 'nightBeforePaired') {
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
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'nightBeforePaired' && this.state.deliveryType[1] != 'nightBeforePaired') {
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0 //mondayNight is here
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
                label={`Monday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeTuesday"
                control={<Radio />}
                label={`Tuesday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'nightBeforePaired' && this.state.deliveryType[1] == 'nightBeforePaired') {
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
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'dayOfMonday' && this.state.deliveryType[2] == 'dayOfPaired') {
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
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[1] == 'dayOfPaired' && this.state.deliveryType[2] == 'dayOfPaired') {
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
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[1] == 'nightBeforePaired' && this.state.deliveryType[2] == 'nightBeforePaired') {
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
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum > 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[1] == 'sundayNight' && this.state.deliveryType[2] == 'nightBeforePaired') {
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
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum == 0) { // previousMealsSum == 0 && dayBeforeMealSum == 0 //mondayNight is here
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
                label={`Monday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfTuesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeTuesday"
                control={<Radio />}
                label={`Tuesday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - $2.50`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing  ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'nightBefore' && this.state.deliveryType[3] === 'nightBeforePaired') {
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
                label={`3-day pairing  ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'dayOf' && this.state.deliveryType[3] === 'dayOfPaired') {
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
                label={`3-day pairing day-of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Tuesday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeWednesday"
                control={<Radio />}
                label={`Wednesday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOfThursday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'dayOf') {
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
                label={`3-day pairing day-of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'nightBefore') {
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - $2.50`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .subtract(1, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('D')} - Free`}
            />

            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                .add(step, 'd')
                .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing  ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`2-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'nightBefore' && this.state.deliveryType[3] === 'nightBeforePaired') {
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
                label={`3-day pairing  ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (this.state.deliveryType[2] === 'dayOf' && this.state.deliveryType[3] === 'dayOfPaired') {
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
                label={`3-day pairing day-of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                label={`Tuesday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfWednesday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('dddd')} - $2.50`}
              />

              <FormControlLabel
                value="nightBeforeWednesday"
                control={<Radio />}
                label={`Wednesday evening ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('MMM')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOfThursday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />


              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'dayOf') {
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
                label={`3-day pairing day-of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(2, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(2, 'd')
                    .format('D')} - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .format('DD')} - $2.50`}
              />
            </RadioGroup>
          );
        } else if (previousDaysMealSum == 0 && dayBeforeYestMealSum > 0 && this.state.deliveryType[2] == 'nightBefore') {
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
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(3, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(3, 'd')
                    .format('D')} evening - Free`}
              />
              <FormControlLabel
                value="nightBefore"
                control={<Radio />}
                label={`Night before ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .subtract(1, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd')
                    .subtract(1, 'd')
                    .format('D')} - Free`}
              />

              <FormControlLabel
                value={'dayOf'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd')
                  .format('dddd')} ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              value={'nightBeforeThursday'}
              control={<Radio />}
              label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
              
              ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('DD')} evening - Free`}
            />


            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
              
              ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                value={'nightBeforeThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
              
                ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(2, 'd')
                    .format('DD')} evening - Free`}
              />

              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                value={'nightBeforeThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(2, 'd')
                    .format('DD')} evening - $2.50`}
              />

              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              {/*  changed this from nightBefore to dayOfFriday */}
              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />

            </RadioGroup>
          );
        } else if (this.state.deliveryType[4] == 'dayOfPaired' && this.state.deliveryType[3] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >


              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} day of - $2.50`}
              />

              <FormControlLabel
                value={'nightBeforeThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
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
              value={'nightBeforeThursday'}
              control={<Radio />}
              label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
                  
                ${moment(new Date(this.state.subscriptionStartDateRaw))
                  .add(step, 'd').subtract(2, 'd')
                  .format('DD')} evening - $2.50`}
            />


            <FormControlLabel
              value={'dayOf'}
              control={<Radio />}
              label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                value={'nightBeforeThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(2, 'd')
                    .format('DD')} evening - Free`}
              />

              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`Day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                value={'nightBeforeThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(2, 'd')
                    .format('DD')} evening - $2.50`}
              />

              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`Day of  ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(new Date(this.state.subscriptionStartDateRaw))
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
                value={'dayOfFriday'}
                control={<Radio />}
                label={`3-day pairing day of ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} - $2.50`}
              />

            </RadioGroup>
          );
        } else if (this.state.deliveryType[4] == 'dayOfPaired' && this.state.deliveryType[3] == 'dayOf') {
          radioGroup = (
            <RadioGroup
              aria-label={`delivery_${step}`}
              name={`delivery_${step}`}
              style={{ flexDirection: 'column' }}
              onChange={this.changeRadioDeliveryType.bind(this, step)}
              value={this.state.deliveryType[step]}
            >


              <FormControlLabel
                value={'dayOfFriday'}
                control={<Radio />}
                label={`2-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(1, 'd').format('dddd')} 
                
                ${moment(new Date(this.state.subscriptionStartDateRaw))
                    .add(step, 'd').subtract(1, 'd')
                    .format('DD')} day of - $2.50`}
              />

              <FormControlLabel
                value={'nightBeforeThursday'}
                control={<Radio />}
                label={`3-day pairing ${moment(new Date(this.state.subscriptionStartDateRaw)).add(step, 'd').subtract(2, 'd').format('dddd')} 
                
                  ${moment(new Date(this.state.subscriptionStartDateRaw))
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


  setCoolerbagCheckbox(event, checked) {
    this.setState({
      coolerBag: checked,
    });
  }

  setHotelFrontDeskCheckbox(event, checked) {
    this.setState({
      hotelFrontDesk: checked,
    });
  }


  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    const { customer, history, loading } = this.props;
    const { activeMealScheduleStep, activeDeliveryScheduleStep } = this.state;
    const mealSteps = this.getMealSteps();
    const steps = this.getSteps();

    if(loading){
      return <Loading />
    }
   
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
                style={{ fontWeight: 500, alignItems: 'center', display: 'flex' }}
              >
                {customer.profile ? `${customer.profile.name.first} ${customer.profile.name.last}` : ''}
                {customer.secondary && <Chip style={{ marginLeft: '20px' }} label="Secondary" />}
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

              </div>
            </Grid>
          </Grid>

          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <AppBar position="static" className="appbar--no-background appbar--no-shadow">


                {(this.props.customer && this.props.customer.secondary == undefined) ? (
                  <Tabs indicatorColor="#000" value={this.state.currentTab} onChange={this.handleTabChange}>
                    <Tab label="Basic" />
                    (<Tab label="Plan" />
                    <Tab label="Subscription" />
                  </Tabs>
                ) : (
                    <Tabs indicatorColor="#000" value={this.state.currentTab} onChange={this.handleTabChange}>
                      <Tab label="Basic" />
                    </Tabs>
                  )}
              </AppBar>
            </Grid>

            {this.state.currentTab === 0 && (
              <div>
                <form
                  id="step1"
                  ref={form => (this.form = form)}
                  onSubmit={event => event.preventDefault()}
                >
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
                        disabled
                      />

                    ) : (
                        <TextField
                          margin="normal"
                          id="email"
                          label="Email"
                          name="email"
                          fullWidth
                          defaultValue={customer.emails[0].address}
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

                    <Grid container>
                      <Grid item xs={12}>
                        <Typography type="body2">Birthday</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {/* <Select
                          id="birthMonth"
                          label="Month"
                          name="birthMonth"
                          fullWidth
                          value={this.state.birthMonth}
                          native
                          onChange={this.handleChange}
                        >
                        
                          {this.renderMonths()}
                        </Select> */}

                        <TextField
                            fullWidth
                            id="birthMonth"
                            select
                            value={this.state.birthMonth}
                            label="Month"
                            onChange={this.handleSelectChange.bind(this)}
                            name="birthMonth"
                          >
                            {this.renderMonths()}
                          </TextField>
                        {/* <TextField 
                          id="birthMonth"
                          label="Month"
                          name="birthMonth"
                          fullWidth
                          defaultValue={this.state.birthMonth}
                          maxlength="2"
                          type="number"
                        /> */}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="birthDay"
                            select
                            value={this.state.birthDay}
                            label="Day"
                            onChange={this.handleSelectChange.bind(this)}
                            SelectProps={{ native: false }}
                            name="birthDay"
                          >
                            {this.renderDays()}
                          </TextField>

                        {/* <TextField 
                           id="birthDay"
                           label="Day"
                           name="birthDay"
                           fullWidth
                           defaultValue={this.state.birthDay}
                           maxlength="2"
                           type="number"
                        /> */}
                      </Grid>
                    </Grid>
                    {!customer.secondary && (
                    <Grid container>
                        <Grid item xs={12}>
                          <Button
                            style={{ marginTop: '25px' }}
                            disabled={this.state.submitLoadingReset}
                            raised
                            className={`${buttonClassname}`}
                            color="primary"
                            onClick={this.handleResetPassword}
                          >
                            Reset password
                            {this.state.submitLoadingReset && (
                              <CircularProgress
                                size={24}
                                className={this.props.classes.buttonProgress}
                              />
                            )}
                          </Button>
                        </Grid>
                      </Grid>
                      )}
                  </Paper>

                  <Button
                    style={{ marginTop: '25px' }}
                    disabled={this.state.submitLoading}
                    raised
                    className={`${buttonClassname}`}
                    color="primary"
                    type="submit"
                  >
                    Update
                  {this.state.submitLoading && (
                      <CircularProgress
                        size={24}
                        className={this.props.classes.buttonProgress}
                      />
                    )}
                  </Button>
                  {/* <Button onClick={() => this.props.history.push(`/customers/add/type=abandoned&firstName=${customer.profile.name.first}&lastName=${customer.profile.name.last ? customer.profile.name.last : ' '}&email=${customer.emails[0].address}&postalCode=${customer.postalCode}`)} */}

                  {this.props.subscription == undefined && this.props.customer.secondary == undefined && (
                    <Button onClick={() => this.props.history.push(`/customers/new/${customer._id}`)}
                      raised color="primary" type="submit" style={{ marginLeft: "25px", marginTop: "25px" }}>
                      Continue adding
                    </Button>
                  )}
                </form>
              </div>
            )}

            {(this.state.currentTab === 1 && this.props.customer && this.props.subscription != undefined && this.props.customer.secondary == undefined) && (
              <div>
                <form id="step2" ref={form => (this.secondForm = form)} onSubmit={event => event.preventDefault()}>
                  <Paper elevation={2} className="paper-for-fields">
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

                        return (
                          <Step key={index} {...props}>
                            <StepLabel>{label}</StepLabel>
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

                    <Grid container style={{ marginTop: '25px' }}>
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

                    {this.props.customer.secondary == undefined ? this.state.secondaryProfilesData.map((e, profileIndex) => (
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
                                  name={`first_name${profileIndex + 1}`}
                                  fullWidth
                                  value={this.state.secondaryProfilesData[profileIndex].first_name}
                                  data-rule-required="true"
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
                                  name={`last_name${profileIndex + 1}`}
                                  data-rule-required="true"
                                  value={this.state.secondaryProfilesData[profileIndex].last_name}
                                  fullWidth
                                  onChange={(event) => {
                                    this.state.secondaryProfilesData[
                                      profileIndex
                                    ].last_name = event.target.value;
                                    this.forceUpdate();
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
                              <DialogActions>
                                <Button onClick={this.deleteDialogHandleRequestClose.bind(this, profileIndex)} color="default">Close</Button>
                              </DialogActions>
                            </Dialog>

                            <Grid container>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  type="body1"
                                  className="text-uppercase font-medium"
                                  style={{ marginTop: '25px' }}
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
                                  {this.state.secondaryProfilesData[profileIndex].subIngredients && this.state.secondaryProfilesData[profileIndex].subIngredients.length ? (
                                    this.state.secondaryProfilesData[profileIndex].subIngredients.map((subIngredient, i) => (
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

                              <Grid item xs={12} sm={6}>
                                <Typography
                                  type="body1"
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

                            <Grid container style={{ marginTop: '25px' }}>
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
                    ))
                      : ''}

                    {this.props.customer.secondary == undefined ? (
                      <Button color="danger" onClick={this.increaseProfileCount.bind(this)} style={{ marginTop: '50px', marginBottom: '50px' }}>
                        Add a profile
                    </Button>) : ''}

                    <Grid container>
                      <Grid item xs={12}>
                        <Typography type="body1" className="text-uppercase font-medium">Address Type</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
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
                              value={this.state.unit}
                              onChange={(event) => { this.setState({ unit: event.target.value }); }}
                              inputProps={{}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              margin="normal"
                              id="buzzer"
                              label="Buzzer"
                              name="buzzer"
                              value={this.state.buzzer}
                              fullWidth
                              onChange={(event) => { this.setState({ buzzer: event.target.value }); }}
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
                              value={this.state.businessName}

                              fullWidth
                              onChange={(event) => { this.setState({ businessName: event.target.value }); }}
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
                              value={this.state.unit}

                              fullWidth
                              onChange={(event) => { this.setState({ unit: event.target.value }); }}
                              inputProps={{}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              margin="normal"
                              id="businessBuzzer"
                              label="Buzzer"
                              name="businessBuzzer"
                              value={this.state.buzzer}
                              fullWidth
                              onChange={(event) => { this.setState({ buzzer: event.target.value }); }}
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
                              value={this.state.roomNumber}
                              fullWidth
                              onChange={(event) => { this.setState({ roomNumber: event.target.value }); }}


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
                              value={this.state.roomNumber}
                              onChange={(event) => { this.setState({ buzzer: event.target.value }); }}

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
                            value={this.state.hotelName}

                            fullWidth
                            onChange={(event) => { this.setState({ hotelNumber: event.target.value }); }}

                            inputProps={{}}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            margin="normal"
                            id="roomNumber"
                            label="Room number"
                            name="roomNumber"
                            value={this.state.roomNumber}

                            fullWidth
                            onChange={(event) => { this.setState({ roomNumber: event.target.value }); }}

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
                              value={this.state.unit}

                              fullWidth
                              onChange={(event) => { this.setState({ unit: event.target.value }); }}
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
                              initialValue={this.state.streetAddress}
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
                              readOnly
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

                        <Grid item xs={12} style={{ marginTop: '25px' }}>
                          <Typography
                            type="body1"
                            className="text-uppercase font-medium"
                          >
                            Delivery Notifications
                          </Typography>
                        </Grid>

                        <Grid container>
                          <Grid item sm={6} xs={12}>
                            <Typography type="body2">Email</Typography>
                            <FormControl component="fieldset">
                              <Switch
                                checked={this.state.deliveryNotifcations.email}
                                onChange={this.handleDeliveryNotification.bind(this, 'email')}
                              />
                            </FormControl>
                          </Grid>
                          <Grid item sm={6} xs={12}>
                            <Typography type="body2">SMS</Typography>
                            <FormControl component="fieldset">
                              <Switch
                                checked={this.state.deliveryNotifcations.sms}
                                onChange={this.handleDeliveryNotification.bind(this, 'sms')}
                              />
                            </FormControl>
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

                                return (
                                  <Step key={index} {...props}>
                                    <StepLabel>{label}</StepLabel>
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
                  <Button
                    style={{ marginTop: '25px' }}
                    disabled={this.state.submitLoading}
                    raised
                    className={`${buttonClassname}`}
                    color="primary"
                    type="submit"
                    onClick={() => this.saveSecondStep()}
                  >
                    Update
                  {this.state.submitLoading && (
                      <CircularProgress
                        size={24}
                        className={this.props.classes.buttonProgress}
                      />
                    )}
                  </Button>
                </form>

                {/* Add dialog here */}

                <Dialog
                  maxWidth="md"
                  fullWidth
                  open={this.state.orderSummaryDialogOpen}
                  onClose={this.handleClose}
                >
                  <AppBar className={this.props.classes.appBar}>
                    <Toolbar>
                      <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                        <CloseIcon />
                      </IconButton>
                      <Typography type="title" color="inherit" className={this.props.classes.flex}>
                        Subscription update
                    </Typography>
                      <Button color="inherit" onClick={() => this.saveSecondStep()}>Save</Button>
                    </Toolbar>
                  </AppBar>
                  <OrderSummary
                    primaryProfileBilling={this.state.primaryProfileBilling}
                    secondaryProfilesBilling={this.state.secondaryProfilesBilling}
                    postalCodes={this.props.postalCodes}
                    customerInfo={this.props.customer}
                    discounts={this.props.discounts}
                    discountSelected={this.state.discountCode}
                    subscription={this.props.subscription}
                  />
                </Dialog>
              </div>
            )}

            {(this.state.currentTab === 2 && this.props.customer && this.props.subscription != undefined && this.props.customer.secondary == undefined) ? (
              <Step4CheckoutCurrent
                secondaryAccounts={this.props.secondaryAccounts}
                activeStep={this.state.currentTab}
                customer={this.props.customer}
                subscription={this.props.subscription}
                popTheSnackbar={this.props.popTheSnackbar.bind(this)}
                lifestyles={this.props.lifestyles}
                restrictions={this.props.restrictions}
                ingredients={this.props.potentialSubIngredients}
                postalCodes={this.props.postalCodes}
                history={this.props.history}
                discounts={this.props.discounts}
                // step2Data={{
                //   id: this.props.customer._id,
                //   address: this.props.customer.address,
                //   subscriptionId: this.props.subscription ? this.props.subscription._id : '',
                //   subIngredients: this.state.subIngredients,
                //   specificRestrictions: this.state.specificRestrictions,
                //   lifestyle: this.props.lifestyles.find(e => e.title === this.state.lifestyle)._id,
                //   discount: this.state.discount,
                //   discountCode: this.state.discountCode,
                //   restrictions: this.state.restrictions,
                //   scheduleReal: this.state.scheduleReal,
                //   platingNotes: this.state.platingNotes,
                //   secondary: this.props.customer.secondary != undefined,
                //   secondaryProfiles: this.state.secondaryProfilesData,
                //   secondaryProfilesRemoved: this.state.secondaryProfilesRemoved,
                //   completeSchedule: this.state.completeSchedule,
                //   delivery: this.state.deliveryType,
                //   coolerBag: this.state.coolerBag,
                //   notifications: {
                //     delivery: {
                //       sms: this.state.deliveryNotifcations.sms,
                //       email: this.state.deliveryNotifcations.email
                //     }
                //   }
                // }}

              />
            ) : this.state.currentTab === 2 ? (
              <Typography type="subheading">
                This account doesn't have a subscription yet.
            </Typography>
            ) : ''}

          </Grid>
        </div>
      );

  }
}

CurrentCustomerEditor.defaultProps = {
};

CurrentCustomerEditor.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(CurrentCustomerEditor);
