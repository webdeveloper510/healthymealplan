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
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import LeftArrow from 'material-ui-icons/ArrowBack';
import RightArrow from 'material-ui-icons/ArrowForward';


import moment from 'moment';


import Deliveries from '../../../api/Deliveries/Deliveries';
import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import PostalCodes from '../../../api/PostalCodes/PostalCodes';
import Routes from '../../../api/Routes/Routes';

import Loading from '../../components/Loading/Loading';
import DirectionsTable from './DirectionsTable';

import Containers from 'meteor/utilities:react-list-container';

const ListContainer = Containers.ListContainer;


class Directions extends React.Component {
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
      currentTabValue: /./,
      selectedRoute: '',
      currentSelectorDate: moment(new Date()).format('YYYY-MM-DD'),
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

          <Grid container className="clearfix">
            <Grid item xs={12} style={{ alignItems: 'center' }}>
              <Typography type="headline" gutterBottom className="headline pull-left" style={{ fontWeight: 500 }}>Directions for {moment(this.state.currentSelectorDate).format('dddd, MMMM D')}

              </Typography>

            </Grid>

          </Grid>

          <div style={{ marginTop: '25px' }}>
            <AppBar position="static" className="appbar--no-background appbar--no-shadow">
              <Tabs indicatorColor="#000" value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
                <Tab label="All" value={/./} />
                {this.props.routes && this.props.routes.map((e, i) => (
                  <Tab key={i} label={e.title} value={e._id} />
                ))}
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
            position: 'relative',
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
                display: (this.state.searchSelector.length > 0) ? 'block' : 'none',
              }}
            />

            <Input
              className="input-box"
              style={{ width: '100%', position: 'relative' }}
              placeholder="Search directions"
              onKeyUp={this.searchByName.bind(this)}
              inputProps={{
                id: 'search-type-text',
                'aria-label': 'Description',
              }}
            />
          </div>
          <ListContainer
            limit={50}
            collection={Deliveries}
            publication="deliveries"
            joins={[
              {
                localProperty: 'routeId',
                collection: Routes,
                joinAs: 'route',
              },
              {
                localProperty: 'postalCode',
                collection: PostalCodes,
                joinAs: 'postalCode',
              },
              {
                localProperty: 'customerId',
                collection: Meteor.users,
                joinAs: 'customer',
              },
              {
                localProperty: 'subscriptionId',
                collection: Subscriptions,
                joinAs: 'subscription',
              },
            ]}
            options={this.state.options}
            selector={{
              onDate: this.state.currentSelectorDate,
              routeId: { $regex: new RegExp(this.state.currentTabValue), $options: 'i' },
              $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }],
            }}
          >
            <DirectionsTable
              popTheSnackbar={this.props.popTheSnackbar}
              searchTerm={this.state.searchSelector}
              rowsLimit={this.state.rowsVisible}
              history={this.props.history}
              sortByOptions={this.sortByOption.bind(this)}
              currentSelectorDate={this.state.currentSelectorDate}
              searchSelector={this.state.searchSelector}
              routeSelector={this.state.currentTabValue}
            />

          </ListContainer>


        </Grid>
      </div >
    ) : <Loading />);
  }
}

Directions.propTypes = {
  loading: PropTypes.bool.isRequired,
  delvieries: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('directions');
  const subscription2 = Meteor.subscribe('postalcodes');
  const subscription3 = Meteor.subscribe('routes');
  const subscription4 = Meteor.subscribe('subscriptions');
  const subscription5 = Meteor.subscribe('users.customers');


  return {
    loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready() && !subscription4.ready() && !subscription5.ready(),
    deliveries: Deliveries.find().fetch(),
    routes: Routes.find().fetch(),
    postalCodes: PostalCodes.find().fetch(),
  };
}, Directions);
