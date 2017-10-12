import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from 'material-ui/Table';
import $ from 'jquery';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';



import { createContainer } from 'meteor/react-meteor-data';
import IngredientsCollection from '../../../api/Ingredients/Ingredients';
import Loading from '../../components/Loading/Loading';

class IngredientsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxesSelected: false,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      rowsVisible: 5,
      rowsMenuOpen: false,
      anchorEl: null
    };
  }

  renderSubIngredientsNumber(subIngredient) {
    if (subIngredient && subIngredient.length > 1) {
      return `${subIngredient.length} sub-ingredients`;
    } else if (subIngredient && subIngredient.length == 1) {
      return `${subIngredient.length} sub-ingredient`;
    }

    return '';
  }

  renderType(type) {
    console.log(type);
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

  selectAllRows() {
    $('.row-checkbox').prop('checked', 'checked');
  }


  handleClick(event){
    this.setState({ rowsMenuopen: true, anchorEl: event.currentTarget});
  }

  handleRequestClose(val){
    this.setState({ rowsMenuopen: false });

    console.log(val)
  }

  renderNoResults(count){
    if(count == 0){
      return (
        <p style={{ padding: "25px" }} className="subheading">No ingredient found for &lsquo;<span className="font-medium">{this.props.searchTerm}</span>&rsquo;</p>
      )
    }
  }


  render() {
    console.log(this.props);
    return (
      <Paper elevation={2} className="table-container">
        <p> {this.state.checkboxesSelected > 1 ? (`${this.state.selectedCheckboxes} items selected`) : ''}</p>
        <Table>
          {this.props.count > 0 ? 
            (<TableHead>
              <TableRow>

                <TableCell padding="checkbox" style={{ width: '80px' }}><Checkbox onClick={this.selectAllRows.bind(this)} /></TableCell>
                <TableCell padding="none"><Typography className="body2" type="body2">SKU</Typography></TableCell>

                <TableCell padding="none"><Typography className="body2" type="body2">Ingredient</Typography></TableCell>
                <TableCell><Typography className="body2" type="body2">Type</Typography></TableCell>
              </TableRow>
            </TableHead>) 
            : ''
          }
          <TableBody>
            {
              this.props.results.map((e, i) => (
                <TableRow hover className={e._id} key={e._id}>
                  <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '80px' }} padding="checkbox">
                    <Checkbox className="row-checkbox" id={e._id} onChange={this.rowSelected.bind(this)} />
                  </TableCell>
                  <TableCell padding="none" onClick={() => this.props.history.push(`ingredients/${e._id}/edit`)}>
                    <Typography className="body2" type="body2">{e.SKU ? e.SKU : ''}</Typography>
                  </TableCell>

                  <TableCell style={{ paddingTop: '10px', paddingBottom: '10px' }} padding="none" onClick={() => this.props.history.push(`ingredients/${e._id}/edit`)}>

                    <Typography type="subheading" style={{ textTransform: 'capitalize' }}>{e.title}</Typography>
                    <Typography className="body1" type="body1" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                      {this.renderSubIngredientsNumber(e.subIngredients)}
                    </Typography>

                  </TableCell>
                  <TableCell>
                    {e.typeMain ? (<Typography type="subheading">{e.typeMain.title}</Typography>)
                      : (<Typography className="subheading" style={{ color: 'rgba(0, 0, 0, .54)' }}>N/A</Typography>)}


                  </TableCell>
                </TableRow>
              ))
            }


            {this.renderNoResults(this.props.count)}



          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>   
                <Typography className="body2 font-medium" type="body2" style={{ color: 'rgba(0, 0, 0, .54)' }}>
                {this.props.count} of {this.props.ingredientCount} ingredients
                </Typography>
                {/* <Typography className="body1" type="body1">Rows</Typography>
                <Button id="simple-menu-anchor" dense aria-owns={this.state.rowsMenuOpen ? 'simple-menu' : null} aria-haspopup="true" onClick={this.handleClick.bind(this)}>
                    {this.props.rowsLimit}
                </Button>

                <Menu id="simple-menu"
                  anchorEl={this.state.anchorEl}
                  open={this.state.rowsMenuOpen}
                  onRequestClose={this.handleRequestClose}
                  >
                  <MenuItem onClick={this.handleRequestClose.bind(this, val = 8)}>8</MenuItem>
                  <MenuItem onClick={this.handleRequestClose.bind(this, val = 15)}>15</MenuItem>
                  <MenuItem onClick={this.handleRequestClose.bind(this, val = 30)}>30</MenuItem>
                </Menu> */}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>

              {
                this.props.hasMore ? (
                <TableCell style={{ display: 'flex', height: '56px', alignItems: 'center', justifyContent: 'flex-end' }}>
           
                  {this.props.hasMore ? (<Button style={{ marginLeft: '1em' }} onClick={this.props.loadMore}>Load More</Button>) : ''}
                </TableCell>) : '' 
              
              }
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    );
  }
}

IngredientsTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  results: PropTypes.isRequired,
  history: PropTypes.isRequired,
};


export default createContainer(() => {


  let ingredientCountSub = Meteor.subscribe('ingredients-all-count');

  return {
    // ingredientTypes: IngredientsWithTypes.find().fetch(),
    ingredientCount: Counts.get('ingredients')
  };
}, IngredientsTable);
