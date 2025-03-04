// import { Marker, Popup } from 'react-leaflet';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { MapContainer } from 'react-leaflet/MapContainer'
// import { TileLayer } from 'react-leaflet/TileLayer'
// import { useMap } from 'react-leaflet/hooks'

// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import React, { useRef } from "react";
// import { MapContainer, TileLayer } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// Using Maplibre
import * as React from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';


import './Map.css';

const MyMap = props => {
  const { center, zoom } = props;

  // const mapRef = useRef(null);
  const latitude = center.lat
  const longitude = center.lng
  console.log(props)

  const myMapStyle = `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAP_API_KEY}`
  // console.log('my map style ===', myMapStyle)


  return (
    <>
      <h2> Map Should be here!</h2>
      <Map
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
          zoom: zoom
        }}
        style={{ height: "100%", width: "100%" }}
        // mapStyle="https://api.maptiler.com/maps/streets/style.json?key=neSDf4CMHyoCxyrnr96H	"
        // mapStyle="https://api.maptiler.com/maps/streets/style.json?key=%REACT_APP_MAP_API_KEY%	"
        // mapStyle="https://api.maptiler.com/maps/streets/style.json?key=%VITE_MAP_API_KEY%	"
        mapStyle={myMapStyle}
      >
        <Marker latitude={latitude} longitude={longitude} color='#FF0000' />
        <Popup latitude={latitude + 0.015} longitude={longitude} > Ventuno</Popup>
      </Map >


    </>
  );
};




export default MyMap;
