// Words the site itself uses, per interface language. The stories, Learn entries and profiles bring their own
// language; this file is only the frame around them (menus, labels, buttons, notes).
//
// English is the main language: it is served at the site root and is the fallback for any key a language leaves
// out. Every other language is served under /<code>/ (Indonesian at /id/).
//
// To add a language: copy the `id` block, give it the new BCP 47 code, translate the values (keep the keys), and
// add the code to LANGS. A key you leave out shows in English until someone translates it.

export const DEFAULT_LANG = "en";
export const LANGS = ["en", "id"];

const en = {
  // Number and date formatting, and the language names and country names come from Intl in this locale.
  locale: "en",
  name: "English",

  // Header and footer
  // Header order: Stories · Discover · Learn · Codes · Share · Open data · GitHub · language. `discover` is for the
  // Discover page (map and table).
  nav: { stories: "Stories", discover: "Discover", learn: "Learn", codes: "Codes", share: "Share", contribute: "Contribute", data: "Open data", github: "GitHub" },
  switchTo: "Read this site in",
  footTagline: "Open Origin · stories from where it grows.",
  footLicence: "Stories are CC BY 4.0, credited to the people who told them. Code is Apache-2.0. Altitude and tasting notes are typical ranges; every harvest is different.",
  siteDescription: "Open, community-written stories of coffee, cocoa, tea, spices, vanilla, honey and palm sugar, told from where they grow.",

  // Home page
  eyebrowCount: (stories, countries) => `An open collection · ${stories} ${stories === 1 ? "story" : "stories"} · ${countries} ${countries === 1 ? "country" : "countries"}`,
  heroTitle: "Every cup, bar and jar starts with <em>someone's</em> harvest.",
  heroLede: "Open Origin collects the stories behind coffee, cocoa, tea, spices, vanilla, honey and palm sugar: the land, the process and the people, told in their own words. Anyone can read them, reuse them and add their own.",
  shareStory: "Share a story",
  readStories: "Read the stories",
  routeLabel: "Stories by longitude",
  routeNote: "Each dot is a country, placed west to east by longitude.",
  west: "W", east: "E",
  nStories: (n) => `${n} ${n === 1 ? "story" : "stories"}`,
  collection: "The collection",
  storiesTitle: "Stories from the farms",
  storiesLede: "Each origin has a profile of its land and history, and below it the stories of the farmers and movements who work there. We are starting in the Indonesian archipelago, with coffee, cocoa, tea, spices, vanilla, honey and palm sugar.",
  filterLabel: "Filter stories",
  all: "All",
  originsTitle: "Origins",
  originsSub: "Profiles of growing regions",
  voicesTitle: "Farmers &amp; movements",
  voicesSub: "Stories from single farms, groups and movements",
  noVoices: "<strong>The first farmer stories are still to come.</strong> Two farms on the same hill can grow something completely different: another slope, another process, another family. That difference is what Open Origin is for. Grow coffee, cocoa, tea or spices, keep bees or tap palms, or work with people who do? Tell their story.",
  shareFarmerStory: "Share a farmer story",
  learnTitle: "What the words mean",
  learnLede: "The species, processes and terms you meet in the stories, explained. Anyone can add or improve an entry.",
  learnTypes: { species: "Species", process: "Processes", variety: "Varieties", term: "Terms" },
  learnType: { species: "species", process: "process", variety: "variety", term: "term" },
  contributeTitle: "Tell us where it grows",
  contributeLede: "Farmers, cooperatives, roasters and researchers are all welcome. You don't need to know code: fill in a form and we turn it into a page.",
  step: (n) => `Step ${n}`,
  steps: [
    ["Fill in the form", "Where it grows, who grows it, how it is processed, and the story in any language."],
    ["Ask for consent", "Everyone named or pictured must agree. Locations are rounded so no one's home can be found."],
    ["We review", "A maintainer checks the details with you and turns your submission into a story page."],
    ["It goes live", "Your story is published under CC BY 4.0 with your name on it."],
  ],
  contributorGuide: "Contributor guide",

  // Cards
  movement: "Movement",
  alsoIn: "Also in",
  originProfile: "Origin profile",
  localStories: (n) => `${n} local ${n === 1 ? "story" : "stories"}`,
  waitingStories: "waiting for farmer stories",
  partOf: "Part of",
  toldBy: "Told by",
  inYourLanguage: null, // only set for languages other than English

  // Story page
  allStories: "← All stories",
  readIn: "Read in another language",
  readTranslation: null,
  fields: {
    producer: "Producer", altitude: "Altitude", varieties: "Varieties", species: "Species", process: "Process", harvest: "Harvest",
    traceability: "Traceability", tastes: "Tastes of", toldBy: "Told by", code: "Code", areaCodes: "Area codes", toldIn: "Told in",
    translatedBy: "Translated by", addedBy: "Added by", type: "Type", grows: "Grows", worksWith: "Works with", since: "Growing since",
    farmSize: "Farm size", members: "Members", website: "Website", lineage: "Lineage", alsoCalled: "Also called", stature: "Stature",
    yield: "Yield", cupQuality: "Cup quality", leafRust: "Leaf rust", bestAt: "Best at",
  },
  masl: "masl",
  farmers: (n) => `${n} farmers`,
  photo: "Photo",
  resized: "resized",
  lots: "Lots",
  lotsIntro: "A lot is one harvest, shipment or production run: what a buyer buys. Process, variety and quality can change from lot to lot, so each lot is listed on its own.",
  farmersFrom: "Farmers from this origin",
  noFarmers: "No farmer from here has told their story yet.",
  tellFarm: "Tell a farm's story",
  partOfOrigin: "Part of the origin",
  sources: "Sources",
  suggestEdit: "Suggest an edit",
  translateStory: "Translate this story",
  editorial: "Open Origin Editorial",
  nationalCode: (id) => `National area code${id ? " (Kemendagri)" : ""}`,
  plusTitle: "Plus Code (about 5 km cell)",
  h3Title: (r) => `H3 cell, resolution ${r}`,

  // Lot table
  lot: "Lot", specification: "Specification", quality: "Quality",
  blendedWith: (crop) => `Blended with ${crop} from`,
  blendFrom: "Blend from", from: "From", filedBy: "Filed by", processedBy: "Processed by", roastedBy: "Roasted by", soldBy: "Sold by",
  testedBy: "Tested by", selfReported: "Self-reported", notMeasured: "Not measured", certificate: "Certificate", source: "Source",
  and: "and",

  // Learn page
  learnBack: "← Learn",
  storiesWith: (t) => `Stories with ${t.toLowerCase()}`,
  improveEntry: "Improve this entry",
  translatedFrom: null,

  // Producer page
  ptype: { farmer: "Farmer", group: "Producer group", estate: "Estate", processor: "Processing facility", roaster: "Roaster", lab: "Testing lab or grader" },
  producerFallback: "Producer",
  storiesHead: "Stories",
  noLinkedStories: "No stories linked to this profile yet.",
  otherLots: "Other lots",
  lotsHandled: (name, lab) => `Lots ${name} ${lab ? "tested" : "grew, processed, roasted or sold"}.`,
  publicProfile: (name) => `This profile was put together only from what has already been published about ${name}; see the sources below. If this is you, you can correct, complete or remove it.`,
  improveProfile: "Improve this profile",

  // Codes page
  lookupLabel: "Look up a code", lookupButton: "Open", backHome: "← Open Origin",

  // Words that come from data fields. A key missing here is shown as the field value with its first letter capital.
  told: { farmer: "the farmer", "producer-group": "the producer group", roaster: "a roaster", researcher: "a researcher", editor: "Open Origin Editorial", other: "a contributor" },
  trace: { farm: "Traced to the farm", group: "Traced to the producer group", region: "Traced to the region", country: "Traced to the country", blend: "Blend" },
  // Illustrated journey and "at a glance" on a story page
  glance: "At a glance",
  aboveSea: "above sea level",
  journeySteps: "Journey steps",
  journeyCue: "Scroll to follow it, stop by stop. Tap Why? for more; the numbers link to the sources.",
  followJourney: (n) => `Follow the journey in pictures: ${n} stops ↓`,
  why: "Why?",
  stage: { farm: "On the farm", harvest: "Harvest", process: "Processing", dry: "Drying", sort: "Sorting", roast: "Roasting", brew: "In the cup", market: "To market", other: "Along the way" },
  crops: {},
  qfields: {},
  terms: {},

  // Discover page (/discover/): search, crop filters, map and table.
  discover: {
    title: "Discover",
    description: "Search every origin and farm story in Open Origin, filter by crop, and see them on a map or in a table.",
    eyebrow: (n, m, p) => `Discover · ${n} ${n === 1 ? "story" : "stories"} · ${m} in ${p} ${p === 1 ? "place" : "places"} on the map`,
    heading: "Discover where it grows",
    lede: "Every origin profile and farm story, on a map and in a table. Search by name, place, variety, process or code. Points are rounded to about 1 km, so no one's home can be found. A farm story without its own point is shown at its origin.",
    searchLabel: "Search stories",
    placeholder: "Search: Gayo, washed, Typica, O-…",
    view: "View", map: "Map", table: "Table",
    filterLabel: "Filter by crop", allCrops: "All crops",
    // The count under the filters; the page's script fills it in as the search changes.
    story: "story", stories: "stories", onMap: "on the map",
    mapLabel: "Map of stories. The same stories are in the table view.",
    basemap: 'Basemap by <a href="https://openfreemap.org">OpenFreeMap</a>, © <a href="https://www.openmaptiles.org/">OpenMapTiles</a>, data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Story points CC BY 4.0.',
    cols: { story: "Story", crop: "Crop", where: "Where", altitude: "Altitude", varieties: "Varieties · process", code: "Code", map: "Map" },
    kinds: { origin: "Origin profile", farm: "Farm story", movement: "Movement" },
    showOnMap: "Show on map",
    showOnMapLabel: (title) => `Show ${title} on the map`,
    noLocation: "No location",
    none: "No story matches. Try another word or crop.",
    fromHome: "Search them all on a map or in a table",
    // Shown over the map when someone scrolls or drags it with one finger.
    gestures: { windows: "Use Ctrl + scroll to zoom the map", mac: "Use ⌘ + scroll to zoom the map", mobile: "Use two fingers to move the map" },
  },
};

