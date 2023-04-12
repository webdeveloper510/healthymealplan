import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import CakeIcon from 'material-ui-icons/Cake';
import Tooltip from 'material-ui/Tooltip';
import { ThreeDayPairingIcon, TwoDayPairingIcon, BirthdayIcon } from '../../../modules/LabelIcons';


import $ from 'jquery';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import { CircularProgress } from 'material-ui/Progress';

import moment from 'moment';

import sumBy from 'lodash/sumBy';

import Loading from '../../components/Loading/Loading';
import Slide from 'material-ui/transitions/Slide';
import jsPDF from 'jspdf';
import autotable from 'jspdf-autotable';

import blobStream from 'blob-stream';

import vittlebase64 from '../../../modules/vittlelogobase64';
import alerticon from '../../../modules/alerticonlabel';

import hmpbase64 from '../../../modules/hmplogobase64';
import cakeImage from '../../../modules/cakebase64';

import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import concat from 'lodash/concat';
import autoBind from 'react-autobind';

import './PlatingTable.scss';

const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  root: {
    width: '100%',
    overflowX: 'auto',
  },

};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

function sortByLastName(a, b) {
  const splitA = a.name.split(' ');
  const splitB = b.name.split(' ');

  const lastA = splitA[splitA.length - 1];
  const lastB = splitB[splitB.length - 1];

  if (lastA < lastB) return -1;
  if (lastA > lastB) return 1;

  return 1;
}

function renderBirthdayCake(birthday, returnBool) {
  if (returnBool === false && birthday === null) {
    return '';
  } else if (returnBool == true && birthday == null) {
    return false;
  }

  const day = parseInt(moment().format('D'), 10);
  const month = parseInt(moment().format('M'), 10);

  if (day === parseInt(birthday.day, 10) && month === parseInt(birthday.month, 10)) {
    if (returnBool === false) {
      return <CakeIcon />;
    }
    return true;
  }
}

