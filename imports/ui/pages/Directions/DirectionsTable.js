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

import moment from 'moment';

import sumBy from 'lodash/sumBy';
import groupBy from 'lodash/groupBy';
import jsPDF from 'jspdf';

import vittlebase64 from '../../../modules/vittlelogobase64';
import hmpbase64 from '../../../modules/hmplogobase64';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Loading from '../../components/Loading/Loading';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';

import './DirectionsTable.scss';

function renderDeliveryLabelData(doc, delivery, formalType, multiple = false, multipleCurrent = 0, multipleTotal = 0) {
  doc.addPage();

  // doc.addImage(vittlebase64, 'PNG', 1.78, 0.15, 0.4, 0.4);
  doc.addImage(hmpbase64, 'JPEG', 1.18, 0.15, 1.6, 0.19);

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


  doc.text(route === 'Downtown' ? 'DT' : route.slice(0, 1), 0.25, 2.75);

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

      aggregateData: null,
      aggregateDataLoading: true,

      currentTabValue: "all",

      searchBy: '',
    };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.checkInDeliveries = this.checkInDeliveries.bind(this);

    this.handleAddressDialogOpen = this.handleAddressDialogOpen.bind(this);
    this.handleAddressDialogClose = this.handleAddressDialogClose.bind(this);


    this.handleNoteDialogOpen = this.handleNoteDialogOpen.bind(this);
    this.handleNoteDialogClose = this.handleNoteDialogClose.bind(this);
  }

  componentDidMount() {
    Meteor.call('getDeliveryAggregatedData', this.props.currentSelectorDate, (err, res) => {
      this.setState({
        aggregateData: res,
      }, () => {
        this.setState({ aggregateDataLoading: false });
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
        aggregateDataLoading: true,
      }, () => {
        Meteor.call('getDeliveryAggregatedData', this.props.currentSelectorDate, (err, res) => {
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

  handleBatchStatusChange() {
    localStorage.setItem('deliveryUpdated', this.state.selectedCheckboxesNumber);

    const categoryIds = this.state.selectedCheckboxes;

    const deliveries = this.state.aggregateData.deliveries.filter(el => this.state.selectedCheckboxes.indexOf(el._id) >= 0);


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

    const deliveries = this.state.aggregateData.deliveries.filter(e => e.onDate == currentDate && e.title == type);

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


          if (mealTotal > 3) {

            const perBag = 3;
            const totalBags = Math.ceil(mealTotal / perBag);

            for (let index = 1; index <= totalBags; index++) {

              renderDeliveryLabelData(doc, e, formalType, multiple = true, index, totalBags)

            }


          } else {

            renderDeliveryLabelData(doc, e, formalType, multiple = false)

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
    this.setState({ currentTabValue: value });
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
    if (this.state.aggregateDataLoading) {
      return (<Loading />);
    }

    return (
      <div>

        <AppBar position="static" className="appbar--no-background appbar--no-shadow" style={{ margin: "25px 0" }}>
          <Tabs indicatorColor="#000" value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
            <Tab label="All" value="all" />
            {this.props.routes && this.props.routes.map((e, i) => (
              <Tab key={i} label={e.title} value={e._id} />
            ))}
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
              onKeyUp={(e) => {this.setState({ searchBy: e.target.value })}}
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
                display: (this.state.searchBy.length > 0) ? 'block' : 'none',
              }}
            />

          </div>
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
          <Table className="table-container" style={{ marginTop: '10px', tableLayout: 'fixed' }}>

            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" style={{ width: '8%' }}>
                  <Checkbox onChange={this.selectAllRows.bind(this)} />
                </TableCell>
                <TableCell padding="none" style={{ width: '22%' }} onClick={() => this.props.sortByOptions('SKU')}>
                  <Typography className="body2" type="body2">Customer</Typography>
                </TableCell>

                <TableCell padding="none" style={{ width: '25%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Address</Typography>
                </TableCell>
                <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Route</Typography>
                </TableCell>
                <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Delivery</Typography>
                </TableCell>
                <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Meals</Typography>
                </TableCell>
                <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Cooler bag</Typography>
                </TableCell>
                <TableCell padding="none" style={{ width: '13%' }} onClick={() => this.props.sortByOptions('title')}>
                  <Typography className="body2" type="body2">Status</Typography>
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {!this.state.aggregateDataLoading && this.state.aggregateData.deliveries.filter(el => {
                
                if(this.state.currentTabValue != 'all' && el.routeId != this.state.currentTabValue){
                  return false;
                }else{
                  return true;
                }

              }).filter(el => {

                const fullName = el.customer.profile.name.first + " " + el.customer.profile.name.last;

                const like = new RegExp(this.state.searchBy, "gi");

                console.log(like)

                if(this.state.searchBy != "" && !like.test(fullName)){
                  
                  return false;

                }else{
                  return true;
                }

              }).map((e, i) => {
                const inDeliveries = this.checkInDeliveries(e);
                const rowId = inDeliveries != undefined ? inDeliveries._id : e._id;
                const status = inDeliveries != undefined ? inDeliveries.status : 'Scheduled';
                const isSelected = this.isCheckboxSelected(rowId);
                const statusClass = this.getStatusClass(status);

                return (
                  <TableRow hover className={`${rowId} ${statusClass} `} key={rowId}>
                    <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '8%' }} padding="checkbox">
                      <Checkbox
                        className="row-checkbox"
                        id={rowId}
                        checked={isSelected}
                        onChange={this.rowSelected.bind(this, rowId)}
                      />
                    </TableCell>

                    <TableCell padding="none" style={{ width: '22%' }} >
                      <Typography className="subheading" type="subheading" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="status-circle" />{' '}

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
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '25%' }}
                      padding="none"
                      onClick={() => this.handleAddressDialogOpen(e.customer.profile, e.customer.address.streetAddress)}
                    >
                      <Typography type="subheading" style={{ textTransform: 'capitalize' }}>
                        {e.customer.address.streetAddress}
                      </Typography>
                      <Typography type="body1">
                        {e.customer ? this.renderAddressSubText(e.customer.address) : ''}
                      </Typography>


                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '8%' }}
                      padding="none"
                    >

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

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '8%' }}
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
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '8%' }}
                      padding="none"
                    >

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


                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '13%' }}
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

              {/* {this.renderNoResults(this.props.count)} */}

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
          </DialogActions >
        </Dialog >

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
