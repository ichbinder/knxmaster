import nc from './NumberConverter';

exports.hexToGa = ( hexGa ) => {
  const binGa = nc.hex2bin( hexGa );
  const mainGroup = binGa.substr( 1, 4 );
  const meddelGroup = binGa.substr( 5, 3 );
  const underGroup = binGa.substr( 8, 8 );
  return `${nc.bin2dez( mainGroup )}/${nc.bin2dez( meddelGroup )}/${nc.bin2dez( underGroup )}`;
};

exports.binToGa = ( binGa ) => {
  const mainGroup = binGa.substr( 1, 4 );
  const meddelGroup = binGa.substr( 5, 3 );
  const underGroup = binGa.substr( 8, 8 );
  return `${nc.bin2dez( mainGroup )}/${nc.bin2dez( meddelGroup )}/${nc.bin2dez( underGroup )}`;
};
