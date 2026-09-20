import React, { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

// Custom SVG Icons for Leaflet
const createCustomIcon = (htmlContent, size = [32, 32], anchor = [16, 16]) => {
  return L.divIcon({
    html: htmlContent,
    className: 'custom-leaflet-marker',
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  });
};

// Stops in white with a violet outline
const stopIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-6 h-6">
    <div class="w-4 h-4 rounded-full bg-white border-[2.5px] border-[#8B5CF6] shadow-md flex items-center justify-center">
      <div class="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></div>
    </div>
  </div>
`, [24, 24], [12, 12]);

// Vehicle Icon (Pill shaped with line code)
const vehicleIcon = (code, color) => createCustomIcon(`
  <div class="relative flex flex-col items-center justify-center">
    <div class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1" style="background-color: ${color || '#8B5CF6'}">
      <span>🚌</span>
      <span>${code}</span>
    </div>
    <div class="w-1.5 h-1.5 rotate-45 -mt-0.5" style="background-color: ${color || '#8B5CF6'}"></div>
  </div>
`, [48, 24], [24, 24]);

// Current location dot in blue with a soft halo
const userIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-8 h-8">
    <div class="absolute w-8 h-8 rounded-full bg-[#3B82F6]/25 animate-ping"></div>
    <div class="w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
  </div>
`, [32, 32], [16, 16]);

// Help Point Icons (Police, Hospitals, Pharmacies, Petrol Stations)
const helpPointIcon = (type) => {
  let emoji = '🛡️';
  let color = '#8B5CF6';
  if (type === 'police') {
    emoji = '👮';
    color = '#3B82F6';
  } else if (type === 'hospital') {
    emoji = '🏥';
    color = '#FF4D4F';
  } else if (type === 'pharmacy') {
    emoji = '💊';
    color = '#10B981';
  } else if (type === 'petrol_pump') {
    emoji = '⛽';
    color = '#EA580C';
  }
  return createCustomIcon(`
    <div class="flex items-center justify-center w-7 h-7 rounded-full text-sm bg-white border-2 shadow-md" style="border-color: ${color}">
      <span>${emoji}</span>
    </div>
  `, [28, 28], [14, 14]);
};

// Map Lifecycle Controller: handles invalidateSize, window resize, tab changes, and route bounds fitting
const MapLifecycleController = ({ center, zoom, selectedRouteCoords, activeTab }) => {
  const map = useMap();

  // Invalidate map size on mount and on window resize
  useEffect(() => {
    const triggerInvalidate = () => {
      try {
        map.invalidateSize();
      } catch (e) {}
    };

    // Staggered timers on mount to handle dynamic layout and render cycles
    const t1 = setTimeout(triggerInvalidate, 100);
    const t2 = setTimeout(triggerInvalidate, 400);
    const t3 = setTimeout(triggerInvalidate, 800);

    window.addEventListener('resize', triggerInvalidate);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', triggerInvalidate);
    };
  }, [map]);

  // Invalidate map size whenever active tab or sidebar view toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab, map]);

  // Fit map to selected route bounds when route is selected
  useEffect(() => {
    if (selectedRouteCoords && selectedRouteCoords.length > 1) {
      try {
        const bounds = L.latLngBounds(selectedRouteCoords);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
        });
      } catch (e) {
        console.error('fitBounds error:', e);
      }
    } else if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [selectedRouteCoords, center, zoom, map]);

  return null;
};

