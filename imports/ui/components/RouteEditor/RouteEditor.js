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
import { FormGroup, FormControlLabel, FormControl } from 'material-ui/Form';
import Radio, { RadioGroup } from 'material-ui/Radio';

import Checkbox from 'material-ui/Checkbox';

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

$.validator.addMethod(
  'cdnPostalStart',
  function (postal, element) {
    return this.optional(element) || postal.match(/[a-zA-Z][0-9][a-zA-Z]/);
  },
  'Please specify a valid postal code.',
);

class RouteEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteDialogOpen: false,
      hasFormChanged: false,
      title: '',
    };
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent(),
        );
      },

      rules: {
        title: {
          required: true,
        },

        // city: {
        //   requred: true,
        // },
      },

      submitHandler() {
        component.handleSubmit();
      },
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

    const existingRoute = route && route._id;

    localStorage.setItem('routeDeleted', route.title);

    const routeDeletedMessage = `${localStorage.getItem(
      'routeDeleted',
    )} deleted from routes.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('routes.remove', existingRoute, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: mealDeletedMessage,
        });

        history.push('/routes');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    // console.log('Reached handle submti');
    const { history, popTheSnackbar } = this.props;
    const existingRoute = this.props.route && this.props.route._id;
    const methodToCall = existingRoute ? 'routes.update' : 'routes.insert';

    const route = {
      title: document.querySelector('#title').value.trim(),
      city: this.state.city,
      routeActual: this.state.routeActual,
      limited: this.state.limitedChecked,
    };

    localStorage.setItem(
      'route',
      existingRoute ? this.props.route.title : route.title,
    );

    if (this.state.extraSelected) {
      route.extraSurcharge = parseFloat(this.state.extraAmount);
      route.extraSurchargeType = this.state.extraType;
    }

    if (existingRoute) {
      route._id = existingRoute;

      if (this.state.valueExtraSurcharge == 'none') {
        delete route.extraSurcharge;
        delete route.extraSurchargeType;
      }
    }

    console.log(route);

    Meteor.call(methodToCall, route, (error, routeId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        const confirmation = existingRoute
          ? `${localStorage.getItem('route')} route updated`
          : `${localStorage.getItem('route')} route added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/routes/${routeId}/edit`,
        });

        history.push('/routes');
      }
    });
  }

  titleFieldChanged(e) {
    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged,
    });
  }

  handleCityChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      city: event.target.value,
      hasFormChanged: true,
    });
  }

  handleRouteChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      routeActual: event.target.value,
      hasFormChanged: true,
    });
  }

  handleExtraTypeChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      extraType: event.target.value,
    });
  }

  handleExtraValueChange(event, value) {
    this.setState({
      extraAmount: event.target.value,
      hasFormChanged: true,
    });
  }

  handleExtraRadioChange(event, value) {
    let extraSelected = true;

    if (value == 'none') {
      extraSelected = false;
    }

    this.setState({
      extraSelected,
      valueExtraSurcharge: value,
      hasFormChanged: true,
    });
  }

  render() {
    const { route, history } = this.props;
    return (
      <form
        style={{ width: '100%' }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container>
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push('/routes')}
              className="button button-secondary button-secondary--top"
            >
              <Typography
                type="subheading"
                className="subheading font-medium"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  fontWeight: 'medium',
                }}
              >
                <ChevronLeft style={{ marginRight: '4px' }} /> Routes
              </Typography>
            </Button>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={6}>
            <Typography type="headline" className="headline font-medium">
              Add route
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                style={{ marginRight: '10px' }}
                onClick={() => history.push('/routes')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                raised
                disabled={!this.state.hasFormChanged}
                className="btn btn-primary"
                color="contrast"
              >
                Save
              </Button>
            </div>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              Route name
            </Typography>
            {/* <Typography style={{ paddingRight: '80px' }}>
              {'Enter the first three characters of the postal code route.'}
            </Typography> */}
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    id="title"
                    label="Name"
                    margin="normal"
                    name="title"
                    fullWidth
                    onChange={this.titleFieldChanged.bind(this)}
                    defaultValue={route && route.title}
                    ref={title => (this.title = title)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              City
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <TextField
                fullWidth
                id="select-discount-type"
                select
                label="City"
                value={this.state.city ? this.state.city : ''}
                onChange={this.handleCityChange.bind(this)}
                SelectProps={{ native: false }}
              >
                <MenuItem key={1} value="Ottawa">
                  Ottawa
                </MenuItem>
                <MenuItem key={2} value="Gatineau">
                  Gatineau
                </MenuItem>
              </TextField>

              <TextField
                fullWidth
                id="select-discount-type"
                select
                label="Route"
                value={this.state.routeActual ? this.state.routeActual : ''}
                onChange={this.handleRouteChange.bind(this)}
                SelectProps={{ native: false }}
                style={{ marginTop: '20px' }}
              >
                <MenuItem key={1} value="Downtown">
                  Downtown
                </MenuItem>
                <MenuItem key={2} value="East">
                  East
                </MenuItem>
                <MenuItem key={3} value="West">
                  West
                </MenuItem>
              </TextField>
            </Paper>
          </Grid>
        </Grid> */}

        <Grid container justify="center">
          <Grid item xs={6}>
            {route ? (
              <Button
                raised
                onClick={this.handleRemove.bind(this)}
                className="btn btn-danger"
                style={{ backgroundColor: danger, color: '#FFFFFF' }}
                disabled
              >
                Delete
              </Button>
            ) : (
              <Button raised onClick={() => history.push('/routes')}>
                Cancel
              </Button>
            )}
          </Grid>

          <Grid item xs={6}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                type="submit"
                raised
                disabled={!this.state.hasFormChanged}
                className="btn btn-primary"
                color="contrast"
              >
                Save
              </Button>
            </div>
          </Grid>
        </Grid>

        {route ? (
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
              Delete {route ? route.title.toLowerCase() : ''}?
            </Typography>
            <DialogContent>
              <DialogContentText className="subheading">
                Are you sure you want to delete {route.title.toLowerCase()} ?
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
                onClick={this.handleRemoveActual.bind(this)}
                color="accent"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        ) : (
          ''
        )}
      </form>
    );
  }
}

RouteEditor.propTypes = {
  route: PropTypes.object.required,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default RouteEditor;
