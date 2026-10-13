import type { Localized } from "./i18n/config";

export type Region = "agadir" | "north" | "inland" | "south";

export type Destination = {
  slug: string;
  name: string;
  region: Region;
  /** Road distance from Agadir–Al Massira Airport (AGA), km. */
  km: number;
  /** Typical drive time from AGA, minutes. */
  minutes: number;
  /** Regular one-way price for a standard car (1–3 passengers), EUR. */
  listEur: number;
  /** What we charge: listEur less the launch discount. */
  priceEur: number;
  /** Surf town: surfboards and other sports bags ride free. */
  surf?: boolean;
  image: string;
  lat: number;
  lng: number;
  /** Neighbourhoods, beaches, surf spots — used by the booking search. */
  aliases: string[];
  blurb: Localized;
};

/** Launch offer, applied to every route. Shown as a struck-through regular price. */
export const LAUNCH_DISCOUNT = 0.2;

const routes: Omit<Destination, "priceEur">[] = [
  {
    slug: "agadir",
    name: "Agadir City & Bay",
    region: "agadir",
    km: 25,
    minutes: 30,
    listEur: 25,
    image: "hero-beach",
    lat: 30.411,
    lng: -9.598,
    aliases: ["Agadir", "Founty", "Sonaba", "Secteur Touristique", "Talborjt", "Charaf", "Hay Mohammadi", "Agadir Bay", "Corniche", "Souk El Had"],
    blurb: {
      en: "Door-to-door to your hotel, riad or apartment anywhere along Agadir's 10 km bay — Founty, Sonaba, the tourist zone, Talborjt and the city centre.",
      fr: "Porte-à-porte jusqu'à votre hôtel, riad ou appartement le long des 10 km de la baie d'Agadir — Founty, Sonaba, la zone touristique, Talborjt et le centre-ville.",
      de: "Von Tür zu Tür zu Ihrem Hotel, Riad oder Apartment an der 10 km langen Bucht von Agadir — Founty, Sonaba, Touristenzone, Talborjt und Stadtzentrum.",
      es: "Puerta a puerta hasta tu hotel, riad o apartamento en cualquier punto de los 10 km de la bahía de Agadir: Founty, Sonaba, la zona turística, Talborjt y el centro.",
    },
  },
  {
    slug: "agadir-marina",
    name: "Agadir Marina & Kasbah",
    region: "agadir",
    km: 28,
    minutes: 35,
    listEur: 27,
    image: "marina",
    lat: 30.428,
    lng: -9.622,
    aliases: ["Marina", "Kasbah", "Agadir Oufella", "Port", "Anza", "Les Amicales"],
    blurb: {
      en: "Straight to the Marina residences, the port district, Anza and the foot of the Agadir Oufella Kasbah — the city's sunset balcony.",
      fr: "Directement aux résidences de la Marina, au quartier du port, à Anza et au pied de la Kasbah d'Agadir Oufella, le balcon du coucher de soleil.",
      de: "Direkt zu den Marina-Residenzen, zum Hafenviertel, nach Anza und an den Fuß der Kasbah Agadir Oufella — dem Sonnenuntergangs-Balkon der Stadt.",
      es: "Directo a las residencias de la Marina, el barrio del puerto, Anza y a los pies de la Kasbah de Agadir Oufella, el balcón del atardecer.",
    },
  },
  {
    slug: "inezgane",
    name: "Inezgane & Aït Melloul",
    region: "agadir",
    km: 12,
    minutes: 15,
    listEur: 18,
    image: "agadir-view",
    lat: 30.355,
    lng: -9.54,
    aliases: ["Inezgane", "Aït Melloul", "Ait Melloul", "Dcheira", "Tikiouine", "Lqliaa"],
    blurb: {
      en: "The closest run from the terminal: Inezgane's famous souk, Aït Melloul, Dcheira and Tikiouine in about fifteen minutes.",
      fr: "Le trajet le plus court depuis le terminal : le célèbre souk d'Inezgane, Aït Melloul, Dcheira et Tikiouine en une quinzaine de minutes.",
      de: "Die kürzeste Fahrt ab Terminal: Inezganes berühmter Souk, Aït Melloul, Dcheira und Tikiouine in rund fünfzehn Minuten.",
      es: "El trayecto más corto desde la terminal: el famoso zoco de Inezgane, Aït Melloul, Dcheira y Tikiouine en unos quince minutos.",
    },
  },
  {
    slug: "aourir",
    surf: true,
    name: "Aourir & Banana Village",
    region: "north",
    km: 38,
    minutes: 45,
    listEur: 35,
    image: "camel-beach",
    lat: 30.492,
    lng: -9.637,
    aliases: ["Aourir", "Banana Village", "Banana Beach", "Tamaraght road", "Imi Ouaddar"],
    blurb: {
      en: "North along the coast road to Aourir — banana groves, the Thursday souk and the first surf breaks of Banana Point.",
      fr: "Cap au nord par la route côtière jusqu'à Aourir — bananeraies, souk du jeudi et premières vagues de Banana Point.",
      de: "Die Küstenstraße nach Norden bis Aourir — Bananenhaine, Donnerstags-Souk und die ersten Surfspots am Banana Point.",
      es: "Hacia el norte por la carretera de la costa hasta Aourir: plantaciones de plátanos, el zoco del jueves y las primeras olas de Banana Point.",
    },
  },
  {
    slug: "tamraght",
    surf: true,
    name: "Tamraght",
    region: "north",
    km: 40,
    minutes: 48,
    listEur: 38,
    image: "tamraght",
    lat: 30.51,
    lng: -9.678,
    aliases: ["Tamraght", "Tamraght surf camp", "Devil's Rock", "Crocodile Beach", "Imourane"],
    blurb: {
      en: "The laid-back surf village between Aourir and Taghazout. We drop you at your surf camp or guesthouse — boards ride free in the van.",
      fr: "Le village surf décontracté entre Aourir et Taghazout. On vous dépose à votre surf camp ou maison d'hôtes — vos planches voyagent avec vous.",
      de: "Das entspannte Surfdorf zwischen Aourir und Taghazout. Wir bringen Sie bis zum Surfcamp oder Gästehaus — Boards fahren im Van mit.",
      es: "El tranquilo pueblo surfero entre Aourir y Taghazout. Te dejamos en tu surf camp o casa de huéspedes; las tablas viajan contigo.",
    },
  },
  {
    slug: "taghazout",
    surf: true,
    name: "Taghazout",
    region: "north",
    km: 45,
    minutes: 50,
    listEur: 40,
    image: "taghazout-boats",
    lat: 30.545,
    lng: -9.709,
    aliases: ["Taghazout", "Anchor Point", "Panoramas", "Hash Point", "Killer Point", "Mysteries", "Surf camp"],
    blurb: {
      en: "Morocco's surf capital: blue boats, Anchor Point and rooftop sunsets. Fixed price, surfboards welcome, driver waiting at arrivals.",
      fr: "La capitale marocaine du surf : barques bleues, Anchor Point et couchers de soleil sur les terrasses. Prix fixe, planches acceptées, chauffeur à l'arrivée.",
      de: "Marokkos Surf-Hauptstadt: blaue Boote, Anchor Point und Sonnenuntergänge auf den Dachterrassen. Festpreis, Surfboards willkommen, Fahrer wartet am Ausgang.",
      es: "La capital del surf de Marruecos: barcas azules, Anchor Point y atardeceres en las azoteas. Precio cerrado, tablas bienvenidas y conductor esperando en llegadas.",
    },
  },
  {
    slug: "taghazout-bay",
    surf: true,
    name: "Taghazout Bay Resorts",
    region: "north",
    km: 43,
    minutes: 50,
    listEur: 40,
    image: "taghazout-sunset",
    lat: 30.528,
    lng: -9.697,
    aliases: ["Taghazout Bay", "Tazegzout golf", "Tazegzout", "Resort", "Golf"],
    blurb: {
      en: "The new resort coast: Taghazout Bay's beach hotels, golf and residences, reached by private car straight from the arrivals hall.",
      fr: "La nouvelle côte des resorts : hôtels de plage, golf et résidences de Taghazout Bay, en voiture privée dès le hall des arrivées.",
      de: "Die neue Resort-Küste: Strandhotels, Golfplatz und Residenzen von Taghazout Bay, im Privatwagen direkt ab der Ankunftshalle.",
      es: "La nueva costa de resorts: hoteles de playa, golf y residencias de Taghazout Bay, en coche privado desde la sala de llegadas.",
    },
  },
  {
    slug: "paradise-valley",
    name: "Paradise Valley & Imouzzer",
    region: "inland",
    km: 60,
    minutes: 75,
    listEur: 55,
    image: "paradise-valley",
    lat: 30.6,
    lng: -9.49,
    aliases: ["Paradise Valley", "Imouzzer", "Immouzer Ida Outanane", "Aksri", "Tamzergout"],
    blurb: {
      en: "Up into the Atlas foothills — palm gorges, turquoise pools and the honey villages of Imouzzer Ida Outanane.",
      fr: "Dans les contreforts de l'Atlas — gorges de palmiers, vasques turquoise et villages du miel d'Imouzzer Ida Outanane.",
      de: "Hinauf in die Ausläufer des Atlas — Palmenschluchten, türkisfarbene Becken und die Honigdörfer von Imouzzer Ida Outanane.",
      es: "Subiendo a las estribaciones del Atlas: gargantas de palmeras, pozas turquesa y los pueblos de la miel de Imouzzer Ida Outanane.",
    },
  },
  {
    slug: "tamri",
    surf: true,
    name: "Tamri & Cap Ghir",
    region: "north",
    km: 80,
    minutes: 80,
    listEur: 65,
    image: "tamri",
    lat: 30.71,
    lng: -9.82,
    aliases: ["Tamri", "Cap Ghir", "Boilers", "Tamri beach", "Aghroud"],
    blurb: {
      en: "Past Cap Ghir lighthouse to Tamri's wild beaches and the Boilers surf spot — one of the most spectacular drives on the Atlantic coast.",
      fr: "Au-delà du phare du Cap Ghir jusqu'aux plages sauvages de Tamri et au spot des Boilers — l'une des plus belles routes de la côte atlantique.",
      de: "Vorbei am Leuchtturm von Cap Ghir zu den wilden Stränden von Tamri und dem Surfspot Boilers — eine der spektakulärsten Strecken der Atlantikküste.",
      es: "Más allá del faro de Cap Ghir hasta las playas salvajes de Tamri y el spot de Boilers: una de las rutas más espectaculares de la costa atlántica.",
    },
  },
  {
    slug: "imsouane",
    surf: true,
    name: "Imsouane",
    region: "north",
    km: 110,
    minutes: 105,
    listEur: 85,
    image: "imsouane",
    lat: 30.84,
    lng: -9.823,
    aliases: ["Imsouane", "The Bay", "Cathedral", "Imsouane bay"],
    blurb: {
      en: "Home of one of Africa's longest right-hand waves. We know the cliff road and the village lanes, so you arrive relaxed and on time.",
      fr: "Chez l'une des plus longues droites d'Afrique. Nous connaissons la route des falaises et les ruelles du village : vous arrivez détendu et à l'heure.",
      de: "Heimat einer der längsten Rechtswellen Afrikas. Wir kennen die Klippenstraße und die Dorfgassen — Sie kommen entspannt und pünktlich an.",
      es: "Hogar de una de las derechas más largas de África. Conocemos la carretera de los acantilados y las callejuelas del pueblo: llegarás relajado y a tiempo.",
    },
  },
  {
    slug: "taroudant",
    name: "Taroudant",
    region: "inland",
    km: 70,
    minutes: 60,
    listEur: 60,
    image: "taroudant",
    lat: 30.47,
    lng: -8.877,
    aliases: ["Taroudant", "Little Marrakech", "Souss valley", "Freija"],
    blurb: {
      en: "East through the Souss valley's argan and orange groves to the ochre ramparts of Taroudant — 'Little Marrakech'.",
      fr: "Vers l'est à travers les arganiers et orangeraies de la vallée du Souss jusqu'aux remparts ocre de Taroudant, la « petite Marrakech ».",
      de: "Ostwärts durch die Argan- und Orangenhaine des Souss-Tals zu den ockerfarbenen Stadtmauern von Taroudant — dem „kleinen Marrakesch“.",
      es: "Hacia el este, entre arganes y naranjos del valle del Souss, hasta las murallas ocres de Taroudant, la «pequeña Marrakech».",
    },
  },
  {
    slug: "tiznit",
    name: "Tiznit & Aglou",
    region: "south",
    km: 90,
    minutes: 75,
    listEur: 70,
    image: "tiznit",
    lat: 29.698,
    lng: -9.731,
    aliases: ["Tiznit", "Aglou", "Aglou Plage", "Silver souk"],
    blurb: {
      en: "South to the walled silver city of Tiznit and the long surf beach of Aglou, in a comfortable air-conditioned car.",
      fr: "Vers le sud jusqu'à Tiznit, la cité de l'argent aux remparts, et la longue plage de surf d'Aglou, dans une voiture climatisée.",
      de: "Südwärts zur ummauerten Silberstadt Tiznit und zum langen Surfstrand von Aglou — in einem bequemen, klimatisierten Wagen.",
      es: "Hacia el sur, a Tiznit, la ciudad amurallada de la plata, y a la larga playa surfera de Aglou, en un coche cómodo y climatizado.",
    },
  },
  {
    slug: "mirleft",
    surf: true,
    name: "Mirleft",
    region: "south",
    km: 130,
    minutes: 110,
    listEur: 95,
    image: "mirleft",
    lat: 29.582,
    lng: -10.035,
    aliases: ["Mirleft", "Plage Sauvage", "Imin Turga", "Aftas"],
    blurb: {
      en: "Painted village, red cliffs and hidden coves. Mirleft is a long way from the airport — which is exactly why a fixed-price private transfer makes sense.",
      fr: "Village coloré, falaises rouges et criques cachées. Mirleft est loin de l'aéroport — c'est justement pour cela qu'un transfert privé à prix fixe s'impose.",
      de: "Bunte Häuser, rote Klippen und versteckte Buchten. Mirleft liegt weit vom Flughafen — genau deshalb lohnt sich ein privater Transfer zum Festpreis.",
      es: "Pueblo pintado, acantilados rojos y calas escondidas. Mirleft queda lejos del aeropuerto: por eso un traslado privado a precio cerrado tiene todo el sentido.",
    },
  },
  {
    slug: "sidi-ifni",
    surf: true,
    name: "Sidi Ifni & Legzira",
    region: "south",
    km: 160,
    minutes: 140,
    listEur: 115,
    image: "legzira",
    lat: 29.38,
    lng: -10.173,
    aliases: ["Sidi Ifni", "Legzira", "Legzira arch", "Ifni"],
    blurb: {
      en: "Through the Anti-Atlas to the blue-and-white art-deco town of Sidi Ifni and the red stone arch of Legzira beach.",
      fr: "À travers l'Anti-Atlas jusqu'à la ville art déco bleue et blanche de Sidi Ifni et l'arche rouge de la plage de Legzira.",
      de: "Durch den Anti-Atlas zur blau-weißen Art-déco-Stadt Sidi Ifni und zum roten Felsbogen am Strand von Legzira.",
      es: "Atravesando el Anti-Atlas hasta Sidi Ifni, la ciudad art déco azul y blanca, y el arco de piedra roja de la playa de Legzira.",
    },
  },
  {
    slug: "tafraoute",
    name: "Tafraoute",
    region: "inland",
    km: 165,
    minutes: 165,
    listEur: 120,
    image: "tafraoute",
    lat: 29.721,
    lng: -8.975,
    aliases: ["Tafraoute", "Ameln valley", "Napoleon's Hat", "Painted rocks", "Aït Mansour"],
    blurb: {
      en: "Into the pink granite of the Anti-Atlas: Tafraoute, the Ameln valley and the almond-blossom villages. Mountain roads, careful driving.",
      fr: "Au cœur du granit rose de l'Anti-Atlas : Tafraoute, la vallée des Ameln et les villages des amandiers. Routes de montagne, conduite prudente.",
      de: "Hinein in den rosa Granit des Anti-Atlas: Tafraoute, das Ameln-Tal und die Mandelblütendörfer. Bergstraßen, umsichtige Fahrweise.",
      es: "Al granito rosa del Anti-Atlas: Tafraoute, el valle de Ameln y los pueblos del almendro. Carreteras de montaña, conducción cuidadosa.",
    },
  },
  {
    slug: "essaouira",
    name: "Essaouira",
    region: "north",
    km: 200,
    minutes: 165,
    listEur: 130,
    image: "essaouira",
    lat: 31.512,
    lng: -9.77,
    aliases: ["Essaouira", "Mogador", "Sidi Kaouki", "Diabat", "Moulay Bouzerktoun"],
    blurb: {
      en: "Up the Atlantic coast through argan country to the windswept ramparts of Essaouira — with photo stops at the goat-filled argan trees if you like.",
      fr: "Remontez la côte atlantique au pays de l'argan jusqu'aux remparts venteux d'Essaouira — arrêt photo aux chèvres dans les arganiers si vous le souhaitez.",
      de: "Die Atlantikküste hinauf durchs Arganland zu den windumtosten Stadtmauern von Essaouira — gern mit Fotostopp bei den Ziegen in den Arganbäumen.",
      es: "Subiendo por la costa atlántica entre arganes hasta las murallas ventosas de Essaouira, con parada para fotos en las cabras de los arganes si quieres.",
    },
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    region: "inland",
    km: 270,
    minutes: 190,
    listEur: 170,
    image: "marrakech",
    lat: 31.629,
    lng: -7.992,
    aliases: ["Marrakech", "Marrakesh", "Medina", "Gueliz", "Palmeraie", "Hivernage", "Jemaa el-Fna"],
    blurb: {
      en: "Over the High Atlas by motorway to the Red City — straight to your riad's nearest gate, Guéliz, Hivernage or the Palmeraie.",
      fr: "Par l'autoroute à travers le Haut Atlas jusqu'à la Ville rouge — jusqu'à la porte la plus proche de votre riad, Guéliz, l'Hivernage ou la Palmeraie.",
      de: "Über die Autobahn durch den Hohen Atlas in die Rote Stadt — bis zum nächsten Tor Ihres Riads, nach Guéliz, Hivernage oder in die Palmeraie.",
      es: "Por autopista a través del Alto Atlas hasta la Ciudad Roja: hasta la puerta más cercana a tu riad, Guéliz, Hivernage o la Palmeraie.",
    },
  },
];

export const destinations: Destination[] = routes.map((d) => ({
  ...d,
  priceEur: Math.round(d.listEur * (1 - LAUNCH_DISCOUNT)),
}));

export const getDestination = (slug: string) => destinations.find((d) => d.slug === slug);

export const regionOrder: Region[] = ["agadir", "north", "inland", "south"];
