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

import vittlebase64 from '../../../modules/vittlelogobase64';
import hmpbase64 from '../../../modules/hmplogobase64';


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

function renderUserDetailsOnPage(doc, userData, currentPlate, mealType, mealPortion, currentSelectorDate) {
  doc.addPage();

  // VITTLE LOGO
  // doc.addImage(vittlebase64, 'PNG', 1.78, 0.15, 0.4, 0.4);

  // HMP LOGO
  doc.addImage(hmpbase64, 'JPEG', 1.18, 0.15, 1.6, 0.19);

  // plating day + 1
  doc.setFontStyle('normal');
  doc.setFontSize(9);
  const day = moment(currentSelectorDate).add(1, 'd').format('M/D/YYYY');
  doc.text(day, 3.2, 0.55);


  // total meals for this customer
  doc.setFontStyle('normal');
  doc.setFontSize(9);
  const totalMeals = userData.breakfast +
    userData.athleticBreakfast +
    userData.bodybuilderBreakfast +
    userData.lunch +
    userData.athleticLunch +
    userData.bodybuilderLunch +
    userData.dinner +
    userData.athleticDinner +
    userData.bodybuilderDinner;

  doc.text(`${totalMeals}`, 0.25, 0.55);

  // name
  doc.setFontStyle('bold');
  doc.setFontSize(10);
  doc.text(`Made for ${userData.name}`, 0.25, 0.8);

  // plan name
  doc.setFontStyle('normal');
  doc.setFontSize(10);
  doc.text(`${userData.lifestyleName} ${mealType}`, 0.25, 1);

  // dish title
  doc.setFontStyle('bold');
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(currentPlate.plate.title, 3.25), 0.25, 1.2);

  // dish subtitle
  doc.setFontStyle('normal');
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(currentPlate.plate.subtitle, 3.25), 0.25, 1.4);

  // dish ingredients
  if (currentPlate.plate.ingredients && currentPlate.plate.ingredients.length > 0) {
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(`${currentPlate.plate.ingredients.map(ing => ing.title).join(', ')}`, 3.3), 0.25, 1.65);
  }

  // instructions
  if (currentPlate.hasOwnProperty('instruction')) {
    doc.setFontStyle('normal');
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(currentPlate.instruction.description, 3.25), 0.25, 2);
  }

  let restrictionsLine = '';
  let restrictionsPresent = false;
  const allRestrictions = [];

  // restrictions
  if (userData.hasOwnProperty('restrictions') && userData.restrictions != null) {
    // restrictionsLine += `Restrictions: ${userData.restrictions.map(rest => rest.title).join(', ')}`;
    restrictionsPresent = true;
    allRestrictions.push(...userData.restrictions.map(rest => rest.title));
  }

  if (userData.hasOwnProperty('specificRestrictions') && userData.specificRestrictions != null && userData.specificRestrictions.length > 0) {
    // restrictionsLine += `${restrictionsPresent ? '' : 'Restrictions: '}${userData.specificRestrictions.map(rest => rest.title).join(', ')}`;
    restrictionsPresent = true;
    allRestrictions.push(...userData.specificRestrictions.map(rest => rest.title));
  }

  if (userData.hasOwnProperty('preferences') && userData.preferences != null && userData.preferences.length > 0) {
    // restrictionsLine += `${restrictionsPresent ? '' : 'Restrictions: '}${userData.preferences.map(rest => rest.title).join(', ')}`;
    restrictionsPresent = true;
    allRestrictions.push(...userData.preferences.map(rest => rest.title));
  }

  if (restrictionsPresent) {
    restrictionsLine = `Restrictions: ${allRestrictions.join(', ')}`;
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(restrictionsLine, 3.25), 0.25, 2.2);
  }

  if (typeof currentPlate.plate.nutritional === 'object' && currentPlate.plate.nutritional.hasOwnProperty(mealPortion)) {
    // calories
    doc.setFontStyle('normal');
    doc.setFontSize(8);
    const calories = [currentPlate.plate.nutritional[mealPortion].calories, 'calories'];
    doc.text(calories, 2, 2.7);

    // protein
    doc.setFontSize(8);
    const protein = [currentPlate.plate.nutritional[mealPortion].proteins, 'protein'];
    doc.text(protein, 2.6, 2.7);

    // carbs
    doc.setFontSize(8);
    const carbs = [currentPlate.plate.nutritional[mealPortion].carbs, 'carbs'];
    doc.text(carbs, 3.1, 2.7);

    // fats
    doc.setFontSize(8);
    const fats = [currentPlate.plate.nutritional[mealPortion].fat, 'fats'];
    doc.text(fats, 3.55, 2.7);
  }

  if (userData.platingNotes) {
    doc.setFontStyle('normal');
    doc.setFontSize(8);
    doc.text('See plating notes', 0.25, 2.7);
  }
}


