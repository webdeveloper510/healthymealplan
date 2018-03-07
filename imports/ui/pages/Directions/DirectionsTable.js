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
import { Random } from 'meteor/random';

import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';

import moment from 'moment';

import sumBy from 'lodash/sumBy';

// import { createContainer } from 'meteor/react-meteor-data';
import Loading from '../../components/Loading/Loading';

import './DirectionsTable.scss';

class DirectionsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      updateDialogOpen: false,
      batchDeliveryStatus: '',


      aggregateData: null,
      aggregateDataLoading: true,
    };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.checkInDeliveries = this.checkInDeliveries.bind(this);
  }

  componentDidMount() {
    Meteor.call('getDeliveryAggregatedData', this.props.currentSelectorDate, (err, res) => {
      this.setState({
        aggregateData: res,
      }, () => {
        this.setState({ aggregateDataLoading: false });
      });

      console.log(res);
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.currentSelectorDate != this.props.currentSelectorDate) {
      this.setState({
        aggregateDataLoading: true,
      }, () => {
        Meteor.call('getDeliveryAggregatedData', this.props.currentSelectorDate, (err, res) => {
          console.log(res);
          this.setState({
            aggregateData: res,
          }, () => {
            this.setState({ aggregateDataLoading: false });
          });
        });
      });
    }
  }

  rowSelected(rowId, event, checked) {
    console.log(checked);

    const selectedRowId = event.target.parentNode.parentNode.getAttribute('id');
    $(`.${selectedRowId}`).toggleClass('row-selected');
    let currentlySelectedCheckboxes;

    const clonedSelectedCheckboxes = this.state.selectedCheckboxes ? this.state.selectedCheckboxes.slice() : [];

    if ($(event.target).prop('checked')) {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber + 1;
      clonedSelectedCheckboxes.push(rowId);
    } else {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber - 1;
      clonedSelectedCheckboxes.splice(clonedSelectedCheckboxes.indexOf(rowId), 1);
    }

    this.setState({
      selectedCheckboxesNumber: currentlySelectedCheckboxes,
      selectedCheckboxes: clonedSelectedCheckboxes,
    });
  }

  selectAllRows(event) {
    let allCheckboxIds = [];
    // console.log(event.target);

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

  handleBatchStatusChange() {
    console.log('Update selected rows');

    localStorage.setItem('deliveryUpdated', this.state.selectedCheckboxesNumber);

    const categoryIds = this.state.selectedCheckboxes;

    const deliveries = this.state.aggregateData.deliveries.filter(el => this.state.selectedCheckboxes.indexOf(el._id) >= 0);


    Meteor.call('deliveries.batchUpdate', deliveries, this.state.batchDeliveryStatus, (error) => {
      console.log('inside method');
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('deliveryUpdated')} delivery statuses updated.`,
        });
      }
    });

    this.setState({
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      updateDialogOpen: false,
    });

    this.forceUpdate();
  }

  handleStatusChange(event, deliveryId, batchChange) {
    if (batchChange) {
      this.setState({
        updateDialogOpen: true,
        batchDeliveryStatus: event.target.value,
      });
    } else {
      const delivery = this.state.aggregateData.deliveries.find(el => el._id == deliveryId);

      Meteor.call('deliveries.update', delivery, event.target.value, (error) => {
        console.log('inside method');
        if (error) {
          this.props.popTheSnackbar({
            message: error.reason,
          });
        } else {
          this.props.popTheSnackbar({
            message: 'Delivery status updated.',
          });
        }
      });
    }
  }

  renderNoResults(count) {
    if (count == 0) {
      return (
        <p style={{ padding: '25px' }} className="subheading">No delivery found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo; on {moment(this.props.currentSelectorDate).format('DD MMMM, YYYY')}</p>
      );
    }
  }

  renderAddress(address) {
    let toRender = '';

    if (address.type == 'apartment') {
      toRender = `${address.apartmentName} ${address.unit} ${address.buzzer} ${address.streetAddress}`;
    } else if (address.type == 'hotel') {
      toRender = `${address.hotelName} ${address.roomNumber} ${address.streetAddress}`;
    } else if (address.type == 'house') {
      toRender = `${address.unit} ${address.streetAddress}`;
    } else if (address.type == 'business') {
      toRender = `${address.businessName} ${address.unit} ${address.buzzer} ${address.streetAddress}`;
    } else if (address.type == 'dormitory') {
      toRender = `${address.dormName} ${address.dormResidence} ${address.roomNumber} ${address.buzzer} ${address.streetAddress}`;
    }

    return toRender;
  }

  isCheckboxSelected(id) {
    // console.log(this.state.selectedCheckboxes);

    if (this.state.selectedCheckboxes.length) {
      if (this.state.selectedCheckboxes.indexOf(id) !== -1) {
        return true;
      }
    }

    return false;
  }

  updateDialogHandleClickOpen() {
    this.setState({ updateDialogOpen: true });
  }

  updateDialogHandleRequestClose() {
    this.setState({ updateDialogOpen: false });
  }

  getStatusClass(status) {
    let statusToReturn = '';
    switch (status) {
      case 'In-Transit':
        statusToReturn = 'status status--in-transit';
        break;

      case 'Delivered':
        statusToReturn = 'status status--delivered';

        break;

      case 'Not delivered':
        statusToReturn = 'status status--not-delivered';

        break;

      case 'Delayed':
        statusToReturn = 'status status--delayed';

        break;

      case 'Scheduled':
        statusToReturn = 'status status--scheduled';

        break;

      default:
        statusToReturn = '';
    }

    return statusToReturn;
  }

  checkInDeliveries(data) {
    return this.props.results.find(e => e.customerId == data.customerId && e.subscriptionId == data.subscriptionId && e.onDate == this.props.currentSelectorDate);
  }

  render() {
    if (this.state.aggregateDataLoading) {
      return (<Loading />);
    }

    return (
      <div>
        <Paper elevation={2} className="table-container">
          {this.state.selectedCheckboxes.length > 0 ? (
            <div className="table-container--delete-rows-container" style={{ backgroundColor: '#607d8b' }}>
              <Typography style={{ color: '#fff' }} className="subheading" type="subheading">
                {this.state.selectedCheckboxesNumber} deliver{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'} selected
              </Typography>
              <TextField
                fullWidth
                id="select-delivery-status"
                select
                SelectProps={{ native: true }}
                name="status"
                style={{
                  float: 'right', width: '200px',
                }}
                onChange={e => this.handleStatusChange(e, null, true)}
              >
                <option value="Scheduled">
                  Scheduled
                </option>
                <option value="In-Transit">
                  In-Transit
                </option>
                <option value="Delayed">
                  Delayed
                </option>
                <option value="Not delivered">
                  Not delivered
                </option>
                <option value="Delivered">
                  Delivered
                </option>
              </TextField>
            </div>
          )
            : ''

          }
          <Table className="table-container" style={{ tableLayout: 'fixed' }}>

            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" style={{ width: '12%' }}>
                  <Checkbox onChange={this.selectAllRows.bind(this)} />
                </TableCell>
                <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.sortByOptions('SKU')}>
                  <Typography className="body2" type="body2">Customer</Typography></TableCell>
                <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Address</Typography></TableCell>
                <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Route</Typography></TableCell>
                <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Delivery Type</Typography></TableCell>
                <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Meals</Typography></TableCell>
                <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Status</Typography></TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {!this.state.aggregateDataLoading && this.state.aggregateData.deliveries.map((e, i) => {

                const inDeliveries = this.checkInDeliveries(e);
                const rowId = inDeliveries != undefined ? inDeliveries._id : e._id;
                const status = inDeliveries != undefined ? inDeliveries.status : 'Scheduled';
                const isSelected = this.isCheckboxSelected(rowId);
                const statusClass = this.getStatusClass(status);

                return (
                  <TableRow hover className={`${rowId} ${statusClass}`} key={rowId}>
                    <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '12%' }} padding="checkbox">
                      <Checkbox
                        className="row-checkbox"
                        id={rowId}
                        checked={isSelected}
                        onChange={this.rowSelected.bind(this, rowId)}
                      />
                    </TableCell>

                    <TableCell padding="none" style={{ width: '14.66%' }} onClick={() => this.props.history.push(`/categories/${e._id}/edit`)}>
                      <Typography className="subheading" type="subheading">{e.customer ? (
                        `${e.customer.profile && e.customer.profile.name && e.customer.profile.name.first ? e.customer.profile.name.first : ''} 
                          ${e.customer.profile && e.customer.profile.name && e.customer.profile.name.last ? e.customer.profile.name.last : ''}`
                      ) : ''}</Typography>
                      <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {e.customer ? (
                          `${e.customer.associatedProfiles > 0 ? e.customer.associatedProfiles : ''}${e.customer.associatedProfiles > 1 ? ' profiles' : ''}`
                        ) : ''}
                      </Typography>
                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '14.66%' }}
                      padding="none"
                    >
                      <a target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${this.renderAddress(e.customer.address)}`}>
                        <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                          {e.customer ? this.renderAddress(e.customer.address) : ''}
                        </Typography>
                      </a>

                      <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {e.customer ? (
                          `${e.customer.postalCode}`
                        ) : ''}
                      </Typography>

                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '14.66%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/categories/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        {e.route ? (
                          `${e.route.title}`
                        ) : ''}
                      </Typography>

                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '14.66%' }}
                      padding="none"
                    >
                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        {e.title === 'nightBefore' ? 'Evening' : e.title === 'dayOf' ? 'Day' : ''}
                      </Typography>
                      <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {moment(e.onDate).format('MMMM D')}
                      </Typography>
                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '14.66%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/categories/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>

                        {sumBy(e.meals, 'total')}
                      </Typography>

                      <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>0 sides</Typography>

                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '14.66%' }}
                      padding="none"
                    >
                      <TextField
                        fullWidth
                        id="select-delivery-status"
                        select
                        SelectProps={{ native: true }}
                        name="status"
                        style={{ width: '90%', margin: '0 auto' }}
                        onChange={event => this.handleStatusChange(event, e._id, false)}
                        value={status}
                      >
                        <option value="Scheduled">
                          Scheduled
                        </option>
                        <option value="In-Transit">
                          In-Transit
                        </option>
                        <option value="Delayed">
                          Delayed
                        </option>
                        <option value="Not delivered">
                          Not delivered
                        </option>
                        <option value="Delivered">
                          Delivered
                        </option>
                      </TextField>

                    </TableCell>


                  </TableRow>
                );
              },
              )
              }

              {this.renderNoResults(this.props.count)}

            </TableBody>
          </Table>
        </Paper>
        <Dialog open={this.state.updateDialogOpen} onClose={this.updateDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Update {this.state.selectedCheckboxesNumber} deliver{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading"> Are you sure you want to update {this.state.selectedCheckboxesNumber} deliver{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'}?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.updateDialogHandleRequestClose.bind(this)} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleBatchStatusChange.bind(this)} color="accent">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DirectionsTable.propTypes = {
  // results: PropType.isRequired,
  history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  loadMore: PropTypes.func.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  currentSelectorDate: PropTypes.string.isRequired,
};


// export default createContainer(() => {
//   const deliveryCountSub = Meteor.subscribe('deliveries-all-count');

//   return {
//     // ingredientTypes: IngredientsWithTypes.find().fetch(),
//     categoryCount: Counts.get('deliveries'),
//   };
// }, DirectionsTable);

export default DirectionsTable;
