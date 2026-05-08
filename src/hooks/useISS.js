import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateSpeed } from '../utils/haversine';

// Using direct HTTPS URL as it's generally more reliable on Vercel
const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const ASTROS_API = 'https://corsproxy.io/?http://api.open-notify.org/astros.json';
const GEO_API = 'https://nominatim.openstreetmap.org/reverse';
const MAX_POSITIONS = 15;
const MAX_SPEEDS = 30;

export function useISS() {
  const [position, setPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [locationName, setLocationName] = useState('Calculating...');
  const [people, setPeople] = useState({ number: 0, people: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevPosRef = useRef(null);
  const prevTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchLocation = async (lat, lon) => {
    try {
      const res = await fetch(
        `${GEO_API}?lat=${lat}&lon=${lon}&format=json`,
        { 
          headers: { 
            'Accept-Language': 'en',
            'User-Agent': 'ISS-Dashboard-App-Student-Project-V2' 
          } 
        }
      );
      const data = await res.json();
      if (data.error) {
        setLocationName('Over the Ocean');
      } else {
        const addr = data.address;
        const name = addr.city || addr.town || addr.village || addr.county || addr.state || addr.country || 'Remote Area';
        const country = addr.country || '';
        setLocationName(country ? `${name}, ${country}` : name);
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
      setLocationName('Over the Ocean');
    }
  };

  const fetchPeople = useCallback(async () => {
    try {
      const res = await fetch(ASTROS_API);
      if (!res.ok) throw new Error('Astros proxy failed');
      const data = await res.json();
      setPeople(data);
    } catch (err) {
      console.warn('Crew fetch failed, trying fallback:', err);
      try {
        // Simple fallback if proxy is down
        const res2 = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('http://api.open-notify.org/astros.json'));
        const data2 = await res2.json();
        setPeople(JSON.parse(data2.contents));
      } catch (err2) { 
        console.error('Final crew fetch fallback failed:', err2);
      }
    }
  }, []);

  const fetchISS = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(ISS_API);
      if (!res.ok) throw new Error(`ISS API returned ${res.status}`);
      const data = await res.json();
      
      const now = Date.now();
      const newPos = { lat: data.latitude, lon: data.longitude, timestamp: now };

      // Speed from API velocity if available, else calc
      const rawVelocity = data.velocity; // velocity is in km/h usually in this API
      if (prevPosRef.current && prevTimeRef.current) {
        const timeDiff = (now - prevTimeRef.current) / 1000;
        const calculatedSpd = calculateSpeed(prevPosRef.current, newPos, timeDiff);
        const finalSpeed = rawVelocity || calculatedSpd;
        setSpeed(Math.round(finalSpeed));
        const ts = new Date(now).toLocaleTimeString();
        setSpeedHistory(prev => [...prev.slice(-MAX_SPEEDS + 1), { time: ts, speed: Math.round(finalSpeed) }]);
      } else if (rawVelocity) {
        setSpeed(Math.round(rawVelocity));
      }

      prevPosRef.current = newPos;
      prevTimeRef.current = now;
      setPosition(newPos);
      setTrajectory(prev => {
        const next = [...prev, newPos];
        return next.slice(-MAX_POSITIONS);
      });
      fetchLocation(data.latitude, data.longitude);
      setLoading(false);
    } catch (err) {
      console.error('ISS Fetch Error:', err);
      setError(`ISS Fetch Error: ${err.message}`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchISS();
    fetchPeople();
    intervalRef.current = setInterval(fetchISS, 15000);
    return () => clearInterval(intervalRef.current);
  }, [fetchISS, fetchPeople]);

  const refresh = () => { setLoading(true); fetchISS(); fetchPeople(); };

  return { position, trajectory, speed, speedHistory, locationName, people, loading, error, refresh, posCount: trajectory.length };
}
