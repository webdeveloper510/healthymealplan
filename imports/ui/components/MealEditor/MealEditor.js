/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import $ from 'jquery';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import validate from '../../../modules/validate';
import { teal, red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Paper from 'material-ui/Paper';

const primary = teal[500];
const danger = red[700];


const styles = theme => ({
  icon: {
    margin: theme.spacing.unit,
  },
});


class MealEditor extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      deleteDialogOpen: false,
      hasFormChanged: false,
      mealType: this.props.newMeal ? '' : this.props.meal.type,
    };
  }


  componentDidMount() {
    const component = this;
    validate(component.form, {

      errorPlacement(error, element) {
        error.insertAfter($(element).parent().parent());
      },

      rules: {
        title: {
          required: true,
        },

      },

      submitHandler() { component.handleSubmit(); },
    });
  }

  /* Dialog box controls */
  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, meal } = this.props;

    const existingMeal = meal && meal._id;

    localStorage.setItem('mealDeleted', meal.title);

    const mealDeletedMessage = `${localStorage.getItem('mealDeleted')} deleted from meals.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('meals.remove', existingMeal, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: mealDeletedMessage,
        });

        history.push('/meals');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    // console.log('Reached handle submti');
    const { history, popTheSnackbar } = this.props;
    const existingMeal = this.props.meal && this.props.meal._id;
    const methodToCall = existingMeal ? 'meals.update' : 'meals.insert';

    const meal = {
      title: document.querySelector('#title').value.trim(),
      type: this.state.mealType,
    };

    if (existingMeal) { meal._id = existingMeal; }

    localStorage.setItem('meal', existingMeal ? this.props.meal.title : meal.title);


    Meteor.call(methodToCall, meal, (error, mealId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        const confirmation = existingMeal ? `${localStorage.getItem('meal')} meal updated` : `${localStorage.getItem('meal')} meal added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/meals/${mealId}/edit`,
        });

        history.push('/meals');
      }
    });
  }

  titleFieldChanged(e) {
    console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged,
    });
  }

  handleMealTypeChange() {

  }

  handleMealTypeChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      mealType: event.target.value,
      hasFormChanged: true,
    });
  }

  render() {
    const { meal, history } = this.props;
    return (
      <form style={{ width: '100%' }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>

        <Grid container>
          <Grid item xs={12}>
            <Button onClick={() => this.props.history.push('/meals')} className="button button-secondary button-secondary--top">
              <Typography type="subheading" className="subheading font-medium" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', fontWeight: 'medium' }}>
                <ChevronLeft style={{ marginRight: '4px' }} /> Meals</Typography>
            </Button>
          </Grid>

        </Grid>


        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={6}>
            <Typography type="headline" className="headline font-medium">Add meal</Typography>
          </Grid>

          <Grid item xs={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: '10px' }} onClick={() => history.push('/meals')}>Cancel</Button>
              <Button raised disabled={!this.state.hasFormChanged} className="btn btn-primary" color="contrast">Save</Button>
            </div>
          </Grid>
        </Grid>


        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              Meal
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <TextField
                id="title"
                label="Name"
                margin="normal"
                name="title"
                disabled={!this.props.newMeal}
                fullWidth
                onChange={this.titleFieldChanged.bind(this)}
                defaultValue={meal && meal.title}
                ref={title => (this.title = title)}
              />
            </Paper>
          </Grid>
        </Grid>


        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              Type
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <TextField
                fullWidth
                id="select-discount-type"
                select
                label="Type"
                value={this.state.mealType ? this.state.mealType : ''}
                onChange={this.handleMealTypeChange.bind(this)}
                SelectProps={{ native: false }}
              >
                <MenuItem key={1} value="Main Course">Main</MenuItem>
                <MenuItem key={2} value="Side">Side</MenuItem>
              </TextField>

            </Paper>
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={6}>
            {meal ? (<Button raised onClick={this.handleRemove.bind(this)} className="btn btn-danger" style={{ backgroundColor: danger, color: '#FFFFFF' }} disabled>Delete</Button>)
              : (<Button raised onClick={() => history.push('/meals')}>Cancel</Button>)}
          </Grid>

          <Grid item xs={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button type="submit" raised disabled={!this.state.hasFormChanged} className="btn btn-primary" color="contrast">
                Save
              </Button>
            </div>
          </Grid>
        </Grid>

        {meal ? (<Dialog open={this.state.deleteDialogOpen} onClose={this.deleteDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
          Delete {meal ? meal.title.toLowerCase() : ''}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading">
            Are you sure you want to delete {meal.title.toLowerCase()} ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.deleteDialogHandleRequestClose.bind(this)} color="default">
            Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleRemoveActual.bind(this)} color="accent">
            Delete
            </Button>
          </DialogActions>
        </Dialog>) : ''}

      </form>);
  }
}


MealEditor.propTypes = {
  meal: PropTypes.object.required,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default MealEditor;
