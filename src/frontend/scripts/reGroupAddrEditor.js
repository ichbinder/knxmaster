import React from 'react';
import axios from 'axios';
import Ga100x from './reGa100x';
import Ga300x from './reGa300x';
import Ga500x from './reGa500x';

const SERVER_URL = 'http://playground.cm.htw-berlin.de:8020';

export class GroupAddr extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      building: {},
      dptList: [ 'DPT1', 'DPT3', 'DPT5' ],
      selectDpt: 'DPT1',
      dptListRaw: [ '0', '3', '7' ]
    };
    this._handleSelectDPTChange = this._handleSelectDPTChange.bind( this );
  }

  componentDidMount() {
    const indexOfDPT = this.state.dptList.indexOf( this.state.selectDpt );
    this._getBuildingGa( this.state.dptListRaw[indexOfDPT] );
  }

  _handleSelectDPTChange( event ) {
    this.state.selectDpt = event.target.value;
    const indexOfDPT = this.state.dptList.indexOf( this.state.selectDpt );
    this._getBuildingGa( this.state.dptListRaw[indexOfDPT] );
  }

  _selectDPTRender( bd ) {
    if ( this.state.selectDpt === this.state.dptList[0] ) {
      return <Ga100x building={bd} />;
    } else if ( this.state.selectDpt === this.state.dptList[1] ) {
      return <Ga300x building={bd} />;
    } else if ( this.state.selectDpt === this.state.dptList[2] ) {
      return <Ga500x building={bd} />;
    }
    return 'Fehler, keine DPT gefunden';
  }

  _getBuildingGa( dptRaw ) {
    const _this = this;
    const urlData = `${SERVER_URL}/api/getAllGaOfDPT?dpt=${dptRaw}`;
    this.serverRequest =
      axios
        .get( urlData )
        .then( ( result ) => {
          _this.setState( {
            building: result.data.building
          } );
        } );
  }

  render() {
    let notFound = false;
    if ( Object.keys( this.state.building ).length )
      notFound = true;
    return (
      <div className="scanKnx">
        <h3>Folgende Gruppenadressen wurden gefunden:</h3>
        <div className="gptSelect0">
          <label>DPT:</label>
          <select
            value={this.state.selectDpt}
            onChange={this._handleSelectDPTChange}
          >
            {
              this.state.dptList.map( ( v, l ) => <option key={l} value={v}>{v}</option> )
            }
          </select>
        </div>
        {
          notFound
          ? this.state.building.map( ( bd, i ) =>
            <div key={i}>
              {this._selectDPTRender( bd )}
            </div>
          )
          : 'Es wurde keine Gruppenadressen mit diesem DPT gefunden.'
        }
      </div>
    );
  }
}