export default function MapView({
  selectedRouteId = null,
  highlightStops = [],
  userPos = null,
  className = "w-full h-full",
  showHelpPoints = true
}) {
  const { stops, routes, helpPoints, liveVehicles, emergencyActive, activeTab } = useApp();

  const cityCenter = [12.9716, 77.5946];
  const stopsById = useMemo(() => {
    const map = {};
    stops.forEach((s) => { map[s.id] = s; });
    return map;
  }, [stops]);

  // Find coordinates for routes to render polylines in violet-blue
  const routePolylines = useMemo(() => {
    return routes.map((r) => {
      const coords = (r.stops || [])
        .map((sId) => stopsById[sId])
        .filter(Boolean)
        .map((s) => [s.lat, s.lng]);
      return {
        id: r.id,
        name: r.name,
        color: r.id === selectedRouteId ? '#8B5CF6' : (r.color || '#3B82F6'),
        coords,
        isSelected: r.id === selectedRouteId,
      };
    });
  }, [routes, stopsById, selectedRouteId]);

  const selectedRouteCoords = useMemo(() => {
    const sel = routePolylines.find((r) => r.id === selectedRouteId);
    return sel && sel.coords && sel.coords.length > 0 ? sel.coords : null;
  }, [routePolylines, selectedRouteId]);

  const mapCenter = useMemo(() => {
    if (userPos && userPos.lat && userPos.lng) {
      return [userPos.lat, userPos.lng];
    }
    return cityCenter;
  }, [userPos]);

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[24px] shadow-soft bg-white dark:bg-[#151528] border border-slate-100 dark:border-white/10 w-full h-full ${className}`}
      style={{ minHeight: '300px', width: '100%', height: '100%', zIndex: 0 }}
    >
      {/* Emergency Active Glow Banner */}
      {emergencyActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-[#FF4D4F] rounded-full text-white text-xs font-bold tracking-wide shadow-coral-glow flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>Emergency grid active &bull; Closest rescue stations highlighted</span>
        </div>
      )}

      <MapContainer
        center={cityCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full light-tiles"
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapLifecycleController
          center={mapCenter}
          zoom={emergencyActive ? 14 : 13}
          selectedRouteCoords={selectedRouteCoords}
          activeTab={activeTab}
        />
        
        {/* OpenStreetMap Standard Light Tiles - Clean and high-contrast */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Route Polylines in Violet-Blue */}
        {routePolylines.map((r) => {
          return (
            <Polyline
              key={r.id}
              positions={r.coords}
              pathOptions={{
                color: r.isSelected ? '#8B5CF6' : '#94A3B8',
                weight: r.isSelected ? 5.5 : 3.5,
                opacity: r.isSelected ? 0.95 : 0.45,
                dashArray: r.isSelected ? null : '4, 4',
              }}
            />
          );
        })}

        {/* Transit Stops: White with Violet outline */}
        {stops.map((stop) => {
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={stopIcon}
            >
              <Popup>
                <div className="text-xs p-1 text-[#1B1B3A]">
                  <div className="font-bold text-[#8B5CF6] text-sm">{stop.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[#8A8AA8]">
                    <span>Crowd:</span>
                    <span className="font-semibold text-[#1B1B3A]">{stop.crowd_level}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8A8AA8]">
                    <span>Lighting:</span>
                    <span className="text-[#16A34A] font-medium">{stop.lighting_quality}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8A8AA8]">
                    <span>SOS Booth:</span>
                    <span className={stop.has_sos_booth ? 'text-[#16A34A] font-medium' : 'text-[#8A8AA8]'}>
                      {stop.has_sos_booth ? 'Available (24/7)' : 'None'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Moving Vehicles */}
        {liveVehicles.map((veh) => (
          <Marker
            key={veh.id}
            position={[veh.lat, veh.lng]}
            icon={vehicleIcon(veh.route_code, veh.route_color)}
          >
            <Popup>
              <div className="text-xs p-1 text-[#1B1B3A]">
                <div className="font-bold flex items-center justify-between gap-2">
                  <span>{veh.route_name}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#DDF8EA] text-[#16A34A] font-bold">
                    {veh.status}
                  </span>
                </div>
                <div className="mt-1 text-[#8A8AA8]">Speed: {veh.speed_kmh} km/h</div>
                {veh.delay_min > 0 && (
                  <div className="text-[#EA580C] font-semibold">Delay: +{veh.delay_min} mins</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location Dot in Blue with Soft Halo */}
        {userPos && (
          <>
            <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
              <Popup>
                <div className="text-xs font-bold text-[#3B82F6]">
                  📍 Your live commute position
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userPos.lat, userPos.lng]}
              radius={220}
              pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.12, weight: 1.5 }}
            />
          </>
        )}

        {/* Help Points */}
        {showHelpPoints && helpPoints.map((hp) => (
          <Marker
            key={hp.id}
            position={[hp.lat, hp.lng]}
            icon={helpPointIcon(hp.type)}
          >
            <Popup>
              <div className="text-xs p-1 text-[#1B1B3A]">
                <div className="font-bold text-[#1B1B3A]">{hp.name}</div>
                <div className="text-[#8A8AA8] mt-0.5">{hp.address}</div>
                <div className="text-[#16A34A] font-semibold mt-1">{hp.operating_hours}</div>
                <div className="text-[#8B5CF6] font-mono mt-0.5">{hp.phone}</div>
                <div className="mt-2 flex gap-1.5">
                  <a
                    href={`tel:${hp.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-2.5 py-1 bg-[#1B1B3A] hover:bg-[#8B5CF6] rounded-full text-white font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    Call
                  </a>
                  <button
                    onClick={() => alert(`Starting simulated navigation to ${hp.name}`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-[#1B1B3A] font-semibold text-[11px] transition"
                  >
                    Navigate
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
