import React from 'react';
import axios from 'axios';
import Slider from 'rc-slider';

axios.defaults.baseURL = 'http://playground.cm.htw-berlin.de:8020/';
// axios.defaults.baseURL = 'http://localhost:8020/';

/**
  * dies ist eine Test webseite um die Jalousien von Raum 001 im Gebäude zu steuern.
**/
export default class JalousieTick extends React.Component {
  static get propTypes() {
    return {
      tickGa: React.PropTypes.string,
      name: React.PropTypes.string,
    };
  }

  constructor( props ) {
    super( props );
    this.state =
    {
      responseOnOff: {
        pa: '',
        value: ''
      }
    };
    this._handleTickUpChange = this._handleTickUpChange.bind( this );
    this._handleTickDownChange = this._handleTickDownChange.bind( this );
  }

  _handleTickUpChange() {
    const telegramm = {
      ga: this.props.tickGa,
      value: 1,
      dpt: 'DPT1'
    };
    axios.post( '/api/writeDpt', telegramm )
    .then( ( response ) => {
      this.state.responseOnOff.pa = response.data.pa;
      this.state.responseOnOff.value = response.data.value.data[0];
      this.setState( this.state );
    } )
    .catch( ( error ) => {
      console.log( error );
    } );
  }

  _handleTickDownChange() {
    const telegramm = {
      ga: this.props.tickGa,
      value: 0,
      dpt: 'DPT1'
    };
    axios.post( '/api/writeDpt', telegramm )
    .then( ( response ) => {
      this.state.responseOnOff.pa = response.data.pa;
      this.state.responseOnOff.value = response.data.value.data[0];
      this.setState( this.state );
    } )
    .catch( ( error ) => {
      console.log( error );
    } );
  }

  render() {
    return (
      <div className="tick">
        <button className="btn" onClick={this._handleTickUpChange}>H</button>
        <button className="btn" onClick={this._handleTickDownChange}>R</button>
      </div>
    );
  }
}
