import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import $ from 'jquery';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import RestrictionsCollection from '../../../api/Restrictions/Restrictions';
// import CategoriesCollection from '../../../api/Categories/Categories';

// import IngredientTypesCollection from '../../../api/IngredientTypes/IngredientTypes';

import Loading from '../../components/Loading/Loading';
import RestrictionsTable from './RestrictionsTable';
  
import Containers from 'meteor/utilities:react-list-container';

const ListContainer = Containers.ListContainer;


class Restrictions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,

      searchByKey: '',
      options: { sort: { SKU: -1 } },
      searchSelector: '',
      currentTabValue: 0,
    };
  }

  componentDidMount() { }

  searchByName() {
    // const searchValue = new RegExp(, 'i');
    // console.log(searchValue);

    this.setState({
      searchSelector: $('#search-type-text').val(),
    });

    // const query = {
    //   title: { $regex: searchValue },
    // };

    // if ($('#search-type-text').val() > 1) {
    //   this.setState({
    //     searchSelector: query,
    //   });

    //   return true;
    // }

    // this.setState({
    //   searchSelector: {},
    // });

    // return false;
  }

  clearSearchBox() {
    $('#search-type-text').val('');

    this.setState({
      searchSelector: {},
    });
  }

  sortByOption(field) {
    // const field = event.currentTarget.getAttribute('data-sortby');
    console.log(field);

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

    // console.log('Data sorting changed');
    // console.log(this.state.options);
  }

  searchByKey(restrictionType = '', key = '') {
    if (key.length && restrictionType.length) {
      const searchSelector = {};

      searchSelector[restrictionType] = key;

      this.setState({
        searchByKey: searchSelector,
      });
    } else {
      this.setState({
        searchByKey: '',
      });
    }
  }

  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }

  render() {
    const { loading, history } = this.props;

    return (!loading ? (
      <div>

        <Grid container className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top">

          <Grid container className="clearfix">
            <Grid item xs={6}>
              <Typography type="headline" gutterBottom className="headline pull-left" style={{ fontWeight: 500 }}>Restrictions</Typography>
            </Grid>
            <Grid item xs={6}>
              <Button className="btn btn-primary" onClick={() => history.push('/restrictions/new')} raised color="primary" style={{ float: 'right' }}>Add Restriction</Button>
            </Grid>
          </Grid>

          <div style={{ marginTop: '25px' }}>
            <AppBar position="static" className="appbar--no-background appbar--no-shadow">
              <Tabs indicatorColor="#000" value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
                <Tab label="All" onClick={() => this.searchByKey('', '')} />
                <Tab label="Allergies" onClick={() => this.searchByKey('restrictionType', 'allergy')} />
                <Tab label="Dietary" onClick={() => this.searchByKey('restrictionType', 'dietary')} />
                <Tab label="Religious" onClick={() => this.searchByKey('restrictionType', 'religious')} />

              </Tabs>
            </AppBar>
          </div>

          {/* {this.state.currentTabValue === 0 && <div>Item One</div>}
          {this.state.currentTabValue === 1 && <div>Item Two</div>}
          {this.state.currentTabValue === 2 && <div>Item Three</div>} */}

          <div style={{ width: '100%',
            background: '#FFF',
            borderTopRightRadius: '2px',
            borderTopLeftRadius: '2px',
            marginTop: '3em',
            padding: '16px 25px 1em',
            boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
            position: 'relative' }}
          >

            <SearchIcon
              className="autoinput-icon autoinput-icon--search"
              style={{ display: (this.state.searchSelector.length > 0) ? 'none' : 'block', top: '33%', right: '1.8em !important' }}
            />

            <ClearIcon
              className="autoinput-icon--clear"
              onClick={this.clearSearchBox.bind(this)}
              style={{ cursor: 'pointer',
                display: (this.state.searchSelector.length > 0) ? 'block' : 'none' }}
            />

            <Input
              className="input-box"
              style={{ width: '100%', position: 'relative' }}
              placeholder="Search restrictions"
              onKeyUp={this.searchByName.bind(this)}
              inputProps={{
                id: 'search-type-text',
                'aria-label': 'Description',
              }}
            />
          </div>
          <ListContainer
            limit={50}
            collection={RestrictionsCollection}
            publication="restrictions"
            options={this.state.options}
            selector={typeof (this.state.searchByKey) === 'object' ? this.state.searchByKey : { $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } },
              { SKU: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }] }}
          >
            <RestrictionsTable
              popTheSnackbar={this.props.popTheSnackbar}
              searchTerm={this.state.searchSelector}
              rowsLimit={this.state.rowsVisible}
              history={this.props.history}
              sortByOptions={this.sortByOption.bind(this)}
            />

          </ListContainer>


        </Grid>
      </div>
    ) : <Loading />);
  }
}

Restrictions.propTypes = {
  loading: PropTypes.bool.isRequired,
  // categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('restrictions');

  return {
    loading: !subscription.ready(),
    restrictions: RestrictionsCollection.find().fetch(),
  };
}, Restrictions);
