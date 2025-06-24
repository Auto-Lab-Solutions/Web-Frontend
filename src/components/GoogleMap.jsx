import React from "react";
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;

function SimpleMap(){
  const defaultProps = {
    center: {
      lat: -31.98862607706676,
      lng: 115.93504856624783
    },
    zoom: 11
  };

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        <AnyReactComponent
          lat={-31.98862607706676}
          lng={115.93504856624783}
          text="My Marker"
        />
      </GoogleMapReact>
    </div>
  );
}

export default SimpleMap;
