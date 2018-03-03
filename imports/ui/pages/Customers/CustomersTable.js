import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
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
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';

import Loading from '../../components/Loading/Loading';

class CustomersTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCustomerName: '',
      selectedCustomerId: '',
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    };
  }

  renderType(type) {
    console.log(type);
  }

  rowSelected(e, event, checked) {
    // console.log(e);
    console.log(checked);
    // console.log($(event.target).prop('checked'));
    // console.log(event.target.parentNode.parentNode);

    const selectedRowId = event.target.parentNode.parentNode.getAttribute('id');
    $(`.${selectedRowId}`).toggleClass('row-selected');
    let currentlySelectedCheckboxes;

    const clonedSelectedCheckboxes = this.state.selectedCheckboxes
      ? this.state.selectedCheckboxes.slice()
      : [];

    if ($(event.target).prop('checked')) {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber + 1;
      clonedSelectedCheckboxes.push(e._id);
    } else {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber - 1;
      clonedSelectedCheckboxes.splice(
        clonedSelectedCheckboxes.indexOf(e._id),
        1,
      );
    }

    this.setState({
      selectedCheckboxesNumber: currentlySelectedCheckboxes,
      selectedCheckboxes: clonedSelectedCheckboxes,
    });
  }

  selectAllRows(event) {
    let allCheckboxIds = [];
    console.log(event.target);

    if ($(event.target).prop('checked')) {
      $('.row-checkbox').each((index, el) => {
        // make the row selected
        $(`.${el.getAttribute('id')}`).addClass('row-selected');

        // push the ids to a array
        allCheckboxIds.push(el.getAttribute('id'));

        // set each checkbox checked
        $(el)
          .children()
          .find('input[type="checkbox"]')
          .prop('checked', true);
      });
    } else {
      allCheckboxIds = [];

      $('.row-checkbox').each((index, el) => {
        // // make the row selected
        $(`.${el.getAttribute('id')}`).removeClass('row-selected');

        // set each checkbox checked
        $(el)
          .children()
          .find('input[type="checkbox"]')
          .prop('checked', false);
      });
    }

    this.setState({
      selectedCheckboxesNumber: allCheckboxIds.length,
      selectedCheckboxes: allCheckboxIds,
    });
  }

  deleteSelectedRows() {
    console.log('Delete selected rows');

    localStorage.setItem(
      'LifestylesTableDeleted',
      this.state.selectedCheckboxesNumber,
    );

    const lifestyleIds = this.state.selectedCheckboxes;

    console.log(lifestyleIds);

    Meteor.call('lifestyles.batchRemove', lifestyleIds, (error) => {
      console.log('inside method');
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem(
            'LifestylesTableDeleted',
          )} lifestyles deleted.`,
        });
      }
    });

    this.setState({
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    });

    // this.deleteDialogHandleRe/questClose.bind(this)
    // $('.row-selected').toggleClass('row-selected');
  }

  renderNoResults(count) {
    if (count == 0) {
      return (
        <p style={{ padding: '25px' }} className="subheading">
          No customers found &lsquo;<span className="font-medium">
            {this.props.searchTerm}
          </span>&rsquo;
        </p>
      );
    }
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

  deleteDialogHandleClickOpen(id, name) {
    this.setState({
      deleteDialogOpen: true,
      selectedCustomerName: name,
      selectedCustomerId: id,
    });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  handleDeleteCustomer(customerId) {
    console.log(customerId);

    this.deleteDialogHandleRequestClose();

    Meteor.call('customers.delete', customerId, (err, res) => {
      if (!err) {
        this.props.popTheSnackbar({
          message: `${this.state.selectedCustomerName} successfully removed.`,
        });
      } else {
        console.log(err);
        this.props.popTheSnackbar({
          message: 'There was a problem deleting this user',
        });
      }
    });
  }

  render() {
    console.log(this.props);
    return (
      <div>
        <Paper elevation={2} className="table-container">
          {this.state.selectedCheckboxes.length > 0 ? (
            <div className="table-container--delete-rows-container">
              <Typography
                style={{ color: '#fff' }}
                className="subheading"
                type="subheading"
              >
                {this.state.selectedCheckboxesNumber} lifestyle{this.state
                  .selectedCheckboxes.length > 1
                  ? 's'
                  : ''}{' '}
                selected
              </Typography>
              <Button
                style={{ color: '#FFF' }}
                onClick={this.deleteDialogHandleClickOpen.bind(this)}
              >
                Delete
              </Button>
            </div>
          ) : (
            ''
          )}
          <Table className="table-container" style={{ tableLayout: 'fixed' }}>
            {this.props.count > 0 ? (
              <TableHead>
                <TableRow>

                  <TableCell
                    style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                    onClick={() => this.props.sortByOptions('_id')}
                  >
                    <Typography className="body2" type="body2">
                      ID
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                    onClick={() => this.props.sortByOptions('profile.name.first')}
                  >
                    <Typography className="body2" type="body2">
                      Name
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                    onClick={() => this.props.sortByOptions('SKU')}
                  >
                    <Typography className="body2" type="body2">
                      Plan
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                    onClick={() => this.props.sortByOptions('subscription.status')}
                  >
                    <Typography className="body2" type="body2">
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                  />
                </TableRow>
              </TableHead>
            ) : (
              ''
            )}
            <TableBody>
              {this.props.results.map((e, i) => {
                let name = '';

                if (e.profile && e.profile.name) {
                  name = e.profile.name.first;
                }

                if (e.profile && e.profile.name && e.profile.name.last) {
                  name += ` ${e.profile.name.last}`;
                }


                return (
                  <TableRow hover className={e._id} key={e._id}>

                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                      onClick={() =>
                        this.props.history.push(`/customers/${e._id}/edit`)
                      }
                    >
                      <Typography className="subheading" type="subheading">
                        {e._id}
                      </Typography>
                    </TableCell>

                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                      onClick={() =>
                        this.props.history.push(`/customers/${e._id}/edit`)
                      }
                    >
                      <Typography className="subheading" type="subheading">

                        {name}
                      </Typography>
                      <Typography className="body2" type="body2">
                        {e.associatedProfiles
                          ? `${e.associatedProfiles} profile`
                          : ''}
                        {e.associatedProfiles && e.associatedProfiles > 1
                          ? 's'
                          : ''}
                      </Typography>
                    </TableCell>

                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                      onClick={() =>
                        this.props.history.push(`/customers/${e._id}/edit`)
                      }
                    >
                      <Typography className="subheading" type="subheading">
                        {e.joinedLifestyle ? e.joinedLifestyle.title : ''}
                      </Typography>
                    </TableCell>
                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                      onClick={() =>
                        this.props.history.push(`/customers/${e._id}/edit`)
                      }
                    >
                      <Typography className="subheading" type="subheading">
                        {e.joinedSubscription ? e.joinedSubscription.status.toUpperCase() : ''}
                        {e.joinedSubscription === undefined && e.status === 'abandoned' ? 'Abandoned' : ''}
                      </Typography>
                    </TableCell>

                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '20%' }}
                    >
                      {e.secondary === undefined && (
                        <div>
                          <Button color="secondary" onClick={this.deleteDialogHandleClickOpen.bind(this, e._id, name)}>Delete</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {this.renderNoResults(this.props.count)}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>
                  <Typography
                    className="body2 font-medium"
                    type="body2"
                    style={{ color: 'rgba(0, 0, 0, .54)' }}
                  >
                    {this.props.count} of {this.props.customerCount} customer{this
                      .props.customerCount > 1
                      ? 's'
                      : ''}
                  </Typography>
                </TableCell>
                <TableCell />
                {this.props.hasMore ? (
                  <TableCell
                    style={{
                      display: 'flex',
                      height: '56px',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button onClick={this.props.loadMore}>Load More</Button>
                  </TableCell>
                ) : (
                  ''
                )}
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
        <Dialog
          open={this.state.deleteDialogOpen}
          onClose={this.deleteDialogHandleRequestClose.bind(this)}
        >
          <Typography
            style={{
              flex: '0 0 auto',
              margin: '0',
              padding: '24px 24px 20px 24px',
            }}
            className="title font-medium"
            type="title"
          >
            Delete {this.state.selectedCustomerName}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading">
              Are you sure you want to delete {this.state.selectedCustomerName}?
              This will delete all the secondary profiles associated with this customer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.deleteDialogHandleRequestClose.bind(this)}
              color="default"
            >
              Cancel
            </Button>
            <Button
              stroked
              className="button--bordered button--bordered--accent"
              onClick={this.handleDeleteCustomer.bind(this, this.state.selectedCustomerId)}
              color="accent"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CustomersTable.propTypes = {
  // results: PropType.isRequired,
  history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  customerCount: PropTypes.number.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(() => {
  const customerCountSub = Meteor.subscribe('customers-all-count');

  return {
    customerCount: Counts.get('customers-count'),
  };
}, CustomersTable);
