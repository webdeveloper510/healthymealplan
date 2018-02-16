import { Meteor } from 'meteor/meteor';
import React from 'react';
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
import Autosuggest from 'react-autosuggest';

import { createContainer } from 'meteor/react-meteor-data';
import Loading from '../../components/Loading/Loading';

import './PlatingTable.scss';

class PlatingTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      plates: this.props.plates ? this.props.plates : [],
      value: '',
      selectedSugestion: null,

      currentSelectorDate: this.props.currentSelectorDate,

      assignDialogOpen: false,
      assignResult: null,

      mealSelected: null,
      lifestyleSelected: null,

      reassignDialogOpen: false,
      reassignResult: null,
      reassignPlannerId: '',

      aggregateData: null,
      aggregateDataLoading: true,
    };

    this.openAssignDialog = this.openAssignDialog.bind(this);
    this.closeAssignDialog = this.closeAssignDialog.bind(this);

    this.openReassignDialog = this.openReassignDialog.bind(this);
    this.closeReassignDialog = this.closeReassignDialog.bind(this);

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
        this.setState({ aggregateDataLoading: false })
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
            this.setState({ aggregateDataLoading: false })
          });

        });

      })

    }
  }

  openAssignDialog(lifestyleId, mealId) {
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

  closeReassignDialog() {
    this.setState({
      reassignDialogOpen: false,
    });
  }

  openReassignDialog(lifestyleId, mealId) {
    const assignedPlate = this.props.results.find(el => el.lifestyle._id === lifestyleId && el.meal._id === mealId && el.onDate === this.props.currentSelectorDate);

    this.setState({
      reassignResult: assignedPlate,
      reassignDialogOpen: true,
      reassignPlannerId: assignedPlate._id,
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

              {this.props.lifestyles && !this.aggregateDataLoading && this.props.lifestyles.map(lifestyle => {
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
                            <Button onClick={() => this.openReassignDialog(lifestyle._id, meal._id,
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

                  )))


              })}


              {/* {this.renderNoResults(this.props.count)} */}

            </TableBody>

          </Table>
        </Paper>

        <Dialog open={this.state.assignDialogOpen} onRequestClose={this.closeAssignDialog}>
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
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleMealAssignment} color="accent">
              Assign
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.reassignDialogOpen} onRequestClose={this.closeReassignDialog}>
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
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleMealReassignment} color="accent">
              Reassign
            </Button>
          </DialogActions>
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

export default PlatingTable;
