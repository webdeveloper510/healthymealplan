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

class LifestylesTable extends React.Component {
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

    localStorage.setItem('LifestylesTableDeleted', this.state.selectedCheckboxesNumber);

    const lifestyleIds = this.state.selectedCheckboxes;

    Meteor.call('lifestyles.batchRemove', lifestyleIds, (error) => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('LifestylesTableDeleted')} lifestyles deleted.`,
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
        <p style={{ padding: '25px' }} className="subheading">No lifestyle found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo;</p>
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

  renderExtraAthletic(e) {
    if (e.extraAthletic) {
      return `${e.discountOrExtraTypeAthletic == 'Fixed amount' ? '$' : ''}${e.extraAthletic}${e.discountOrExtraTypeAthletic == 'Percentage' ? '%' : ''}`;
    }
    return <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>N/A</Typography>;
  }

  renderDiscountStudent(e) {
    if (e.discountStudent) {
      return `${e.discountOrExtraTypeStudent == 'Fixed amount' ? '$' : ''}${e.discountStudent}${e.discountOrExtraTypeStudent == 'Percentage' ? '%' : ''}`;
    }
    return <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>N/A</Typography>;
  }

  renderDiscountSenior(e) {
    if (e.discountSenior) {
      return `${e.discountOrExtraTypeSenior == 'Fixed amount' ? '$' : ''}${e.discountSenior}${e.discountOrExtraTypeSenior == 'Percentage' ? '%' : ''}`;
    }
    return <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>N/A</Typography>;
  }


  render() {
    return (
      <div>
        <Paper elevation={2} className="table-container">
          {this.state.selectedCheckboxes.length > 0 ? (
            <div className="table-container--delete-rows-container">
              <Typography style={{ color: '#fff' }} className="subheading" type="subheading">
                {this.state.selectedCheckboxesNumber} lifestyle{this.state.selectedCheckboxes.length > 1 ? ('s') : ''} selected
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
                  <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.sortByOptions('SKU')}>
                    <Typography className="body2" type="body2">SKU</Typography>
                  </TableCell>
                  <TableCell padding="none" style={{ width: '22%' }} onClick={() => this.props.sortByOptions('title')}>
                    <Typography className="body2" type="body2">Lifestyle</Typography>
                  </TableCell>
                  <TableCell padding="none" style={{ width: '9%' }}>
                    <Typography className="body2" type="body2">Breakfast</Typography>
                  </TableCell>
                  <TableCell padding="none" style={{ width: '9%' }}>
                    <Typography className="body2" type="body2">Lunch</Typography>
                  </TableCell>
                  <TableCell padding="none" style={{ width: '9%' }}>
                    <Typography className="body2" type="body2">Dinner</Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '9%' }}>
                    <Typography className="body2" type="body2">Athletic</Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '9%' }}>
                    <Typography className="body2" type="body2">Student</Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '9%' }}>
                    <Typography className="body2" type="body2">Senior</Typography>
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

                    <TableCell padding="none" style={{ width: '8%' }} onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}>
                      <Typography className="subheading" type="subheading">{e.SKU ? e.SKU : ''}</Typography>
                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '22%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        {e.title}
                      </Typography>
                      <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {e.joinedRestrictions ?
                          (
                            e.joinedRestrictions.length > 1 ? (
                              `${e.joinedRestrictions.length} restrictions`
                            ) : (`${e.joinedRestrictions.length} restriction`)
                          )

                          : ''}
                      </Typography>

                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '9%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        ${e.prices.breakfast[0]}
                        <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                          Individual
                          </Typography>
                      </Typography>


                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '9%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        ${e.prices.lunch[0]}
                        <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                          Individual
                          </Typography>
                      </Typography>


                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '9%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                        ${e.prices.dinner[0]}
                        <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                          Individual
                          </Typography>
                      </Typography>


                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '9%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>

                        {this.renderExtraAthletic(e)}

                        {e.extraAthletic ?

                          <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>Extra</Typography>
                          : ''
                        }

                      </Typography>

                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '9%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>

                        {this.renderDiscountStudent(e)}

                        {e.discountStudent ?

                          <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>Discount</Typography>
                          : ''
                        }

                      </Typography>


                    </TableCell>

                    <TableCell
                      style={{ paddingTop: '10px', paddingBottom: '10px', width: '9%' }}
                      padding="none"
                      onClick={() => this.props.history.push(`/lifestyles/${e._id}/edit`)}
                    >

                      <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>

                        {this.renderDiscountSenior(e)}

                        {e.discountSenior ?

                          <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>Discount</Typography>
                          : ''
                        }

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
                    {this.props.count} of {this.props.lifestyleCount} lifestyles
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
            Delete {this.state.selectedCheckboxesNumber} lifestyle{this.state.selectedCheckboxes.length > 1 ? 's' : ''}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading"> Are you sure you want to delete {this.state.selectedCheckboxesNumber} lifestyles?</DialogContentText>
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

LifestylesTable.propTypes = {
  // results: PropType.isRequired,
  history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  lifestyleCount: PropTypes.number.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};


export default createContainer(() => {
  const lifestyleCountSub = Meteor.subscribe('lifestyles-all-count');

  return {
    // ingredientTypes: IngredientsWithTypes.find().fetch(),
    lifestyleCount: Counts.get('lifestyles-count'),
  };
}, LifestylesTable);
