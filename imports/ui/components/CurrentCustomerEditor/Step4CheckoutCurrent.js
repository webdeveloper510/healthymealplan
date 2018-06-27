import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import Input from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Payment from 'payment';
import autoBind from 'react-autobind';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

import ClearIcon from 'material-ui-icons/Clear';
import Chip from 'material-ui/Chip';

import Checkbox from 'material-ui/Checkbox';

import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from 'material-ui/Form';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

import Autosuggest from 'react-autosuggest';
import Search from 'material-ui-icons/Search';
import Avatar from 'material-ui/Avatar';

import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import green from 'material-ui/colors/green';

import moment from 'moment';
import _ from 'lodash';
import $ from 'jquery';
import validate from '../../../modules/validate';
import OrderSummary from '../../pages/OrderSummary/OrderSummary';

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

function verifyDiscountCode(discountId) {


  // IF DISCOUNT CODE IS ACTIVE

  // IF USAGE LIMIT HAS EXCEEDED

  // IF APPLIES TO A PARTICULAR CUSTOMER
  // IS THIS THAT CUSTOMER

  // IF APPLIES TO A PARTICULAR LIFESTYLE
  // CHECK IF THE LIFESTYLE IS SAME AS SELECTED ON THE DISCOUNT


}

function calculateDiscountAmount(discountId, meals) {

}