function renderUserDetailsOnLabel(doc, userData, currentPlate, mealType, mealPortion, currentSelectorDate, isChefsChoice = false, labelGeneratedQty) {
    doc.addPage({
        size: [288,216],
        margin: 0,
    });

    // console.log(currentPlate);
  // VITTLE LOGO

  // doc.addImage(vittlebase64, 'PNG', 1.55208333, 0.08500, 0.895833333, 0.260416667);


  // plating day + 1
  // doc.setFontStyle('normal');
  // doc.setFontSize(9);
  // const day = moment(currentSelectorDate).add(1, 'd').format('M/D/YYYY');
  // doc.text(day, 3.2, 0.38);

  doc.font('Helvetica');
  doc.fontSize(7.5);
  const day = moment(currentSelectorDate).format('MMMM D');
  doc.text(`Made for you on ${day}`, 10.8, 204);

  // total meals for this customer
  doc.font('Helvetica');
  doc.fontSize(9);
  const totalMeals = userData.breakfast +
    userData.athleticBreakfast +
    userData.bodybuilderBreakfast +
    userData.lunch +
    userData.athleticLunch +
    userData.bodybuilderLunch +
    userData.dinner +
    userData.athleticDinner +
    userData.bodybuilderDinner +
    userData.chefsChoiceBreakfast +
    userData.athleticChefsChoiceBreakfast +
    userData.bodybuilderChefsChoiceBreakfast +
    userData.chefsChoiceLunch +
    userData.athleticChefsChoiceLunch +
    userData.bodybuilderChefsChoiceLunch +
    userData.chefsChoiceDinner +
    userData.athleticChefsChoiceDinner +
    userData.bodybuilderChefsChoiceDinner;

  // console.log(currentPlate);
    let totalQty = 0;

    switch (mealType) {
        case 'Breakfast':
            totalQty = userData.bodybuilderBreakfast + userData.athleticBreakfast + userData.breakfast;
            break;

        case 'Lunch':
            totalQty = userData.bodybuilderLunch + userData.athleticLunch + userData.lunch;
            break;

        case 'Dinner':
            totalQty = userData.bodybuilderDinner + userData.athleticDinner + userData.dinner;
            break;
        case "Chef's Choice Breakfast":
            totalQty = userData.bodybuilderChefsChoiceBreakfast + userData.athleticChefsChoiceBreakfast + userData.chefsChoiceBreakfast;
            break;

        case "Chef's Choice Lunch":
            totalQty = userData.bodybuilderChefsChoiceLunch + userData.athleticChefsChoiceLunch + userData.chefsChoiceLunch;
            break;

        case "Chef's Choice Dinner":
            totalQty = userData.bodybuilderChefsChoiceDinner + userData.athleticChefsChoiceDinner + userData.chefsChoiceDinner;
            break;

        default:
          break;
    }

    doc.fontSize(7.5);
    doc.font('Helvetica-Bold');
    // const qtyText = `Qty: ${labelGeneratedQty} of ${totalQty}`;

    doc.roundedRect(11.25, 33.7464, doc.widthOfString(`Qty: ${totalMeals}`) + 7.2, 15.75, 1.8).stroke();
    doc.text(`Qty: ${totalMeals}`, 15, 39);

  if (userData.pairing !== null) {
    if (userData.pairing === 2) {
      // console.log('Has pairing 2');
      doc.image(TwoDayPairingIcon, 50.4, 34, { width: 66.74, height: 15.74 });
    }

    if (userData.pairing === 3) {
      // console.log('Has pairing 3');
      doc.image(ThreeDayPairingIcon, 50.4, 34, { width: 66.74, height: 15.74 });
    }

    if (renderBirthdayCake(userData.birthday, true)) {
      doc.image(BirthdayIcon, 124, 34, { width: 50.2488, height: 15.74 });
    }
  } else {
      if (renderBirthdayCake(userData.birthday, true)) {
          doc.image(BirthdayIcon, 50.4, 34, {width: 50.2488, height: 15.74});
      }
  }


  // name
  let customerName = "";
  // `Made for ${userData.name}`;
// console.log(doc.widthOfString(`Made for ${userData.name}`) * 18 / 72)
    doc.fontSize(18);

  if (doc.widthOfString(`Made for ${userData.name}`) <= 265.5) {
    customerName = `Made for ${userData.name}`;
  } else if (doc.widthOfString(`${userData.name}`) <= 265.5) {
    customerName = userData.name;
  } else {
      customerName = `${userData.name.split(" ")[0]} ${userData.name.split(" ")[userData.name.split(" ").length - 1 || 1].charAt(0)}.`;
  }

  doc.font('Helvetica-Bold');
  doc.text(customerName, 10.8, 58, { width: 265.5 });

  // dish title
  doc.font('Helvetica-Bold');
  doc.fontSize(10);
  doc.text(`${userData.lifestyleName} ${mealType}: ${currentPlate.plate.title} ${currentPlate.plate.subtitle || ''}`,  10.8, 82, { width: 265.5 });

  // dish ingredients
  if (currentPlate.plate.ingredients && currentPlate.plate.ingredients.length > 0) {
    doc.fontSize(9);
    doc.font('Helvetica');

    if ((userData.hasOwnProperty('restrictions') && userData.restrictions != null) ||
        (userData.hasOwnProperty('specificRestrictions') && userData.specificRestrictions != null && userData.specificRestrictions.length > 0) ||
        (userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0)) {


        currentPlate.plate.ingredients.forEach((ingredient, index) => {
            let hasScratch = false;
            // const currentIngredient = this.props.ingredients.find(ing => ing.title === ingredient.title);

            if ((userData.hasOwnProperty('restrictions') && userData.restrictions != null)) {
                // get the restriction
                userData.restrictions.forEach(rest => {

                  if (rest.types.findIndex(t => t === ingredient.typeId) !== -1) {
                    hasScratch = true;
                  } else if (rest.ingredients !== undefined) {
                      if (rest.ingredients.findIndex(ing => ing === ingredient._id) !== -1) {
                          hasScratch = true;
                      }
                  }

                });
            }

            if (userData.hasOwnProperty('specificRestrictions') && userData.specificRestrictions != null && userData.specificRestrictions.length > 0) {
                if (userData.specificRestrictions.findIndex(srest => srest._id === ingredient._id) !== -1) {
                  hasScratch = true;
                }
            }

            if (userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0) {
                if (userData.preferences.findIndex(pref => pref._id === ingredient._id) !== -1) {
                    hasScratch = true;
                }
            }

            // console.log(hasScratch);
            if (index === 0) {
                doc.text(ingredient.title, 10.8, 108, { width: 265.5, continued: true, strike: hasScratch});
                doc.text(', ', { continued: true, strike: false, });
            } else if (index === currentPlate.plate.ingredients.length - 1) {
                doc.text(ingredient.title, { continued: true, strike: hasScratch });
            } else {
                doc.text(ingredient.title, { continued: true, strike: hasScratch });
                doc.text(', ', { continued: true, strike: false, });
            }
        });

    } else {
        doc.text(`${currentPlate.plate.ingredients.map(ing => ing.title).join(', ')}`, 10.8, 108, { width: 265.5 });
    }
  }

  doc.fontSize(0);
  doc.text(' ', 0, 0, { continued: false, strike: false, })

  // instructions
  if (currentPlate.hasOwnProperty('instruction')) {
    doc.font('Helvetica-Bold');
    doc.fontSize(7.5);
    doc.text(currentPlate.instruction.description, 10.8, 196);
  }


  // restrictions
    let restrictionsByType;

    if (userData.hasOwnProperty('restrictions') && userData.restrictions != null) {
    restrictionsByType = groupBy(userData.restrictions, (restriction) => restriction.restrictionType);
  }

  if (userData.hasOwnProperty('restrictions') && userData.restrictions != null ||
      userData.hasOwnProperty('specificRestrictions') && userData.specificRestrictions != null && userData.specificRestrictions.length > 0 ||
      userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0) {

    doc.roundedRect(10.8, 145, 265, 45, 1.8).stroke();

    doc.image(alerticon, 22.32, 154, { width: 15.84, height: 13.68 });

    doc.fontSize(7);

    // console.log('Restriction by type');

    let hasRestrictionAllergy = false;
    let hasRestrictionDietary = false;
    let hasRestrictionReligious = false;
    let hasDislikes = false;

   // console.log(restrictionsByType);
    if (restrictionsByType) {
        if (restrictionsByType['allergy']) {
            hasRestrictionAllergy = true;
            doc.font('Helvetica-Bold');
            doc.text('Allergies: ', 50, 153, { width: 218.99, continued: true, });

            doc.font('Helvetica');
            restrictionsByType['allergy'].forEach((allergy, index) => {
                doc.text(allergy.title, { continued: true });

                if (index !== restrictionsByType['allergy'].length - 1) {
                    doc.text(', ', { continued: true, });
                } else {
                    doc.text('; ', { continued: true, });
                }
            });
        }
    }

    if (userData.hasOwnProperty('specificRestrictions') &&
        userData.specificRestrictions != null &&
        userData.specificRestrictions.length > 0) {

        doc.font('Helvetica-Bold');
        if (!hasRestrictionAllergy) {
            doc.text('Allergies: ', 50, 153, { width: 218.99, continued: true });
        }

        doc.font('Helvetica');
        userData.specificRestrictions.forEach((rest, index) => {
            doc.text(rest.title, { continued: true });
            if (index !== userData.specificRestrictions.length - 1) {
                doc.text(', ', { continued: true, });
            } else {
                doc.text('; ', { continued: true, });
            }
        });

        hasRestrictionAllergy = true;
    }

    if (restrictionsByType) {

        if (restrictionsByType['dietary']) {
            hasRestrictionDietary = true;
            doc.font('Helvetica-Bold');

            if (hasRestrictionAllergy) {
                doc.text('Dietary: ', { continued: true });
            } else {
                doc.text('Dietary: ', 50, 153, { width: 218.99, continued: true });
            }

            doc.font('Helvetica');
            restrictionsByType.dietary.forEach((dietary, index) => {
                doc.text(dietary.title, { continued: true });

                if (index !== restrictionsByType.dietary.length - 1) {
                    doc.text(', ', { continued: true, });
                } else {
                    doc.text('; ', { continued: true, });
                }
            });
        }

          if (restrictionsByType['religious']) {
              hasRestrictionReligious = true;
              doc.font('Helvetica-Bold');

              if (hasRestrictionDietary || hasRestrictionAllergy) {
                  doc.text('Religious: ', {continued: true});
              } else {
                  doc.text('Dietary: ', 50, 153, { width: 218.99, continued: true });
              }

              doc.font('Helvetica');

              restrictionsByType.religious.map((religious, index) => {
                  doc.text(religious.title, {continued: true});

                  if (index !== restrictionsByType.religious.length - 1) {
                      doc.text(', ', { continued: true, });
                  }  else {
                      doc.text('; ', { continued: true, });
                  }
              });
          }
      }

      if (userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0) {
            hasDislikes = true;
          doc.font('Helvetica-Bold');

          if (hasRestrictionDietary || hasRestrictionAllergy || hasRestrictionReligious) {
              doc.text('Dislikes: ', { continued: true });
          } else {
              doc.text('Dislikes: ', 50, 153, { width: 218.99, continued: true });
          }

          doc.font('Helvetica');

          userData.preferences.map((dislike, index) => {
              doc.text(dislike.title, { continued: true });
              if (index !== userData.preferences.length - 1) {
                  doc.text(', ', { continued: true, });
              } else {
                  doc.text('; ', { continued: true, });
              }
          });
      }

      if (restrictionsByType) {
          if (restrictionsByType['preference']) {

              doc.font('Helvetica-Bold');

              if (hasRestrictionDietary || hasRestrictionAllergy || hasRestrictionReligious || hasDislikes) {
                  doc.text('Preferences: ', { continued: true });
              } else {
                  doc.text('Preferences: ', 50, 153, { width: 218.99, continued: true});
              }

              doc.font('Helvetica');

              restrictionsByType.preference.map((preference, index) => {
                  doc.text(preference.title, { continued: true });
                  if (index !== restrictionsByType.preference.length - 1) {
                      doc.text(', ', { continued: true, });
                  } else {
                      doc.text('; ', { continued: true, });
                  }
              });
          }
      }

  }

   doc.text(' ', 0, 0, { continued: false, })
  // hide macros on user label
  // if (typeof currentPlate.plate.nutritional === 'object' && currentPlate.plate.nutritional.hasOwnProperty(mealPortion)) {
  //   doc.font('Helvetica');
  //   doc.fontSize(7.5);

  //   // calories
  //   let currentMealPortionCalories = '0';
  //   let currentMealPortionProteins = '0';
  //   let currentMealPortionCarbs = '0';
  //   let currentMealPortionFat = '0';

  //   if (currentPlate.plate.nutritional[mealPortion].calories > 0) {
  //     currentMealPortionCalories = currentPlate.plate.nutritional[mealPortion].calories;
  //   }

  //   doc.font('Helvetica-Bold');
  //   doc.text(currentMealPortionCalories, 165.6, 196);

  //   doc.font('Helvetica');
  //   doc.text('Calories', 165.6, 204);

  //   // protein
  //   if (currentPlate.plate.nutritional[mealPortion].proteins > 0) {
  //     currentMealPortionProteins = currentPlate.plate.nutritional[mealPortion].proteins;
  //   }

  //   doc.font('Helvetica-Bold');
  //   doc.text(`${currentMealPortionProteins}g`, 204, 196);

  //   doc.font('Helvetica');
  //   doc.text('Protein', 203.7, 204);

  //   // carbs
  //   if (currentPlate.plate.nutritional[mealPortion].carbs > 0) {
  //     currentMealPortionCarbs = currentPlate.plate.nutritional[mealPortion].carbs;
  //   }

  //   doc.font('Helvetica-Bold');
  //   doc.text(`${currentMealPortionCarbs}g`, 235, 196);

  //   doc.font('Helvetica');
  //   doc.text('Carbs', 235, 204);


  //   // fats
  //   if (currentPlate.plate.nutritional[mealPortion].fat > 0) {
  //     currentMealPortionFat = currentPlate.plate.nutritional[mealPortion].fat;
  //   }

  //   doc.font('Helvetica-Bold');
  //   doc.text(`${currentMealPortionFat}g`, 262.8, 196);

  //   doc.font('Helvetica');
  //   doc.text('Fats', 262.8, 204);
  // }

  doc.font('Helvetica-Bold');
  doc.text(mealPortion.charAt(0).toUpperCase() + mealPortion.substr(1), 116, 196);

  doc.font('Helvetica');
  doc.text('Portion', 116, 204);
}


