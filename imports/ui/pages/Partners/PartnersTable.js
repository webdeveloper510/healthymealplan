import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TablePagination,
} from 'material-ui/Table';
import Dialog, {
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Chip from 'material-ui/Chip';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/Menu';

import IconButton from 'material-ui/IconButton';
import MoreVert from 'material-ui-icons/MoreVert';
import FirstPage from 'material-ui-icons/FirstPage';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import LastPage from 'material-ui-icons/LastPage';

import $ from 'jquery';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import Loading from '../../components/Loading/Loading';
import './PartnersTable.scss';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';

class PartnersTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCustomerName: '',
      selectedCustomerId: '',
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,

      anchorEl: false,
    };

    autoBind(this);
  }

  rowSelected(e, event, checked) {
    // console.log(e);
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
    localStorage.setItem(
      'LifestylesTableDeleted',
      this.state.selectedCheckboxesNumber,
    );

    const lifestyleIds = this.state.selectedCheckboxes;

    Meteor.call('lifestyles.batchRemove', lifestyleIds, (error) => {
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
  }

  renderNoResults(count) {
    if (count == 0) {
      return (
        <p style={{ padding: '25px' }} className="subheading">
          No partners found &lsquo;<span className="font-medium">
            {this.props.searchTerm}
          </span>&rsquo;
        </p>
      );
    }
  }

  isCheckboxSelected(id) {
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

  handleClick(event, id) {
    this.setState({ [id]: true });
  }

  handleClose(event, id) {
    this.setState({ [id]: false });
  }

  handleDeleteCustomer(customerId) {
    this.deleteDialogHandleRequestClose();

    Meteor.call('partners.delete', customerId, (err, res) => {
      if (!err) {
        this.props.popTheSnackbar({
          message: `${this.state.selectedCustomerName} successfully removed.`,
        });
      } else {
        this.props.popTheSnackbar({
          message: 'There was a problem deleting this user',
        });
      }
    });
  }

  handleChangePage(event, page) {
    const config = this.props.tableConfig.get();
    const configCopy = cloneDeep(config);

    configCopy.pageProperties.currentPage = page + 1;

    this.props.tableConfig.set(configCopy);

    this.props.getCustomers()
  }

  renderPartnerDiscount(user) {

    const discount =  this.props.discounts.find(e => e._id === user.partnerDiscountId);
    console.log(discount);

    return discount.title;

  }

  render() {
    if (this.props.results == undefined) {
      return <Loading />;
    }
    return (
      <div>
        <Paper elevation={2} className="table-container">
          <Table className="table-container" style={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>

                <TableCell
                  style={{ cursor: 'pointer', paddingTop: '10px', paddingBottom: '10px', width: '33.33%' }}
                  onClick={() => this.props.sortByOptions('profile.name.first')}
                >
                  <Typography className="body2" type="body2">
                    Name
                  </Typography>
                </TableCell>

                <TableCell
                  style={{ cursor: 'pointer', paddingTop: '10px', paddingBottom: '10px', width: '21%' }}
                  onClick={() => this.props.sortByOptions('joinedLifestyle.title')}
                >
                  <Typography className="body2" type="body2">
                    Credit amount
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ cursor: 'pointer', paddingTop: '10px', paddingBottom: '10px', width: '22%' }}
                  onClick={() => this.props.sortByOptions('joinedSubscription.paymentMethod')}
                >
                  <Typography className="body2" type="body2">
                    Referral credits
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ cursor: 'pointer', paddingTop: '10px', paddingBottom: '10px', width: '22.5%' }}
                  onClick={() => this.props.sortByOptions('joinedSubscription.status')}
                >
                  <Typography className="body2" type="body2">
                    Discount
                  </Typography>
                </TableCell>

                <TableCell
                  style={{ paddingTop: '10px', paddingBottom: '10px', width: '12.5%' }}
                />
              </TableRow>
            </TableHead>

            <TableBody>
              {this.props.results != undefined && this.props.results.map((e, i) => {
                let name = '';

                if (e.profile && e.profile.name) {
                  name = e.profile.name.first;
                }

                if (e.profile && e.profile.name && e.profile.name.last) {
                  name += ` ${e.profile.name.last}`;
                }

                return (
                  <TableRow hover className={`${e._id}`} key={e._id}>

                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '38.88%' }}
                      onClick={() => this.props.history.push(`/partners/${e._id}/edit`)}
                    >
                      <Typography type="subheading">
                        {/* <span className="status-circle" /> */}
                        {e.businessName}
                      </Typography>
                      <Typography type="body2">
                          {name}
                      </Typography>
                    </TableCell>

                    <TableCell

                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '21%' }}
                      onClick={() => this.props.history.push(`/partners/${e._id}/edit`)}
                    >
                      <Typography type="subheading">
                        {e.partnerCreditType === "Percentage" ? `${e.partnerCreditValue}%` : `$${e.partnerCreditValue}`}
                      </Typography>
                    </TableCell>

                    <TableCell

                        style={{ paddingTop: '10px', paddingBottom: '10px', width: '21%' }}
                        onClick={() => this.props.history.push(`/partners/${e._id}/edit`)}
                    >
                        <Typography type="subheading">
                            {e.joinedSubscription ? `$${e.joinedSubscription.referralCredits}` : ''}
                        </Typography>
                    </TableCell>

                    <TableCell

                        style={{ paddingTop: '10px', paddingBottom: '10px', width: '21%' }}
                        onClick={() => this.props.history.push(`/partners/${e._id}/edit`)}
                    >
                        <Typography type="subheading">
                            {!this.props.loading && this.props.discounts ? this.renderPartnerDiscount(e) || '' : ''}
                        </Typography>
                    </TableCell>


                    <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '12.5%' }}>
                      {e.secondary == undefined ? (
                        <div>
                          <IconButton
                            onClick={ev => this.handleClick(ev, e._id)}
                          >
                            <MoreVert />
                          </IconButton>
                        </div>
                      )
                        : ''}
                    </TableCell>

                    <Dialog open={this.state[e._id] == undefined ? false : this.state[e._id]} onClose={ev => this.handleClose(ev, e._id)}>
                      <DialogTitle id="simple-dialog-title">{`Actions for ${name}`}</DialogTitle>
                      <div>
                        <List>
                          <ListItem button onClick={this.deleteDialogHandleClickOpen.bind(this, e._id, name)}>
                            <ListItemText primary="Delete" />
                          </ListItem>
                        </List>
                      </div>
                    </Dialog>

                  </TableRow>

                );
              })}

              {this.props.results != undefined && (
                this.renderNoResults(this.props.results.length)
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={5}
                  count={this.props.tableConfig.get().pageProperties.recordCount}
                  rowsPerPageOptions={[]}
                  rowsPerPage={50}
                  page={this.props.tableConfig.get().pageProperties.currentPage == 1 ? 0
                    : this.props.tableConfig.get().pageProperties.currentPage - 1
                  }
                  backIconButtonProps={{ 'aria-label': 'Previous Page', }}
                  nextIconButtonProps={{ 'aria-label': 'Next Page', }}
                  onChangePage={this.handleChangePage}
                />
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
      </div >
    );
  }
}

PartnersTable.propTypes = {
  // results: PropType.isRequired,
  history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  customerCount: PropTypes.number.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default PartnersTable;
