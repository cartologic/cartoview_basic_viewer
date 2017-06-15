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
  Thumbnail,
  Image
} from 'react-bootstrap';
export default class CartoModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      maps: [],
      selected: undefined
    }
    this.EditService = new EditService({api:'/api/',baseUrl:'/'});
  }
  componentDidMount() {
    this.EditService.getMapList();
    Events.on("mapsReady", (maps) => {
      this.setState({maps: maps})
    })
  }
  selectMap = (map_instance) => {
    let {onMapSelected} = this.props;
    this.setState({open: false})
    onMapSelected(map_instance);
  }
  mapElement(map_instance) {
    const {selectedMap} = this.props;
    return (
      <Col key={map_instance.id} md={6} onClick={(e) => this.selectMap(map_instance)}>
        <ListGroupItem  bsStyle={selectedMap && map_instance.id == selectedMap.id ? "success" : ""}  href="#">
        <Row>
          <Col xs={6} md={4}>
            <Image src={map_instance.thumbnail_url} thumbnail />
          </Col>
          <Col md={8}>
            <ListGroup>
              <ListGroupItem>Title : {map_instance.title}</ListGroupItem>
              <ListGroupItem>Abstract : {map_instance.abstract === ""
                  ? "No Abstract"
                  : map_instance.abstract}</ListGroupItem>
              <ListGroupItem>Owner : {map_instance.owner__username}</ListGroupItem>
            </ListGroup>
          </Col>
        </Row>
      </ListGroupItem></Col>
    )
  }
  render() {
    const {selectedMap} = this.props;
    let maps_list = this.state.maps.length > 0
      ? this.state.maps.map((map_instance) => {
        return this.mapElement(map_instance)
      })
      : <ListGroupItem href="#">"No Maps on server"</ListGroupItem>;
    return (
      <div>
        <Row>
          <Col md={6}>
            {selectedMap && <Thumbnail src={selectedMap.thumbnail_url} style={{wordWrap: 'break-word'}} alt="242x200">
              <h3>{selectedMap.title}</h3>
              <p>{selectedMap.abstract === ""
                  ? "No Abstract"
                  : selectedMap.abstract}</p>
              <p>
                {selectedMap && <Button bsStyle="primary" onClick={() => this.setState({open: true})}>
                  {'Change Map'}
                </Button>}
              </p>
            </Thumbnail>}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
          {!selectedMap && <Button bsStyle="primary" onClick={() => this.setState({open: true})}>
            {'Choose Map'}
          </Button>}
        </Col>
        </Row>
        <Modal show={this.state.open} onHide={() => this.setState({open: false})} bsSize="large">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">{'Choose map'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>{'List of maps'}</h4>
            <Row>
              <ListGroup>
                {maps_list}
              </ListGroup>
            </Row>

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({open: false})}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>

    )
  }
}
