'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useDashboardStore } from '@/store/dashboardStore';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const paragraphStyle: React.CSSProperties = {
  fontFamily: 'Open Sans',
  margin: 0,
  fontSize: 13,
};

const MapboxPolygon = () => {
  const { userLocation: cachedLocation, setUserLocation: setCachedLocation, setPolygonData } = useDashboardStore();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [area, setArea] = useState<number | null>(null);
  const [centroid, setCentroid] = useState<{ lng: number; lat: number } | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Initialize map when user location is available
  useEffect(() => {
    // Get current location
    if (cachedLocation && Date.now() - cachedLocation.timestamp < 3600000) {
        setUserLocation([cachedLocation.longitude, cachedLocation.latitude]);
        return;
      }
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
          setCachedLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            timestamp: Date.now(),
          });
        },
        () => {
          // Default fallback location (Delhi)
          const fallback: [number, number] = [77.209, 28.6139];
          setUserLocation(fallback);
          setCachedLocation({
            longitude: 77.209,
            latitude: 28.6139,
            timestamp: Date.now(),
          });

        }
      );
    } else {
        const fallback: [number, number] = [77.209, 28.6139];
        setUserLocation(fallback);
        setCachedLocation({
          longitude: 77.209,
          latitude: 28.6139,
          timestamp: Date.now(),
        }); 
    }
  }, [cachedLocation, setCachedLocation]);

  useEffect(() => {
    if (!mapContainerRef.current || !userLocation) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: userLocation,
      zoom: 13,
    });

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    mapRef.current.addControl(drawRef.current);

      const updatePolygonData = () => {
          if (!drawRef.current) return;
    
          const data = drawRef.current.getAll();
          if (data.features.length > 0) {
            const feature = data.features[0];
            const calculatedArea = turf.area(feature);
            const roundedArea = Math.round(calculatedArea * 100) / 100;
            const center = turf.centroid(feature).geometry.coordinates;
            const centroidData = { lng: center[0], lat: center[1] };
    
            setArea(roundedArea);
            setCentroid(centroidData);
    
            // Save to store
            setPolygonData({
              area: roundedArea,
              centroid: centroidData,
            });
          } else {
            setArea(null);
            setCentroid(null);
            // Clear store
            setPolygonData({
              area: null,
              centroid: null,
            });
          }
        };


    mapRef.current.on('draw.create', updatePolygonData);
    mapRef.current.on('draw.update', updatePolygonData);
    mapRef.current.on('draw.delete', updatePolygonData);

    return () => {
      mapRef.current?.remove();
    };
  }, [userLocation, setPolygonData]);

  return (
    <>
      <div ref={mapContainerRef} className="h-full w-full" />

     
    </>
  );
};

export default MapboxPolygon;
