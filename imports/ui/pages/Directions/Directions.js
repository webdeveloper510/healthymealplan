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

import Containers from 'meteor/jivanysh:react-list-container';

const ListContainer = Containers.ListContainer;

const deliveriesData = new ReactiveVar({
  onDate: moment().format('YYYY-MM-DD'),
});

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
      currentSelectorDate: moment().format('YYYY-MM-DD'),
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
      const formattedDate = moment(this.state.currentSelectorDate).add(1, 'd').format('YYYY-MM-DD');
      this.setState({
        currentSelectorDate: formattedDate,
      });
      deliveriesData.set({ onDate: formattedDate });
    } else {
      const formattedDate = moment(this.state.currentSelectorDate).subtract(1, 'd').format('YYYY-MM-DD');
      this.setState({
        currentSelectorDate: formattedDate,
      });
      deliveriesData.set({ onDate: formattedDate });
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

          <ListContainer
            limit={1000}
            collection={Deliveries}
            publication="deliveries"
            // joins={[
            //   {
            //     localProperty: 'routeId',
            //     collection: Routes,
            //     joinAs: 'route',
            //   },
            //   {
            //     localProperty: 'postalCode',
            //     collection: PostalCodes,
            //     joinAs: 'postalCode',
            //   },
            //   {
            //     localProperty: 'customerId',
            //     collection: Meteor.users,
            //     joinAs: 'customer',
            //   },
            //   {
            //     localProperty: 'subscriptionId',
            //     collection: Subscriptions,
            //     joinAs: 'subscription',
            //   },
            // ]}
            options={this.state.options}
            selector={{
              onDate: this.state.currentSelectorDate,
              // routeId: { $regex: new RegExp(this.state.currentTabValue), $options: 'i' },
              $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }],
            }}
            component={DirectionsTable}
            componentProps={{
              popTheSnackbar: this.props.popTheSnackbar,
              searchTerm: this.state.searchSelector,
              rowsLimit: this.state.rowsVisible,
              history: this.props.history,
              sortByOptions: this.sortByOption.bind(this),
              currentSelectorDate: this.state.currentSelectorDate,
              searchSelector: this.state.searchSelector,
              routeSelector: this.state.currentTabValue,
              routes: this.props.routes,
              deliveryGuys: this.props.deliveryGuys,
              userRoles: this.props.userRoles || this.props.roles,
              userId: this.props.userId,
            }}

          />


        </Grid>
      </div >
    ) : <Loading />);
  }
}

Directions.propTypes = {
  loading: PropTypes.bool.isRequired,
  delvieries: PropTypes.arrayOf(PropTypes.object).isRequired,
  deliveryGuys: PropTypes.array,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const deliveriesDataVar = deliveriesData.get();

  const subscription = Meteor.subscribe('deliveries.onDate', deliveriesDataVar.onDate);
  const subscription2 = Meteor.subscribe('postalcodes');
  const subscription3 = Meteor.subscribe('routes');
  const subscription4 = Meteor.subscribe('subscriptions');
  const subscription5 = Meteor.subscribe('users.customers', {}, {});
  const subscription6 = Meteor.subscribe('users.deliveryGuys');

  return {
    loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready() && !subscription4.ready() && !subscription5.ready() && !subscription6.ready() && Meteor.user(),
    deliveries: Deliveries.find().fetch(),
    routes: Routes.find().fetch(),
    postalCodes: PostalCodes.find().fetch(),
    deliveryGuys: Meteor.users.find({ roles: ['admin', 'delivery'] }).fetch(),
  };
})(Directions);
