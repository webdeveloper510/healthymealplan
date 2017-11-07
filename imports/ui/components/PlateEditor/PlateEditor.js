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

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
// import Select from 'material-ui/Select';
// import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
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

import validate from '../../../modules/validate';

const danger = red[700];

const styles = theme => ({


});


class PlateEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plateImageSrc: '',
      value: '', // Autosuggest
      valueMealType: 'Breakfast',
      suggestions: [],
      subIngredients: this.props.ingredient ? _.sortBy(this.props.ingredient.subIngredients, 'title') : [],
      selectedType: this.props.ingredient.typeId,
      deleteDialogOpen: false,
      hasFormChanged: false,
      imageFieldChanged: false,
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

        subtitle: {
          required: true,
        },

        plateImage: {
          required: true,
        },

        type: {
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

  onFileLoad(e) {
    // console.log(e.target.files[0]);

    const fr = new FileReader();

    fr.onload = (el) => {
      this.setState({
        plateImageSrc: el.target.result,
        imageFieldChanged: true,
      });
    };

    fr.readAsDataURL(e.target.files[0]);
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

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
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

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, ingredient } = this.props;

    const existingPlate = ingredient && ingredient._id;
    localStorage.setItem('plateDeleted', ingredient.title);
    const plateDeletedMessage = `${localStorage.getItem('plateDeleted')} deleted from plates.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('plates.remove', existingPlate, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: ingredientDeletedMessage,
        });

        history.push('/plates');
      }
    });
  }


  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    const { history, popTheSnackbar } = this.props;
    const existingPlate = this.props.ingredient && this.props.ingredient._id;
    const methodToCall = existingPlate ? 'plates.update' : 'plates.insert';

    const plate = {
      title: document.querySelector('#title').value.trim(),
      subtitle: document.querySelector('#subtitle').value.trim(),
      mealType: this.state.valueMealType.trim(),
      ingredients: this.state.subIngredients || [],
    };

    if (existingPlate) ingredient._id = existingPlate;

    // const typeName = this.state.valueTypes.trim();
    // const typeActual = null;

    // if (typeName) {
    //   typeActual = this.props.ingredientTypes.find(el => el.title === typeName);
    // } else {
    //   typeActual = this.props.ingredientTypes.find(el => el.title === 'N/A');
    // }

    // ingredient.typeId = typeActual._id;

    console.log(plate);


    // console.log(files);

    // files.forEach((file, index) => {

    //   var upload = Documents.insert({        
    //     file: file,
    //     streams: 'dynamic',
    //     chunkSize: 'dynamic'
    //   }, false);

    //   upload.on('start', function (err, file) {
    //     console.log('Started');
    //     console.log(file);

    //   });

    //   upload.on('progress', function (progress, fileObject) {
    //     console.log(progress);
    //     console.log(fileObject);
    //   });

    //   upload.on('end', function(err, fileObj){
    //     console.log(fileObj);
    //     console.log('ended');
    //     console.log(upload);

    //     let data = {
    //       projectId: projectId,
    //       fileId: upload.config.fileId
    //     }

    //     Meteor.call('Projects.methods.addFileId', data, function(err, res){
    //       if(err){
    //         // console.log(err);
    //       }
    //     });

    //     Meteor.call('Documents.methods.addProjectId', data, function(err, res){
    //       if(err){
    //         // console.log(err);
    //       }
    //     });

    //   });//on upload end


    //   upload.start();


    // }); //forEach Files

    Meteor.call(methodToCall, plate, (error, plateId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        localStorage.setItem('plateForSnackbar', plate.title || $('[name="title"]').val());

        const confirmation = existingPlate ? (`${localStorage.getItem('plateForSnackbar')} plate updated.`)
          : `${localStorage.getItem('plateForSnackbar')} plate added.`;
        // this.form.reset();

        if (this.state.imageFieldChanged) {
          if (existingPlate) {

          } else {

          }
        }


        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/plates/${plateId}/edit`,
        });

        history.push('/plates');
      }
    });
  }

  uploadFile() {
    // files.forEach((file, index) => {
    //   const upload = Documents.insert({
    //     file,
    //     streams: 'dynamic',
    //     chunkSize: 'dynamic',
    //   }, false);

    //   upload.on('start', (err, file) => {
    //     console.log('Started');
    //     console.log(file);
    //   });

    //   upload.on('progress', (progress, fileObject) => {
    //     console.log(progress);
    //     console.log(fileObject);
    //   });

    //   upload.on('end', (err, fileObj) => {
    //     console.log(fileObj);
    //     console.log('ended');
    //     console.log(upload);

    //     const data = {
    //       projectId,
    //       fileId: upload.config.fileId,
    //     };

    //     Meteor.call('Projects.methods.addFileId', data, (err, res) => {
    //       if (err) {
    //         // console.log(err);
    //       }
    //     });

    //     Meteor.call('Documents.methods.addProjectId', data, (err, res) => {
    //       if (err) {
    //         // console.log(err);
    //       }
    //     });
    //   });// on upload end


    //   upload.start();
    // }); // forEach Files
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

  handleSubIngredientChipDelete(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.subIngredients.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      subIngredients: stateCopy,
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

  titleFieldChanged(e) {
    // console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged,
    });
  }

  handleMealTypeChange(event, value) {
    this.setState({
      valueMealType: event.target.value,
    });
  }

  render() {
    const { ingredient, history } = this.props;

    if (!ingredient) {
      return ('<h1>Loading</h1>');
    }

    return (
      <form style={{ width: '100%' }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Grid container justify="center">
          <Grid item xs={12}>

            <Button onClick={() => this.props.history.push('/plates')} className="button button-secondary button-secondary--top">
              <Typography type="subheading" className="subheading font-medium" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                <ChevronLeft style={{ marginRight: '4px' }} /> Plates</Typography>
            </Button>

          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={4}>
            <Typography type="headline" className="headline" style={{ fontWeight: 500 }}>{ingredient && ingredient._id ? `${ingredient.title}` : 'Add plate'}</Typography>

            {this.props.ingredient ?
              (<Typography type="body1" style={{ color: 'rgba(0, 0, 0, 0.54)' }} className="body1"> SKU {ingredient.SKU ? ingredient.SKU : ''} </Typography>)
              : '' }

          </Grid>
          <Grid item xs={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: '10px' }} onClick={() => history.push('/plates')}>Cancel</Button>
              <Button disabled={!this.state.hasFormChanged} className="btn btn-primary" raised type="submit" color="contrast">Save</Button>
            </div>
          </Grid>
        </Grid>


        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography type="subheading" className="subheading font-medium">
                Plate
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    margin="normal"
                    fullWidth
                    defaultValue={ingredient && ingredient.title}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged.bind(this)}
                  />

                  <TextField
                    margin="normal"
                    id="subtitle"
                    label="Subtitle"
                    name="subtitle"
                    fullWidth
                    defaultValue={ingredient && ingredient.subtitle}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged.bind(this)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography type="subheading" className="subheading font-medium">
                Meal type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    fullWidth
                    id="select-meal-type"
                    select
                    value={this.state.valueMealType}
                    label="Select a meal type"
                    onChange={this.handleMealTypeChange.bind(this)}
                    SelectProps={{ native: false }}
                    name="type"
                  >
                    <MenuItem key={2} value="Breakfast">Breakfast</MenuItem>
                    <MenuItem key={3} value="Lunch">Lunch</MenuItem>
                    <MenuItem key={4} value="Dinner">Dinner</MenuItem>

                  </TextField>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography type="subheading" className="subheading font-medium">
                  Image
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <input type="file" id="plateImage" name="plateImage" onChange={this.onFileLoad.bind(this)} />
                  <img style={{ marginTop: '50px', display: 'block' }} src={this.state.plateImageSrc} style={{ maxWidth: '100%' }} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: '75px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography type="subheading" className="subheading font-medium">
                Ingredients
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
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {
                  this.props.newPlate ? '' : (
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

PlateEditor.defaultProps = {
  ingredient: { title: '' },
};

PlateEditor.propTypes = {
  ingredient: PropTypes.object,
  ingredientTypes: PropTypes.array.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default PlateEditor;
