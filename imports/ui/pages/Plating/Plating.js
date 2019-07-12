import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Containers from 'meteor/jivanysh:react-list-container';

import $ from 'jquery';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
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
import PlatesCollection from '../../../api/Plates/Plates';
import Sides from '../../../api/Sides/Sides';
import Restrictions from '../../../api/Restrictions/Restrictions';
import Ingredients from '../../../api/Ingredients/Ingredients';

import Loading from '../../components/Loading/Loading';
import PlatingTable from './PlatingTable';


const ListContainer = Containers.ListContainer;

class Plating extends React.Component {
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
      selectedRoute: '',
      currentSelectorDate: moment(new Date()).format('YYYY-MM-DD'),
      // currentSelectorDate: '2018-02-18',

    };

    this.sortByOption = this.sortByOption.bind(this);
  }

  searchByName() {
    // const searchValue = new RegExp(, 'i');
    // console.log(searchValue);

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
    // console.log(field);

    // This is a filler object that we are going to use set the state wi  th.
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
    if (operation === 'add') {
      this.setState({
        currentSelectorDate: moment(this.state.currentSelectorDate).add(1, 'd').format('YYYY-MM-DD'),
      });
    } else {
      this.setState({
        currentSelectorDate: moment(this.state.currentSelectorDate).subtract(1, 'd').format('YYYY-MM-DD'),
      });
    }
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
                  <LeftArrow label="Yesterday" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Yesterday" />
              </ListItem>


              <ListItem button style={{ float: 'right' }} onClick={() => this.changeDate('add')} >
                <ListItemText className="subheading" primary="Tomorrow" />
                <ListItemIcon>
                  <RightArrow label="Tomorrow" />
                </ListItemIcon>
              </ListItem>
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
            selector={{
              onDate: this.state.currentSelectorDate,
            }}
          >
            <PlatingTable
              popTheSnackbar={this.props.popTheSnackbar}
              searchTerm={this.state.searchSelector}
              rowsLimit={this.state.rowsVisible}
              history={this.props.history}
              sortByOptions={this.sortByOption}
              currentSelectorDate={this.state.currentSelectorDate}
              lifestyles={this.props.lifestyles}
              meals={this.props.meals}
              plates={this.props.plates}
              sides={this.props.sides}
              restrictions={this.props.restrictions}
              ingredients={this.props.ingredients}
            />
          </ListContainer>
        </Grid>
      </div >
    ) : <Loading />);
  }
}

Plating.propTypes = {
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  lifestyles: PropTypes.arrayOf(PropTypes.object).isRequired,
  meals: PropTypes.arrayOf(PropTypes.object).isRequired,
  plates: PropTypes.arrayOf(PropTypes.object).isRequired,

};

export default withTracker(() => {
  const subscription1 = Meteor.subscribe('lifestyles');
  const subscription2 = Meteor.subscribe('Meals');
  const subscription4 = Meteor.subscribe('plates', {}, {});
  const subscription5 = Meteor.subscribe('sides', {}, {});
  const subscription6 = Meteor.subscribe('restrictions');
  const subscription7 = Meteor.subscribe('ingredients');

  return {
    loading: !subscription1.ready() && !subscription2.ready() && !subscription4.ready() && !subscription5.ready() && !subscription6.ready() && !subscription7.ready(),
    lifestyles: Lifestyles.find().fetch(),
    meals: Meals.find().fetch(),
    plates: PlatesCollection.find().fetch(),
    sides: Sides.find().fetch(),
    restrictions: Restrictions.find().fetch(),
    ingredients: Ingredients.find().fetch(),
  };
})(Plating);