class Step4CheckoutCurrent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,

      summaryLoaded: false,

      paymentMethod: this.props.customer && this.props.subscription ? this.props.subscription.paymentMethod : '',
      taxExempt: false,


      paymentProfileDetails: null,
      subscriptionDetails: null,

      dialogCancelSubscription: false,
      dialogEditPaymentMethod: false,
      dialogActivateSubscription: false,

      dialogAddCard: false,

      valueTypes: '',
      suggestionsTypes: [],

      discountSelected: '',
      discountApplied: this.props.subscription && this.props.subscription.hasOwnProperty('discountApplied') ? this.props.subscription.discountApplied : '',
      secondTime: '',

      discountDeleteDialog: false,
      orderSummaryDialogOpen: false,

      primaryProfileBillingNew: null,
      secondaryProfilesBillingNew: null,

    };

    autoBind(this);

    // this.editPaymentMethod = this.editPaymentMethod.bind(this);

    // this.openCancelSubscriptionDialog = this.openCancelSubscriptionDialog.bind(this);
    // this.closeCancelSubscriptionDialog = this.closeCancelSubscriptionDialog.bind(this);

    // this.openActivateSubscriptionDialog = this.openActivateSubscriptionDialog.bind(this);
    // this.closeActivateSubscriptionDialog = this.closeActivateSubscriptionDialog.bind(this);

    // this.openEditPaymentMethodDialog = this.openEditPaymentMethodDialog.bind(this);
    // this.closeEditPaymentMethodDialog = this.closeEditPaymentMethodDialog.bind(this);


    // this.closeDiscountDeleteDialog = this.closeDiscountDeleteDialog.bind(this);
    // this.closeAddCardDialog = this.closeAddCardDialog.bind(this);


    // this.openDiscountDeleteDialog = this.openDiscountDeleteDialog.bind(this);
    // this.closeDiscountDeleteDialog = this.closeDiscountDeleteDialog.bind(this);
    // this.handleApplyDiscount = this.handleApplyDiscount.bind(this);
    // this.handleRemoveDiscount = this.handleRemoveDiscount.bind(this);
    // this.handleRestrictionChipDeleteActual = this.handleRestrictionChipDeleteActual.bind(this);

    // this.attachPaymentFormatHandlers = this.attachPaymentFormatHandlers.bind(this);
    // this.handleSubmitStep = this.handleSubmitStep.bind(this);
    // this.handleClose = this.handleClose.bind(this);

    // this.openOrderSummaryDialog = this.openOrderSummaryDialog.bind(this);
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
        nameOnCard: {
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
        this.handleSubmitStep();
      },
    });

    /*
    * The best way to refactor the below bill calculator is to separate it
    * into a billing module which can be imported here instead.
    */

    // console.log(this.props.subscription);
    const paymentMethod = this.props.subscription.paymentMethod;

    if (paymentMethod === 'card') {

      Meteor.call('getSubscriptionDetails', this.props.subscription.authorizeSubscriptionId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);

          this.setState({
            subscriptionDetails: res.subscription,
          });
        }
      });

      Meteor.call('getCustomerPaymentProfile', this.props.subscription.authorizeCustomerProfileId, this.props.subscription.authorizePaymentProfileId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);

          this.setState({
            paymentProfileDetails: res.paymentProfile,
          });
        }
      });
    }


    // const primaryCustomer = {
    //   lifestyle: '',
    //   breakfastPrice: 0,
    //   lunchPrice: 0,
    //   dinnerPrice: 0,
    //   breakfast: {
    //     totalQty: 0,
    //     regularQty: 0,
    //     athleticQty: 0,
    //     bodybuilderQty: 0,
    //   },
    //   lunch: {
    //     totalQty: 0,
    //     regularQty: 0,
    //     athleticQty: 0,
    //     bodybuilderQty: 0,
    //   },
    //   dinner: {
    //     totalQty: 0,
    //     regularQty: 0,
    //     athleticQty: 0,
    //     bodybuilderQty: 0,
    //   },
    //   // coolerBag: this.props.customerInfo.coolerBag ? 20 : 0,
    //   coolerBag: 0,
    //   deliveryCost: 0,

    //   discount: this.props.customer.discount,
    //   discountActual: 0,

    //   restrictions: this.props.customer.restrictions,
    //   restrictionsActual: [],
    //   restrictionsSurcharges: [],
    //   specificRestrictions: this.props.customer.specificRestrictions,
    //   specificRestrictionsActual: [],
    //   specificRestrictionsSurcharges: [],
    //   preferences: this.props.customer.preferences,
    //   totalAthleticSurcharge: 0,
    //   totalBodybuilderSurcharge: 0,

    //   deliverySurcharges: 0,

    //   discountCodeApplies: false,
    //   discountCodeAmount: 0,
    // };

    // const secondaryCustomers = [];

    // const discountCodePresent = this.props.subscription.discountApplied != '';
    // let discountCodeApplied = null;

    // if (discountCodePresent) {
    //   discountCodeApplied = this.props.discounts.find(e => e._id === this.props.subscription.discountApplied);
    // }

    // primaryCustomer.lifestyle = this.props.lifestyles.find(
    //   elem => elem._id === this.props.customer.lifestyle,
    // );


    // // calculating basePrices for Breakfast, lunch and dinner

    // let metCriteria = 0;
    // const customerScheduleTotals = [];
    // const secondaryCustomerTotals = [];

    // // calculating total quantities and extra quantities and regular quantites
    // this.props.customer.schedule.forEach((e, i) => {
    //   let thisDaysQty = 0;

    //   if (e.breakfast.active) {
    //     primaryCustomer.breakfast.totalQty =
    //       primaryCustomer.breakfast.totalQty +
    //       parseInt(e.breakfast.quantity, 10);

    //     if (e.breakfast.portions == 'regular') {
    //       primaryCustomer.breakfast.regularQty += parseInt(
    //         e.breakfast.quantity,
    //         10,
    //       );
    //     } else if (e.breakfast.portions == 'athletic') {
    //       primaryCustomer.breakfast.athleticQty += parseInt(
    //         e.breakfast.quantity,
    //         10,
    //       );
    //     } else if ((e.breakfast.portions = 'bodybuilder')) {
    //       primaryCustomer.breakfast.bodybuilderQty += parseInt(
    //         e.breakfast.quantity,
    //         10,
    //       );
    //     }

    //     thisDaysQty += parseInt(e.breakfast.quantity, 10);
    //   }

    //   if (e.lunch.active) {
    //     primaryCustomer.lunch.totalQty =
    //       primaryCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

    //     if (e.lunch.portions == 'regular') {
    //       primaryCustomer.lunch.regularQty += parseInt(e.lunch.quantity, 10);
    //     } else if (e.lunch.portions == 'athletic') {
    //       primaryCustomer.lunch.athleticQty += parseInt(e.lunch.quantity, 10);
    //     } else if ((e.lunch.portions = 'bodybuilder')) {
    //       primaryCustomer.lunch.bodybuilderQty += parseInt(
    //         e.lunch.quantity,
    //         10,
    //       );
    //     }

    //     thisDaysQty += parseInt(e.lunch.quantity, 10);
    //   }

    //   if (e.dinner.active) {
    //     primaryCustomer.dinner.totalQty =
    //       primaryCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

    //     if (e.dinner.portions == 'regular') {
    //       primaryCustomer.dinner.regularQty += parseInt(e.dinner.quantity, 10);
    //     } else if (e.dinner.portions == 'athletic') {
    //       primaryCustomer.dinner.athleticQty += parseInt(e.dinner.quantity, 10);
    //     } else if ((e.dinner.portions = 'bodybuilder')) {
    //       primaryCustomer.dinner.bodybuilderQty += parseInt(
    //         e.dinner.quantity,
    //         10,
    //       );
    //     }

    //     thisDaysQty += parseInt(e.dinner.quantity, 10);
    //   }

    //   customerScheduleTotals.push(thisDaysQty);
    // });

    // console.log(customerScheduleTotals);

    // if (
    //   customerScheduleTotals[0] >= 2 &&
    //   customerScheduleTotals[1] >= 2 &&
    //   customerScheduleTotals[2] >= 2 &&
    //   customerScheduleTotals[3] >= 2 &&
    //   customerScheduleTotals[4] >= 2
    // ) {
    //   metCriteria += 1;
    // }

    // console.log('met criteria after primary customer');
    // console.log(metCriteria);

    // if (this.props.customer.associatedProfiles > 0) {
    //   this.props.secondaryAccounts.forEach((el, index) => {
    //     let currentProfileQtys;

    //     currentProfileQtys = el.schedule.map((e, i) => {
    //       let thisDaysQty = 0;

    //       if (e.breakfast.active) {
    //         thisDaysQty += parseInt(e.breakfast.quantity, 10);
    //       }

    //       if (e.lunch.active) {
    //         thisDaysQty += parseInt(e.lunch.quantity, 10);
    //       }

    //       if (e.dinner.active) {
    //         thisDaysQty += parseInt(e.dinner.quantity, 10);
    //       }

    //       return thisDaysQty;
    //     });

    //     secondaryCustomerTotals.push(currentProfileQtys);
    //   });
    // }

    // console.log('Secondary customer totals');
    // console.log(secondaryCustomerTotals);

    // secondaryCustomerTotals.forEach((e, i) => {
    //   if (e[0] >= 2 && e[1] >= 2 && e[2] >= 2 && e[3] >= 2 && e[4] >= 2) {
    //     metCriteria += 1;
    //   }
    // });

    // console.log('met criteria after secondary customers');
    // console.log(metCriteria);

    // if (metCriteria > 0) {
    //   metCriteria -= 1;
    // }

    // primaryCustomer.breakfastPrice =
    //   primaryCustomer.lifestyle.prices.breakfast[metCriteria];

    // primaryCustomer.lunchPrice =
    //   primaryCustomer.lifestyle.prices.lunch[metCriteria];

    // primaryCustomer.dinnerPrice =
    //   primaryCustomer.lifestyle.prices.dinner[metCriteria];

    // // total base price based on per meal type base price, (before restrictions and extras and discounts)
    // primaryCustomer.baseMealPriceTotal =
    //   primaryCustomer.breakfast.totalQty * primaryCustomer.breakfastPrice +
    //   primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
    //   primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

    // // discounted basePrice -- this is the actual base price to add up in the total

    // if (primaryCustomer.discount == 'senior') {
    //   let discountAmount = 0;

    //   if (primaryCustomer.lifestyle.discountOrExtraTypeSenior == 'Percentage') {
    //     discountAmount =
    //       primaryCustomer.lifestyle.discountSenior /
    //       100 *
    //       primaryCustomer.baseMealPriceTotal;
    //   }

    //   if (
    //     primaryCustomer.lifestyle.discountOrExtraTypeSenior == 'Fixed amount'
    //   ) {
    //     discountAmount = primaryCustomer.lifestyle.discountSenior;
    //   }

    //   primaryCustomer.discountActual = discountAmount;
    // }

    // if (primaryCustomer.discount == 'student') {
    //   let discountAmount = 0;

    //   if (
    //     primaryCustomer.lifestyle.discountOrExtraTypeStudent == 'Percentage'
    //   ) {
    //     discountAmount =
    //       primaryCustomer.lifestyle.discountStudent /
    //       100 *
    //       primaryCustomer.baseMealPriceTotal;
    //   }

    //   if (
    //     primaryCustomer.lifestyle.discountOrExtraTypeStudent == 'Fixed amount'
    //   ) {
    //     discountAmount = primaryCustomer.lifestyle.discountStudent;
    //   }

    //   primaryCustomer.discountActual = discountAmount;
    // }


    // // calculating restrictions and specificRestrictions surcharges
    // if (primaryCustomer.restrictions.length > 0) {
    //   primaryCustomer.restrictions.forEach((e, i) => {
    //     primaryCustomer.restrictionsActual.push(
    //       this.props.restrictions.find(elem => elem._id === e),
    //     );
    //   });

    //   primaryCustomer.restrictionsActual.forEach((e, i) => {
    //     console.log(e);
    //     if (e.hasOwnProperty('extra')) {
    //       let totalRestrictionsSurcharge = 0;
    //       console.log(e);

    //       const totalBaseMealsCharge =
    //         primaryCustomer.breakfast.totalQty *
    //         primaryCustomer.breakfastPrice +
    //         primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
    //         primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

    //       if (e.discountOrExtraType == 'Percentage') {
    //         totalRestrictionsSurcharge = e.extra / 100 * totalBaseMealsCharge;
    //       }

    //       if (e.discountOrExtraType == 'Fixed amount') {
    //         totalRestrictionsSurcharge =
    //           (primaryCustomer.breakfast.totalQty +
    //             primaryCustomer.lunch.totalQty +
    //             primaryCustomer.dinner.totalQty) *
    //           e.extra;
    //       }

    //       primaryCustomer.restrictionsSurcharges.push(
    //         totalRestrictionsSurcharge,
    //       );
    //     } else {
    //       primaryCustomer.restrictionsSurcharges.push(0);
    //     }
    //   });
    // }

    // if (primaryCustomer.specificRestrictions.length > 0) {
    //   primaryCustomer.specificRestrictions.forEach((e, i) => {
    //     console.log(e);
    //     primaryCustomer.specificRestrictionsActual.push(
    //       this.props.ingredients.find(elem => elem._id === e._id),
    //     );
    //   });

    //   // primaryCustomer.specificRestrictionsActual.forEach((e, i) => {
    //   //   if (e.hasOwnProperty("extra")) {
    //   //     let totalSurcharges = 0;
    //   //     console.log(e);

    //   //     const totalBaseMealsCharge =
    //   //       primaryCustomer.breakfast.totalQty *
    //   //         primaryCustomer.breakfastPrice +
    //   //       primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
    //   //       primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

    //   //     if (e.discountOrExtraType == "Percentage") {
    //   //       totalSurcharges = e.extra / 100 * totalBaseMealsCharge;
    //   //     }

    //   //     if (e.discountOrExtraType == "Fixed amount") {
    //   //       totalSurcharges =
    //   //         (primaryCustomer.breakfast.totalQty +
    //   //           primaryCustomer.lunch.totalQty +
    //   //           primaryCustomer.dinner.totalQty) *
    //   //         e.extra;
    //   //     }

    //   //     primaryCustomer.specificRestrictionsSurcharges.push(totalSurcharges);
    //   //   } else {
    //   //     primaryCustomer.specificRestrictionsSurcharges.push(0);
    //   //   }
    //   // });
    // }

    // // calculating athletic surcharge for all meals
    // if (
    //   primaryCustomer.breakfast.athleticQty > 0 ||
    //   primaryCustomer.lunch.athleticQty > 0 ||
    //   primaryCustomer.dinner.athleticQty > 0
    // ) {
    //   let totalAthleticSurcharge = 0;

    //   if (primaryCustomer.breakfast.athleticQty > 0) {
    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
    //     ) {
    //       const extraAthleticPerBreakfast =
    //         primaryCustomer.lifestyle.extraAthletic /
    //         100 *
    //         primaryCustomer.breakfastPrice;

    //       totalAthleticSurcharge +=
    //         primaryCustomer.breakfast.athleticQty * extraAthleticPerBreakfast;
    //     }

    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //       'Fixed amount'
    //     ) {
    //       totalAthleticSurcharge +=
    //         primaryCustomer.breakfast.athleticQty *
    //         primaryCustomer.lifestyle.extraAthletic;
    //     }
    //   }

    //   if (primaryCustomer.lunch.athleticQty > 0) {
    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
    //     ) {
    //       const extraAthleticPerLunch =
    //         primaryCustomer.lifestyle.extraAthletic /
    //         100 *
    //         primaryCustomer.lunchPrice;

    //       totalAthleticSurcharge +=
    //         primaryCustomer.lunch.athleticQty * extraAthleticPerLunch;
    //     }

    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //       'Fixed amount'
    //     ) {
    //       totalAthleticSurcharge +=
    //         primaryCustomer.lunch.athleticQty *
    //         primaryCustomer.lifestyle.extraAthletic;
    //     }
    //   }

    //   if (primaryCustomer.dinner.athleticQty > 0) {
    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
    //     ) {
    //       const extraAthleticPerDinner =
    //         primaryCustomer.lifestyle.extraAthletic /
    //         100 *
    //         primaryCustomer.dinnerPrice;

    //       totalAthleticSurcharge +=
    //         primaryCustomer.dinner.athleticQty * extraAthleticPerDinner;
    //     }

    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //       'Fixed amount'
    //     ) {
    //       totalAthleticSurcharge +=
    //         primaryCustomer.breakfast.athleticQty *
    //         primaryCustomer.lifestyle.extraAthletic;
    //     }
    //   }

    //   primaryCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
    // }

    // // calculating bodybuilder surcharge for all meals
    // if (
    //   primaryCustomer.breakfast.bodybuilderQty > 0 ||
    //   primaryCustomer.lunch.bodybuilderQty > 0 ||
    //   primaryCustomer.dinner.bodybuilderQty > 0
    // ) {
    //   let totalBodybuilderSurcharge = 0;

    //   if (primaryCustomer.breakfast.bodybuilderQty > 0) {
    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
    //       'Percentage'
    //     ) {
    //       const extraBodybuilderPerBreakfast =
    //         primaryCustomer.lifestyle.extraBodybuilder /
    //         100 *
    //         primaryCustomer.breakfastPrice;

    //       totalBodybuilderSurcharge +=
    //         primaryCustomer.breakfast.bodybuilderQty *
    //         extraBodybuilderPerBreakfast;
    //     }

    //     if (
    //       primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
    //       'Fixed amount'
    //     ) {
    //       totalBodybuilderSurcharge +=
    //         primaryCustomer.breakfast.athleticQty *
    //         primaryCustomer.lifestyle.extraBodybuilder;
    //     }
    //   }

    //   if (primaryCustomer.lunch.bodybuilderQty > 0) {
    //     const extraBodybuilderPerLunch =
    //       primaryCustomer.lifestyle.extraBodybuilder /
    //       100 *
    //       primaryCustomer.lunchPrice;

    //     totalBodybuilderSurcharge +=
    //       primaryCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
    //   }

    //   if (primaryCustomer.dinner.bodybuilderQty > 0) {
    //     const extraBodybuilderPerDinner =
    //       primaryCustomer.lifestyle.extraBodybuilder /
    //       100 *
    //       primaryCustomer.dinnerPrice;

    //     totalBodybuilderSurcharge +=
    //       primaryCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
    //   }

    //   primaryCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
    // }

    // // DISCOUNT CODE

    // // other verification is done before applying

    // if (discountCodeApplied != null) {

    //   console.log(discountCodeApplied);

    //   let discountCodeAmount = 0;

    //   if (discountCodeApplied.appliesToType == 'whole' ||
    //     (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == 'All') ||
    //     (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == primaryCustomer.lifestyle._id)) {
    //     console.log('Applies to whole order');


    //     let subTotal = primaryCustomer.baseMealPriceTotal;

    //     if (discountCodeApplied.appliesToRestrictionsAndExtras) {
    //       subTotal += primaryCustomer.totalAthleticSurcharge +
    //         primaryCustomer.totalBodybuilderSurcharge +
    //         _.sum(primaryCustomer.restrictionsSurcharges) +
    //         _.sum(primaryCustomer.specificRestrictionsSurcharges);
    //     }


    //     if (discountCodeApplied.discountType == 'Percentage') {

    //       discountCodeAmount = (discountCodeApplied.discountValue / 100) * subTotal;

    //     } else if (discountCodeApplied.discountType == 'Fixed amount') {
    //       discountCodeAmount = discountCodeApplied.discountValue;
    //     }


    //     if (primaryCustomer.discountActual > 0 && discountCodeApplied.appliesToExistingDiscounts == false) {
    //       discountCodeAmount = 0;
    //     }

    //   }

    //   primaryCustomer.discountCodeAmount = discountCodeAmount;

    // }

    // // calculate amount


    // // all of the above for all the secondary profiles
    // if (this.props.customer.associatedProfiles > 0) {
    //   this.props.secondaryAccounts.forEach((el, index) => {
    //     const currentCustomer = {
    //       lifestyle: '',

    //       breakfastPrice: 0,
    //       lunchPrice: 0,
    //       dinnerPrice: 0,
    //       breakfast: {
    //         totalQty: 0,
    //         regularQty: 0,
    //         athleticQty: 0,
    //         bodybuilderQty: 0,
    //       },
    //       lunch: {
    //         totalQty: 0,
    //         regularQty: 0,
    //         athleticQty: 0,
    //         bodybuilderQty: 0,
    //       },
    //       dinner: {
    //         totalQty: 0,
    //         regularQty: 0,
    //         athleticQty: 0,
    //         bodybuilderQty: 0,
    //       },
    //       deliveryCost: 0,
    //       discount: this.props.secondaryAccounts[index].discount,
    //       discountActual: 0,
    //       restrictions: this.props.secondaryAccounts[index]
    //         .restrictions,
    //       restrictionsActual: [],
    //       restrictionsSurcharges: [],
    //       specificRestrictions: this.props.secondaryAccounts[index]
    //         .specificRestrictions,
    //       specificRestrictionsActual: [],
    //       specificRestrictionsSurcharges: [],
    //       preferences: this.props.secondaryAccounts[index]
    //         .preferences,
    //       totalAthleticSurcharge: 0,
    //       totalBodybuilderSurcharge: 0,


    //       discountCodeApplies: false,
    //       discountCodeAmount: 0,
    //     };

    //     // the lifestyle for the current secondarycustomer
    //     currentCustomer.lifestyle = this.props.lifestyles.find(
    //       elem => elem._id === el.lifestyle,
    //     );

    //     // calculating basePrices for Breakfast, lunch and dinner

    //     currentCustomer.breakfastPrice =
    //       currentCustomer.lifestyle.prices.breakfast[metCriteria];

    //     currentCustomer.lunchPrice =
    //       currentCustomer.lifestyle.prices.lunch[metCriteria];

    //     currentCustomer.dinnerPrice =
    //       currentCustomer.lifestyle.prices.dinner[metCriteria];

    //     el.schedule.forEach((e, i) => {
    //       if (e.breakfast.active) {
    //         currentCustomer.breakfast.totalQty =
    //           currentCustomer.breakfast.totalQty +
    //           parseInt(e.breakfast.quantity, 10);

    //         if (e.breakfast.portions == 'regular') {
    //           currentCustomer.breakfast.regularQty += parseInt(
    //             e.breakfast.quantity,
    //             10,
    //           );
    //         } else if (e.breakfast.portions == 'athletic') {
    //           currentCustomer.breakfast.athleticQty += parseInt(
    //             e.breakfast.quantity,
    //             10,
    //           );
    //         } else if ((e.breakfast.portions = 'bodybuilder')) {
    //           currentCustomer.breakfast.bodybuilderQty += parseInt(
    //             e.breakfast.quantity,
    //             10,
    //           );
    //         }
    //       }

    //       if (e.lunch.active) {
    //         currentCustomer.lunch.totalQty =
    //           currentCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

    //         if (e.lunch.portions == 'regular') {
    //           currentCustomer.lunch.regularQty += parseInt(
    //             e.lunch.quantity,
    //             10,
    //           );
    //         } else if (e.lunch.portions == 'athletic') {
    //           currentCustomer.lunch.athleticQty += parseInt(
    //             e.lunch.quantity,
    //             10,
    //           );
    //         } else if ((e.lunch.portions = 'bodybuilder')) {
    //           currentCustomer.lunch.bodybuilderQty += parseInt(
    //             e.lunch.quantity,
    //             10,
    //           );
    //         }
    //       }

    //       if (e.dinner.active) {
    //         currentCustomer.dinner.totalQty =
    //           currentCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

    //         if (e.dinner.portions == 'regular') {
    //           currentCustomer.dinner.regularQty += parseInt(
    //             e.dinner.quantity,
    //             10,
    //           );
    //         } else if (e.dinner.portions == 'athletic') {
    //           currentCustomer.dinner.athleticQty += parseInt(
    //             e.dinner.quantity,
    //             10,
    //           );
    //         } else if ((e.dinner.portions = 'bodybuilder')) {
    //           currentCustomer.dinner.bodybuilderQty += parseInt(
    //             e.dinner.quantity,
    //             10,
    //           );
    //         }
    //       }
    //     });

    //     // total base price based on per meal type base price, (before restrictions and extras and discounts)
    //     currentCustomer.baseMealPriceTotal =
    //       currentCustomer.breakfast.totalQty * currentCustomer.breakfastPrice +
    //       currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
    //       currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

    //     // discounted basePrice -- this is the actual base price to add up in the total
    //     if (currentCustomer.discount == 'senior') {
    //       let discountAmount = 0;

    //       if (
    //         currentCustomer.lifestyle.discountOrExtraTypeSenior == 'Percentage'
    //       ) {
    //         discountAmount =
    //           currentCustomer.lifestyle.discountSenior /
    //           100 *
    //           currentCustomer.baseMealPriceTotal;
    //       }

    //       if (
    //         currentCustomer.lifestyle.discountOrExtraTypeSenior ==
    //         'Fixed amount'
    //       ) {
    //         discountAmount = currentCustomer.lifestyle.discountSenior;
    //       }

    //       currentCustomer.discountActual = discountAmount;
    //     }

    //     if (currentCustomer.discount == 'student') {
    //       let discountAmount = 0;

    //       if (
    //         currentCustomer.lifestyle.discountOrExtraTypeStudent == 'Percentage'
    //       ) {
    //         discountAmount =
    //           currentCustomer.lifestyle.discountStudent /
    //           100 *
    //           currentCustomer.baseMealPriceTotal;
    //       }

    //       if (
    //         currentCustomer.lifestyle.discountOrExtraTypeStudent ==
    //         'Fixed amount'
    //       ) {
    //         discountAmount = currentCustomer.lifestyle.discountStudent;
    //       }

    //       currentCustomer.discountActual = discountAmount;
    //     }

    //     // calculating restrictions and specificRestrictions surcharges
    //     if (currentCustomer.restrictions.length > 0) {
    //       currentCustomer.restrictions.forEach((e, i) => {
    //         currentCustomer.restrictionsActual.push(
    //           this.props.restrictions.find(elem => elem._id === e),
    //         );
    //       });

    //       currentCustomer.restrictionsActual.forEach((e, i) => {
    //         if (e.hasOwnProperty('extra')) {
    //           let totalRestrictionsSurcharge = 0;
    //           console.log(e);

    //           const totalBaseMealsCharge =
    //             currentCustomer.breakfast.totalQty *
    //             currentCustomer.breakfastPrice +
    //             currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
    //             currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

    //           if (e.discountOrExtraType == 'Percentage') {
    //             totalRestrictionsSurcharge =
    //               e.extra / 100 * totalBaseMealsCharge;
    //           }

    //           if (e.discountOrExtraType == 'Fixed amount') {
    //             totalRestrictionsSurcharge =
    //               (currentCustomer.breakfast.totalQty +
    //                 currentCustomer.lunch.totalQty +
    //                 currentCustomer.dinner.totalQty) *
    //               e.extra;
    //           }

    //           console.log(totalRestrictionsSurcharge);

    //           currentCustomer.restrictionsSurcharges.push(
    //             totalRestrictionsSurcharge,
    //           );
    //         } else {
    //           currentCustomer.restrictionsSurcharges.push(0);
    //         }
    //       });
    //     }

    //     console.log(currentCustomer.restrictionsSurcharges);

    //     if (currentCustomer.specificRestrictions.length > 0) {
    //       currentCustomer.specificRestrictions.forEach((e, i) => {
    //         currentCustomer.specificRestrictionsActual.push(
    //           this.props.ingredients.find(elem => elem._id === e._id),
    //         );
    //       });

    //       // currentCustomer.specificRestrictionsActual.forEach((e, i) => {
    //       //   if (e.hasOwnProperty("extra")) {
    //       //     let totalRestrictionsSurcharge = 0;
    //       //     console.log(e);

    //       //     const totalBaseMealsCharge =
    //       //       currentCustomer.breakfast.totalQty *
    //       //         currentCustomer.breakfastPrice +
    //       //       currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
    //       //       currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

    //       //     if (e.discountOrExtraType == "Percentage") {
    //       //       totalRestrictionsSurcharge =
    //       //         e.extra / 100 * totalBaseMealsCharge;
    //       //     }

    //       //     if (e.discountOrExtraType == "Fixed amount") {
    //       //       totalRestrictionsSurcharge =
    //       //         (currentCustomer.breakfast.totalQty +
    //       //           currentCustomer.lunch.totalQty +
    //       //           currentCustomer.dinner.totalQty) *
    //       //         e.extra;
    //       //     }

    //       //     console.log(totalRestrictionsSurcharge);

    //       //     currentCustomer.specificRestrictionsSurcharges.push(
    //       //       totalRestrictionsSurcharge
    //       //     );
    //       //   } else {
    //       //     currentCustomer.specificrestrictionsSurcharges.push(0);
    //       //   }
    //       // });
    //     }

    //     // calculating athletic surcharge for all meals
    //     if (
    //       currentCustomer.breakfast.athleticQty > 0 ||
    //       currentCustomer.lunch.athleticQty > 0 ||
    //       currentCustomer.dinner.athleticQty > 0
    //     ) {
    //       let totalAthleticSurcharge = 0;

    //       if (currentCustomer.breakfast.athleticQty > 0) {
    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //           'Percentage'
    //         ) {
    //           const extraAthleticPerBreakfast =
    //             currentCustomer.lifestyle.extraAthletic /
    //             100 *
    //             currentCustomer.breakfastPrice;

    //           totalAthleticSurcharge +=
    //             currentCustomer.breakfast.athleticQty *
    //             extraAthleticPerBreakfast;
    //         }

    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //           'Fixed amount'
    //         ) {
    //           totalAthleticSurcharge +=
    //             currentCustomer.breakfast.athleticQty *
    //             currentCustomer.lifestyle.extraAthletic;
    //         }
    //       }

    //       if (currentCustomer.lunch.athleticQty > 0) {
    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //           'Percentage'
    //         ) {
    //           const extraAthleticPerLunch =
    //             currentCustomer.lifestyle.extraAthletic /
    //             100 *
    //             currentCustomer.lunchPrice;

    //           totalAthleticSurcharge +=
    //             currentCustomer.lunch.athleticQty * extraAthleticPerLunch;
    //         }

    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //           'Fixed amount'
    //         ) {
    //           totalAthleticSurcharge +=
    //             currentCustomer.lunch.athleticQty *
    //             currentCustomer.lifestyle.extraAthletic;
    //         }
    //       }

    //       if (currentCustomer.dinner.athleticQty > 0) {
    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //           'Percentage'
    //         ) {
    //           const extraAthleticPerDinner =
    //             currentCustomer.lifestyle.extraAthletic /
    //             100 *
    //             currentCustomer.dinnerPrice;

    //           totalAthleticSurcharge +=
    //             currentCustomer.dinner.athleticQty * extraAthleticPerDinner;
    //         }

    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
    //           'Fixed amount'
    //         ) {
    //           totalAthleticSurcharge +=
    //             currentCustomer.breakfast.athleticQty *
    //             currentCustomer.lifestyle.extraAthletic;
    //         }
    //       }

    //       currentCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
    //     }

    //     // calculating bodybuilder surcharge for all meals
    //     if (
    //       currentCustomer.breakfast.bodybuilderQty > 0 ||
    //       currentCustomer.lunch.bodybuilderQty > 0 ||
    //       currentCustomer.dinner.bodybuilderQty > 0
    //     ) {
    //       let totalBodybuilderSurcharge = 0;

    //       if (currentCustomer.breakfast.bodybuilderQty > 0) {
    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
    //           'Percentage'
    //         ) {
    //           const extraBodybuilderPerBreakfast =
    //             currentCustomer.lifestyle.extraBodybuilder /
    //             100 *
    //             currentCustomer.breakfastPrice;

    //           totalBodybuilderSurcharge +=
    //             currentCustomer.breakfast.bodybuilderQty *
    //             extraBodybuilderPerBreakfast;
    //         }

    //         if (
    //           currentCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
    //           'Fixed amount'
    //         ) {
    //           totalBodybuilderSurcharge +=
    //             currentCustomer.breakfast.athleticQty *
    //             currentCustomer.lifestyle.extraBodybuilder;
    //         }
    //       }

    //       if (currentCustomer.lunch.bodybuilderQty > 0) {
    //         const extraBodybuilderPerLunch =
    //           currentCustomer.lifestyle.extraBodybuilder /
    //           100 *
    //           currentCustomer.lunchPrice;

    //         totalBodybuilderSurcharge +=
    //           currentCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
    //       }

    //       if (currentCustomer.dinner.bodybuilderQty > 0) {
    //         const extraBodybuilderPerDinner =
    //           currentCustomer.lifestyle.extraBodybuilder /
    //           100 *
    //           currentCustomer.dinnerPrice;

    //         totalBodybuilderSurcharge +=
    //           currentCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
    //       }

    //       currentCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
    //     }

    //     // discount code
    //     if (discountCodeApplied != null) {

    //       // console.log(discountCodeApplied);

    //       let discountCodeAmount = 0;

    //       if (discountCodeApplied.appliesToType == 'whole' ||
    //         (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == 'All') ||
    //         (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == currentCustomer.lifestyle._id)) {

    //         let subTotal = currentCustomer.baseMealPriceTotal;

    //         if (discountCodeApplied.appliesToRestrictionsAndExtras) {
    //           subTotal += currentCustomer.totalAthleticSurcharge +
    //             currentCustomer.totalBodybuilderSurcharge +
    //             _.sum(currentCustomer.restrictionsSurcharges) +
    //             _.sum(currentCustomer.specificRestrictionsSurcharges);
    //         }


    //         if (discountCodeApplied.discountType == 'Percentage') {

    //           discountCodeAmount = (discountCodeApplied.discountValue / 100) * subTotal;

    //         } else if (discountCodeApplied.discountType == 'Fixed amount') {
    //           discountCodeAmount = discountCodeApplied.discountValue;
    //         }


    //         if (currentCustomer.discountActual > 0 && discountCodeApplied.appliesToExistingDiscounts == false) {
    //           discountCodeAmount = 0;
    //         }

    //       }

    //       currentCustomer.discountCodeAmount = discountCodeAmount;

    //     }

    //     currentCustomer.totalCost =
    //       currentCustomer.baseMealPriceTotal +
    //       currentCustomer.totalAthleticSurcharge +
    //       currentCustomer.totalBodybuilderSurcharge +
    //       _.sum(currentCustomer.restrictionsSurcharges) +
    //       _.sum(currentCustomer.specificRestrictionsSurcharges);

    //     console.log(currentCustomer.totalCost);

    //     currentCustomer.totalCost -= currentCustomer.discountActual;

    //     if (currentCustomer.discountCodeAmount > 0) {
    //       currentCustomer.totalCost -= currentCustomer.discountCodeAmount;
    //     }

    //     console.log(currentCustomer.totalCost);
    //     // console.log(currentCustomer);

    //     // push
    //     secondaryCustomers.push(currentCustomer);
    //   });
    // }

    // let actualDeliveryCost = 0;
    // let surchargePerDelivery = 0;

    // const selectedPostalCode = this.props.postalCodes.find(
    //   el => el.title === this.props.customer.postalCode.substring(0, 3).toUpperCase(),
    // );

    // console.log(selectedPostalCode);

    // if (selectedPostalCode.hasOwnProperty('extraSurcharge')) {
    //   surchargePerDelivery = selectedPostalCode.extraSurcharge;
    // }

    // console.log(surchargePerDelivery);

    // for (
    //   let delivIndex = 0;
    //   delivIndex < this.props.subscription.delivery.length;
    //   delivIndex++
    // ) {
    //   const daysMealSum =
    //     parseInt(
    //       this.props.subscription.completeSchedule[delivIndex].breakfast,
    //       10,
    //     ) +
    //     parseInt(
    //       this.props.subscription.completeSchedule[delivIndex].lunch,
    //       10,
    //     ) +
    //     parseInt(
    //       this.props.subscription.completeSchedule[delivIndex].dinner,
    //       10,
    //     );

    //   const deliveryTypeSelected = this.props.subscription.delivery[
    //     delivIndex
    //   ];

    //   // calculate surcharges

    //   if (deliveryTypeSelected == '') {
    //     continue;
    //   } else if (
    //     deliveryTypeSelected == 'dayOf' ||
    //     deliveryTypeSelected == 'nightBefore'
    //   ) {
    //     primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //   } else if (
    //     // tuesday
    //     deliveryTypeSelected == 'sundayNight' ||
    //     deliveryTypeSelected == 'dayOfMonday'
    //   ) {
    //     primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //   } else if (
    //     // wednesday
    //     deliveryTypeSelected == 'sundayNight' ||
    //     deliveryTypeSelected == 'dayOfMonday' ||
    //     deliveryTypeSelected == 'nightBeforeMonday' ||
    //     deliveryTypeSelected == 'dayOfTuesday'
    //   ) {
    //     primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //   } else if (
    //     // thursday
    //     deliveryTypeSelected == 'mondayNight' ||
    //     deliveryTypeSelected == 'dayOfTuesday' ||
    //     deliveryTypeSelected == 'nightBeforeTuesday' ||
    //     deliveryTypeSelected == 'dayOfWednesday'
    //   ) {
    //     primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //   } else if (
    //     // friday
    //     deliveryTypeSelected == 'tuesdayNight' ||
    //     deliveryTypeSelected == 'dayOfWednesday' ||
    //     deliveryTypeSelected == 'nightBeforeWednesday' ||
    //     deliveryTypeSelected == 'dayOfThursday'
    //   ) {
    //     primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //   }
    //   // calculate actual delivery cost / delivery
    //   if (deliveryTypeSelected == '') {
    //     continue;
    //   } else if (
    //     deliveryTypeSelected == 'dayOf' ||
    //     deliveryTypeSelected == 'dayOfFriday' ||
    //     deliveryTypeSelected == 'dayOfThursday' ||
    //     deliveryTypeSelected == 'dayOfWednesday' ||
    //     deliveryTypeSelected == 'dayOfTuesday' ||
    //     deliveryTypeSelected == 'dayOfMonday'
    //   ) {
    //     actualDeliveryCost += 2.5;
    //   } else if (
    //     daysMealSum == 1 &&
    //     (deliveryTypeSelected == 'nightBefore' ||
    //       deliveryTypeSelected == 'sundayNight' ||
    //       deliveryTypeSelected == 'mondayNight' ||
    //       deliveryTypeSelected == 'tuesdayNight' ||
    //       deliveryTypeSelected == 'nightBeforeMonday' ||
    //       deliveryTypeSelected == 'nightBeforeTuesday' ||
    //       deliveryTypeSelected == 'nightBeforeWednesday')
    //   ) {
    //     actualDeliveryCost += 2.5;
    //   } else if (delivIndex == 5) {
    //     // these explicit conditions because they depend on friday's/thursday's selections
    //     if (
    //       this.props.subscription.delivery[delivIndex - 1] ==
    //       'dayOfThursday'
    //     ) {
    //       if (deliveryTypeSelected == 'nightBeforeThursday') {
    //         actualDeliveryCost += 2.5;

    //         // mixing surcharges here
    //         primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //       }
    //     } else if (
    //       this.props.subscription.delivery[delivIndex - 1] ==
    //       'dayOfPaired' &&
    //       this.props.subscription.delivery[delivIndex - 2] == 'dayOf'
    //     ) {
    //       if (deliveryTypeSelected == 'nightBeforeThursday') {
    //         actualDeliveryCost += 2.5;

    //         // mixing surcharges here
    //         primaryCustomer.deliverySurcharges += surchargePerDelivery;
    //       }
    //     }
    //   } // else if 5
    // }

    // // calculate delivery surcharges

    // primaryCustomer.deliveryCost = actualDeliveryCost;

    // primaryCustomer.totalCost =
    //   primaryCustomer.baseMealPriceTotal +
    //   primaryCustomer.totalAthleticSurcharge +
    //   primaryCustomer.totalBodybuilderSurcharge +
    //   primaryCustomer.coolerBag +
    //   _.sum(primaryCustomer.restrictionsSurcharges) +
    //   _.sum(primaryCustomer.specificRestrictionsSurcharges) +
    //   primaryCustomer.deliveryCost + primaryCustomer.deliverySurcharges;

    // primaryCustomer.totalCost -= primaryCustomer.discountActual;

    // if (primaryCustomer.discountCodeAmount > 0) {
    //   primaryCustomer.totalCost -= primaryCustomer.discountCodeAmount;
    // }

    // primaryCustomer.taxes =
    //   0.13 *
    //   (primaryCustomer.totalCost +
    //     _.sumBy(secondaryCustomers, e => e.totalCost));

    // let secondaryGroupCost = 0;

    // if (this.props.customer.associatedProfiles > 0) {
    //   secondaryCustomers.forEach((e, i) => {

    //     secondaryGroupCost += e.totalCost;

    //   });
    // }

    // primaryCustomer.secondaryGroupTotal = secondaryGroupCost;

    // primaryCustomer.groupTotal =
    //   secondaryGroupCost + primaryCustomer.totalCost + primaryCustomer.taxes;


    // primaryCustomer.taxes = parseFloat(primaryCustomer.taxes.toFixed(2));
    // primaryCustomer.groupTotal = parseFloat(primaryCustomer.groupTotal.toFixed(2));

    // console.log(primaryCustomer);

    Meteor.call('customer.getBillingData', this.props.customer._id, (err, res) => {
      if (err) {
        console.log(err);
        this.props.popTheSnackbar({
          message: 'There was a problem fetching billing line items',
        });
      } else {
        console.log(res);
        this.setState({
          summaryLoaded: true,
          primaryProfileBilling: res.primaryProfileBilling,
          secondaryProfilesBilling: res.secondaryProfilesBilling,
        });
      }
    });

    // this.setState({
    //   primaryProfileBilling: primaryCustomer,
    //   secondaryProfilesBilling: secondaryCustomers,
    // });

    // Payment.formatCardNumber(document.querySelector('#cardNumber'));
    // Payment.formatCardExpiry(document.querySelector('#expiry'));
    // Payment.formatCardCVC(document.querySelector('#cvc'));

  }

  attachPaymentFormatHandlers() {
    console.log('entered');


    validate($('#add-card-form'), {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent(),
        );
      },

      rules: {
        nameOnCard: {
          required: true,
        },

        postal_code: {
          minlength: 6,
          maxlength: 6,
          cdnPostal: true,
          required: true,
        },
        billingStreetAddress: {
          required: true,
        },
      },

      submitHandler() {
        this.handleSubmitStep();
      },
    });

    Payment.formatCardNumber(document.querySelector('#cardNumber'));
    Payment.formatCardExpiry(document.querySelector('#expiry'));
    Payment.formatCardCVC(document.querySelector('#cvc'));
  }

  handleSubmitStep() {

    if (!$('#add-card-form').valid()) {
      return;
    }

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    // this.props.saveValues({
    //   primaryProfileBilling: this.state.primaryProfileBilling,
    //   secondaryProfilesBilling: this.state.secondaryProfilesBilling,
    //   taxExempt: this.state.taxExempt,
    // });

    // customerInfo.primaryProfileBilling = this.state.primaryProfileBilling;
    // customerInfo.secondaryProfilesBilling = this.state.secondaryProfilesBilling;
    // customerInfo.taxExempt = this.state.taxExempt;
    // customerInfo.paymentMethod = this.state.paymentMethod;
    // customerInfo.nameOnCard = $('[name="nameOnCard"]')
    //   .val()
    //   .trim();
    // customerInfo.billingPostalCode = $('[name="postal_code"]')
    //   .val()
    //   .trim();

    // if (
    //   this.state.paymentMethod == 'interac' ||
    //   this.state.paymentMethod == 'cash'
    // ) {
    //   console.log("It's cash or interac");

    //   console.log(customerInfo);

    //   Meteor.call('customer.step5.noCreditCard', customerInfo, (err, res) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       this.setState({
    //         submitSuccess: false,
    //         submitLoading: true,
    //       });

    //       this.props.popTheSnackbar({
    //         message: 'Customer added successfully.',
    //       });

    //       this.props.history.push('/customers');
    //     }
    //   });

    //   return;
    // }

    const authData = {};
    authData.clientKey = Meteor.settings.public.clientKey;
    authData.apiLoginID = Meteor.settings.public.apiLoginKey;

    const expiration = document
      .getElementById('expiry')
      .value.trim()
      .split('/');

    const cardData = {};
    cardData.cardNumber = document
      .getElementById('cardNumber')
      .value.trim()
      .split(' ')
      .join('');
    cardData.month = expiration[0].trim();
    cardData.year = expiration[1].trim();
    cardData.cardCode = document.getElementById('cvc').value.trim();

    // console.log(cardData);
    const secureData = {};
    secureData.authData = authData;
    secureData.cardData = cardData;

    Accept.dispatchData(secureData, (response) => {
      // console.log(response);

      if (response.messages.resultCode === 'Ok' && response.opaqueData) {

        Meteor.call('changePaymentMethod', this.props.customer._id, response.opaqueData, this.state.primaryProfileBilling.groupTotal,
          {
            nameOnCard: $('[name="nameOnCard"]').val().trim(),
            billingPostalCode: $('[name="postal_code"]').val().trim(),
            billingStreetAddress: $('[name="billingStreetAddress"]').val().trim(),
          }, (err, response) => {

            if (err) {
              this.setState({
                submitSuccess: false,
                submitLoading: false,
              });

              this.props.popTheSnackbar({
                message: 'There was an error switching customer profiles',
              });
            } else {

              this.setState({
                submitSuccess: true,
                submitLoading: false,
                dialogAddCard: false,
                dialogEditPaymentMethod: false,
              });

              this.props.popTheSnackbar({
                message: 'Successfully switched customer to card',
              });

              this.setState({
                submitSuccess: false,
              });

            }
          });

      } else {
        this.setState({
          submitSuccess: false,
          submitLoading: false,
        });

        this.props.popTheSnackbar({
          message: response.messages.message[0].text,
        });
      }
    });
  }

  /* AUTOSUGGEST */

  onChangeTypes(event, { newValue }) {
    this.setState({
      discountSelected: newValue,
      valueTypes: newValue,
    });
  }

  onSuggestionSelectedTypes(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    let clonedRestrictions = this.state.discountApplied != ''
      ? this.state.discountApplied
      : [];

    const isThere = false;

    if (clonedRestrictions.length > 0) {
      // isThere = clonedRestrictions.filter(
      //   present => suggestion._id === present._id,
      // );
      this.props.popTheSnackbar({
        message: 'Cannot add more than one discount code',
      });
      return;
    }

    if (isThere != false) {
      return;
    }

    clonedRestrictions = suggestion.title;

    this.setState({
      hasFormChanged: true,
      discountSelected: clonedRestrictions,
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
    console.log('Fetch requested');

    console.log(this.props.discounts.filter(d => d.title.slice(0, inputLength) === inputValue));

    return inputLength === 0
      ? []
      : this.props.discounts.filter(
        discount => discount.title.toLowerCase().slice(0, inputLength) === inputValue,
      );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValueTypes(suggestion) {
    return suggestion.title;
  }

  renderSuggestionTypes(suggestion) {
    return (
      <MenuItem component="div">
        <Typography type="subheading">{suggestion.title}</Typography>
      </MenuItem>
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

  renderSuggestionsContainerTypes(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  openDiscountDeleteDialog() {
    this.setState({
      discountDeleteDialog: true,
    });
  }

  closeDiscountDeleteDialog() {
    this.setState({
      discountDeleteDialog: false,
    });
  }

  openOrderSummaryDialog() {

    Meteor.call('customer.getBillingData', this.props.customer._id, this.state.discountSelected, (err, res) => {

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
        console.log(res);
        this.setState({
          submitSuccess: true,
          submitLoading: false,
          primaryProfileBillingNew: res.primaryProfileBilling,
          secondaryProfilesBillingNew: res.secondaryProfilesBilling,
        }, () => {
          this.setState({
            orderSummaryDialogOpen: true,
            secondTime: true,
          });
        });
      }
    });
  }


  // this method verifies and opens up the subscription update dialog (similar to step 2)
  handleApplyDiscount() {

    if (this.props.subscription.hasOwnProperty('discountApplied')) {
      this.props.popTheSnackbar({
        message: 'There is already a discount code present on the subscription.',
      });

      return;
    }

    const discountDetails = {
      discountTitle: this.state.discountSelected,
      customerId: this.props.customer._id,
    };

    // console.log(discountDetails)

    Meteor.call('discounts.verify', discountDetails, (err, res) => {

      if (err) {
        this.props.popTheSnackbar({
          message: err.reason,
        });
      } else {
        this.openOrderSummaryDialog();
      }

      console.log(res);

    });
  }

  handleSaveDiscount() {

    const discountDetails = {
      discountCode: this.state.discountSelected,
      id: this.props.customer._id,
    };

    Meteor.call('edit.customer.step4', discountDetails, (err, res) => {
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

          if (typeof res === 'object' && res.hasOwnProperty('subUpdateScheduled')) {
            this.props.popTheSnackbar({
              message: 'Customer details update scheduled for friday night.',
            });
          } else {
            this.props.popTheSnackbar({
              message: 'Discount added successfully.',
            });

            this.setState({
              openSummaryDialog: false,
            })
          }

        });
      }
    });
  }

  // this methods removes the discount and opens up the subscription update dialog (similar to step 2)
  handleRemoveDiscount() {

  }

  handleRestrictionChipDelete(type) {

    this.openDiscountDeleteDialog();
  }

  handleRestrictionChipDeleteActual() {
    this.setState({
      discountApplied: '',
      hasFormChanged: true,
    });


    this.closeDiscountDeleteDialog();
    this.handleRemoveDiscount();
  }

  getTypeAvatar(discount) {
    return discount.title.charAt(0);
  }

  /* AUTOSUGGEST ENDS */

  handleTaxExempt(event, checked) {
    this.setState({
      taxExempt: checked,
    });
  }

  handleChangeRadioPaymentMethod(event, value) {
    this.setState({
      paymentMethod: value,
    });
  }

  // refactor all these dialog open methods into one
  openCancelSubscriptionDialog() {
    this.setState({
      dialogCancelSubscription: true,
    });
  }


  closeCancelSubscriptionDialog() {
    this.setState({
      dialogCancelSubscription: false,
    });
  }

  openActivateSubscriptionDialog() {
    this.setState({
      dialogActivateSubscription: true,
    });
  }


  closeActivateSubscriptionDialog() {
    this.setState({
      dialogActivateSubscription: false,
    });
  }

  openEditPaymentMethodDialog() {
    this.setState({
      dialogEditPaymentMethod: true,
    });
  }

  closeEditPaymentMethodDialog() {
    this.setState({
      dialogEditPaymentMethod: false,
    });
  }

  openAddCardDialog() {
    this.setState({
      dialogAddCard: true,
    });
  }

  closeAddCardDialog() {
    this.setState({
      dialogAddCard: false,
    });
  }

  handleClose() {
    this.setState({
      orderSummaryDialogOpen: false,
      secondTime: false,
    });
  }

  handleCancelSubscription(when) {

    Meteor.call('cancelSubscription', when, this.props.customer._id, (err, res) => {

      this.setState({
        dialogCancelSubscription: false,
      });

      if (err) {
        console.log(err);
        this.props.popTheSnackbar({
          message: err.reason,
        });
      } else {
        console.log(res);
        this.props.popTheSnackbar({
          message: 'Successfully cancelled the subscription.',
        });
      }

    });

  }

  handleActivateSubscription(when) {

    Meteor.call('activateSubscription', when, this.props.customer._id, this.state.primaryProfileBilling.groupTotal, (err, res) => {
      this.setState({
        dialogActivateSubscription: false,
      });

      if (err) {
        this.props.popTheSnackbar({
          messages: err,
        });
      } else {
        console.log(res);
        this.props.popTheSnackbar({
          message: 'Successfully activated the subscription.',
        });
      }
    });
  }

  handleEditPaymentMethod(type) {

    if (type == 'card') {
      this.openAddCardDialog();
    }

    if (type == 'interac' || type == 'cash') {

      Meteor.call('changePaymentMethodNonCard', type, this.props.customer._id, (err, res) => {

        if (err) {
          // console.log(err);
          this.props.popTheSnackbar({
            messages: err,
          });
        } else {

          this.setState({
            dialogEditPaymentMethod: false,
          }, () => {

            this.props.popTheSnackbar({
              message: `Successfully changed the payment method to ${type}`,
            });

          });
        }
      });


    }

  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return (
      <form
        id="step6"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
        style={{ width: '100%' }}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: '50px', marginTop: '25px' }}
        >

          <Grid item xs={12} sm={7}>
            <Paper elevation={2} className="paper-for-fields">
              <Grid container>
                <Grid item xs={12}>
                  <Typography type="headline" style={{ marginBottom: '25px' }}>Payment Method</Typography>
                </Grid>

                <Grid item xs={12}>
                  {this.state.paymentMethod === 'card' && this.state.paymentProfileDetails != null ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                          {this.state.paymentProfileDetails.payment.creditCard.cardType == 'Visa' && (<img width="80" src="/visa.svg" />)}

                          {this.state.paymentProfileDetails.payment.creditCard.cardType == 'Mastercard' && (<img width="80" src="/mastercard.svg" />)}

                          {this.state.paymentProfileDetails.payment.creditCard.cardType == 'AmericanExpress' && (<img width="80" src="/amex.svg" />)}

                          {this.state.paymentProfileDetails.payment.creditCard.cardType == 'Discover' && (<img width="80" src="/discover.svg" />)}

                          {this.state.paymentProfileDetails.payment.creditCard.cardType == 'JCB' && (<img width="80" src="/jcb.svg" />)}

                          {this.state.paymentProfileDetails.payment.creditCard.cardType == 'DinersClub' && (<img width="80" src="/diners.svg" />)}
                        </div>
                        <div style={{ marginLeft: '10px' }}>
                          <Typography type="body2">Card {this.state.paymentProfileDetails.payment.creditCard.cardNumber}</Typography>
                          <Typography type="body2">Expiry {this.state.paymentProfileDetails.payment.creditCard.expirationDate}</Typography>
                        </div>
                        <Button onClick={this.openEditPaymentMethodDialog} style={{ marginLeft: '1em' }}>Edit</Button>
                      </div>
                    </div>
                  ) : ''}

                  {this.state.paymentMethod === 'cash' ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Typography type="headline">Cash</Typography>
                      <Button onClick={this.openEditPaymentMethodDialog} style={{ marginLeft: '1em' }}>Edit</Button>

                    </div>


                  ) : ''}

                  {this.state.paymentMethod === 'interac' ? (

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Typography type="headline">Interac e-Transfer</Typography>
                      <Button onClick={this.openEditPaymentMethodDialog} style={{ marginLeft: '1em' }}>Edit</Button>
                    </div>

                  ) : ''}
                </Grid>

                <Grid item xs={12}>
                  <Typography type="headline" style={{ margin: '25px 0', display: 'flex', alignItems: 'center' }}>Subscription
                    <Chip style={{ marginLeft: '10px' }} label={this.props.subscription && this.props.subscription.status.toUpperCase()} /></Typography>

                </Grid>

                <Grid item xs={12}>
                  <Typography type="subheading">Customer since {moment(this.props.customer.createdAt && this.props.customer.createdAt).format('YYYY-MM-DD')}</Typography>

                  <div style={{ margin: '20px 0' }}>
                    {this.props.subscription && (this.props.subscription.status == 'paused' || this.props.subscription.status == 'active') && (
                      <Button color="secondary" raised onClick={this.openCancelSubscriptionDialog}>Cancel subscription</Button>
                    )}

                    {(this.props.subscription.status == 'cancelled') && (
                      <Button color="accent" raised onClick={this.openActivateSubscriptionDialog}>Activate subscription</Button>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Typography type="headline" style={{ margin: '25px 0', display: 'flex', alignItems: 'center' }}>Discount</Typography>
                </Grid>

                <Grid item xs={12}>

                  <Grid container>
                    <Grid item xs={8} style={{ position: 'relative' }}>
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
                    <Grid item xs={4}>
                      <Button
                        onClick={this.handleApplyDiscount}
                        disabled={this.state.discountApplied.length > 0 || this.state.discountSelected == ''}
                      >
                        Apply
                      </Button>
                    </Grid>

                  </Grid>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginTop: '25px',
                    }}
                  >
                    {this.state.discountApplied != '' ? (
                      _.filter(this.props.discounts, u => u._id == this.state.discountApplied).map((e, i) => (
                        <Chip
                          avatar={<Avatar> {this.getTypeAvatar(e)} </Avatar>}
                          style={{ marginRight: '8px', marginBottom: '8px' }}
                          label={`${e.title}`}
                          key={i}
                          onDelete={this.handleRestrictionChipDelete.bind(
                            this,
                            e,
                          )}
                        />
                      ))
                    ) : (
                      <Chip className="chip--bordered" label="Discount code" />
                    )}
                  </div>
                </Grid>

                <Dialog
                  open={this.state.dialogCancelSubscription}
                  onClose={this.closeCancelSubscriptionDialog}
                  aria-labelledby="responsive-dialog-title"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <DialogTitle id="responsive-dialog-title" style={{}}>{`Cancel ${this.props.customer.profile.name.first} ${this.props.customer.profile.name.last}'s subscription?`}</DialogTitle>
                    <ClearIcon onClick={this.closeCancelSubscriptionDialog} style={{ paddingRight: '24px' }} />
                  </div>
                  <DialogContent>
                    <DialogContentText>
                      Do you want to cancel the subscription immediately or the earliest saturday?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleCancelSubscription.bind(this, 'immediate')} color="primary">Immediate</Button>
                    <Button onClick={this.handleCancelSubscription.bind(this, 'saturday')} color="primary" autoFocus>Saturday</Button>
                  </DialogActions>
                </Dialog>

                <Dialog
                  open={this.state.discountDeleteDialog}
                  onClose={this.closeDiscountDeleteDialog}
                  aria-labelledby="responsive-dialog-title"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <DialogTitle id="responsive-dialog-title" style={{}}>{`Delete discount code from ${this.props.customer.profile.name.first}'s subscription?`}</DialogTitle>
                    <ClearIcon onClick={this.closeDiscountDeleteDialog} style={{ paddingRight: '24px' }} />
                  </div>
                  <DialogContent>
                    <DialogContentText>
                      Do you really want to delete discount code from {this.props.customer.profile.name.first}'s subscription?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleDiscountApply} color="primary">No</Button>
                    <Button onClick={this.handleRestrictionChipDeleteActual} color="primary" autoFocus>Yes</Button>

                  </DialogActions>
                </Dialog>

                <Dialog
                  open={this.state.dialogActivateSubscription}
                  onClose={this.closeActivateSubscriptionDialog}
                  aria-labelledby="responsive-dialog-title"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <DialogTitle id="responsive-dialog-title" style={{}}>{`Activate ${this.props.customer.profile.name.first} ${this.props.customer.profile.name.last}'s subscription?`}</DialogTitle>
                    <ClearIcon onClick={this.closeActivateSubscriptionDialog} style={{ paddingRight: '24px' }} />
                  </div>
                  <DialogContent>
                    <DialogContentText>
                      Do you want to activate the subscription immediately or the earliest saturday?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleActivateSubscription.bind(this, 'immediate')} color="primary">Immediate</Button>
                    <Button onClick={this.handleActivateSubscription.bind(this, 'saturday')} color="primary" autoFocus>Saturday</Button>
                  </DialogActions>
                </Dialog>

                <Dialog
                  open={this.state.dialogEditPaymentMethod}
                  onClose={this.closeEditPaymentMethodDialog}
                  aria-labelledby="responsive-dialog-title"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <DialogTitle id="responsive-dialog-title" style={{}}>{`Change ${this.props.customer.profile.name.first} ${this.props.customer.profile.name.last}'s payment method?`}</DialogTitle>
                    <ClearIcon onClick={this.closeEditPaymentMethodDialog} style={{ paddingRight: '24px' }} />
                  </div>
                  <DialogContent>
                    <DialogContentText>
                      Do you want to change the payment method?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>

                    <Button disabled={this.state.paymentMethod && this.state.paymentMethod == 'card'} onClick={this.handleEditPaymentMethod.bind(this, 'card')} color="primary">Card</Button>
                    <Button disabled={this.state.paymentMethod && this.state.paymentMethod == 'cash'} onClick={this.handleEditPaymentMethod.bind(this, 'cash')} color="primary" autoFocus>Cash</Button>
                    <Button disabled={this.state.paymentMethod && this.state.paymentMethod == 'interac'} onClick={this.handleEditPaymentMethod.bind(this, 'interac')} color="primary" autoFocus>Interac e-Transfer</Button>

                  </DialogActions>
                </Dialog>

                <Dialog
                  open={this.state.dialogAddCard}
                  onClose={this.closeAddCardDialog}
                  aria-labelledby="responsive-dialog-title"
                  onEntered={this.attachPaymentFormatHandlers}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <DialogTitle id="responsive-dialog-title" style={{}}>{`Add card as ${this.props.customer.profile.name.first} ${this.props.customer.profile.name.last}'s payment method?`}</DialogTitle>
                    <ClearIcon onClick={this.closeAddCardDialog} style={{ paddingRight: '24px' }} />
                  </div>
                  <DialogContent>
                    <form
                      id="add-card-form"
                      ref={form => (this.form = form)}
                      onSubmit={event => event.preventDefault()}
                    >
                      <Grid container>

                        <Grid item xs={12}>
                          <Input
                            placeholder="Name on card"
                            inputProps={{
                              name: 'nameOnCard',
                              id: 'nameOnCard',
                              required: true,
                            }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Input
                            placeholder="Card number"
                            inputProps={{
                              name: 'cardNumber',
                              id: 'cardNumber',
                              required: true,

                            }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4}>
                          <Input
                            placeholder="Expiration"
                            inputProps={{
                              name: 'expiry', id: 'expiry', required: true,
                            }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Input
                            placeholder="CVC"
                            inputProps={{
                              name: 'cvc', id: 'cvc', required: true,
                            }}
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={4}>
                          <Input
                            placeholder="Postal code"
                            inputProps={{
                              name: 'postal_code',
                              id: 'postalCode',
                              required: true,

                            }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} sm={12}>
                          <Input
                            placeholder="Street address"
                            inputProps={{
                              name: 'billingStreetAddress',
                              id: 'billingStreetAddress',
                              required: true,

                            }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      <Button
                        disabled={this.state.submitLoading}
                        raised
                        className={`${buttonClassname}`}
                        color="primary"
                        type="submit"
                        style={{ marginTop: '25px' }}
                        onClick={() => this.handleSubmitStep()}
                      >
                        Add
                        {this.state.submitLoading && (
                          <CircularProgress
                            size={24}
                            className={this.props.classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </form>
                  </DialogContent>

                </Dialog>


                {/* <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="payment-method"
                          name="paymentMethod"
                          value={this.state.paymentMethod}
                          onChange={this.handleChangeRadioPaymentMethod.bind(
                            this,
                          )}
                          style={{ flexDirection: 'row' }}
                        >
                          <FormControlLabel
                            value="card"
                            control={<Radio />}
                            label="Credit card"
                            checked
                            selected
                          />
                          <FormControlLabel
                            value="interac"
                            control={<Radio />}
                            label="Interac e-transfer"
                          />

                          <FormControlLabel
                            value="cash"
                            control={<Radio />}
                            label="Cash"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid> */}
              </Grid>

              {/* <div
                    className={
                      this.state.paymentMethod == 'card' ? 'show' : 'hidden'
                    }
                  >
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography
                          type="subheading"
                          className="font-uppercase"
                        >
                          Payment
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Input
                          placeholder="Name on card"
                          inputProps={{
                            name: 'nameOnCard',
                            id: 'nameOnCard',
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Input
                          placeholder="Card number"
                          inputProps={{
                            name: 'cardNumber',
                            id: 'cardNumber',
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={4}>
                        <Input
                          placeholder="Expiration"
                          inputProps={{ name: 'expiry', id: 'expiry' }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Input
                          placeholder="CVC"
                          inputProps={{ name: 'cvc', id: 'cvc' }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Input
                          placeholder="Postal code"
                          inputProps={{
                            name: 'postal_code',
                            id: 'postalCode',
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </div> */}

              {/* {this.state.paymentMethod == 'interac' ||
                    this.state.paymentMethod == 'cash' ? (
                      <div>
                        <Grid container>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  value="taxExempt"
                                  checked={this.state.taxExempt}
                                />
                              }
                              onChange={this.handleTaxExempt.bind(this)}
                              label="Customer is tax exempt"
                            />
                          </Grid>
                        </Grid>
                      </div>
                    ) : (
                      ''
                    )} */}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Paper elevation={2} className="paper-for-fields">
              {this.state.summaryLoaded && (
                <Grid container>
                  <Grid item xs={12} sm={12}>
                    <Typography
                      type="headline"
                      style={{ marginBottom: '25px' }}
                    >
                      Overview
                    </Typography>
                    <Typography
                      type="title"
                      className="font-medium font-uppercase"
                      style={{ marginTop: '.75em', marginBottom: '.75em' }}
                    >
                      Meal Plan
                    </Typography>

                    <Typography
                      type="title"
                      style={{
                        marginTop: '.75em',
                        marginBottom: '.75em',
                      }}
                    >
                      {this.state.primaryProfileBilling
                        ? this.state.primaryProfileBilling.lifestyle.title
                        : ''}
                    </Typography>

                    <Grid container>
                      <Grid item xs={6}>
                        <Typography type="subheading">
                          {this.state.primaryProfileBilling
                            ? `${this.state.primaryProfileBilling.breakfast
                              .totalQty +
                            this.state.primaryProfileBilling.lunch
                              .totalQty +
                            this.state.primaryProfileBilling.dinner
                              .totalQty} meals`
                            : ''}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          type="subheading"
                          style={{ textAlign: 'right' }}
                        >
                          ${this.state.primaryProfileBilling
                            ? this.state.primaryProfileBilling.breakfast
                              .totalQty *
                            this.state.primaryProfileBilling
                              .breakfastPrice +
                            this.state.primaryProfileBilling.lunch
                              .totalQty *
                            this.state.primaryProfileBilling.lunchPrice +
                            this.state.primaryProfileBilling.dinner
                              .totalQty *
                            this.state.primaryProfileBilling.dinnerPrice
                            : ''}
                        </Typography>
                      </Grid>
                    </Grid>

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.discountActual ? (
                        <Grid container>
                          <Grid item xs={12}>
                            <Typography
                              type="body2"
                              className="font-medium font-uppercase"
                              style={{ marginTop: '.75em' }}
                            >
                              Discount
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography type="subheading">
                              {this.state.primaryProfileBilling.discount
                                .charAt(0)
                                .toUpperCase() +
                                this.state.primaryProfileBilling.discount.substr(
                                  1,
                                  this.state.primaryProfileBilling.discount
                                    .length,
                                )}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              -${
                                this.state.primaryProfileBilling.discountActual
                              }{' '}
                            </Typography>
                          </Grid>
                          {/* <Grid item xs={12} sm={6}>
                            <Typography type="subheading">
                              {this.props.discounts.find(e => this.props.subscription.discountApplied == e._id).title}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              -${
                                this.state.primaryProfileBilling.discountCodeAmount
                              }{' '}
                            </Typography>
                          </Grid> */}

                        </Grid>
                      ) : (
                        ''
                      )}


                    {/* {this.state.primaryProfileBilling && (this.state.primaryProfileBilling.discountActual == 0 && this.state.primaryProfileBilling.discountCodeAmount > 0) ? (
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography
                            type="body2"
                            className="font-medium font-uppercase"
                            style={{ marginTop: '.75em' }}
                          >
                            Discount
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography type="subheading">
                            {this.props.discounts.find(e => this.props.subscription.discountApplied == e._id).title}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            -${
                              this.state.primaryProfileBilling.discountCodeAmount
                            }{' '}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : ''} */}

                    {this.state.primaryProfileBilling &&
                      (this.state.primaryProfileBilling.totalAthleticSurcharge >
                        0 ||
                        this.state.primaryProfileBilling
                          .totalBodybuilderSurcharge > 0) ? (
                            <Grid item xs={12}>
                          <Typography
                            type="body2"
                            className="font-medium font-uppercase"
                            style={{ marginTop: '.75em' }}
                          >
                            Extra
                          </Typography>
                        </Grid>
                      ) : (
                        ''
                      )}

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.totalAthleticSurcharge >
                      0 ? (
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography type="subheading">Athletic</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              ${
                                this.state.primaryProfileBilling
                                  .totalAthleticSurcharge
                              }{' '}
                              ({this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeAthletic == 'Fixed amount'
                                ? '$'
                                : ''}
                              {
                                this.state.primaryProfileBilling.lifestyle
                                  .extraAthletic
                              }
                              {this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeAthletic == 'Percentage'
                                ? '%'
                                : ''})
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        ''
                      )}

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling
                        .totalBodybuilderSurcharge > 0 ? (
                          <Grid container>
                          <Grid item xs={12} sm={6}>
                            <Typography type="subheading">
                              Bodybuilder
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              ${
                                this.state.primaryProfileBilling
                                  .totalBodybuilderSurcharge
                              }{' '}
                              ({this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeBodybuilder ==
                                'Fixed amount'
                                ? '$'
                                : ''}
                              {
                                this.state.primaryProfileBilling.lifestyle
                                  .extraBodybuilder
                              }
                              {this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeBodybuilder == 'Percentage'
                                ? '%'
                                : ''})
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        ''
                      )}

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.restrictionsActual
                        .length > 0 && (
                        <Typography
                          type="body2"
                          className="font-medium font-uppercase"
                          style={{
                            marginTop: '.75em',
                            marginBottom: '.75em',
                          }}
                        >
                          Restrictions
                        </Typography>
                      )}

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.restrictionsActual
                        .length > 0
                      ? this.state.primaryProfileBilling.restrictionsActual.map(
                        (e, i) => (
                          <Grid container key={i}>
                            <Grid item xs={12} sm={6}>
                              <Typography type="subheading">
                                {e.title} ({e.discountOrExtraType ==
                                  'Fixed amount'
                                  ? '$'
                                  : ''}
                                {e.extra}
                                {e.discountOrExtraType == 'Percentage'
                                  ? '%'
                                  : ''})
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                type="subheading"
                                style={{ textAlign: 'right' }}
                              >
                                ${
                                  this.state.primaryProfileBilling
                                    .restrictionsSurcharges[i]
                                }
                              </Typography>
                            </Grid>
                          </Grid>
                        ),
                      )
                      : ''}

                    {/* this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling
                        .specificRestrictionsActual.length > 0
                        ? this.state.primaryProfileBilling.specificRestrictionsActual.map(
                            (e, i) => (
                              <Grid container key={i}>
                                <Grid item xs={12} sm={6}>
                                  <Typography type="subheading">
                                    {e.title} ({e.discountOrExtraType ==
                                    "Fixed amount"
                                      ? "$"
                                      : ""}
                                    {e.extra}
                                    {e.discountOrExtraType == "Percentage"
                                      ? "%"
                                      : ""})
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: "right" }}
                                  >
                                    ${
                                      this.state.primaryProfileBilling
                                        .specificRestrictionsSurcharges[i]
                                    }
                                  </Typography>
                                </Grid>
                              </Grid>
                            )
                          )
                        : "" */}

                    {this.state.secondaryProfilesBilling
                      ? this.state.secondaryProfilesBilling.map((e, i) => (
                        <div>
                          <Typography
                            type="title"
                            style={{
                              marginTop: '.75em',
                              marginBottom: '.75em',
                            }}
                          >
                            {e.lifestyle.title}
                          </Typography>

                          <Grid container>
                            <Grid item xs={6}>
                              <Typography type="subheading">
                                {`${e.breakfast.totalQty +
                                  e.lunch.totalQty +
                                  e.dinner.totalQty} meals`}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                type="subheading"
                                style={{ textAlign: 'right' }}
                              >
                                ${e.breakfast.totalQty * e.breakfastPrice +
                                  e.lunch.totalQty * e.lunchPrice +
                                  e.dinner.totalQty * e.dinnerPrice}
                              </Typography>
                            </Grid>
                          </Grid>
                          {/* discount secondary = */}
                          {e.discountActual &&
                            e.discountActual > 0 && (
                              <Grid container>
                                <Grid item xs={12}>
                                  <Typography
                                    type="body2"
                                    className="font-medium font-uppercase"
                                    style={{ marginTop: '.75em' }}
                                  >
                                    Discount
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography type="subheading">
                                    {e.discount.charAt(0).toUpperCase() +
                                      e.discount.substr(
                                        1,
                                        e.discount.length,
                                      )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: 'right' }}
                                  >
                                    -${e.discountActual}{' '}
                                  </Typography>
                                </Grid>
                                {/* {e.discountCodeAmount > 0 && (
                                  <div>
                                    <Grid item xs={12} sm={6}>
                                      <Typography type="subheading">
                                        {this.props.discounts.find(disc => this.props.subscription.discountApplied == disc._id).title}

                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography
                                        type="subheading"
                                        style={{ textAlign: 'right' }}
                                      >
                                        -${e.discountCodeAmount}{' '}
                                      </Typography>
                                    </Grid>
                                  </div>
                                )} */}

                              </Grid>
                            )}

                          {/* {e.discountActual == 0 &&
                            e.discountCodeAmount > 0 && (
                              <Grid container>
                                <Grid item xs={12}>
                                  <Typography
                                    type="body2"
                                    className="font-medium font-uppercase"
                                    style={{ marginTop: '.75em' }}
                                  >
                                    Discount
                                </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography type="subheading">
                                    {this.props.discounts.find(disc => this.props.subscription.discountApplied == disc._id).title}

                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: 'right' }}
                                  >
                                    -${e.discountCodeAmount}{' '}
                                  </Typography>
                                </Grid>
                              </Grid>
                            )} */}

                          {e.totalAthleticSurcharge > 0 ||
                            e.totalBodybuilderSurcharge > 0 ? (
                              <Grid item xs={12}>
                                <Typography
                                  type="body2"
                                  className="font-medium font-uppercase"
                                  style={{ marginTop: '.75em' }}
                                >
                                  Extra
                                </Typography>
                              </Grid>
                            ) : (
                              ''
                            )}

                          {e.totalAthleticSurcharge > 0 ? (
                            <Grid container>
                              <Grid item xs={6}>
                                <Typography type="subheading">
                                  Athletic
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  type="subheading"
                                  style={{ textAlign: 'right' }}
                                >
                                  ${e.totalAthleticSurcharge} ({e.lifestyle
                                    .discountOrExtraTypeAthletic ==
                                    'Fixed amount'
                                    ? '$'
                                    : ''}
                                  {e.lifestyle.extraAthletic}
                                  {e.lifestyle
                                    .discountOrExtraTypeAthletic ==
                                    'Percentage'
                                    ? '%'
                                    : ''})
                                </Typography>
                              </Grid>
                            </Grid>
                          ) : (
                            ''
                          )}

                          {e.totalBodybuilderSurcharge > 0 ? (
                            <Grid container>
                              <Grid item sm={6} xs={12}>
                                <Typography type="subheading">
                                  Bodybuilder
                                </Typography>
                              </Grid>
                              <Grid item sm={6} xs={12}>
                                <Typography
                                  type="subheading"
                                  style={{ textAlign: 'right' }}
                                >
                                  ${e.totalBodybuilderSurcharge} ({e
                                    .lifestyle
                                    .discountOrExtraTypeBodybuilder ==
                                    'Fixed amount'
                                    ? '$'
                                    : ''}
                                  {e.lifestyle.extraBodybuilder}
                                  {e.lifestyle
                                    .discountOrExtraTypeBodybuilder ==
                                    'Percentage'
                                    ? '%'
                                    : ''})
                                </Typography>
                              </Grid>
                            </Grid>
                          ) : (
                            ''
                          )}

                          {e.restrictionsActual.length > 0 && (
                            <Typography
                              type="body2"
                              className="font-medium font-uppercase"
                              style={{
                                marginTop: '.75em',
                                marginBottom: '.75em',
                              }}
                            >
                              Restrictions
                            </Typography>
                          )}

                          {e.restrictionsActual.length > 0 &&
                            e.restrictionsActual.map((el, ind) => (
                              <Grid container key={ind}>
                                <Grid item xs={12} sm={6}>
                                  <Typography type="subheading">
                                    {el.title} ({el.discountOrExtraType ==
                                      'Fixed amount'
                                      ? '$'
                                      : ''}
                                    {el.extra}
                                    {el.discountOrExtraType == 'Percentage'
                                      ? '%'
                                      : ''})
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: 'right' }}
                                  >
                                    ${e.restrictionsSurcharges[ind]}
                                  </Typography>
                                </Grid>
                              </Grid>
                            ))}

                          {/* e.specificRestrictionsActual.length > 0 &&
                                e.specificRestrictionsActual.map((el, ind) => (
                                  <Grid container key={ind}>
                                    <Grid item xs={12} sm={6}>
                                      <Typography type="subheading">
                                        {el.title} ({el.discountOrExtraType ==
                                        "Fixed amount"
                                          ? "$"
                                          : ""}
                                        {el.extra}
                                        {el.discountOrExtraType == "Percentage"
                                          ? "%"
                                          : ""})
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography
                                        type="subheading"
                                        style={{ textAlign: "right" }}
                                      >
                                        ${e.specificRestrictionsSurcharges[ind]}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                )) */}
                        </div>
                      ))
                      : ''}

                    {/*  delivery and other stuff  */}
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography type="subheading">Delivery</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          type="subheading"
                          style={{ textAlign: 'right' }}
                        >
                          {this.state.primaryProfileBilling &&
                            this.state.primaryProfileBilling.deliveryCost > 0
                            ? `$${
                              this.state.primaryProfileBilling.deliveryCost
                            }`
                            : 'Free'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.deliverySurcharges >
                      0 && (
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography type="subheading">
                              Delivery Surcharge (${
                                this.props.postalCodes.find(
                                  el =>
                                    el.title ===
                                    this.props.customer.postalCode.substring(
                                      0,
                                      3,
                                    ),
                                ).extraSurcharge
                              })
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              {this.state.primaryProfileBilling &&
                                this.state.primaryProfileBilling
                                  .deliverySurcharges > 0
                                ? `$${
                                  this.state.primaryProfileBilling
                                    .deliverySurcharges
                                }`
                                : ''}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                    {this.state.primaryProfileBilling.discountTotal > 0 && (
                      <div style={{ marginTop: '25px' }}>
                        <Grid container>
                          <Grid item xs={12}>
                            <Typography type="title">Discount</Typography>
                          </Grid>
                        </Grid>
                        <Grid container>
                          <Grid item xs={12} sm={6}>
                            <Typography type="body2">
                              {this.props.discounts.find(e => this.props.subscription.discountApplied == e._id).title}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              -${
                                this.state.primaryProfileBilling.discountTotal
                              }{' '}
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    )}

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.coolerBag > 0 && (
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography type="subheading">
                              Cooler bag
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              type="subheading"
                              style={{ textAlign: 'right' }}
                            >
                              {/* $20.00 */}
                              $0
                            </Typography>
                          </Grid>
                        </Grid>
                      )}

                    <Typography
                      type="title"
                      className="font-medium font-uppercase"
                      style={{ marginTop: '.75em', marginBottom: '.75em' }}
                    >
                      Price
                    </Typography>

                    {!this.state.taxExempt ? (
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <Typography type="title">Taxes</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            ${this.state.primaryProfileBilling &&
                              this.state.primaryProfileBilling.taxes}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      ''
                    )}
                    <Grid container>
                      <Grid item xs={12} sm={6}>
                        <Typography type="title">Total</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          type="title"
                          style={{
                            textAlign: 'right',
                            color: '#000',
                          }}
                        >
                          {this.state.taxExempt
                            ? this.state.primaryProfileBilling &&
                            `$${this.state.primaryProfileBilling
                              .groupTotal -
                            this.state.primaryProfileBilling.taxes}/week`
                            : this.state.primaryProfileBilling &&
                            `$${
                              this.state.primaryProfileBilling.groupTotal
                            }/week`}
                        </Typography>
                      </Grid>
                    </Grid>
                    {/* Container Price  */}
                  </Grid>
                </Grid>
              )}

              {this.state.summaryLoaded && (
                <Dialog
                  maxWidth="md"
                  fullScreen
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
                      <Button color="inherit" onClick={() => this.handleSaveDiscount()}>Save</Button>
                    </Toolbar>
                  </AppBar>
                  <OrderSummary
                    primaryProfileBilling={this.state.primaryProfileBillingNew}
                    secondaryProfilesBilling={this.state.secondaryProfilesBillingNew}
                    postalCodes={this.props.postalCodes}
                    customerInfo={this.props.customer}
                    discounts={this.props.discounts}
                    subscription={this.props.subscription}
                    discountSelected={this.state.discountSelected}
                  />
                </Dialog>
              )}

            </Paper>
          </Grid>
        </Grid>
      </form>
    );
  }
}

Step4CheckoutCurrent.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default withStyles(styles)(Step4CheckoutCurrent);
