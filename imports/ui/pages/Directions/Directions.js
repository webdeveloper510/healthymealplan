import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import sortBy from 'lodash/sortBy';

import $ from 'jquery';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog,
} from 'material-ui/Dialog';

import Menu, { MenuItem } from 'material-ui/Menu';

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
import autoBind from 'react-autobind';

import Sides from '../../../api/Sides/Sides';
import Deliveries from '../../../api/Deliveries/Deliveries';
import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import PostalCodes from '../../../api/PostalCodes/PostalCodes';
import Routes from '../../../api/Routes/Routes';

import Loading from '../../components/Loading/Loading';
import DirectionsTable from './DirectionsTable';

// import Containers from 'meteor/jivanysh:react-list-container';
//
// const ListContainer = Containers.ListContainer;

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
      customerOrderDialogOpen: false,
      anchorEl: null,
      filterBy: 'all',
      deliveryOrder: [],
      assignedUsersOrderChanging: false,
      assignedUsersLoading: true,
      assignedUsers: [],
      assignedUsersOrder: [],
    };

    autoBind(this);
  }


  getAssignedUsersAndTheirOrder() {
    this.setState({
      assignedUsersLoading: true,
    });

    Meteor.call('getAssignedUsersAndTheirOrder', (err, res) => {
      if (err) {
        this.prpos.popTheSnackbar({
          message: 'Error fetching assigned users for delivery order sorting.',
        });
      } else {
        this.setState({
          assignedUsersLoading: false,
          assignedUsers: res.assignedUsers,
          assignedUsersOrder: res.assignedUsersOrder,
        });
      }
    });
  }

  componentDidMount() {
    this.getAssignedUsersAndTheirOrder();
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

  renderAddressSubText(address) {
    let toRender = '';

    if (address.type === 'apartment') {
      toRender = `${address.apartmentName ? `Apartment name  ${address.apartmentName}` : ''}, ${address.unit ? `Unit ${address.unit}` : ''}, ${address.buzzer ? `Business ${address.buzzer}` : ''}`;
    } else if (address.type === 'hotel') {
      toRender = `${address.hotelName ? `Unit ${address.hotelName}` : ''}, ${address.roomNumber ? `Room number ${address.roomNumber}` : ''}`;
    } else if (address.type === 'house') {
      toRender = `${address.unit ? `Unit ${address.unit}` : ''} `;
    } else if (address.type === 'business') {
      toRender = `${address.businessName ? `Business name ${address.businessName}` : ''}, ${address.unit ? `Unit ${address.unit}` : ''}, ${address.buzzer ? `Business ${address.buzzer}` : ''}`;
    } else if (address.type === 'dormitory') {
      toRender = `${address.dormName ? `Dorm name ${address.dormName}` : ''},  ${address.dormResidence ? `Dorm residence ${address.dormResidence}` : ''} ${address.roomNumber ? `Room number ${address.roomNumber}` : ''}, ${address.buzzer ? `Business ${address.buzzer}` : ''}`;
    }

    return toRender;
  }


  getStatusClass(e) {
    if (e === undefined) {
      return 'status status--abandoned';
    }

    if (e === 'active') {
      return 'status status--active';
    }

    if (e === 'paused') {
      return 'status status--paused';
    }

    if (e === 'cancelled') {
      return 'status status--cancelled';
    }
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

  getListStyle(isDraggingOver) {
    return {
      background: isDraggingOver ? 'lightblue' : '',
      padding: 0,
      width: '100%',
    };
  }

  getItemStyle(isDragging, draggableStyle) {
    return ({
      userSelect: 'none',
      padding: 4,
      margin: '0 0 4px 0',

      background: isDragging ? 'lightgreen' : '',

      ...draggableStyle,
    });
  }

  reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reOrderedDeliveryOrder = this.reorder(
      this.state.assignedUsers,
      result.source.index,
      result.destination.index,
    );

    this.setState({
      assignedUsers: reOrderedDeliveryOrder,
      assignedUsersOrderChanging: true,
    });
  }

  handleFilterBy(deliveryTime) {
    this.setState({ filterBy: deliveryTime, anchorEl: null });
  }

  handleCustomerOrderSave() {
    const assignedUsersOrder = this.state.assignedUsers.map(e => e._id);

    Meteor.call('saveCustomerDeliveriesOrder', assignedUsersOrder, (err) => {
      if (err) {
        this.props.popTheSnackbar({
          message: 'There was a problem saving the delivery order',
        });
      } else {
        this.props.popTheSnackbar({
          message: 'Delivery order saved successfully',
        });
      }

      this.setState({
        customerOrderDialogOpen: false,
        assignedUsersOrderChanging: false,
        assignedUsersOrder,
      });
    });
  }

  renderAssignedUsers() {
    if (this.state.assignedUsersOrderChanging) {
      return this.state.assignedUsers;
    }

    return sortBy(this.state.assignedUsers, user => this.state.assignedUsersOrder.indexOf(user._id));
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
            <Grid item xs={12} style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
              <Typography type="headline" gutterBottom className="headline pull-left" style={{ fontWeight: 500 }}>
                  Directions for {moment(this.state.currentSelectorDate).format('dddd, MMMM D')}
              </Typography>

              <div>
                <Button onClick={() => this.setState({ customerOrderDialogOpen: true, assignedUsersOriginalOrderRendered: true })}>Order</Button>

                <Button
                  aria-owns={this.state.anchorEl ? 'simple-menu' : undefined}
                  aria-haspopup="true"
                  onClick={e => this.setState({ anchorEl: e.currentTarget })}
                >
                    Filter: {this.state.filterBy === 'all' ? 'All' : this.state.filterBy === 'dayOf' ? 'Day' : 'Evening' }
                </Button>
                <Menu
                  id="simple-menu"
                  anchorEl={this.state.anchorEl}
                  open={Boolean(this.state.anchorEl)}
                  onClose={() => this.setState({ anchorEl: null })}
                >
                  <MenuItem onClick={() => this.handleFilterBy('all')}>All</MenuItem>
                  <MenuItem onClick={() => this.handleFilterBy('dayOf')}>Day of</MenuItem>
                  <MenuItem onClick={() => this.handleFilterBy('nightBefore')}>Evening</MenuItem>
                </Menu>
              </div>
            </Grid>

          </Grid>


          <DirectionsTable
            deliveries={this.props.deliveries}
            sides={this.props.sides}
            popTheSnackbar={this.props.popTheSnackbar}
            searchTerm={this.state.searchSelector}
            rowsLimit={this.state.rowsVisible}
            history={this.props.history}
            sortByOptions={this.sortByOption.bind(this)}
            currentSelectorDate={this.state.currentSelectorDate}
            searchSelector={this.state.searchSelector}
            deliveryGuys={this.props.deliveryGuys}
            userRoles={this.props.userRoles || this.props.roles}
            userId={this.props.userId}
            filterBy={this.state.filterBy}
            assignedUsersOrder={this.state.assignedUsersOrder}
          />


          <Dialog
            maxWidth="md"
            fullWidth
            open={this.state.customerOrderDialogOpen}
            onClose={() => this.setState({
              assignedUsersOrderChanging: false,
              customerOrderDialogOpen: false })}
          >
            <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
                    Change delivery order
            </Typography>
            <DialogContent>

              <List>
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={this.getListStyle(snapshot.isDraggingOver)}
                      >
                        {this.state.assignedUsers.length > 0 && (
                          <React.Fragment>
                            {this.renderAssignedUsers().map((item, index) => (
                              <Draggable key={item._id} draggableId={item._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    button
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={this.getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style,
                                    )}
                                  >
                                    <Typography type="title">
                                      {`${item.subCustomer.profile.name.first} ${item.subCustomer.profile.name.last || ''}`}
                                      {/*<span className={`status-circle status-circle__directions ${this.getStatusClass(item.status)}`} />*/}
                                    </Typography>
                                    <Typography type="subheading" style={{ textTransform: 'capitalize' }}>
                                      {item.subCustomer.address.streetAddress}
                                    </Typography>
                                    <Typography type="body1">
                                      {item.customer ? this.renderAddressSubText(item.subCustomer.address) : ''}
                                    </Typography>
                                    <div style={{ marginTop: '5px' }} />
                                    <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                                      {item.subCustomer ? (
                                        `${item.subCustomer.postalCode} `
                                      ) : ''}
                                    </Typography>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </React.Fragment>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ customerOrderDialogOpen: false })}>
                        Cancel
              </Button>
              <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleCustomerOrderSave} color="accent">
                        Save
              </Button>
            </DialogActions>
          </Dialog>


        </Grid>
      </div >
    ) : <Loading />);
  }
}

