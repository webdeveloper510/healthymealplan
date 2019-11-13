/* eslint-disable max-len, no-return-assign */
import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Autosuggest from 'react-autosuggest';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
// import Select from 'material-ui/Select';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
// import { FormControl, FormHelperText } from 'material-ui/Form';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import {
    FormLabel,
    FormControl,
    FormControlLabel,
    FormGroup,
} from 'material-ui/Form';
import Dialog, {
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import { withStyles } from 'material-ui/styles';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';

import validate from '../../../modules/validate';
import moment from 'moment';
import assign from 'lodash/assign';
import autoBind from  'react-autobind';
import slugify from 'slugify';

import Loading from '../Loading/Loading';


import $ from 'jquery';
import _ from "lodash";

// const primary = teal[500];
const danger = red[700];

const styles = theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});

$.validator.addMethod(
  'cdnPostal',
  function (postal, element) {
    return (
      this.optional(element) ||
      postal.match(/[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/)
    );
  },
  'Please specify a valid postal code.',
);

class PartnerEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteDialogOpen: false,
      hasFormChanged: false,


        partnerURL: !this.props.newPartner && !this.props.loading ? this.props.partner.partnerURL : '',
        businessName: !this.props.newPartner && !this.props.loading ? this.props.partner.businessName : '',
        firstName: !this.props.newPartner && !this.props.loading ? this.props.partner.profile.name.first : '',
        lastName: !this.props.newPartner && !this.props.loading ? this.props.partner.profile.name.last : '',
        email: !this.props.newPartner && !this.props.loading ? this.props.partner.emails[0].address : '',
        phoneNumber: !this.props.newPartner && !this.props.loading ? this.props.partner.phone : '',
        postalCode: !this.props.newPartner && !this.props.loading ? this.props.partner.postalCode : '',

        creditType: !this.props.newPartner && !this.props.loading ? this.props.partner.partnerCreditType : 'Percentage',
        creditValue: !this.props.newPartner && !this.props.loading ? this.props.partner.partnerCreditValue : '',
        creditTypeRecurring: !this.props.newPartner && !this.props.loading ? this.props.partner.creditTypeRecurring : false,

        suggestionsTypes: [],
        valueTypes: '',

        discountSelected: '',
        discountApplied: !this.props.newPartner && !this.props.loading ? this.props.partner.partnerDiscountId : false,

        payoutModalOpen: false,

    };

    autoBind(this);
  }

  componentDidMount() {
      validate(this.form, {
          errorPlacement(error, element) {
              error.insertAfter(
                  $(element)
                      .parent()
                      .parent()
              );
          },

          rules: {
              firstName: {
                  required: true,
              },
              lastName: {
                  required: true,
              },
              businessName: {
                  required: true,
              },
              partnerURL: {
                  required: true,
              },
              email: {
                  required: true,
              },
              phoneNumber: {
                  required: true,
              },
              creditValue: {
                  required: true,
              },

          }
      })
  }

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

        if (name === "partnerURL") {
            this.setState({
                [name]: slugify(event.target.value, { remove: /[*+~.(),'"!:@]/g, lower: true }) + "",
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

    // Discount AutoSuggest methods
    onChangeTypes(event, { newValue }) {
        this.setState({
            discountSelected: newValue,
            valueTypes: newValue,
        });
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

    getSuggestionsTypes(value) {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        console.log('Fetch requested');

        console.log(this.props.discounts.filter(d => d.title.slice(0, inputLength) === inputValue));

        return inputLength === 0
            ? []
            : this.props.discounts.filter(
                discount => discount.title.toLowerCase().slice(0, inputLength) === inputValue,
            );
    }

    getSuggestionValueTypes(suggestion) {
        return suggestion.title;
    }

    renderSuggestionTypes(suggestion) {
        return (
            <MenuItem component="div">
                <Typography type="subheading">{suggestion.title}</Typography>
            </MenuItem>
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

    onSuggestionSelectedTypes(
        event,
        { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
    ) {
        let clonedRestrictions = this.state.discountApplied != ''
            ? this.state.discountApplied
            : [];

        const isThere = false;

        if (clonedRestrictions.length > 0) {
            // isThere = clonedRestrictions.filter(
            //   present => suggestion._id === present._id,
            // );
            this.props.popTheSnackbar({
                message: 'Cannot add more than one discount code',
            });
            return;
        }

        if (isThere != false) {
            return;
        }

        clonedRestrictions = suggestion.title;

        const discountId = this.props.discounts.find(e => e.title === suggestion.title);

        this.setState({
            discountApplied: discountId._id,
            hasFormChanged: true,
            discountSelected: clonedRestrictions,
        });
    }
    // End of discount methods

    handleSubmit(event){

    if (this.state.discountSelected === '') {
        this.props.popTheSnackbar({
            message: 'Please select a partner discount code',
        });
    }

    const dataToBeSent = {

        firstName: this.state.firstName,
        lastName: this.state.lastName,
        businessName: this.state.businessName,
        partnerURL: this.state.partnerURL,
        emailAddress: this.state.email,
        phoneNumber: this.state.phoneNumber,
        postalCode: this.state.postalCode,
        partnerCreditType: this.state.creditType,
        partnerCreditValue: this.state.creditValue,
        partnerCreditRecurring: this.state.creditTypeRecurring,
    };

    this.props.discounts.find(e => {
        if (e.title === this.state.discountSelected) {
            dataToBeSent.partnerDiscountId = e._id;
        }
    });

    console.log(dataToBeSent);

    if (!this.props.newPartner) {
        dataToBeSent.partnerId = this.props.partner._id;
    }

    Meteor.call(this.props.newPartner ? 'partners.add' : 'partners.update', dataToBeSent, (err, res) => {
       if (err) {
           console.log(err);
           this.props.popTheSnackbar({
               message: `There was an error ${this.props.newPartner ? 'adding' : 'updating'} the partner.`,
           });
       } else {
           this.props.popTheSnackbar({
               message: 'Partner ' + this.state.businessName + `${this.props.newPartner ? 'added' : 'updated'} sucessfully.`,
           });

           this.props.history.push('/partners');
       }
    });

    event.preventDefault();

    }

    handleClearPayout() {
      Meteor.call('users.partnerPayout', this.props.partner._id, err => {
          this.setState({
              payoutModalOpen: false,
          })
          if (err) {
              this.props.popTheSnackbar({
                  message: 'There was a problem clearing out referral balance'
              });
          } else {
              this.props.popTheSnackbar({
                  message: 'Cleared ' + this.props.partner.businessName + '\'s referral credits.'
              });
          }
      });
    }


  render() {
    if (!this.props.loading) {

      return (
        <div style={{ width: '100%' }}>
         <form
             style={{ width: "100%" }}
             ref={form => (this.form = form)}
             onSubmit={event => this.handleSubmit(event)}
         >
          <Grid container justify="center">
            <Grid item xs={12}>
              <Button
                onClick={() => this.props.history.push('/partners')}
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
                  <ChevronLeft style={{ marginRight: '4px' }} /> Partners
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
                  {this.props.newPartner ? 'Add' : 'Edit'} partner
              </Typography>
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
                  onClick={() => this.props.history.push('/partners')}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!this.state.hasFormChanged}
                  className="btn btn-primary"
                  raised
                  type="submit"
                  color="contrast"
                >
                  Save
                </Button>
              </div>
            </Grid>
          </Grid>

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
                                Basic details
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Paper elevation={2} className="paper-for-fields">
                                <Grid container>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            margin="normal"
                                            id="first_name"
                                            label="First name"
                                            name="firstName"
                                            fullWidth
                                            inputProps={{}}
                                            value={this.state.firstName}
                                            onChange={this.handleChange.bind(this, 'text', 'firstName')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            margin="normal"
                                            id="last_name"
                                            label="Last name"
                                            name="lastName"
                                            fullWidth
                                            inputProps={{}}
                                            value={this.state.lastName}
                                            onChange={this.handleChange.bind(this, 'text', 'lastName')}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            margin="normal"
                                            id="business_name"
                                            label="Business name"
                                            name="businessName"
                                            fullWidth
                                            inputProps={{}}
                                            defaultValue={this.state.businessName}
                                            onChange={this.handleChange.bind(this, 'text', 'businessName')}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            margin="normal"
                                            id="partner_url"
                                            label="Partner URL"
                                            name="partnerURL"
                                            fullWidth
                                            defaultValue={this.state.partnerURL}
                                            onChange={this.handleChange.bind(this, 'text', 'partnerURL')}
                                        />
                                        {this.state.partnerURL.length > 0 && (
                                            <Typography type="body1">
                                                {`URL Preview: https://www.vittle.ca/get-started/${slugify(this.state.partnerURL, { remove: /[*+~.(),'"!:@]/g, lower: true })}`}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>

                                <TextField
                                    margin="normal"
                                    id="email"
                                    label="Email"
                                    name="email"
                                    fullWidth
                                    inputProps={{}}
                                    defaultValue={this.state.email}
                                    onChange={this.handleChange.bind(this, 'text', 'email')}
                                />
                                <Grid container>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            margin="normal"
                                            id="phoneNumber"
                                            label="Phone number"
                                            name="phoneNumber"
                                            fullWidth
                                            inputProps={{}}
                                            defaultValue={this.state.phoneNumber}
                                            onChange={this.handleChange.bind(this, 'text', 'phoneNumber')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            margin="normal"
                                            id="postalCode"
                                            label="Postal code"
                                            name="postal_code"
                                            fullWidth
                                            inputProps={{}}
                                            value={this.state.postalCode}
                                            onChange={this.handleChange.bind(this, 'text', 'postalCode')}
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
                                Credit amount
                            </Typography>
                            <Typography type="body2">Amount credited to partner's referral balance after
                              a successful sign up.
                            </Typography>

                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Paper elevation={2} className="paper-for-fields">
                                <Grid container>

                                    <Grid item xs={6} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="select-credit-type"
                                            select
                                            label="Type"
                                            value={this.state.creditType}
                                            defaultValue={this.state.creditType}
                                            onChange={this.handleChange.bind(this, 'text', 'creditType')}
                                            SelectProps={{ native: true }}
                                        >
                                            <option key={1} value="Percentage">
                                                Percentage
                                            </option>
                                            <option key={2} value="Fixed amount">
                                                Fixed amount
                                            </option>
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={6} sm={6}>
                                        <TextField
                                            fullWidth
                                            value={this.state.creditValue}
                                            id="creditValue"
                                            name="creditValue"
                                            onChange={this.handleChange.bind(this, 'text', 'creditValue')}
                                            label="Amount"
                                            InputProps={{
                                                'aria-label': 'Description',
                                                type: 'number',
                                                startAdornment: <InputAdornment position={this.state.creditType == 'Percentage' ? 'end' : 'start'}>
                                                    {this.state.creditType == 'Percentage' ? '%' : '$'}
                                                </InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            key={123456}
                                            checked={this.state.creditTypeRecurring}
                                            onChange={() => {
                                                this.setState(previousState => ({
                                                    creditTypeRecurring: !previousState.creditTypeRecurring,
                                                    hasFormChanged: true,
                                                }));
                                            }}
                                            control={<Checkbox value={'recurring'} />}
                                            label={'Recurring credit'}
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
                                Discount
                            </Typography>
                            <Typography type="body2">Select the discount to be applied while signing up</Typography>

                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Paper elevation={2} className="paper-for-fields">
                                <Grid container>
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
                                            onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedTypes.bind(this)}
                                            onSuggestionsClearRequested={this.onSuggestionsClearRequestedTypes.bind(this)}
                                            onSuggestionSelected={this.onSuggestionSelectedTypes.bind(this)}
                                            getSuggestionValue={this.getSuggestionValueTypes.bind(this)}
                                            renderSuggestion={this.renderSuggestionTypes.bind(this)}
                                            renderSuggestionsContainer={this.renderSuggestionsContainerTypes.bind(this)}
                                            focusInputOnSuggestionClick={false}
                                            inputProps={{
                                                placeholder: 'Search',
                                                value: this.state.valueTypes,
                                                onChange: this.onChangeTypes.bind(this),
                                                className: 'auto type-autocomplete',
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        marginTop: '25px',
                                    }}
                                >
                                    {this.state.discountApplied != '' ? (
                                        _.filter(this.props.discounts, u => u._id == this.state.discountApplied).map((e, i) => (
                                            <Chip
                                                // avatar={<Avatar> </Avatar>}
                                                style={{ marginRight: '8px', marginBottom: '8px' }}
                                                label={`${e.title}`}
                                                key={i}
                                                onDelete={() => this.setState({ discountSelected: '', discountApplied: '' })}
                                            />
                                        ))
                                    ) : (
                                        <Chip className="chip--bordered" label="Discount code" />
                                    )}
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Divider light className="divider--space-x" />

            {!this.props.loading && !this.props.newPartner && (
                <Grid container justify="center" style={{ marginBottom: '50px' }}>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={12} sm={4}>
                                <Typography
                                    type="subheading"
                                    className="subheading font-medium"
                                >
                                    Payouts and requests
                                </Typography>
                                <Typography type="body2">
                                    Amount paid to partners and payout requests
                                </Typography>

                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <Paper elevation={2} className="paper-for-fields">
                                    <Grid container>
                                        {this.props.subscription && (
                                            <React.Fragment>
                                             <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '50px' }}>
                                                 <Typography type="subheading">Partner has ${this.props.subscription.referralCredits} credits</Typography>
                                                 <Button raised variant="contained" onClick={() => this.setState({ payoutModalOpen: true })} color="primary">Payout</Button>
                                             </Grid>
                                            {this.props.subscription.referralTransactions.length > 0 && (
                                                <Grid item>
                                                <Typography type="body2">Activity</Typography>
                                                </Grid>
                                            )}
                                            {this.props.subscription.referralTransactions && this.props.subscription.referralTransactions
                                                .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                .map(txn => {
                                                return (
                                                    <Grid item  xs={12} justify="space-between" style={{ display: 'flex', cursor: 'pointer' }}>
                                                        {txn.type === 'referral-sign-up' && (
                                                            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                                <Typography type="body2"><strong>{txn.name}</strong> signed up, but hasn't subscribed. <Typography type="body1" style={{ display: 'block', color: '#999' }}>{moment(txn.createdAt).format('MMMM Do, YYYY')}</Typography></Typography>
                                                                <Typography type="body2" className="text-secondary">${txn.pendingAmount} pending</Typography>
                                                            </div>
                                                        )}

                                                        {txn.type === 'referral-credit' && (
                                                            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                                <Typography type="body2"><strong>{txn.name}</strong> enjoyed Vittle! <Typography type="body1" style={{ display: 'block', color: '#999' }}>{moment(txn.createdAt).format('MMMM Do, YYYY')}</Typography></Typography>
                                                                <Typography type="body2"><strong>You got {txn.amount}</strong></Typography>
                                                            </div>
                                                        )}

                                                        {txn.type === 'referral-payout' && (
                                                            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                                <Typography type="body2">Partner payout of ${txn.referralPayoutAmount}</Typography>
                                                            </div>
                                                        )}
                                                    </Grid>
                                                )
                                            })}
                                            </React.Fragment>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Dialog
                        open={this.state.payoutModalOpen}
                        onClose={() => this.setState({ payoutModalOpen: false })}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">Clear ${this.props.subscription.referralCredits} from {this.props.partner.businessName}'s referral balance?</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                               Are you sure you want to clear {this.props.partner.businessName}'s partner credits?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ payoutModalOpen: false })} raised color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={() => this.handleClearPayout()} raised color="primary">
                                Payout
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            )}

            <Grid container style={{ marginBottom: '50px' }}>
                <Grid item xs={4} />
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
                            onClick={() => this.props.history.push('/partners')}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!this.state.hasFormChanged}
                            className="btn btn-primary"
                            raised
                            type="submit"
                            color="contrast"
                        >
                            Save
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </form>
        </div>
      );
    }
    return (<Loading />);

  }
}

PartnerEditor.defaultProps = {
  category: { title: '' },
};

PartnerEditor.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(PartnerEditor);
