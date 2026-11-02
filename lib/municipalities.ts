import type {
  AppUser,
  Municipality,
  MunicipalityStatus,
  Tree,
} from "./types";

type MunicipalityBase = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  coastal?: boolean;
  population: number;
};

/**
 * The 38 official communes of Skikda Wilaya.
 * Coordinates are the centroid of each commune polygon from
 * geoBoundaries DZA-ADM3 (simplified, CC BY-SA 2.0).
 */
export const municipalityBase: MunicipalityBase[] = [
  { id: "ain-bouziane", code: "ABZ", nameAr: "عين بوزيان", nameEn: "Aïn Bouziane", lat: 36.59982, lng: 6.73282, population: 11800 },
  { id: "ain-charchar", code: "ACH", nameAr: "عين شرشار", nameEn: "Aïn Charchar", lat: 36.71743, lng: 7.23003, coastal: true, population: 15400 },
  { id: "ain-kechra", code: "AKR", nameAr: "عين قشرة", nameEn: "Aïn Kechra", lat: 36.799, lng: 6.43984, population: 22100 },
  { id: "ain-zouit", code: "AZT", nameAr: "عين زويت", nameEn: "Aïn Zouit", lat: 36.90576, lng: 6.80217, coastal: true, population: 4200 },
  { id: "azzaba", code: "AZZ", nameAr: "عزابة", nameEn: "Azzaba", lat: 36.74864, lng: 7.08112, population: 62000 },
  { id: "bekkouche-lakhdar", code: "BKL", nameAr: "بكوش لخضر", nameEn: "Bekkouche Lakhdar", lat: 36.69378, lng: 7.30004, population: 9800 },
  { id: "ben-azzouz", code: "BAZ", nameAr: "بن عزوز", nameEn: "Ben Azzouz", lat: 36.86207, lng: 7.29806, population: 30200 },
  { id: "beni-bechir", code: "BBC", nameAr: "بني بشير", nameEn: "Beni Bechir", lat: 36.79939, lng: 6.97752, population: 8600 },
  { id: "beni-oulbane", code: "BOL", nameAr: "بني ولبان", nameEn: "Beni Oulbane", lat: 36.63192, lng: 6.58223, population: 13500 },
  { id: "beni-zid", code: "BZD", nameAr: "بني زيد", nameEn: "Beni Zid", lat: 36.91006, lng: 6.48121, population: 17200 },
  { id: "bin-el-ouiden", code: "BEO", nameAr: "بين الويدان", nameEn: "Bin El Ouiden", lat: 36.81389, lng: 6.54751, population: 10300 },
  { id: "bouchtata", code: "BCH", nameAr: "بوشطاطة", nameEn: "Bouchtata", lat: 36.8074, lng: 6.75951, population: 7400 },
  { id: "cheraia", code: "CHR", nameAr: "الشرايع", nameEn: "Cheraia", lat: 37.00911, lng: 6.51239, coastal: true, population: 19800 },
  { id: "collo", code: "COL", nameAr: "القل", nameEn: "Collo", lat: 37.0069, lng: 6.55063, coastal: true, population: 45200 },
  { id: "djendel-saadi-mohamed", code: "DJD", nameAr: "جندل سعدي محمد", nameEn: "Djendel Saadi Mohamed", lat: 36.83881, lng: 7.16176, population: 12800 },
  { id: "el-ghedir", code: "GHD", nameAr: "الغدير", nameEn: "El Ghedir", lat: 36.66236, lng: 6.96084, population: 11200 },
  { id: "el-hadaiek", code: "HAD", nameAr: "الحدائق", nameEn: "El Hadaïek", lat: 36.82423, lng: 6.86106, coastal: true, population: 29400 },
  { id: "el-harrouch", code: "HRC", nameAr: "الحروش", nameEn: "El Harrouch", lat: 36.62588, lng: 6.80311, population: 52000 },
  { id: "el-marsa", code: "MRS", nameAr: "المرسى", nameEn: "El Marsa", lat: 37.01014, lng: 7.28138, coastal: true, population: 13600 },
  { id: "emdjez-edchich", code: "EDJ", nameAr: "مجاز الدشيش", nameEn: "Emdjez Edchich", lat: 36.72017, lng: 6.78625, population: 18400 },
  { id: "es-sebt", code: "SEB", nameAr: "السبت", nameEn: "Es Sebt", lat: 36.62745, lng: 7.0728, population: 14900 },
  { id: "filfila", code: "FLF", nameAr: "فلفلة", nameEn: "Filfila", lat: 36.88822, lng: 7.08113, coastal: true, population: 21700 },
  { id: "hamadi-krouma", code: "HKR", nameAr: "حمادي كرومة", nameEn: "Hamadi Krouma", lat: 36.83692, lng: 6.95745, coastal: true, population: 24800 },
  { id: "kanoua", code: "KAN", nameAr: "القنوة", nameEn: "Kanoua", lat: 37.05019, lng: 6.42085, coastal: true, population: 6900 },
  { id: "kerkera", code: "KRK", nameAr: "الكركرة", nameEn: "Kerkera", lat: 36.92421, lng: 6.61063, coastal: true, population: 26300 },
  { id: "kheneg-mayoum", code: "KHN", nameAr: "خناق مايون", nameEn: "Kheneg Mayoum", lat: 36.98776, lng: 6.28132, population: 6200 },
  { id: "oued-zhor", code: "OZH", nameAr: "وادي الزهور", nameEn: "Oued Z'hor", lat: 36.90917, lng: 6.33041, coastal: true, population: 9100 },
  { id: "ouldja-boulballout", code: "OLB", nameAr: "ولجة بولبلوط", nameEn: "Ouldja Boulballout", lat: 36.81623, lng: 6.38064, population: 5800 },
  { id: "ouled-attia", code: "OAT", nameAr: "أولاد عطية", nameEn: "Ouled Attia", lat: 36.99483, lng: 6.35843, coastal: true, population: 16500 },
  { id: "ouled-hbaba", code: "OHB", nameAr: "أولاد حبابة", nameEn: "Ouled Hbaba", lat: 36.49923, lng: 6.93218, population: 8100 },
  { id: "oum-toub", code: "OMT", nameAr: "أم الطوب", nameEn: "Oum Toub", lat: 36.70781, lng: 6.54048, population: 31200 },
  { id: "ramdane-djamel", code: "RMD", nameAr: "رمضان جمال", nameEn: "Ramdane Djamel", lat: 36.75363, lng: 6.92458, population: 27800 },
  { id: "salah-bouchaour", code: "SLB", nameAr: "صالح بوشعور", nameEn: "Salah Bouchaour", lat: 36.69278, lng: 6.88423, population: 14600 },
  { id: "sidi-mezghiche", code: "SMZ", nameAr: "سيدي مزغيش", nameEn: "Sidi Mezghiche", lat: 36.71109, lng: 6.70123, population: 34800 },
  { id: "skikda", code: "SKK", nameAr: "سكيكدة", nameEn: "Skikda", lat: 36.87383, lng: 6.92095, coastal: true, population: 250000 },
  { id: "tamalous", code: "TML", nameAr: "تمالوس", nameEn: "Tamalous", lat: 36.85352, lng: 6.66777, population: 33600 },
  { id: "zerdazas", code: "ZRD", nameAr: "زردازة", nameEn: "Zerdazas", lat: 36.58638, lng: 6.92348, population: 4900 },
  { id: "zitouna", code: "ZTN", nameAr: "الزيتونة", nameEn: "Zitouna", lat: 36.98837, lng: 6.46248, population: 18100 },
];

