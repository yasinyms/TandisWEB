import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Search,
  RefreshCw,
  Compass,
  CheckCircle2
} from 'lucide-react';

export interface ResolvedLocationInfo {
  latitude: number;
  longitude: number;
  province: string;
  city: string;
  district: string;
  address: string;
}

interface LocationMapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (loc: ResolvedLocationInfo) => void;
  compact?: boolean;
}

interface PresetCity {
  name: string;
  province: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
}

const IRAN_CITY_PRESETS: PresetCity[] = [
  {
    name: 'تهران (ونک)',
    province: 'تهران',
    city: 'تهران',
    district: 'میدان ونک',
    address: 'تهران، خیابان ولیعصر، میدان ونک',
    lat: 35.7575,
    lng: 51.4099
  },
  {
    name: 'تهران (سعادت‌آباد)',
    province: 'تهران',
    city: 'تهران',
    district: 'سعادت‌آباد',
    address: 'تهران، سعادت‌آباد، میدان کاج',
    lat: 35.7819,
    lng: 51.3748
  },
  {
    name: 'تهران (آزادی)',
    province: 'تهران',
    city: 'تهران',
    district: 'میدان آزادی',
    address: 'تهران، میدان آزادی، ابتدای خیابان آزادی',
    lat: 35.6997,
    lng: 51.3380
  },
  {
    name: 'کرج',
    province: 'البرز',
    city: 'کرج',
    district: 'گوهردشت',
    address: 'البرز، کرج، بلوار جمهوری اسلامی، گوهردشت',
    lat: 35.8400,
    lng: 50.9391
  },
  {
    name: 'مشهد',
    province: 'خراسان رضوی',
    city: 'مشهد',
    district: 'احمدآباد',
    address: 'خراسان رضوی، مشهد، بلوار احمدآباد',
    lat: 36.2972,
    lng: 59.6067
  },
  {
    name: 'اصفهان',
    province: 'اصفهان',
    city: 'اصفهان',
    district: 'چهارباغ عباسی',
    address: 'اصفهان، خیابان چهارباغ عباسی، دروازه دولت',
    lat: 32.6539,
    lng: 51.6660
  },
  {
    name: 'شیراز',
    province: 'فارس',
    city: 'شیراز',
    district: 'معالی‌آباد',
    address: 'فارس، شیراز، بلوار معالی‌آباد',
    lat: 29.5918,
    lng: 52.5837
  },
  {
    name: 'تبریز',
    province: 'آذربایجان شرقی',
    city: 'تبریز',
    district: 'ولیعصر',
    address: 'آذربایجان شرقی، تبریز، کوی ولیعصر',
    lat: 38.0792,
    lng: 46.2887
  },
  {
    name: 'اهواز',
    province: 'خوزستان',
    city: 'اهواز',
    district: 'کیانپارس',
    address: 'خوزستان، اهواز، بلوار کیانپارس',
    lat: 31.3183,
    lng: 48.6706
  },
  {
    name: 'رشت',
    province: 'گیلان',
    city: 'رشت',
    district: 'گلسار',
    address: 'گیلان، رشت، بلوار گلسار',
    lat: 37.2808,
    lng: 49.5832
  },
  {
    name: 'ساری',
    province: 'مازندران',
    city: 'ساری',
    district: 'میدان ساعت',
    address: 'مازندران، ساری، خیابان فرهنگ، میدان ساعت',
    lat: 36.5633,
    lng: 53.0601
  }
];

