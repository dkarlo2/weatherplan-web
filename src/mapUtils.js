import { LatLngBounds, LatLng } from 'leaflet';
import { useEffect } from 'react';
import { Popup, useMap, Marker } from 'react-leaflet';

export const mapDefaultPosition = [45.8150, 15.9819]; // Zagreb
export const mapDefaultZoom = 13;

export const MapHandler = ({places}) => {
    const map = useMap();
    useEffect(() => {
        setMapView(places, map);
    }, [places]);
    return (
        <>
        {
            places.map((place, index) => (
                <Marker key={index} position={[place.latitude, place.longitude]}>
                    <Popup>{place.name}</Popup>
                </Marker>
            ))
        }
        </>
    )
}

export const setMapView = (places, map) => {
    if (places.length === 0) {
        map.setView(mapDefaultPosition, mapDefaultZoom);
        return;
    }
    const bounds = new LatLngBounds();
    places.forEach((place) => {
        bounds.extend(new LatLng(place.latitude, place.longitude));
    });
    map.fitBounds(bounds);
    if (places.length === 1) {
        map.setZoom(mapDefaultZoom);
    }
}
