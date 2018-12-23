import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Containers from 'meteor/jivanysh:react-list-container';

import $ from 'jquery';

import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';

import ViewDayIcon from 'material-ui-icons/ViewDay';
import ViewWeekIcon from 'material-ui-icons/ViewWeek';

import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import LeftArrow from 'material-ui-icons/ArrowBack';
import RightArrow from 'material-ui-icons/ArrowForward';

import moment from 'moment';

import MealPlannerColl from '../../../api/MealPlanner/MealPlanner';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Meals from '../../../api/Meals/Meals';
import MealPresets from '../../../api/MealPresets/MealPresets';
import PlatesCollection from '../../../api/Plates/Plates';

import Loading from '../../components/Loading/Loading';
import MealPlannerTable from './MealPlannerTable';

const ListContainer = Containers.ListContainer;

class MealPlanner extends React.Component {
  constructor(props) {
    super(props);

    this.changeDate = this.changeDate.bind(this);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: {
        sort: {
          onDate: -1,
        },
      },
      searchSelector: '',
      // currentTabValue: /./,
      currentSelectorDate: moment(new Date()).format('YYYY-MM-DD'),
      currentSelectorWeekStart: moment().startOf('isoWeek').format('YYYY-MM-DD'),
      currentSelectorWeekEnd: moment().endOf('isoWeek').format('YYYY-MM-DD'),

      plannerView: 'week',
    };

    this.sortByOption = this.sortByOption.bind(this);
  }

  searchByName() {
    this.setState({
      searchSelector: $('#search-type-text').val(),
    });
  }

  clearSearchBox() {
    $('#search-type-text').val('');

    this.setState({
      searchSelector: {},
    });
  }

  sortByOption(field) {
    // const field = event.currentTarget.getAttribute('data-sortby');
    // This is a filler object that we are going to use set the state with.
    // Putting the sortBy field using index as objects can also be used as arrays.
    // the value of it would be 1 or -1 Asc or Desc

    const stateCopyOptions = this.state.options;
    const newOptions = {};


    // if user has selected to sort by that table column
    if (stateCopyOptions.sort.hasOwnProperty(`${field}`)) {
      if (stateCopyOptions.sort[field] === -1) {
        newOptions[field] = 1;
      } else if (stateCopyOptions.sort[field] === 1) {
        newOptions[field] = -1;
      }
    } else { // if user selects a new table column to sort
      newOptions[field] = 1;
    }

    this.setState({
      options: { sort: newOptions },
    });
  }

  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }

  changeDate(operation) {
    if (this.state.plannerView == 'day') {
      if (operation === 'add') {
        this.setState({
          currentSelectorDate: moment(this.state.currentSelectorDate).add(1, 'd').format('YYYY-MM-DD'),
        });
      } else {
        this.setState({
          currentSelectorDate: moment(this.state.currentSelectorDate).subtract(1, 'd').format('YYYY-MM-DD'),
        });
      }
    } else if (this.state.plannerView == 'week') {
      if (operation === 'add') {
        this.setState({
          currentSelectorWeekStart: moment(this.state.currentSelectorWeekStart).add(1, 'w').startOf('isoWeek').format('YYYY-MM-DD'),
        });
      } else {
        this.setState({
          currentSelectorWeekStart: moment(this.state.currentSelectorWeekStart).subtract(1, 'w').startOf('isoWeek').format('YYYY-MM-DD'),
        });
      }
    }
  }

  changeMealPlannerView(viewBy) {
    this.setState({
      plannerView: viewBy,
    });
  }

  render() {
    const { loading, history } = this.props;

    return (!loading ? (
      <div>

        <Grid container className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top">


          <Grid container>

            <Grid item xs={12} style={{ marginBottom: '25px' }}>

              <ListItem button style={{ float: 'left' }} onClick={() => this.changeDate('subtract')}>
                <ListItemIcon>
                  <LeftArrow />
                </ListItemIcon>
                <ListItemText className="subheading" primary={this.state.plannerView == 'day' ? 'Yesterday' : 'Last week'} />
              </ListItem>

              <ListItem button style={{ float: 'right' }} onClick={() => this.changeDate('add')} >
                <ListItemText className="subheading" primary={this.state.plannerView == 'day' ? 'Tomorrow' : 'Next week'} />
                <ListItemIcon>
                  <RightArrow />
                </ListItemIcon>
              </ListItem>
            </Grid>
          </Grid>

          <Grid container style={{ justifyContent: 'space-between', alignItems: 'center' }} className="clearfix">
            <Grid item>
              <Typography type="headline" gutterBottom style={{ fontWeight: 500 }}>Meal planner</Typography>
            </Grid>
            <Grid item>
              <Tooltip title="View by day">
                <IconButton onClick={() => this.changeMealPlannerView('day')}>
                  <ViewDayIcon style={{ fill: this.state.plannerView == 'day' ? '#000' : '#aaa' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="View by week">
                <IconButton onClick={() => this.changeMealPlannerView('week')}>
                  <ViewWeekIcon style={{ fill: this.state.plannerView == 'week' ? '#000' : '#aaa' }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          <ListContainer
            limit={50}
            collection={MealPlannerColl}
            publication="mealplanner"
            joins={[
              {
                localProperty: 'lifestyleId',
                collection: Lifestyles,
                joinAs: 'lifestyle',
              },
              {
                localProperty: 'mealId',
                collection: Meals,
                joinAs: 'meal',
              },
              {
                localProperty: 'plateId',
                collection: PlatesCollection,
                joinAs: 'plate',
              },
            ]}
            options={this.state.options}
            selector={this.state.plannerView == 'day' ? {
              onDate: this.state.currentSelectorDate,
            } : this.state.plannerView == 'week' ? {
              onDate: {
                $gte: this.state.currentSelectorWeekStart,
                $lte: this.state.currentSelectorWeekEnd,
              },
            } : {}}
            component={MealPlannerTable}
            componentProps={{
              popTheSnackbar: this.props.popTheSnackbar,
              searchTerm: this.state.searchSelector,
              rowsLimit: this.state.rowsVisible,
              history: this.props.history,
              sortByOptions: this.sortByOption,
              currentSelectorDate: this.state.currentSelectorDate,
              currentSelectorWeekStart: this.state.currentSelectorWeekStart,
              currentSelectorWeekEnd: this.state.currentSelectorWeekEnd,
              plannerView: this.state.plannerView,
              lifestyles: this.props.lifestyles,
              meals: this.props.meals,
              plates: this.props.plates,
              presets: this.props.presets,
              loading: this.props.loading,
            }}

          />

        </Grid>
      </div >
    ) : <Loading />);
  }
}

MealPlanner.propTypes = {
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  lifestyles: PropTypes.arrayOf(PropTypes.object).isRequired,
  meals: PropTypes.arrayOf(PropTypes.object).isRequired,
  plates: PropTypes.arrayOf(PropTypes.object).isRequired,

};

export default withTracker(() => {
  const subscription1 = Meteor.subscribe('lifestyles');
  const subscription2 = Meteor.subscribe('Meals');
  const subscription3 = Meteor.subscribe('mealplanner');
  const subscription4 = Meteor.subscribe('plates', {}, {});
  const subscription5 = Meteor.subscribe('mealpresets');

  return {
    loading: !subscription1.ready() && !subscription2.ready() && !subscription3.ready() && !subscription4.ready() && !subscription5.ready(),
    lifestyles: Lifestyles.find().fetch(),
    meals: Meals.find().fetch(),
    plates: PlatesCollection.find().fetch(),
    presets: MealPresets.find().fetch(),
  };
})(MealPlanner);
