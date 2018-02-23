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

import moment from 'moment';

import sumBy from 'lodash/sumBy';

import Loading from '../../components/Loading/Loading';
import Slide from 'material-ui/transitions/Slide';
import jsPDF from 'jspdf';
import vittlebase64 from '../../../modules/vittlelogobase64';


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

function renderUserDetailsOnPage(doc, userData, currentPlate, mealType, mealPortion) {
  doc.addPage();

  doc.addImage(vittlebase64, 'PNG', 1.78, 0.15, 0.4, 0.4);

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
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(`${currentPlate.plate.ingredients.map(ing => ing.title).join(', ')}`, 3.75), 0.25, 1.65);
  }

  // instructions
  if (currentPlate.hasOwnProperty('instructions')) {
    doc.setFontStyle('normal');
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(currentPlate.instructions, 3.25), 0.25, 2);
  }

  // restrictions
  if (userData.hasOwnProperty('restrictions') && userData.restrictions != null) {
    doc.setFontStyle('bold');
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(`Restrictions: ${userData.restrictions.map(rest => rest.title).join(', ')}`, 3.25), 0.25, 2.2);
  }

  console.log(currentPlate.plate.nutritional);
  console.log(currentPlate.plate.nutritional[mealPortion]);

  if (typeof currentPlate.plate.nutritional === "object" && currentPlate.plate.nutritional.hasOwnProperty(mealPortion)) {
    //calories
    doc.setFontStyle("normal");
    doc.setFontSize(9);
    const calories = [currentPlate.plate.nutritional[mealPortion].calories, "calories"];
    doc.text(calories, 2, 2.65);

    //protein
    doc.setFontSize(9);
    const protein = [currentPlate.plate.nutritional[mealPortion].proteins, "protein"];
    doc.text(protein, 2.6, 2.65);

    //carbs
    doc.setFontSize(9);
    const carbs = [currentPlate.plate.nutritional[mealPortion].carbs, "carbs"];
    doc.text(carbs, 3.1, 2.65);

    //fats
    doc.setFontSize(9);
    const fats = [currentPlate.plate.nutritional[mealPortion].fat, "fats"];
    doc.text(fats, 3.55, 2.65);
  }
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

    this.openAssignDialog = this.openAssignDialog.bind(this);
    this.closeAssignDialog = this.closeAssignDialog.bind(this);

    this.printLabels = this.printLabels.bind(this);
  }

  componentDidMount() {
    Meteor.call('getPlatingAggregatedData', this.props.currentSelectorDate, (err, res) => {
      this.setState({
        aggregateData: res,
      }, () => {
        this.setState({ aggregateDataLoading: false });
      });

      console.log(res);
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
    // console.log(this.props.currentSelectorDate);
    // console.log(this.state.lifestyleSelected);
    // console.log(this.state.mealSelected);



    if (this.state.aggregateDataLoading) {
      return;
    }

    const lifestylePlates = this.state.aggregateData.plates.find(e => e._id === this.state.lifestyleSelected).plates[0];
    const currentPlate = lifestylePlates.find(e => e.mealId === this.state.mealSelected);

    console.log(currentPlate);

    if (lifestylePlates.length === 0 || !currentPlate) {
      this.props.popTheSnackbar({
        message: `Could not find a dish for ${this.state.lifestyleTitle} ${this.state.mealTitle}.Please assign a dish.`,
      });

      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 3],
    });

    const aggregatedUsers = this.state.aggregateData.userData;

    aggregatedUsers.filter(user => user.lifestyleId == this.state.lifestyleSelected &&
      user[this.state.mealTitle.toLowerCase()] > 0 ||
      user[`athletic${this.state.mealTitle}`] > 0 ||
      user[`bodybuilder${this.state.mealTitle}`] > 0).forEach((userData, index) => {


        if (this.state.mealTitle === 'Breakfast') {
          if (userData.breakfast > 0) {
            for (let i = 1; i <= userData.breakfast; i++) {

              renderUserDetailsOnPage(doc, userData, currentPlate, 'Breakfast', 'regular');
            }
          }

          if (userData.athleticBreakfast > 0) {
            for (let i = 1; i <= userData.athleticBreakfast; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Breakfast (Athletic)', 'athletic');
            }
          }

          if (userData.bodybuilderBreakfast > 0) {
            for (let i = 1; i <= userData.bodybuilderBreakfast; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Breakfast (Bodybuilder)', 'bodybuilder');
            }
          }
        }// Breakfast

        if (this.state.mealTitle === 'Dinner') {
          if (userData.dinner > 0) {
            for (let i = 1; i <= userData.dinner; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Dinner', 'regular');

            }
          }

          if (userData.athleticDinner > 0) {
            for (let i = 1; i <= userData.athleticDinner; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Dinner (Athletic)', 'athletic');

            }
          }

          if (userData.bodybuilderDinner > 0) {
            for (let i = 1; i <= userData.bodybuilderDinner; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Dinner (Bodybuilder)', 'bodybuilder');
            }
          }
        } // Dinner

        if (this.state.mealTitle === 'Lunch') {
          if (userData.lunch > 0) {
            for (let i = 1; i <= userData.lunch; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Lunch', 'regular');
            }
          }

          if (userData.athleticLunch > 0) {
            for (let i = 1; i <= userData.athleticLunch; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Lunch (Athletic)', 'athletic');

            }
          }

          if (userData.bodybuilderLunch > 0) {
            for (let i = 1; i <= userData.bodybuilderLunch; i++) {
              renderUserDetailsOnPage(doc, userData, currentPlate, 'Lunch (Bodybuilder)', 'bodybuilder');

            }
          }
        } // Lunch

        // console.log(userData);
      }); // map

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

  render() {
    return (
      <div>
        <Paper elevation={2} className="table-container">

          <Table className="table-container plating-table" style={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('SKU')}>
                  <Typography className="body2" type="body2">Plan</Typography>
                </TableCell>

                <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Meal type</Typography>
                </TableCell>

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
                  <Typography className="body2" type="body2">Customer</Typography>
                </TableCell>

              </TableRow>
            </TableHead>
            <TableBody>

              {this.props.lifestyles && !this.state.aggregateDataLoading && this.props.lifestyles.map((lifestyle) => {
                const dataCurrentLifestyle = this.state.aggregateData && this.state.aggregateData.tableData.find(el => el.id === lifestyle._id);

                return (
                  this.props.meals && this.props.meals.filter(el => el.type === 'Main' || el.type === 'Main Course').map(meal => (

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
              })}


              {/* {this.renderNoResults(this.props.count)} */}

            </TableBody>

          </Table>
        </Paper>

        <Dialog
          fullWidth
          maxWidth={false}
          style={{ maxHeight: '100% !important', margin: '0', height: '100%' }}
          open={this.state.assignDialogOpen}
          onClose={this.closeAssignDialog}
          transition={Transition}
        >
          <AppBar className={this.props.classes.appBar}>
            <Toolbar>
              <Typography type="title" color="inherit" className={this.props.classes.flex}>
                Customers - {this.state.lifestyleTitle} {this.state.mealTitle.toLowerCase()}
              </Typography>
              <Button color="inherit" onClick={this.printLabels}>
                Print
              </Button>
              <IconButton color="inherit" onClick={this.closeAssignDialog} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Paper className={this.props.classes.root}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Lifestyle</TableCell>
                  <TableCell>Portion</TableCell>
                  <TableCell>Specific Restrictions</TableCell>
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
                      user[`bodybuilder${this.state.mealTitle}`] > 0)).map((n) => {
                        const mealType = this.state.mealTitle.toLowerCase();
                        const mealTypeNormal = this.state.mealTitle;

                        console.log(n);

                        return (
                          <TableRow key={Random.id()}>
                            <TableCell><Typography type="subheading">{n.name}</Typography></TableCell>
                            <TableCell><Typography type="subheading">{n.lifestyleName}</Typography></TableCell>
                            <TableCell>
                              <Typography type="subheading">
                                {n[mealType] > 0 ? `Regular x${n[`${mealType}`]}` : ''}
                                {n[`athletic${mealTypeNormal}`] > 0 ? `Athletic x${n[`athletic${mealTypeNormal}`]}` : ''}
                                {n[`bodybuilder${mealTypeNormal}`] > 0 ? `Bodybuilder x${n[`bodybuilder${mealTypeNormal}`]}` : ''}
                              </Typography>
                            </TableCell>
                            <TableCell><Typography type="subheading">{n.specificRestrictions ? n.specificRestrictions.map(restriction => restriction.title) : ''}</Typography></TableCell>
                            <TableCell><Typography type="subheading">{n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'allergy').map(restriction => restriction.title) : ''}</Typography></TableCell>
                            <TableCell><Typography type="subheading">{n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'dietary').map(restriction => restriction.title) : ''}</Typography></TableCell>
                            <TableCell><Typography type="subheading">{n.restrictions != null ? n.restrictions.filter(e => e.restrictionType === 'religious').map(restriction => restriction.title) : ''}</Typography></TableCell>
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
