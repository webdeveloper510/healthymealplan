import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';

import $ from 'jquery';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import LifestylesColl from '../../../api/Lifestyles/Lifestyles';

import { CircularProgress } from 'material-ui/Progress';
import Loading from '../../components/Loading/Loading';
import CustomersTable from './CustomersTable';

import { JoinClient } from 'meteor-publish-join';
import { Tracker } from 'meteor/tracker';
import _ from 'lodash';

import autoBind from 'react-autobind';

const tableConfig = new ReactiveVar({
  pageProperties: {
    currentPage: 1,
    pageSize: 50,
    recordCount: 0,
    maxPages: 1,
  },
  selector: {
    roles: ['customer'],
  },
  sort: {
    'profile.name.first': 1,
  },
});


class Customers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: {} },
      searchSelector: '',
      searchTextLoading: false,
      currentTabValue: 'all',
    };

    autoBind(this);
  }

  componentWillMount() {
    this.timer = null;
  }

  searchByName() {
    const config = tableConfig.get();
    const configCopy = _.cloneDeep(config);

    const name = $('#search-users-text').val().trim();

    if (name.length) {
      configCopy.selector.name = { $regex: new RegExp(`${name}`), $options: 'gi' };
      // configCopy.selector.name = { $regex: new RegExp(`(^${searchValue}|${searchValue}$)`), $options: 'i' };
    } else {
      delete configCopy.selector.name;
    }

    // console.log(configCopy);
    configCopy.pageProperties.currentPage = 1;

    tableConfig.set(configCopy);

    this.setState({
      searchSelector: name,
      searchTextLoading: false,
    });
  }

  handleChange() {
    clearTimeout(this.timer);

    this.setState({
      searchTextLoading: true,
    }, () => {
      this.timer = setTimeout(this.searchByName, 800);
    });
  }

  searchByNameKeyDown(event) {
    // enter key
    if (event.keyCode === 13 || event.keyCode == 8) {
      this.handleChange();
    }
  }

  clearSearchBox() {
    $('#search-users-text').val('');

    const config = tableConfig.get();
    const configCopy = _.cloneDeep(config);

    delete configCopy.selector.name;

    tableConfig.set(configCopy);

    this.setState({
      searchSelector: {},
    });
  }

  sortByOption(field) {
    // const field = event.currentTarget.getAttribute('data-sortby');

    // This is a filler object that we are going to use set the state with.
    // Putting the sortBy field using index as objects can also be used as arrays.
    // the value of it would be 1 or -1 Asc or Desc

    const config = tableConfig.get();


    const stateCopyOptions = this.state.options;
    const newOptions = {};

    // if user has selected to sort by that table column
    if (stateCopyOptions.sort.hasOwnProperty(`${field}`)) {
      if (stateCopyOptions.sort[field] === -1) {
        newOptions[field] = 1;
      } else if (stateCopyOptions.sort[field] === 1) {
        newOptions[field] = -1;
      }
    } else {
      // if user selects a new table column to sort
      newOptions[field] = 1;
    }

    config.sort = newOptions;

    tableConfig.set(config);

    this.setState({
      options: { sort: newOptions },
    });
  }

  handleTabChange(event, value) {
    const config = tableConfig.get();
    const configCopy = _.cloneDeep(config);

    if (value == 'abandoned') {
      delete configCopy.selector['joinedSubscription.status'];
      configCopy.selector.joinedSubscription = { $exists: false };
    } else if (value == 'all') {
      delete configCopy.selector.joinedSubscription;
      delete configCopy.selector['joinedSubscription.status'];
    } else {
      configCopy.selector.joinedSubscription = { $exists: true };
      configCopy.selector['joinedSubscription.status'] = value;
    }

    // console.log(configCopy);

    configCopy.pageProperties.currentPage = 1;


    tableConfig.set(configCopy);

    this.setState({
      currentTabValue: value,
    });
  }

  render() {
    const { history } = this.props;

    return (
      <div>
        <Grid
          container
          className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top"
        >
          <Grid container className="clearfix">
            <Grid item xs={6}>
              <Typography
                type="headline"
                gutterBottom
                className="headline pull-left"
                style={{ fontWeight: 500 }}
              >
                Customers
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Button
                className="btn btn-primary"
                onClick={() => history.push('/customers/new')}
                raised
                color="primary"
                style={{ float: 'right' }}
              >
                Add customer
              </Button>
            </Grid>
          </Grid>

          <div style={{ marginTop: '25px' }}>
            <AppBar
              position="static"
              className="appbar--no-background appbar--no-shadow"
            >
              <Tabs
                indicatorColor="#000"
                value={this.state.currentTabValue}
                onChange={this.handleTabChange}
              >
                <Tab label="All" value={'all'} />
                <Tab label="Active" value={'active'} />
                <Tab label="Paused" value={'paused'} />
                <Tab label="Abandoned" value={'abandoned'} />
                <Tab label="Cancelled" value={'cancelled'} />
              </Tabs>
            </AppBar>
          </div>

          <div
            style={{
              width: '100%',
              background: '#FFF',
              borderTopRightRadius: '2px',
              borderTopLeftRadius: '2px',
              marginTop: '3em',
              padding: '16px 25px 1em',
              boxShadow:
                '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
              position: 'relative',
            }}
          >
            {!this.state.searchTextLoading && (
              <SearchIcon
                className="autoinput-icon autoinput-icon--search"
                style={{
                  display:
                    this.state.searchSelector.length > 0 ? 'none' : 'block',
                  top: '33%',
                  right: '1.8em !important',
                }}
              />
            )}

            {this.state.searchTextLoading ? (
              <CircularProgress size={27} className="autoinput-icon--clear" />
            ) :
              (<ClearIcon
                className="autoinput-icon--clear"
                onClick={this.clearSearchBox}
                style={{
                  cursor: 'pointer',
                  display: this.state.searchSelector.length > 0 ? 'block' : 'none',
                }}
              />)
            }

            <Input
              className="input-box"
              style={{ width: '100%', position: 'relative' }}
              placeholder="Search customers"
              onChange={this.handleChange}
              onKeyDown={this.searchByNameKeyDown}
              inputProps={{
                id: 'search-users-text',
                'aria-label': 'Description',
              }}
            />
          </div>

          <CustomersTable
            results={this.props.customers}
            lifestyles={this.props.lifestyles}
            popTheSnackbar={this.props.popTheSnackbar}
            searchTerm={this.state.searchSelector}
            rowsLimit={this.state.rowsVisible}
            history={this.props.history}
            sortByOptions={this.sortByOption}
            tableConfig={tableConfig}
          />
        </Grid>
      </div>
    );
  }
}

Customers.propTypes = {
  loading: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.isRequired,
};

export default withTracker(() => {
  const config = tableConfig.get();

  const skip = config.pageProperties.currentPage < 0 ? 0 :
    (config.pageProperties.currentPage - 1) * config.pageProperties.pageSize;

  const limit = config.pageProperties.pageSize;

  const subscription = Meteor.subscribe('users.customers.new',
    config.selector,
    config.sort,
    skip,
    limit,
  );
  // const subscription2 = Meteor.subscribe('subscriptions', {}, {});

  Meteor.call('getCustomersCount', config.selector, config.sort, (error, result) => {
    if (!error) {
      const configCopy = _.cloneDeep(config);

      if (configCopy.pageProperties.recordCount != result.recordCount) {
        // console.log(result);
        configCopy.pageProperties.recordCount = result.recordCount;
        configCopy.pageProperties.maxPages = result.maxPages;
        tableConfig.set(configCopy);
      }
    }
  });

  const clientusers = JoinClient.get('clientUsers');
  const clientUsersLoaded = !JoinClient.has('clientUsers');

  return {
    loading: clientUsersLoaded,
    customers: clientusers,
    lifestyles: LifestylesColl.find().fetch(),
  };
})(Customers);
