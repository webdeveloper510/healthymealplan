import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import { teal, red } from 'material-ui/colors';
import Containers from 'meteor/utilities:react-list-container';

const ListContainer = Containers.ListContainer;

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';


import $ from 'jquery';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import DeleteIcon from 'material-ui-icons/Delete';
import FilterListIcon from 'material-ui-icons/FilterList';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import IngredientsCollection from '../../../api/Ingredients/Ingredients';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';


import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import Loading from '../../components/Loading/Loading';
import IngredientsTable from './IngredientsTable';


const primary = teal[500];
const danger = red[700];

const handleRemove = (event, ingredientId) => {
  event.stopPropagation();

  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('ingredients.remove', ingredientId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Ingredient deleted!', 'success');
      }
    });
  }
};

class Ingredients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxesSelected: false,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: { title: 1 } },
      searchSelector: '',
      currentTabValue: 0,
    };
  }

  componentDidMount() {
  }

  searchByName() {
    // const searchValue = new RegExp(, 'i');
    // console.log(searchValue);


    this.setState({
      searchSelector: $('#search-ingredient-text').val(),
    });

    // const query = {
    //   title: { $regex: searchValue },
    // };

    // if ($('#search-ingredient-text').val() > 1) {
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
    $('#search-ingredient-text').val('');

    this.setState({
      searchSelector: {},
    });
  }

  sortByOption(event) {
    const field = event.currentTarget.getAttribute('data-sortby');

    // This is a filler object that we are going to use set the state with.
    // Putting the sortBy field using index as objects can also be used as arrays.
    // the value of it would be 1 or -1 Asc or Desc

    const options = {};
    options[field] = 1;

    this.setState({
      options: { sort: options },
    });
  }

  rowSelected(e) {
    const selectedRowId = e.target.parentNode.parentNode.getAttribute('id');

    $(`.${selectedRowId}`).toggleClass('row-selected');

    const currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber;

    this.setState({
      checkboxesSelected: true,
      selectedCheckboxesNumber: currentlySelectedCheckboxes + 1,
    });
  }

  renderTableHeadClasses() {
    const classes = `${this.state.checboxesSelected ? 'table-head--show' : 'table-head--hide'}`;
    return classes;
  }

  renderSubIngredientsNumber(subIngredient) {
    if (subIngredient && subIngredient.length > 1) {
      return `${subIngredient.length} sub-ingredients`;
    } else if (subIngredient && subIngredient.length == 1) {
      return `${subIngredient.length} sub-ingredient`;
    }

    return '';
  }


  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }


  render() {
    // console.log(this.props.ingredients);
    return (
      (!this.props.loading ? (
        <div>
          {/* <AuthenticatedSideNav history={history} /> */}


          <Grid container className="SideContent SideContent--spacer-2x--top SideContent--spacer-2x--horizontal">
            <Grid container className="clearfix">
              <Grid item xs={6}>
                <Typography type="headline" gutterBottom className="pull-left headline" style={{ fontWeight: 500 }} color="inherit">Ingredients</Typography>
              </Grid>
              <Grid item xs={6}>
                <Link to="/ingredients/new">
                  <Button className="btn btn-primary" raised color="primary" style={{ float: 'right' }}>Add ingredient</Button>
                </Link>
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
                placeholder="Search ingredients"
                onKeyUp={this.searchByName.bind(this)}
                inputProps={{
                  id: 'search-ingredient-text',
                  'aria-label': 'Description',
                }}
              />
            </div>
            <ListContainer
              limit={5}
              collection={IngredientsCollection}
              publication="ingredients"
              options={this.state.options}
              selector={{ $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } },
                { SKU: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }] }}
            >

              <IngredientsTable
                popTheSnackbar={this.props.popTheSnackbar}
                searchTerm={this.state.searchSelector}
                history={this.props.history}
                soryByOptions={this.sortByOption}
              />

            </ListContainer>


            {/* 
                joins={[{
                    localProperty: "typeId",
                    collection: IngredientTypes,
                    joinAs: "typeMain"
                },{
                  localProperty: "subIngredients",
                  collection: IngredientsCollection,
                  joinAs: "subs"
                }]}
            */}

            {/* <Grid container>
              <Grid item xs={12}>
                {this.props.ingredients.length ?
                  <Paper elevation={2} className="table-container">
                    <Table>
                      <TableHead>
                        <tr className={this.renderTableHeadClasses} />

                        <TableRow style={{ display: this.state.checkboxesSelected ? 'none' : 'block' }}>
                          <TableCell padding="checkbox" style={{ width: '100px' }}><Checkbox /></TableCell>
                          <TableCell padding="none"><Typography type="body2">Ingredient</Typography></TableCell>
                          <TableCell><Typography type="body2">Type</Typography></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.props.ingredients.map(({ _id, title, createdAt, updatedAt, subIngredients, typeMain }) => (
                          <TableRow hover className={_id} key={_id} >
                            <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '100px' }} padding="checkbox">
                              <Checkbox id={_id} onChange={this.rowSelected} />
                            </TableCell>
                            <TableCell style={{ paddingTop: '10px', paddingBottom: '10px' }} padding="none" onClick={() => this.props.history.push(`${this.props.match.url}/${_id}`)}>

                              <Typography type="subheading">{title}</Typography>
                              <Typography type="body1" style={{ color: 'rgba(0,0,0,.54)' }}>
                                {this.renderSubIngredientsNumber(subIngredients)}
                              </Typography>

                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                  : <Alert bsStyle="warning">No Ingredients yet!</Alert>} */}
            {/* </Grid>
            </Grid> */}
          </Grid>
        </div>
      ) : <Loading />)

    );
  }
}

// const Ingredients = ({ loading, ingredients, match, history }) => ;

Ingredients.propTypes = {
  loading: PropTypes.bool.isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.object),
  // ingredientTypes: PropTypes.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription.ready() || !subscription2.ready(),
    ingredients: IngredientsCollection.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, Ingredients);
