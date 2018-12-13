/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';

import sortBy from 'lodash/sortBy';

import { Meteor } from 'meteor/meteor';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
// import Select from 'material-ui/Select';
// import Input, { InputLabel } from 'material-ui/Input';
// import { FormControl, FormHelperText } from 'material-ui/Form';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';
import moment from 'moment';

import validate from '../../../modules/validate';

// const primary = teal[500];
const danger = red[700];

const styles = theme => ({});

class MealPresetEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      title: !this.props.newPreset ? this.props.preset.title : '',

      // value: '', // Autosuggest
      valuePlates: '',
      // suggestions: [],
      suggestionsPlates: [],
      types:
        this.props.preset &&
          this.props.plates &&
          !this.props.newPreset
          ? sortBy(
            this.props.plates.filter(
              (e, i) => this.props.preset.types.indexOf(e._id) !== -1,
            ),
            'title',
          )
          : [],
      // subIngredients: this.props.ingredient ? sortBy(this.props.ingredient.subIngredients, 'title') : [],
      // selectedType: this.props.ingredient.typeId,
      deleteDialogOpen: false,
      hasFormChanged: false,
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
      },
      messages: {
        title: {
          required: 'Name required.',
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

  // Use your imagination to render suggestions.
  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onChangePlates(event, { newValue }) {
    this.setState({
      valuePlates: newValue,
    });
  }

  onSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    const clonedSubIngredients = this.state.subIngredients
      ? this.state.subIngredients.slice()
      : [];

    let isThere = false;

    if (clonedSubIngredients.length > 0) {
      isThere = clonedSubIngredients.filter(
        present => suggestion._id === present._id,
      );
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

  onSuggestionSelectedPlates(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
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

  onSuggestionsFetchRequestedPlates({ value }) {
    this.setState({
      suggestionsPlates: this.getSuggestionsPlates(value),
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  onSuggestionsClearRequestedPlates() {
    this.setState({
      suggestionsPlates: [],
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.plates.filter(
        plate =>
          plate.title.toLowerCase().slice(0, inputLength) === inputValue,
      );
  }

  getSuggestionsPlates(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.plates.filter(
        plate => plate.title.toLowerCase().slice(0, inputLength) === inputValue,
      );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  getSuggestionValuePlates(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, preset } = this.props;

    const exisitingCategory = preset && preset._id;
    localStorage.setItem('presetDeleted', preset.title);
    const presetDeletedMessage = `${localStorage.getItem(
      'presetDeleted',
    )} deleted from presets.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('presets.remove', exisitingCategory, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: presetDeletedMessage,
        });

        history.push('/meal-planner-presets');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingCategory = this.props.preset && this.props.preset._id;
    const methodToCall = existingCategory
      ? 'presets.update'
      : 'presets.insert';

    const preset = {
      title: document.querySelector('#title').value.trim(),
    };

    if (existingCategory) preset._id = existingCategory;

    console.log(preset);

    Meteor.call(methodToCall, preset, (error, presetId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        localStorage.setItem(
          'presetForSnackbar',
          preset.title || $('[name="title"]').val(),
        );

        const confirmation = existingCategory
          ? `${localStorage.getItem('presetForSnackbar')} preset updated.`
          : `${localStorage.getItem('presetForSnackbar')} preset added.`;
        // this.form.reset();

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/meal-planner-presets/${presetId}/edit`,
        });

        history.push('/meal-planner-presets');
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
          Delete {this.props.preset.title.toLowerCase()}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{' '}
            {this.props.preset.title.toLowerCase()}{' '}
            {this.props.preset && this.props.preset.typeMain
              ? `from ${this.props.preset.typeMain.title.toLowerCase()}?`
              : '?'}
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

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }

  renderSuggestionPlates(suggestion) {
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

  renderInputPlates(inputProps) {
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

  renderSuggestionsContainerPlates(options) {
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
      const avatarToReturn = this.props.allIngredients.find(
        el => el._id === subIngredient,
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  getPlateTitle(plate) {
    // console.log(type);

    if (plate.title) {
      return plate.title;
    }

    if (this.props.plates) {
      return this.props.plates.find(el => el._id === plate);
    }
  }

  getPlateAvatar(type) {
    if (plate.title) {
      return type.title.charAt(0);
    }

    if (this.props.plates) {
      const avatarToReturn = this.props.plates.find(
        el => el._id === plate._id,
      );
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
    const { preset, history, plates, meals, lifestyles } = this.props;

    return (
      <form
        style={{ width: '100%' }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push('/meal-planner-presets')}
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
                <ChevronLeft style={{ marginRight: '4px' }} /> Meal Presets
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
              {preset && preset._id ? `${preset.title}` : 'Add preset'}
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
                onClick={() => history.push('/meal-planner-presets')}
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

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Title
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    fullWidth
                    defaultValue={preset && preset.title}
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
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Presets
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {this.props.lifestyles.map(lifestyle => (

                  <Paper style={{ padding: '2em', marginBottom: '2em' }}>
                    <Typography type="headline" style={{ marginBottom: '2em' }}>
                      {lifestyle.title}
                    </Typography>

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(weekday => (
                      <div>
                        <Typography type="body2">
                          {weekday}
                        </Typography>
                        {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
                          const currentMeal = this.props.meals.find(e => meal == e.title);

                          return (
                            <div>
                              <Typography type="body1">{meal}</Typography>

                              <div style={{ margin: '1em 0', position: 'relative' }}>
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
                                  renderInputComponent={this.renderInputPlates.bind(this)}
                                  suggestions={this.state.suggestionsPlates}
                                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedPlates.bind(
                                    this,
                                  )}
                                  onSuggestionsClearRequested={this.onSuggestionsClearRequestedPlates.bind(
                                    this,
                                  )}
                                  onSuggestionSelected={this.onSuggestionSelectedPlates.bind(
                                    this,
                                  )}
                                  getSuggestionValue={this.getSuggestionValuePlates.bind(this)}
                                  renderSuggestion={this.renderSuggestionPlates.bind(this)}
                                  renderSuggestionsContainer={this.renderSuggestionsContainerPlates.bind(
                                    this,
                                  )}
                                  focusInputOnSuggestionClick={false}
                                  inputProps={{
                                    placeholder: 'Search',
                                    value: this.state.valuePlates,
                                    onChange: this.onChangePlates.bind(this),
                                    className: 'auto type-autocomplete',
                                  }}
                                />

                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    marginTop: '25px',
                                  }}
                                >
                                  {this.state.types.length ? (
                                    this.state.types.map((type, i) => (
                                      <Chip
                                        avatar={<Avatar> {this.getPlateAvatar(type)} </Avatar>}
                                        style={{ marginRight: '8px', marginBottom: '8px' }}
                                        label={type.title}
                                        key={i}
                                        onDelete={this.handlePlateChipDelete.bind(
                                          this,
                                          type,
                                        )}
                                      />
                                    ))
                                  ) : (
                                      <Chip className="chip--bordered" label="Plate" />
                                    )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                    ))}

                  </Paper>

                ))}

              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {this.props.newPreset ? (
                  ''
                ) : (
                    <Button
                      style={{ backgroundColor: danger, color: '#FFFFFF' }}
                      raised
                      onClick={
                        preset && preset._id
                          ? this.handleRemove.bind(this)
                          : () => this.props.history.push('/meal-planner-presets')
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
                    onClick={() => history.push('/categories')}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!this.state.hasFormChanged}
                    type="submit"
                    className="btn btn-primary"
                    raised
                    color="contrast"
                  >
                    Save
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {!this.props.newPreset && this.renderDeleteDialog()}
      </form>
    );
  }
}

MealPresetEditor.defaultProps = {
  presets: [],
};

MealPresetEditor.propTypes = {
  loading: PropTypes.object,
  plates: PropTypes.array.isRequired,
  meals: PropTypes.array.isRequired,
  lifestyles: PropTypes.array.isRequired,
  presets: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default MealPresetEditor;
