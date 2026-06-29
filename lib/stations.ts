// Catalogue curé des gares de Tokyo "qui valent le détour".
// Volontairement sans suggestions de spots : le but du projet est de
// découvrir chaque quartier par soi-même une fois sur place.

export type LineCode =
  | "yamanote"
  | "chuo"
  | "sobu"
  | "ginza"
  | "marunouchi"
  | "hibiya"
  | "tozai"
  | "chiyoda"
  | "yurakucho"
  | "hanzomon"
  | "namboku"
  | "fukutoshin"
  | "asakusa"
  | "mita"
  | "shinjuku"
  | "oedo"
  | "toyoko"
  | "denentoshi"
  | "oimachi"
  | "inokashira"
  | "odakyu"
  | "yurikamome"

export type Line = {
  code: LineCode
  /** Nom affiché de la ligne */
  name: string
  /** Couleur officielle de la ligne (utilisée pour la roue + badges) */
  color: string
}

export const LINES: Record<LineCode, Line> = {
  yamanote: { code: "yamanote", name: "JR Yamanote", color: "#9ACD32" },
  chuo: { code: "chuo", name: "JR Chūō", color: "#F15A24" },
  sobu: { code: "sobu", name: "JR Sōbu", color: "#FFD400" },
  ginza: { code: "ginza", name: "Ginza", color: "#FF9500" },
  marunouchi: { code: "marunouchi", name: "Marunouchi", color: "#E60012" },
  hibiya: { code: "hibiya", name: "Hibiya", color: "#B5B5AC" },
  tozai: { code: "tozai", name: "Tōzai", color: "#009BBF" },
  chiyoda: { code: "chiyoda", name: "Chiyoda", color: "#00BB85" },
  yurakucho: { code: "yurakucho", name: "Yūrakuchō", color: "#C1A470" },
  hanzomon: { code: "hanzomon", name: "Hanzōmon", color: "#8F76D6" },
  namboku: { code: "namboku", name: "Namboku", color: "#00AC9B" },
  fukutoshin: { code: "fukutoshin", name: "Fukutoshin", color: "#9C5E31" },
  asakusa: { code: "asakusa", name: "Toei Asakusa", color: "#E85298" },
  mita: { code: "mita", name: "Toei Mita", color: "#006AB8" },
  shinjuku: { code: "shinjuku", name: "Toei Shinjuku", color: "#6CBB5A" },
  oedo: { code: "oedo", name: "Toei Ōedo", color: "#B6007A" },
  toyoko: { code: "toyoko", name: "Tōkyū Tōyoko", color: "#DA0442" },
  denentoshi: { code: "denentoshi", name: "Tōkyū Den-en-toshi", color: "#20A288" },
  oimachi: { code: "oimachi", name: "Tōkyū Ōimachi", color: "#F18E00" },
  inokashira: { code: "inokashira", name: "Keiō Inokashira", color: "#0079C2" },
  odakyu: { code: "odakyu", name: "Odakyū", color: "#0086D1" },
  yurikamome: { code: "yurikamome", name: "Yurikamome", color: "#0099D9" },
}

export type Station = {
  id: string
  /** Romaji */
  name: string
  /** 日本語 */
  nameJp: string
  /** Arrondissement / quartier (romaji) */
  ward: string
  /** Lignes desservant la gare. La 1re sert de couleur de segment. */
  lines: LineCode[]
  /** Latitude (pour l'optimisation de trajet) */
  lat: number
  /** Longitude */
  lng: number
}