function getMealTitle(mealTitle, firstInitialCapitalized = false) {
  let toReturn = '';

  if (mealTitle === 'Chefs Choice Breakfast') {
    toReturn = 'chefsChoiceBreakfast';
  } else if (mealTitle === 'Chefs Choice Lunch') {
    toReturn = 'chefsChoiceLunch';
  } else if (mealTitle === 'Chefs Choice Dinner') {
    toReturn = 'chefsChoiceDinner';
  } else {
    toReturn = mealTitle.toLowerCase();
  }

  if (firstInitialCapitalized) {
    return toReturn.charAt(0).toUpperCase() + toReturn.slice(1);
  }

  return toReturn;
}

function renderPlatingNoteOnLabel(doc, userData) {
    doc.addPage({
        size: [288,216],
        margin: 0,
    });

  // VITTLE LOGO
  // doc.addImage(vittlebase64, 'PNG', 1.55208333, 0.08500, 0.895833333, 0.260416667);

  // name
  doc.font('Helvetica-Bold');
  doc.fontSize(18);
  doc.text(`Note for ${userData.name}`, 10.8, 54.72);

  doc.font('Helvetica');
  doc.fontSize(9);
  doc.text(userData.platingNotes, 10.8, 90);

    // restrictions
    let restrictionsByType;

    if (userData.hasOwnProperty('restrictions') && userData.restrictions != null) {
        restrictionsByType = groupBy(userData.restrictions, (restriction) => restriction.restrictionType);
    }

    if (userData.hasOwnProperty('restrictions') && userData.restrictions != null ||
        userData.hasOwnProperty('specificRestrictions') && userData.specificRestrictions != null && userData.specificRestrictions.length > 0 ||
        userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0) {

        doc.roundedRect(10.8, 145, 265, 45, 1.8).stroke();

        doc.image(alerticon, 22.32, 154, { width: 15.84, height: 13.68 });

        doc.fontSize(7);

        // console.log('Restriction by type');

        let hasRestrictionAllergy = false;
        let hasRestrictionDietary = false;
        let hasRestrictionReligious = false;
        let hasDislikes = false;

        // console.log(restrictionsByType);
        if (restrictionsByType) {
            if (restrictionsByType['allergy']) {
                hasRestrictionAllergy = true;
                doc.font('Helvetica-Bold');
                doc.text('Allergies: ', 50, 153, { width: 218.99, continued: true, });

                doc.font('Helvetica');
                restrictionsByType['allergy'].forEach((allergy, index) => {
                    doc.text(allergy.title, { continued: true });

                    if (index !== restrictionsByType['allergy'].length - 1) {
                        doc.text(', ', { continued: true, });
                    } else {
                        doc.text('; ', { continued: true, });
                    }
                });
            }
        }

        if (userData.hasOwnProperty('specificRestrictions') &&
            userData.specificRestrictions != null &&
            userData.specificRestrictions.length > 0) {

            doc.font('Helvetica-Bold');
            if (!hasRestrictionAllergy) {
                doc.text('Allergies: ', 50, 153, { width: 218.99, continued: true });
            }

            doc.font('Helvetica');
            userData.specificRestrictions.forEach((rest, index) => {
                doc.text(rest.title, { continued: true });
                if (index !== userData.specificRestrictions.length - 1) {
                    doc.text(', ', { continued: true, });
                } else {
                    doc.text('; ', { continued: true, });
                }
            });

            hasRestrictionAllergy = true;
        }

        if (restrictionsByType) {

            if (restrictionsByType['dietary']) {
                hasRestrictionDietary = true;
                doc.font('Helvetica-Bold');

                if (hasRestrictionAllergy) {
                    doc.text('Dietary: ', { continued: true });
                } else {
                    doc.text('Dietary: ', 50, 153, { width: 218.99, continued: true });
                }

                doc.font('Helvetica');
                restrictionsByType.dietary.forEach((dietary, index) => {
                    doc.text(dietary.title, { continued: true });

                    if (index !== restrictionsByType.dietary.length - 1) {
                        doc.text(', ', { continued: true, });
                    } else {
                        doc.text('; ', { continued: true, });
                    }
                });
            }

            if (restrictionsByType['religious']) {
                hasRestrictionReligious = true;
                doc.font('Helvetica-Bold');

                if (hasRestrictionDietary || hasRestrictionAllergy) {
                    doc.text('Religious: ', {continued: true});
                } else {
                    doc.text('Dietary: ', 50, 153, { width: 218.99, continued: true });
                }

                doc.font('Helvetica');

                restrictionsByType.religious.map((religious, index) => {
                    doc.text(religious.title, {continued: true});

                    if (index !== restrictionsByType.religious.length - 1) {
                        doc.text(', ', { continued: true, });
                    }  else {
                        doc.text('; ', { continued: true, });
                    }
                });
            }
        }

        if (userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0) {
            hasDislikes = true;
            doc.font('Helvetica-Bold');

            if (hasRestrictionDietary || hasRestrictionAllergy || hasRestrictionReligious) {
                doc.text('Dislikes: ', { continued: true });
            } else {
                doc.text('Dislikes: ', 50, 153, { width: 218.99, continued: true });
            }

            doc.font('Helvetica');

            userData.preferences.map((dislike, index) => {
                doc.text(dislike.title, { continued: true });
                if (index !== userData.preferences.length - 1) {
                    doc.text(', ', { continued: true, });
                } else {
                    doc.text('; ', { continued: true, });
                }
            });
        }

        if (restrictionsByType) {
            if (restrictionsByType['preference']) {

                doc.font('Helvetica-Bold');

                if (hasRestrictionDietary || hasRestrictionAllergy || hasRestrictionReligious || hasDislikes) {
                    doc.text('Preferences: ', { continued: true });
                } else {
                    doc.text('Preferences: ', 50, 153, { width: 218.99, continued: true});
                }

                doc.font('Helvetica');

                restrictionsByType.preference.map((preference, index) => {
                    doc.text(preference.title, { continued: true });
                    if (index !== restrictionsByType.preference.length - 1) {
                        doc.text(', ', { continued: true, });
                    } else {
                        doc.text('; ', { continued: true, });
                    }
                });
            }
        }
    }
}

