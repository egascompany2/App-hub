import axios from 'axios';

const GOOGLE_MAPS_API_KEY = "AIzaSyD-Vz-OkLGAeMiuT5_eUj2_V9x91FTrDM8";

interface ETAResponse {
  distance: string;
  duration: string;
  eta: Date;
  durationInSeconds: number;
}

/**
 * Calculate ETA using Google Maps Distance Matrix API
 * @param {number} originLat - Driver's current latitude
 * @param {number} originLng - Driver's current longitude
 * @param {number} destLat - Order's delivery latitude
 * @param {number} destLng - Order's delivery longitude
 * @returns {Promise<{distance: string, duration: string, eta: Date, durationInSeconds: number}>}
 */
export const calculateETA = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<ETAResponse> => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originLat},${originLng}&destinations=${destLat},${destLng}&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.status !== 'OK') throw new Error('Google Maps API error');

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') throw new Error('Location not reachable');

    const distance = element.distance.text;
    const duration = element.duration_in_traffic?.text || element.duration.text;
    const durationInSeconds = element.duration_in_traffic?.value || element.duration.value;
    const eta = new Date(Date.now() + durationInSeconds * 1000);

    return { distance, duration, eta, durationInSeconds };
  } catch (error) {
    console.error('Error fetching ETA from Google Maps:', error);
    throw new Error('Could not calculate ETA');
  }
}; 