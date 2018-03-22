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
import Geosuggest from 'react-geosuggest';
import './GeoSuggest.scss';

import Payment from 'payment';

import Checkbox from 'material-ui/Checkbox';
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from 'material-ui/Form';

import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import green from 'material-ui/colors/green';

import _ from 'lodash';
import $ from 'jquery';
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

class Step4Checkout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,
      paymentMethod: 'card',
      taxExempt: false,
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
        nameOnCard: {
          required: true,
        },

        cardNumber: {
          required: true,
        },

        expiry: {
          required: true,
        },

        cvc: {
          required: true,
        },

        billingPostalCode: {
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

    Payment.formatCardNumber(document.querySelector('#cardNumber'));
    Payment.formatCardExpiry(document.querySelector('#expiry'));
    Payment.formatCardCVC(document.querySelector('#cvc'));

    /*
    * The best way to refactor the below bill calculator is to separate it
    * into a billing module which can be imported here instead.
    */

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeStep === 3) {

      const primaryCustomer = {
        lifestyle: '',
        breakfastPrice: 0,
        lunchPrice: 0,
        dinnerPrice: 0,
        breakfast: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        lunch: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        dinner: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        // coolerBag: this.props.customerInfo.coolerBag ? 20 : 0,
        coolerBag: 0,
        deliveryCost: 0,
        discount: this.props.customerInfo.discount,
        discountActual: 0,
        restrictions: this.props.customerInfo.restrictions,
        restrictionsActual: [],
        restrictionsSurcharges: [],
        specificRestrictions: this.props.customerInfo.specificRestrictions,
        specificRestrictionsActual: [],
        specificRestrictionsSurcharges: [],
        preferences: this.props.customerInfo.subIngredients,
        totalAthleticSurcharge: 0,
        totalBodybuilderSurcharge: 0,
        deliverySurcharges: 0,
      };

      const secondaryCustomers = [];

      primaryCustomer.lifestyle = this.props.lifestyles.find(
        elem => elem.title === this.props.customerInfo.lifestyle,
      );

      // calculating basePrices for Breakfast, lunch and dinner

      let metCriteria = 0;
      const customerScheduleTotals = [];
      const secondaryCustomerTotals = [];

      // calculating total quantities and extra quantities and regular quantites
      this.props.customerInfo.scheduleReal.forEach((e, i) => {
        let thisDaysQty = 0;

        if (e.breakfast.active) {
          primaryCustomer.breakfast.totalQty =
            primaryCustomer.breakfast.totalQty +
            parseInt(e.breakfast.quantity, 10);

          if (e.breakfast.portions == 'regular') {
            primaryCustomer.breakfast.regularQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          } else if (e.breakfast.portions == 'athletic') {
            primaryCustomer.breakfast.athleticQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          } else if ((e.breakfast.portions = 'bodybuilder')) {
            primaryCustomer.breakfast.bodybuilderQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          }

          thisDaysQty += parseInt(e.breakfast.quantity, 10);
        }

        if (e.lunch.active) {
          primaryCustomer.lunch.totalQty =
            primaryCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

          if (e.lunch.portions == 'regular') {
            primaryCustomer.lunch.regularQty += parseInt(e.lunch.quantity, 10);
          } else if (e.lunch.portions == 'athletic') {
            primaryCustomer.lunch.athleticQty += parseInt(e.lunch.quantity, 10);
          } else if ((e.lunch.portions = 'bodybuilder')) {
            primaryCustomer.lunch.bodybuilderQty += parseInt(
              e.lunch.quantity,
              10,
            );
          }

          thisDaysQty += parseInt(e.lunch.quantity, 10);
        }

        if (e.dinner.active) {
          primaryCustomer.dinner.totalQty =
            primaryCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

          if (e.dinner.portions == 'regular') {
            primaryCustomer.dinner.regularQty += parseInt(e.dinner.quantity, 10);
          } else if (e.dinner.portions == 'athletic') {
            primaryCustomer.dinner.athleticQty += parseInt(e.dinner.quantity, 10);
          } else if ((e.dinner.portions = 'bodybuilder')) {
            primaryCustomer.dinner.bodybuilderQty += parseInt(
              e.dinner.quantity,
              10,
            );
          }

          thisDaysQty += parseInt(e.dinner.quantity, 10);
        }

        customerScheduleTotals.push(thisDaysQty);
      });

      console.log(customerScheduleTotals);

      if (
        customerScheduleTotals[0] >= 2 &&
        customerScheduleTotals[1] >= 2 &&
        customerScheduleTotals[2] >= 2 &&
        customerScheduleTotals[3] >= 2 &&
        customerScheduleTotals[4] >= 2
      ) {
        metCriteria += 1;
      }

      console.log('met criteria after primary customer');
      console.log(metCriteria);

      if (this.props.customerInfo.secondaryProfileCount > 0) {
        this.props.customerInfo.secondaryProfiles.forEach((el, index) => {
          let currentProfileQtys;

          currentProfileQtys = el.scheduleReal.map((e, i) => {
            let thisDaysQty = 0;

            if (e.breakfast.active) {
              thisDaysQty += parseInt(e.breakfast.quantity, 10);
            }

            if (e.lunch.active) {
              thisDaysQty += parseInt(e.lunch.quantity, 10);
            }

            if (e.dinner.active) {
              thisDaysQty += parseInt(e.dinner.quantity, 10);
            }

            return thisDaysQty;
          });

          secondaryCustomerTotals.push(currentProfileQtys);
        });
      }

      console.log('Secondary customer totals');
      console.log(secondaryCustomerTotals);

      secondaryCustomerTotals.forEach((e, i) => {
        if (e[0] >= 2 && e[1] >= 2 && e[2] >= 2 && e[3] >= 2 && e[4] >= 2) {
          metCriteria += 1;
        }
      });

      console.log('met criteria after secondary customers');
      console.log(metCriteria);

      const numberOfProfiles = this.props.customerInfo.secondaryProfileCount;

      if (metCriteria > 0) {
        metCriteria -= 1;
      }

      primaryCustomer.breakfastPrice =
        primaryCustomer.lifestyle.prices.breakfast[metCriteria];

      primaryCustomer.lunchPrice =
        primaryCustomer.lifestyle.prices.lunch[metCriteria];

      primaryCustomer.dinnerPrice =
        primaryCustomer.lifestyle.prices.dinner[metCriteria];

      // total base price based on per meal type base price, (before restrictions and extras and discounts)
      primaryCustomer.baseMealPriceTotal =
        primaryCustomer.breakfast.totalQty * primaryCustomer.breakfastPrice +
        primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
        primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

      // discounted basePrice -- this is the actual base price to add up in the total

      if (primaryCustomer.discount == 'senior') {
        let discountAmount = 0;

        if (primaryCustomer.lifestyle.discountOrExtraTypeSenior == 'Percentage') {
          discountAmount =
            primaryCustomer.lifestyle.discountSenior /
            100 *
            primaryCustomer.baseMealPriceTotal;
        }

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeSenior == 'Fixed amount'
        ) {
          discountAmount = primaryCustomer.lifestyle.discountSenior;
        }

        primaryCustomer.discountActual = discountAmount;
      }

      if (primaryCustomer.discount == 'student') {
        let discountAmount = 0;

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeStudent == 'Percentage'
        ) {
          discountAmount =
            primaryCustomer.lifestyle.discountStudent /
            100 *
            primaryCustomer.baseMealPriceTotal;
        }

        if (
          primaryCustomer.lifestyle.discountOrExtraTypeStudent == 'Fixed amount'
        ) {
          discountAmount = primaryCustomer.lifestyle.discountStudent;
        }

        primaryCustomer.discountActual = discountAmount;
      }

      // calculating restrictions and specificRestrictions surcharges
      if (primaryCustomer.restrictions.length > 0) {
        primaryCustomer.restrictions.forEach((e, i) => {
          primaryCustomer.restrictionsActual.push(
            this.props.restrictions.find(elem => elem._id === e),
          );
        });

        primaryCustomer.restrictionsActual.forEach((e, i) => {
          console.log(e);
          if (e.hasOwnProperty('extra')) {
            let totalRestrictionsSurcharge = 0;
            console.log(e);

            const totalBaseMealsCharge =
              primaryCustomer.breakfast.totalQty *
              primaryCustomer.breakfastPrice +
              primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
              primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

            if (e.discountOrExtraType == 'Percentage') {
              totalRestrictionsSurcharge = e.extra / 100 * totalBaseMealsCharge;
            }

            if (e.discountOrExtraType == 'Fixed amount') {
              totalRestrictionsSurcharge =
                (primaryCustomer.breakfast.totalQty +
                  primaryCustomer.lunch.totalQty +
                  primaryCustomer.dinner.totalQty) *
                e.extra;
            }

            primaryCustomer.restrictionsSurcharges.push(
              totalRestrictionsSurcharge,
            );
          } else {
            primaryCustomer.restrictionsSurcharges.push(0);
          }
        });
      }

      if (primaryCustomer.specificRestrictions.length > 0) {
        primaryCustomer.specificRestrictions.forEach((e, i) => {
          console.log(e);
          primaryCustomer.specificRestrictionsActual.push(
            this.props.ingredients.find(elem => elem._id === e._id),
          );
        });

        // primaryCustomer.specificRestrictionsActual.forEach((e, i) => {
        //   if (e.hasOwnProperty("extra")) {
        //     let totalSurcharges = 0;
        //     console.log(e);

        //     const totalBaseMealsCharge =
        //       primaryCustomer.breakfast.totalQty *
        //         primaryCustomer.breakfastPrice +
        //       primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
        //       primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

        //     if (e.discountOrExtraType == "Percentage") {
        //       totalSurcharges = e.extra / 100 * totalBaseMealsCharge;
        //     }

        //     if (e.discountOrExtraType == "Fixed amount") {
        //       totalSurcharges =
        //         (primaryCustomer.breakfast.totalQty +
        //           primaryCustomer.lunch.totalQty +
        //           primaryCustomer.dinner.totalQty) *
        //         e.extra;
        //     }

        //     primaryCustomer.specificRestrictionsSurcharges.push(totalSurcharges);
        //   } else {
        //     primaryCustomer.specificRestrictionsSurcharges.push(0);
        //   }
        // });
      }

      // calculating athletic surcharge for all meals
      if (
        primaryCustomer.breakfast.athleticQty > 0 ||
        primaryCustomer.lunch.athleticQty > 0 ||
        primaryCustomer.dinner.athleticQty > 0
      ) {
        let totalAthleticSurcharge = 0;

        if (primaryCustomer.breakfast.athleticQty > 0) {
          if (
            primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
          ) {
            const extraAthleticPerBreakfast =
              primaryCustomer.lifestyle.extraAthletic /
              100 *
              primaryCustomer.breakfastPrice;

            totalAthleticSurcharge +=
              primaryCustomer.breakfast.athleticQty * extraAthleticPerBreakfast;
          }

          if (
            primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Fixed amount'
          ) {
            totalAthleticSurcharge +=
              primaryCustomer.breakfast.athleticQty *
              primaryCustomer.lifestyle.extraAthletic;
          }
        }

        if (primaryCustomer.lunch.athleticQty > 0) {
          if (
            primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
          ) {
            const extraAthleticPerLunch =
              primaryCustomer.lifestyle.extraAthletic /
              100 *
              primaryCustomer.lunchPrice;

            totalAthleticSurcharge +=
              primaryCustomer.lunch.athleticQty * extraAthleticPerLunch;
          }

          if (
            primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Fixed amount'
          ) {
            totalAthleticSurcharge +=
              primaryCustomer.lunch.athleticQty *
              primaryCustomer.lifestyle.extraAthletic;
          }
        }

        if (primaryCustomer.dinner.athleticQty > 0) {
          if (
            primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
          ) {
            const extraAthleticPerDinner =
              primaryCustomer.lifestyle.extraAthletic /
              100 *
              primaryCustomer.dinnerPrice;

            totalAthleticSurcharge +=
              primaryCustomer.dinner.athleticQty * extraAthleticPerDinner;
          }

          if (
            primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Fixed amount'
          ) {
            totalAthleticSurcharge +=
              primaryCustomer.breakfast.athleticQty *
              primaryCustomer.lifestyle.extraAthletic;
          }
        }

        primaryCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
      }

      // calculating bodybuilder surcharge for all meals
      if (
        primaryCustomer.breakfast.bodybuilderQty > 0 ||
        primaryCustomer.lunch.bodybuilderQty > 0 ||
        primaryCustomer.dinner.bodybuilderQty > 0
      ) {
        let totalBodybuilderSurcharge = 0;

        if (primaryCustomer.breakfast.bodybuilderQty > 0) {
          if (
            primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
            'Percentage'
          ) {
            const extraBodybuilderPerBreakfast =
              primaryCustomer.lifestyle.extraBodybuilder /
              100 *
              primaryCustomer.breakfastPrice;

            totalBodybuilderSurcharge +=
              primaryCustomer.breakfast.bodybuilderQty *
              extraBodybuilderPerBreakfast;
          }

          if (
            primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
            'Fixed amount'
          ) {
            totalBodybuilderSurcharge +=
              primaryCustomer.breakfast.athleticQty *
              primaryCustomer.lifestyle.extraBodybuilder;
          }
        }

        if (primaryCustomer.lunch.bodybuilderQty > 0) {
          const extraBodybuilderPerLunch =
            primaryCustomer.lifestyle.extraBodybuilder /
            100 *
            primaryCustomer.lunchPrice;

          totalBodybuilderSurcharge +=
            primaryCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
        }

        if (primaryCustomer.dinner.bodybuilderQty > 0) {
          const extraBodybuilderPerDinner =
            primaryCustomer.lifestyle.extraBodybuilder /
            100 *
            primaryCustomer.dinnerPrice;

          totalBodybuilderSurcharge +=
            primaryCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
        }

        primaryCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
      }

      console.log(primaryCustomer);

      // all of the above for all the secondary profiles
      if (this.props.customerInfo.secondaryProfileCount > 0) {
        this.props.customerInfo.secondaryProfiles.forEach((el, index) => {
          const currentCustomer = {
            lifestyle: '',

            breakfastPrice: 0,
            lunchPrice: 0,
            dinnerPrice: 0,
            breakfast: {
              totalQty: 0,
              regularQty: 0,
              athleticQty: 0,
              bodybuilderQty: 0,
            },
            lunch: {
              totalQty: 0,
              regularQty: 0,
              athleticQty: 0,
              bodybuilderQty: 0,
            },
            dinner: {
              totalQty: 0,
              regularQty: 0,
              athleticQty: 0,
              bodybuilderQty: 0,
            },
            deliveryCost: 0,
            discount: this.props.customerInfo.secondaryProfiles[index].discount,
            discountActual: 0,
            restrictions: this.props.customerInfo.secondaryProfiles[index]
              .restrictions,
            restrictionsActual: [],
            restrictionsSurcharges: [],
            specificRestrictions: this.props.customerInfo.secondaryProfiles[index]
              .specificRestrictions,
            specificRestrictionsActual: [],
            specificRestrictionsSurcharges: [],
            preferences: this.props.customerInfo.secondaryProfiles[index]
              .subIngredients,
            totalAthleticSurcharge: 0,
            totalBodybuilderSurcharge: 0,
          };

          // the lifestyle for the current secondarycustomer
          currentCustomer.lifestyle = this.props.lifestyles.find(
            elem => elem.title === el.lifestyle,
          );

          // calculating basePrices for Breakfast, lunch and dinner
          // const numberOfProfiles = this.props.customerInfo.secondaryProfileCount;

          currentCustomer.breakfastPrice =
            currentCustomer.lifestyle.prices.breakfast[metCriteria];

          currentCustomer.lunchPrice =
            currentCustomer.lifestyle.prices.lunch[metCriteria];

          currentCustomer.dinnerPrice =
            currentCustomer.lifestyle.prices.dinner[metCriteria];

          el.scheduleReal.forEach((e, i) => {
            if (e.breakfast.active) {
              currentCustomer.breakfast.totalQty =
                currentCustomer.breakfast.totalQty +
                parseInt(e.breakfast.quantity, 10);

              if (e.breakfast.portions == 'regular') {
                currentCustomer.breakfast.regularQty += parseInt(
                  e.breakfast.quantity,
                  10,
                );
              } else if (e.breakfast.portions == 'athletic') {
                currentCustomer.breakfast.athleticQty += parseInt(
                  e.breakfast.quantity,
                  10,
                );
              } else if ((e.breakfast.portions = 'bodybuilder')) {
                currentCustomer.breakfast.bodybuilderQty += parseInt(
                  e.breakfast.quantity,
                  10,
                );
              }
            }

            if (e.lunch.active) {
              currentCustomer.lunch.totalQty =
                currentCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

              if (e.lunch.portions == 'regular') {
                currentCustomer.lunch.regularQty += parseInt(
                  e.lunch.quantity,
                  10,
                );
              } else if (e.lunch.portions == 'athletic') {
                currentCustomer.lunch.athleticQty += parseInt(
                  e.lunch.quantity,
                  10,
                );
              } else if ((e.lunch.portions = 'bodybuilder')) {
                currentCustomer.lunch.bodybuilderQty += parseInt(
                  e.lunch.quantity,
                  10,
                );
              }
            }

            if (e.dinner.active) {
              currentCustomer.dinner.totalQty =
                currentCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

              if (e.dinner.portions == 'regular') {
                currentCustomer.dinner.regularQty += parseInt(
                  e.dinner.quantity,
                  10,
                );
              } else if (e.dinner.portions == 'athletic') {
                currentCustomer.dinner.athleticQty += parseInt(
                  e.dinner.quantity,
                  10,
                );
              } else if ((e.dinner.portions = 'bodybuilder')) {
                currentCustomer.dinner.bodybuilderQty += parseInt(
                  e.dinner.quantity,
                  10,
                );
              }
            }
          });

          // total base price based on per meal type base price, (before restrictions and extras and discounts)
          currentCustomer.baseMealPriceTotal =
            currentCustomer.breakfast.totalQty * currentCustomer.breakfastPrice +
            currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
            currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

          // discounted basePrice -- this is the actual base price to add up in the total
          if (currentCustomer.discount == 'senior') {
            let discountAmount = 0;

            if (
              currentCustomer.lifestyle.discountOrExtraTypeSenior == 'Percentage'
            ) {
              discountAmount =
                currentCustomer.lifestyle.discountSenior /
                100 *
                currentCustomer.baseMealPriceTotal;
            }

            if (
              currentCustomer.lifestyle.discountOrExtraTypeSenior ==
              'Fixed amount'
            ) {
              discountAmount = currentCustomer.lifestyle.discountSenior;
            }

            currentCustomer.discountActual = discountAmount;
          }

          if (currentCustomer.discount == 'student') {
            let discountAmount = 0;

            if (
              currentCustomer.lifestyle.discountOrExtraTypeStudent == 'Percentage'
            ) {
              discountAmount =
                currentCustomer.lifestyle.discountStudent /
                100 *
                currentCustomer.baseMealPriceTotal;
            }

            if (
              currentCustomer.lifestyle.discountOrExtraTypeStudent ==
              'Fixed amount'
            ) {
              discountAmount = currentCustomer.lifestyle.discountStudent;
            }

            currentCustomer.discountActual = discountAmount;
          }

          // calculating restrictions and specificRestrictions surcharges
          if (currentCustomer.restrictions.length > 0) {
            currentCustomer.restrictions.forEach((e, i) => {
              currentCustomer.restrictionsActual.push(
                this.props.restrictions.find(elem => elem._id === e),
              );
            });

            currentCustomer.restrictionsActual.forEach((e, i) => {
              if (e.hasOwnProperty('extra')) {
                let totalRestrictionsSurcharge = 0;
                console.log(e);

                const totalBaseMealsCharge =
                  currentCustomer.breakfast.totalQty *
                  currentCustomer.breakfastPrice +
                  currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
                  currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

                if (e.discountOrExtraType == 'Percentage') {
                  totalRestrictionsSurcharge =
                    e.extra / 100 * totalBaseMealsCharge;
                }

                if (e.discountOrExtraType == 'Fixed amount') {
                  totalRestrictionsSurcharge =
                    (currentCustomer.breakfast.totalQty +
                      currentCustomer.lunch.totalQty +
                      currentCustomer.dinner.totalQty) *
                    e.extra;
                }

                console.log(totalRestrictionsSurcharge);

                currentCustomer.restrictionsSurcharges.push(
                  totalRestrictionsSurcharge,
                );
              } else {
                currentCustomer.restrictionsSurcharges.push(0);
              }
            });
          }

          console.log(currentCustomer.restrictionsSurcharges);

          if (currentCustomer.specificRestrictions.length > 0) {
            currentCustomer.specificRestrictions.forEach((e, i) => {
              currentCustomer.specificRestrictionsActual.push(
                this.props.ingredients.find(elem => elem._id === e._id),
              );
            });

            // currentCustomer.specificRestrictionsActual.forEach((e, i) => {
            //   if (e.hasOwnProperty("extra")) {
            //     let totalRestrictionsSurcharge = 0;
            //     console.log(e);

            //     const totalBaseMealsCharge =
            //       currentCustomer.breakfast.totalQty *
            //         currentCustomer.breakfastPrice +
            //       currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
            //       currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

            //     if (e.discountOrExtraType == "Percentage") {
            //       totalRestrictionsSurcharge =
            //         e.extra / 100 * totalBaseMealsCharge;
            //     }

            //     if (e.discountOrExtraType == "Fixed amount") {
            //       totalRestrictionsSurcharge =
            //         (currentCustomer.breakfast.totalQty +
            //           currentCustomer.lunch.totalQty +
            //           currentCustomer.dinner.totalQty) *
            //         e.extra;
            //     }

            //     console.log(totalRestrictionsSurcharge);

            //     currentCustomer.specificRestrictionsSurcharges.push(
            //       totalRestrictionsSurcharge
            //     );
            //   } else {
            //     currentCustomer.specificrestrictionsSurcharges.push(0);
            //   }
            // });
          }

          // calculating athletic surcharge for all meals
          if (
            currentCustomer.breakfast.athleticQty > 0 ||
            currentCustomer.lunch.athleticQty > 0 ||
            currentCustomer.dinner.athleticQty > 0
          ) {
            let totalAthleticSurcharge = 0;

            if (currentCustomer.breakfast.athleticQty > 0) {
              if (
                currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
                'Percentage'
              ) {
                const extraAthleticPerBreakfast =
                  currentCustomer.lifestyle.extraAthletic /
                  100 *
                  currentCustomer.breakfastPrice;

                totalAthleticSurcharge +=
                  currentCustomer.breakfast.athleticQty *
                  extraAthleticPerBreakfast;
              }

              if (
                currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
                'Fixed amount'
              ) {
                totalAthleticSurcharge +=
                  currentCustomer.breakfast.athleticQty *
                  currentCustomer.lifestyle.extraAthletic;
              }
            }

            if (currentCustomer.lunch.athleticQty > 0) {
              if (
                currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
                'Percentage'
              ) {
                const extraAthleticPerLunch =
                  currentCustomer.lifestyle.extraAthletic /
                  100 *
                  currentCustomer.lunchPrice;

                totalAthleticSurcharge +=
                  currentCustomer.lunch.athleticQty * extraAthleticPerLunch;
              }

              if (
                currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
                'Fixed amount'
              ) {
                totalAthleticSurcharge +=
                  currentCustomer.lunch.athleticQty *
                  currentCustomer.lifestyle.extraAthletic;
              }
            }

            if (currentCustomer.dinner.athleticQty > 0) {
              if (
                currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
                'Percentage'
              ) {
                const extraAthleticPerDinner =
                  currentCustomer.lifestyle.extraAthletic /
                  100 *
                  currentCustomer.dinnerPrice;

                totalAthleticSurcharge +=
                  currentCustomer.dinner.athleticQty * extraAthleticPerDinner;
              }

              if (
                currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
                'Fixed amount'
              ) {
                totalAthleticSurcharge +=
                  currentCustomer.breakfast.athleticQty *
                  currentCustomer.lifestyle.extraAthletic;
              }
            }

            currentCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
          }

          // calculating bodybuilder surcharge for all meals
          if (
            currentCustomer.breakfast.bodybuilderQty > 0 ||
            currentCustomer.lunch.bodybuilderQty > 0 ||
            currentCustomer.dinner.bodybuilderQty > 0
          ) {
            let totalBodybuilderSurcharge = 0;

            if (currentCustomer.breakfast.bodybuilderQty > 0) {
              if (
                currentCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
                'Percentage'
              ) {
                const extraBodybuilderPerBreakfast =
                  currentCustomer.lifestyle.extraBodybuilder /
                  100 *
                  currentCustomer.breakfastPrice;

                totalBodybuilderSurcharge +=
                  currentCustomer.breakfast.bodybuilderQty *
                  extraBodybuilderPerBreakfast;
              }

              if (
                currentCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
                'Fixed amount'
              ) {
                totalBodybuilderSurcharge +=
                  currentCustomer.breakfast.athleticQty *
                  currentCustomer.lifestyle.extraBodybuilder;
              }
            }

            if (currentCustomer.lunch.bodybuilderQty > 0) {
              const extraBodybuilderPerLunch =
                currentCustomer.lifestyle.extraBodybuilder /
                100 *
                currentCustomer.lunchPrice;

              totalBodybuilderSurcharge +=
                currentCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
            }

            if (currentCustomer.dinner.bodybuilderQty > 0) {
              const extraBodybuilderPerDinner =
                currentCustomer.lifestyle.extraBodybuilder /
                100 *
                currentCustomer.dinnerPrice;

              totalBodybuilderSurcharge +=
                currentCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
            }

            currentCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
          }

          currentCustomer.totalCost =
            currentCustomer.baseMealPriceTotal +
            currentCustomer.totalAthleticSurcharge +
            currentCustomer.totalBodybuilderSurcharge +
            _.sum(currentCustomer.restrictionsSurcharges) +
            _.sum(currentCustomer.specificRestrictionsSurcharges);

          currentCustomer.totalCost -= currentCustomer.discountActual;

          console.log(currentCustomer);

          // push
          secondaryCustomers.push(currentCustomer);
        });
      }

      let actualDeliveryCost = 0;
      let surchargePerDelivery = 0;

      const selectedPostalCode = this.props.postalCodes.find(
        el => el.title === this.props.customerInfo.postalCode.substring(0, 3),
      );

      console.log(selectedPostalCode);

      if (selectedPostalCode.hasOwnProperty('extraSurcharge')) {
        surchargePerDelivery = selectedPostalCode.extraSurcharge;
      }

      console.log(surchargePerDelivery);

      for (
        let delivIndex = 0;
        delivIndex < this.props.customerInfo.deliveryType.length;
        delivIndex++
      ) {
        const daysMealSum =
          parseInt(
            this.props.customerInfo.completeSchedule[delivIndex].breakfast,
            10,
          ) +
          parseInt(
            this.props.customerInfo.completeSchedule[delivIndex].lunch,
            10,
          ) +
          parseInt(
            this.props.customerInfo.completeSchedule[delivIndex].dinner,
            10,
          );

        const deliveryTypeSelected = this.props.customerInfo.deliveryType[
          delivIndex
        ];

        // calculate surcharges

        if (deliveryTypeSelected == '') {
          continue;
        } else if (
          deliveryTypeSelected == 'dayOf' ||
          deliveryTypeSelected == 'nightBefore'
        ) {
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        } else if (
          // tuesday
          deliveryTypeSelected == 'sundayNight' ||
          deliveryTypeSelected == 'dayOfMonday'
        ) {
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        } else if (
          // wednesday
          deliveryTypeSelected == 'sundayNight' ||
          deliveryTypeSelected == 'dayOfMonday' ||
          deliveryTypeSelected == 'nightBeforeMonday' ||
          deliveryTypeSelected == 'dayOfTuesday'
        ) {
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        } else if (
          // thursday
          deliveryTypeSelected == 'mondayNight' ||
          deliveryTypeSelected == 'dayOfTuesday' ||
          deliveryTypeSelected == 'nightBeforeTuesday' ||
          deliveryTypeSelected == 'dayOfWednesday'
        ) {
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        } else if (
          // friday
          deliveryTypeSelected == 'tuesdayNight' ||
          deliveryTypeSelected == 'dayOfWednesday' ||
          deliveryTypeSelected == 'nightBeforeWednesday' ||
          deliveryTypeSelected == 'dayOfThursday'
        ) {
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        }


        // calculate actual delivery cost / delivery
        if (deliveryTypeSelected == '') {
          continue;
        } else if (
          deliveryTypeSelected == 'dayOf' ||
          deliveryTypeSelected == 'dayOfFriday' ||
          deliveryTypeSelected == 'dayOfThursday' ||
          deliveryTypeSelected == 'dayOfWednesday' ||
          deliveryTypeSelected == 'dayOfTuesday' ||
          deliveryTypeSelected == 'dayOfMonday'
        ) {
          actualDeliveryCost += 2.5;
        } else if (
          daysMealSum == 1 &&
          (deliveryTypeSelected == 'nightBefore' ||
            deliveryTypeSelected == 'sundayNight' ||
            deliveryTypeSelected == 'mondayNight' ||
            deliveryTypeSelected == 'tuesdayNight' ||
            deliveryTypeSelected == 'nightBeforeMonday' ||
            deliveryTypeSelected == 'nightBeforeTuesday' ||
            deliveryTypeSelected == 'nightBeforeWednesday')
        ) {
          actualDeliveryCost += 2.5;
        } else if (delivIndex == 5) {
          // these explicit conditions because they depend on friday's/thursday's selections
          if (
            this.props.customerInfo.deliveryType[delivIndex - 1] ==
            'dayOfThursday'
          ) {
            if (deliveryTypeSelected == 'nightBeforeThursday') {
              actualDeliveryCost += 2.5;

              // mixing surcharges here
              primaryCustomer.deliverySurcharges += surchargePerDelivery;
            }
          } else if (
            this.props.customerInfo.deliveryType[delivIndex - 1] ==
            'dayOfPaired' &&
            this.props.customerInfo.deliveryType[delivIndex - 2] == 'dayOf'
          ) {
            if (deliveryTypeSelected == 'nightBeforeThursday') {
              actualDeliveryCost += 2.5;

              // mixing surcharges here
              primaryCustomer.deliverySurcharges += surchargePerDelivery;
            }
          }
        } // else if 5
      }

      // calculate delivery surcharges

      primaryCustomer.deliveryCost = actualDeliveryCost;

      primaryCustomer.totalCost =
        primaryCustomer.baseMealPriceTotal +
        primaryCustomer.totalAthleticSurcharge +
        primaryCustomer.totalBodybuilderSurcharge +
        primaryCustomer.coolerBag +
        _.sum(primaryCustomer.restrictionsSurcharges) +
        _.sum(primaryCustomer.specificRestrictionsSurcharges) +
        primaryCustomer.deliveryCost + primaryCustomer.deliverySurcharges;

      primaryCustomer.totalCost -= primaryCustomer.discountActual;

      primaryCustomer.taxes =
        0.13 *
        (primaryCustomer.totalCost +
          _.sumBy(secondaryCustomers, e => e.totalCost));

      let secondaryGroupCost = 0;

      if (this.props.customerInfo.secondaryProfileCount > 0) {
        secondaryCustomers.forEach((e, i) => {
          secondaryGroupCost += e.totalCost;
        });
      }

      primaryCustomer.secondaryGroupTotal = secondaryGroupCost;

      primaryCustomer.groupTotal =
        secondaryGroupCost + primaryCustomer.totalCost + primaryCustomer.taxes;

      primaryCustomer.taxes = parseFloat(primaryCustomer.taxes.toFixed(2));
      primaryCustomer.groupTotal = parseFloat(primaryCustomer.groupTotal.toFixed(2));

      this.setState({
        primaryProfileBilling: primaryCustomer,
        secondaryProfilesBilling: secondaryCustomers,
      });
    }
  }

  handleSubmitStep() {
    console.log("Reached");

    this.setState({
      submitSuccess: false,
      submitLoading: true
    });

    this.props.saveValues({
      primaryProfileBilling: this.state.primaryProfileBilling,
      secondaryProfilesBilling: this.state.secondaryProfilesBilling,
      taxExempt: this.state.taxExempt
    });

    const customerInfo = this.props.customerInfo;

    customerInfo.primaryProfileBilling = this.state.primaryProfileBilling;
    customerInfo.secondaryProfilesBilling = this.state.secondaryProfilesBilling;
    customerInfo.taxExempt = this.state.taxExempt;
    customerInfo.paymentMethod = this.state.paymentMethod;
    customerInfo.nameOnCard = $('[name="nameOnCard"]')
      .val()
      .trim();
    customerInfo.billingPostalCode = $('[name="postal_code"]')
      .val()
      .trim();

    // console.log(customerInfo);

    // return;

    if (
      this.state.paymentMethod == "interac" ||
      this.state.paymentMethod == "cash"
    ) {
      console.log("It's cash or interac");

      console.log(customerInfo);

      Meteor.call("customer.step5.noCreditCard", customerInfo, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          this.setState({
            submitSuccess: false,
            submitLoading: true
          });

          this.props.popTheSnackbar({
            message: "Customer added successfully."
          });

          this.props.history.push("/customers");
        }
      });


    }

    const authData = {};
    authData.clientKey = Meteor.settings.public.clientKey;
    authData.apiLoginID = Meteor.settings.public.apiLoginKey;

    const expiration = document
      .getElementById("expiry")
      .value.trim()
      .split("/");

    const cardData = {};
    cardData.cardNumber = document
      .getElementById("cardNumber")
      .value.trim()
      .split(" ")
      .join("");
    cardData.month = expiration[0].trim();
    cardData.year = expiration[1].trim();
    cardData.cardCode = document.getElementById("cvc").value.trim();

    console.log(cardData);
    const secureData = {};
    secureData.authData = authData;
    secureData.cardData = cardData;

    Accept.dispatchData(secureData, response => {
      console.log(response);

      if (response.messages.resultCode === "Ok" && response.opaqueData) {
        Meteor.call(
          "customers.step5",
          response.opaqueData,
          customerInfo,
          (err, res) => {
            if (err) {
              console.log(err);

              this.setState({
                submitSuccess: false,
                submitLoading: false
              });

              this.props.popTheSnackbar({
                message: "There was an error saving customer data"
              });
            } else {
              console.log(res);

              this.setState({
                submitSuccess: true,
                submitLoading: false
              });

              this.props.popTheSnackbar({
                message: `Successfully created subscription with ID:${
                  res.subscriptionId
                  }`
              });

              this.props.history.push("/customers");
            }
          }
        );
      } else {
        this.setState({
          submitSuccess: false,
          submitLoading: false
        });

        this.props.popTheSnackbar({
          message: response.messages.message[0].text
        });
      }
    });
  }

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

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return (
      <form
        id="step6"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: '50px', marginTop: '25px' }}
        >
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={7}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="subheading" className="font-uppercase">
                        Payment Method
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        {/* <FormLabel component="legend">Type</FormLabel> */}
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
                    </Grid>
                  </Grid>

                  <div
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
                            name: 'billingPostalCode',
                            id: 'postalCode',
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </div>

                  {this.state.paymentMethod == 'interac' ||
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
                    )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Paper elevation={2} className="paper-for-fields">
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
                                      this.props.customerInfo.postalCode.substring(
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
                            type="display1"
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
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button color="primary" onClick={this.props.handleBack}>
            Back
          </Button>
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

Step4Checkout.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default withStyles(styles)(Step4Checkout);
