import React from 'react';
import {render, findDOMNode} from 'react-dom';
import CartoModal from './cartoModal.jsx';
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
  Container,
  Row,
  Col
} from 'react-bootstrap';
import MapForm from './form.jsx'
import Events from './Events.jsx';
export default class CartoviewEdit extends React.Component {
  state = {
    maps: []
  }
  componentDidMount() {
    if (typeof map_id !== 'undefined') {
      Events.on("mapsReady", (maps) => {
        maps.map((m) => {
          if (m.id === map_id) {
            this.onMapSelected(m)
          }
        })
      })
    }
  }
  onMapSelected = (map) => {
    this.setState({selectedMap: map})
  }
  render() {
    let {selectedMap} = this.state;
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
        <div className="container">
          <Row>
            <Col md={6}>
              <CartoModal onMapSelected={this.onMapSelected} selectedMap={selectedMap}></CartoModal>
            </Col>
          </Row>
          <hr></hr>
          <Row>
            <MapForm map={this.state.selectedMap}></MapForm>
          </Row>

        </div>

      </div>

    )
  }
}
render(
  <CartoviewEdit></CartoviewEdit>, document.getElementById('root'))
