import axios from 'axios';


 export const geocode = async (address: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await axios.get(url);
    const location = res.data.results?.[0]?.geometry?.location;
    return location ? [location.lat, location.lng] : [null, null];
  } catch (error) {
    console.error('❌ Error geocoding:', error);
    return [null, null];
  }
};