const id = {
  locale: "id",
  name: "Bahasa Indonesia",

  nav: { stories: "Cerita", discover: "Jelajahi", learn: "Belajar", codes: "Kode", share: "Bagikan", contribute: "Ikut menulis", data: "Data terbuka", github: "GitHub" },
  switchTo: "Baca situs ini dalam",
  footTagline: "Open Origin · cerita dari tempat ia tumbuh.",
  footLicence: "Cerita berlisensi CC BY 4.0 dan dikreditkan kepada orang yang menuturkannya. Kode berlisensi Apache-2.0. Ketinggian dan catatan rasa adalah kisaran umum; setiap panen berbeda.",
  siteDescription: "Cerita terbuka yang ditulis bersama tentang kopi, kakao, teh, rempah, vanili, madu dan gula aren, dituturkan dari tempat ia tumbuh.",

  eyebrowCount: (stories, countries) => `Koleksi terbuka · ${stories} cerita · ${countries} negara`,
  heroTitle: "Setiap cangkir, batang cokelat dan toples berawal dari panen <em>seseorang</em>.",
  heroLede: "Open Origin mengumpulkan cerita di balik kopi, kakao, teh, rempah, vanili, madu dan gula aren: tanahnya, prosesnya dan orang-orangnya, dituturkan dengan kata-kata mereka sendiri. Siapa pun boleh membaca, memakai ulang dan menambahkan ceritanya sendiri.",
  shareStory: "Bagikan cerita",
  readStories: "Baca ceritanya",
  routeLabel: "Cerita menurut garis bujur",
  routeNote: "Setiap titik adalah satu negara, diurutkan dari barat ke timur menurut garis bujur.",
  west: "BB", east: "BT",
  nStories: (n) => `${n} cerita`,
  collection: "Koleksi",
  storiesTitle: "Cerita dari kebun",
  storiesLede: "Setiap origin punya profil tentang tanah dan sejarahnya, dan di bawahnya cerita para petani dan gerakan yang bekerja di sana. Kami mulai dari Nusantara, dengan kopi, kakao, teh, rempah, vanili, madu dan gula aren.",
  filterLabel: "Saring cerita",
  all: "Semua",
  originsTitle: "Origin",
  originsSub: "Profil daerah tanam",
  voicesTitle: "Petani &amp; gerakan",
  voicesSub: "Cerita dari satu kebun, kelompok dan gerakan",
  noVoices: "<strong>Cerita petani yang pertama masih ditunggu.</strong> Dua kebun di bukit yang sama bisa menghasilkan sesuatu yang sangat berbeda: lereng lain, proses lain, keluarga lain. Perbedaan itulah alasan Open Origin ada. Menanam kopi, kakao, teh atau rempah, beternak lebah atau menyadap aren, atau bekerja dengan mereka? Ceritakan kisah mereka.",
  shareFarmerStory: "Bagikan cerita petani",
  learnTitle: "Arti kata-katanya",
  learnLede: "Spesies, proses dan istilah yang muncul di cerita, dijelaskan. Siapa pun boleh menambah atau memperbaiki entri.",
  learnTypes: { species: "Spesies", process: "Proses", variety: "Varietas", term: "Istilah" },
  learnType: { species: "spesies", process: "proses", variety: "varietas", term: "istilah" },
  contributeTitle: "Ceritakan di mana ia tumbuh",
  contributeLede: "Petani, koperasi, roaster dan peneliti semuanya dipersilakan. Tidak perlu paham kode: isi formulir dan kami ubah menjadi halaman.",
  step: (n) => `Langkah ${n}`,
  steps: [
    ["Isi formulir", "Di mana ia tumbuh, siapa yang menanam, bagaimana diolah, dan ceritanya dalam bahasa apa pun."],
    ["Minta persetujuan", "Setiap orang yang disebut atau difoto harus setuju. Lokasi dibulatkan supaya rumah siapa pun tidak bisa ditemukan."],
    ["Kami periksa", "Seorang pengelola memeriksa detailnya bersama Anda lalu mengubah kiriman Anda menjadi halaman cerita."],
    ["Terbit", "Cerita Anda diterbitkan dengan lisensi CC BY 4.0 atas nama Anda."],
  ],
  contributorGuide: "Panduan kontributor",

  movement: "Gerakan",
  alsoIn: "Juga dalam",
  originProfile: "Profil origin",
  localStories: (n) => `${n} cerita lokal`,
  waitingStories: "menunggu cerita petani",
  partOf: "Bagian dari",
  toldBy: "Dituturkan oleh",
  inYourLanguage: "Ada dalam Bahasa Indonesia",

  allStories: "← Semua cerita",
  readIn: "Baca dalam bahasa lain",
  readTranslation: "Cerita ini juga tersedia dalam Bahasa Indonesia.",
  fields: {
    producer: "Produsen", altitude: "Ketinggian", varieties: "Varietas", species: "Spesies", process: "Proses", harvest: "Panen",
    traceability: "Keterlacakan", tastes: "Rasa", toldBy: "Dituturkan oleh", code: "Kode", areaCodes: "Kode wilayah", toldIn: "Bahasa asli",
    translatedBy: "Diterjemahkan oleh", addedBy: "Ditambahkan oleh", type: "Jenis", grows: "Menanam", worksWith: "Mengolah", since: "Menanam sejak",
    farmSize: "Luas kebun", members: "Anggota", website: "Situs web", lineage: "Silsilah", alsoCalled: "Nama lain", stature: "Postur",
    yield: "Hasil", cupQuality: "Mutu seduhan", leafRust: "Karat daun", bestAt: "Paling cocok di",
  },
  masl: "mdpl",
  farmers: (n) => `${n} petani`,
  photo: "Foto",
  resized: "diperkecil",
  lots: "Lot",
  lotsIntro: "Lot adalah satu panen, satu pengiriman atau satu kali produksi: yang benar-benar dibeli pembeli. Proses, varietas dan mutu bisa berubah dari lot ke lot, jadi setiap lot dicatat sendiri.",
  farmersFrom: "Petani dari origin ini",
  noFarmers: "Belum ada petani dari sini yang menuturkan ceritanya.",
  tellFarm: "Ceritakan kisah sebuah kebun",
  partOfOrigin: "Bagian dari origin",
  sources: "Sumber",
  suggestEdit: "Usulkan perbaikan",
  translateStory: "Terjemahkan cerita ini",
  editorial: "Redaksi Open Origin",
  nationalCode: (id) => `Kode wilayah nasional${id ? " (Kemendagri)" : ""}`,
  plusTitle: "Plus Code (sel sekitar 5 km)",
  h3Title: (r) => `Sel H3, resolusi ${r}`,

  lot: "Lot", specification: "Spesifikasi", quality: "Mutu",
  blendedWith: (crop) => `Dicampur dengan ${crop} dari`,
  blendFrom: "Campuran dari", from: "Dari", filedBy: "Dicatat oleh", processedBy: "Diolah oleh", roastedBy: "Disangrai oleh", soldBy: "Dijual oleh",
  testedBy: "Diuji oleh", selfReported: "Dilaporkan sendiri", notMeasured: "Tidak diukur", certificate: "Sertifikat", source: "Sumber",
  and: "dan",

  learnBack: "← Belajar",
  storiesWith: (t) => `Cerita dengan ${t.toLowerCase()}`,
  improveEntry: "Perbaiki entri ini",
  translatedFrom: "Entri ini belum diterjemahkan, jadi ditampilkan dalam bahasa Inggris.",

  ptype: { farmer: "Petani", group: "Kelompok produsen", estate: "Perkebunan", processor: "Unit pengolahan", roaster: "Roaster", lab: "Laboratorium uji atau grader" },
  producerFallback: "Produsen",
  storiesHead: "Cerita",
  noLinkedStories: "Belum ada cerita yang ditautkan ke profil ini.",
  otherLots: "Lot lainnya",
  lotsHandled: (name, lab) => `Lot yang ${lab ? "diuji" : "ditanam, diolah, disangrai atau dijual"} oleh ${name}.`,
  publicProfile: (name) => `Profil ini disusun hanya dari informasi tentang ${name} yang sudah pernah diterbitkan; lihat sumbernya di bawah. Jika ini tentang Anda, Anda bisa memperbaiki, melengkapi atau menghapusnya.`,
  improveProfile: "Perbaiki profil ini",

  lookupLabel: "Cari kode", lookupButton: "Buka", backHome: "← Open Origin",

  told: { farmer: "petaninya", "producer-group": "kelompok produsennya", roaster: "seorang roaster", researcher: "seorang peneliti", editor: "Redaksi Open Origin", other: "seorang kontributor" },
  trace: { farm: "Terlacak sampai kebun", group: "Terlacak sampai kelompok produsen", region: "Terlacak sampai daerah", country: "Terlacak sampai negara", blend: "Campuran" },
  glance: "Sekilas",
  aboveSea: "di atas permukaan laut",
  journeySteps: "Langkah perjalanan",
  journeyCue: "Scroll untuk mengikutinya, langkah demi langkah. Ketuk Kenapa? untuk detail; angka di belakang kalimat menuju sumbernya.",
  followJourney: (n) => `Ikuti perjalanannya dalam gambar: ${n} langkah ↓`,
  why: "Kenapa?",
  stage: { farm: "Di kebun", harvest: "Panen", process: "Pengolahan", dry: "Penjemuran", sort: "Sortasi", roast: "Penyangraian", brew: "Di cangkir", market: "Ke pasar", other: "Di perjalanan" },
  crops: {
    coffee: { label: "Kopi", journey: "Dari kebun ke cangkir", use: "Di cangkir", grading: "Cara kopi dinilai" },
    cocoa: { label: "Kakao", journey: "Dari pohon ke cokelat", use: "Menjadi cokelat", grading: "Cara kakao dinilai" },
    tea: { label: "Teh", journey: "Dari kebun ke cangkir", use: "Di cangkir" },
    spice: { label: "Rempah", journey: "Dari kebun ke dapur", use: "Di dapur" },
    vanilla: { label: "Vanili", journey: "Dari sulur ke dapur", use: "Di dapur" },
    honey: { label: "Madu", journey: "Dari sarang ke toples", use: "Di meja makan" },
    sugar: { label: "Gula aren & kelapa", journey: "Dari pohon ke dapur", use: "Di dapur" },
  },
  // Quality field labels (the units stay as they are).
  qfields: {
    cupping_score: "Skor cupping", cupping_protocol: "Protokol", defects_primary: "Cacat primer", defects_secondary: "Cacat sekunder", moisture_pct: "Kadar air", grade: "Grade", screen_size: "Ukuran biji", water_activity: "Aktivitas air",
    fermented_pct: "Terfermentasi baik", slaty_pct: "Slaty", mouldy_pct: "Berjamur", bean_count_per_100g: "Jumlah biji",
    flush: "Petikan", density_g_l: "Densitas", volatile_oil_pct: "Minyak atsiri", pod_length_cm: "Panjang polong", vanillin_pct: "Vanilin",
    botanical_source: "Sumber nektar", hmf_mg_kg: "HMF", diastase_schade: "Diastase", colour: "Warna", sucrose_pct: "Sukrosa",
  },
  // Processes, forms and other values written as slugs in the data. Proper names (Arabica, Apis dorsata) stay as they are.
  // "<crop>:<slug>" wins over "<slug>" where one word means two things ("green" tea vs. green coffee).
  terms: {
    washed: "Olah basah (washed)", natural: "Natural (proses kering)", honey: "Honey", "wet-hulled": "Giling basah", anaerobic: "Anaerob", fermented: "Fermentasi",
    unfermented: "Tanpa fermentasi", "sun-dried": "Jemur matahari", "machine-dried": "Pengering mesin", white: "Teh putih", "tea:green": "Teh hijau", oolong: "Oolong",
    black: "Teh hitam", dark: "Teh gelap", "sun-cured": "Diperam dengan matahari", "oven-cured": "Diperam dengan oven", raw: "Mentah (raw)", filtered: "Disaring",
    dehumidified: "Dikurangi kadar airnya", creamed: "Creamed", "open-pan": "Wajan terbuka", vacuum: "Vakum", other: "Lainnya",
    cherry: "Buah ceri", parchment: "Gabah (HS)", green: "Biji hijau (green bean)", roasted: "Sangrai",
    pods: "Buah kakao", "wet-beans": "Biji basah", "dried-beans": "Biji kering", nibs: "Nib", chocolate: "Cokelat",
    "fresh-leaf": "Daun segar", "made-tea": "Teh jadi", fresh: "Segar", dried: "Kering", ground: "Bubuk", oil: "Minyak",
    "green-pods": "Polong hijau", "cured-pods": "Polong peram", extract: "Ekstrak", powder: "Bubuk",
    comb: "Sarang", liquid: "Cair", crystallised: "Mengkristal", sap: "Nira", block: "Cetak", granulated: "Semut (kristal)",
    nutmeg: "Pala", clove: "Cengkeh", pepper: "Lada", cinnamon: "Kayu manis", cardamom: "Kapulaga", ginger: "Jahe", turmeric: "Kunyit",
    "stingless-bee": "Lebah tanpa sengat (kelulut)", aren: "Aren", coconut: "Kelapa", lontar: "Lontar", nipa: "Nipah",
    // Variety traits
    low: "rendah", medium: "sedang", high: "tinggi", "very high": "sangat tinggi", fair: "cukup", good: "baik", "very good": "sangat baik", exceptional: "istimewa",
    dwarf: "pendek (katai)", "semi-dwarf": "semi-pendek", tall: "tinggi", resistant: "tahan", tolerant: "toleran", susceptible: "rentan",
  },

  discover: {
    title: "Jelajahi",
    description: "Cari semua profil origin dan cerita kebun di Open Origin, saring per komoditas, lalu lihat di peta atau dalam tabel.",
    eyebrow: (n, m, p) => `Jelajahi · ${n} cerita · ${m} di ${p} tempat pada peta`,
    heading: "Jelajahi tempat asalnya",
    lede: "Semua profil origin dan cerita kebun, di peta dan dalam tabel. Cari menurut nama, tempat, varietas, proses, atau kode. Titik dibulatkan sekitar 1 km supaya rumah siapa pun tidak bisa ditemukan. Cerita kebun tanpa titik sendiri ditampilkan di titik origin-nya.",
    searchLabel: "Cari cerita",
    placeholder: "Cari: Gayo, washed, Typica, O-…",
    view: "Tampilan", map: "Peta", table: "Tabel",
    filterLabel: "Saring per komoditas", allCrops: "Semua komoditas",
    story: "cerita", stories: "cerita", onMap: "di peta",
    mapLabel: "Peta cerita. Cerita yang sama ada di tampilan tabel.",
    basemap: 'Peta dasar dari <a href="https://openfreemap.org">OpenFreeMap</a>, © <a href="https://www.openmaptiles.org/">OpenMapTiles</a>, data © kontributor <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>. Titik cerita CC BY 4.0.',
    cols: { story: "Cerita", crop: "Komoditas", where: "Lokasi", altitude: "Ketinggian", varieties: "Varietas · proses", code: "Kode", map: "Peta" },
    kinds: { origin: "Profil origin", farm: "Cerita kebun", movement: "Gerakan" },
    showOnMap: "Lihat di peta",
    showOnMapLabel: (title) => `Lihat ${title} di peta`,
    noLocation: "Tanpa lokasi",
    none: "Tidak ada cerita yang cocok. Coba kata atau komoditas lain.",
    fromHome: "Cari semuanya di peta atau dalam tabel",
    gestures: { windows: "Tekan Ctrl sambil scroll untuk memperbesar peta", mac: "Tekan ⌘ sambil scroll untuk memperbesar peta", mobile: "Gunakan dua jari untuk menggeser peta" },
  },
};

const STRINGS = { en, id };

// The words for one language, with English filling any gap (nested objects are filled key by key).
export function strings(lang) {
  const t = STRINGS[lang] || en;
  if (t === en) return en;
  const out = { ...en };
  for (const [k, v] of Object.entries(t)) out[k] = v && typeof v === "object" && !Array.isArray(v) && typeof en[k] === "object" ? { ...en[k], ...v } : (v ?? en[k]);
  return out;
}
