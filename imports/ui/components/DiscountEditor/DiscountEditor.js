/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';

import _ from 'lodash';

import { Meteor } from 'meteor/meteor';

import { Random } from 'meteor/random';


import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import {
  FormControl,
  FormHelperText,
  FormControlLabel,
} from 'material-ui/Form';

import Checkbox from 'material-ui/Checkbox';
import Radio, { RadioGroup } from 'material-ui/Radio';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';

import { CircularProgress } from 'material-ui/Progress';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import green from 'material-ui/colors/green';

import Loading from '../Loading/Loading';


import validate from '../../../modules/validate';

import moment from 'moment';

// const primary = teal[500];
const danger = red[700];

import './DiscountEditor.scss';


const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonDisabled: {
    background: '#e0e0e0',
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

class DiscountEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // I know state is pretty shit and fucked up w.r.t. readability.

      valueTypes: '',
      suggestionsTypes: [],


      discountCode: !this.props.newDiscount && !this.props.loading ? this.props.discount.title : '',

      discountType: !this.props.newDiscount && !this.props.loading ? this.props.discount.discountType : 'Percentage',
      discountValue: !this.props.newDiscount && !this.props.loading ? this.props.discount.discountValue : '',


      appliesToType: !this.props.newDiscount && !this.props.loading ? this.props.discount.appliesToType : 'whole',
      appliesToValue: !this.props.newDiscount && !this.props.loading ? this.props.discount.appliesToValue : 'whole',

      appliesToRestrictionsAndExtras: !this.props.newDiscount && !this.props.loading ? this.props.discount.appliesToRestrictionsAndExtras : false,
      appliesToExistingDiscounts: !this.props.newDiscount && !this.props.loading ? this.props.discount.appliesToExistingDiscounts : false,

      minimumRequirementType: !this.props.newDiscount && !this.props.loading ? this.props.discount.minimumRequirementType : 'none',
      minimumRequirementValue: !this.props.newDiscount && !this.props.loading ? this.props.discount.minimumRequirementValue : '',

      customerEligibilityType: !this.props.newDiscount && !this.props.loading ? this.props.discount.customerEligibilityType : 'everyone',
      customerEligibilityValue: !this.props.newDiscount && !this.props.loading ? this.props.discount.customerEligibilityValue : '',

      usageLimitType: !this.props.newDiscount && !this.props.loading ? this.props.discount.usageLimitType : '',
      usageLimitValue: !this.props.newDiscount && !this.props.loading ? this.props.discount.usageLimitValue : '',

      startDateValue: !this.props.newDiscount && !this.props.loading ? moment(this.props.discount.startDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      endDate: !this.props.newDiscount && !this.props.loading ? this.props.discount.hasOwnProperty('endDate') : false,
      endDateValue: !this.props.newDiscount && !this.props.loading ? moment(this.props.discount.endDate).format('YYYY-MM-DD') : '',

      status: !this.props.newDiscount && !this.props.loading ? this.props.discount.status : '',

      currentCustomers: this.props.customers && !this.props.newDiscount && !this.props.loading && this.props.discount.customerEligibilityType == 'specific' ?
        _.filter(this.props.customers, (u) => this.props.discount.customerEligibilityValue.find(e => e == u._id) != undefined) : [],

      deleteDialogOpen: false,
      hasFormChanged: false,

      submitLoading: false,
      submitSuccess: false,
    };
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element).parent().parent(),
        );
      },

      rules: {
        title: {
          required: true,
        },
        discountValue: {
          required: true,
        },
        purchaseAmount: {
          required: true,
        }
      },
      messages: {
        title: {
          required: 'Discount code required.',
        },
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

  onChangeTypes(event, { newValue }) {
    this.setState({
      valueTypes: newValue,
    });
  }

  onSuggestionSelectedTypes(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    const clonedRestrictions = this.state.customerEligibilityValue
      ? this.state.customerEligibilityValue.slice()
      : [];

    let isThere = false;

    if (clonedRestrictions.length > 0) {
      isThere = clonedRestrictions.filter(
        present => suggestion._id === present._id,
      );
    }

    if (isThere != false) {
      return;
    }

    clonedRestrictions.push(suggestion._id);

    this.setState({
      hasFormChanged: true,
      customerEligibilityValue: clonedRestrictions,
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.

  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value),
    });
  }

  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: [],
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestionsTypes(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.customers.filter(
        type => type.profile.name.first.toLowerCase().slice(0, inputLength) === inputValue,
      );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValueTypes(suggestion) {
    return suggestion.profile.name.first;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, discount } = this.props;

    const existingLifestyle = discount && discount._id;
    localStorage.setItem('discountDeleted', discount.title);
    const discountDeletedMessage = `${localStorage.getItem(
      'discountDeleted',
    )} deleted from discounts.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('discounts.remove', existingLifestyle, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: discountDeletedMessage,
        });

        history.push('/discounts');
      }
    });
  }

  // different function for each of the lifestyle discounts/extra types is bad,
  // make a single function for each (textfield, radiobutton, and selectfield) and pass what needs to
  // be changed via params
  // refactor v.75


  handleChange(type, name, event, value) {
    // console.log(event);
    // console.log(type);
    // console.log(name);

    if (type === 'checkbox') {
      this.setState({
        [name]: event.target.checked,
      });
    }

    if (type === 'checkbox/value') {
      this.setState({
        [name]: event.target.checked ? event.target.value : '',
      });
    }

    if (type === 'text') {
      this.setState({
        [name]: event.target.value,
      });
    }

    if (type === 'text/date') {
      this.setState({
        [name]: moment(event.target.value).format('YYYY-MM-DD'),
      });
    }

    if (type === 'radio') {
      this.setState({
        [name]: value,
      });
    }

    this.setState({
      hasFormChanged: true,
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingDiscount = this.props.discount && this.props.discount._id;
    const methodToCall = existingDiscount
      ? 'discounts.update'
      : 'discounts.insert';



    const customerEligibilityValueClone = this.state.customerEligibilityValue.slice();

    if (this.state.customerEligibilityType == "specific") {
      const everyonePresent = customerEligibilityValueClone.findIndex(el => el == "everyone");

      if (everyonePresent != -1) {
        customerEligibilityValueClone.splice(everyonePresent, 1);
      }
    }

    const discount = {
      title: this.state.discountCode.trim(),

      discountType: this.state.discountType,
      discountValue: parseFloat(this.state.discountValue),

      appliesToType: this.state.appliesToType,
      appliesToValue: this.state.appliesToType == 'whole' ? 'whole' : this.state.appliesToValue,

      appliesToRestrictionsAndExtras: this.state.appliesToRestrictionsAndExtras,
      appliesToExistingDiscounts: this.state.appliesToExistingDiscounts,

      minimumRequirementType: this.state.minimumRequirementType,
      minimumRequirementValue: this.state.minimumRequirementType == 'none' ? 'none' : this.state.minimumRequirementValue,

      customerEligibilityType: this.state.customerEligibilityType,
      customerEligibilityValue: this.state.customerEligibilityType == 'specific' ? customerEligibilityValueClone.map((e) => {
        const foundCustomer = this.props.customers.find(el => el._id == e);

        return foundCustomer._id;

      }) : 'everyone',

      status: moment(this.state.startDateValue).isSameOrBefore(moment(), 'day') ? 'active' :
        moment(this.state.startDateValue).isAfter(moment(), 'day') ? 'scheduled' :
          this.props.discount.status,

      startDate: moment(this.state.startDateValue).toDate(),
      endDate: this.state.endDate ? moment(this.state.endDateValue).toDate() : '',
    };

    if (this.state.usageLimitType == 'numberOfTimes') {
      discount.usageLimitType = this.state.usageLimitType;
      discount.usageLimitValue = parseInt(this.state.usageLimitValue, 10);
    }

    if (!this.state.endDate) {
      delete discount.endDate;
    }

    if (existingDiscount) {
      discount._id = existingDiscount;


      if (this.state.usageLimitType == '') {
        delete discount.usageLimitType;
        delete discount.usageLimitValue;
      }

      // delete properties here
    }

    console.log(discount);

    // return;

    this.setState({
      submitLoading: true,
    });

    Meteor.call(methodToCall, discount, (error, discountId) => {
      console.log('Inside Method');

      if (error) {
        console.log(error);
        this.setState({
          submitSuccess: false,
          submitLoading: false,
        });
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.setState({
          submitSuccess: true,
          submitLoading: false,
        });
        localStorage.setItem(
          'discountForSnackbar',
          discount.title || $('[name="title"]').val(),
        );

        const confirmation = existingDiscount
          ? `${localStorage.getItem('discountForSnackbar')} discount updated.`
          : `${localStorage.getItem('discountForSnackbar')} discount added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/discounts/${discountId}/edit`,
        });

        history.push('/discounts');
      }
    });
  }

  renderDeleteDialog() {
    return (
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
          Delete{' '}
          {this.props.discount ? this.props.discount.title.toLowerCase() : ''}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{' '}
            {this.props.discount
              ? this.props.discount.title.toLowerCase()
              : ''}?
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
    );
  }

  renderSuggestionTypes(suggestion) {
    return (
      <MenuItem component="div">
        <div>{`${suggestion.profile.name.first} ${suggestion.profile.name.last ? suggestion.profile.name.last : ''}`}</div>
      </MenuItem>
    );
  }

  renderInputTypes(inputProps) {
    const { value, ...other } = inputProps;

    return (
      <TextField
        className={styles.textField}
        value={value}
        style={{ width: '100%' }}
        InputProps={{
          classes: {
            input: styles.input,
          },
          ...other,
        }}
      />
    );
  }

  renderSuggestionsContainerTypes(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  handleRestrictionChipDelete(type) {
    console.log(type)
    const stateCopy = this.state.customerEligibilityValue.slice();

    stateCopy.splice(stateCopy.indexOf(type._id), 1);

    console.log(stateCopy);

    this.setState({
      customerEligibilityValue: stateCopy,
      hasFormChanged: true,
    });
  }

  getTypeAvatar(customer) {
    return customer.profile.name.first.charAt(0);
  }

  generateDiscountCode() {
    this.setState({
      discountCode: Random.id().toUpperCase().substring(0, 9),
      hasFormChanged: true,
    });
  }

  changeTableField() {
    this.setState({
      hasFormChanged: true,
    });
  }

  enableDiscount() {
    console.log(this.props.discount._id);

    Meteor.call('discounts.enable', this.props.discount._id, (err, res) => {
      console.log(res);
    });
  }

  disableDiscount() {

  }

  render() {
    // console.log(this.props);
    const { lifestyle, history } = this.props;

    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    // if (this.props.loading == false) {
    //   console.log(this.props.discount.customerEligibilityValue)
    // }


    if (!this.props.loading) {
      // console.log(this.props.customers.filter(e => this.props.discount.customerEligibilityValue.indexOf(e._id) != -1));

      return (
        <form
          style={{ width: '100%' }}
          ref={form => (this.form = form)}
          onSubmit={event => event.preventDefault()}
        >

          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Grid container justify="center">
              <Grid item xs={12}>
                <Button
                  onClick={() => this.props.history.push('/discounts')}
                  className="button button-secondary button-secondary--top"
                >
                  <Typography
                    type="subheading"
                    className="subheading font-medium"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <ChevronLeft style={{ marginRight: '4px' }} /> Discounts
                  </Typography>
                </Button>
              </Grid>
            </Grid>
            <Grid container style={{ marginBottom: '50px' }}>
              <Grid item xs={4}>
                <Typography
                  type="headline"
                  className="headline"
                  style={{ fontWeight: 500 }}
                >
                  {this.props.discount && this.props.discount._id
                    ? `${this.props.discount.title}`
                    : 'Create discount code'}
                </Typography>
                {this.props.discount && this.props.discount._id ? (
                  <Button size="small" onClick={this.props.discount.status == 'expired' ? this.enableDiscount.bind(this) : this.disableDiscount.bind(this)}>{this.props.discount.status == 'expired' ? 'Enable' : 'Disable'}</Button>
                ) : ''}

              </Grid>
              <Grid item xs={8}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    style={{ marginRight: '10px' }}
                    onClick={() => history.push('/discounts')}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!this.state.hasFormChanged || this.state.submitLoading}
                    className={`btn btn-primary ${buttonClassname}`}
                    raised
                    type="submit"
                    color="contrast"
                  >
                    Save
                    {this.state.submitLoading && (
                      <CircularProgress
                        size={24}
                        className={this.props.classes.buttonProgress}
                      />
                    )}
                  </Button>
                </div>
              </Grid>
            </Grid>

            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Discount code
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Button size="small" style={{ float: 'right', marginBottom: '20px' }} onClick={this.generateDiscountCode.bind(this)}>Generate code</Button>

                      <TextField
                        id="title"
                        label="Code"
                        name="title"
                        fullWidth
                        value={this.state.discountCode}
                        onChange={this.handleChange.bind(this, 'text', 'discountCode')}
                      />

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />


            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Type
                    </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>

                        <Grid item xs={6} sm={6}>
                          <TextField
                            fullWidth
                            id="select-discount-type"
                            select
                            label="Type"
                            value={this.state.discountType}
                            onChange={this.handleChange.bind(this, 'text', 'discountType')}
                            SelectProps={{ native: false }}
                          >
                            <MenuItem key={1} value="Percentage">
                              Percentage
                            </MenuItem>
                            <MenuItem key={2} value="Fixed amount">
                              Fixed amount
                            </MenuItem>
                          </TextField>
                        </Grid>

                        <Grid item xs={6} sm={6}>
                          <TextField
                            fullWidth
                            value={this.state.discountValue}
                            id="discountValue"
                            name="discountValue"
                            onChange={this.handleChange.bind(this, 'text', 'discountValue')}
                            label="Amount"
                            InputProps={{
                              'aria-label': 'Description',
                              type: 'number',
                              startAdornment: <InputAdornment position={this.state.discountType == 'Percentage' ? 'end' : 'start'}>
                                {this.state.discountType == 'Percentage' ? '%' : '$'}
                              </InputAdornment>,
                            }}
                          />
                        </Grid>
                      </Grid>

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />


            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Applies to
                    </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="discountOrExtra"
                              name="discountOrExtra"
                              value={this.state.appliesToType}
                              onChange={this.handleChange.bind(
                                this,
                                'radio',
                                'appliesToType',
                              )}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="whole"
                                control={
                                  <Radio
                                    checked={
                                      this.state.appliesToType === 'whole'
                                    }
                                  />
                                }
                                label="Whole order"
                              />

                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="lifestyle"
                                control={
                                  <Radio
                                    checked={
                                      this.state.appliesToType === 'lifestyle'
                                    }
                                  />
                                }
                                label="Lifestyle"
                              />

                              {/* <FormControlLabel
                              className="radiobuttonlabel"
                              value="side"
                              control={
                                <Radio
                                  checked={
                                    this.state.appliesToType === 'side'
                                  }
                                />
                              }
                              label="Side"
                            /> */}
                            </RadioGroup>

                          </FormControl>


                          <Divider style={{ margin: '50px 0' }} />

                          <FormControlLabel
                            className="radiobuttonlabel"
                            control={
                              <Checkbox checked={this.state.appliesToRestrictionsAndExtras} />
                            }
                            label="Applies to restrictions and extras"
                            onChange={this.handleChange.bind(this, 'checkbox', 'appliesToRestrictionsAndExtras')}
                          />

                          <FormControlLabel
                            className="radiobuttonlabel"
                            control={
                              <Checkbox checked={this.state.appliesToExistingDiscounts} />
                            }
                            label="Applies to existing discounts"
                            onChange={this.handleChange.bind(this, 'checkbox', 'appliesToExistingDiscounts')}
                          />

                        </Grid>

                        {this.state.appliesToType == 'lifestyle' && (
                          <Grid item xs={12} sm={12}>
                            {/* <TextField
                            fullWidth
                            id="select-lifestyle"
                            select
                            label="Lifestyle"
                            value={
                              this.state.appliesToValue
                                ? this.state.appliesToValue
                                : ''
                            }
                            onChange={this.handleChange.bind(this, 'text', 'appliesToValue')}
                            SelectProps={{ native: false }}
                          >
                            {this.props.lifestyles.map((e, i) => (
                              <MenuItem key={i} value={e.title}>
                                {e.title}
                              </MenuItem>
                            ))}

                          </TextField> */}
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="All"
                              control={
                                <Checkbox
                                  checked={this.state.appliesToValue === 'All'}
                                />

                              }
                              onChange={this.handleChange.bind(this, 'checkbox/value', 'appliesToValue')}
                              label="All"
                            />
                            {this.props.lifestyles.map((e, i) => (
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value={e.title}
                                disabled={this.state.appliesToValue == 'All'}
                                control={
                                  <Checkbox
                                    disabled={this.state.appliesToValue === 'All'}
                                    checked={this.state.appliesToValue === e.title || this.state.appliesToValue === 'All'}
                                  />

                                }
                                onChange={this.handleChange.bind(this, 'checkbox/value', 'appliesToValue')}
                                label={e.title}
                              />
                            ))}


                          </Grid>
                        )}

                        {/* {this.state.appliesToType == 'side' && (
                        <Grid item xs={12} sm={12}>
                          <FormControlLabel
                            className="radiobuttonlabel"
                            value="All"
                            control={
                              <Checkbox
                                checked={this.state.appliesToValue === "All"}
                              />

                            }
                            onChange={this.handleChange.bind(this, 'checkbox/value', 'appliesToValue')}
                            label="All"
                          />
                          {this.props.sides.map((e, i) => (
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value={e.title}
                              disabled={this.state.appliesToValue == "All"}
                              control={
                                <Checkbox
                                  disabled={this.state.appliesToValue === "All"}
                                  checked={this.state.appliesToValue === e.title || this.state.appliesToValue === "All"}
                                />

                              }
                              onChange={this.handleChange.bind(this, 'checkbox/value', 'appliesToValue')}
                              label={e.title}
                            />
                          ))}

                        </Grid>
                      )} */}

                      </Grid>

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />

            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Minimum requirement
                    </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="discountOrExtra"
                              name="discountOrExtra"
                              value={this.state.minimumRequirementType}
                              onChange={this.handleChange.bind(this, 'radio', 'minimumRequirementType')}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="none"
                                control={
                                  <Radio
                                    checked={
                                      this.state.minimumRequirementType ===
                                      'none'
                                    }
                                  />
                                }
                                label="None"
                              />
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="purchaseAmount"
                                control={
                                  <Radio
                                    checked={
                                      this.state.minimumRequirementType ===
                                      'purchaseAmount'
                                    }
                                  />
                                }
                                label="Minimum purchase amount"
                              />

                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="minQuantity"
                                control={
                                  <Radio
                                    checked={
                                      this.state.minimumRequirementType ===
                                      'minQuantity'
                                    }
                                  />
                                }
                                label="Minimum quantity"
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        {this.state.minimumRequirementType == 'purchaseAmount' && (
                          <Grid item xs={12} sm={12}>
                            <TextField
                              fullWidth
                              InputProps={{
                                type: 'number',
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                required: 'true',
                                name: 'purchaseAmount'
                              }}
                              value={this.state.minimumRequirementValue}
                              onChange={this.handleChange.bind(this, 'text', 'minimumRequirementValue')}
                            />

                          </Grid>
                        )}

                        {this.state.minimumRequirementType == 'minQuantity' && (
                          <Grid item xs={12} sm={12}>
                            <TextField
                              fullWidth
                              inputProps={{
                                type: 'number',
                                required: 'true',

                              }}
                              label="Minimum quantity"
                              value={this.state.minimumRequirementValue}
                              onChange={this.handleChange.bind(this, 'text', 'minimumRequirementValue')}
                            />

                          </Grid>
                        )}

                      </Grid>

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />

            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Customer eligibility
                    </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="discountOrExtra"
                              name="discountOrExtra"
                              value={this.state.customerEligibilityType}
                              onChange={this.handleChange.bind(
                                this,
                                'radio',
                                'customerEligibilityType',
                              )}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="everyone"
                                control={
                                  <Radio
                                    checked={
                                      this.state.customerEligibilityType ===
                                      'everyone'
                                    }
                                  />
                                }
                                label="Everyone"
                              />
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="specific"
                                control={
                                  <Radio
                                    checked={
                                      this.state.customerEligibilityType ===
                                      'specific'
                                    }
                                  />
                                }
                                label="Specific Customer"
                              />


                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        {this.state.customerEligibilityType == 'specific' && (
                          <div style={{ width: '100%' }}>
                            <Grid item xs={12} style={{ position: 'relative' }}>
                              <Search
                                className="autoinput-icon"
                                style={{ right: '0 !important' }}
                              />
                              <Autosuggest
                                id="1"
                                className="autosuggest"
                                theme={{
                                  container: {
                                    flexGrow: 1,
                                    position: 'relative',
                                  },
                                  suggestionsContainerOpen: {
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                  },
                                  suggestion: {
                                    display: 'block',
                                  },
                                  suggestionsList: {
                                    margin: 0,
                                    padding: 0,
                                    listStyleType: 'none',
                                  },
                                }}
                                renderInputComponent={this.renderInputTypes.bind(this)}
                                suggestions={this.state.suggestionsTypes}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedTypes.bind(
                                  this,
                                )}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequestedTypes.bind(
                                  this,
                                )}
                                onSuggestionSelected={this.onSuggestionSelectedTypes.bind(
                                  this,
                                )}
                                getSuggestionValue={this.getSuggestionValueTypes.bind(
                                  this,
                                )}
                                renderSuggestion={this.renderSuggestionTypes.bind(this)}
                                renderSuggestionsContainer={this.renderSuggestionsContainerTypes.bind(
                                  this,
                                )}
                                focusInputOnSuggestionClick={false}
                                inputProps={{
                                  placeholder: 'Search',
                                  value: this.state.valueTypes,
                                  onChange: this.onChangeTypes.bind(this),
                                  className: 'auto type-autocomplete',
                                }}
                              />
                            </Grid>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                marginTop: '25px',
                              }}
                            >
                              {!this.props.loading && this.state.customerEligibilityType == "specific" && this.state.customerEligibilityValue.length > 0 ? (
                                _.filter(this.props.customers, (u) => this.state.customerEligibilityValue.find(e => e == u._id) != undefined).map((e, i) => (
                                  <Chip
                                    avatar={<Avatar> {this.getTypeAvatar(e)} </Avatar>}
                                    style={{ marginRight: '8px', marginBottom: '8px' }}
                                    label={`${e.profile.name.first} ${e.profile.name.last}`}
                                    key={i}
                                    onDelete={this.handleRestrictionChipDelete.bind(
                                      this,
                                      e,
                                    )}
                                  />
                                ))
                              ) : (
                                  <Chip className="chip--bordered" label="Customer" />
                                )}
                            </div>
                          </div>
                        )}
                      </Grid>

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />

            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Usage limits
                    </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="numberOfTimes"
                              control={
                                <Checkbox
                                  checked={
                                    this.state.usageLimitType === 'numberOfTimes'
                                  }
                                />

                              }
                              onChange={this.handleChange.bind(this, 'checkbox/value', 'usageLimitType')}
                              label="Limit number of times this discount can be used in total"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="oneUsePerCustomer"
                              disabled
                              control={
                                <Checkbox
                                  disabled
                                  checked={
                                    this.state.usageLimitType ===
                                    'oneUsePerCustomer'
                                  }
                                />
                              }
                              label="Limit to one use per customer"
                            />
                          </FormControl>
                        </Grid>

                        {this.state.usageLimitType == 'numberOfTimes' && (
                          <Grid item xs={12} sm={12}>
                            <TextField
                              fullWidth
                              inputProps={{
                                type: 'number',
                                required: 'true',
                              }}
                              label="Usage limit"
                              name="usageLimitValue"
                              value={this.state.usageLimitValue}
                              onChange={this.handleChange.bind(this, 'text', 'usageLimitValue')}
                            />

                          </Grid>
                        )}


                      </Grid>

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />

            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Active dates
                    </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>

                        <Grid item xs={12} sm={12}>
                          <Typography type="body2">Start date</Typography>
                          <TextField
                            fullWidth
                            inputProps={{ type: 'date' }}
                            value={this.state.startDateValue}
                            onChange={this.handleChange.bind(this, 'text/date', 'startDateValue')}
                          />

                        </Grid>

                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="endDate"
                              onChange={this.handleChange.bind(this, 'checkbox', 'endDate')}
                              control={
                                <Checkbox
                                  checked={this.state.endDate}
                                />
                              }
                              label="End date"
                            />
                          </FormControl>
                        </Grid>

                        {this.state.endDate && (
                          <Grid item xs={12} sm={12}>
                            <Typography type="body2">End date</Typography>
                            <TextField
                              fullWidth
                              inputProps={{
                                type: 'date',
                                required: 'true',
                              }}
                              value={this.state.endDateValue}
                              onChange={this.handleChange.bind(this, 'text', 'endDateValue')}
                            />

                          </Grid>
                        )}


                      </Grid>

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider light className="divider--space-x" />

            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={4}>
                    {
                      this.props.newDiscount ? (
                        ''
                      ) : (
                          <Button
                            raised
                            onClick={
                              this.props.discount && this.props.discount._id
                                ? this.handleRemove.bind(this)
                                : () => this.props.history.push('/discounts')
                            }
                          >
                            Delete
                          </Button>
                        )}
                  </Grid>

                  <Grid item xs={8}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        style={{ marginRight: '10px' }}
                        onClick={() => history.push('/discounts')}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={!this.state.hasFormChanged || this.state.submitLoading}
                        type="submit"
                        className={`btn btn-primary ${buttonClassname}`}
                        raised
                        color="contrast"
                      >
                        Save

                        {this.state.submitLoading && (
                          <CircularProgress
                            size={24}
                            className={this.props.classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>

          {this.renderDeleteDialog()}
        </form>
      );
    } return <Loading />;
  }
}

DiscountEditor.defaultProps = {
  category: { title: '' },
};

DiscountEditor.propTypes = {
  category: PropTypes.object,
  customers: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(DiscountEditor);
