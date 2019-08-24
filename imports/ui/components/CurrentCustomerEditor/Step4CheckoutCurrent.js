import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import Input from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import Card from 'material-ui/Card';
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

class Step4CheckoutCurrent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,

      summaryLoaded: false,
      summaryLoading: false,

      paymentMethod: this.props.customer && this.props.subscription ? this.props.subscription.paymentMethod : '',
      taxExempt: this.props.customer && this.props.subscription ? this.props.subscription.taxExempt : '',

      paymentProfileDetails: null,
      paymentProfileLoading: false,

      subscriptionDetails: null,
      getSubscriptionDetailsLoading: false,

      dialogCancelSubscription: false,
      dialogEditPaymentMethod: false,
      dialogActivateSubscription: false,

      dialogAddCard: false,

      valueTypes: '',
      suggestionsTypes: [],

      valueGiftCards: '',
      suggestionsGiftCards: [],

      discountSelected: '',
      discountApplied: this.props.subscription && this.props.subscription.hasOwnProperty('discountApplied') ? this.props.subscription.discountApplied : '',

      giftCardSelected: '',
      giftCardApplied: this.props.subscription && this.props.subscription.hasOwnProperty('giftCardApplied') ? this.props.subscription.giftCardApplied : '',

      secondTime: '',
      discountBeingRemoved: false,

      discountDeleteDialog: false,
      orderSummaryDialogOpen: false,

      primaryProfileBillingNew: null,
      secondaryProfilesBillingNew: null,

      deliveryAssignedTo: this.props.subscription.deliveryAssignedTo ? this.props.subscription.deliveryAssignedTo : 'unassigned',

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
        nameOnCard: {
          required: true,
        },

        postal_code: {
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

      this.setState({
        getSubscriptionDetailsLoading: true,
        paymentProfileLoading: true,

      });

      // Meteor.call('getSubscriptionDetails', this.props.subscription.authorizeSubscriptionId, (err, res) => {
      //   if (err) {
      //     console.log(err);

      //     this.setState({
      //       getSubscriptionDetailsLoading: false,
      //     });

      //   } else {
      //     console.log(res);

      //     this.setState({
      //       subscriptionDetails: res.subscription,
      //       getSubscriptionDetailsLoading: false,
      //     });
      //   }
      // });

      Meteor.call('getCustomerPaymentProfile', this.props.subscription.authorizeCustomerProfileId, this.props.subscription.authorizePaymentProfileId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);

          this.setState({
            paymentProfileLoading: false,
            paymentProfileDetails: res.paymentProfile,
          });
        }
      });
    }

    if(this.props.subscription.authorizeCustomerProfileId && this.props.subscription.authorizePaymentProfileId){
      Meteor.call('getCustomerPaymentProfile', this.props.subscription.authorizeCustomerProfileId, this.props.subscription.authorizePaymentProfileId, (err, res) => {
          if (err) {
              console.log(err);
          } else {
              console.log(res);

              this.setState({
                  paymentProfileLoading: false,
                  paymentProfileDetails: res.paymentProfile,
              });
          }
      });
    }

    this.setState({
      summaryLoading: true,
    });

    Meteor.call('customer.getBillingData', { customerId: this.props.customer._id }, (err, res) => {
      if (err) {
        console.log(err);
        this.props.popTheSnackbar({
          message: 'There was a problem fetching billing line items',
        });
        this.setState({
          summaryLoaded: true,
          summaryLoading: false,
        });

      } else {
        console.log(res);
        this.setState({
          summaryLoaded: true,
          summaryLoading: false,

          primaryProfileBilling: res.primaryProfileBilling,
          secondaryProfilesBilling: res.secondaryProfilesBilling,
        });
      }
    });
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

  onChangeGiftCards(event, { newValue }) {
    this.setState({
      giftCardSelected: newValue,
      valueGiftCards: newValue,
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

  onSuggestionSelectedGiftCards(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    let clonedRestrictions = this.state.giftCardApplied != ''
      ? this.state.giftCardApplied
      : [];

    const isThere = false;

    if (clonedRestrictions.length > 0) {
      // isThere = clonedRestrictions.filter(
      //   present => suggestion._id === present._id,
      // );
      this.props.popTheSnackbar({
        message: 'Cannot add more than one gift card',
      });
      return;
    }

    if (isThere != false) {
      return;
    }

    clonedRestrictions = suggestion.code;

    this.setState({
      hasFormChanged: true,
      giftCardSelected: clonedRestrictions,
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.

  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value),
    });
  }

  onSuggestionsFetchRequestedGiftCards({ value }) {
    this.setState({
      suggestionsGiftCards: this.getSuggestionsGiftCards(value),
    });
  }

  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: [],
    });
  }

  onSuggestionsClearRequestedGiftCards() {
    this.setState({
      suggestionsGiftCards: [],
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

  getSuggestionsGiftCards(value) {
    const inputValue = value.trim();
    const inputLength = inputValue.length;


    return inputLength === 0
      ? []
      : this.props.giftCards.filter(
        card => card.code.slice(0, inputLength) === inputValue,
      );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValueGiftCards(suggestion) {
    return suggestion.code;
  }

  renderSuggestionGiftCards(suggestion) {
    return (
      <MenuItem component="div">
        <Typography type="subheading">{suggestion.code}</Typography>
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

    Meteor.call('customer.getBillingData',
      {
        customerId: this.props.customer._id,
        discountCode: this.state.discountSelected,
        removeDiscount: this.state.discountBeingRemoved,
      }, (err, res) => {

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

  handleApplyGiftCard() {

    if (this.props.subscription.hasOwnProperty('giftCardApplied')) {
      this.props.popTheSnackbar({
        message: 'There is already a gift card present on the subscription.',
      });

      return;
    }

    const giftCardDetails = {
      code: this.state.giftCardSelected,
      customerId: this.props.customer._id,
    };

    // console.log(discountDetails)

    Meteor.call('giftcards.addToCustomer', giftCardDetails, (err, res) => {

      if (err) {
        this.props.popTheSnackbar({
          message: err.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: 'Gift card added successfully.',
        });
      }
    });
  }


  handleSaveDiscount(updateWhen) {

    const discountDetails = {
      discountCode: this.state.discountSelected,
      id: this.props.customer._id,
      updateWhen,
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
              message: 'Discount addition scheduled for friday night',
            });
          } else {
            this.props.popTheSnackbar({
              message: 'Discount added successfully.',
            });
          }

          this.setState({
            orderSummaryDialogOpen: false,
          });

        });
      }
    });
  }

  // this methods removes the discount and opens up the subscription update dialog (similar to step 2)
  handleRemoveDiscount(updateWhen) {

    const discountDetails = {
      discountCode: this.state.discountSelected,
      id: this.props.customer._id,
      removeDiscount: true,
      updateWhen,
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
              message: 'Discount removal scheduled for friday night.',
            });
          } else {
            this.props.popTheSnackbar({
              message: 'Discount removed successfully.',
            });
          }

          this.setState({
            orderSummaryDialogOpen: false,
            discountBeingRemoved: false,
          });
        });
      }
    });
  }

  openDiscountDeleteConfirmDialog(type) {

    this.openDiscountDeleteDialog();
  }

  openGiftCardRemoveConfirmDialog(type) {

    this.openGiftCardRemoveDialog();
  }

  handleRemoveDiscountConfirmed() {
    this.setState({
      discountApplied: '',
      hasFormChanged: true,
      discountBeingRemoved: true,
    }, () => {
      this.closeDiscountDeleteDialog();
      this.openOrderSummaryDialog();
    });
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

  handleTaxExemptSubmit() {

      const dataToSend = {
          subscriptionId: this.props.subscription._id,
          taxExempt: this.state.taxExempt,
      };

      console.log(dataToSend);

      Meteor.call('edit.customer.taxExempt', dataToSend, (err, res) => {
          if(err) {
              this.props.popTheSnackbar({
                  message: err || err.message || err.reason,
              })
          } else {
              this.props.popTheSnackbar({
                  message: `Successfully updated tax exempt status`
              });
          }
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

  handleDeliveryPersonnelAssignment(){
    this.setState({
      deliveryButtonLoading: true,
    })

    Meteor.call('subscriptions.assignDeliveryPersonnel', {
      deliveryPersonId: this.state.deliveryAssignedTo,
      subscriptionId: this.props.subscription._id
    }, (err, res) => {
      if(err){
        this.props.popTheSnackbar({
          message: err.reason || err,
        })
      } else {
        this.props.popTheSnackbar({
          message: 'Delivery personnel changed successfully',
        });
      }
    })
  }


  switchToExistingCard(){
      this.setState({
          switchButtonLoading: true,
      })

      Meteor.call('changePaymentMethodToExistingCard', this.props.subscription._id, (err, res) => {
          if(err){
              this.props.popTheSnackbar({
                  message: err.reason || err,
              })
          } else {
              this.props.popTheSnackbar({
                  message: 'Switched to existing card successfully',
              });
          }

          this.setState({
              dialogAddCard: false,
              switchButtonLoading: false,
              dialogEditPaymentMethod: false,
          })
      });
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
                  {this.state.paymentProfileLoading ? (
                    <CircularProgress size={30} />
                  ) : (
                      this.state.paymentMethod === 'card' && this.state.paymentProfileDetails != null && (
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
                      )
                    )}

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

                {this.state.paymentMethod === 'interac' ||
                  this.state.paymentMethod === 'cash' && (
                    <Grid container>
                      <Grid justify={'space-between'} item xs={12} md={12}>
                        <FormControlLabel
                            style={{ marginLeft: '10px' }}
                          control={
                            <Checkbox
                              value="taxExempt"
                              checked={this.state.taxExempt}
                            />
                          }
                          onChange={this.handleTaxExempt.bind(this)}
                          label="Customer is tax exempt"
                        />

                        <Button disabled={this.state.taxExempt === this.props.subscription.taxExempt} onClick={this.handleTaxExemptSubmit}>
                            Save
                        </Button>
                      </Grid>
                    </Grid>
                  )}

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
                          onDelete={this.openDiscountDeleteConfirmDialog.bind(
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

                <Grid item xs={12}>
                  <Typography type="headline" style={{ margin: '25px 0', display: 'flex', alignItems: 'center' }}>Gift card</Typography>
                  <Typography type="body1">Configure the gift card balance before applying</Typography>
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
                        suggestions={this.state.suggestionsGiftCards}
                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedGiftCards.bind(
                          this,
                        )}
                        onSuggestionsClearRequested={this.onSuggestionsClearRequestedGiftCards.bind(
                          this,
                        )}
                        onSuggestionSelected={this.onSuggestionSelectedGiftCards.bind(
                          this,
                        )}
                        getSuggestionValue={this.getSuggestionValueGiftCards.bind(
                          this,
                        )}
                        renderSuggestion={this.renderSuggestionGiftCards.bind(this)}
                        renderSuggestionsContainer={this.renderSuggestionsContainerTypes.bind(
                          this,
                        )}
                        focusInputOnSuggestionClick={false}
                        inputProps={{
                          placeholder: 'Search',
                          value: this.state.valueGiftCards,
                          onChange: this.onChangeGiftCards.bind(this),
                          className: 'auto type-autocomplete',
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        onClick={this.handleApplyGiftCard}
                        disabled={this.state.giftCardApplied.length > 0 || this.state.giftCardSelected == ''}
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
                    {this.state.giftCardApplied != '' ? (
                      _.filter(this.props.giftCards, u => u._id == this.state.giftCardApplied).map((e, i) => (
                        <Chip
                          style={{ marginRight: '8px', marginBottom: '8px' }}
                          label={`${e.code}`}
                          key={i}
                          onDelete={this.openGiftCardRemoveConfirmDialog.bind(
                            this,
                            e,
                          )}
                        />
                      ))
                    ) : (
                        <Chip className="chip--bordered" label="Gift card" />
                      )}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Typography type="headline" style={{ margin: '25px 0', display: 'flex', alignItems: 'center' }}>
                    Delivered by
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <RadioGroup
                    onChange={e => this.setState({ deliveryAssignedTo: e.currentTarget.value, hasDeliveryChanged: true, })}
                    value={this.state.deliveryAssignedTo}
                  >
                    <FormControlLabel
                      key={0}
                      value={'unassigned'}
                      control={<Radio />}
                      label={'Unassigned'}
                    />
                    {!this.props.loading && this.props.deliveryGuys.map((e, index) => (
                      <FormControlLabel
                        key={e._id}
                        value={e._id}
                        control={<Radio />}
                        label={e.profile.name.first}
                      />
                    ))}
                  </RadioGroup>
                  <Button disabled={!this.state.hasDeliveryChanged} onClick={this.handleDeliveryPersonnelAssignment}> Save</Button>
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
                    <Button onClick={this.closeDiscountDeleteDialog} color="primary">No</Button>
                    <Button onClick={this.handleRemoveDiscountConfirmed} color="primary" autoFocus>Yes</Button>

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

                    {this.props.subscription.authorizeCustomerProfileId && this.props.subscription.authorizePaymentProfileId && (
                        <div>
                          {this.state.paymentProfileLoading ? (
                              <CircularProgress size={30} />
                          ) : (
                              this.state.paymentProfileDetails !== null && (
                                <div>
                                <Typography type="subheading" style={{ marginBottom: "1em" }}>Existing</Typography>
                                <Card>
                                    <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                            <div>
                                              {this.state.paymentProfileDetails.payment.creditCard.cardType == 'Visa' && (<img width="80" src="/visa.svg" />)}

                                              {this.state.paymentProfileDetails.payment.creditCard.cardType == 'Mastercard' && (<img width="80" src="/mastercard.svg" />)}

                                              {this.state.paymentProfileDetails.payment.creditCard.cardType == 'AmericanExpress' && (<img width="80" src="/amex.svg" />)}

                                              {this.state.paymentProfileDetails.payment.creditCard.cardType == 'Discover' && (<img width="80" src="/discover.svg" />)}

                                              {this.state.paymentProfileDetails.payment.creditCard.cardType == 'JCB' && (<img width="80" src="/jcb.svg" />)}

                                              {this.state.paymentProfileDetails.payment.creditCard.cardType == 'DinersClub' && (<img width="80" src="/diners.svg" />)}
                                            </div>
                                          <div style={{ marginLeft: '10px' }}>
                                              <Typography type="body2">{this.state.paymentProfileDetails.billTo.firstName} {this.state.paymentProfileDetails.billTo.lastName || ''}</Typography>
                                              <Typography type="body2">{this.state.paymentProfileDetails.payment.creditCard.cardNumber} {this.state.paymentProfileDetails.payment.creditCard.expirationDate}</Typography>
                                              {/*<Typography type="body2"></Typography>*/}
                                          </div>
                                        </div>
                                        <Button
                                            disabled={this.state.switchButtonLoading}
                                            raised
                                            className={`${buttonClassname}`}
                                            onClick={this.switchToExistingCard}
                                        >
                                            Switch
                                            {this.state.switchButtonLoading && (
                                                <CircularProgress
                                                    size={24}
                                                    className={this.props.classes.buttonProgress}
                                                />
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                              </div>)
                          )}
                        </div>
                    )}


                    <Typography style={{ marginTop: "25px" }} type="subheading">Add new</Typography>

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
              </Grid>


            </Paper>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Paper elevation={2} className="paper-for-fields">

              {this.state.summaryLoading && (<CircularProgress size={30} />)}

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
                      {this.state.primaryProfileBilling ? this.state.primaryProfileBilling.lifestyle.title : ''}
                    </Typography>

                    <Grid container>
                      <Grid item xs={6}>
                        <Typography type="subheading">
                          {this.state.primaryProfileBilling
                            ? `${this.state.primaryProfileBilling.breakfast.totalQty +
                            this.state.primaryProfileBilling.lunch.totalQty +
                            this.state.primaryProfileBilling.dinner.totalQty +
                            this.state.primaryProfileBilling.chefsChoiceBreakfast.totalQty +
                            this.state.primaryProfileBilling.chefsChoiceLunch.totalQty +
                            this.state.primaryProfileBilling.chefsChoiceDinner.totalQty} meals`
                            : ''}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          type="subheading"
                          style={{ textAlign: 'right' }}
                        >
                          ${this.state.primaryProfileBilling
                            ? parseFloat(this.state.primaryProfileBilling.breakfast.totalQty * this.state.primaryProfileBilling.breakfastPrice +
                            this.state.primaryProfileBilling.lunch.totalQty * this.state.primaryProfileBilling.lunchPrice +
                            this.state.primaryProfileBilling.dinner.totalQty * this.state.primaryProfileBilling.dinnerPrice +
                            this.state.primaryProfileBilling.chefsChoiceBreakfast.totalQty * this.state.primaryProfileBilling.chefsChoiceBreakfastPrice +
                            this.state.primaryProfileBilling.chefsChoiceLunch.totalQty * this.state.primaryProfileBilling.chefsChoiceLunchPrice +
                            this.state.primaryProfileBilling.chefsChoiceDinner.totalQty * this.state.primaryProfileBilling.chefsChoiceDinnerPrice).toFixed(2) : ''}
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
                              -${parseFloat(this.state.primaryProfileBilling.discountActual).toFixed(2)}{' '}
                            </Typography>
                          </Grid>

                        </Grid>
                      ) : (
                        ''
                      )}

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
                              ${parseFloat(this.state.primaryProfileBilling.totalAthleticSurcharge).toFixed(2)}{' '}
                              ({this.state.primaryProfileBilling.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount' ? '$' : ''}
                              {parseFloat(this.state.primaryProfileBilling.lifestyle.extraAthletic).toFixed(2)}
                              {this.state.primaryProfileBilling.lifestyle.discountOrExtraTypeAthletic === 'Percentage' ? '%' : ''})
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
                              ${parseFloat(this.state.primaryProfileBilling.totalBodybuilderSurcharge).toFixed(2)}{' '}
                              ({this.state.primaryProfileBilling.lifestyle
                                .discountOrExtraTypeBodybuilder === 'Fixed amount' ? '$' : ''}
                              {parseFloat(this.state.primaryProfileBilling.lifestyle.extraBodybuilder).toFixed(2)}
                              {this.state.primaryProfileBilling.lifestyle.discountOrExtraTypeBodybuilder === 'Percentage' ? '%' : ''})
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
                                {e.title}
                                  {e.discountOrExtraType && (
                                      <span>
                                        (
                                            {e.discountOrExtraType === 'Fixed amount' ? '$' : ''}
                                            {parseFloat(e.extra).toFixed(2)}
                                            {e.discountOrExtraType === 'Percentage' ? '%' : ''}
                                        )
                                      </span>
                                  )}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                type="subheading"
                                style={{ textAlign: 'right' }}
                              >
                                ${this.state.primaryProfileBilling.restrictionsSurcharges[i] === 0 ? '0' : parseFloat(this.state.primaryProfileBilling.restrictionsSurcharges[i]).toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                        ),
                      )
                      : ''}

                      {this.state.primaryProfileBilling && (
                          this.state.primaryProfileBilling.sides && this.state.primaryProfileBilling.sides.length > 0 && (
                              <React.Fragment>
                                  <Grid container>
                                      <Grid item xs={12}>
                                          <Typography
                                              type="body2"
                                              style={{
                                                  marginTop: '.75em',
                                                  marginBottom: '.75em',
                                              }}
                                          >
                                              SIDES
                                          </Typography>
                                      </Grid>
                                  </Grid>
                                  <Grid container>
                                      {this.state.primaryProfileBilling.sides.map(side => {
                                          return (
                                              <React.Fragment>
                                                  <Grid item xs={12} sm={6}>
                                                      <Typography type="subheading">
                                                          {side.title}
                                                      </Typography>
                                                      <Typography type="body1">
                                                          {side.variantTitle} x{side.quantity}
                                                      </Typography>
                                                  </Grid>

                                                  <Grid item xs={12} sm={6}>
                                                      <Typography
                                                          type="subheading"
                                                          style={{ textAlign: 'right' }}
                                                      >
                                                          ${side.lineItemPrice}
                                                      </Typography>
                                                  </Grid>
                                              </React.Fragment>
                                          );
                                      })}

                                  </Grid>
                              </React.Fragment>
                          )
                      )}
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
                                {`${e.breakfast.totalQty + e.lunch.totalQty + e.dinner.totalQty +
                                  e.chefsChoiceBreakfast.totalQty + e.chefsChoiceLunch.totalQty + e.chefsChoiceDinner.totalQty} meals`}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                type="subheading"
                                style={{ textAlign: 'right' }}
                              >
                                ${parseFloat(e.breakfast.totalQty * e.breakfastPrice +
                                  e.lunch.totalQty * e.lunchPrice +
                                  e.dinner.totalQty * e.dinnerPrice +
                                  e.chefsChoiceBreakfast.totalQty * e.chefsChoiceBreakfastPrice +
                                  e.chefsChoiceLunch.totalQty * e.chefsChoiceLunchPrice +
                                  e.chefsChoiceDinner.totalQty * e.chefsChoiceDinnerPrice).toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>

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
                                    -${parseFloat(e.discountActual).toFixed(2)}{' '}
                                  </Typography>
                                </Grid>

                              </Grid>
                            )}

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
                                  ${parseFloat(e.totalAthleticSurcharge).toFixed(2)} ({e.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount' ? '$' : ''}
                                  {parseFloat(e.lifestyle.extraAthletic).toFixed(2)}
                                  {e.lifestyle.discountOrExtraTypeAthletic === 'Percentage' ? '%' : ''})
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
                                  ${parseFloat(e.totalBodybuilderSurcharge).toFixed(2)} ({e
                                    .lifestyle
                                    .discountOrExtraTypeBodybuilder ===
                                    'Fixed amount'
                                    ? '$'
                                    : ''}
                                  {parseFloat(e.lifestyle.extraBodybuilder).toFixed(2)}
                                  {e.lifestyle
                                    .discountOrExtraTypeBodybuilder ===
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
                                    {el.title}

                                      {el.discountOrExtraType && (
                                          <span>
                                            (
                                              {el.discountOrExtraType ===
                                                  'Fixed amount'
                                                  ? '$'
                                                  : ''}
                                                {parseFloat(el.extra).toFixed(2)}
                                                {el.discountOrExtraType === 'Percentage'
                                                  ? '%'
                                                  : ''}
                                            )
                                          </span>
                                      )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: 'right' }}
                                  >
                                    ${parseFloat(e.restrictionsSurcharges[ind]).toFixed(2)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            ))}

                            {e.sides && e.sides.length > 0 && (
                                    <React.Fragment>
                                        <Grid container>
                                            <Grid item xs={12}>
                                                <Typography
                                                    type="body2"
                                                    style={{
                                                        marginTop: '.75em',
                                                        marginBottom: '.75em',
                                                    }}
                                                >
                                                    SIDES
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container>
                                            {e.sides.map(side => {
                                                return (
                                                    <React.Fragment>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography type="subheading">
                                                                {side.title}
                                                            </Typography>
                                                            <Typography type="body1">
                                                                {side.variantTitle} x{side.quantity}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid item xs={12} sm={6}>
                                                            <Typography
                                                                type="subheading"
                                                                style={{ textAlign: 'right' }}
                                                            >
                                                                ${side.lineItemPrice}
                                                            </Typography>
                                                        </Grid>
                                                    </React.Fragment>
                                                );
                                            })}

                                        </Grid>
                                    </React.Fragment>
                            )}

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
                    <Grid container style={{ marginTop: '1em' }}>
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
                            ? `$${parseFloat(this.state.primaryProfileBilling.deliveryCost).toFixed(2)}`
                            : 'Free'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling.deliverySurcharges > 0 && (
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
                                ? `$${parseFloat(this.state.primaryProfileBilling.deliverySurcharges).toFixed(2)}`
                                : ''}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                      {this.state.primaryProfileBilling && (
                    this.state.primaryProfileBilling.discountTotal > 0 && !this.state.discountBeingRemoved
                      && this.props.subscription.hasOwnProperty('discountApplied') ? (
                        <div style={{ marginTop: '25px' }}>
                          <Grid container>
                            <Grid item xs={12}>
                              <Typography type="title">Discount</Typography>
                            </Grid>
                          </Grid>
                          <Grid container>
                            <Grid item xs={12} sm={6}>
                              <Typography type="body2">
                                {this.props.discounts && this.state.discountApplied && this.props.discounts.find(e => this.props.subscription.discountApplied === e._id) &&
                                this.props.discounts.find(e => this.props.subscription.discountApplied === e._id).title}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                type="subheading"
                                style={{ textAlign: 'right' }}
                              >
                                -${
                                  parseFloat(this.state.primaryProfileBilling.discountTotal).toFixed(2)
                                }{' '}
                              </Typography>
                            </Grid>
                          </Grid>
                        </div>
                      ) : ''
                    )}

                    {this.state.primaryProfileBilling && (
                        this.state.primaryProfileBilling.validReferralCodePresent ? (
                            <div style={{ marginTop: '25px' }}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography type="title">Referral code</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Grid item xs={12} sm={6}>
                                        <Typography type="body2">{this.props.subscription.referralCodeApplied}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography
                                            type="subheading"
                                            style={{ textAlign: 'right' }}
                                        >
                                            -$20
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </div>
                        ) : ''
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
                      <div>
                          <Button
                              color="inherit"
                              onClick={() => this.state.discountBeingRemoved ? this.handleRemoveDiscount('now') : this.handleSaveDiscount('now')}
                          >
                              Update now
                          </Button>
                          <Button
                              color="inherit"
                              onClick={() => this.state.discountBeingRemoved ? this.handleRemoveDiscount('friday') : this.handleSaveDiscount('friday')}
                          >
                              Schedule for friday night
                          </Button>
                      </div>

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
                    discountBeingRemoved={this.state.discountBeingRemoved}
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
