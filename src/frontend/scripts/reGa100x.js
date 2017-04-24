import React from 'react';
import axios from 'axios';


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
      comment: props.building.kommentar
    };
    this._handleOnChange = this._handleOnChange.bind( this );
    this._handleOffChange = this._handleOffChange.bind( this );
    this._handleGebaeudeChange = this._handleGebaeudeChange.bind( this );
    this._handleRaumChange = this._handleRaumChange.bind( this );
    this._handleComment = this._handleComment.bind( this );
    this._handleSaveChange = this._handleSaveChange.bind( this );
    this._handleFunktionChange = this._handleFunktionChange.bind( this );
  }

  _handleOnChange() {
    this._OnOff( 1 );
  }

  _handleOffChange() {
    this._OnOff( 0 );
  }

  _handleGebaeudeChange( event ) {
    this.state.gebaeude = event.target.value;
    this.setState( this.state );
  }

  _handleRaumChange( event ) {
    this.state.raum = event.target.value;
    this.setState( this.state );
  }

  _handleComment( event ) {
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

  _OnOff( valueOnOff ) {
    axios.post( '/api/writeDpt',
      {
        ga: this.state.groupAddr,
        value: valueOnOff,
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
        <div className="line">
          <button className="btn" onClick={this._handleOnChange}>On</button>
          <button className="btn" onClick={this._handleOffChange}>Off</button>
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
              onChange={this._handleComment}
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
