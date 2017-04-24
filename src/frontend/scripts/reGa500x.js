import React from 'react';
import axios from 'axios';
import Slider from 'rc-slider';

export default class GroupAddr extends React.Component {
  static get propTypes() {
    return {
      building: React.PropTypes.object,
    };
  }

  constructor( props ) {
    super( props );
    this.state = {
      groupAddr: props.building.ga,
      value: 0,
      dpt: props.building.DPT,
      responseOnOff: { pa: '', value: '' },
      responseSave: { msg: '', error: '' },
      gebaeude: props.building.gebaeude,
      raum: props.building.raum,
      funktion: props.building.funktion,
      comment: props.building.kommentar,
      dpt5004Marks:
      {
        0: { style: { marginTop: 8, color: 'green' }, label: '0' },
        16: { style: { marginTop: 8, color: 'black' }, label: '16' },
        32: { style: { marginTop: 8, color: 'black' }, label: '32' },
        48: { style: { marginTop: 8, color: 'black' }, label: '48' },
        64: { style: { marginTop: 8, color: 'black' }, label: '64' },
        80: { style: { marginTop: 8, color: 'black' }, label: '80' },
        96: { style: { marginTop: 8, color: 'black' }, label: '96' },
        112: { style: { marginTop: 8, color: 'black' }, label: '112' },
        128: { style: { marginTop: 8, color: 'black' }, label: '128' },
        144: { style: { marginTop: 8, color: 'black' }, label: '144' },
        160: { style: { marginTop: 8, color: 'black' }, label: '160' },
        176: { style: { marginTop: 8, color: 'black' }, label: '176' },
        192: { style: { marginTop: 8, color: 'black' }, label: '192' },
        208: { style: { marginTop: 8, color: 'black' }, label: '208' },
        224: { style: { marginTop: 8, color: 'black' }, label: '224' },
        240: { style: { marginTop: 8, color: 'black' }, label: '240' },
        256: { style: { marginTop: 8, color: 'red' }, label: '256' },
      },
    };
    this._handleGebaeudeChange = this._handleGebaeudeChange.bind( this );
    this._handleRaumChange = this._handleRaumChange.bind( this );
    this._handleCommentChange = this._handleCommentChange.bind( this );
    this._handleSaveChange = this._handleSaveChange.bind( this );
    this._handleFunktionChange = this._handleFunktionChange.bind( this );
    this._handleDimChange = this._handleDimChange.bind( this );
  }

  _handleGebaeudeChange( event ) {
    this.state.gebaeude = event.target.value;
    this.setState( this.state );
  }

  _handleRaumChange( event ) {
    this.state.raum = event.target.value;
    this.setState( this.state );
  }

  _handleCommentChange( event ) {
    this.state.comment = event.target.value;
    this.setState( this.state );
  }

  _handleFunktionChange( event ) {
    this.state.funktion = event.target.value;
    this.setState( this.state );
  }

  _handleSaveChange() {
    axios.post( '/api/saveGa',
      {
        ga: this.state.groupAddr,
        DPT: this.state.dpt,
        gebaeude: this.state.gebaeude,
        raum: this.state.raum,
        funktion: this.state.funktion,
        kommentar: this.state.comment
      } )
    .then( ( response ) => {
      this.state.responseSave.error = response.data.error;
      this.state.responseSave.msg = response.data.msg;
      this.setState( this.state );
    } )
    .catch( ( error ) => {
      console.log( error );
    } );
  }

  _handleDimChange( valueDim ) {
    if ( valueDim > 255 )
      valueDim = 255;
    axios.post( '/api/writeDpt',
      {
        ga: this.state.groupAddr,
        value: valueDim,
        dpt: this.state.dpt
      } )
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
    let responseOnOffInfo = false;
    if ( this.state.responseOnOff.pa )
      responseOnOffInfo = true;
    let errorSave = ''; let errorSaveColor = '';
    if ( this.state.responseSave.error || this.state.responseSave.msg )
      if ( this.state.responseSave.error ) {
        errorSave = this.state.responseSave.error;
        errorSaveColor = '#b62e04';
      } else {
        errorSave = this.state.responseSave.msg;
        errorSaveColor = '#03aa0a';
      }
    return (
      <div>
        <label className="inputHead">Gruppenadresse: {this.state.groupAddr}</label>
        <div className="slider" >
          <Slider
            min={0}
            max={256}
            step={16}
            marks={this.state.dpt5004Marks}
            defaultValue={0}
            handleStyle={{ height: 26, width: 26, marginLeft: -14, marginTop: -12 }}
            onAfterChange={this._handleDimChange}
          />
        </div>
        <div className="gpt1Input0">
          <div className="gpt1Input1">
            <label>Eingabe:</label>
            {
              errorSave
              ? <label style={{ backgroundColor: errorSaveColor }}>{errorSave}</label>
              : <label></label>
            }
          </div>
          <div className="gpt1Input1">
            <input
              type="text"
              value={this.state.gebaeude}
              placeholder="Gebäude"
              onChange={this._handleGebaeudeChange}
            />
            <input
              type="text"
              value={this.state.raum}
              placeholder="Raum"
              onChange={this._handleRaumChange}
            />
            <input
              type="text"
              value={this.state.funktion}
              placeholder="Funktion"
              onChange={this._handleFunktionChange}
            />
          </div>
          <div className="gpt1Input2">
            <textarea
              value={this.state.comment}
              onChange={this._handleCommentChange}
              placeholder="Kommentar"
            />
            <button className="btn" onClick={this._handleSaveChange}>Speichern</button>
          </div>
        </div>
        {
          responseOnOffInfo === true &&
            <div>
              <h4> Response Info: </h4>
              <p>
                PA: {this.state.responseOnOff.pa} <br />
                <br />
                Value: {this.state.responseOnOff.value}
              </p>
            </div>
        }
      </div>
    );
  }
}
