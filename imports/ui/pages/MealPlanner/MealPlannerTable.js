import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

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

// import sumBy from 'lodash/sumBy';
// import CloseIcon from 'material-ui-icons/Close';
// import LaunchIcon from 'material-ui-icons/Launch';
// import EditIcon from 'material-ui-icons/Edit';

import Loading from '../../components/Loading/Loading';

import './MealPlannerTable.scss';

class MealPlannerTable extends Component {
  constructor(props) {
    super(props);

    this.state = {

      plates: this.props.plates ? this.props.plates : [],
      searchTextPlateDialog: '',

        selectedPlate: null,

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
    // console.log(plannerViewWeekDate);

    const assignResult = {
      lifestyle,
      meal,
    };

    this.setState({
      assignResult,
      lifestyleSelected: lifestyleId,
      mealSelected: mealId,
      mealSelectedText: meal.title,
      lifestyleSelectedText: lifestyle.title,
      dateSelected: plannerViewWeekDate,
    }, () => {
      this.setState({
        assignDialogOpen: true,

      });
    });
  }

  closeAssignDialog() {
    this.setState({
      selectedLifestyle: '',
      selectedMeal: '',
      selectedPlate: '',
      assignDialogOpen: false,
      dateSelected: '',
        selectedTextPlateDialog: '',
    });
  }

  closeReassignDialog() {
    this.setState({
      reassignDialogOpen: false,
        selectedLifestyle: '',
        selectedMeal: '',
        selectedPlate: '',
        dateSelected: '',
        selectedTextPlateDialog: '',
    });
  }

  openReassignDialog(lifestyleId, mealId, weekViewFormattedDate = null) {
    const onDate = this.props.plannerView === 'week' ? weekViewFormattedDate : this.props.currentSelectorDate;
    // console.log('ON DATE');
    // console.log(onDate);

    const assignedPlate = this.props.results.find(el =>
      el.lifestyle._id === lifestyleId
      && el.meal._id === mealId
      && el.onDate === onDate
    );

    const meal = this.props.meals.find(meal => meal._id === mealId);

    this.setState({
      reassignResult: assignedPlate,
      reassignPlannerId: assignedPlate._id,
      reassignOnDate: onDate,
      mealSelectedText: meal.title,
    }, () => {
      this.setState({
        reassignDialogOpen: true,
      });
    });
  }

  handlePresetAssignment() {
    localStorage.setItem('presetAssigned', this.props.presets.find(e => e._id === this.state.selectedPreset).title);

    // console.log('PRESET APPLY CALLED');
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
    //
    // console.log('CLEAR WEEK CALLED');
    // console.log(this.props.currentSelectorWeekStart);

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

  handleClickPlateCard(type, plateId, plateTitle) {
    this.setState({
        selectedPlate: { _id: plateId, title: plateTitle, },
    }, () => {
        if(type === "assign") {
            localStorage.setItem('mealAssigned', plateTitle);
            this.handleMealAssignment();
        } else if(type === "reassign") {
            localStorage.setItem('mealReassigned', plateTitle);
            this.handleMealReassignment();
        }
    });
  }

  handleMealAssignment() {
    Meteor.call('mealPlanner.insert',
      this.props.plannerView === 'week' ? this.state.dateSelected : this.props.currentSelectorDate,
      this.state.lifestyleSelected,
      this.state.mealSelected,
      this.state.selectedPlate._id, (error) => {
        if (error) {
          this.props.popTheSnackbar({
            message: error.reason,
          });
        } else {
          this.setState({
            value: '',
          });
          this.props.popTheSnackbar({
            message: `Meal has been assigned.`,
          });
        }
      });

    this.setState({
      assignDialogOpen: false,
      selectedPlate: null,
      lifestyleSelected: null,
      mealSelected: null,
    });
  }

  handleMealReassignment() {

    Meteor.call('mealPlanner.update', this.state.reassignOnDate,
        this.state.reassignPlannerId,
        this.state.selectedPlate._id, (error) => {
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
      selectedPlate: null,
      reassignPlannerId: null,
      reassignOnDate: null,
    });
  }

  renderNoResults(count) {
    if (count === 0) {
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
    return results.findIndex(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId) !== -1;
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
    return a.title > b.title ? -1 : 1
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
        {this.props.plannerView === 'week' && (
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
          const mainLifestyles = lifestyle.title === 'Traditional' || lifestyle.title === 'No meat' || lifestyle.title === 'Flex';
          mealTypeOrder.forEach((e) => {
            mapBy.push(this.props.meals.find(el => el.title === e));
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
                    const presentDish = this.props.results.find(e => e.onDate === this.props.currentSelectorDate && e.lifestyleId === lifestyle._id && e.mealId === meal._id);
                    // console.log(presentDish);
                    // console.log(presentDish);
                    let dish = null;
                    let assignedPlateId = null;
                    let assignedPlannerId = null;
                    if (presentDish) {
                      dish = this.props.plates.find(e => presentDish.plateId === e._id);
                      assignedPlateId = this.getAssignedPlateId(this.props.results, lifestyle._id, meal._id, this.props.currentSelectorDate);
                      assignedPlannerId = this.getAssignedPlannerId(this.props.results, lifestyle._id, meal._id, this.props.currentSelectorDate);
                    }

                      const randomId = presentDish ? assignedPlannerId : `${lifestyle._id}${meal}${index}`;


                    return dish && this.props.results.length > 0 && this.isPlateAssigned(this.props.results, lifestyle._id, meal._id) ?
                      (
                        <Grid item xs={12} sm={6} md={4} lg={4} key={assignedPlannerId}>
                          <Card style={{ width: '100%' }}>
                            {mainLifestyles && (
                              <CardMedia
                                style={{ height: '400px' }}
                                image={dish.hasOwnProperty('imageUrl') ? `${Meteor.settings.public.S3BucketDomain}${dish.imageUrl}` : 'https://via.placeholder.com/460x540?text=+'}
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
                                {dish.subtitle !== undefined && dish.subtitle}
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
                                onClick={e => this.setState({ [`menu${randomId}`]: e.currentTarget })}
                              >
                                Edit
                              </Button>
                              <Menu
                                anchorEl={this.state[`menu${randomId}`]}
                                open={Boolean(this.state[`menu${randomId}`])}
                                onClose={e => this.setState({ [`menu${randomId}`]: null })}
                              >
                                <MenuItem onClick={() => this.removeMealPlanner(assignedPlannerId)}>
                                    Remove
                                </MenuItem>
                                <MenuItem onClick={() => this.openReassignDialog(lifestyle._id, meal._id)}>
                                    Reassign
                                </MenuItem>
                                <MenuItem onClick={() => this.props.history.push(`/plates/${assignedPlateId}/edit`)}>
                                    View
                                </MenuItem>
                              </Menu>
                            </CardActions>
                          </Card>
                        </Grid>
                      ) : (
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                          <div className="card-bordered-emtpy" onClick={() => this.openAssignDialog(lifestyle._id, meal._id)}>
                            <Typography className="card-bordered-empty__para" type="body1" component="p">Assign {meal && meal.title !== undefined ? meal.title.toLowerCase() : ''}</Typography>
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
                  {this.weekDays.map((weekDay, weekDayIndex) => {
                    const currentDayFormatted = moment(this.props.currentSelectorWeekStart).isoWeekday(weekDayIndex + 1).format('YYYY-MM-DD');

                    return (<React.Fragment>
                      <Typography type="subheading" style={{ margin: '1.75em 0 1em' }}>
                        {`${weekDay} ${moment(this.props.currentSelectorWeekStart).format('MMMM D')}`}
                      </Typography>

                      <Grid container>
                        {mapBy.map((meal, index) => {
                          const presentDish = this.props.results.find(e =>
                            e.onDate === currentDayFormatted && e.lifestyleId === lifestyle._id && e.mealId === meal._id);
                          // console.log(presentDish);
                          // console.log(presentDish);
                          let dish = null;
                          let assignedPlateId = null;
                          let assignedPlannerId = null;
                          if (presentDish) {
                            dish = this.props.plates.find(e => presentDish.plateId === e._id);
                            assignedPlateId = this.getAssignedPlateId(this.props.results,
                              lifestyle._id,
                              meal._id,
                              currentDayFormatted,
                            );
                            assignedPlannerId = this.getAssignedPlannerId(this.props.results,
                              lifestyle._id,
                              meal._id,
                              currentDayFormatted);
                          }

                            const randomId = presentDish ? assignedPlannerId : `${lifestyle._id}${meal}${index}`;

                            return dish && this.props.results.length > 0 && this.isPlateAssigned(this.props.results, lifestyle._id, meal._id) ? (
                            <Grid item xs={12} sm={6} md={4} lg={4} key={randomId}>
                              <Card style={{ width: '100%' }}>
                                {mainLifestyles && (
                                  <CardMedia
                                    style={{ height: '400px' }}
                                    image={dish.hasOwnProperty('imageUrl') ? `${Meteor.settings.public.S3BucketDomain}${dish.imageUrl}` : 'https://via.placeholder.com/460x540?text=+'}
                                  />
                                )}
                                <CardContent>
                                  <Typography style={{
                                    marginBottom: '16px',
                                    fontSize: '14px',
                                    color: 'rgba(0, 0, 0, .54)',
                                  }}
                                  >
                                    {meal.title}
                                  </Typography>

                                  <Typography type="headline" component="h2">
                                    {dish.title}
                                  </Typography>
                                  <Typography
                                    type="body1"
                                    style={{
                                      marginBottom: '12px',
                                      color: 'rgba(0, 0, 0, .54)',
                                    }}
                                  >
                                    {dish.subtitle !== undefined && dish.subtitle}
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
                                    onClick={e => this.setState({ [`menu${randomId}`]: e.currentTarget })}
                                  >
                                                          Edit
                                  </Button>
                                  <Menu
                                    anchorEl={this.state[`menu${randomId}`]}
                                    open={Boolean(this.state[`menu${randomId}`])}
                                    onClose={e => this.setState({ [`menu${randomId}`]: null })}
                                  >
                                    <MenuItem
                                      onClick={() => this.removeMealPlanner(assignedPlannerId)}
                                    >
                                        Remove
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => this.openReassignDialog(lifestyle._id, meal._id, currentDayFormatted)}
                                    >
                                        Reassign
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => this.props.history.push(`/plates/${assignedPlateId}/edit`)}
                                    >
                                        View
                                    </MenuItem>
                                  </Menu>
                                </CardActions>

                              </Card>

                            </Grid>
                          ) : (
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                              <div
                                className="card-bordered-emtpy"
                                onClick={
                                    () => this.openAssignDialog(
                                        lifestyle._id,
                                        meal._id,
                                        currentDayFormatted
                                    )
                                }
                              >
                                <Typography className="card-bordered-empty__para" type="body1" component="p">
                                                      Assign {meal && meal.title !== undefined ? meal.title.toLowerCase() : ''}
                                </Typography>
                              </div>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </React.Fragment>);
                  },
                  )}

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

            {this.props.plannerView === 'week' && (
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

            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        placeholder="Search"
                        style={{ marginBottom: '1em' }}
                        value={this.state.searchTextPlateDialog}
                        onChange={e => this.setState({ searchTextPlateDialog: e.target.value })}
                    />
                </Grid>
            </Grid>

            <Grid container>
              {this.props.plates && this.props.plates.filter((p) => {
                if (this.state.searchTextPlateDialog) {
                  const searchString = new RegExp(this.state.searchTextPlateDialog);
                  return p.mealType === this.state.mealSelectedText && searchString.test(p.title.toLowerCase());
                }
                return p.mealType === this.state.mealSelectedText;

              }).map((e, i) => (
                <Grid item xs={12} sm={6} md={4} lg={4} style={{ minWidth: '320px' }} key={e._id}>
                  <Card className="plate-card-assign" style={{ width: '100%' }} onClick={() => this.handleClickPlateCard('assign', e._id, e.titlem)}>
                    <CardMedia
                      style={{ height: '300px' }}
                      image={e.hasOwnProperty('imageUrl') ? `${Meteor.settings.public.S3BucketDomain}${e.imageUrl}` : e.image ? e.image : 'https://via.placeholder.com/600x600?text=+'}
                    />
                    <CardContent>
                      <Typography type="body1" className="font-uppercase font-medium" style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(0, 0, 0, .54)' }}>
                        {e.mealType}
                      </Typography>
                      <Typography type="headline" component="h2">
                        {e.title}
                      </Typography>
                      <Typography type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {e.subtitle}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button dense color="primary" onClick={() => this.props.history.push(`/plates/${e._id}/edit`)}>Edit</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

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
            Reassign main for {this.state.reassignResult ? `${this.state.reassignResult.lifestyle.title} ` : ''}
            {this.state.reassignResult ? this.state.reassignResult.meal.title : ''}
          </Typography>


          <DialogContent>

            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        placeholder="Search"
                        style={{ marginBottom: '1em' }}
                        value={this.state.searchTextPlateDialog}
                        onChange={e => this.setState({ searchTextPlateDialog: e.target.value })}
                    />
                </Grid>
            </Grid>

            <Grid container>
              {this.props.plates && this.props.plates.filter((p) => {
                  if (this.state.searchTextPlateDialog) {
                  const searchString = new RegExp(this.state.searchTextPlateDialog);
                  return p.mealType === this.state.mealSelectedText && searchString.test(p.title.toLowerCase());
              }
                  return p.mealType === this.state.mealSelectedText;

              }).map((e, i) => (
                <Grid item xs={12} sm={6} md={4} lg={4} style={{ minWidth: '320px' }} key={e._id}>
                  <Card className="plate-card-assign" style={{ width: '100%' }} onClick={() => this.handleClickPlateCard('reassign', e._id, e.title)}>
                    <CardMedia
                      style={{ height: '300px' }}
                      image={e.hasOwnProperty('imageUrl') ? `${Meteor.settings.public.S3BucketDomain}${e.imageUrl}` : e.image ? e.image : 'https://via.placeholder.com/600x600?text=+'}
                      title="Contemplative Reptile"
                    />
                    <CardContent>
                      <Typography type="body1" className="font-uppercase font-medium" style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(0, 0, 0, .54)' }}>
                        {e.mealType}
                      </Typography>
                      <Typography type="headline" component="h2">
                        {e.title}
                      </Typography>
                      <Typography type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {e.subtitle}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button dense color="primary" onClick={() => this.props.history.push(`/plates/${e._id}/edit`)}>Edit</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
