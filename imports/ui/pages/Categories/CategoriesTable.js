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

// import DeleteIcon from 'material-ui-icons/Delete';
// import Tooltip from 'material-ui/Tooltip';
// import IconButton from 'material-ui/IconButton';


import { createContainer } from 'meteor/react-meteor-data';
// import IngredientsCollection from '../../../api/Ingredients/Ingredients';
import Loading from '../../components/Loading/Loading';

class CategoriesTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    };
  }

  // renderSubIngredientsNumber(subIngredient) {
  //   if (subIngredient && subIngredient.length > 1) {
  //     return `${subIngredient.length} sub-ingredients`;
  //   } else if (subIngredient && subIngredient.length == 1) {
  //     return `${subIngredient.length} sub-ingredient`;
  //   }

  //   return '';
  // }

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
    console.log('Delete selected rows');

    localStorage.setItem('categoriesTableDeleted', this.state.selectedCheckboxesNumber);

    const categoryIds = this.state.selectedCheckboxes;

    console.log(categoryIds);

    Meteor.call('categories.batchRemove', categoryIds, (error) => {
      console.log('inside method');
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('categoriesTableDeleted')} categories deleted.`,
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
        <p style={{ padding: '25px' }} className="subheading">No category found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo;</p>
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

  // renderDeleteDialog() {
  //   return (
  //   );
  // }

  render() {
    return (
      <div>
        <Paper elevation={2} className="table-container">
          {this.state.selectedCheckboxes.length > 0 ? (
            <div className="table-container--delete-rows-container">
              <Typography style={{ color: '#fff' }} className="subheading" type="subheading">
                {this.state.selectedCheckboxesNumber} categor{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'} selected
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
                  <TableCell padding="checkbox" style={{ width: '12%' }}>
                    <Checkbox onChange={this.selectAllRows.bind(this)} /></TableCell>
                  <TableCell padding="none" style={{ width: '12%' }} onClick={() => this.props.sortByOptions('SKU')}>
                    <Typography className="body2" type="body2">SKU</Typography></TableCell>
                  <TableCell padding="none" style={{ width: '76%' }} onClick={() => this.props.sortByOptions('title')}>
                    <Typography className="body2" type="body2">Category</Typography></TableCell>

                </TableRow>
              </TableHead>)
              : ''
            }
            <TableBody>

              {/* <CSSTransitionGroup
              transitionName="example"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={300}
            > */}
              {
                this.props.results.map((e, i) => {
                  const isSelected = this.isCheckboxSelected(e._id);

                  return (
                    <TableRow hover className={e._id} key={e._id}>
                      <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '12%' }} padding="checkbox">
                        <Checkbox
                          className="row-checkbox"
                          id={e._id}
                          checked={isSelected}
                          onChange={this.rowSelected.bind(this, e)}
                        />
                      </TableCell>

                      <TableCell padding="none" style={{ width: '12%' }} onClick={() => this.props.history.push(`/categories/${e._id}/edit`)}>
                        <Typography className="subheading" type="subheading">{e.SKU ? e.SKU : ''}</Typography>
                      </TableCell>

                      <TableCell
                        style={{ paddingTop: '10px', paddingBottom: '10px', width: '76%' }}
                        padding="none"
                        onClick={() => this.props.history.push(`/categories/${e._id}/edit`)}
                      >

                        <Typography type="subheading" className="subheading" style={{ textTransform: 'capitalize' }}>
                          {e.title}
                        </Typography>
                        <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                          {e.joinedTypes ?
                            (
                              e.joinedTypes.length > 1 ? (
                                `${e.joinedTypes.length} types`
                              ) : (`${e.joinedTypes.length} type`)
                            )

                            : '-'}
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
                    {this.props.count} of {this.props.categoryCount} categories
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
      Delete {this.state.selectedCheckboxesNumber} categor{this.state.selectedCheckboxes.length > 1 ? ('ies') : 'y'}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading"> Are you sure you want to delete {this.state.selectedCheckboxesNumber} categories?</DialogContentText>
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

CategoriesTable.propTypes = {
  // results: PropType.isRequired,
  history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  categoryCount: PropTypes.number.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};


export default createContainer(() => {
  const categoryCountSub = Meteor.subscribe('categories-all-count');

  return {
    // ingredientTypes: IngredientsWithTypes.find().fetch(),
    categoryCount: Counts.get('categories'),
  };
}, CategoriesTable);