Directions.propTypes = {
  loading: PropTypes.bool.isRequired,
  delvieries: PropTypes.arrayOf(PropTypes.object).isRequired,
  deliveryGuys: PropTypes.array,
  usersAssigned: PropTypes.array,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const deliveriesDataVar = deliveriesData.get();

  const subscription = Meteor.subscribe('deliveries.onDate', deliveriesDataVar.onDate);
  const subscription2 = Meteor.subscribe('sides', {}, {});
  // const subscription3 = Meteor.subscribe('routes');
  // const subscription4 = Meteor.subscribe('subscriptions');
  // const subscription5 = Meteor.subscribe('users.customers', {}, {});
  const subscription6 = Meteor.subscribe('users.deliveryGuys');

  return {
    // loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready() && !subscription4.ready() && !subscription5.ready() && !subscription6.ready() && Meteor.user(),
    loading: !subscription.ready() &&  !subscription2.ready() && !subscription6.ready() && Meteor.user(),
    deliveries: Deliveries.find().fetch(),
    routes: Routes.find().fetch(),
    sides: Sides.find().fetch(),
    postalCodes: PostalCodes.find().fetch(),
    deliveryGuys: Meteor.users.find({ roles: ['admin', 'delivery'] }).fetch(),
  };
})(Directions);
