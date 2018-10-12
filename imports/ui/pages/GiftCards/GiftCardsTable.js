import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
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

import Chip from 'material-ui/Chip';

import $ from 'jquery';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import moment from 'moment';
import Loading from '../../components/Loading/Loading';

import './GiftCardsTable.scss';

class GiftCardsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    };
  }

  rowSelected(e, event, checked) {
    const selectedRowId = event.target.parentNode.parentNode.getAttribute('id');
    $(`.${selectedRowId}`).toggleClass('row-selected');
    let currentlySelectedCheckboxes;

    const clonedSelectedCheckboxes = this.state.selectedCheckboxes ? this.state.selectedCheckboxes.slice() : [];

    if ($(event.target).prop('checked')) {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber + 1;
      clonedSelectedCheckboxes.push(e._id);
    } else {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber - 1;
      clonedSelectedCheckboxes.splice(clonedSelectedCheckboxes.indexOf(e._id), 1);
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

  deleteSelectedRows() {
    localStorage.setItem('GiftCardsTableDeleted', this.state.selectedCheckboxesNumber);

    const discountIds = this.state.selectedCheckboxes;

    Meteor.call('giftcards.batchRemove', discountIds, (error) => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('GiftCardsTableDeleted')} gift cards deleted.`,
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
        <p style={{ padding: '25px' }} className="subheading">No gift card found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo;</p>
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

  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  renderDiscountValue(e) {
    return `${e.discountType == 'Fixed amount' ? '$' : ''}${e.discountValue}${e.discountType == 'Percentage' ? '%' : ''}`;
  }


  render() {
    return (
      <div>
        <Paper elevation={2} className="table-container table-discounts">
          {this.state.selectedCheckboxes.length > 0 ? (
            <div className="table-container--delete-rows-container">
              <Typography style={{ color: '#fff' }} className="subheading" type="subheading">
                {this.state.selectedCheckboxesNumber} gift card{this.state.selectedCheckboxes.length > 1 ? ('s') : ''} selected
              </Typography>
              <Button style={{ color: '#FFF' }} onClick={this.deleteDialogHandleClickOpen.bind(this)}>Delete</Button>
            </div>
          )
            : ''

          }
          <Table className="table-container" style={{ tableLayout: 'fixed' }}>
            {this.props.count > 0 ?
              (<TableHead>
                <TableRow>
                  <TableCell padding="checkbox" style={{ width: '7%' }}>
                    <Checkbox onChange={this.selectAllRows.bind(this)} />
                  </TableCell>
                  <TableCell padding="none" style={{ width: '42%' }} onClick={() => this.props.sortByOptions('title')}>
                    <Typography className="body2" type="body2">Code</Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '17%' }}>
                    <Typography className="body2" type="body2">Status</Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '17%' }}>
                    <Typography className="body2" type="body2">Start</Typography>
                  </TableCell>


                  <TableCell padding="none" style={{ width: '17%' }}>
                    <Typography className="body2" type="body2">End</Typography>
                  </TableCell>

                </TableRow>
              </TableHead>)
              : ''
            }
            <TableBody>

              {this.props.results.map((e, i) => {
                const isSelected = this.isCheckboxSelected(e._id);

                return (
                  <TableRow hover className={e._id} key={e._id}>
                    <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '7%' }} padding="checkbox">
                      <Checkbox
                        className="row-checkbox"
                        id={e._id}
                        checked={isSelected}
                        onChange={this.rowSelected.bind(this, e)}
                      />
                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '42%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/gift-cards/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        {e.title}
                      </Typography>
                      <Typography type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {this.renderDiscountValue(e)} off {e.appliesToType == 'whole' ? 'whole order' : e.appliesToType == 'lifestyle' && e.appliesToValue == 'All' ? `${e.appliesToValue} lifestyles` : e.appliesToType == 'lifestyle' ? e.appliesToValue : ''}
                      </Typography>

                      {e.appliesToRestrictionsAndExtras ? (
                        <Typography type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                          Applies to restrictions and extras
                        </Typography>) : ''}


                      {e.minimumRequirementType != 'none' ? (
                        <Typography type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                          Minimum {e.minimumRequirementType == 'purchaseAmount' ? `amount of $${e.minimumRequirementValue}` : e.minimumRequirementType == 'minQuantity' ? `quantity of ${e.minimumRequirementValue}` : ''}
                        </Typography>) : ''}
                    </TableCell>


                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '17%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/gift-cards/${e._id}/edit`)}
                    >
                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        <Chip label={e.status} className={e.status == 'active' ? 'status status--delivered' :
                          e.status == 'scheduled' ? 'status status--in-transit' :
                            e.status == "expired" ? 'status status--not-delivered' : ''} />
                      </Typography>
                    </TableCell>


                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '17%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/gift-cards/${e._id}/edit`)}
                    >
                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        {moment(e.startDate).format('YYYY-MM-DD')}
                      </Typography>
                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '17%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/gift-cards/${e._id}/edit`)}
                    >
                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        {e.endDate ? moment(e.endDate).format('YYYY-MM-DD') : '-'}
                      </Typography>
                    </TableCell>

                  </TableRow>
                );
              },
              )
              }

              {this.renderNoResults(this.props.count)}

            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>
                  <Typography className="body2 font-medium" type="body2" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                    {this.props.count} of {this.props.lifestyleCount} gift cards
                  </Typography>
                </TableCell>
                <TableCell />
                {
                  this.props.hasMore ?
                    <TableCell style={{ display: 'flex', height: '56px', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button onClick={this.props.loadMore}>Load More</Button>
                    </TableCell> : ''
                }
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
        <Dialog open={this.state.deleteDialogOpen} onClose={this.deleteDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Delete {this.state.selectedCheckboxesNumber} discount{this.state.selectedCheckboxes.length > 1 ? 's' : ''}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading"> Are you sure you want to delete {this.state.selectedCheckboxesNumber} gift cards?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.deleteDialogHandleRequestClose.bind(this)} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.deleteSelectedRows.bind(this)} color="accent">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

GiftCardsTable.propTypes = {
  // results: PropType.isRequired,
  history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  lifestyleCount: PropTypes.number.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};


export default withTracker(() => {
  const lifestyleCountSub = Meteor.subscribe('giftcards-all-count');

  return {
    // ingredientTypes: IngredientsWithTypes.find().fetch(),
    lifestyleCount: Counts.get('giftcards-count'),
  };
})(GiftCardsTable);
