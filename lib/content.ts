export type Ingredient = {
  key: "cardamom" | "cinnamon" | "anise" | "ginger" | "leaf";
  name: string;
  native: string;
  origin: string;
  flavor: string;
  body: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    key: "cardamom",
    name: "Green Cardamom",
    native: "Elaichi",
    origin: "Cardamom Hills, Kerala",
    flavor: "Floral · Eucalyptus · Cool citrus",
    body: "Hand-picked green pods, cracked just before brewing so their oils bloom in the pot. Elaichi is the first scent a dhaba gives off at dawn, and the first note you taste in every cup.",
  },
  {
    key: "cinnamon",
    name: "Ceylon Cinnamon",
    native: "Dalchini",
    origin: "Southern Sri Lanka",
    flavor: "Sweet bark · Honey · Soft warmth",
    body: "True cinnamon quills, rolled paper-thin by hand. It's gentler than cassia and rounds the edges of a strong brew, the way a good host softens a long journey.",
  },
  {
    key: "anise",
    name: "Star Anise",
    native: "Chakri Phool",
    origin: "Guangxi Highlands",
    flavor: "Liquorice · Clove · Deep resin",
    body: "Eight-pointed stars that travelled the old spice routes down to the ports of Karachi and Calcutta. One star, simmered slowly, gives the chai a low, lingering finish.",
  },
  {
    key: "ginger",
    name: "Fresh Ginger",
    native: "Adrak",
    origin: "Hills of Meghalaya",
    flavor: "Fiery · Bright · Peppery bite",
    body: "Crushed with a stone, never grated, so the juice and fibre both go into the boil. This is the adrak that cuts through monsoon rain and winter fog.",
  },
  {
    key: "leaf",
    name: "Assam CTC Leaf",
    native: "Patti",
    origin: "Brahmaputra Valley, Assam",
    flavor: "Malty · Brisk · Burnished copper",
    body: "Tight, granular CTC leaf from estates along the Brahmaputra. It's bold enough to stand up to whole milk and a rolling boil, which is why it's the backbone of every roadside cup.",
  },
];

export const RITUAL_STEPS = [
  {
    n: "01",
    title: "Boil",
    native: "Ubaal",
    body: "Water meets crushed ginger and cracked cardamom over a high flame. We wait for the first rolling boil, when the kitchen starts to smell of the road.",
  },
  {
    n: "02",
    title: "Steep",
    native: "Dum",
    body: "The leaf goes in and the flame drops low. The brew darkens to a burnished copper while the spices give up their oils.",
  },
  {
    n: "03",
    title: "Add Milk",
    native: "Doodh",
    body: "Full-cream milk is poured in a slow spiral. The chai blooms from amber to caramel, then rises toward the rim and is pulled back, three times.",
  },
  {
    n: "04",
    title: "Add Sugar",
    native: "Cheeni",
    body: "Just enough to wake the spice up without hiding it. Some like it kadak, some like it meetha, and every order is balanced by hand.",
  },
  {
    n: "05",
    title: "Pour from Height",
    native: "Dhaar",
    body: "An arm's length above the glass, a long ribbon of chai pulls air into the brew. The pour cools it, froths it and finishes the cup, so the last step is also the loudest.",
  },
];

export type Chai = {
  name: string;
  native: string;
  note: string;
  body: string;
  price: string;
  color: string;
};

export const MENU: Chai[] = [
  {
    name: "Karak Chai",
    native: "کڑک",
    note: "Strong · Bold · Late-night",
    body: "Double-brewed Assam leaf, evaporated milk and a hard boil. It's thick and intense, the cup truckers drive through the night on.",
    price: "£4.2",
    color: "#7a3f1d",
  },
  {
    name: "Kashmiri Pink Chai",
    native: "نون چائے",
    note: "Salted · Nutty · Velvet pink",
    body: "Green gunpowder tea whisked until it blushes rose, then finished with crushed pistachio, almond and a pinch of salt.",
    price: "£5.4",
    color: "#d98fa0",
  },
  {
    name: "Masala Chai",
    native: "مسالہ",
    note: "Spiced · Warming · Classic",
    body: "Our five-spice blend of cardamom, cinnamon, star anise, ginger and clove, pounded fresh each morning.",
    price: "£4.6",
    color: "#a8642f",
  },
  {
    name: "Doodh Patti",
    native: "دودھ پتی",
    note: "Milky · Creamy · Comforting",
    body: "No water at all: leaf simmered straight in full-cream milk until it turns soft caramel. This is the chai of Pakistani homes.",
    price: "£4.4",
    color: "#c9a27a",
  },
  {
    name: "Zafrani Chai",
    native: "زعفرانی",
    note: "Saffron · Honeyed · Golden",
    body: "Kashmiri saffron threads bloomed in warm milk with a whisper of rosewater. It pours molten gold.",
    price: "£6.2",
    color: "#e0a23a",
  },
];

export const MARQUEE_NAMES = [
  "Karak",
  "Kashmiri Pink",
  "Masala",
  "Doodh Patti",
  "Zafrani",
  "Adrak Wali",
  "Elaichi",
  "Gur Wali",
  "Noon Chai",
  "Cutting",
];

export const STORY = {
  eyebrow: "Our Story",
  title: "From the dust of the GT Road to your cup",
  paragraphs: [
    "The Grand Trunk Road runs from Kabul to Kolkata, and for centuries it has been marked by small fires. A brass pot on a clay stove, a charpai under a tin roof, and a chaiwala who knows every traveller by the way they take their tea.",
    "Chai Safar began on that road. We spent two winters drinking our way from Peshawar to Lahore, learning from the men and women who have poured the same cup for forty years. We kept their recipes and their patience, and we bring that same fire to your table.",
  ],
  stats: [
    { value: "1,600", label: "miles of road travelled" },
    { value: "42", label: "chaiwalas who taught us" },
    { value: "5", label: "spices, pounded daily" },
  ],
};
