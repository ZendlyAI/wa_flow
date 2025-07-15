import axios from 'axios';

export const geocode = async (address: string) => {
  console.log(`🔍 Geocoding address: ${address}`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await axios.get(url);
    const location = res.data.results?.[0]?.geometry?.location;
    const formatted_address = res.data.results?.[0]?.formatted_address;
    return location
      ? [formatted_address, location.lat, location.lng]
      : [null, null, null];
  } catch (error) {
    console.error('❌ Error geocoding:', error);
    return [null, null, null];
  }
};
