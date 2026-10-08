/**
 * Stock photos used on guide pages, all from Pixabay (Pixabay Content
 * License: free to use, no attribution required — we credit the photographer
 * anyway). Files live in public/images/photos; alt text is in messages/en.json
 * under `photos.<key>`.
 */
export type PhotoKey = keyof typeof photos;

type PhotoMeta = { width: number; height: number; author: string | null; page: string };

export const photos = {
  "ees-border": { width: 1280, height: 853, author: "ahmadardity", page: "https://pixabay.com/photos/passport-departure-suitcase-luggage-5211227/" },
  "ees-fingerprint": { width: 1280, height: 853, author: "u_h0yvbj97", page: "https://pixabay.com/photos/fingerprint-sensor-4703841/" },
  "ees-departures": { width: 1280, height: 853, author: "JESHOOTS-com", page: "https://pixabay.com/photos/airport-woman-flight-boarding-2373727/" },
  "ees-letter": { width: 1280, height: 853, author: "andrewlloydgordon", page: "https://pixabay.com/photos/hand-man-watch-work-desk-1076597/" },
  "ees-proof": { width: 1280, height: 821, author: "joshuaworoniecki", page: "https://pixabay.com/photos/merry-christmas-boarding-pass-travel-5219496/" },
  "ees-envelope": { width: 1280, height: 853, author: "Pexels", page: "https://pixabay.com/photos/board-desk-pen-surface-table-wood-1854180/" },
  "overstay-board": { width: 1280, height: 853, author: "arminep", page: "https://pixabay.com/photos/airport-departure-board-6911566/" },
  "overstay-flapboard": { width: 1280, height: 868, author: "wal_172619", page: "https://pixabay.com/photos/travel-flight-schedule-ad-plan-4865665/" },
  "rule-calendar": { width: 1280, height: 853, author: "webandi", page: "https://pixabay.com/photos/calendar-annual-calendar-office-1255953/" },
  "dual-passports": { width: 1280, height: 893, author: "jackmac34", page: "https://pixabay.com/photos/passport-visa-border-buffer-3127927/" },
  "permit-street": { width: 1280, height: 854, author: "nudio", page: "https://pixabay.com/photos/lisbon-portugal-streetlife-4697955/" },
  "etias-airport": { width: 1280, height: 878, author: "clickerhappy", page: "https://pixabay.com/photos/airport-terminal-man-travel-1822133/" },
  // Destination hubs and travel-pair pages: one photo per destination.
  "dest-us": { width: 1280, height: 853, author: "c1ri", page: "https://pixabay.com/photos/sunset-manhattan-city-skyline-3875817/" },
  "dest-gb": { width: 1280, height: 855, author: "derwiki", page: "https://pixabay.com/photos/palace-london-parliament-big-ben-530055/" },
  "dest-ca": { width: 1280, height: 853, author: "jungr", page: "https://pixabay.com/photos/moraine-lake-banff-canada-alberta-2314026/" },
  "dest-jp": { width: 1280, height: 851, author: "jackmac34", page: "https://pixabay.com/photos/japan-kyoto-temple-pagoda-buddhism-4649393/" },
  "dest-ke": { width: 1280, height: 853, author: "lesjbohlen", page: "https://pixabay.com/photos/masai-mara-kenya-sunset-africa-3006874/" },
  "dest-mx": { width: 1280, height: 999, author: "walkerssk", page: "https://pixabay.com/photos/mexico-mexico-city-palace-art-2014178/" },
  "dest-za": { width: 1280, height: 853, author: "scapin", page: "https://pixabay.com/photos/cape-town-city-africa-panorama-4620987/" },
  "dest-th": { width: 1280, height: 853, author: "yves_cabral", page: "https://pixabay.com/photos/wat-arun-sunset-bangkok-thailand-5463086/" },
  "dest-rw": { width: 1280, height: 853, author: "portraitor", page: "https://pixabay.com/photos/kigali-rwanda-africa-4811535/" },
  "dest-eg": { width: 1280, height: 612, author: "walkerssk", page: "https://pixabay.com/photos/giza-pyramid-pyramids-1756946/" },
  "dest-ma": { width: 1280, height: 852, author: "a_different_perspective", page: "https://pixabay.com/photos/marrakech-marketplace-morocco-4500910/" },
  "dest-in": { width: 1280, height: 874, author: "dedishari", page: "https://pixabay.com/photos/hawa-mahal-palace-architecture-6156123/" },
  "dest-tr": { width: 1280, height: 853, author: "tedd", page: "https://pixabay.com/photos/sanctuary-istanbul-turkey-1641539/" },
  "dest-au": { width: 1280, height: 850, author: "joseph82", page: "https://pixabay.com/photos/sydney-opera-house-australia-1210550/" },
  "dest-ae": { width: 1280, height: 852, author: "olgaozik", page: "https://pixabay.com/photos/downtown-dubai-uae-tourism-city-4045035/" },
  "dest-ph": { width: 1280, height: 512, author: "richardmc", page: "https://pixabay.com/photos/el-nido-palawan-boat-philippines-2665282/" },
  "dest-nz": { width: 1280, height: 853, author: "timbri97", page: "https://pixabay.com/photos/roys-peak-wanaka-lake-mountains-7008528/" },
  "dest-vn": { width: 1280, height: 720, author: "webkims", page: "https://pixabay.com/photos/vietnam-halong-bay-nature-landscape-2145504/" },
  "dest-cn": { width: 1280, height: 853, author: "zhuyongbo", page: "https://pixabay.com/photos/great-wall-mutianyu-great-wall-china-1711905/" },
  "dest-id": { width: 1280, height: 857, author: "dezalb", page: "https://pixabay.com/photos/indonesia-bali-ulun-danu-1578647/" },
  "dest-br": { width: 1280, height: 854, author: null, page: "https://pixabay.com/photos/rio-de-janeiro-brazil-city-urban-1963744/" },
  "dest-sg": { width: 1280, height: 720, author: "hcshi", page: "https://pixabay.com/photos/singapore-marina-bay-sands-2443529/" },
  "dest-kr": { width: 1280, height: 853, author: "choe", page: "https://pixabay.com/photos/gwanghwamun-seoul-gyeongbok-palace-636113/" },
  "dest-hk": { width: 1280, height: 853, author: "adamhilltravel", page: "https://pixabay.com/photos/star-ferry-victoria-harbour-5403942/" },
  "dest-ie": { width: 1280, height: 853, author: "juliensfotos", page: "https://pixabay.com/photos/cliffs-of-moher-ireland-coast-cliff-10292182/" },
  "dest-my": { width: 1280, height: 853, author: "pexels", page: "https://pixabay.com/photos/kuala-lumpur-twin-tower-city-lights-1283140/" },
  "dest-ge": { width: 1280, height: 853, author: "svetlbel", page: "https://pixabay.com/photos/georgia-tbilisi-capital-panorama-4708365/" },
  "dest-mv": { width: 1280, height: 839, author: "webkims", page: "https://pixabay.com/photos/maldive-islands-beach-day-off-ocean-2190384/" },
  "dest-rs": { width: 1280, height: 851, author: "djordjeuuu", page: "https://pixabay.com/photos/most-na-adi-bridge-belgrade-serbia-4569762/" },
  "dest-tw": { width: 1280, height: 853, author: "tingyaoh", page: "https://pixabay.com/photos/taipei-taiwan-taipei-101-2057818/" },
  "dest-al": { width: 1280, height: 853, author: null, page: "https://pixabay.com/photos/saranda-albania-beach-2798899/" },
  "dest-cy": { width: 1280, height: 853, author: "instagramfotografin", page: "https://pixabay.com/photos/cyprus-pafos-sea-lake-rauh-4135015/" },
  "dest-sa": { width: 1280, height: 853, author: "abdullah_shakoor", page: "https://pixabay.com/photos/khobar-saudi-arabia-east-gulf-2224144/" },
  // Blog posts.
  "blog-ees": { width: 1280, height: 853, author: null, page: "https://pixabay.com/photos/airport-tourism-flying-air-traffic-1515431/" },
  "blog-eta": { width: 1280, height: 853, author: "stocksnap", page: "https://pixabay.com/photos/window-airplane-airline-travel-2600716/" },
  "blog-japan": { width: 1280, height: 720, author: "edo_tokyo_", page: "https://pixabay.com/photos/tokyo-night-street-japan-city-7086446/" },
  "blog-glp1": { width: 1280, height: 880, author: "alexas_fotos", page: "https://pixabay.com/photos/suitcase-antique-leather-1645229/" },
  "blog-thailand": { width: 1280, height: 853, author: "solenec1", page: "https://pixabay.com/photos/thailand-koh-phi-phi-beach-island-2419443/" },
  "blog-overstay": { width: 1280, height: 859, author: "clickerhappy", page: "https://pixabay.com/photos/antwerp-station-hall-building-2428766/" },
} as const satisfies Record<string, PhotoMeta>;

/** The photo for a destination, if we have one (not yet for Nigeria). */
export function destinationPhoto(code: string): PhotoKey | null {
  const key = `dest-${code.toLowerCase()}`;
  return key in photos ? (key as PhotoKey) : null;
}

/** A photo as an Open Graph image entry (served from our own domain). */
export function photoOgImage(key: PhotoKey) {
  const photo = photos[key];
  return { url: `/images/photos/${key}.jpg`, width: photo.width, height: photo.height };
}
