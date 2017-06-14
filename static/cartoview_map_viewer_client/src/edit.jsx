import React from 'react';
import {render, findDOMNode} from 'react-dom';
import CartoModal from './cartoModal.jsx'
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  Modal,
  Button,
  ListGroup,
  ListGroupItem,
  Container
} from 'react-bootstrap';
import Events from './Events.jsx';
import './app.css';
import EditService from './services/editService.jsx';
export default class CartoviewEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      maps: [],
      selected_map:undefined
    }
    this.EditService = new EditService('/api/')
  }

  render() {
    Events.on("mapSelected",(map)=>{
      this.setState({selected_map:map})
    })
    let m= this.state.selected_map ? this.state.selected_map.title : ""
    return (
      <div className="full-height-width">
        <Navbar collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/">Cartoview</a>
            </Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
        </Navbar>
        <div className="container"><CartoModal></CartoModal>
        {m}
        </div>

      </div>

    )
  }
}
render(
  <CartoviewEdit></CartoviewEdit>, document.getElementById('root'))
