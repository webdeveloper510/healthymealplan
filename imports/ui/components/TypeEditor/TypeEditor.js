/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import ArrowBack from 'material-ui-icons/ArrowBack';
import $ from 'jquery';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';
import { teal, red } from 'material-ui/colors';

const primary = teal[500];
const danger = red[700];


const styles = theme => ({
  icon: {
    margin: theme.spacing.unit,
  },
});


class TypeEditor extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      deleteDialogOpen: false,

    };
  }


  componentDidMount() {
    const component = this;
    validate(component.form, {

      rules: {
        title: {
          required: true,
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

  handleRemoveActual() {
    const { popTheSnackbar, history, ingredientType } = this.props;

    const existingIngredientType = ingredientType && ingredientType._id;

    localStorage.setItem('ingredientTypeDeleted', ingredientType.title);

    const ingredientTypeDeletedMessage = `${localStorage.getItem('ingredientTypeDeleted')} deleted from types.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('ingredientTypes.remove', existingIngredientType, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: ingredientTypeDeletedMessage,
        });

        history.push('/types');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    // console.log('Reached handle submti');
    const { history, popTheSnackbar } = this.props;
    const existingIngredientType = this.props.ingredientType && this.props.ingredientType._id;
    const methodToCall = existingIngredientType ? 'ingredientTypes.update' : 'ingredientTypes.insert';

    const ingredientType = {
      title: document.querySelector('#title').value.trim(),
    };

    console.log(ingredientType);

    if (existingIngredientType) {
      ingredientType._id = existingIngredientType;
      localStorage.setItem('ingredientType', existingIngredientType.title);
    } else {
      localStorage.setItem('ingredientType', ingredientType.title);
    }


    Meteor.call(methodToCall, ingredientType, (error, ingredientTypeId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        const confirmation = existingIngredientType ? `${localStorage.getItem('ingredientType')} type updated` : `${localStorage.getItem('ingredientType')}type added.`;
        this.form.reset();

        popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/types/${ingredientTypeId}/edit`,
        });

        history.push('/types');
      }
    });
  }

  render() {
    const { ingredientType, history } = this.props;
    return (
      <form style={{ width: '100%' }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>

        <Grid container>
          <Grid item xs={6}>
            <Typography type="subheading">Unsaved Type</Typography>
          </Grid>

          <Grid item xs={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button>Cancel</Button>
              <Button raised style={{ backgroundColor: primary, margin: '1dp' }} color="contrast">Save</Button>
            </div>
          </Grid>
        </Grid>


        <Grid container justify="center">

          <Grid item xs={12}>
            <Link to="/types">
              <Typography type="subheading" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}><ArrowBack className={styles.icon} /> Types</Typography>
            </Link>

            <Typography type="title">Add new type</Typography>

          </Grid>
        </Grid>


        <Grid container justify="center">

          <Grid item xs={12} sm={6}>
            <Typography type="subheading">
              Type
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>

            <TextField
              id="title"
              label="Enter the name of the type"
              margin="normal"
              name="title"
              fullWidth
              defaultValue={ingredientType && ingredientType.title}
              ref={title => (this.title = title)}
            />
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={6}>
            {ingredientType ? (<Button raised onClick={this.handleRemove.bind(this)} style={{ backgroundColor: danger, color: '#FFFFFF' }}>Delete</Button>)
              : (<Button raised onClick={() => history.push('/types')}>Cancel</Button>)}
          </Grid>

          <Grid item xs={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button type="submit" raised style={{ backgroundColor: primary, margin: '1dp' }} color="contrast">
                {ingredientType && ingredientType._id ? 'Save Changes' : 'Add Type'}
              </Button>
            </div>
          </Grid>
        </Grid>

        {ingredientType ? (<Dialog open={this.state.deleteDialogOpen} onRequestClose={this.deleteDialogHandleRequestClose.bind(this)}>
          <Typography style={{ flex: '0 0 auto', margin: '0', padding: '24px 24px 20px 24px' }} className="title font-medium" type="title">
          Delete {ingredientType ? ingredientType.title.toLowerCase() : ''}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading">
            There may be ingredients associated with {ingredientType.title}. Are you sure you want to delete {ingredientType.title.toLowerCase()} ?
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
        </Dialog>) : ''}

      </form>);
  }
}


TypeEditor.propTypes = {
  ingredientType: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default TypeEditor;
