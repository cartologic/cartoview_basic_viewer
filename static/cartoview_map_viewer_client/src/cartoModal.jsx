import React from 'react';
import EditService from './services/editService.jsx';
import Events from './Events.jsx';
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
  Col,
  Row,
  Thumbnail
} from 'react-bootstrap';
export default class CartoModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      maps: [],
      selected: undefined
    }
    this.EditService = new EditService('/api/');
  }
  componentDidMount() {
    this.EditService.getMapList();
    Events.on("mapsReady", (maps) => {
      this.setState({maps: maps})
    })
  }
  selectMap(map) {
    this.setState({selected: map, open: false})
    Events.emit("mapSelected",(map))
  }
  mapElement(map) {
    return <ListGroupItem bsStyle={this.state.selected && map.id == this.state.selected.id ? "success":""} key={map.id} href="#" onClick={this.selectMap.bind(this, map)}>
      <Row>
        <Col xs={6} md={4}>
          <img src={map.thumbnail_url}></img>
        </Col>
        <Col md={8}>
          <ListGroup>
            <ListGroupItem>Title : {map.title}</ListGroupItem>
            <ListGroupItem>Abstract : {map.abstract === ""
                ? "No Abstract"
                : map.abstract}</ListGroupItem>
            <ListGroupItem>Owner : {map.owner__username}</ListGroupItem>
          </ListGroup>
        </Col>
      </Row>
    </ListGroupItem>
  }
  render() {

    let maps_list = this.state.maps.length > 0
      ? this.state.maps.map((map) => {
        return this.mapElement(map)
      })
      : <ListGroupItem href="#">"No Maps on server"</ListGroupItem>;
    return (
      <div>
        <Row>
          <Col md={3}>
            {this.state.selected && <Thumbnail src={this.state.selected.thumbnail_url} alt="242x200">
              <h3>{this.state.selected.title}</h3>
              <p>{this.state.selected.abstract === ""
                  ? "No Abstract"
                  : this.state.selected}</p>
              <p>
                {this.state.selected && <Button bsStyle="primary" onClick={() => this.setState({open: true})}>
                  Change Map
                </Button>}
              </p>
            </Thumbnail>}
          </Col>
        </Row>
        <Row>
          {!this.state.selected && <Button bsStyle="primary" onClick={() => this.setState({open: true})}>
            Choose Map
          </Button>}
          <Modal show={this.state.open} onHide={() => this.setState({open: false})} bsSize="large">
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">Choose map</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h4>List of maps</h4>
              <ListGroup>
                {maps_list}
              </ListGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => this.setState({open: false})}>Close</Button>
            </Modal.Footer>
          </Modal>
        </Row>

      </div>

    )
  }
}
