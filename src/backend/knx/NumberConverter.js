
exports.hex2dez = ( hex ) => Number( parseInt( hex, 16 ).toString( 10 ) );

exports.dez2hex = ( dez ) => parseInt( dez, 10 ).toString( 16 );

exports.bin2dez = ( bin ) => Number( parseInt( bin, 2 ).toString( 10 ) );

exports.hex2bin = ( hex ) => {
  const hexLength = hex.length;
  let binTmp = parseInt( hex, 16 ).toString( 2 );
  const binLength = binTmp.length;
  if ( hexLength * 4 > binLength ) {
    for ( let i = 0; i < hexLength * 4 - binLength; i += 1 ) {
      binTmp = `${0}${binTmp}`;
    }
  }
  return binTmp;
};

exports.bin2hex = ( bin ) => {
  const binLength = bin.length;
  let hexTmp = parseInt( bin, 2 ).toString( 16 );
  const hexLength = hexTmp.length;
  if ( binLength / 4 > hexLength ) {
    for ( let i = 0; i < binLength / 4 - hexLength; i += 1 ) {
      hexTmp = `${0}${hexTmp}`;
    }
  }
  return hexTmp;
};
