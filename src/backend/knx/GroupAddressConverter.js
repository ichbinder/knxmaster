import nc from './NumberConverter';


/**
  * Diese Funktioen erstellt Lesbare GA aus einem HEX String.
**/
exports.hexToGa = ( hexGa ) => {
  const binGa = nc.hex2bin( hexGa );
  const mainGroup = binGa.substr( 1, 4 );
  const meddelGroup = binGa.substr( 5, 3 );
  const underGroup = binGa.substr( 8, 8 );
  return `${nc.bin2dez( mainGroup )}/${nc.bin2dez( meddelGroup )}/${nc.bin2dez( underGroup )}`;
};

/**
  * Diese Funktioen erstellt Lesbare GA aus einem bit Wert.
**/
exports.binToGa = ( binGa ) => {
  const mainGroup = binGa.substr( 1, 4 );
  const meddelGroup = binGa.substr( 5, 3 );
  const underGroup = binGa.substr( 8, 8 );
  return `${nc.bin2dez( mainGroup )}/${nc.bin2dez( meddelGroup )}/${nc.bin2dez( underGroup )}`;
};
