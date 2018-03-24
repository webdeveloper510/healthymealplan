import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';

import $ from 'jquery';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';


import { createContainer } from 'meteor/react-meteor-data';
import Loading from '../../components/Loading/Loading';

const styles = {
  card: {
    maxWidth: '33%',
  },
  media: {
    height: '240px',
  },
};

class SidesGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false,
    };
  }

  renderSubIngredientsNumber(subIngredient) {
    if (subIngredient && subIngredient.length > 1) {
      return `${subIngredient.length} sub-ingredients`;
    } else if (subIngredient && subIngredient.length == 1) {
      return `${subIngredient.length} sub-ingredient`;
    }

    return '';
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

    localStorage.setItem('ingredientTableDeleted', this.state.selectedCheckboxesNumber);

    const ingredientIds = this.state.selectedCheckboxes;

    console.log(ingredientIds);

    Meteor.call('ingredients.batchRemove', ingredientIds, (error) => {
      console.log('inside method');
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem('ingredientTableDeleted')} ingredients deleted.`,
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
        <p style={{ padding: '25px' }} className="subheading">No ingredient found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo;</p>
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

    return (
      <div style={{ width: '100%' }}>

        <Grid container style={{ marginTop: '60px' }} spacing={16}>

          {
            this.props.results && this.props.results.map((e, i) =>
              // const isSelected = this.isCheckboxSelected(e._id);

              (
                <Grid item xs={12} sm={6} md={4} lg={4} style={{ minWidth: '320px' }} key={i}>
                  <Card style={{ width: '100%' }}>
                    <CardMedia
                      style={styles.media}
                      image={e.imageUrl ? `${Meteor.settings.public.S3BucketDomain}${e.imageUrl}` : 'https://via.placeholder.com/600x600?text=+'}
                      title="Contemplative Reptile"
                    />
                    <CardContent>
                      <Typography type="body1" className="font-uppercase font-medium" style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(0, 0, 0, .54)' }}>
                        {e.mealType}
                      </Typography>
                      <Typography type="headline" component="h2">
                        {e.title}
                      </Typography>
                      <Typography type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                        {e.subtitle}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button dense color="primary" onClick={() => this.props.history.push(`/sides/${e._id}/edit`)}>Edit</Button>
                    </CardActions>
                  </Card>

                </Grid>


              ),
            )
          }
        </Grid>

        <Typography className="font-medium" type="body2" style={{ marginTop: '25px', color: 'rgba(0, 0, 0, .54)' }}>
          Showing {this.props.count} of {this.props.plateCount} sides
        </Typography>

        {this.props.hasMore ? <Button onClick={this.props.loadMore}>Load More</Button> : ''}

        <Dialog open={this.state.deleteDialogOpen} onClose={this.deleteDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Delete {this.state.selectedCheckboxesNumber} ingredients?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading"> Are you sure you want to delete {this.state.selectedCheckboxesNumber} ingredients?</DialogContentText>
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

SidesGrid.propTypes = {
  // results: PropType.isRequired,
  // history: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  plateCount: PropTypes.number.isRequired,
  // results: PropTypes.isRequired,
};


export default createContainer(() => {
  const plateCountSub = Meteor.subscribe('sides-all-count');

  return {
    plateCount: Counts.get('sides'),
  };
}, SidesGrid);
