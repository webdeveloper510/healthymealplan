/* eslint-disable max-len, no-return-assign */

/* 
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch. 
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Autosuggest from 'react-autosuggest';

import _ from 'lodash';

import { Meteor } from 'meteor/meteor';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';


import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import { teal, red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';


import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

const primary = teal[500];
const danger = red[700];

const styles = theme => ({


});


class CategoryEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '', // Autosuggest
      valueTypes: '',
      suggestions: [],
      suggestionsTypes: [],
      types: this.props.ingredient && this.props.ingredientTypes ? _.sortBy(this.props.ingredientTypes.filter((e, i) => this.props.ingredient.types.indexOf(e._id) !== -1), 'title') : [],
      subIngredients: this.props.ingredient ? _.sortBy(this.props.ingredient.subIngredients, 'title') : [],
      selectedType: this.props.ingredient.typeId,
      deleteDialogOpen: false,
      hasFormChanged: false,
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
      messages: {
        title: {
          required: 'Name required.',
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


  // Use your imagination to render suggestions.
  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onChangeTypes(event, { newValue }) {
    this.setState({
      valueTypes: newValue,
    });
  }

  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    const clonedSubIngredients = this.state.subIngredients ? this.state.subIngredients.slice() : [];

    let isThere = false;

    if (clonedSubIngredients.length > 0) {
      isThere = clonedSubIngredients.filter(present => suggestion._id === present._id);
    }

    if (isThere != false) {
      return;
    }

    clonedSubIngredients.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      subIngredients: clonedSubIngredients,
      hasFormChanged: true,
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

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  }

  onSuggestionsFetchRequestedTypes({ value }) {
    this.setState({
      suggestionsTypes: this.getSuggestionsTypes(value),
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  onSuggestionsClearRequestedTypes() {
    this.setState({
      suggestionsTypes: [],
    });
  }


  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.potentialSubIngredients.filter(ingredient =>
      ingredient.title.toLowerCase().slice(0, inputLength) === inputValue,
    );
  }

  getSuggestionsTypes(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.ingredientTypes.filter(type =>
      type.title.toLowerCase().slice(0, inputLength) === inputValue,
    );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  getSuggestionValueTypes(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, ingredient } = this.props;

    const existingIngredient = ingredient && ingredient._id;
    localStorage.setItem('categoryDeleted', ingredient.title);
    const categoryDeletedMessage = `${localStorage.getItem('categoryDeleted')} deleted from categories.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('categories.remove', existingIngredient, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: categoryDeletedMessage,
        });

        history.push('/categories');
      }
    });
  }


  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingCategory = this.props.ingredient && this.props.ingredient._id;
    const methodToCall = existingCategory ? 'categories.update' : 'categories.insert';

    const category = {
      title: document.querySelector('#title').value.trim(),
      // subIngredients: this.state.subIngredients || [],
      types: this.state.types.map((e, i) => e._id),
    };

    if (existingCategory) category._id = existingCategory;

    console.log(category);

    // const typeName = this.state.valueTypes.trim();
    // let typeActual = null;

    // if (typeName) {
    //   typeActual = this.props.ingredientTypes.find(el => el.title === typeName);
    // } else {
    //   typeActual = this.props.ingredientTypes.find(el => el.title === 'N/A');
    // }

    // ingredient.typeId = typeActual._id;

    Meteor.call(methodToCall, category, (error, categoryId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        localStorage.setItem('categoryForSnackbar', category.title || $('[name="title"]').val());

        const confirmation = existingCategory ? (`${localStorage.getItem('ingredientForSnackbar')} category updated.`)
          : `${localStorage.getItem('categoryForSnackbar')} category added.`;
        // this.form.reset();

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/categories/${categoryId}/edit`,
        });

        history.push('/categories');
      }
    });
  }

  renderDeleteDialog() {
    return (
      <Dialog open={this.state.deleteDialogOpen} onRequestClose={this.deleteDialogHandleRequestClose.bind(this)}>
        <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
        Delete {this.props.ingredient.title.toLowerCase()}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
          Are you sure you want to delete {this.props.ingredient.title.toLowerCase()} { (this.props.ingredient && this.props.ingredient.typeMain) ?
              `from ${this.props.ingredient.typeMain.title.toLowerCase()}?` : '?'}
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
      </Dialog>
    );
  }

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }


  renderSuggestionTypes(suggestion) {
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

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
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

  handleTypeChange(event, name) {
    console.log(`Type changed ${event.target.value}`);
    this.setState({ selectedType: event.target.value, hasFormChanged: true });
  }

  handleSubIngredientChipDelete(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.subIngredients.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      subIngredients: stateCopy,
      hasFormChanged: true,
    });
  }

  handleTypeChipDelete(type) {
    console.log(type);

    const stateCopy = this.state.types.slice();

    stateCopy.splice(stateCopy.indexOf(type), 1);

    this.setState({
      types: stateCopy,
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

  getTypeAvatar(type) {
    if (type.title) {
      return type.title.charAt(0);
    }

    if (this.props.ingredientTypes) {
      const avatarToReturn = this.props.ingredientTypes.find(el => el._id === type._id);
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
    console.log(this.props);
    const { ingredient, ingredientTypes, history } = this.props;

    if (!ingredient || !ingredientTypes) {
      return ('<h1>Loading</h1>');
    }

    return (
      <form style={{ width: '100%' }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Grid container justify="center">
          <Grid item xs={12}>

            <Button onClick={() => this.props.history.push('/categories')} className="button button-secondary button-secondary--top">
              <Typography type="subheading" className="subheading font-medium" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                <ChevronLeft style={{ marginRight: '4px' }} /> Categories</Typography>
            </Button>

          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={4}>
            <Typography type="headline" className="headline" style={{ fontWeight: 500 }}>{ingredient && ingredient._id ? `${ingredient.title}` : 'Add category'}</Typography>

            {this.props.ingredient ?
              (<Typography type="body1" style={{ color: 'rgba(0, 0, 0, 0.54)' }} className="body1"> SKU {ingredient.SKU ? ingredient.SKU : ''} </Typography>)
              : '' }

          </Grid>
          <Grid item xs={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: '10px' }} onClick={() => history.push('/ingredients')}>Cancel</Button>
              <Button disabled={!this.state.hasFormChanged} className="btn btn-primary" raised type="submit" color="contrast">Save</Button>
            </div>
          </Grid>
        </Grid>


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
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    fullWidth
                    defaultValue={ingredient && ingredient.title}
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
                Type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">

                  {/* <FormControl style={{ width: '100%' }}>
                    <Select
                      value={this.state.selectedType}
                      onChange={this.handleTypeChange.bind(this)}
                      input={<Input id="type" />}
                      native
                    >

                      {ingredientTypes && ingredientTypes.map(ingredientType => (
                        <option key={ingredientType._id} value={ingredientType._id}>
                          {ingredientType.title}
                        </option>
                      ))}

                    </Select>
                  </FormControl> */}
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

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: '25px' }}>
                    {this.state.types.length ? this.state.types.map((type, i) => (

                      <Chip
                        avatar={<Avatar> {this.getTypeAvatar(type)} </Avatar>}
                        style={{ marginRight: '8px', marginBottom: '8px' }}
                        label={type.title}
                        key={i}
                        onRequestDelete={this.handleTypeChipDelete.bind(this, type)}
                      />)) : <Chip className="chip--bordered" label="Type" />}
                  </div>

                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: '75px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography type="subheading" className="subheading font-medium">
                Sub-ingredients
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
                        marginBottom: '2em',
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
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                    onSuggestionSelected={this.onSuggestionSelected.bind(this)}
                    getSuggestionValue={this.getSuggestionValue.bind(this)}
                    renderSuggestion={this.renderSuggestion.bind(this)}
                    renderSuggestionsContainer={this.renderSuggestionsContainer.bind(this)}

                    focusInputOnSuggestionClick={false}

                    inputProps={{
                      placeholder: 'Search',
                      value: this.state.value,
                      onChange: this.onChange.bind(this),
                      className: 'autoinput',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    {this.state.subIngredients ? this.state.subIngredients.map((subIngredient, i) => (
                      <Chip
                        avatar={<Avatar> {this.getSubIngredientAvatar(subIngredient)} </Avatar>}
                        style={{ marginRight: '8px', marginBottom: '8px' }}
                        label={this.getSubIngredientTitle(subIngredient)}
                        key={i}
                        onRequestDelete={this.handleSubIngredientChipDelete.bind(this, subIngredient)}
                      />)) : <Chip className="chip--bordered" label="Sub-ingredient" />}
                  </div>

                </Paper>
              </Grid>

            </Grid>
          </Grid>
        </Grid> */}

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {
                  this.props.newIngredient ? '' : (
                    <Button
                      style={{ backgroundColor: danger, color: '#FFFFFF' }}
                      raised
                      onClick={ingredient && ingredient._id ? this.handleRemove.bind(this) : () => this.props.history.push('/ingredients')}
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
      </form>);
  }
}

CategoryEditor.defaultProps = {
  ingredient: { title: '' },
};

CategoryEditor.propTypes = {
  ingredient: PropTypes.object,
  ingredientTypes: PropTypes.array.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default CategoryEditor;
