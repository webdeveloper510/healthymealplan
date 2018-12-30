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
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import autoBind from 'react-autobind';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import { withStyles } from 'material-ui/styles';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
import Search from 'material-ui-icons/Search';
import moment from 'moment';

import validate from '../../../modules/validate';

import './MealPresetEditor.scss';

// const primary = teal[500];
const danger = red[700];

const styles = theme => ({
  cardSelected: {
    borderRadius: '5px',
    border: '2px lightgreen solid',
  },
});

class MealPresetEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      title: !this.props.newPreset ? this.props.preset.title : '',

      valuePlates: '',
      suggestionsPlates: [],

      weekPresetMonday:
        this.props.preset &&
          this.props.plates &&
          !this.props.newPreset &&
          this.props.preset.weekPresetMonday
          ? this.props.preset.weekPresetMonday
          : [],
      weekPresetTuesday:
        this.props.preset &&
          this.props.plates &&
          !this.props.newPreset &&
          this.props.preset.weekPresetTuesday
          ? this.props.preset.weekPresetTuesday
          : [],
      weekPresetWednesday:
        this.props.preset &&
          this.props.plates &&
          !this.props.newPreset &&
          this.props.preset.weekPresetWednesday
          ? this.props.preset.weekPresetWednesday
          : [],
      weekPresetThursday:
        this.props.preset &&
          this.props.plates &&
          !this.props.newPreset &&
          this.props.preset.weekPresetThursday
          ? this.props.preset.weekPresetThursday
          : [],
      weekPresetFriday:
        this.props.preset &&
          this.props.plates &&
          !this.props.newPreset &&
          this.props.preset.weekPresetFriday
          ? this.props.preset.weekPresetFriday
          : [],

      deleteDialogOpen: false,
      hasFormChanged: false,

      openBrowseAndAssignDialog: false,
      searchTextPlateDialog: '',
    };

    this.weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    autoBind(this);
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

  onChangePlates(event, { newValue }) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  }

  assignPlateToADay(mealId, lifestyleId, weekdayIndex, plateId, onDialog = false) {
    const selectedWeekdayPreset = this.state[`weekPreset${this.weekDays[weekdayIndex]}`];

    if (selectedWeekdayPreset.length) {
      const plateAssignedIndex = selectedWeekdayPreset.findIndex(e => e.lifestyleId == lifestyleId && e.mealId == mealId);
      const clonedWeekdayPreset = selectedWeekdayPreset.slice();

      if (plateAssignedIndex >= 0) {
        clonedWeekdayPreset[plateAssignedIndex] = {
          mealId,
          lifestyleId,
          plateId,
        };

        this.setState({
          hasFormChanged: true,
          [`weekPreset${this.weekDays[weekdayIndex]}`]: clonedWeekdayPreset,
        });

      } else {

        clonedWeekdayPreset.push({
          mealId,
          lifestyleId,
          plateId,
        });

        this.setState({
          hasFormChanged: true,
          [`weekPreset${this.weekDays[weekdayIndex]}`]: clonedWeekdayPreset,
        });
      }

      if (onDialog) {
        this.setState({
          openBrowseAndAssignDialog: false,
        });
      }

    } else {
      const clonedWeekdayPreset = selectedWeekdayPreset.slice();

      clonedWeekdayPreset.push({
        mealId,
        lifestyleId,
        plateId,
      });

      this.setState({
        hasFormChanged: true,
        [`weekPreset${this.weekDays[weekdayIndex]}`]: clonedWeekdayPreset,
      });
    }
  }

  onSuggestionSelectedPlates(
    mealId, lifestyleId, weekdayIndex,
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {

    // console.log(event);
    // console.log(suggestion);
    // console.log(mealId);
    // console.log(lifestyleId);
    // console.log(weekdayIndex);

    this.assignPlateToADay(mealId, lifestyleId, weekdayIndex, suggestion._id);
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.

  onSuggestionsFetchRequestedPlates({ value }) {
    this.setState({
      suggestionsPlates: this.getSuggestionsPlates(value),
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequestedPlates() {
    this.setState({
      suggestionsPlates: [],
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.

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
    const existingPreset = this.props.preset && this.props.preset._id;
    const methodToCall = existingPreset
      ? 'presets.update'
      : 'presets.insert';

    const preset = {
      title: document.querySelector('#title').value.trim(),
      weekPresetMonday: this.state.weekPresetMonday,
      weekPresetTuesday: this.state.weekPresetTuesday,
      weekPresetWednesday: this.state.weekPresetWednesday,
      weekPresetThursday: this.state.weekPresetThursday,
      weekPresetFriday: this.state.weekPresetFriday,
    };

    if (existingPreset) preset._id = existingPreset;

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

        const confirmation = existingPreset
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

  handlePresetMealDelete(lifestyleId, mealId, weekdayIndex) {
    console.log(lifestyleId);
    console.log(mealId);
    console.log(weekdayIndex);
    const clonedPreset = this.state[`weekPreset${this.weekDays[weekdayIndex]}`].slice();
    const presetIndexToDelete = clonedPreset.findIndex(e => e.lifestyleId == lifestyleId && e.mealId == mealId);
    console.log(presetIndexToDelete);

    clonedPreset.splice(presetIndexToDelete, 1);

    this.setState({
      hasFormChanged: true,
      [`weekPreset${this.weekDays[weekdayIndex]}`]: clonedPreset,
    });
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

  getPlateAvatar(plate) {
    if (plate.title) {
      return plate.title.charAt(0);
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

  compareLifestyles(a, b) {
    if (a.title > b.title) {
      return -1;
    }
    return 1;

  }

  renderPlateChip(lifestyleId, mealId, weekdayIndex) {

    const blankChip = <Chip className="chip--bordered" label="Plate" />;

    if (this.state[`weekPreset${this.weekDays[weekdayIndex]}`].length == 0) {
      return blankChip;
    }

    const selectedPreset = this.state[`weekPreset${this.weekDays[weekdayIndex]}`].find(e => e.lifestyleId == lifestyleId && e.mealId == mealId);
    // console.log(selectedPreset);
    if (selectedPreset) {
      const selectedPlateForWeekday = this.props.plates.find(e => e._id == selectedPreset.plateId);
      // console.log(selectedPlateForWeekday);

      if (!selectedPlateForWeekday) {
        return blankChip;
      }

      return (
        <Chip
          avatar={<Avatar>{selectedPlateForWeekday.title.charAt(0)}</Avatar>}
          style={{ marginRight: '8px', marginBottom: '8px' }}
          label={selectedPlateForWeekday.title}
          key={selectedPlateForWeekday._id}
          onDelete={() => this.handlePresetMealDelete(
            lifestyleId,
            mealId,
            weekdayIndex,
          )}
        />
      );
    }

    return blankChip;
  }

  openBrowseMealDialog(lifestyleId, lifestyleTitle, mealId, currentMealTitle, weekdayIndex) {
    this.setState({
      lifestyleSelectedId: lifestyleId,
      lifestyleSelectedText: lifestyleTitle,
      mealSelectedText: currentMealTitle,
      mealSelectedId: mealId,
      selectedWeekdayIndex: weekdayIndex,
    }, () => {
      this.setState({ openBrowseAndAssignDialog: true });
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
                {this.props.lifestyles.sort(this.compareLifestyles).map(lifestyle => (

                  <Paper style={{ padding: '2em', marginBottom: '2em' }}>
                    <Typography type="headline" style={{ marginBottom: '2em' }}>
                      {lifestyle.title}
                    </Typography>

                    {this.weekDays.map((weekday, weekdayIndex) => (
                      <div>
                        <Typography type="body2">
                          {weekday}
                        </Typography>
                        {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                          const currentMeal = this.props.meals.find(e => meal == e.title);

                          return (
                            <div>
                              <Typography type="body1">{meal}</Typography>

                              <div style={{ margin: '1em 0', position: 'relative' }}>
                                <Search className="autoinput-icon" />
                                <Autosuggest
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
                                    currentMeal._id,
                                    lifestyle._id,
                                    weekdayIndex,
                                  )}
                                  onSuggestionSelected={this.onSuggestionSelectedPlates.bind(
                                    this,
                                    currentMeal._id,
                                    lifestyle._id,
                                    weekdayIndex,
                                  )}
                                  getSuggestionValue={this.getSuggestionValuePlates.bind(this)}
                                  renderSuggestion={this.renderSuggestionPlates.bind(this)}
                                  renderSuggestionsContainer={this.renderSuggestionsContainerPlates.bind(
                                    this,
                                  )}
                                  focusInputOnSuggestionClick={false}
                                  inputProps={{
                                    id: `${weekday}${lifestyle._id}${currentMeal._id}`,
                                    placeholder: 'Search',
                                    value: this.state[`${weekday}${lifestyle._id}${currentMeal._id}`] || '',
                                    onChange: this.onChangePlates.bind(this),
                                    className: 'auto type-autocomplete',
                                  }}
                                />

                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                    marginTop: '25px',
                                  }}
                                >
                                  {this.renderPlateChip(lifestyle._id, currentMeal._id, weekdayIndex)}

                                  <Button
                                    size="small"
                                    onClick={() => this.openBrowseMealDialog(lifestyle._id, lifestyle.title, currentMeal._id, currentMeal.title, weekdayIndex)}
                                  >
                                    Browse
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
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

        <Dialog maxWidth="md" fullWidth fullScreen open={this.state.openBrowseAndAssignDialog} onClose={() => this.setState({ openBrowseAndAssignDialog: false })}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
            Assign main for {this.state.lifestyleSelectedText} {this.state.mealSelectedText} {this.weekDays[this.state.selectedWeekdayIndex]}
          </Typography>
          <DialogContent>

            <Grid container>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Search"
                  style={{ marginBottom: '1em' }}
                  value={this.state.searchTextPlateDialog}
                  onChange={e => this.setState({ searchTextPlateDialog: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container>

              {this.props.plates && this.props.plates.filter((p) => {
                if (this.state.searchTextPlateDialog) {
                  const searchString = new RegExp(this.state.searchTextPlateDialog);
                  return p.mealType == this.state.mealSelectedText && searchString.test(p.title.toLowerCase())
                } else {
                  return p.mealType == this.state.mealSelectedText
                }
              }).map((e, i) => (
                <Grid item xs={12} sm={6} md={4} lg={4} style={{ minWidth: '320px' }} key={i}>
                  <Card
                    className="plate-card-assign"
                    style={{ width: '100%' }}
                    onClick={() => this.assignPlateToADay(this.state.mealSelectedId, this.state.lifestyleSelectedId, this.state.selectedWeekdayIndex, e._id, true)}
                  >
                    <CardMedia
                      style={{ height: '300px' }}
                      image={e.imageUrl ? `${Meteor.settings.public.S3BucketDomain}${e.imageUrl}` : e.image ? e.image : 'https://via.placeholder.com/600x600?text=+'}
                      title={e.title}
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
                      <Button dense color="primary" onClick={() => this.props.history.push(`/plates/${e._id}/edit`)}>Edit</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openBrowseAndAssignDialog: false })} color="default">
              Cancel
            </Button>
            <Button stroked className="button--bordered button--bordered--accent" onClick={this.handleMealAssignment} color="primary">
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    );
  }
}

MealPresetEditor.propTypes = {
  loading: PropTypes.object,
  plates: PropTypes.array.isRequired,
  meals: PropTypes.array.isRequired,
  lifestyles: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(MealPresetEditor);
