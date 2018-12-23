import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';

import $ from 'jquery';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Input from 'material-ui/Input';
import Select from 'material-ui/Select';
import Menu from 'material-ui/Menu';
import { MenuItem } from 'material-ui/Menu';
import Grid from 'material-ui/Grid';
import { Divider } from 'material-ui';

import moment from 'moment';
import autoBind from 'react-autobind';

import sumBy from 'lodash/sumBy';
import Autosuggest from 'react-autosuggest';
import CloseIcon from 'material-ui-icons/Close';
import LaunchIcon from 'material-ui-icons/Launch';
import EditIcon from 'material-ui-icons/Edit';

import Loading from '../../components/Loading/Loading';

import './MealPlannerTable.scss';

class MealPlannerTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      plates: this.props.plates ? this.props.plates : [],
      value: '',
      // selectedCheckboxes: [],
      // selectedCheckboxesNumber: 0,
      // updateDialogOpen: false,
      selectedSugestion: null,

      currentSelectorDate: this.props.currentSelectorDate,

      assignDialogOpen: false,
      assignResult: null,

      mealSelected: null,
      lifestyleSelected: null,


      reassignDialogOpen: false,

      reassignResult: null,
      reassignPlannerId: '',
      reassignOnDate: null,

      selectedPreset: 'none',
      presetDialogOpen: false,

    };

    autoBind(this);

    this.weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }

  openAssignDialog(lifestyleId, mealId, plannerViewWeekDate = null) {
    const lifestyle = this.props.lifestyles.find(el => el._id === lifestyleId);
    const meal = this.props.meals.find(el => el._id === mealId);

    const assignResult = {
      lifestyle,
      meal,
    };

    this.setState({
      assignResult,
      assignDialogOpen: true,
      lifestyleSelected: lifestyleId,
      mealSelected: mealId,
      dateSelected: plannerViewWeekDate,
    });
  }

  closeAssignDialog() {
    this.setState({
      selectedLifestyle: '',
      selectedMeal: '',
      selectedPlate: '',
      assignDialogOpen: false,
      dateSelected: '',
    });
  }

  closeReassignDialog() {
    this.setState({
      reassignDialogOpen: false,
    });
  }

  openReassignDialog(lifestyleId, mealId, weekViewFormattedDate = null) {
    const onDate = this.props.plannerView == 'week' ? weekViewFormattedDate : this.props.currentSelectorDate;
    console.log('ON DATE');
    console.log(onDate);
    const assignedPlate = this.props.results.find(el =>
      el.lifestyle._id === lifestyleId
      && el.meal._id === mealId
      && el.onDate === onDate);

    this.setState({
      reassignResult: assignedPlate,
      reassignDialogOpen: true,
      reassignPlannerId: assignedPlate._id,
      reassignOnDate: weekViewFormattedDate,
    });
  }

  rowSelected(e, event, checked) {
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

  handlePresetAssignment() {

    localStorage.setItem('presetAssigned', this.props.presets.find(e => e._id == this.state.selectedPreset).title);

    console.log('PRESET APPLY CALLED');
    // console.log(this.props.currentSelectorWeekStart);

    Meteor.call('mealPlanner.applyPreset', this.state.selectedPreset, moment(this.props.currentSelectorWeekStart).format('YYYY-MM-DD'), (error) => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('presetAssigned')} has been assigned.`,
        });
      }
    });

    this.setState({
      presetDialogOpen: false,
    });
  }

  handleClearWeek() {
    localStorage.setItem('weekCleared', `Plates for the week of ${moment(this.props.currentSelectorWeekStart).format('dddd, MMMM D')}`);

    console.log('CLEAR WEEK CALLED');
    console.log(this.props.currentSelectorWeekStart);

    Meteor.call('mealPlanner.clearWeek', this.props.currentSelectorWeekStart, (error) => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('weekCleared')} have been cleared.`,
        });
      }
    });

    this.setState({
      clearDialogOpen: false,
    });
  }

  handleMealAssignment() {
    localStorage.setItem('mealAssigned', this.state.selectedSugestion.title);

    Meteor.call('mealPlanner.insert',
      this.props.plannerView == 'week' ? this.state.dateSelected : this.props.currentSelectorDate,
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

    Meteor.call('mealPlanner.update', this.state.reassignOnDate, this.state.reassignPlannerId, this.state.selectedSugestion._id, (error) => {
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
      reassignOnDate: null,
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

  isPlateAssignedClass(results, lifestyleId, mealId) {
    if (results.findIndex(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId) !== -1) {
      return 'status--assigned';
    }

    return 'status status--not-assigned';
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

  getAssignedPlannerId(results, lifestyleId, mealId, date) {
    const plateToReturn = results.find(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId && el.onDate === date);
    return plateToReturn._id;
  }

  getAssignedPlateId(results, lifestyleId, mealId, date) {
    const plateToReturn = results.find(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId && el.onDate === date);
    return plateToReturn.plateId;
  }


  renderInput(inputProps) {
    const { value, ...other } = inputProps;

    return (
      <TextField
        value={value}
        style={{ width: '100%' }}
        InputProps={{
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
      : this.props.plates.filter(
        plate =>
          plate.title.toLowerCase().slice(0, inputLength) === inputValue,
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

  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    this.setState({
      selectedSugestion: suggestion,
    });
  }

  removeMealPlanner(id) {
    Meteor.call('mealPlanner.remove', id, (err, res) => {
      if (err) {
        this.props.popTheSnackbar({
          message: err.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: 'Meal has been removed.',
        });
      }
    });
  }

  compareLifestyles(a, b) {
    if (a.title > b.title) {
      return -1;
    }
    return 1;


    return 0;
  }

  handleChange(event) {
    this.setState({ selectedPreset: event.target.value });
  }

  render() {
    if (this.props.loading) {
      return <Loading />;
    }

    return (
      <div style={{ width: '100%' }}>
        {this.props.plannerView == 'week' && (
          <React.Fragment>
            <Tooltip title="This will clear all the plates for the whole week">
              <Button style={{ float: 'right' }} onClick={() => this.setState({ clearDialogOpen: true })}>Clear</Button>
            </Tooltip>
            <Tooltip title="Selected preset will be applied for the whole week">
              <Button style={{ float: 'right' }} onClick={() => this.setState({ presetDialogOpen: true })}>Apply preset</Button>
            </Tooltip>
          </React.Fragment>
        )}

        {this.props.lifestyles && this.props.lifestyles.sort(this.compareLifestyles).map((lifestyle) => {
          const mealTypeOrder = ['Breakfast', 'Lunch', 'Dinner'];
          const mapBy = [];
          const mainLifestyles = lifestyle.title == 'Traditional' || lifestyle.title == 'No meat' || lifestyle.title == 'Flex';
          mealTypeOrder.forEach((e) => {
            mapBy.push(this.props.meals.find(el => el.title == e));
          });

          if (this.props.plannerView === 'day') {

            return (
              <div style={{ width: '100%', marginBottom: '50px', marginTop: '25px' }} key={lifestyle._id}>
                <Grid container>
                  <Grid item xs={12} lg={12}>
                    <Typography type="headline" style={{ marginBottom: '25px' }}>
                      {`${lifestyle.title} for ${moment(this.props.currentSelectorDate).format('dddd, MMMM D')}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  {mapBy.map((meal, index) => {
                    const presentDish = this.props.results.find(e => e.onDate == this.props.currentSelectorDate && e.lifestyleId == lifestyle._id && e.mealId == meal._id);
                    // console.log(presentDish);
                    // console.log(presentDish);
                    let dish = null;
                    let assignedPlateId = null;
                    let assignedPlannerId = null;
                    if (presentDish) {
                      dish = this.props.plates.find(e => presentDish.plateId == e._id);
                      assignedPlateId = this.getAssignedPlateId(this.props.results, lifestyle._id, meal._id, this.props.currentSelectorDate);
                      assignedPlannerId = this.getAssignedPlannerId(this.props.results, lifestyle._id, meal._id, this.props.currentSelectorDate);
                    }

                    // console.log(dish);

                    return dish != null && this.props.results.length > 0 && this.isPlateAssigned(this.props.results, lifestyle._id, meal._id) ?
                      (
                        <Grid item xs={12} sm={6} md={4} lg={4} key={assignedPlannerId}>
                          <Card style={{ width: '100%' }}>
                            {mainLifestyles && (
                              <CardMedia
                                style={{ height: '400px' }}
                                image={dish.imageUrl ? `${Meteor.settings.public.S3BucketDomain}${dish.imageUrl}` : 'https://via.placeholder.com/460x540?text=+'}
                              />
                            )}
                            <CardContent>
                              <Typography style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(0, 0, 0, .54)' }}>
                                {meal.title}
                              </Typography>

                              <Typography type="headline" component="h2">
                                {dish.title}
                              </Typography>
                              <Typography type="body1" style={{ marginBottom: '12px', color: 'rgba(0, 0, 0, .54)' }}>
                                {dish.subtitle != undefined && dish.subtitle}
                              </Typography>

                            </CardContent>
                            <Divider />
                            <CardActions style={{ justifyContent: 'flex-end' }}>

                              {dish.mealCategory && dish.slug && (
                                <Button
                                  size="small"
                                  dense
                                  color="primary"
                                  onClick={() => window.open(`https://www.vittle.ca/on-the-menu/${dish.mealCategory}/${dish.slug}`, '_blank')}
                                >
                                  View
                                </Button>
                              )}

                              <Button
                                dense
                                size="small"
                                color="primary"
                                onClick={e => this.setState({ [`menu${assignedPlateId}`]: e.currentTarget })}
                              >
                                Edit
                              </Button>
                            </CardActions>
                          </Card>
                          <Menu
                            id={`menu${assignedPlateId}`}
                            anchorEl={this.state[`menu${assignedPlateId}`]}
                            open={Boolean(this.state[`menu${assignedPlateId}`])}
                            onClose={e => this.setState({ [`menu${assignedPlateId}`]: null })}
                          >
                            <MenuItem onClick={() => this.removeMealPlanner(assignedPlannerId)}>Remove</MenuItem>
                            <MenuItem onClick={() => this.openReassignDialog(lifestyle._id, meal._id)}>Reassign</MenuItem>
                            <MenuItem onClick={() => this.props.history.push(`/plates/${assignedPlateId}/edit`)}>View</MenuItem>
                          </Menu>
                        </Grid>
                      ) : (
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                          <div className="card-bordered-emtpy" onClick={() => this.openAssignDialog(lifestyle._id, meal._id)}>
                            <Typography className="card-bordered-empty__para" type="body1" component="p">Assign {meal && meal.title != undefined ? meal.title.toLowerCase() : ''}</Typography>
                          </div>
                        </Grid>
                      );
                  })}
                </Grid>
              </div>
            );
          }

          if (this.props.plannerView === 'week') {

            return (
              <div style={{ width: '100%', marginBottom: '50px', marginTop: '25px' }} key={lifestyle._id}>
                <Grid container>
                  <Grid item xs={12} lg={12}>
                    <Typography type="headline" style={{ marginBottom: '25px' }}>
                      {`${lifestyle.title} for the week of ${moment(this.props.currentSelectorWeekStart).format('dddd, MMMM D')}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container style={{ margin: 0 }}>
                  {this.weekDays.map((weekDay, weekDayIndex) => (
                    <React.Fragment>
                      <Typography type="subheading" style={{ margin: '1.75em 0 1em' }}>
                        {`${weekDay} ${moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('MMMM D')}`}
                      </Typography>

                      <Grid container>
                        {mapBy.map((meal, index) => {
                          const presentDish = this.props.results.find(e =>
                            e.onDate == moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('YYYY-MM-DD') && e.lifestyleId == lifestyle._id && e.mealId == meal._id);
                          // console.log(presentDish);
                          // console.log(presentDish);
                          let dish = null;
                          let assignedPlateId = null;
                          let assignedPlannerId = null;
                          if (presentDish) {
                            dish = this.props.plates.find(e => presentDish.plateId == e._id);
                            assignedPlateId = this.getAssignedPlateId(this.props.results, lifestyle._id, meal._id, moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('YYYY-MM-DD'));
                            assignedPlannerId = this.getAssignedPlannerId(this.props.results,
                              lifestyle._id,
                              meal._id,
                              moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('YYYY-MM-DD'));
                          }

                          console.log(assignedPlannerId);

                          return dish != null && this.props.results.length > 0 && this.isPlateAssigned(this.props.results, lifestyle._id, meal._id) ? (
                            <Grid item xs={12} sm={6} md={4} lg={4} key={assignedPlannerId}>
                              <Card style={{ width: '100%' }}>
                                {mainLifestyles && (
                                  <CardMedia
                                    style={{ height: '400px' }}
                                    image={dish.imageUrl ? `${Meteor.settings.public.S3BucketDomain}${dish.imageUrl}` : 'https://via.placeholder.com/460x540?text=+'}
                                  />
                                )}
                                <CardContent>
                                  <Typography style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(0, 0, 0, .54)' }}>
                                    {meal.title}
                                  </Typography>

                                  <Typography type="headline" component="h2">
                                    {dish.title}
                                  </Typography>
                                  <Typography type="body1" style={{ marginBottom: '12px', color: 'rgba(0, 0, 0, .54)' }}>
                                    {dish.subtitle != undefined && dish.subtitle}
                                  </Typography>

                                </CardContent>
                                <Divider />
                                <CardActions style={{ justifyContent: 'flex-end' }}>

                                  {dish.mealCategory && dish.slug && (
                                    <Button
                                      size="small"
                                      dense
                                      color="primary"
                                      onClick={() => window.open(`https://www.vittle.ca/on-the-menu/${dish.mealCategory}/${dish.slug}`, '_blank')}
                                    >
                                      View
                                    </Button>
                                  )}

                                  <Button
                                    dense
                                    size="small"
                                    color="primary"
                                    onClick={e => this.setState({ [`menu${assignedPlateId}`]: e.currentTarget })}
                                  >
                                    Edit
                                  </Button>
                                </CardActions>
                              </Card>
                              <Menu
                                id={`menu${assignedPlateId}`}
                                anchorEl={this.state[`menu${assignedPlateId}`]}
                                open={Boolean(this.state[`menu${assignedPlateId}`])}
                                onClose={e => this.setState({ [`menu${assignedPlateId}`]: null })}
                              >
                                <MenuItem onClick={() => this.removeMealPlanner(assignedPlannerId)}>Remove</MenuItem>
                                <MenuItem onClick={() => this.openReassignDialog(lifestyle._id, meal._id, moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('YYYY-MM-DD'))}>Reassign</MenuItem>
                                <MenuItem onClick={() => this.props.history.push(`/plates/${assignedPlateId}/edit`)}>View</MenuItem>
                              </Menu>
                            </Grid>
                          ) : (
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                              <div className="card-bordered-emtpy" onClick={() => this.openAssignDialog(lifestyle._id, meal._id, moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('YYYY-MM-DD'))}>
                                <Typography className="card-bordered-empty__para" type="body1" component="p">Assign {meal && meal.title != undefined ? meal.title.toLowerCase() : ''}</Typography>
                              </div>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </React.Fragment>
                  ))}

                </Grid>
              </div>
            );
          }

        })}

        <Dialog maxWidth="md" fullWidth fullScreen open={this.state.presetDialogOpen} onClose={() => this.setState({ presetDialogOpen: false })}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Apply a preset for the week of {moment(this.props.currentSelectorWeekStart).format('dddd, MMMM D')}
          </Typography>
          <Typography style={{ padding: '0 24px 20px' }} className="subheading" type="subheading">
            Once a preset is applied it cannot be removed. Even if a preset is updated, it has to be applied again to reflect changes on the planner. A week's plates can be cleared off by using the reset functioanlity.
          </Typography>
          <DialogContent>

            {this.props.plannerView == 'week' && (
              <div>
                <Select
                  value={this.state.selectedPreset}
                  onChange={this.handleChange}
                >
                  <MenuItem value="none" key="0">Select a preset</MenuItem>
                  {this.props.presets.map(preset => (
                    <MenuItem key={preset._id} value={preset._id}>{preset.title}</MenuItem>
                  ))}
                </Select>
              </div>
            )}

          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ presetDialogOpen: false })} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handlePresetAssignment} color="primary">
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.clearDialogOpen} onClose={() => this.setState({ clearDialogOpen: false })}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Clear all plates for the week of {moment(this.props.currentSelectorWeekStart).format('dddd, MMMM D')}?
          </Typography>
          <Typography style={{ padding: '0 24px 20px' }} className="subheading" type="subheading">
            This will remove all the plates assigned for all the lifestyles.
          </Typography>

          <DialogActions>
            <Button onClick={() => this.setState({ clearDialogOpen: false })} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleClearWeek} color="primary">
              Clear
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog maxWidth="md" fullWidth fullScreen open={this.state.assignDialogOpen} onClose={this.closeAssignDialog}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Assign main for {this.state.assignResult ? this.state.assignResult.lifestyle.title : ''}{' '}{this.state.assignResult ? this.state.assignResult.meal.title : ''}
          </Typography>
          <DialogContent>

            <Autosuggest
              id="1"
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
            <Button onClick={this.closeAssignDialog} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleMealAssignment} color="primary">
              Assign
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog fullScreen open={this.state.reassignDialogOpen} onClose={this.closeReassignDialog}>
          <Typography
            style={{
              flex: '0 0 auto',
              margin: '0',
              padding: '24px 24px 20px 24px',
            }}
            className="title font-medium"
            type="title"
          >
            Reassign main for {this.state.reassignResult ? this.state.reassignResult.lifestyle.title : ''}
            {this.state.reassignResult ? this.state.reassignResult.meal.title : ''}
          </Typography>


          <DialogContent>

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
            <Button onClick={this.closeReassignDialog} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleMealReassignment} color="primary">
              Reassign
            </Button>
          </DialogActions>
        </Dialog>
      </div >
    );
  }
}

MealPlannerTable.propTypes = {
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

export default MealPlannerTable;
