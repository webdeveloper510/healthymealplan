/* eslint-disable max-len, no-return-assign */

/* 
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch. 
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';


import Autosuggest from 'react-autosuggest';
import _ from 'lodash';

// import NumberFormat from 'react-number-format';

import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
// import IconButton from 'material-ui/IconButton';
// import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Radio, { RadioGroup } from 'material-ui/Radio';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import Button from 'material-ui/Button';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';

import Loading from '../../components/Loading/Loading';
import validate from '../../../modules/validate';

// const primary = teal[500];
const danger = red[700];

const styles = theme => ({


});

class RestrictionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valueRestriction: this.props.restriction && !this.props.newRestriction ? this.props.restriction.restrictionType : '', // radio
      valueTypes: '',
      valueCategories: '',

      suggestionsTypes: [],
      suggestionsCategories: [],

      types: (!this.props.newRestriction && this.props.restriction && this.props.ingredientTypes) ?
        _.sortBy(this.props.ingredientTypes.filter(e => this.props.restriction.types.indexOf(e._id) !== -1), 'title') : [],

        
      categories: (!this.props.newRestriction && this.props.restriction && this.props.categories) ?
        _.sortBy(this.props.categories.filter(e => this.props.restriction.categories.indexOf(e._id) !== -1), 'title') : [],

      deleteDialogOpen: false,
      hasFormChanged: false,

      valueDiscountOrExtra: (!this.props.newRestriction && this.props.restriction && (this.props.restriction.hasOwnProperty('discount') || this.props.restriction.hasOwnProperty('extra'))) ?
        (this.props.restriction.hasOwnProperty('discount') ? 'discount' : 'extra') : '',

      discountOrExtraSelected: !!((!this.props.newRestriction && this.props.restriction && (this.props.restriction.hasOwnProperty('discount') || this.props.restriction.hasOwnProperty('extra')))),

      discountType: (!this.props.newRestriction && this.props.restriction && this.props.restriction.discountOrExtraType) ? this.props.restriction.discountOrExtraType : 'Percentage',

      discountOrExtraAmount: (!this.props.newRestriction && this.props.restriction && (this.props.restriction.hasOwnProperty('discount') || this.props.restriction.hasOwnProperty('extra'))) ?
        (this.props.restriction.hasOwnProperty('discount') ? this.props.restriction.discount : this.props.restriction.extra) : '',
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
        restrictionType: {
          required: true,
        },
        discountOrExtraValue: {
          min: -100,
          max: 100,
        },

      },
      messages: {
        title: {
          required: 'Name required.',
        },
        restrictionType: {
          required: 'Restriction type required.',
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


  handleDiscountChange(event, value) {
    // console.log(event.target.value);

    this.setState({
      discountType: event.target.value,
    });
  }

  handleDiscountOrExtraValueChange(event, value) {
    this.setState({
      discountOrExtraAmount: event.target.value,
    });
  }

  handleDiscountOrExtraRadioChange(event, value) {
    let discountOrExtraSelected = true;

    if (value == 'none') {
      discountOrExtraSelected = false;
    }

    this.setState({
      discountOrExtraSelected,
      valueDiscountOrExtra: value,
    });
  }


  handleRestrictionTypeChange(event, value) {
    this.setState({
      valueRestriction: value,
    });
  }
  // Use your imagination to render suggestions.

  onChangeTypes(event, { newValue }) {
    this.setState({
      valueTypes: newValue,
    });
  }

  onChangeCategories(event, { newValue }) {
    this.setState({
      valueCategories: newValue,
    });
  }

  onSuggestionSelectedTypes(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    console.log(suggestion);

    const clonedTypes = this.state.types ? this.state.types.slice() : [];

    let isThere = false;

    if (clonedTypes.length > 0) {
      isThere = clonedTypes.filter(present => suggestion._id === present._id);
    }

    if (isThere != false) {
      return;
    }

    clonedTypes.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      hasFormChanged: true,
      types: clonedTypes,
    });
  }


  onSuggestionSelectedCategories(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    console.log(suggestion);

    const clonedCats = this.state.categories ? this.state.categories.slice() : [];

    let isThere = false;

    if (clonedCats.length > 0) {
      isThere = clonedCats.filter(present => suggestion._id === present._id);
    }

    if (isThere != false) {
      return;
    }

    clonedCats.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      hasFormChanged: true,
      categories: clonedCats,
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value),
    });
  }

  onSuggestionsFetchRequestedCategories({ value }) {
    this.setState({
      suggestionsCategories: this.getSuggestionsCategories(value),
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: [],
    });
  }

  onSuggestionsClearRequestedCategories() {
    this.setState({
      suggestionsCategories: [],
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestionsTypes(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.ingredientTypes.filter(type =>
      type.title.toLowerCase().slice(0, inputLength) === inputValue,
    );
  }

  getSuggestionsCategories(value) {
    // console.log(value);
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.categories.filter(category =>
      category.title.toLowerCase().slice(0, inputLength) === inputValue,
    );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValueTypes(suggestion) {
    return suggestion.title;
  }

  getSuggestionValueCategories(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, restriction } = this.props;

    const existingRestriction = restriction && restriction._id;
    localStorage.setItem('restrictionDeleted', restriction.title);
    const restrictionDeletedMessage = `${localStorage.getItem('restrictionDeleted')} deleted from restrictions.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('restrictions.remove', existingRestriction, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: restrictionDeletedMessage,
        });

        history.push('/restrictions');
      }
    });
  }


  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingRestriction = this.props.restriction && this.props.restriction._id;
    const methodToCall = existingRestriction ? 'restrictions.update' : 'restrictions.insert';

    const restriction = {
      title: document.querySelector('#title').value.trim(),
      types: this.state.types.map((e, i) => e._id),
      categories: this.state.categories.map((e, i) => e._id),
      restrictionType: this.state.valueRestriction,
    };


    if (this.state.discountOrExtraSelected) {
      const discountOrExtra = this.state.valueDiscountOrExtra;
      restriction[discountOrExtra] = this.state.discountOrExtraAmount;
      restriction.discountOrExtraType = this.state.discountType;
    }

    if (existingRestriction) restriction._id = existingRestriction;

    console.log(restriction);


    // const typeName = this.state.valueTypes.trim();
    // let typeActual = null;

    // if (typeName) {
    //   typeActual = this.props.ingredientTypes.find(el => el.title === typeName);
    // } else {
    //   typeActual = this.props.ingredientTypes.find(el => el.title === 'N/A');
    // }

    // ingredient.typeId = typeActual._id;

    Meteor.call(methodToCall, restriction, (error, restrictionId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        localStorage.setItem('restrictionForSnackbar', restriction.title || $('[name="title"]').val());

        const confirmation = existingRestriction ? (`${localStorage.getItem('restrictionForSnackbar')} restriction updated.`)
          : `${localStorage.getItem('restrictionForSnackbar')} restriction added.`;
        // this.form.reset();

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/restrictions/${restrictionId}/edit`,
        });

        history.push('/restrictions');
      }
    });
  }

  renderDeleteDialog() {
    return (
      this.props.restriction ? (
        <Dialog open={this.state.deleteDialogOpen} onRequestClose={this.deleteDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
        Delete {this.props.restriction && this.props.restriction.title.toLowerCase()}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading">
          Are you sure you want to delete {this.props.restriction && this.props.restriction.title.toLowerCase()} { (this.props.restriction && this.props.restriction.typeMain) ?
                `from ${this.props.restriction.typeMain.title.toLowerCase()}?` : '?'}
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
        </Dialog>) : ''
    );
  }

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }

  renderInput(inputProps) {
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

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  handleTypeChipDelete(type) {
    const stateCopy = this.state.types.slice();

    stateCopy.splice(stateCopy.indexOf(type), 1);

    this.setState({
      types: stateCopy,
      hasFormChanged: true,
    });
  }

  handleCategoryChipDelete(category) {
    console.log(category);

    const stateCopy = this.state.categories.slice();

    stateCopy.splice(stateCopy.indexOf(category), 1);

    this.setState({
      categories: stateCopy,
      hasFormChanged: true,
    });
  }


  getSubIngredientTitle(subIngredient) {
    // console.log(subIngredient);

    if (subIngredient.title) {
      return subIngredient.title;
    }

    if (this.props.allIngredients) {
      return this.props.allIngredients.find(el => el._id === subIngredient);
    }
  }

  getSubIngredientAvatar(subIngredient) {
    if (subIngredient.title) {
      return subIngredient.title.charAt(0);
    }

    if (this.props.allIngredients) {
      const avatarToReturn = this.props.allIngredients.find(el => el._id === subIngredient);
      return avatarToReturn.title.charAt(0);
    }
  }


  getTypeTitle(type) {
    // console.log(type);

    if (type.title) {
      return type.title;
    }

    if (this.props.ingredientTypes) {
      return this.props.ingredientTypes.find(el => el._id === type);
    }
  }

  getCategoryTitle(category) {
    // console.log(category);

    if (category.title) {
      return category.title;
    }

    if (this.props.categories) {
      return this.props.categories.find(el => el._id === category);
    }
  }

  getTypeAvatar(type) {
    if (type.title) {
      return type.title.charAt(0);
    }

    if (this.props.ingredientTypes) {
      const avatarToReturn = this.props.ingredientTypes.find(el => el._id === type._id);
      return avatarToReturn.title.charAt(0);
    }
  }

  getCategoryAvatar(category) {
    if (category.title) {
      return category.title.charAt(0);
    }

    if (this.props.categories) {
      const avatarToReturn = this.props.categories.find(el => el._id === category._id);
      return avatarToReturn.title.charAt(0);
    }
  }

  titleFieldChanged(e) {
    // console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged,
    });
  }

  render() {
    // console.log(this.props);
    const { restriction, categories, ingredientTypes, history, loading } = this.props;

    return (

      !loading ? (

        <form style={{ width: '100%' }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
          <Grid container justify="center">
            <Grid item xs={12}>

              <Button onClick={() => this.props.history.push('/restrictions')} className="button button-secondary button-secondary--top">
                <Typography type="subheading" className="subheading font-medium" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                  <ChevronLeft style={{ marginRight: '4px' }} /> Restrictions</Typography>
              </Button>

            </Grid>
          </Grid>

          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={4}>
              <Typography type="headline" className="headline" style={{ fontWeight: 500 }}>{restriction && restriction._id ? `${restriction.title}` : 'Add restriction'}</Typography>

              {this.props.restriction ?
                (<Typography type="body1" style={{ color: 'rgba(0, 0, 0, 0.54)' }} className="body1">{restriction.SKU ? (restriction.SKU) : ''} </Typography>)
                : '' }

            </Grid>
            <Grid item xs={8}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button style={{ marginRight: '10px' }} onClick={() => history.push('/restrictions')}>Cancel</Button>
                <Button disabled={!this.state.hasFormChanged} className="btn btn-primary" raised type="submit" color="contrast">Save</Button>
              </div>
            </Grid>
          </Grid>


          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography type="subheading" className="subheading font-medium">
              Restriction
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    <TextField
                      id="title"
                      label="Name"
                      name="title"
                      fullWidth
                      defaultValue={restriction && restriction.title}
                      ref={title => (this.title = title)}
                      inputProps={{}}
                      onChange={this.titleFieldChanged.bind(this)}
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
                  <Typography type="subheading" className="subheading font-medium">
                  Discounts & Extras
                  </Typography>
                  <Typography gutterBottom>
                  Applying a discount or extra will affect the total amount of a lifestyle's price plan if ingredients are restricted.
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
                            value={this.state.valueDiscountOrExtra}
                            onChange={this.handleDiscountOrExtraRadioChange.bind(this)}
                            style={{ flexDirection: 'row' }}
                          >
                            <FormControlLabel className="radiobuttonlabel" value="none" control={<Radio checked={this.state.valueDiscountOrExtra === 'none'} />} label="None" />
                            <FormControlLabel className="radiobuttonlabel" value="discount" control={<Radio checked={this.state.valueDiscountOrExtra === 'discount'} />} label="Discount" />
                            <FormControlLabel className="radiobuttonlabel" value="extra" control={<Radio checked={this.state.valueDiscountOrExtra === 'extra'} />} label="Extra" />

                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <TextField
                          disabled={!this.state.discountOrExtraSelected}
                          fullWidth
                          id="select-discount-type"
                          select
                          label="Type"
                          value={this.state.discountType ? this.state.discountType : ''}
                          onChange={this.handleDiscountChange.bind(this)}
                          SelectProps={{ native: false }}
                        >
                          <MenuItem key={1} value="Percentage">Percentage</MenuItem>
                          <MenuItem key={2} value="Fixed amount">Fixed amount</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={6} sm={6}>

                        <TextField
                          fullWidth
                          value={this.state.discountOrExtraAmount}
                          id="discountOrExtraValue"
                          name="discountOrExtraValue"
                          disabled={!this.state.discountOrExtraSelected}
                          onChange={this.handleDiscountOrExtraValueChange.bind(this)}
                          label="Amount"

                          inputProps={{
                            'aria-label': 'Description',
                            type: 'number',
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
                  <Typography type="subheading" className="subheading font-medium">
                  Category
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                    <FormControl component="fieldset">
                      <RadioGroup
                        aria-label="RestrictionType"
                        name="restrictionType"
                        value={this.state.valueRestriction}
                        style={{ flexDirection: 'row' }}
                        onChange={this.handleRestrictionTypeChange.bind(this)}
                      >
                        <FormControlLabel className="radiobuttonlabel" value="allergy" control={<Radio />} label="Allergy" />
                        <FormControlLabel className="radiobuttonlabel" value="dietary" control={<Radio />} label="Dietary" />
                        <FormControlLabel className="radiobuttonlabel" value="religious" control={<Radio />} label="Religious" />
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
                  <Typography type="subheading" className="subheading font-medium">
                Type
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">


                    <Search className="autoinput-icon" />
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
                      renderInputComponent={this.renderInput.bind(this)}
                      suggestions={this.state.suggestionsTypes}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedTypes.bind(this)}
                      onSuggestionsClearRequested={this.onSuggestionsClearRequestedTypes.bind(this)}
                      onSuggestionSelected={this.onSuggestionSelectedTypes.bind(this)}
                      getSuggestionValue={this.getSuggestionValueTypes.bind(this)}
                      renderSuggestion={this.renderSuggestion.bind(this)}
                      renderSuggestionsContainer={this.renderSuggestionsContainer.bind(this)}
                      focusInputOnSuggestionClick={false}

                      inputProps={{
                        placeholder: 'Search',
                        value: this.state.valueTypes,
                        onChange: this.onChangeTypes.bind(this),
                        className: 'auto type-autocomplete',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: '25px' }}>
                      {this.state.types.length ? this.state.types.map((type, i) => (

                        <Chip
                          avatar={<Avatar> {this.getTypeAvatar(type)} </Avatar>}
                          style={{ marginRight: '8px', marginBottom: '8px' }}
                          label={type.title}
                          key={i}
                          onRequestDelete={this.handleTypeChipDelete.bind(this, type)}
                        />)) : ''}
                    </div>

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
                  <Typography type="subheading" className="subheading font-medium">
                Category
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">


                    <Search className="autoinput-icon" />
                    <Autosuggest
                      id="2"
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
                      renderInputComponent={this.renderInput.bind(this)}
                      suggestions={this.state.suggestionsCategories}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedCategories.bind(this)}
                      onSuggestionsClearRequested={this.onSuggestionsClearRequestedCategories.bind(this)}
                      onSuggestionSelected={this.onSuggestionSelectedCategories.bind(this)}
                      getSuggestionValue={this.getSuggestionValueCategories.bind(this)}
                      renderSuggestion={this.renderSuggestion.bind(this)}
                      renderSuggestionsContainer={this.renderSuggestionsContainer.bind(this)}
                      focusInputOnSuggestionClick={false}

                      inputProps={{
                        placeholder: 'Search',
                        value: this.state.valueCategories,
                        onChange: this.onChangeCategories.bind(this),
                        className: 'auto type-autocomplete',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: '25px' }}>
                      {this.state.categories.length ? this.state.categories.map((category, i) => (

                        <Chip
                          avatar={<Avatar> {this.getCategoryAvatar(category)} </Avatar>}
                          style={{ marginRight: '8px', marginBottom: '8px' }}
                          label={category.title}
                          key={i}
                          onRequestDelete={this.handleCategoryChipDelete.bind(this, category)}
                        />)) : ''}
                    </div>

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
                    this.props.newRestriction ? '' : (
                      <Button
                        style={{ backgroundColor: danger, color: '#FFFFFF' }}
                        raised
                        onClick={restriction && restriction._id ? this.handleRemove.bind(this) : () => this.props.history.push('/restrictions')}
                      >
                    Delete
                      </Button>
                    )
                  }
                </Grid>

                <Grid item xs={8}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button style={{ marginRight: '10px' }} onClick={() => history.push('/ingredients')}>Cancel</Button>
                    <Button disabled={!this.state.hasFormChanged} type="submit" className="btn btn-primary" raised color="contrast">
                   Save
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {this.renderDeleteDialog()}

        </form>) : (<Loading />)
    );
  }
}

RestrictionEditor.defaultProps = {
  restriction: { title: '' },
};

RestrictionEditor.propTypes = {
  restriction: PropTypes.object,
  newRestriction: PropTypes.bool.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default RestrictionEditor;
