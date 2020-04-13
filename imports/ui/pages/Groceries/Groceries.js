import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Containers from 'meteor/jivanysh:react-list-container';
import { ReactiveVar } from 'meteor/reactive-var';
import clone from 'lodash/clone';
import $ from 'jquery';

const ListContainer = Containers.ListContainer;

import Typography from 'material-ui/Typography';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';

import GroceriesCollection from '../../../api/Groceries/Groceries';
import GroceriesGrid from './GroceriesGrid.js';
import Loading from '../../components/Loading/Loading';


const tableConfig = new ReactiveVar({
    selector: {
        mealType: 'All',
    },
});

class Groceries extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxesSelected: false,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: { title: 1 } },
      searchSelector: '',
      currentTabValue: 0,
    };
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

  rowSelected(e) {
      const selectedRowId = e.target.parentNode.parentNode.getAttribute('id');

      $(`.${selectedRowId}`).toggleClass('row-selected');

      const currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber;

      this.setState({
          checkboxesSelected: true,
          selectedCheckboxesNumber: currentlySelectedCheckboxes + 1,
      });
  }

  handleTabChange(event, value) {
      const tableConfigPrev = tableConfig.get();
      const tableConfigCopy = clone(tableConfigPrev);

      const mealTypes = ['All', 'meat', 'vegetables', 'fruit', 'dairy', 'pantry', 'miscellaneous'];
      tableConfigCopy.selector.mealType = mealTypes[value];

      tableConfig.set(tableConfigCopy);

      this.setState({ currentTabValue: value });
  }

  render() {
    return (
        <div>

          <Grid container className="SideContent SideContent--spacer-2x--top SideContent--spacer-2x--horizontal">
            <Grid container className="clearfix">
              <Grid item xs={6}>
                <Typography type="headline" gutterBottom className="pull-left headline" style={{ fontWeight: 500 }} color="inherit">Groceries</Typography>
              </Grid>
              <Grid item xs={6}>
                <Button className="btn btn-primary" raised color="primary" style={{ float: 'right' }} onClick={() => this.props.history.push('/groceries/new')}>Add grocery</Button>
              </Grid>
            </Grid>

            <div style={{ marginTop: '25px' }}>
              <AppBar position="static" className="appbar--no-background appbar--no-shadow">
                <Tabs indicatorColor="#000" value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
                    <Tab label="All" />
                    <Tab label="Meat" />
                    <Tab label="Vegetables" />
                    <Tab label="Fruit" />
                    <Tab label="Dairy" />
                    <Tab label="Pantry" />
                    <Tab label="Miscellaneous" />
                </Tabs>
              </AppBar>
            </div>

            <div style={{
              width: '100%',
              background: '#FFF',
              borderTopRightRadius: '2px',
              borderTopLeftRadius: '2px',
              marginTop: '3em',
              padding: '16px 25px 1em',
              boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
              position: 'relative'
            }}
            >

              <SearchIcon
                className="autoinput-icon autoinput-icon--search"
                style={{ display: (this.state.searchSelector.length > 0) ? 'none' : 'block', top: '33%', right: '1.8em !important' }}
              />

              <ClearIcon
                className="autoinput-icon--clear"
                onClick={this.clearSearchBox.bind(this)}
                style={{
                  cursor: 'pointer',
                  display: (this.state.searchSelector.length > 0) ? 'block' : 'none'
                }}
              />

              <Input
                className="input-box"
                style={{ width: '100%', position: 'relative' }}
                placeholder="Search groceries"
                onKeyUp={this.searchByName.bind(this)}
                inputProps={{
                  id: 'search-type-text',
                  'aria-label': 'Description',
                }}
              />
            </div>

            <ListContainer
              limit={40}
              collection={GroceriesCollection}
              options={this.state.options}
              selector={{
                $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } },
                { SKU: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }]
              }}
            >
              {!this.props.loading ? (
                <GroceriesGrid
                  popTheSnackbar={this.props.popTheSnackbar}
                  searchTerm={this.state.searchSelector}
                  history={this.props.history}
                  sortByOptions={this.sortByOption.bind(this)}
                />
              ) : <Loading />}

            </ListContainer>

          </Grid>
        </div>
    );
  }
}

Groceries.propTypes = {
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withTracker(() => {
  const tableConfigCopy = tableConfig.get();
  const subscription = Meteor.subscribe('groceries', tableConfigCopy.selector.mealType === "All" ? {} : tableConfigCopy.selector, {});

  return {
    loading: !subscription.ready(),
  };
})(Groceries);
