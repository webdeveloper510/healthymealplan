import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

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

import List, { ListItem, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

import $ from 'jquery';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';

import moment from 'moment';

import sumBy from 'lodash/sumBy';

import { createContainer } from 'meteor/react-meteor-data';
import Loading from '../../components/Loading/Loading';
import Slide from 'material-ui/transitions/Slide';

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

    this.handleMealAssignment = this.handleMealAssignment.bind(this);
    this.handleMealReassignment = this.handleMealReassignment.bind(this);

    this.renderPresentPlate = this.renderPresentPlate.bind(this);
    this.getPlannerId = this.getPlannerId.bind(this);
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

  closeAssignDialog() {
    this.setState({
      selectedLifestyle: '',
      selectedMeal: '',
      selectedPlate: '',
      assignDialogOpen: false,
    });
  }

  rowSelected(e, event, checked) {
    console.log(checked);

    const selectedRowId = event.target.parentNode.parentNode.getAttribute('id');
    $(`.${selectedRowId}`).toggleClass('row-selected');
    let currentlySelectedCheckboxes;

    const clonedSelectedCheckboxes = this.state.selectedCheckboxes ? this.state.selectedCheckboxes.slice() : [];

    if ($(event.target).prop('checked')) {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber + 1;
      clonedSelectedCheckboxes.push(e._id);
    } else {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber - 1;
      clonedSelectedCheckboxes.splice(clonedSelectedCheckboxes.indexOf(e._id), 1);
    }

    this.setState({
      selectedCheckboxesNumber: currentlySelectedCheckboxes,
      selectedCheckboxes: clonedSelectedCheckboxes,
    });
  }

  selectAllRows(event) {
    let allCheckboxIds = [];
    console.log(event.target);

    if ($(event.target).prop('checked')) {
      $('.row-checkbox').each((index, el) => {
        // make the row selected
        $(`.${el.getAttribute('id')}`).addClass('row-selected');

        // push the ids to a array
        allCheckboxIds.push(el.getAttribute('id'));

        // set each checkbox checked
        $(el).children().find('input[type="checkbox"]').prop('checked', true);
      });
    } else {
      allCheckboxIds = [];

      $('.row-checkbox').each((index, el) => {
        // // make the row selected
        $(`.${el.getAttribute('id')}`).removeClass('row-selected');

        // set each checkbox checked
        $(el).children().find('input[type="checkbox"]').prop('checked', false);
      });
    }

    this.setState({
      selectedCheckboxesNumber: allCheckboxIds.length,
      selectedCheckboxes: allCheckboxIds,
    });
  }

  handleMealAssignment() {
    localStorage.setItem('mealAssigned', this.state.selectedSugestion.title);
    console.log(this.props.currentSelectorDate);
    console.log(this.state.lifestyleSelected);
    console.log(this.state.mealSelected);
    console.log(this.state.selectedSugestion._id);

    Meteor.call('mealPlanner.insert',
      this.props.currentSelectorDate,
      this.state.lifestyleSelected,
      this.state.mealSelected,
      this.state.selectedSugestion._id, (error) => {
        if (error) {
          this.props.popTheSnackbar({
            message: error.reason,
          });
        } else {
          this.props.popTheSnackbar({
            message: `${localStorage.getItem('mealAssigned')} has been assigned.`,
          });
        }
      });

    this.setState({
      assignDialogOpen: false,
      selectedSuggestion: null,
      lifestyleSelected: null,
      mealSelected: null,
    });
  }

  handleMealReassignment() {
    localStorage.setItem('mealReassigned', this.state.selectedSugestion.title);

    Meteor.call('mealPlanner.update', this.props.currentSelectorDate, this.state.reassignPlannerId, this.state.selectedSugestion._id, (error) => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('mealReassigned')} meal has been assigned.`,
        });
      }
    });

    this.setState({
      reassignDialogOpen: false,
      selectedSuggestion: null,
      reassignPlannerId: null,
    });
  }

  renderNoResults(count) {
    if (count == 0) {
      return (
        <p style={{ padding: '25px' }} className="subheading">No result found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo; on {moment(this.props.currentSelectorDate).format('DD MMMM, YYYY')}</p>
      );
    }
  }

  isCheckboxSelected(id) {
    if (this.state.selectedCheckboxes.length) {
      if (this.state.selectedCheckboxes.indexOf(id) !== -1) {
        return true;
      }
    }

    return false;
  }

  isPlateAssigned(results, lifestyleId, mealId) {
    if (results.findIndex(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId) !== -1) {
      return true;
    }

    return false;
  }

  getPlannerId(results, lifestyleId, mealId) {
    const foundResult = results.find(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId && el.onDate === this.props.currentSelectorDate) !== -1;

    if (foundResult) {
      return foundResult._id;
    }
  }

  renderPresentPlate(results, lifestyleId, mealId, date) {
    const plateToReturn = results.find(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId && el.onDate === date);
    return (<Typography type="subheading">{plateToReturn.plate.title}</Typography>);
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

              {this.props.lifestyles && !this.aggregateDataLoading && this.props.lifestyles.map((lifestyle) => {
                const dataCurrentLifestyle = this.state.aggregateData && this.state.aggregateData.tableData.find(el => el.id === lifestyle._id);

                return (
                  this.props.meals && this.props.meals.filter(el => el.type === 'Main' || el.type === 'Main Course').map(meal => (

                    <TableRow hover key={`${lifestyle._id}${meal._id}`}>

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
                          {dataCurrentLifestyle && dataCurrentLifestyle[meal.title.toLowerCase()].regular}
                        </Typography>
                      </TableCell>

                      <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                        <Typography type="subheading">
                          {dataCurrentLifestyle && dataCurrentLifestyle[meal.title.toLowerCase()].athletic}

                        </Typography>
                      </TableCell>

                      <TableCell padding="none" style={{ width: '16.66%' }} onClick={() => this.props.sortByOptions('title')}>
                        <Typography type="subheading">
                          {dataCurrentLifestyle && dataCurrentLifestyle[meal.title.toLowerCase()].bodybuilder}
                        </Typography>
                      </TableCell>

                      <TableCell
                        style={{ paddingTop: '10px', paddingBottom: '10px', width: '16.66%' }}
                        padding="none"
                      >
                        {this.props.results.length > 0 && this.isPlateAssigned(this.props.results, lifestyle._id, meal._id) ? (
                          <div>
                            {this.renderPresentPlate(this.props.results, lifestyle._id, meal._id, this.props.currentSelectorDate)}
                            <Button onClick={() => this.openAssignDialog(lifestyle._id, meal._id,
                              this.getPlannerId(this.props.results, lifestyle._id, meal._id))}
                            >Reassign</Button>
                          </div>
                        ) : (
                            <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                              <Button onClick={() => this.openAssignDialog(lifestyle._id, meal._id)}>View</Button>
                            </Typography>
                          )
                        }

                      </TableCell>

                    </TableRow>

                  )));
              })}


              {/* {this.renderNoResults(this.props.count)} */}

            </TableBody>

          </Table>
        </Paper>

        <Dialog fullscreen={true} fullWidth={true} maxWidth={false} style={{ maxHeight: '100% !important', margin: '0', height: '100%' }}
          open={this.state.assignDialogOpen} onClose={this.closeAssignDialog} transition={Transition}>
          <AppBar className={this.props.classes.appBar}>
            <Toolbar>
              <Typography variant="title" type="title" color="inherit" className={this.props.classes.flex}>
                Customers - {this.state.lifestyleTitle} {this.state.mealTitle.toLowerCase()}
              </Typography>
              <Button color="inherit">
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
                  this.state.aggregateData.userData.
                    filter(user => user.lifestyleId == this.state.lifestyleSelected &&
                      (user[`${this.state.mealTitle.toLowerCase()}`] > 0 ||
                        user[`athletic${this.state.mealTitle}`] > 0 ||
                        user[`bodybuilder${this.state.mealTitle}`] > 0)).map(n => {

                          const mealType = this.state.mealTitle.toLowerCase();
                          const mealTypeNormal = this.state.mealTitle;

                          return (
                            <TableRow>
                              <TableCell><Typography type="subheading">{n.name}</Typography></TableCell>
                              <TableCell><Typography type="subheading">{n.lifestyleName}</Typography></TableCell>
                              <TableCell>
                                <Typography type="subheading">
                                  {n[`${mealType}`] > 0 ? `Regular x${n[`${mealType}`]}` : ''}
                                  {n[`athletic${mealTypeNormal}`] > 0 ? `Athletic x${n[`athletic${mealTypeNormal}`]}` : ''}
                                  {n[`bodybuilder${mealTypeNormal}`] > 0 ? `Bodybuilder x${n[`bodybuilder${mealTypeNormal}`]}` : ''}
                                </Typography>
                              </TableCell>
                              <TableCell><Typography type="subheading">{n.specificRestrictions ? n.specificRestrictions.map(restriction => { restriction.title }) : ''}</Typography></TableCell>
                              <TableCell><Typography type="subheading">{n.restrictions ? n.restrictions.filter(e => e.type === "allergy").map(restriction => { restriction.title }) : ''}</Typography></TableCell>
                              <TableCell><Typography type="subheading">{n.restrictions ? n.restrictions.filter(e => e.type === "dietary").map(restriction => { restriction.title }) : ''}</Typography></TableCell>
                              <TableCell><Typography type="subheading">{n.restrictions ? n.restrictions.filter(e => e.type === "religious").map(restriction => { restriction.title }) : ''}</Typography></TableCell>
                            </TableRow>
                          );
                        })}
              </TableBody>
            </Table>
          </Paper>

          {/* <DialogActions>
            <Button onClick={this.closeAssignDialog} color="default">
              Cancel
            </Button>
            <Button stroked onClick={this.handleMealAssignment} color="default">
              Print
            </Button>
          </DialogActions> */}
        </Dialog>


      </div >
    );
  }
}

PlatingTable.propTypes = {
  results: PropTypes.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  categoryCount: PropTypes.number.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  lifestyles: PropTypes.arrayOf(PropTypes.object).isRequired,
  meals: PropTypes.arrayOf(PropTypes.object).isRequired,
  plates: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withStyles(styles)(PlatingTable);