export const STATIONS: Station[] = [
  { id: "shibuya", name: "Shibuya", nameJp: "渋谷", ward: "Shibuya", lines: ["yamanote", "ginza", "hanzomon", "fukutoshin", "toyoko", "denentoshi"], lat: 35.658, lng: 139.7016 },
  { id: "shinjuku", name: "Shinjuku", nameJp: "新宿", ward: "Shinjuku", lines: ["yamanote", "chuo", "marunouchi", "shinjuku", "oedo", "odakyu"], lat: 35.69, lng: 139.7004 },
  { id: "harajuku", name: "Harajuku", nameJp: "原宿", ward: "Shibuya", lines: ["yamanote"], lat: 35.6702, lng: 139.7027 },
  { id: "ikebukuro", name: "Ikebukuro", nameJp: "池袋", ward: "Toshima", lines: ["yamanote", "marunouchi", "yurakucho", "fukutoshin"], lat: 35.7295, lng: 139.7109 },
  { id: "akihabara", name: "Akihabara", nameJp: "秋葉原", ward: "Chiyoda", lines: ["yamanote", "sobu", "hibiya"], lat: 35.6984, lng: 139.7731 },
  { id: "ueno", name: "Ueno", nameJp: "上野", ward: "Taitō", lines: ["yamanote", "ginza", "hibiya"], lat: 35.7141, lng: 139.7774 },
  { id: "asakusa", name: "Asakusa", nameJp: "浅草", ward: "Taitō", lines: ["ginza", "asakusa"], lat: 35.7148, lng: 139.7967 },
  { id: "ginza", name: "Ginza", nameJp: "銀座", ward: "Chūō", lines: ["ginza", "marunouchi", "hibiya"], lat: 35.6717, lng: 139.764 },
  { id: "tokyo", name: "Tokyo", nameJp: "東京", ward: "Chiyoda", lines: ["yamanote", "marunouchi"], lat: 35.6812, lng: 139.7671 },
  { id: "nihombashi", name: "Nihombashi", nameJp: "日本橋", ward: "Chūō", lines: ["ginza", "tozai", "asakusa"], lat: 35.6833, lng: 139.7741 },
  { id: "shimbashi", name: "Shimbashi", nameJp: "新橋", ward: "Minato", lines: ["yamanote", "ginza", "asakusa", "yurikamome"], lat: 35.6665, lng: 139.7583 },
  { id: "shinagawa", name: "Shinagawa", nameJp: "品川", ward: "Minato", lines: ["yamanote"], lat: 35.6285, lng: 139.7387 },
  { id: "hamamatsucho", name: "Hamamatsuchō", nameJp: "浜松町", ward: "Minato", lines: ["yamanote", "oedo"], lat: 35.6553, lng: 139.757 },
  { id: "gotanda", name: "Gotanda", nameJp: "五反田", ward: "Shinagawa", lines: ["yamanote", "asakusa", "oimachi"], lat: 35.6263, lng: 139.7233 },
  { id: "ebisu", name: "Ebisu", nameJp: "恵比寿", ward: "Shibuya", lines: ["yamanote", "hibiya"], lat: 35.6467, lng: 139.71 },
  { id: "meguro", name: "Meguro", nameJp: "目黒", ward: "Shinagawa", lines: ["yamanote", "namboku", "mita"], lat: 35.6334, lng: 139.7159 },
  { id: "nakameguro", name: "Nakameguro", nameJp: "中目黒", ward: "Meguro", lines: ["hibiya", "toyoko"], lat: 35.644, lng: 139.699 },
  { id: "daikanyama", name: "Daikanyama", nameJp: "代官山", ward: "Shibuya", lines: ["toyoko"], lat: 35.6486, lng: 139.7032 },
  { id: "jiyugaoka", name: "Jiyūgaoka", nameJp: "自由が丘", ward: "Meguro", lines: ["toyoko", "oimachi"], lat: 35.6076, lng: 139.669 },
  { id: "sangenjaya", name: "Sangenjaya", nameJp: "三軒茶屋", ward: "Setagaya", lines: ["denentoshi"], lat: 35.6435, lng: 139.6716 },
  { id: "futakotamagawa", name: "Futako-tamagawa", nameJp: "二子玉川", ward: "Setagaya", lines: ["denentoshi", "oimachi"], lat: 35.6118, lng: 139.6262 },
  { id: "shimokitazawa", name: "Shimokitazawa", nameJp: "下北沢", ward: "Setagaya", lines: ["odakyu", "inokashira"], lat: 35.6613, lng: 139.668 },
  { id: "kichijoji", name: "Kichijōji", nameJp: "吉祥寺", ward: "Musashino", lines: ["chuo", "inokashira"], lat: 35.703, lng: 139.58 },
  { id: "koenji", name: "Kōenji", nameJp: "高円寺", ward: "Suginami", lines: ["chuo"], lat: 35.7056, lng: 139.6497 },
  { id: "asagaya", name: "Asagaya", nameJp: "阿佐ヶ谷", ward: "Suginami", lines: ["chuo"], lat: 35.7048, lng: 139.636 },
  { id: "nakano", name: "Nakano", nameJp: "中野", ward: "Nakano", lines: ["chuo", "tozai"], lat: 35.7057, lng: 139.6657 },
  { id: "takadanobaba", name: "Takadanobaba", nameJp: "高田馬場", ward: "Shinjuku", lines: ["yamanote", "tozai"], lat: 35.7126, lng: 139.7038 },
  { id: "kagurazaka", name: "Kagurazaka", nameJp: "神楽坂", ward: "Shinjuku", lines: ["tozai"], lat: 35.7016, lng: 139.7405 },
  { id: "iidabashi", name: "Iidabashi", nameJp: "飯田橋", ward: "Chiyoda", lines: ["tozai", "namboku", "yurakucho", "oedo"], lat: 35.702, lng: 139.7449 },
  { id: "korakuen", name: "Kōrakuen", nameJp: "後楽園", ward: "Bunkyō", lines: ["marunouchi", "namboku"], lat: 35.7079, lng: 139.7519 },
  { id: "jimbocho", name: "Jimbōchō", nameJp: "神保町", ward: "Chiyoda", lines: ["hanzomon", "mita", "shinjuku"], lat: 35.6959, lng: 139.7576 },
  { id: "ochanomizu", name: "Ochanomizu", nameJp: "御茶ノ水", ward: "Bunkyō", lines: ["chuo", "marunouchi"], lat: 35.6993, lng: 139.765 },
  { id: "omotesando", name: "Omotesandō", nameJp: "表参道", ward: "Minato", lines: ["ginza", "hanzomon", "chiyoda"], lat: 35.6652, lng: 139.7124 },
  { id: "roppongi", name: "Roppongi", nameJp: "六本木", ward: "Minato", lines: ["hibiya", "oedo"], lat: 35.6628, lng: 139.7314 },
  { id: "nippori", name: "Nippori", nameJp: "日暮里", ward: "Arakawa", lines: ["yamanote"], lat: 35.7281, lng: 139.7707 },
  { id: "sendagi", name: "Sendagi", nameJp: "千駄木", ward: "Bunkyō", lines: ["chiyoda"], lat: 35.7256, lng: 139.7659 },
  { id: "komagome", name: "Komagome", nameJp: "駒込", ward: "Toshima", lines: ["yamanote", "namboku"], lat: 35.7365, lng: 139.748 },
  { id: "otsuka", name: "Ōtsuka", nameJp: "大塚", ward: "Toshima", lines: ["yamanote"], lat: 35.7314, lng: 139.7286 },
  { id: "tsukiji", name: "Tsukiji", nameJp: "築地", ward: "Chūō", lines: ["hibiya"], lat: 35.6665, lng: 139.7707 },
  { id: "tsukishima", name: "Tsukishima", nameJp: "月島", ward: "Chūō", lines: ["yurakucho", "oedo"], lat: 35.6644, lng: 139.7836 },
  { id: "toyosu", name: "Toyosu", nameJp: "豊洲", ward: "Kōtō", lines: ["yurakucho", "yurikamome"], lat: 35.6549, lng: 139.7965 },
  { id: "daiba", name: "Odaiba-kaihinkōen", nameJp: "お台場海浜公園", ward: "Minato", lines: ["yurikamome"], lat: 35.6276, lng: 139.774 },
  { id: "kiyosumi", name: "Kiyosumi-shirakawa", nameJp: "清澄白河", ward: "Kōtō", lines: ["hanzomon", "oedo"], lat: 35.6815, lng: 139.8 },
  { id: "monzennakacho", name: "Monzen-nakachō", nameJp: "門前仲町", ward: "Kōtō", lines: ["tozai", "oedo"], lat: 35.6716, lng: 139.7965 },
  { id: "ryogoku", name: "Ryōgoku", nameJp: "両国", ward: "Sumida", lines: ["sobu", "oedo"], lat: 35.6958, lng: 139.7931 },
  { id: "kinshicho", name: "Kinshichō", nameJp: "錦糸町", ward: "Sumida", lines: ["sobu", "hanzomon"], lat: 35.6967, lng: 139.8146 },
  { id: "oshiage", name: "Oshiage", nameJp: "押上", ward: "Sumida", lines: ["hanzomon", "asakusa"], lat: 35.71, lng: 139.8135 },
  { id: "ningyocho", name: "Ningyōchō", nameJp: "人形町", ward: "Chūō", lines: ["hibiya", "asakusa"], lat: 35.6859, lng: 139.7825 },
  { id: "kanda", name: "Kanda", nameJp: "神田", ward: "Chiyoda", lines: ["yamanote", "ginza"], lat: 35.6918, lng: 139.771 },
]

/** Couleur de la 1re ligne d'une gare (couleur du segment de roue). */
export function stationColor(s: Station): string {
  return LINES[s.lines[0]].color
}
