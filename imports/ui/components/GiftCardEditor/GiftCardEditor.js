/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import filter from 'lodash/filter';
import autoBind from 'react-autobind';


import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
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

import './GiftCardEditor.scss';

// const primary = teal[500];
const danger = red[700];


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

class GiftCardEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // I know state is pretty shit and fucked up w.r.t. readability.

      valueTypes: '',
      suggestionsTypes: [],

      code: !this.props.newGiftCard && !this.props.loading && this.props.giftCard ? this.props.giftCard.code : '',
      codeType: !this.props.newGiftCard && !this.props.loading && this.props.giftCard ? this.props.giftCard.codeType : 'digital',

      initialAmountPreset: !this.props.newGiftCard && !this.props.loading && this.props.giftCard ? this.props.giftCard.initialAmountPreset : '20',
      initialAmount: !this.props.newGiftCard && !this.props.loading && this.props.giftCard ? this.props.giftCard.initialAmount : '',
      balance: !this.props.newGiftCard && !this.props.loading && this.props.giftCard.balance ? this.props.giftCard.balance : '',

      note: !this.props.newGiftCard && !this.props.loading && this.props.giftCard.hasOwnProperty('note') ? this.props.giftCard.note : '',

      customerType: !this.props.newGiftCard && !this.props.loading ? this.props.giftCard.customerType : 'email',
      customer: !this.props.newGiftCard && !this.props.loading ? this.props.giftCard.customer : '',

      status: !this.props.newGiftCard && !this.props.loading ? this.props.giftCard.status : 'active',

      currentCustomers: this.props.customers && !this.props.newGiftCard && !this.props.loading && this.props.giftCard.customerType == 'specific' ?
        filter(this.props.customers, u => this.props.giftCard.customer.find(e => e == u._id) != undefined) : [],

      deleteDialogOpen: false,
      hasFormChanged: false,

      submitLoading: false,
      submitSuccess: false,
    };

    autoBind(this);
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
        },
        balance: {
          number: true,
          min: 0,
        },
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

    console.log(suggestion);

    
    this.setState({
      hasFormChanged: true,
      customer: suggestion._id,
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

  handleDisable() {
    const { popTheSnackbar, history, giftCard } = this.props;

    const existingGiftCard = giftCard && giftCard._id;
    localStorage.setItem('giftCardDeleted', giftCard.code);
    const giftCardDeletedMessage = `${localStorage.getItem(
      'giftCardDeleted',
    )} deleted from gift cards.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('giftcards.remove', existingGiftCard, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: giftCardDeletedMessage,
        });

        history.push('/gift-cards');
      }
    });
  }

  // different function for each of the lifestyle discounts/extra types is bad,
  // make a single function for each (textfield, radiobutton, and selectfield) and pass what needs to
  // be changed via params
  // refactor v.75

  handleChange(event, type, name) {
    console.log(event.nativeEvent.target);
    console.log(type);
    console.log(name);

    if (type === 'checkbox') {
      this.setState({
        [name]: event.nativeEvent.target.checked,
      });
    }

    if (type === 'checkbox/value') {
      this.setState({
        [name]: event.nativeEvent.target.checked ? event.nativeEvent.target.value : '',
      });
    }

    if (type === 'text') {
      this.setState({
        [name]: event.nativeEvent.target.value,
      });
    }

    if (type === 'text/date') {
      this.setState({
        [name]: moment(event.nativeEvent.target.value).format('YYYY-MM-DD'),
      });
    }

    if (type === 'radio') {
      this.setState({
        [name]: event.nativeEvent.target.value,
      });

      if(name == "customerType"){
        this.setState({
          customer: '',
        })
      }
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
    const existingGiftCard = this.props.giftCard && this.props.giftCard._id;
    const methodToCall = existingGiftCard
      ? 'giftcards.update'
      : 'giftcards.insert';

    const giftCard = {
      code: this.state.code.trim(),
      codeType: this.state.codeType,
      
      initialAmountPreset: this.state.initialAmountPreset,
      balance: this.state.balance,

      customerType: this.state.customerType,
      customer: this.state.customer || '',

      note: this.state.note,
      status: this.state.status,
    };

    if(existingGiftCard){
      giftCard._id = existingGiftCard;
    }

    if (this.state.initialAmountPreset == 'custom') {
      giftCard.initialAmount = parseFloat(this.state.initialAmount);
    } else {
      // console.log(this.state.initialAmountPreset);
      // console.log(this.state.initialAmountPreset.toFixed(2))
      giftCard.initialAmount = parseFloat(this.state.initialAmountPreset);
    }

    console.log(giftCard);

    this.setState({
      submitLoading: true,
    });

    // if(!this.props.newGiftCard){
    //   if(this.props.giftCard.balance < this.props.giftCard.initialAmount){
    //     popTheSnackbar({
    //       message: "Can modify this card as it seems it's already in use."
    //     });
    //   }
    // }

    Meteor.call(methodToCall, giftCard, (error, giftCardId) => {
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
          'giftCardInserted',
          giftCard.code || $('[name="code"]').val(),
        );

        const confirmation = existingGiftCard
          ? `${localStorage.getItem('giftCardInserted')} gift card updated.`
          : `${localStorage.getItem('giftCardInserted')} gift card added.`;

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/gift-cards/${giftCardId}/edit`,
        });

        history.push('/gift-cards');
      }
    });
  }

  handleStatusChange(event, value) {
    this.setState({
      status: event.target.value,
      hasFormChanged: true,
    });
  }

  renderDeleteDialog() {
    return (
      <Dialog open={this.state.deleteDialogOpen} onClose={this.deleteDialogHandleRequestClose}>
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
          {this.props.giftCard ? this.props.giftCard.code : ''}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to disable{' '}
            {this.props.giftCard ? this.props.giftCard.code : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.deleteDialogHandleRequestClose}
            color="default"
          >
            Cancel
          </Button>
          <Button
            stroked
            className="button--bordered button--bordered--accent"
            onClick={this.handleDisable}
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

  handleCustomerChipDelete(type) {

    this.setState({
      customer: '',
      hasFormChanged: true,
    });
  }

  getTypeAvatar(customer) {
    return customer.profile.name.first.charAt(0);
  }

  generateGiftCode() {
    this.setState({
      code: Random.id(16).toLowerCase(),
      hasFormChanged: true,
    });
  }

  changeTableField() {
    this.setState({
      hasFormChanged: true,
    });
  }

  enableGiftCard() {
    Meteor.call('giftcards.enable', this.props.giftCard._id);
  }

  disableGiftCard() {
    Meteor.call('giftcards.disable', this.props.giftCard._id);
  }

  render() {
    // console.log(this.props);
    const { giftCard, history } = this.props;

    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

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
                onClick={() => this.props.history.push('/gift-cards')}
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
                  <ChevronLeft style={{ marginRight: '4px' }} /> Gift cards
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
                {this.props.giftCard && this.props.giftCard._id
                  ? `${this.props.giftCard.code.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '')}`
                  : 'Create gift card'}
              </Typography>
              {this.props.giftCard && this.props.giftCard._id ? (
                <Button size="small" onClick={this.props.giftCard.status == 'disabled' ? this.enableGiftCard : this.disableGiftCard}>
                {this.props.giftCard.status == 'disabled' ? 'Enable' : 'Disable'}
                </Button>
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
                  onClick={() => history.push('/gift-cards')}
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
                    Code
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    <Button
                      size="small"
                      style={{ float: 'right', marginBottom: '20px' }}
                      onClick={this.generateGiftCode}
                    >
                      Generate code
                    </Button>

                    <TextField
                      id="title"
                      label="Code"
                      name="title"
                      fullWidth
                      value={this.state.code}
                      onChange={(e) => this.handleChange(e, 'text', 'code')}
                      required
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

                    <FormControl component="fieldset">
                      <RadioGroup
                        aria-label="Gift code type"
                        name="codeType"
                        value={this.state.codeType}
                        onChange={(e) => this.handleChange(e, 'radio', 'codeType')}
                        style={{ flexDirection: 'row' }}
                      >
                        <FormControlLabel
                          className="radiobuttonlabel"
                          value="physical"
                          control={
                            <Radio
                              checked={this.state.codeType === 'physical'}
                            />
                          }
                          label="Physical"
                        />
                        <FormControlLabel
                          className="radiobuttonlabel"
                          value="digital"
                          control={
                            <Radio checked={this.state.codeType === 'digital'} />
                          }
                          label="Digital"
                        />

                      </RadioGroup>
                    </FormControl>

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
                    Status
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    
                  <Select fullWidth onChange={this.handleStatusChange} value={this.state.status}>
                    <MenuItem key={2134} value={'active'}>
                      Active
                    </MenuItem>
                    <MenuItem key={4312} value={'disabled'}>
                      Disabled
                    </MenuItem>
                  </Select>

                    
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
                    Intial amount
                  </Typography>

                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    <Grid container>
                      <Grid item xs={12} sm={12} md={12}>
                        <FormControl component="fieldset">
                          <RadioGroup
                            aria-label="Intial amount preset"
                            name="initialAmountPreset"
                            value={this.state.initialAmountPreset}
                            onChange={(e) => this.handleChange(e, 'radio', 'initialAmountPreset')}
                            style={{ flexDirection: 'row' }}
                          >

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="0"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '0'
                                  }
                                />
                              }
                              label="$0"
                            />

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="50"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '50'
                                  }
                                />
                              }
                              label="$50.00"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="100"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '100'
                                  }
                                />
                              }
                              label="$100.00"
                            />

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="150"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '150'
                                  }
                                />
                              }
                              label="$150.00"
                            />

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="200"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '200'
                                  }
                                />
                              }
                              label="$200.00"
                            />

                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="250"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '250'
                                  }
                                />
                              }
                              label="$250.00"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="300"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    '300'
                                  }
                                />
                              }
                              label="$300.00"
                            />
                            <FormControlLabel
                              className="radiobuttonlabel"
                              value="custom"
                              control={
                                <Radio
                                  checked={
                                    this.state.initialAmountPreset ===
                                    'custom'
                                  }
                                />
                              }
                              label="Custom"
                            />


                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={12} md={12}>
                        {this.state.initialAmountPreset == 'custom' && (
                          <TextField
                            style={{marginBottom: '1em'}}
                            fullWidth
                            value={this.state.initialAmount}
                            id="initialAmount"
                            name="initialAmount"
                            onChange={(e) => this.handleChange(e, 'text', 'initialAmount')}
                            label="Initial amount"
                            InputProps={{
                              'aria-label': 'Description',
                              type: 'number',
                              startAdornment: <InputAdornment position={'start'}>$</InputAdornment>,
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>


                    <Grid item xs={12} sm={12} md={12}>
                      <TextField
                        disabled={this.props.newGiftCard}
                        fullWidth
                        // value={this.props.giftCard.balance < this.props.giftCard.initialAmount ? this.state.balance : this.state.initialAmount}
                        value={this.state.balance}
                        id="balance"
                        name="balance"
                        onChange={(e) => this.handleChange(e, 'text', 'balance')}
                        label="Balance"
                        InputProps={{
                          'aria-label': 'Description',
                          type: 'number',
                          startAdornment: <InputAdornment position={'start'}>$</InputAdornment>,
                        }}
                      />
                    </Grid>

                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>



          <Divider light className="divider--space-x" />

          {!this.props.newGiftCard &&  (
            <React.Fragment>
              <Grid container justify="center" style={{ marginBottom: '50px' }}>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={12} sm={4}>
                      <Typography
                        type="subheading"
                        className="subheading font-medium"
                      >
                        Purchase
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Paper elevation={2} className="paper-for-fields">

                          {this.props.giftCard.purchasedOnline ? 'Online' : 'Offline'}

                      </Paper>
                    </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Divider light className="divider--space-x" />
              </React.Fragment>
            )}


            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      type="subheading"
                      className="subheading font-medium"
                    >
                      Customer
                  </Typography>

                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">
                      <Grid container>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="email"
                              name="email"
                              value={this.state.customerType}
                              onChange={(e) => this.handleChange(e, 'radio', 'customerType')}
                              style={{ flexDirection: 'row' }}
                            >
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="email"
                                control={
                                  <Radio
                                    checked={
                                      this.state.customerType ===
                                      'email'
                                    }
                                  />
                                }
                                label="Email"
                              />
                              <FormControlLabel
                                className="radiobuttonlabel"
                                value="specific"
                                control={
                                  <Radio
                                    checked={
                                      this.state.customerType ===
                                      'specific'
                                    }
                                  />
                                }
                                label="Existing Customer"
                              />


                            </RadioGroup>
                          </FormControl>
                        </Grid>


                        {this.state.customerType == 'email' && (
                          <div style={{ width: '100%' }}>
                            <Grid item xs={12}>
                              <TextField
                                label="Email"
                                fullWidth
                                name="customer"
                                id="email"
                                required
                                type="email"
                                onChange={(e) => this.handleChange(e, 'text', 'customer')}
                                value={this.state.customer}
                              />
                            </Grid>
                          </div>
                        )}

                        {this.state.customerType == 'specific' && (
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
                              {!this.props.loading && this.state.customerType == 'specific' && this.state.customer.length ? (
                                filter(this.props.customers, u => this.state.customer === u._id).map((e, i) => (
                                  <Chip
                                    avatar={<Avatar> {this.getTypeAvatar(e)} </Avatar>}
                                    style={{ marginRight: '8px', marginBottom: '8px' }}
                                    label={`${e.profile.name.first} ${e.profile.name.last}`}
                                    key={i}
                                    onDelete={this.handleCustomerChipDelete.bind(
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
                      Note
                  </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">

                      <TextField
                        fullWidth
                        name="note"
                        id="note"
                        multiline
                        value={this.state.note}
                        onChange={(e) => this.handleChange(e, 'text', 'note')}
                      />

                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>


            <Grid container justify="center" style={{ marginBottom: '50px' }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={4}>
                    {
                      this.props.newGiftCard ? (
                        ''
                      ) : (
                          <Button
                            raised
                            onClick={
                              this.props.giftCard && this.props.giftCard._id
                                ? this.handleRemove
                                : () => this.props.history.push('/gift-cards')
                            }
                          >
                            Disable
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
                        onClick={() => history.push('/gift-cards')}
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
      </form >
        );
      }
    }
    
GiftCardEditor.defaultProps = {
          category: {title: '' },
      };
      
GiftCardEditor.propTypes = {
          category: PropTypes.object,
        customers: PropTypes.array.isRequired,
        history: PropTypes.object.isRequired,
        popTheSnackbar: PropTypes.func.isRequired,
      };
      
      export default withStyles(styles)(GiftCardEditor);
