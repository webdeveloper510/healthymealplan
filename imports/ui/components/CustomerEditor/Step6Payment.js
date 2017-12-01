import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import Input from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Geosuggest from 'react-geosuggest';
import './GeoSuggest.scss';

import Checkbox from 'material-ui/Checkbox';
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from 'material-ui/Form';

import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import green from 'material-ui/colors/green';

import $ from 'jquery';
import validate from '../../../modules/validate';

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

class Step6Payment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,
      paymentMethod: '',
      paymentFrequency: '',
      dormName: 'Algonquin College',
      dormResidence: 'Algonquin College',
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
        addressType: {
          required: true,
        },
      },

      submitHandler() {
        component.handleSubmitStep();
      },
    });
  }

  handleSubmitStep() {
    console.log('Reached');

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    Meteor.call(
      'customers.step2',
      {
        id: this.props.customerInfo.id,
        addressType: this.state.addressType,
      },
      (err, returnVal) => {
        if (err) {
          console.log(err);

          // this.props.popTheSnackbar({
          //   message: err.reason,
          // });

          this.setState({
            submitSuccess: false,
            submitLoading: false,
          });
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          console.log('Reached no error');

          this.props.saveValues({});

          this.props.handleNext();
        }
      },
    );
  }

  handleChangeRadioPaymentMethod(event, value) {
    this.setState({
      paymentMethod: value,
    });
  }

  handleChangeRadiopaymentFrequency(event, value) {
    this.setState({
      paymentFrequency: value,
    });
  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return (
      <form
        id="step6"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: '50px', marginTop: '25px' }}
        >
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Payment
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="subheading" className="font-uppercase">
                        Payment Method
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        {/* <FormLabel component="legend">Type</FormLabel> */}
                        <RadioGroup
                          aria-label="payment-method"
                          name="paymentMethod"
                          value={this.state.paymentMethod}
                          onChange={this.handleChangeRadioPaymentMethod.bind(
                            this,
                          )}
                          style={{ flexDirection: 'row' }}
                        >
                          <FormControlLabel
                            value="Credit card"
                            control={<Radio />}
                            label="Credit card"
                            checked
                            selected
                          />
                          <FormControlLabel
                            value="interac"
                            control={<Radio />}
                            label="Interac e-transfer"
                          />

                          <FormControlLabel
                            value="cash"
                            control={<Radio />}
                            label="Cash"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item xs={12}>
                      <Typography type="subheading" className="font-uppercase">
                        Frequency
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        {/* <FormLabel component="legend">Type</FormLabel> */}
                        <RadioGroup
                          aria-label="payment-method"
                          name="frequency"
                          value={this.state.paymentFrequency}
                          onChange={this.handleChangeRadiopaymentFrequency.bind(
                            this,
                          )}
                          style={{ flexDirection: 'row' }}
                        >
                          <Grid item sm={6}>
                            <FormControlLabel
                              value="monthly"
                              control={<Radio />}
                              label="Monthly"
                              checkeds
                              selected
                            />
                          </Grid>
                          <Grid item sm={6}>
                            <FormControlLabel
                              value="weekly"
                              control={<Radio />}
                              label="Weekly"
                            />
                          </Grid>
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {this.state.paymentMethod == 'interac' ||
                  this.state.paymentMethod == 'cash' ? (
                      <div>
                        <Grid container>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={<Checkbox value="taxExempt" />}
                              label="Customer is tax exempt"
                            />
                            <FormControlLabel
                              control={<Checkbox value="noReceipts" />}
                              label="Do not generate receipts"
                            />
                          </Grid>
                        </Grid>
                      </div>
                    ) : (
                      ''
                    )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            disabled={this.state.submitLoading}
            raised
            className={`${buttonClassname}`}
            color="primary"
            type="submit"
          >
            Next
            {this.state.submitLoading && (
              <CircularProgress
                size={24}
                className={this.props.classes.buttonProgress}
              />
            )}
          </Button>
        </div>
      </form>
    );
  }
}

Step6Payment.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default withStyles(styles)(Step6Payment);