function findNearestPreset(lat: number, lng: number): PresetCity {
  let best = IRAN_CITY_PRESETS[0];
  let minDist = Infinity;
  for (const item of IRAN_CITY_PRESETS) {
    const d = Math.hypot(item.lat - lat, item.lng - lng);
    if (d < minDist) {
      minDist = d;
      best = item;
    }
  }
  return best;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  compact = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [resolvedInfo, setResolvedInfo] = useState<ResolvedLocationInfo>(() => {
    const nearest = findNearestPreset(latitude, longitude);
    return {
      latitude,
      longitude,
      province: nearest.province,
      city: nearest.city,
      district: nearest.district,
      address: nearest.address
    };
  });

  const resolveCoordinates = async (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));
    const nearest = findNearestPreset(roundedLat, roundedLng);

    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&accept-language=fa`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const province =
          addr.state || addr.province || nearest.province || 'تهران';
        const city =
          addr.city || addr.town || addr.county || nearest.city || 'تهران';
        const district =
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          addr.Pending ||
          addr.road ||
          nearest.district;
        const formattedAddress =
          data.display_name ||
          `${province}، ${city}، ${district}`;

        const info: ResolvedLocationInfo = {
          latitude: roundedLat,
          longitude: roundedLng,
          province,
          city,
          district,
          address: formattedAddress
        };
        setResolvedInfo(info);
        onChange(info);
        setIsReverseGeocoding(false);
        return;
      }
    } catch {
    }

    const fallbackInfo: ResolvedLocationInfo = {
      latitude: roundedLat,
      longitude: roundedLng,
      province: nearest.province,
      city: nearest.city,
      district: nearest.district,
      address: `${nearest.address} (مختصات: ${roundedLat}, ${roundedLng})`
    };
    setResolvedInfo(fallbackInfo);
    onChange(fallbackInfo);
    setIsReverseGeocoding(false);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-tandis-map-pin',
      html: `
        <div style="position:relative;width:44px;height:54px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 8px 14px rgba(10,131,135,0.45));cursor:grab;">
          <svg viewBox="0 0 44 54" width="44" height="54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 52C22 52 40 34.2 40 21C40 11.0589 31.9411 3 22 3C12.0589 3 4 11.0589 4 21C4 34.2 22 52 22 52Z" fill="#0a8387" stroke="#ffffff" stroke-width="3"/>
            <circle cx="22" cy="21" r="8" fill="#f2a900" stroke="#ffffff" stroke-width="2"/>
          </svg>
        </div>
      `,
      iconSize: [44, 54],
      iconAnchor: [22, 52]
    });

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setGpsError('');
      resolveCoordinates(lat, lng);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setGpsError('');
      resolveCoordinates(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;
    };
  }, []);

  const moveToLocation = (lat: number, lng: number, zoom = 15) => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.8 });
      markerInstanceRef.current.setLatLng([lat, lng]);
    }
    resolveCoordinates(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('مرورگر شما از قابلیت مکان‌یابی خودکار (GPS) پشتیبانی نمی‌کند. لطفاً پین را به صورت دستی روی نقشه جابه‌جا کنید.');
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingGps(false);
        const { latitude: gLat, longitude: gLng } = position.coords;
        moveToLocation(gLat, gLng, 16);
      },
      () => {
        setIsLocatingGps(false);
        setGpsError(
          'دسترسی به موقعیت مکانی (GPS) امکان‌پذیر نشد. لطفاً موقعیت خود را به صورت دستی با کلیک روی نقشه یا کشیدن پین انتخاب کنید.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setGpsError('');
    const matchedPreset = IRAN_CITY_PRESETS.find(
      (p) => p.name.includes(q) || p.city.includes(q) || p.district.includes(q)
    );
    if (matchedPreset) {
      moveToLocation(matchedPreset.lat, matchedPreset.lng, 14);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + ' ایران'
        )}&limit=1&accept-language=fa`
      );
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const targetLat = parseFloat(results[0].lat);
          const targetLon = parseFloat(results[0].lon);
          if (!Number.isNaN(targetLat) && !Number.isNaN(targetLon)) {
            moveToLocation(targetLat, targetLon, 15);
            setIsSearching(false);
            return;
          }
        }
      }
      setGpsError('محله یا شهر مورد نظر یافت نشد. می‌توانید مستقیم روی نقشه کلیک کنید.');
    } catch {
      setGpsError('امکان جستجوی آنلاین وجود ندارد. لطفاً از دکمه‌های شهرها یا کلیک مستقیم روی نقشه استفاده کنید.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchLocation(e);
                }
              }}
              placeholder="جستجوی شهر، منطقه یا خیابان (مثال: تهران سعادت‌آباد، مشهد، شیراز...)"
              className="w-full py-2.5 pr-9 pl-3 rounded-xl bg-[#f2f9f9] border border-[#dfecec] text-xs text-[#12292c] focus:outline-none focus:border-[#0a8387] focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-[#5f777b] absolute right-3 top-3" />
          </div>
          <button
            type="button"
            onClick={handleSearchLocation}
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl bg-[#0a8387] hover:bg-[#0b676c] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            {isSearching ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>یافتن روی نقشه</span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocatingGps}
          className="px-4 py-2.5 rounded-xl bg-[#effcfb] hover:bg-[#dfecec]/70 text-[#0a8387] border border-[#0a8387]/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          {isLocatingGps ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>دریافت موقعیت فعلی من (GPS)</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] text-[#5f777b] font-medium shrink-0 ml-1">
          انتخاب سریع شهر:
        </span>
        {IRAN_CITY_PRESETS.map((preset) => {
          const isNear =
            Math.abs(resolvedInfo.latitude - preset.lat) < 0.02 &&
            Math.abs(resolvedInfo.longitude - preset.lng) < 0.02;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setGpsError('');
                moveToLocation(preset.lat, preset.lng, 14);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                isNear
                  ? 'bg-[#0a8387] text-white border-[#0a8387]'
                  : 'bg-white text-[#12292c] border-[#dfecec] hover:border-[#0a8387]/50'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {gpsError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          {gpsError}
        </div>
      )}

      <div
        className={`relative w-full ${
          compact ? 'h-56 sm:h-64' : 'h-72 sm:h-84'
        } rounded-2xl overflow-hidden border-2 border-[#0a8387]/35 shadow-inner bg-slate-100`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        <div className="absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#dfecec] shadow-sm flex items-center gap-2 pointer-events-none">
          <MapPin className="w-4 h-4 text-[#0a8387]" />
          <span className="text-[11px] font-bold text-[#12292c]">
            روی نقشه کلیک کنید یا پین را به محل دقیق خود بکشید
          </span>
        </div>
      </div>

      {compact ? (
        <div className="bg-[#f2f9f9] p-3.5 rounded-2xl border border-[#dfecec] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#12292c] min-w-0">
            <MapPin className="w-4 h-4 text-[#0a8387] shrink-0" />
            <span className="text-[#5f777b] shrink-0">موقعیت انتخابی:</span>
            <strong className="font-bold truncate">
              {resolvedInfo.province}، {resolvedInfo.city}
              {resolvedInfo.district ? ` — ${resolvedInfo.district}` : ''}
            </strong>
            {isReverseGeocoding && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0a8387] shrink-0" />
            )}
          </div>
          <span className="text-[11px] font-mono text-[#0a8387] font-bold shrink-0" dir="ltr">
            {resolvedInfo.latitude.toFixed(4)}, {resolvedInfo.longitude.toFixed(4)}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f2f9f9] p-4 rounded-2xl border border-[#dfecec]">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#5f777b]">
              عرض جغرافیایی (Latitude) — قابل ویرایش دستی
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.0001"
                dir="ltr"
                value={resolvedInfo.latitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!Number.isNaN(val) && val >= -90 && val <= 90) {
                    moveToLocation(val, resolvedInfo.longitude, 14);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-white border border-[#dfecec] text-xs font-mono font-bold text-[#12292c] focus:outline-none focus:border-[#0a8387]"
              />
              <Compass className="w-4 h-4 text-[#0a8387] absolute right-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#5f777b]">
              طول جغرافیایی (Longitude) — قابل ویرایش دستی
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.0001"
                dir="ltr"
                value={resolvedInfo.longitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!Number.isNaN(val) && val >= -180 && val <= 180) {
                    moveToLocation(resolvedInfo.latitude, val, 14);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-white border border-[#dfecec] text-xs font-mono font-bold text-[#12292c] focus:outline-none focus:border-[#0a8387]"
              />
              <Compass className="w-4 h-4 text-[#0a8387] absolute right-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#5f777b]">
              استان و شهر شناسایی‌شده از موقعیت
            </span>
            <div className="py-2 px-3 rounded-xl bg-[#effcfb] border border-[#aeece6] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0a8387] truncate">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {resolvedInfo.province} — {resolvedInfo.city}
                  {resolvedInfo.district ? ` (${resolvedInfo.district})` : ''}
                </span>
              </div>
              {isReverseGeocoding && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0a8387] shrink-0" />
              )}
            </div>
          </div>

          <div className="md:col-span-3 pt-2 border-t border-[#dfecec] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#12292c]">
              <MapPin className="w-4 h-4 text-[#0a8387] shrink-0" />
              <span className="text-[#5f777b]">نشانی موقعیت انتخابی:</span>
              <strong className="font-bold">{resolvedInfo.address}</strong>
            </div>
            <span className="text-[11px] font-mono text-[#5f777b]" dir="ltr">
              lat: {resolvedInfo.latitude.toFixed(5)}, lng: {resolvedInfo.longitude.toFixed(5)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