function renderSummaryLabel(doc, currentPlate, dataCurrentLifestyle, lifestyleTitle, mealTitle, currentSelectorDate, count) {
  doc.addPage({
      size: [288,216],
      margin: 0,
  });

  doc.font('Helvetica');
  doc.fontSize(9);

  const totalMeals = dataCurrentLifestyle[getMealTitle(mealTitle)].regular +
    dataCurrentLifestyle[getMealTitle(mealTitle)].athletic +
    dataCurrentLifestyle[getMealTitle(mealTitle)].bodybuilder;

  // dish title
  doc.font('Helvetica-Bold');
  doc.fontSize(13);
  doc.text(`${lifestyleTitle} ${mealTitle}: ${currentPlate.plate.title} ${currentPlate.plate.subtitle || ''}`, 10.8, 54.72, { width: 265.5});

  // dish ingredients
  if (currentPlate.plate.ingredients && currentPlate.plate.ingredients.length > 0) {
    doc.font('Helvetica');
    doc.fontSize(11);
    doc.text(`${currentPlate.plate.ingredients.map(ing => ing.title).join(', ')}`, 10.8, 115.56, { width: 265.5 });
  }

  doc.fontSize(9);
  doc.font('Helvetica');

  doc.text('Regular', 10.8, 200);
  doc.text('Athletic', 51, 200);
  doc.text('Bodybuilder', 90, 200);

  // doc.font('Helvetica-Bold');

  doc.text(`${dataCurrentLifestyle[getMealTitle(mealTitle)].regular}`, 10.8, 190);
  doc.text(`${dataCurrentLifestyle[getMealTitle(mealTitle)].athletic}`, 51, 190);
  doc.text(`${dataCurrentLifestyle[getMealTitle(mealTitle)].bodybuilder}`, 90, 190);
}

class PlatingTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plates: this.props.plates ? this.props.plates : [],

      currentSelectorDate: this.props.currentSelectorDate,

      assignDialogOpen: false,

      mealSelected: null,
      lifestyleSelected: null,

      lifestyleTitle: '',
      mealTitle: '',

      aggregateData: null,
      aggregateDataLoading: true,
    };


    autoBind(this);
  }

  componentDidMount() {
    Meteor.call('getPlatingAggregatedData', this.props.currentSelectorDate, (err, res) => {
      this.setState({
        aggregateData: res,
      }, () => {
        this.setState({ aggregateDataLoading: false });
      });
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.currentSelectorDate != this.props.currentSelectorDate) {
      this.setState({
        aggregateDataLoading: true,
        aggregateData: null,
      }, () => {
        Meteor.call('getPlatingAggregatedData', this.props.currentSelectorDate, (err, res) => {
          this.setState({
            aggregateDataLoading: false,
            aggregateData: res,
          });
        });
      });
    }
  }

  getCurrentSelectionPlate(what) {
    if (!this.state.aggregateDataLoading && this.state.lifestyleSelected && this.state.mealSelected) {
      let lifestylePlates,
        currentPlate;

      if (this.state.mealTitle === 'Chefs Choice Breakfast' || this.state.mealTitle === 'Chefs Choice Lunch' || this.state.mealTitle === 'Chefs Choice Dinner') {
        lifestylePlates = [1];
        if (this.state.mealTitle === 'Chefs Choice Breakfast') {
          currentPlate = this.props.plates.find(e => e.title === "Chef's Choice Breakfast");
        } else if (this.state.mealTitle === 'Chefs Choice Lunch') {
          currentPlate = this.props.plates.find(e => e.title == "Chef's Choice Lunch");
        } else if (this.state.mealTitle === 'Chefs Choice Dinner') {
          currentPlate = this.props.plates.find(e => e.title === "Chef's Choice Dinner");
        }
      } else {
        lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
        currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);
      }

      if (lifestylePlates.length === 0 || !currentPlate) {
        return;
      }

      if (what === 'title') {
        return currentPlate.plate && currentPlate.plate.title ? currentPlate.plate.title : '';
      } else if (what === 'subtitle') {
        return currentPlate.plate && currentPlate.plate.subtitle ? currentPlate.plate.subtitle : '';
      } else if (what === 'ingredients') {
        return currentPlate.plate && currentPlate.plate.ingredients &&
          currentPlate.plate.ingredients.length > 0 ? currentPlate.plate.ingredients.map(e => e.title).join(', ') : '';
      }
    }
  }

  openAssignDialog(lifestyleId, mealId) {
    const lifestyle = this.props.lifestyles.find(el => el._id === lifestyleId);
    const meal = this.props.meals.find(el => el._id === mealId);

    this.setState({
      assignDialogOpen: true,
      lifestyleSelected: lifestyleId,
      mealSelected: mealId,
      lifestyleTitle: lifestyle.title,
      mealTitle: meal.title,
    });
  }

  printNotesLabels() {
    if (this.state.aggregateDataLoading) {
      return;
    }

    const doc = new PDFDocument({ autoFirstPage: false, });
    let stream = doc.pipe(blobStream());

    const usersWithSelectedLifestyle = this.state.aggregateData.userData.filter(user =>
      user.lifestyleId === this.state.lifestyleSelected && user.platingNotes,
    ).filter(user => user.platingNotes.length > 0).forEach((user) => {
      renderPlatingNoteOnLabel(doc, user);
    });

    doc.end();

    stream.on('finish', () => {
        const blob = stream.toBlob("application/pdf");

        const link = document.createElement('a');
        // create a blobURI pointing to our Blob
        link.href = URL.createObjectURL(blob);
        link.download = `Notes_${this.state.lifestyleTitle}_${new Date().toDateString()}.pdf`;

        document.body.append(link);
        link.click();
        link.remove();
        // in case the Blob uses a lot of memory
        window.addEventListener('focus', (e) => URL.revokeObjectURL(link.href), { once: true });
    });
  }

  printLabels() {
    if (this.state.aggregateDataLoading) {
      return;
    }

    const userDataNew = this.state.aggregateData.userData.filter(user => user.lifestyleId === this.state.lifestyleSelected
      && (user[getMealTitle(this.state.mealTitle)] > 0 ||
        user[`athletic${getMealTitle(this.state.mealTitle, true)}`] > 0 ||
        user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`] > 0)).sort((a, b) => {
      let totalRestrictionsA = 0;
      let totalRestrictionsB = 0;

      if (a.specificRestrictions) {
        totalRestrictionsA += a.specificRestrictions.length;
      }

      if (a.restrictions) {
        totalRestrictionsA += a.restrictions.length;
      }

      if (a.preferences) {
        totalRestrictionsA += a.preferences.length;
      }


      if (b.specificRestrictions) {
        totalRestrictionsB += b.specificRestrictions.length;
      }

      if (b.restrictions) {
        totalRestrictionsB += b.restrictions.length;
      }

      if (b.preferences) {
        totalRestrictionsB += b.preferences.length;
      }

      return totalRestrictionsB - totalRestrictionsA;
    });

    const labelsByPortions = this.state.aggregateData.userData.filter(user => user.lifestyleId === this.state.lifestyleSelected
      && (user[getMealTitle(this.state.mealTitle)] > 0 ||
        user[`athletic${getMealTitle(this.state.mealTitle, true)}`] > 0 ||
        user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`] > 0));

    const bodybuilder = labelsByPortions.filter(e => e[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`] > 0).sort(sortByLastName);
    const athletic = labelsByPortions.filter(e => e[`athletic${getMealTitle(this.state.mealTitle, true)}`] > 0).sort(sortByLastName);
    const regular = labelsByPortions.filter(e => e[`${getMealTitle(this.state.mealTitle)}`] > 0).sort(sortByLastName);

    const orderedUserData = concat([bodybuilder], [athletic], [regular]);

    let lifestylePlates;
    let currentPlate;


    if (this.state.mealTitle === 'Chefs Choice Breakfast' || this.state.mealTitle === 'Chefs Choice Lunch' || this.state.mealTitle === 'Chefs Choice Dinner') {
      lifestylePlates = [1];

      if (this.state.mealTitle === 'Chefs Choice Breakfast') {
        currentPlate = { plate: this.props.plates.find(e => e.title === "Chef's Choice Breakfast") };
      } else if (this.state.mealTitle === 'Chefs Choice Lunch') {
        currentPlate = { plate: this.props.plates.find(e => e.title === "Chef's Choice Lunch") };
      } else if (this.state.mealTitle === 'Chefs Choice Dinner') {
        currentPlate = { plate: this.props.plates.find(e => e.title === "Chef's Choice Dinner") };
      }
    } else {
      lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
      currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);
    }

    if (lifestylePlates.length === 0 || !currentPlate) {
      this.props.popTheSnackbar({
        message: `Could not find a dish for ${this.state.lifestyleTitle} ${this.state.mealTitle}. Please assign a dish.`,
      });

      return;
    }

    const dataCurrentLifestyle = this.state.aggregateData && this.state.aggregateData.tableData.find(el => el.id === this.state.lifestyleSelected);

    // const doc = new jsPDF({
    //   orientation: 'landscape',
    //   unit: 'in',
    //   format: [4, 3],
    // });

    const doc = new PDFDocument({ autoFirstPage: false, });
    let stream = doc.pipe(blobStream());

    orderedUserData.forEach((e, upperIndex) => {

      e.forEach((userData, index) => {
        // console.log(userData.restrictions);

        if (this.state.mealTitle === 'Breakfast') {
          let labelGeneratedQty = 0;

          if (userData.bodybuilderBreakfast > 0 && upperIndex === 0) {
            for (let i = 1; i <= userData.bodybuilderBreakfast; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Breakfast', 'bodybuilder', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }

          if (userData.athleticBreakfast > 0 && upperIndex === 1) {
            for (let i = 1; i <= userData.athleticBreakfast; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Breakfast', 'athletic', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }

          if (userData.breakfast > 0 && upperIndex === 2) {
            for (let i = 1; i <= userData.breakfast; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Breakfast', 'regular', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }
        }// Breakfast

        if (this.state.mealTitle === 'Dinner') {
          let labelGeneratedQty = 0;

          if (userData.bodybuilderDinner > 0 && upperIndex === 0) {
            for (let i = 1; i <= userData.bodybuilderDinner; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Dinner', 'bodybuilder', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }

          if (userData.athleticDinner > 0 && upperIndex === 1) {
            for (let i = 1; i <= userData.athleticDinner; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Dinner', 'athletic', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }

          if (userData.dinner > 0 && upperIndex === 2) {
            for (let i = 1; i <= userData.dinner; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Dinner', 'regular', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }
        } // Dinner

        if (this.state.mealTitle === 'Lunch') {
          let labelGeneratedQty = 0;

          if (userData.bodybuilderLunch > 0 && upperIndex === 0) {
            labelGeneratedQty += 1;
            for (let i = 1; i <= userData.bodybuilderLunch; i++) {
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Lunch', 'bodybuilder', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }

          if (userData.athleticLunch > 0 && upperIndex === 1) {
            for (let i = 1; i <= userData.athleticLunch; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Lunch', 'athletic', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }

          if (userData.lunch > 0 && upperIndex === 2) {
            for (let i = 1; i <= userData.lunch; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Lunch', 'regular', this.props.currentSelectorDate, false, labelGeneratedQty);
            }
          }
        } // Lunch

        if (this.state.mealTitle === 'Chefs Choice Breakfast') {
            let labelGeneratedQty = 0;

            if (userData.bodybuilderChefsChoiceBreakfast > 0 && upperIndex === 0) {
            for (let i = 1; i <= userData.bodybuilderChefsChoiceBreakfast; i++) {
                labelGeneratedQty += 1;
                renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Breakfast', 'bodybuilder', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }

          if (userData.athleticChefsChoiceBreakfast > 0 && upperIndex === 1) {
            for (let i = 1; i <= userData.athleticChefsChoiceBreakfast; i++) {
                labelGeneratedQty += 1;
                renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Breakfast', 'athletic', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }

          if (userData.chefsChoiceBreakfast > 0 && upperIndex === 2) {
            for (let i = 1; i <= userData.chefsChoiceBreakfast; i++) {
                labelGeneratedQty += 1;
                renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Breakfast', 'regular', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }
        } // Chefs Choice

        if (this.state.mealTitle === 'Chefs Choice Lunch') {
          let labelGeneratedQty = 0

            if (userData.bodybuilderChefsChoiceLunch > 0 && upperIndex === 0) {
            for (let i = 1; i <= userData.bodybuilderChefsChoiceLunch; i++) {
                labelGeneratedQty += 1;
                renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Lunch', 'bodybuilder', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }

          if (userData.athleticChefsChoiceLunch > 0 && upperIndex === 1) {
            for (let i = 1; i <= userData.athleticChefsChoiceLunch; i++) {
                labelGeneratedQty += 1;
                renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Lunch', 'athletic', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }

          if (userData.chefsChoiceLunch > 0 && upperIndex === 2) {
            for (let i = 1; i <= userData.chefsChoiceLunch; i++) {
                labelGeneratedQty += 1;
                renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Lunch', 'regular', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }
        } // Chefs Choice

        if (this.state.mealTitle === 'Chefs Choice Dinner') {
          let labelGeneratedQty = 0;

          if (userData.bodybuilderChefsChoiceDinner > 0 && upperIndex === 0) {
            for (let i = 1; i <= userData.bodybuilderChefsChoiceDinner; i++) {
                labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Dinner', 'bodybuilder', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }

          if (userData.athleticChefsChoiceDinner > 0 && upperIndex === 1) {
            for (let i = 1; i <= userData.athleticChefsChoiceDinner; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Dinner', 'athletic', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }

          if (userData.chefsChoiceDinner > 0 && upperIndex === 2) {
            for (let i = 1; i <= userData.chefsChoiceDinner; i++) {
              labelGeneratedQty += 1;
              renderUserDetailsOnLabel(doc, userData, currentPlate, 'Chef\'s Choice Dinner', 'regular', this.props.currentSelectorDate, true, labelGeneratedQty);
            }
          }
        } // Chefs Choice
      }); // map
    });

    renderSummaryLabel(doc, currentPlate, dataCurrentLifestyle, this.state.lifestyleTitle, this.state.mealTitle, this.props.currentSelectorDate, this.usersWithoutRestrictions());

    doc.end();

    stream.on('finish', () => {
        const blob = stream.toBlob("application/pdf");

        const link = document.createElement('a');
        // create a blobURI pointing to our Blob
        link.href = URL.createObjectURL(blob);
        link.download = `Plating_${this.state.lifestyleTitle} _${this.state.mealTitle} _${new Date().toDateString()}.pdf`;

        document.body.append(link);
        link.click();
        link.remove();
        // in case the Blob uses a lot of memory
        window.addEventListener('focus', (e) => URL.revokeObjectURL(link.href), { once: true });
    });

    // doc.save(``);
  }

  closeAssignDialog() {
    this.setState({
      selectedLifestyle: '',
      selectedMeal: '',
      selectedPlate: '',
      assignDialogOpen: false,
    });
  }


  usersWithoutRestrictions() {
    if (this.state.aggregateDataLoading || this.state.lifestyleSelected === '' || this.state.mealSelected === '') {
      return '';
    }

    const count = {
      athleticRestrictionsCount: 0,
      regularRestrictionsCount: 0,
      bodybuilderRestrictionsCount: 0,

      athleticWithoutRestrictionsCount: 0,
      regularWithoutRestrictionsCount: 0,
      bodybuilderWithoutRestrictionsCount: 0,
    };

    this.state.aggregateData.userData.filter((user) => {
      if (user.lifestyleId === this.state.lifestyleSelected && (user[getMealTitle(this.state.mealTitle)] > 0 ||
        user[`athletic${getMealTitle(this.state.mealTitle, true)}`] > 0 ||
        user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`] > 0)) {
        if ((user.restrictions && user.restrictions.length > 0) ||
          (user.specificRestrictions && user.specificRestrictions.length > 0) ||
          (user.preferences && user.preferences.length > 0)) {
          count.regularRestrictionsCount += user[getMealTitle(this.state.mealTitle)];
          count.athleticRestrictionsCount += user[`athletic${getMealTitle(this.state.mealTitle, true)}`];
          count.bodybuilderRestrictionsCount += user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`];

          return false;
        }

        count.regularWithoutRestrictionsCount += user[getMealTitle(this.state.mealTitle)];
        count.athleticWithoutRestrictionsCount += user[`athletic${getMealTitle(this.state.mealTitle, true)}`];
        count.bodybuilderWithoutRestrictionsCount += user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`];

        return true;
      }

      return false;
    });

    return count;
  }


  printPopupSummary() {
    const columns = ['Name', 'Plan', 'Notes', 'Portions', , 'Preferences', 'Allergies', 'Allergies', 'Dietary', 'Religious'];
    const rows = [];
    const plateTitle = this.getCurrentSelectionPlate('title');
    const plateSubtitle = this.getCurrentSelectionPlate('subtitle');
    const plateIngredients = this.getCurrentSelectionPlate('ingredients');

    let lifestylePlates,
      currentPlate;

    if (this.state.mealTitle == 'Chefs Choice Breakfast' || this.state.mealTitle == 'Chefs Choice Lunch' || this.state.mealTitle == 'Chefs Choice Dinner') {
      lifestylePlates = [1];
      if (this.state.mealTitle == 'Chefs Choice Breakfast') {
        currentPlate = this.props.plates.find(e => e.title == "Chef's Choice Breakfast");
      } else if (this.state.mealTitle == 'Chefs Choice Lunch') {
        currentPlate = this.props.plates.find(e => e.title == "Chef's Choice Lunch");
      } else if (this.state.mealTitle == 'Chefs Choice Dinner') {
        currentPlate = this.props.plates.find(e => e.title == "Chef's Choice Dinner");
      }
    } else {
      lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
      currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);
    }

    if (lifestylePlates.length === 0 || !currentPlate) {
      this.props.popTheSnackbar({
        message: `Could not find a dish for ${this.state.lifestyleTitle} ${this.state.mealTitle}. Please assign a dish.`,
      });

      return;
    }

    this.state.aggregateData.userData.filter(user => user.lifestyleId == this.state.lifestyleSelected &&
      (user[getMealTitle(this.state.mealTitle)] > 0 ||
        user[`athletic${getMealTitle(this.state.mealTitle, true)}`] > 0 ||
        user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`] > 0)).sort((a, b) => {
      let totalRestrictionsA = 0;
      let totalRestrictionsB = 0;

      if (a.specificRestrictions) {
        totalRestrictionsA += a.specificRestrictions.length;
      }

      if (a.restrictions) {
        totalRestrictionsA += a.restrictions.length;
      }

      if (a.preferences) {
        totalRestrictionsA += a.preferences.length;
      }


      if (b.specificRestrictions) {
        totalRestrictionsB += b.specificRestrictions.length;
      }

      if (b.restrictions) {
        totalRestrictionsB += b.restrictions.length;
      }

      if (b.preferences) {
        totalRestrictionsB += b.preferences.length;
      }

      return totalRestrictionsB - totalRestrictionsA;
    }).map((n) => {
      const mealType = getMealTitle(this.state.mealTitle);
      const mealTypeInitialCaps = getMealTitle(this.state.mealTitle, true);

      let mealText = '';

      if (n[mealType] > 0) {
        mealText += `Regular x${n[`${mealType}`]}`;
      }

      if (n[`athletic${mealTypeInitialCaps}`] > 0) {
        mealText += `${mealText.length > 0 ? ' ' : ''}Athletic x${n[`athletic${mealTypeInitialCaps}`]}`;
      }

      if (n[`bodybuilder${mealTypeInitialCaps}`] > 0) {
        mealText += `${mealText.length > 0 ? ' ' : ''}Bodybuilder x${n[`bodybuilder${mealTypeInitialCaps}`]}`;
      }


      rows.push([
        n.name,
        n.lifestyleName,
        n.platingNotes && n.platingNotes.length > 0 ? n.platingNotes : '',
        mealText,
        n.preferences ? n.preferences.map(pref => pref.title).join(', ') : '',
        n.specificRestrictions ? n.specificRestrictions.map(restriction => restriction.title).join(', ') : '',
        n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'allergy').map(restriction => restriction.title).join(', ') : '',
        n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'dietary').map(restriction => restriction.title).join(', ') : '',
        n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'religious').map(restriction => restriction.title).join(', ') : '',
      ]);
    });


    const doc = new jsPDF({
      orientation: 'landscape',
      format: 'letter',
      unit: 'pt',
    });

    doc.setFontSize(18);
    doc.text(`Customers ${this.state.lifestyleTitle} ${this.state.mealTitle} ${moment(this.state.currentSelectorDate).format('dddd, MMMM D')}`, 40, 30);

    doc.setFontSize(16);
    doc.text(plateTitle, 40, 60);

    doc.setFontSize(14);
    doc.text(plateSubtitle, 40, 80);

    doc.setFontSize(9);
    doc.text(plateIngredients, 40, 100);

    doc.setFontSize(9);
    doc.text(`With restrictions: Regular ${this.usersWithoutRestrictions().regularRestrictionsCount} Athletic ${this.usersWithoutRestrictions().athleticRestrictionsCount} Bodybuilder ${this.usersWithoutRestrictions().bodybuilderRestrictionsCount}`, 40, 120);

    doc.setFontSize(9);
    doc.text(`Without restrictions: Regular ${this.usersWithoutRestrictions().regularWithoutRestrictionsCount} Athletic ${this.usersWithoutRestrictions().athleticWithoutRestrictionsCount} Bodybuilder ${this.usersWithoutRestrictions().bodybuilderWithoutRestrictionsCount}`, 40, 130);

    const totalPagesExp = '{total_pages_count_string}';

    doc.autoTable(columns, rows, {
      startY: 140,
      styles: {
        overflow: 'linebreak',
      },
      headerStyles: {
        fillColor: [0, 0, 0],
        fontSize: 10,
      },
      afterPageContent: (data) => {
        let footerStr = `Page ${doc.internal.getNumberOfPages()}`;
        if (typeof doc.putTotalPages === 'function') {
          footerStr = `${footerStr} of ${totalPagesExp}`;
        }
        doc.setFontSize(8);
        doc.text(footerStr, data.settings.margin.right, doc.internal.pageSize.height - 10);
      },
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }


    doc.save(`Plating_summary_${this.state.lifestyleTitle}_${this.state.mealTitle}_${moment(this.state.currentSelectorDate).format('dddd, MMMM D')}.pdf`);
  }

  printSidesSummary() {
      let columns = ['Customer', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      let rows = [];

      const doc = new jsPDF({
          orientation: 'landscape',
          format: 'letter',
          unit: 'pt',
      });

      doc.setFontSize(18);
      doc.text(`Sides summary for week of ${moment(this.state.currentSelectorDate).add(1, 'w').startOf('isoWeek').format('dddd, MMMM D')}`, 40, 30);

      const sideSubscriptions = this.state.sidesSummary;

      sideSubscriptions.forEach(sub => {

        const rowToInsert = [];

        sub.customers.forEach(customer => {
          const toPush = [];

          if (customer.schedule.some(e => e.sides !== [])) {
            toPush[0] = customer.profile.name.first + " " + customer.profile.name.last || '';

            customer.schedule.forEach((e, i) => {

              if (e.sides) {
                if (e.sides.length > 0) {
                  let sideText = "";

                  e.sides.forEach(side => {
                    const currentSide = this.props.sides.find(s => s._id === side._id);
                    const currentVariant = currentSide.variants.find(v => v._id === side.variantId);
                    sideText += `• ${currentSide.title} ${currentVariant.name} x ${side.quantity} `;

                  });

                  toPush[i + 1] = sideText;
                }
              }

            })
          }

          rows.push(toPush);

        });

      });

      doc.autoTable(columns, rows, {
          startY: 80,
          styles: {
              overflow: 'linebreak',
              columnWidth: 90,
          },
          headerStyles: {
              fillColor: [0, 0, 0],
              fontSize: 10,
          },
          columnStyles: {
              fontSize: 9,
          }
          // afterPageContent: (data) => {
          //     let footerStr = `Page ${doc.internal.getNumberOfPages()}`;
          //     if (typeof doc.putTotalPages === 'function') {
          //         footerStr = `${footerStr} of ${totalPagesExp}`;
          //     }
          //     doc.setFontSize(8);
          //     doc.text(footerStr, data.settings.margin.right, doc.internal.pageSize.height - 10);
          // },
      });
      //
      // if (typeof doc.putTotalPages === 'function') {
      //     doc.putTotalPages(totalPagesExp);
      // }

      doc.save(`Plating_summary_${this.state.lifestyleTitle}_${this.state.mealTitle}_${moment(this.state.currentSelectorDate).format('dddd, MMMM D')}.pdf`);
  }

  compareLifestyles(a, b) {
    if (a.title > b.title) {
      return -1;
    }
    return 1;


    return 0;
  }

  fetchSidesSummary() {
    console.log("Going here");

    Meteor.call('fetchSidesSummary', (err, res) => {
      console.log(err);
      console.log(res);
      if (res) {
        if (typeof res === "string") {
            this.props.popTheSnackbar({
                message: 'No customers with sides found or there was an error with',
            });
        } else {
          this.setState({
              sidesSummary: res,
          }, () => {
            this.printSidesSummary();
          });
        }
      } else {
        this.props.popTheSnackbar({
            message: 'There was an error fetching the summarry for sides.',
        });
      }

    });
  }

  render() {
    return (
      <div>


        <Paper elevation={2} className="table-container">
          <div style={{ padding: '20px 20px 1em', borderBottom: '1px solid rgba(235, 235, 235, 1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography type="headline" gutterBottom style={{ fontWeight: 500 }}>Plating for {moment(this.props.currentSelectorDate).format('dddd, MMMM D')}</Typography>

              {moment(this.props.currentSelectorDate).isoWeekday() == 6 &&  (
                <Button onClick={this.fetchSidesSummary}>Print Sides Summary</Button>
              )}
          </div>
          <Table className="table-container plating-table" style={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('SKU')}>
                  <Typography className="body2" type="body2">Plan</Typography>
                </TableCell>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Meal type</Typography>
                </TableCell>

                {/* <TableCell padding="none" style={{ width: '14.28%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">No restrictions</Typography>
                </TableCell> */}

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Regular</Typography>
                </TableCell>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Athletic</Typography>
                </TableCell>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Bodybuilder</Typography>
                </TableCell>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Customers</Typography>
                </TableCell>

              </TableRow>
            </TableHead>
            <TableBody>

              {!this.state.aggregateDataLoading ? (

                this.props.lifestyles && !this.state.aggregateDataLoading && this.props.lifestyles.sort(this.compareLifestyles).map((lifestyle) => {
                  const dataCurrentLifestyle = this.state.aggregateData && this.state.aggregateData.tableData.find(el => el.id === lifestyle._id);

                  const mealTypeOrder = ['Breakfast', 'Lunch', 'Dinner', 'Chefs Choice Breakfast', 'Chefs Choice Lunch', 'Chefs Choice Dinner'];
                  const mapBy = [];

                  mealTypeOrder.forEach((e) => {
                    mapBy.push(this.props.meals.find(el => el.title === e));
                  });

                  return (

                    this.props.meals && mapBy.map((meal) => {
                      const mealTitle = getMealTitle(meal.title);

                      return (

                        <TableRow hover key={`${lifestyle._id} ${meal._id} `}>

                          <TableCell padding="none" style={{ width: '16.66%' }}>
                            <Typography className="subheading" type="subheading">{lifestyle.title}</Typography>

                          </TableCell>

                          <TableCell
                            style={{ paddingTop: '10px', paddingBottom: '10px', width: '16.66%' }}
                            padding="none"
                          >

                            <Typography className="subheading" type="subheading" style={{ color: 'rgba(0, 0, 0, .54)' }} >
                              {meal.title}
                            </Typography>

                          </TableCell>

                          <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                            <Typography type="subheading">
                              {dataCurrentLifestyle && dataCurrentLifestyle[mealTitle] && dataCurrentLifestyle[mealTitle].regular}
                            </Typography>
                          </TableCell>

                          <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                            <Typography type="subheading">
                              {dataCurrentLifestyle && dataCurrentLifestyle[mealTitle] && dataCurrentLifestyle[mealTitle].athletic}

                            </Typography>
                          </TableCell>

                          <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                            <Typography type="subheading">
                              {dataCurrentLifestyle && dataCurrentLifestyle[mealTitle] && dataCurrentLifestyle[mealTitle].bodybuilder}
                            </Typography>
                          </TableCell>

                          <TableCell
                            style={{ paddingTop: '10px', paddingBottom: '10px', width: '16.66%' }}
                            padding="none"
                          >

                            <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                              <Button onClick={() => this.openAssignDialog(lifestyle._id, meal._id)}>View</Button>
                            </Typography>

                          </TableCell>

                        </TableRow>
                      );
                    }));
                })
              ) : (
                <CircularProgress />
              )}

            </TableBody>

          </Table>
        </Paper>


        <Dialog
          fullWidth
          maxWidth={false}
          style={{ maxHeight: '100vh !important', margin: '0 !important' }}
          open={this.state.assignDialogOpen}
          onClose={this.closeAssignDialog}
          transition={Transition}
        >
          <AppBar className={this.props.classes.appBar}>
            <Toolbar>
              <Typography type="headline" color="inherit" className={this.props.classes.flex}>
                Customers - {this.state.lifestyleTitle} {this.state.mealTitle.toLowerCase()}
              </Typography>
              <Button color="inherit" onClick={this.printPopupSummary}>
                Print summary
              </Button>
              <Button color="inherit" onClick={this.printLabels}>
                Print labels
              </Button>
              <Tooltip title="Prints notes for all users with selected lifestyle">
                <Button color="inherit" onClick={this.printNotesLabels}>
                        Print notes
                </Button>
              </Tooltip>
              <IconButton color="inherit" onClick={this.closeAssignDialog} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Toolbar>

            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '20px' }}>
              {!this.state.aggregateDataLoading && this.state.lifestyleSelected !== '' ?
                (<Typography type="title" color="inherit">{this.getCurrentSelectionPlate('title')}</Typography>) : ''}
              {!this.state.aggregateDataLoading && this.state.lifestyleSelected !== '' ?
                (<Typography type="subheading" color="inherit">{this.getCurrentSelectionPlate('subtitle')}</Typography>) : ''}
              {!this.state.aggregateDataLoading && this.state.lifestyleSelected !== '' ?
                (<Typography type="body2" color="inherit">{this.getCurrentSelectionPlate('ingredients')}</Typography>) : ''}


              <Typography type="body2" color="inherit">With restrictions:
                Regular {this.usersWithoutRestrictions().regularRestrictionsCount} {' '}
                Athletic {this.usersWithoutRestrictions().athleticRestrictionsCount} {' '}
                Bodybuilder {this.usersWithoutRestrictions().bodybuilderRestrictionsCount}

              </Typography>

              <Typography type="body2" color="inherit">Without restrictions:
                Regular {this.usersWithoutRestrictions().regularWithoutRestrictionsCount} {' '}
                Athletic {this.usersWithoutRestrictions().athleticWithoutRestrictionsCount} {' '}
                Bodybuilder {this.usersWithoutRestrictions().bodybuilderWithoutRestrictionsCount}
              </Typography>
            </div>
          </AppBar>

          <Paper className={this.props.classes.root}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Lifestyle</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Portion</TableCell>
                  <TableCell>Preferences</TableCell>
                  <TableCell>Allergies</TableCell>
                  <TableCell>Allergies</TableCell>
                  <TableCell>Dietary</TableCell>
                  <TableCell>Religious</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!this.state.aggregateDataLoading &&
                  this.state.aggregateData.userData.filter(user => user.lifestyleId === this.state.lifestyleSelected &&
                    (user[getMealTitle(this.state.mealTitle)] > 0 ||
                      user[`athletic${getMealTitle(this.state.mealTitle, true)}`] > 0 ||
                      user[`bodybuilder${getMealTitle(this.state.mealTitle, true)}`] > 0)).sort((a, b) => {
                    let totalRestrictionsA = 0;
                    let totalRestrictionsB = 0;

                    if (a.specificRestrictions) {
                      totalRestrictionsA += a.specificRestrictions.length;
                    }

                    if (a.restrictions) {
                      totalRestrictionsA += a.restrictions.length;
                    }

                    if (a.preferences) {
                      totalRestrictionsA += a.preferences.length;
                    }

                    if (b.specificRestrictions) {
                      totalRestrictionsB += b.specificRestrictions.length;
                    }

                    if (b.restrictions) {
                      totalRestrictionsB += b.restrictions.length;
                    }

                    if (b.preferences) {
                      totalRestrictionsB += b.preferences.length;
                    }

                    return totalRestrictionsB - totalRestrictionsA;
                  }).map((n) => {
                    const mealType = getMealTitle(this.state.mealTitle);
                    const mealTypeInitialCaps = getMealTitle(this.state.mealTitle, true);
                    const cake = renderBirthdayCake(n.birthday, false);

                    return (
                      <TableRow key={Random.id()}>
                        <TableCell><Typography type="subheading">{n.name}{cake}</Typography></TableCell>
                        <TableCell><Typography type="subheading">{n.lifestyleName}</Typography></TableCell>
                        <TableCell><Typography type="subheading">{n.platingNotes && n.platingNotes.length > 0 ? n.platingNotes : ''}</Typography></TableCell>
                        <TableCell>
                          <Typography type="subheading">
                            {n[mealType] > 0 ? `Regular x${n[`${mealType}`]}` : ''}
                            {n[`athletic${mealTypeInitialCaps}`] > 0 ? `Athletic x${n[`athletic${mealTypeInitialCaps}`]}` : ''}
                            {n[`bodybuilder${mealTypeInitialCaps}`] > 0 ? `Bodybuilder x${n[`bodybuilder${mealTypeInitialCaps}`]}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell><Typography type="subheading">{n.preferences ? n.preferences.map(pref => pref.title).join(', ') : ''}</Typography></TableCell>
                        <TableCell><Typography type="subheading">{n.specificRestrictions ? n.specificRestrictions.map(restriction => restriction.title).join(', ') : ''}</Typography></TableCell>
                        <TableCell><Typography type="subheading">{n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'allergy').map(restriction => restriction.title).join(', ') : ''}</Typography></TableCell>
                        <TableCell><Typography type="subheading">{n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'dietary').map(restriction => restriction.title).join(', ') : ''}</Typography></TableCell>
                        <TableCell><Typography type="subheading">{n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'religious').map(restriction => restriction.title).join(', ') : ''}</Typography></TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Paper>
        </Dialog>

      </div>
    );
  }
}

PlatingTable.propTypes = {
  results: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  lifestyles: PropTypes.arrayOf(PropTypes.object).isRequired,
  meals: PropTypes.arrayOf(PropTypes.object).isRequired,
  plates: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withStyles(styles)(PlatingTable);