function renderSummary(doc, currentPlate, dataCurrentLifestyle, lifestyleTitle, mealTitle, currentSelectorDate, count) {
  doc.addPage();

  // VITTLE LOGO
  // doc.addImage(vittlebase64, 'PNG', 1.78, 0.15, 0.4, 0.4);

  // HMP LOGO
  doc.addImage(hmpbase64, 'JPEG', 1.18, 0.15, 1.6, 0.19);

  // plating day + 1
  doc.setFontStyle('normal');
  doc.setFontSize(9);
  const day = moment(currentSelectorDate).add(1, 'd').format('M/D/YYYY');
  doc.text(day, 3.2, 0.55);


  // total meals for this customer
  doc.setFontStyle('normal');
  doc.setFontSize(9);
  const totalMeals = dataCurrentLifestyle[mealTitle.toLowerCase()].regular +
    dataCurrentLifestyle[mealTitle.toLowerCase()].athletic +
    dataCurrentLifestyle[mealTitle.toLowerCase()].bodybuilder;

  doc.text(`${totalMeals}`, 0.25, 0.55);

  doc.setFontStyle('normal');
  doc.setFontSize(14);
  doc.text(`${lifestyleTitle} ${mealTitle}`, 0.25, 1);

  // dish title
  doc.setFontStyle('bold');
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(currentPlate.plate.title, 3.25), 0.25, 1.3);

  // dish subtitle
  doc.setFontStyle('normal');
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(currentPlate.plate.subtitle, 3.25), 0.25, 1.5);


  // dish ingredients
  if (currentPlate.plate.ingredients && currentPlate.plate.ingredients.length > 0) {
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(`${currentPlate.plate.ingredients.map(ing => ing.title).join(', ')}`, 3.3), 0.25, 1.75);
  }

  doc.setFontSize(8);
  doc.text(`With restrictions: Regular ${count.regularRestrictionsCount} Athletic ${count.athleticRestrictionsCount} Bodybuilder ${count.bodybuilderRestrictionsCount}`, 0.25, 2.2);

  doc.setFontSize(8);
  doc.text(`Without restrictions: Regular ${count.regularWithoutRestrictionsCount} Athletic ${count.athleticWithoutRestrictionsCount} Bodybuilder ${count.bodybuilderWithoutRestrictionsCount}`, 0.25, 2.35);


  // Regular
  const regularText = `${dataCurrentLifestyle[mealTitle.toLowerCase()].regular}`;
  doc.setFontStyle('bold');
  doc.setFontSize(11);
  const regular = [regularText, 'Regular'];
  doc.text(regular, 0.75, 2.6);

  // Athletic
  const athleticText = `${dataCurrentLifestyle[mealTitle.toLowerCase()].athletic}`;
  doc.setFontSize(11);
  const athletic = [athleticText, 'Athletic'];
  doc.text(athletic, 1.6, 2.6);

  // Bodybuilder
  const bodybuilderText = `${dataCurrentLifestyle[mealTitle.toLowerCase()].bodybuilder}`;
  doc.setFontSize(11);
  const bodybuilder = [bodybuilderText, 'Bodybuilder'];
  doc.text(bodybuilder, 2.4, 2.6);
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


    this.getCurrentSelectionPlate = this.getCurrentSelectionPlate.bind(this);


    this.openAssignDialog = this.openAssignDialog.bind(this);
    this.closeAssignDialog = this.closeAssignDialog.bind(this);

    // this.printSummary = this.printSummary.bind(this);

    this.printPopupSummary = this.printPopupSummary.bind(this);
    this.printLabels = this.printLabels.bind(this);

    this.usersWithoutRestrictions = this.usersWithoutRestrictions.bind(this);
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
      }, () => {
        Meteor.call('getPlatingAggregatedData', this.props.currentSelectorDate, (err, res) => {
          this.setState({
            aggregateData: res,
          }, () => {
            this.setState({ aggregateDataLoading: false });
          });
        });
      });
    }
  }

  getCurrentSelectionPlate(what) {
    if (!this.state.aggregateDataLoading && this.state.lifestyleSelected && this.state.mealSelected) {
      const lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
      const currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);

      if (lifestylePlates.length === 0 || !currentPlate) {
        return;
      }

      if (what == 'title') {
        return currentPlate.plate && currentPlate.plate.title ? currentPlate.plate.title : '';
      } else if (what == 'subtitle') {
        return currentPlate.plate && currentPlate.plate.subtitle ? currentPlate.plate.subtitle : '';
      } else if (what == 'ingredients') {
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

  printLabels() {
    if (this.state.aggregateDataLoading) {
      return;
    }

    const userDataNew = this.state.aggregateData.userData.filter(user => user.lifestyleId == this.state.lifestyleSelected
      && (user[this.state.mealTitle.toLowerCase()] > 0 ||
        user[`athletic${this.state.mealTitle}`] > 0 ||
        user[`bodybuilder${this.state.mealTitle}`] > 0)).sort((a, b) => {
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

    const lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
    const currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);

    if (lifestylePlates.length === 0 || !currentPlate) {
      this.props.popTheSnackbar({
        message: `Could not find a dish for ${this.state.lifestyleTitle} ${this.state.mealTitle}. Please assign a dish.`,
      });

      return;
    }

    const dataCurrentLifestyle = this.state.aggregateData && this.state.aggregateData.tableData.find(el => el.id === this.state.lifestyleSelected);


    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 3],
    });

    // const aggregatedUsers = this.state.aggregateData.userData;
    // this.state.aggregateData.userData.filter(user => user.lifestyleId == this.state.lifestyleSelected &&
    //   user[this.state.mealTitle.toLowerCase()] > 0 ||
    //   user[`athletic${this.state.mealTitle}`] > 0 ||
    //   user[`bodybuilder${this.state.mealTitle}`] > 0)

    userDataNew.forEach((userData, index) => {
      if (this.state.mealTitle === 'Breakfast') {
        if (userData.breakfast > 0) {
          for (let i = 1; i <= userData.breakfast; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Breakfast', 'regular', this.props.currentSelectorDate);
          }
        }

        if (userData.athleticBreakfast > 0) {
          for (let i = 1; i <= userData.athleticBreakfast; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Breakfast (Athletic)', 'athletic', this.props.currentSelectorDate);
          }
        }

        if (userData.bodybuilderBreakfast > 0) {
          for (let i = 1; i <= userData.bodybuilderBreakfast; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Breakfast (Bodybuilder)', 'bodybuilder', this.props.currentSelectorDate);
          }
        }
      }// Breakfast

      if (this.state.mealTitle === 'Dinner') {
        if (userData.dinner > 0) {
          for (let i = 1; i <= userData.dinner; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Dinner', 'regular', this.props.currentSelectorDate);
          }
        }

        if (userData.athleticDinner > 0) {
          for (let i = 1; i <= userData.athleticDinner; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Dinner (Athletic)', 'athletic', this.props.currentSelectorDate);
          }
        }

        if (userData.bodybuilderDinner > 0) {
          for (let i = 1; i <= userData.bodybuilderDinner; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Dinner (Bodybuilder)', 'bodybuilder', this.props.currentSelectorDate);
          }
        }
      } // Dinner

      if (this.state.mealTitle === 'Lunch') {
        if (userData.lunch > 0) {
          for (let i = 1; i <= userData.lunch; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Lunch', 'regular', this.props.currentSelectorDate);
          }
        }

        if (userData.athleticLunch > 0) {
          for (let i = 1; i <= userData.athleticLunch; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Lunch (Athletic)', 'athletic', this.props.currentSelectorDate);
          }
        }

        if (userData.bodybuilderLunch > 0) {
          for (let i = 1; i <= userData.bodybuilderLunch; i++) {
            renderUserDetailsOnPage(doc, userData, currentPlate, 'Lunch (Bodybuilder)', 'bodybuilder', this.props.currentSelectorDate);
          }
        }
      } // Lunch
    }); // map

    renderSummary(doc, currentPlate, dataCurrentLifestyle, this.state.lifestyleTitle, this.state.mealTitle, this.props.currentSelectorDate, this.usersWithoutRestrictions());

    doc.deletePage(1);


    doc.save(`Plating_${this.state.lifestyleTitle} _${this.state.mealTitle} _${new Date().toDateString()} `);
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
    if (this.state.aggregateDataLoading || this.state.lifestyleSelected == '' || this.state.mealSelected == '') {
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
      if (user.lifestyleId == this.state.lifestyleSelected && (user[this.state.mealTitle.toLowerCase()] > 0 ||
        user[`athletic${this.state.mealTitle}`] > 0 ||
        user[`bodybuilder${this.state.mealTitle}`] > 0)) {
        if ((user.restrictions && user.restrictions.length > 0) ||
          (user.specificRestrictions && user.specificRestrictions.length > 0) ||
          (user.preferences && user.preferences.length > 0)) {
          count.regularRestrictionsCount += user[this.state.mealTitle.toLowerCase()];
          count.athleticRestrictionsCount += user[`athletic${this.state.mealTitle}`];
          count.bodybuilderRestrictionsCount += user[`bodybuilder${this.state.mealTitle}`];

          return false;
        }

        count.regularWithoutRestrictionsCount += user[this.state.mealTitle.toLowerCase()];
        count.athleticWithoutRestrictionsCount += user[`athletic${this.state.mealTitle}`];
        count.bodybuilderWithoutRestrictionsCount += user[`bodybuilder${this.state.mealTitle}`];

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

    const lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
    const currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);

    if (lifestylePlates.length === 0 || !currentPlate) {
      this.props.popTheSnackbar({
        message: `Could not find a dish for ${this.state.lifestyleTitle} ${this.state.mealTitle}. Please assign a dish.`,
      });

      return;
    }

    this.state.aggregateData.userData.filter(user => user.lifestyleId == this.state.lifestyleSelected &&
      (user[this.state.mealTitle.toLowerCase()] > 0 ||
        user[`athletic${this.state.mealTitle}`] > 0 ||
        user[`bodybuilder${this.state.mealTitle}`] > 0)).sort((a, b) => {
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
          const mealType = this.state.mealTitle.toLowerCase();
          const mealTypeNormal = this.state.mealTitle;

          let mealText = '';

          if (n[mealType] > 0) {
            mealText += `Regular x${n[`${mealType}`]}`;
          }

          if (n[`athletic${mealTypeNormal}`] > 0) {
            mealText += `${mealText.length > 0 ? ' ' : ''}Athletic x${n[`athletic${mealTypeNormal}`]}`;
          }

          if (n[`bodybuilder${mealTypeNormal}`] > 0) {
            mealText += `${mealText.length > 0 ? ' ' : ''}Bodybuilder x${n[`bodybuilder${mealTypeNormal}`]}`;
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
        fontSize: 8,
        // fontSize: 15
      },
      afterPageContent: (data) => {
        let footerStr = `Page ${doc.internal.getNumberOfPages()}`;
        if (typeof doc.putTotalPages === 'function') {
          footerStr = `${footerStr} of ${totalPagesExp}`;
        }
        doc.setFontSize(10);
        doc.text(footerStr, data.settings.margin.right, doc.internal.pageSize.height - 10);
      },
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }


    doc.save(`Plating_summary_${this.state.lifestyleTitle}_${this.state.mealTitle}_${moment(this.state.currentSelectorDate).format('dddd, MMMM D')}.pdf`);
  }

  render() {
    return (
      <div>


        <Paper elevation={2} className="table-container">
          <div style={{ padding: '20px 20px 1em', borderBottom: '1px solid rgba(235, 235, 235, 1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography type="headline" gutterBottom style={{ fontWeight: 500 }}>Plating for {moment(this.props.currentSelectorDate).format('dddd, MMMM D')}</Typography>
            {/* <Button style={{ float: 'right' }} onClick={this.printSummary}>Print plating summary</Button> */}
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

                this.props.lifestyles && !this.state.aggregateDataLoading && this.props.lifestyles.map((lifestyle) => {
                  const dataCurrentLifestyle = this.state.aggregateData && this.state.aggregateData.tableData.find(el => el.id === lifestyle._id);

                  return (
                    this.props.meals && this.props.meals.filter(el => el.type === 'Main' || el.type === 'Main Course').map(meal => (

                      <TableRow hover key={`${lifestyle._id} ${meal._id} `}>

                        <TableCell padding="none" style={{ width: '16.66%' }}>
                          <Typography className="subheading" type="subheading">{lifestyle.title}</Typography>

                        </TableCell>

                        {/* <TableCell padding="none" style={{ width: '14.28%' }}>
                          <Typography className="subheading" type="subheading">{!this.state.aggregateDataLoading &&
                            this.state.aggregateData.userData.reduce((accumulator, user) => {

                              if (user.specificRestrictions) {
                                if (user.specificRestrictions.length > 0) {
                                  return 0;
                                }
                              }

                              if (user.restrictions) {
                                if (user.restrictions.length > 0) {
                                  return 0;
                                }
                              }

                              if (user.preferences) {
                                if (user.preferences.length > 0) {
                                  return 0;
                                }
                              }

                              return accumulator + user[meal.title.toLowerCase()].regular + user[meal.title.toLowerCase()].athletic + user[meal.title.toLowerCase()].bodybuilder;

                            }, 0)

                          }</Typography>

                        </TableCell> */}
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
                            {dataCurrentLifestyle && dataCurrentLifestyle[meal.title.toLowerCase()] && dataCurrentLifestyle[meal.title.toLowerCase()].regular}
                          </Typography>
                        </TableCell>

                        <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                          <Typography type="subheading">
                            {dataCurrentLifestyle && dataCurrentLifestyle[meal.title.toLowerCase()] && dataCurrentLifestyle[meal.title.toLowerCase()].athletic}

                          </Typography>
                        </TableCell>

                        <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                          <Typography type="subheading">
                            {dataCurrentLifestyle && dataCurrentLifestyle[meal.title.toLowerCase()] && dataCurrentLifestyle[meal.title.toLowerCase()].bodybuilder}
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

                    )));
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
              <IconButton color="inherit" onClick={this.closeAssignDialog} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Toolbar>

            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '20px' }}>
              {!this.state.aggregateDataLoading && this.state.lifestyleSelected != '' ?
                (<Typography type="title" color="inherit">{this.getCurrentSelectionPlate('title')}</Typography>) : ''}
              {!this.state.aggregateDataLoading && this.state.lifestyleSelected != '' ?
                (<Typography type="subheading" color="inherit">{this.getCurrentSelectionPlate('subtitle')}</Typography>) : ''}
              {!this.state.aggregateDataLoading && this.state.lifestyleSelected != '' ?
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
                  this.state.aggregateData.userData.filter(user => user.lifestyleId == this.state.lifestyleSelected &&
                    (user[this.state.mealTitle.toLowerCase()] > 0 ||
                      user[`athletic${this.state.mealTitle}`] > 0 ||
                      user[`bodybuilder${this.state.mealTitle}`] > 0)).sort((a, b) => {
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
                        const mealType = this.state.mealTitle.toLowerCase();
                        const mealTypeNormal = this.state.mealTitle;

                        return (
                          <TableRow key={Random.id()}>
                            <TableCell><Typography type="subheading">{n.name}</Typography></TableCell>
                            <TableCell><Typography type="subheading">{n.lifestyleName}</Typography></TableCell>
                            <TableCell><Typography type="subheading">{n.platingNotes && n.platingNotes.length > 0 ? n.platingNotes : ''}</Typography></TableCell>
                            <TableCell>
                              <Typography type="subheading">
                                {n[mealType] > 0 ? `Regular x${n[`${mealType}`]}` : ''}
                                {n[`athletic${mealTypeNormal}`] > 0 ? `Athletic x${n[`athletic${mealTypeNormal}`]}` : ''}
                                {n[`bodybuilder${mealTypeNormal}`] > 0 ? `Bodybuilder x${n[`bodybuilder${mealTypeNormal}`]}` : ''}
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

      </div >
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