const emptyMunicipality = (m: MunicipalityBase): Municipality => ({
  ...m,
  trees: 0,
  planted: 0,
  alive: 0,
  needsAttention: 0,
  volunteers: 0,
  status: "stable",
  adminName: "",
});

/** Static zero-baseline list (names, codes and coordinates only). */
export const municipalities: Municipality[] = municipalityBase.map(emptyMunicipality);

/** Accepted external aliases (e.g. the fixed state-admin account). */
export const MUNICIPALITY_ALIASES: Record<string, string> = {
  "skikda-center": "skikda",
};

export const resolveMunicipalityId = (id?: string) =>
  (id && MUNICIPALITY_ALIASES[id]) || id;

export const municipalityById = (id: string) =>
  municipalities.find((m) => m.id === id) ??
  (MUNICIPALITY_ALIASES[id]
    ? municipalities.find((m) => m.id === MUNICIPALITY_ALIASES[id])
    : undefined);

export const getMunicipality = (id?: string) =>
  municipalityById(id ?? "") ?? municipalities[0];

export const municipalityName = (
  id: string,
  lang: "ar" | "en",
): string => {
  const m = municipalityById(id);
  if (!m) return id;
  return lang === "ar" ? m.nameAr : m.nameEn;
};

export const STATUS_COLORS: Record<MunicipalityStatus, string> = {
  stable: "#16865B",
  monitoring: "#E0A526",
  risk: "#EE8B3A",
  critical: "#D64545",
};

export const STATUS_SOFT: Record<MunicipalityStatus, string> = {
  stable: "#E4F4EA",
  monitoring: "#FBF2DC",
  risk: "#FDEEE2",
  critical: "#FBE7E7",
};

const rank: Record<MunicipalityStatus, number> = {
  stable: 0,
  monitoring: 1,
  risk: 2,
  critical: 3,
};

/**
 * Derive every municipality metric from the real persisted trees and users.
 * This is what the whole UI reads, so the platform always reflects true state.
 */
export function computeMunicipalities(
  trees: Tree[],
  users: AppUser[],
): Municipality[] {
  const treesByMuni = new Map<string, Tree[]>();
  for (const tree of trees) {
    const list = treesByMuni.get(tree.municipalityId) ?? [];
    list.push(tree);
    treesByMuni.set(tree.municipalityId, list);
  }

  return municipalityBase.map((base) => {
    const list = treesByMuni.get(base.id) ?? [];
    const total = list.length;
    const alive = list.filter((t) => t.status !== "critical").length;
    const needsAttention = list.filter(
      (t) => t.status === "risk" || t.status === "critical",
    ).length;
    const volunteers = users.filter(
      (u) => u.role === "volunteer" && u.municipalityId === base.id,
    ).length;
    const admin = users.find(
      (u) => u.role === "municipality_admin" && u.municipalityId === base.id,
    );

    let status: MunicipalityStatus = "stable";
    for (const tree of list) {
      if (rank[tree.status] > rank[status]) status = tree.status;
    }

    return {
      ...base,
      trees: total,
      planted: total,
      alive,
      needsAttention,
      volunteers,
      status,
      adminName: admin ? `${admin.firstName} ${admin.lastName}`.trim() : "",
    };
  });
}

/** @deprecated Kept as an alias so older imports keep working. */
export const WILAYA_TOTALS = {
  trees: 0,
  planted: 0,
  alive: 0,
  needsAttention: 0,
  volunteers: 0,
};
