import ReactDOM from 'react-dom';
import React from 'react';
import { ReMainCarsten } from './reMainCarsten';
import { ReMain } from './reMain';

if ( window.app === 'carsten' )
  ReactDOM.render( <ReMainCarsten />, document.getElementById( 'main' ) );
else
  ReactDOM.render( <ReMain />, document.getElementById( 'main' ) );
