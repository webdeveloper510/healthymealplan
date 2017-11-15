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
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';


import { createContainer } from 'meteor/react-meteor-data';
import MealsCollection from '../../../api/Meals/Meals';
import Loading from '../../components/Loading/Loading';

class MealsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxesSelected: false,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    };
  }

  rowSelected(e, event, checked) {
    // console.log(e);
    console.log(checked);
    // console.log($(event.target).prop('checked'));
    console.log(event.target.parentNode.parentNode);


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
    console.log(event.target);

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
    localStorage.setItem('mealTableDeleted', this.state.selectedCheckboxesNumber);

    const mealIds = this.state.selectedCheckboxes;

    console.log(mealIds);

    Meteor.call('meals.batchRemove', mealIds, (error) => {
      console.log('inside method');
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('mealTableDeleted')} meal deleted.`,
        });
      }
    });

    this.setState({
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    });

    // $('.row-selected').toggleClass('row-selected');
  }

  renderNoResults(count) {
    if (count == 0) {
      return (
        <p style={{ padding: '25px' }} className="subheading">No meal found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo;</p>
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

  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  render() {
    console.log('meals table');
    console.log(this.props.results);

    return (
      <div>
        <Paper elevation={2} className="table-container">
          {
            this.state.selectedCheckboxes.length > 0 ? (
              <div className="table-container--delete-rows-container">
                <Typography style={{ color: '#fff' }} className="subheading" type="subheading">
                  {this.state.selectedCheckboxesNumber} meal{this.state.selectedCheckboxes.length > 1 ? ('s') : ''} selected
                </Typography>
                <Button style={{ color: '#FFF' }} onClick={this.deleteDialogHandleClickOpen.bind(this)}>Delete</Button>
              </div>
            )
              : ''
          }

          <Table style={{ tableLayout: 'fixed' }}>
            {this.props.count > 0 ?
              (<TableHead>
                <TableRow>

                  <TableCell padding="checkbox" style={{ width: '12%' }}><Checkbox onClick={this.selectAllRows.bind(this)} /></TableCell>
                  <TableCell padding="none" style={{ width: '44%' }} onClick={() => this.props.sortByOptions('SKU')}>
                    <Typography
                      className="body2 table-head-col-hover"
                      type="body2"
                    >SKU
                    </Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '44%' }} onClick={() => this.props.sortByOptions('title')}>

                    <Typography
                      className="body2 table-head-col-hover"
                      type="body2"
                    >
                  Meal</Typography>
                  </TableCell>

                  <TableCell padding="none" style={{ width: '44%' }} onClick={() => this.props.sortByOptions('title')}>

                    <Typography
                      className="body2 table-head-col-hover"
                      type="body2"
                    >Category</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>)
              : ''
            }
            <TableBody>
              {
                this.props.results.map((e, i) => {
                  const isSelected = this.isCheckboxSelected(e._id);

                  return (
                    <TableRow hover className={e._id} key={e._id}>
                      <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '12%' }} padding="checkbox">
                        <Checkbox className="row-checkbox" id={e._id} checked={isSelected} onChange={this.rowSelected.bind(this, e)} />
                      </TableCell>
                      <TableCell style={{ width: '44%' }} padding="none" onClick={() => this.props.history.push(`meals/${e._id}/edit`)}>
                        <Typography className="subheading" type="subheading">{e.SKU ? e.SKU : ''}</Typography>
                      </TableCell>

                      <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '44%' }} padding="none" onClick={() => this.props.history.push(`meals/${e._id}/edit`)}>
                        <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>{e.title}</Typography>
                      </TableCell>

                      <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '44%' }} padding="none" onClick={() => this.props.history.push(`meals/${e._id}/edit`)}>
                        <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>{e.type}</Typography>
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
                    {this.props.count} of {this.props.mealsCount} meals
                  </Typography>
                </TableCell>

                <TableCell />
                <TableCell style={{ display: 'flex', height: '56px', alignItems: 'center', justifyContent: 'flex-end' }}>

                  {this.props.hasMore ?
                    <Button onClick={this.props.loadMore}>Load More</Button>
                    : ''}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
        <Dialog open={this.state.deleteDialogOpen} onRequestClose={this.deleteDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
    Delete {this.state.selectedCheckboxesNumber} meal{this.state.selectedCheckboxes.length > 1 ? ('s') : ''}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading"> Are you sure you want to delete {this.state.selectedCheckboxesNumber} meal{this.state.selectedCheckboxes.length > 1 ? ('s') : ''}?</DialogContentText>
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

MealsTable.propTypes = {
  results: PropTypes.isRequired,
  history: PropTypes.func.isRequired,
  sortByOptions: PropTypes.func.isRequired,
};


export default createContainer(() => {
  const mealsCountSub = Meteor.subscribe('meals-all-count');

  return {
    mealsCount: Counts.get('meals-count'),
  };
}, MealsTable);
