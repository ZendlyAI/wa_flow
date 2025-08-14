// import OpenAI from 'openai';

// import { Store } from '../types/stores';

// import { parseStoresFromMatrix } from '../utils';

// const client = new OpenAI();
// // const client = new OpenAI();

// const askOpenAI = async (question: string) => {
//   const response = await client.responses.create({
//     model: 'gpt-4.1',
//     input: question,
//   });
//   console.log('OpenAI response:', response);
//   return response.output_text || 'No response from OpenAI';
// };

// type Coordinates =
//   | {
//       latitude: number;
//       longitude: number;
//     }
//   | {
//       title: string;
//       address: string;
//       latitude: number;
//       longitude: number;
//     };

// type Query = {
//   userLocation: Coordinates;
//   storeAddress?: string;
//   storeName?: string;
// };

// type MatchResult = {
//   isMatch: boolean;
//   matches: Store[];
//   suggestedStore?: Store;
// };

// export async function searchStoreOpenAI(
//   spreadsheet: string[][],
//   query: Query
// ): Promise<MatchResult> {
//   const stores = parseStoresFromMatrix(spreadsheet);

//   const prompt = `Given a store name, address, and user location, analyze and respond as follows:
// 1. Check if any store in the provided list matches exactly in both name and address.
//     If yes, return that store’s name, address, and search for the store exact location, you can use internet to get the real store name, address, and location.
//     If no exact matches are found:
//         - Search for partial matches by store name or by address that are similarity or nearby user location, this is NOT an exact match but it's a partial match.
//         - If a store has the same address but different name, this is NOT an exact match but it's a partial match.
//         - If a store has the same name but different address, this is NOT an exact match but it's a partial match.
//     If no matches are found, but there is any partial match:
//         - Suggest the best match based on the closest address or name similarity or nearby user location.
//         - If the user location is near a store, suggest that store as a potential match within ~2k radius.
//     - Return all matches found, specifying if they match by name or address or location.

// 2. If no exact matches are found: YOU MUST Suggest stores to improve matching:
//   - Given store name find the nearest store(s) to the user's location (within ~2k radius).
//     - From these nearby stores, choose the best suggestion that most closely.

// 3. Complete if there are missing information, like address (with standard abbreviations), location (latitude and longitude) or the name is not correct.

// Stores (JSON):
// ${JSON.stringify(stores, null, 2)}

// Query:
// ${JSON.stringify(query, null, 2)}

// MUST RESPOND STRICTLY IN THE FOLLOWING JSON FORMAT:
// {
//   "isMatch": true | false,
//   "matches": [ {
//     "name": "",
//     "address": "",
//     "location": "",
//     "storeType": "",
//     "latitude": "",
//     "longitude": "",
//     "matchType": "address or name or location"

//   } ],
//   "suggestedStore": {
//     "name": "", 
//     "address": "", 
//     "location": "Latitude <latitud>, Longitude <longitud>",
//     "storeType": "",
//     "latitude": "",
//     "longitude": ""
//     } // (if extact Match is false)
// }
// `;

//   // console.debug('OpenAI prompt:', prompt);

//   const response = await client.chat.completions.create({
//     model: 'gpt-4',
//     temperature: 0.2,
//     messages: [{ role: 'user', content: prompt }],
//   });

//   const json = response.choices[0].message.content || '{}';
//   console.debug('OpenAI response JSON:', json);

//   try {
//     return JSON.parse(json);
//   } catch (e) {
//     throw new Error('OpenAI response parsing failed: ' + json);
//   }
// }
