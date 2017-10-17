import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import $ from 'jquery';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Input from 'material-ui/Input';
import { teal, red } from 'material-ui/colors';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import IngredientTypesCollection from '../../../api/IngredientTypes/IngredientTypes';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import Loading from '../../components/Loading/Loading';

import Containers from 'meteor/utilities:react-list-container';

const ListContainer = Containers.ListContainer;

import TypesTable from './TypesTable';

const primary = teal[500];
const danger = red[700];

class Types extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: { SKU: -1 } },
      searchSelector: '',
      currentTabValue: 0,
    };
  }

  componentDidMount() { }

  handleRemove(ingredientId) {
    if (confirm('Are you sure? This is permanent!')) {
      Meteor.call('ingredientTypes.remove', ingredientId, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Type deleted!', 'success');
        }
      });
    }
  }

  searchByName() {
    // const searchValue = new RegExp(, 'i');
    // console.log(searchValue);

    this.setState({
      searchSelector: $('#search-type-text').val(),
    });

    // const query = {
    //   title: { $regex: searchValue },
    // };

    // if ($('#search-type-text').val() > 1) {
    //   this.setState({
    //     searchSelector: query,
    //   });

    //   return true;
    // }

    // this.setState({
    //   searchSelector: {},
    // });

    // return false;
  }

  clearSearchBox() {
    $('#search-type-text').val('');

    this.setState({
      searchSelector: {},
    });
  }

  sortByOption(field) {
    // const field = event.currentTarget.getAttribute('data-sortby');
    console.log(field);

    // This is a filler object that we are going to use set the state with.
    // Putting the sortBy field using index as objects can also be used as arrays.
    // the value of it would be 1 or -1 Asc or Desc

    const stateCopyOptions = this.state.options;
    const newOptions = {};


    // if user has selected to sort by that table column
    if (stateCopyOptions.sort.hasOwnProperty(`${field}`)) {
      if (stateCopyOptions.sort[field] === -1) {
        newOptions[field] = 1;
      } else if (stateCopyOptions.sort[field] === 1) {
        newOptions[field] = -1;
      }
    } else { // if user selects a new table column to sort
      newOptions[field] = 1;
    }

    this.setState({
      options: { sort: newOptions },
    });

    console.log('Data sorting changed');
    console.log(this.state.options);
  }


  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }

  render() {
    const { loading, ingredients, match, history } = this.props;

    return (!loading ? (
      <div>

        <Grid container className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top">

          <Grid container className="clearfix">
            <Grid item xs={6}>
              <Typography type="headline" gutterBottom className="headline pull-left" style={{ fontWeight: 500 }}>Types</Typography>
            </Grid>
            <Grid item xs={6}>
              <Button className="btn btn-primary" onClick={() => history.push('/types/new')} raised color="primary" style={{ float: 'right' }}>Add type</Button>
            </Grid>
          </Grid>

          <div style={{ marginTop: '25px' }}>
            <AppBar position="static" className="appbar--no-background appbar--no-shadow">
              <Tabs value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
                <Tab label="All" />
                {/* <Tab label="Item Two" />
                  <Tab label="Item Three" /> */}
              </Tabs>
            </AppBar>
          </div>

          <div style={{ width: '100%',
            background: '#FFF',
            borderTopRightRadius: '2px',
            borderTopLeftRadius: '2px',
            marginTop: '3em',
            padding: '16px 25px 1em',
            boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
            position: 'relative' }}
          >

            <SearchIcon
              className="autoinput-icon autoinput-icon--search"
              style={{ display: (this.state.searchSelector.length > 0) ? 'none' : 'block', top: '33%', right: '1.8em !important' }}
            />

            <ClearIcon
              className="autoinput-icon--clear"
              onClick={this.clearSearchBox.bind(this)}
              style={{ cursor: 'pointer',
                display: (this.state.searchSelector.length > 0) ? 'block' : 'none' }}
            />

            <Input
              className="input-box"
              style={{ width: '100%', position: 'relative' }}
              placeholder="Search types"
              onKeyUp={this.searchByName.bind(this)}
              inputProps={{
                id: 'search-type-text',
                'aria-label': 'Description',
              }}
            />
          </div>
          <ListContainer
            limit={5}
            collection={IngredientTypesCollection}
            publication="ingredientTypes"
            options={this.state.options}
            selector={{ $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } },
              { SKU: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }] }}
          >
            <TypesTable
              popTheSnackbar={this.props.popTheSnackbar}
              searchTerm={this.state.searchSelector}
              rowsLimit={this.state.rowsVisible}
              history={this.props.history}
              sortByOptions={this.sortByOption.bind(this)}
            />

          </ListContainer>

          {/* selector={{ $or: [{ title: new RegExp(this.state.searchSelector) }, { SKU: new RegExp(this.state.searchSelector) }] }} */}

          {/* <Grid container>
        <Grid item xs={12}>
          <Paper elevation={2} className="table-container">
            {ingredients.length ?
              <Table>
                <TableHead>
                <TableRow>
                    <TableCell padding="checkbox" style={{ width: '100px' }}><Checkbox /></TableCell>

                    <TableCell><Typography type="body2">Type</Typography></TableCell>
                  </TableRow>
              </TableHead>
                <TableBody>
                {ingredients.map(({ _id, title, createdAt }) => (
                    <TableRow hover key={_id} i>
                      <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '100px' }} padding="checkbox">
                        <Checkbox id={_id} onChange={this.rowSelected} />
                      </TableCell>
                      <TableCell onClick={() => history.push(`${match.url}/${_id}`)}><Typography type="subheading">{title}</Typography></TableCell> */}
          {/* <TableCell>
                        <Button
                          raised
                          color="primary"
                          onClick={() => history.push(`${match.url}/${_id}`)}
                        >View</Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          raised
                          onClick={() => handleRemove(_id)}
                        >Delete</Button>
                      </TableCell> */}
          {/* </TableRow> </TableBody>
              </Table> : <Alert bsStyle="warning">No Types yet!</Alert>}
          </Paper>
        </Grid>
      </Grid> */}
        </Grid>
      </div>
    ) : <Loading />);
  }
}

Types.propTypes = {
  loading: PropTypes.bool.isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('ingredientTypes');
  return {
    loading: !subscription.ready(),
    ingredients: IngredientTypesCollection.find().fetch(),
  };
}, Types);
