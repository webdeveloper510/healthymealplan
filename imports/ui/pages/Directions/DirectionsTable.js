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
  DialogTitle,
  withMobileDialog,
} from 'material-ui/Dialog';

import NoteIcon from 'material-ui-icons/Note';


import $ from 'jquery';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { Random } from 'meteor/random';

import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import Chip from 'material-ui/Chip';
import List, { ListItem, ListItemText, ListItemIcon } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import moment from 'moment';

import sumBy from 'lodash/sumBy';
import groupBy from 'lodash/groupBy';
import jsPDF from 'jspdf';
import autoBind from 'react-autobind';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import vittlebase64 from '../../../modules/vittlelogobase64';
import hmpbase64 from '../../../modules/hmplogobase64';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Loading from '../../components/Loading/Loading';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';

import './DirectionsTable.scss';

function renderDeliveryLabelData(doc, delivery, formalType, currentTabValue, multiple = false, multipleCurrent = 0, multipleTotal = 0) {
  doc.addPage();

  doc.addImage(vittlebase64, 'PNG', 1.78, 0.15, 0.4, 0.4);
  // doc.addImage(hmpbase64, 'JPEG', 1.18, 0.15, 1.6, 0.19);

  if (multiple) {
    doc.setFontSize(10); // name

    doc.text(`${multipleCurrent}/${multipleTotal}`, 3.5, 0.285);
  }

  doc.setFontSize(14.5); // name

  const names = [];

  delivery.meals.forEach((meal) => {
    if (meal.total > 0) {
      names.push(`${meal.name} (${meal.total}) `);
    }
  });

  doc.text(names, 0.25, 1.15);

  doc.setFontSize(48); // Route
  doc.setFontStyle('bold'); // Route

  const route = delivery.route.title;
  const postalCode = delivery.customer.postalCode;

  // doc.text(route === 'Downtown' ? 'DT' : route.slice(0, 1), 0.25, 2.75);
  doc.text(currentTabValue, 0.25, 2.75);

  doc.setFontSize(12); // day postalcode
  doc.setFontStyle('normal'); // Route

  const coolerBag = delivery.customer.coolerBag ? 'Cooler bag' : '';

  const info = [`${formalType} ${moment(delivery.onDate).format('MMMM D')} `, `${postalCode} `, coolerBag];

  doc.text(info, 1.5, 2.4);
}

class DirectionsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      updateDialogOpen: false,
      batchDeliveryStatus: '',

      addressDialogOpen: false,
      noteDialogOpen: false,

      selectedCustomer: '',
      selectedCustomerNote: '',
      selectedCustomerAddress: '',

      deliveries: null,
      deliveriesLoading: true,

      deliveriesLoadingTabChange: true,

      currentTabValue: this.props.userRoles.findIndex(e => e == 'delivery') == -1 ? { $exists: true } : this.props.userId,

      searchBy: '',
    };

    autoBind(this);
  }

  componentDidMount() {
    Meteor.call('getDeliveriesForTheDay', this.props.currentSelectorDate, this.state.currentTabValue, (err, res) => {
      this.setState({
        deliveries: res,
      }, () => {
        this.setState({ deliveriesLoading: false, deliveriesLoadingTabChange: false });
      });
    });
  }

  handleAddressDialogOpen(customerProfile, customerAddress) {
    this.setState({
      selectedCustomer: `${customerProfile.name.first} ${customerProfile.name.last}`,
      selectedCustomerAddress: customerAddress,
    }, () => {
      this.setState({
        addressDialogOpen: true,
      });
    });
  }

  handleAddressDialogClose() {
    this.setState({
      selectedCustomer: '',
      selectedCustomerAddress: '',
      addressDialogOpen: false,
    });
  }

  handleNoteDialogOpen(customerProfile, customerNote) {
    this.setState({
      selectedCustomer: `${customerProfile.name.first} ${customerProfile.name.last}`,
      selectedCustomerNote: customerNote,
    }, () => {
      this.setState({
        noteDialogOpen: true,
      });
    });
  }

  handleNoteDialogClose() {
    this.setState({
      selectedCustomer: '',
      selectedCustomerNote: '',
      noteDialogOpen: false,
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.currentSelectorDate != this.props.currentSelectorDate) {
      this.setState({
        deliveriesLoading: true,
        deliveriesLoadingTabChange: true,
      }, () => {
        Meteor.call('getDeliveriesForTheDay', this.props.currentSelectorDate, this.state.currentTabValue, (err, res) => {
          this.setState({
            deliveries: res,
          }, () => {
            this.setState({ deliveriesLoading: false, deliveriesLoadingTabChange: false });
          });
        });
      });
    }
  }

  rowSelected(rowId, event, checked) {
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

    const reOrdered = this.reorder(
      this.state.deliveries,
      result.source.index,
      result.destination.index,
    );

    this.setState({
      reOrdered,
    });
  }

  handleBatchStatusChange() {
    localStorage.setItem('deliveryUpdated', this.state.selectedCheckboxesNumber);

    const deliveries = this.state.deliveries.filter(el => this.state.selectedCheckboxes.indexOf(el._id) >= 0);
    // console.log(deliveries);
    // return;

    Meteor.call('deliveries.batchUpdate', deliveries, this.state.batchDeliveryStatus, (error) => {
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
      openMassNotifyDialog: false,
    });

  }

  handleDeliveryAssign(valueToAssign) {
    // console.log(event.currentTarget.value);
    const tabValue = valueToAssign;

    const deliveries = this.state.deliveries.filter(el => this.state.selectedCheckboxes.indexOf(el._id) >= 0).map(e => e.subscriptionId);
    // console.log(deliveries);

    if (!deliveries) {
      this.props.popTheSnackbar({
        message: 'You must select at least 1 delivery to assign',
      });

      return;
    }

    const dataToSend = {
      subscriptionIds: deliveries,
      deliveryPersonId: valueToAssign,
    };

    Meteor.call('subscriptions.batchAssignDeliveryPersonnel', dataToSend, (err, res) => {
      if (err) {
        this.props.popTheSnackbar({
          message: err.reason || err,
        });
      } else {
        this.props.popTheSnackbar({
          message: 'Delivery personnel changed successfully',
        });

        this.setState({
          openAssignDialog: false,
          selectedCheckboxes: [],
          selectedCheckboxesNumber: 0,
        });
      }
    });
  }

  handleStatusChange(statusToChangeTo, deliveryId, batchChange) {
    if (batchChange) {
      this.setState({
        updateDialogOpen: true,
        batchDeliveryStatus: statusToChangeTo,
      });
    } else {
      const delivery = this.state.deliveries.find(el => el._id == deliveryId);

      Meteor.call('deliveries.update', delivery, statusToChangeTo, (error) => {
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

  renderAddressSubText(address) {
    let toRender = '';

    if (address.type == 'apartment') {
      toRender = `${address.apartmentName ? `Apartment name  ${address.apartmentName}` : ''}, ${address.unit ? `Unit ${address.unit}` : ''}, ${address.buzzer ? `Business ${address.buzzer}` : ''}`;
    } else if (address.type == 'hotel') {
      toRender = `${address.hotelName ? `Unit ${address.hotelName}` : ''}, ${address.roomNumber ? `Room number ${address.roomNumber}` : ''}`;
    } else if (address.type == 'house') {
      toRender = `${address.unit ? `Unit ${address.unit}` : ''} `;
    } else if (address.type == 'business') {
      toRender = `${address.businessName ? `Business name ${address.businessName}` : ''}, ${address.unit ? `Unit ${address.unit}` : ''}, ${address.buzzer ? `Business ${address.buzzer}` : ''}`;
    } else if (address.type == 'dormitory') {
      toRender = `${address.dormName ? `Dorm name ${address.dormName}` : ''},  ${address.dormResidence ? `Dorm residence ${address.dormResidence}` : ''} ${address.roomNumber ? `Room number ${address.roomNumber}` : ''}, ${address.buzzer ? `Business ${address.buzzer}` : ''}`;
    }

    return toRender;
  }

  isCheckboxSelected(id) {
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

  printLabels(type) {
    const sweetType = type == 'dayOf' ? 'morning' : type == 'nightBefore' ? 'evening' : '';
    const formalType = type == 'dayOf' ? 'Day of' : type == 'nightBefore' ? 'Evening of' : '';


    const currentDate = this.props.currentSelectorDate;

    const deliveries = this.state.deliveries.filter(e => e.onDate == currentDate && e.title == type);

    const deliveriesByRoute = groupBy(deliveries, e => e.route.title);

    if (deliveries.length == 0) {
      this.props.popTheSnackbar({
        message: `There are no ${sweetType} labels to print`,
      });

      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 3],
    });


    for (const key in deliveriesByRoute) {
      if (deliveriesByRoute.hasOwnProperty(key)) {
        const element = deliveriesByRoute[key];

        element.forEach((e, i) => {
          let mealTotal = 0;

          e.meals.forEach((meal) => {
            if (meal.total > 0) {
              mealTotal += meal.total;
            }
          });

          let deliveryAssignedToInitials = e.route.title == 'Downtown' ? 'DT' : e.route.title.charAt(0);

          if (typeof this.state.currentTabValue === 'string' && this.state.currentTabValue !== 'unassigned') {
            const deliveryAssignedTo = this.props.deliveryGuys.find(deliveryGuy => deliveryGuy._id == this.state.currentTabValue);
            // console.log(deliveryAssignedTo);
            deliveryAssignedToInitials = deliveryAssignedTo.profile.name.first.charAt(0) + deliveryAssignedTo.profile.name.last.charAt(0);
          } else if (typeof this.state.currentTabValue === "object") {
            if (e.deliveryAssignedTo !== "unassigned") {
              const deliveryAssignedTo = this.props.deliveryGuys.find(deliveryGuy => deliveryGuy._id == e.deliveryAssignedTo);
              // console.log(deliveryAssignedTo);
              deliveryAssignedToInitials = deliveryAssignedTo.profile.name.first.charAt(0) + deliveryAssignedTo.profile.name.last.charAt(0);
            }
          }

          if (mealTotal > 4) {
            const perBag = 4;
            const totalBags = Math.ceil(mealTotal / perBag);

            for (let index = 1; index <= totalBags; index++) {
              renderDeliveryLabelData(doc, e, formalType, deliveryAssignedToInitials, true, index, totalBags);
            }
          } else {
            renderDeliveryLabelData(doc, e, formalType, deliveryAssignedToInitials);
          }
        });
      }
    }

    doc.deletePage(1);

    doc.save(`Delivery_${this.props.currentSelectorDate}.pdf`);
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

  handleTabChange(event, value) {
    this.setState({
      currentTabValue: value,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deliveriesLoadingTabChange: true,
    });

    Meteor.call('getDeliveriesForTheDay', this.props.currentSelectorDate, value, (err, res) => {
      this.setState({
        deliveries: res,
      }, () => {
        this.setState({ deliveriesLoadingTabChange: false });
      });
    });
  }

  checkInDeliveries(data) {
    return this.props.results.find(e => e.customerId == data.customerId && e.subscriptionId == data.subscriptionId && e.onDate == this.props.currentSelectorDate);
  }

  clearSearchBox() {
    this.setState({
      searchBy: '',
    });
  }

  render() {
    // if (this.state.deliveriesLoading) {
    //   return (<Loading />);
    // }

    return (
      <div>

        <AppBar position="static" className="appbar--no-background appbar--no-shadow" style={{ margin: '25px 0' }}>
          <Tabs indicatorColor="#000" value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
            <Tab label="All" value={{ $exists: true }} />
            {/* {this.props.routes && this.props.routes.map((e, i) => (
              <Tab key={i} label={e.title} value={e._id} />
            ))} */}
            {this.props.deliveryGuys && this.props.deliveryGuys.map((e, i) => (
              <Tab key={e._id} label={e.profile.name.first} value={e._id} />
            ))}
            <Tab label="Unassigned" value="unassigned" />

          </Tabs>
        </AppBar>


        <div style={{
          background: '#FFF',
          borderTopRightRadius: '2px',
          borderTopLeftRadius: '2px',
          marginTop: '3em',
          padding: '16px 25px 1em',
          boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
          position: 'relative',
        }}
        >
          <Input
            className="input-box"
            style={{ width: '100%', position: 'relative' }}
            placeholder="Search directions"
            onKeyUp={(e) => { this.setState({ searchBy: e.target.value }); }}
            // onKeyUp={this.searchByName.bind(this)}
            inputProps={{
              id: 'search-type-text',
              'aria-label': 'Description',
            }}
          />

          <SearchIcon
            className="autoinput-icon autoinput-icon--search"
            style={{ display: (this.state.searchBy.length > 0) ? 'none' : 'block', top: '33%', right: '1.8em !important' }}
          />

          <ClearIcon
            className="autoinput-icon--clear"
            onClick={this.clearSearchBox.bind(this)}
            style={{
              cursor: 'pointer',
              display: (this.state.searchBy.length > 0 && !this.state.selectedCheckboxes.length > 0) ? 'block' : 'none',
            }}
          />

        </div>

        {this.state.deliveriesLoading || this.state.deliveriesLoadingTabChange ? (
          <Loading />
        ) : (
            <Paper elevation={2} className="table-container">
              <div style={{ padding: '20px' }}>
                <Button className="btn btn-primary" onClick={() => this.printLabels('nightBefore')} raised color="primary" style={{ float: 'right', marginLeft: '1em' }}>Print evening labels</Button>
                <Button className="btn btn-primary" onClick={() => this.printLabels('dayOf')} raised color="primary" style={{ float: 'right' }}>Print day of labels</Button>
              </div>


              {this.state.selectedCheckboxes.length > 0 ? (
                <div className="table-container--delete-rows-container" style={{ backgroundColor: '#607d8b' }}>
                  <Typography style={{ color: '#fff' }} className="subheading" type="subheading">
                    {this.state.selectedCheckboxesNumber} deliver{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'} selected
                </Typography>
                  <div>
                    <Button onClick={() => this.setState({ openAssignDialog: true })} style={{ color: '#FFF' }}>Assign</Button>
                    <Button onClick={() => this.setState({ openMassNotifyDialog: true })} style={{ color: '#FFF' }}>Notify</Button>
                  </div>
                </div>

              ) : ''}

              <Table className="table-container" style={{ marginTop: '10px', tableLayout: 'fixed' }}>

                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" style={{ width: '8%' }}>
                      <Checkbox onChange={this.selectAllRows.bind(this)} />
                    </TableCell>
                    <TableCell padding="none" style={{ width: '20%' }} onClick={() => this.props.sortByOptions('SKU')}>
                      <Typography className="body2" type="body2">Customer</Typography>
                    </TableCell>

                    <TableCell padding="none" style={{ width: '15%' }} onClick={() => this.props.sortByOptions('title')}>
                      <Typography className="body2" type="body2">Address</Typography>
                    </TableCell>
                    <TableCell padding="none" style={{ width: '15%' }} onClick={() => this.props.sortByOptions('title')}>
                      <Typography className="body2" type="body2">Driver</Typography>
                    </TableCell>
                    <TableCell padding="none" style={{ width: '10%' }} onClick={() => this.props.sortByOptions('title')}>
                      <Typography className="body2" type="body2">Delivery</Typography>
                    </TableCell>
                    <TableCell padding="none" style={{ width: '10%' }} onClick={() => this.props.sortByOptions('title')}>
                      <Typography className="body2" type="body2">Meals</Typography>
                    </TableCell>
                    <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.sortByOptions('title')}>
                      <Typography className="body2" type="body2">Cooler bag</Typography>
                    </TableCell>
                    <TableCell padding="none" style={{ width: '14%' }} onClick={() => this.props.sortByOptions('title')}>
                      <Typography className="body2" type="body2">Status</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {!this.state.deliveriesLoading && !this.state.deliveriesLoadingTabChange && this.state.deliveries.filter(el =>
                    // if (this.state.currentTabValue != 'all' && el.routeId != this.state.currentTabValue) {
                    //   return false;
                    // }
                    true,

                  ).filter((el) => {
                    const fullName = `${el.customer.profile.name.first} ${el.customer.profile.name.last}`;

                    const like = new RegExp(this.state.searchBy, 'gi');

                    if (this.state.searchBy != '' && !like.test(fullName)) {
                      return false;
                    }

                    return true;

                  }).map((e, i) => {
                    const inDeliveries = this.checkInDeliveries(e);
                    const rowId = inDeliveries != undefined ? inDeliveries._id : e._id;
                    const status = inDeliveries != undefined ? inDeliveries.status : 'Scheduled';
                    const isSelected = this.isCheckboxSelected(rowId);
                    const statusClass = this.getStatusClass(status);

                    return (
                      <TableRow hover className={`${rowId} ${statusClass} delivery-status`} key={rowId}>
                        <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '8%' }} padding="checkbox">
                          <Checkbox
                            className="row-checkbox"
                            id={rowId}
                            checked={isSelected}
                            onChange={this.rowSelected.bind(this, rowId)}
                          />
                        </TableCell>

                        <TableCell padding="none" style={{ width: '20%' }} >
                          <Typography className="subheading" type="subheading" style={{ display: 'flex', alignItems: 'center' }}>
                            {/* <span className="status-circle" />{' '} */}
                            {e.customer ? (
                              `${e.customer.profile && e.customer.profile.name && e.customer.profile.name.first ? e.customer.profile.name.first : ''}
                                   ${e.customer.profile && e.customer.profile.name && e.customer.profile.name.last ? e.customer.profile.name.last : ''} `
                            ) : ''}
                            {' '}
                            {e.customer.address.notes && e.customer.address.notes.length > 0 ? (<NoteIcon style={{ marginLeft: '10px' }} onClick={() => this.handleNoteDialogOpen(e.customer.profile, e.customer.address.notes)} />) : ''}
                          </Typography>

                          <Typography className="body1" type="body1" style={{ marginLeft: '1.5em', color: 'rgba(0, 0, 0, .54)' }}>
                            {e.customer ? (
                              `${e.customer.associatedProfiles > 0 ? e.customer.associatedProfiles : ''} ${e.customer.associatedProfiles > 1 ? ' profiles' : e.customer.associatedProfiles == 1 ? ' profile' : ''} `
                            ) : ''}

                          </Typography>
                        </TableCell>

                        <TableCell
                          style={{ paddingTop: '10px', paddingBottom: '10px', width: '15%' }}
                          padding="none"
                          onClick={() => this.handleAddressDialogOpen(e.customer.profile, e.customer.address.streetAddress)}
                        >
                          <Typography type="subheading" style={{ textTransform: 'capitalize' }}>
                            {e.customer.address.streetAddress}
                          </Typography>
                          <Typography type="body1">
                            {e.customer ? this.renderAddressSubText(e.customer.address) : ''}
                          </Typography>
                          <div style={{ marginTop: '5px' }} />
                          <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                            {e.route ? (
                              `${e.route.title} `
                            ) : ''}
                          </Typography>
                          <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                            {e.customer ? (
                              `${e.customer.postalCode} `
                            ) : ''}
                          </Typography>

                        </TableCell>

                        <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '10%' }} padding="none">
                          {e.deliveryAssignedTo == 'unassigned' ? (
                            <Typography type="subheading" className="subheading">Unassigned</Typography>
                          ) : (
                              <Typography type="subheading" className="subheading">{this.props.deliveryGuys.find(guy => guy._id == e.deliveryAssignedTo).profile.name.first || ''}</Typography>
                            )}
                        </TableCell>

                        <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '10%' }} padding="none">
                          <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                            {e.title === 'nightBefore' ? 'Evening' : e.title === 'dayOf' ? 'Day' : ''}
                          </Typography>
                          <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                            {moment(e.onDate).format('MMMM D')}
                          </Typography>
                        </TableCell>

                        <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '10%' }} padding="none">
                          <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                            {sumBy(e.meals, 'total')}
                          </Typography>

                          <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>0 sides</Typography>
                        </TableCell>

                        <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '8%' }} padding="none">
                          <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                            {e.customer.coolerBag ? 'Yes' : 'No'}
                          </Typography>
                        </TableCell>

                        <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '14%' }} padding="none">
                          <Typography type="body2" className="body2" style={{ textTransform: 'capitalize' }}>
                            <Chip
                              style={{ color: '#FFF', textTransform: 'capitalize' }}
                              label={status}
                              className={`${statusClass} directions-chip`}
                            />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  },
                  )
                  }

                </TableBody>
              </Table>

            </Paper>
          )}
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

        <Dialog
          fullScreen={false}
          open={this.state.addressDialogOpen}
          onClose={this.handleAddressDialogClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Search address - {this.state.selectedCustomer}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              How do you want to open this link in?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <a target="_blank" onClick={this.handleAddressDialogClose} href={`https://maps.apple.com/?q=${encodeURIComponent(this.state.selectedCustomerAddress)}`} style={{ textDecoration: 'none' }}>
              <Button color="primary">
                Apple Maps
              </Button>
            </a >

            <a target="_blank" onClick={this.handleAddressDialogClose} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.state.selectedCustomerAddress)}`} style={{ textDecoration: 'none' }}>
              <Button color="primary">
                Google Maps
              </Button>
            </a>
          </DialogActions>
        </Dialog>

        <Dialog
          fullScreen={false}
          open={this.state.openMassNotifyDialog}
          onClose={() => this.setState({})}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Mass notify deliveries</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.state.selectedCheckboxesNumber} deliver{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'} selected
            </DialogContentText>
            <List style={{ marginTop: "1em" }}>
              <ListItem style={{ cursor: 'pointer' }} className="status--in-transit" button onClick={() => this.handleStatusChange('In-Transit', null, true)}>
                <span className="status-circle" /><ListItemText primary="In-Transit" />
              </ListItem>
              <Divider />
              <ListItem style={{ cursor: 'pointer' }} className="status--delayed" button onClick={() => this.handleStatusChange('Delayed', null, true)}>
                <span className="status-circle" /><ListItemText primary="Delayed" />
              </ListItem>
              <Divider />
              <ListItem style={{ cursor: 'pointer' }} className="status--not-delivered" button onClick={() => this.handleStatusChange('Not delivered', null, true)}>
                <span className="status-circle" /><ListItemText primary="Not delivered" />
              </ListItem>
              <Divider />
              <ListItem style={{ cursor: 'pointer' }} className="status--delivered" button onClick={() => this.handleStatusChange('Delivered', null, true)}>
                <span className="status-circle" /><ListItemText primary="Delivered" />
              </ListItem>
              <Divider />
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openMassNotifyDialog: false })} color="default">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          fullScreen={false}
          open={this.state.openAssignDialog}
          onClose={() => this.setState({ openAssignDialog: true })}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Assign selected delivery</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.state.selectedCheckboxesNumber} deliver{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'} selected
            </DialogContentText>
            <List style={{ marginTop: '1em' }}>
              <ListItem style={{ cursor: 'pointer' }} button key="2137" onClick={() => this.handleDeliveryAssign('unassigned')} >
                <ListItemText primary={'Unassigned'} />
              </ListItem>
              <Divider />
              {!this.props.loading && this.props.deliveryGuys.map((e, index) => (
                <React.Fragment>
                  <ListItem style={{ cursor: 'pointer' }} key={e._id} button onClick={() => this.handleDeliveryAssign(e._id)}>
                    <ListItemText primary={e.profile.name.first} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openAssignDialog: false })} color="default">
              Close
            </Button>
          </DialogActions>
        </Dialog>


        <Dialog
          fullScreen={false}
          open={this.state.noteDialogOpen}
          onClose={this.handleNoteDialogClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Delivery Notes for {this.state.selectedCustomer}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.state.selectedCustomerNote}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleNoteDialogClose} color="default">
              Close
            </Button>
          </DialogActions>

        </Dialog>
      </div >
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
