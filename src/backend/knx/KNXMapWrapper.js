import cmd from 'node-cmd';

export default class KNXMapWrapper {
  constructor( ipAddress, knxmapPath = 'knxmap' ) {
    this.ip = ipAddress;
    this.knxmap = knxmapPath;
  }

  scanKNXBus( pa ) {
    return new Promise( ( resolve, reject ) => {
      console.log( `${this.knxmap} scan ${this.ip} ${pa}` );
      cmd.get( `${this.knxmap} scan ${this.ip} ${pa}`, ( data, err, stderr ) => {
        if ( err ) reject( `err: ${err} stderr: ${stderr}` );
        const tmp = data.split( 'Bus Devices:' )[1];
        if ( tmp )
          resolve( tmp.replace( / /g, '' ).split( /\n/ ).filter( Boolean ) );
        else
          resolve( null );
      } );
    } );
  }

  devDescriptorRead( pa ) {
    return new Promise( ( resolve, reject ) => {
      cmd.get( `${this.knxmap} apci ${this.ip} ${pa} DeviceDescriptor_Read`,
        ( data, err, stderr ) => {
          if ( err ) reject( `err: ${err} stderr: ${stderr}` );
          if ( stderr )
            resolve( stderr.replace( /\s/g, '' ).replace( /^b/g, '' ).replace( /'/g, '' ) );
          else
            resolve( null );
        } );
    } );
  }

  memoryRead( pa, memoryAddress, readCount = 1 ) {
    return new Promise( ( resolve, reject ) => {
      cmd.get(
        `${this.knxmap} apci ${this.ip} ${pa} Memory_Read \
        --memory-address ${memoryAddress} \
        --read-count ${readCount}`,
        ( data, err, stderr ) => {
          if ( err ) reject( `err: ${err} stderr: ${stderr}` );
          if ( stderr )
            resolve( stderr.replace( /\s/g, '' ).replace( /^b/g, '' ).replace( /'/g, '' ) );
          else
            resolve( null );
        } );
    } );
  }

  propertyValueRead( pa, pid, oid = 0, sid = 1, elements = 1 ) {
    return new Promise( ( resolve, reject ) => {
      cmd.get(
        `${this.knxmap} apci ${this.ip} ${pa} PropertyValue_Read \
        --property-id ${pid} \
        --object-index ${oid} \
        --elements ${elements} \
        --start-index ${sid}`,
        ( data, err, stderr ) => {
          if ( err ) reject( `err: ${err} stderr: ${stderr}` );
          if ( stderr )
            resolve( stderr.replace( /\s/g, '' ).replace( /^b/g, '' ).replace( /'/g, '' ) );
          else
            resolve( null );
        } );
    } );
  }
}
