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
  componentDidMount() {
    const component = this;
    validate(component.form, {

      rules: {
        title: {
          required: true,
        },

      },
      messages: {
        title: {
          required: 'Need a title in here.',
        },

      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingIngredientType = this.props.ingredientType && this.props.ingredientType._id;
    const methodToCall = existingIngredientType ? 'ingredientTypes.update' : 'ingredientTypes.insert';

    const ingredientType = {
      title: document.querySelector('#title').value.trim(),
    };

    if (existingIngredientType) ingredientType._id = existingIngredientType;

    Meteor.call(methodToCall, ingredientType, (error, ingredientTypeId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingIngredientType ? 'Type updated!' : 'Type added!';
        // this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/types/${ingredientTypeId}`);
      }
    });
  }

  render() {
    const { ingredientType } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Grid container justify="center">
          <Grid item xs={10}>
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
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={12}>
                <Link to="/types">
                  <Typography type="subheading" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}><ArrowBack className={styles.icon} /> Types</Typography>
                </Link>

                <Typography type="title">Add new type</Typography>

              </Grid>

            </Grid>
          </Grid>
        </Grid>


        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Typography type="subheading">
              Type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <ControlLabel>Title</ControlLabel>
            <input
              type="text"
              className="form-control"
              name="title"
              
              placeholder="Oh, The Places You'll Go!"
            /> */}
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
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={6}>
                <Button type="submit" raised >
                  Cancel
                </Button>
              </Grid>

              <Grid item xs={6}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Button type="submit" raised style={{ backgroundColor: primary, margin: '1dp' }} color="contrast">
                    {ingredientType && ingredientType._id ? 'Save Changes' : 'Add Type'}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>


      </form>);
  }
}

TypeEditor.defaultProps = {
  ingredientType: { title: '' },
};

TypeEditor.propTypes = {
  ingredientType: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default TypeEditor;
