/**
 * ScholarSetu - Configurable Scholarship Source Registry
 *
 * All 33 authorized starting URLs across Government, Institutional,
 * Aggregator, Corporate/Foundation, International, and State portals.
 */

export type SourceCategory =
  | "government_institutional"
  | "aggregator"
  | "corporate_foundation"
  | "international"
  | "state_portal";

export type DiscoveryStrategy =
  | "search_and_fetch"
  | "direct_fetch"
  | "agent_navigation";

export interface ScholarshipSource {
  id: string;
  name: string;
  startingUrl: string;
  category: SourceCategory;
  enabled: boolean;
  discoveryStrategy: DiscoveryStrategy;
  allowedDomains: string[];
  hostPlatform: string;
  defaultProviderType:
    | "central_government"
    | "state_government"
    | "private_foundation"
    | "corporate_csr"
    | "international_trust";
  searchQueries?: string[];
  lastAttemptAt?: string | null;
  lastSuccessfulFetchAt?: string | null;
  lastError?: string | null;
  recordsExtractedCount: number;
}

export const SCHOLARSHIP_SOURCES_REGISTRY: ScholarshipSource[] = [
  // ==========================================
  // 1. Government and Institutional Sources (13)
  // ==========================================
  {
    id: "nsp-central",
    name: "National Scholarship Portal (NSP)",
    startingUrl: "https://scholarships.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["scholarships.gov.in"],
    hostPlatform: "National Scholarship Portal (NSP)",
    defaultProviderType: "central_government",
    searchQueries: [
      "AICTE scholarship scheme 2026",
      "CSSS central sector scholarship",
      "national scholarship portal guidelines",
    ],
    recordsExtractedCount: 5,
  },
  {
    id: "moe-india",
    name: "Ministry of Education",
    startingUrl: "https://www.education.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["education.gov.in"],
    hostPlatform: "Ministry of Education (MoE)",
    defaultProviderType: "central_government",
    searchQueries: ["scholarship schemes higher education guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "aicte-india",
    name: "All India Council for Technical Education (AICTE)",
    startingUrl: "https://www.aicte-india.org",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["aicte-india.org"],
    hostPlatform: "AICTE Portal",
    defaultProviderType: "central_government",
    searchQueries: [
      "Pragati scholarship scheme girls guidelines",
      "Saksham scholarship scheme disabilities",
      "Swanath scholarship scheme",
    ],
    recordsExtractedCount: 3,
  },
  {
    id: "ugc-india",
    name: "University Grants Commission (UGC)",
    startingUrl: "https://www.ugc.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["ugc.gov.in"],
    hostPlatform: "UGC Portal",
    defaultProviderType: "central_government",
    searchQueries: ["UGC fellowship single girl child Ishan Uday"],
    recordsExtractedCount: 1,
  },
  {
    id: "moma-india",
    name: "Ministry of Minority Affairs",
    startingUrl: "https://minorityaffairs.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["minorityaffairs.gov.in"],
    hostPlatform: "NSP / MoMA",
    defaultProviderType: "central_government",
    searchQueries: ["post matric scholarship minority communities guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "msje-india",
    name: "Ministry of Social Justice and Empowerment",
    startingUrl: "https://socialjustice.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["socialjustice.gov.in"],
    hostPlatform: "Ministry of Social Justice",
    defaultProviderType: "central_government",
    searchQueries: ["top class education SC students scholarship guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "mota-india",
    name: "Ministry of Tribal Affairs",
    startingUrl: "https://tribal.nic.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["tribal.nic.in"],
    hostPlatform: "Ministry of Tribal Affairs",
    defaultProviderType: "central_government",
    searchQueries: ["national fellowship scholarship higher education ST students"],
    recordsExtractedCount: 1,
  },
  {
    id: "nos-msje",
    name: "National Overseas Scholarship (NOS)",
    startingUrl: "https://nosmsje.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["nosmsje.gov.in"],
    hostPlatform: "NOS Portal (nosmsje.gov.in)",
    defaultProviderType: "central_government",
    searchQueries: ["National Overseas Scholarship guidelines eligibility"],
    recordsExtractedCount: 1,
  },
  {
    id: "dst-inspire",
    name: "DST INSPIRE Scholarship",
    startingUrl: "https://www.online-inspire.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["online-inspire.gov.in", "dst.gov.in"],
    hostPlatform: "DST INSPIRE Portal",
    defaultProviderType: "central_government",
    searchQueries: ["INSPIRE scholarship for higher education SHE guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "csir-hrdg",
    name: "Council of Scientific and Industrial Research (CSIR)",
    startingUrl: "https://csirhrdg.res.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["csirhrdg.res.in"],
    hostPlatform: "CSIR-HRDG Portal",
    defaultProviderType: "central_government",
    searchQueries: ["Junior Research Fellowship JRF eligibility guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "dbt-india",
    name: "Department of Biotechnology (DBT)",
    startingUrl: "https://dbtindia.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["dbtindia.gov.in"],
    hostPlatform: "DBT Portal",
    defaultProviderType: "central_government",
    searchQueries: ["DBT junior research fellowship biotechnology"],
    recordsExtractedCount: 1,
  },
  {
    id: "icmr-india",
    name: "Indian Council of Medical Research (ICMR)",
    startingUrl: "https://www.icmr.gov.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["icmr.gov.in"],
    hostPlatform: "ICMR Portal",
    defaultProviderType: "central_government",
    searchQueries: ["ICMR junior research fellowship medical biomedical research"],
    recordsExtractedCount: 1,
  },
  {
    id: "pmrf-india",
    name: "Prime Minister's Research Fellowship (PMRF)",
    startingUrl: "https://www.pmrf.in",
    category: "government_institutional",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["pmrf.in"],
    hostPlatform: "PMRF Portal",
    defaultProviderType: "central_government",
    searchQueries: ["Prime Minister Research Fellowship eligibility IIT IISc"],
    recordsExtractedCount: 1,
  },

  // ==========================================
  // 2. Scholarship Aggregators (3)
  // ==========================================
  {
    id: "buddy4study",
    name: "Buddy4Study",
    startingUrl: "https://www.buddy4study.com",
    category: "aggregator",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["buddy4study.com"],
    hostPlatform: "Buddy4Study (Official Partner)",
    defaultProviderType: "corporate_csr",
    searchQueries: ["featured scholarships undergraduate engineering 2026"],
    recordsExtractedCount: 3,
  },
  {
    id: "vidyasaarathi",
    name: "Vidyasaarathi",
    startingUrl: "https://www.vidyasaarathi.co.in",
    category: "aggregator",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["vidyasaarathi.co.in"],
    hostPlatform: "NSDL Vidyasaarathi",
    defaultProviderType: "corporate_csr",
    searchQueries: ["active scholarship schemes NSDL Vidyasaarathi"],
    recordsExtractedCount: 2,
  },
  {
    id: "ffe-india",
    name: "Foundation for Excellence (FFE)",
    startingUrl: "https://www.ffe.org",
    category: "aggregator",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["ffe.org"],
    hostPlatform: "FFE Scholarship Portal",
    defaultProviderType: "private_foundation",
    searchQueries: ["FFE engineering medical scholarship eligibility"],
    recordsExtractedCount: 1,
  },

  // ==========================================
  // 3. Corporate and Foundation Sources (10)
  // ==========================================
  {
    id: "tata-trusts",
    name: "Tata Trusts",
    startingUrl: "https://www.tatatrusts.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["tatatrusts.org"],
    hostPlatform: "Tata Trusts Education Grants",
    defaultProviderType: "private_foundation",
    searchQueries: ["Tata Trusts education grants medical engineering"],
    recordsExtractedCount: 1,
  },
  {
    id: "jn-tata",
    name: "JN Tata Endowment",
    startingUrl: "https://www.jntataendowment.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["jntataendowment.org"],
    hostPlatform: "JN Tata Endowment Portal",
    defaultProviderType: "private_foundation",
    searchQueries: ["JN Tata Endowment loan scholarship higher education abroad"],
    recordsExtractedCount: 1,
  },
  {
    id: "reliance-foundation",
    name: "Reliance Foundation",
    startingUrl: "https://www.reliancefoundation.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["reliancefoundation.org", "scholarships.reliancefoundation.org"],
    hostPlatform: "Reliance Foundation Scholarship Portal",
    defaultProviderType: "corporate_csr",
    searchQueries: ["Reliance Foundation Undergraduate Scholarship guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "aditya-birla",
    name: "Aditya Birla Group Scholarship",
    startingUrl: "https://www.adityabirla.com",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["adityabirla.com", "adityabirlascholars.net"],
    hostPlatform: "Aditya Birla Scholarship Program",
    defaultProviderType: "corporate_csr",
    searchQueries: ["Aditya Birla Scholarship IIT IIM law campus eligibility"],
    recordsExtractedCount: 1,
  },
  {
    id: "azim-premji",
    name: "Azim Premji Foundation",
    startingUrl: "https://azimpremjifoundation.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["azimpremjifoundation.org", "azimpremjiuniversity.edu.in"],
    hostPlatform: "Azim Premji Foundation",
    defaultProviderType: "private_foundation",
    searchQueries: ["Azim Premji scholarship undergraduate fellowship"],
    recordsExtractedCount: 1,
  },
  {
    id: "kotak-education",
    name: "Kotak Education Foundation",
    startingUrl: "https://www.kotakeducation.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["kotakeducation.org"],
    hostPlatform: "Kotak Education Portal",
    defaultProviderType: "corporate_csr",
    searchQueries: ["Kotak Kanya Scholarship girl students 12th pass"],
    recordsExtractedCount: 1,
  },
  {
    id: "sitaram-jindal",
    name: "Sitaram Jindal Foundation",
    startingUrl: "https://www.sitaramjindalfoundation.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["sitaramjindalfoundation.org"],
    hostPlatform: "Sitaram Jindal Foundation",
    defaultProviderType: "private_foundation",
    searchQueries: ["Sitaram Jindal scholarship scheme eligibility application"],
    recordsExtractedCount: 1,
  },
  {
    id: "narotam-sekhsaria",
    name: "Narotam Sekhsaria Foundation",
    startingUrl: "https://www.nsfoundation.co.in",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["nsfoundation.co.in"],
    hostPlatform: "Narotam Sekhsaria Foundation Portal",
    defaultProviderType: "private_foundation",
    searchQueries: ["Narotam Sekhsaria postgraduate loan scholarship"],
    recordsExtractedCount: 1,
  },
  {
    id: "ongc-scholar",
    name: "ONGC Scholarship",
    startingUrl: "https://www.ongcscholar.org",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["ongcscholar.org"],
    hostPlatform: "ONGC Scholar Portal",
    defaultProviderType: "corporate_csr",
    searchQueries: ["ONGC foundation scholarship SC ST OBC EWS engineering medical"],
    recordsExtractedCount: 1,
  },
  {
    id: "loreal-women",
    name: "L'Oréal India For Young Women in Science",
    startingUrl: "https://www.foryoungwomeninscience.com",
    category: "corporate_foundation",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["foryoungwomeninscience.com", "loreal.com"],
    hostPlatform: "L'Oréal India Portal",
    defaultProviderType: "corporate_csr",
    searchQueries: ["L'Oreal young women in science scholarship eligibility"],
    recordsExtractedCount: 1,
  },

  // ==========================================
  // 4. International Sources (4)
  // ==========================================
  {
    id: "fulbright-nehru",
    name: "Fulbright-Nehru / USIEF",
    startingUrl: "https://www.usief.org.in",
    category: "international",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["usief.org.in"],
    hostPlatform: "USIEF Official Portal",
    defaultProviderType: "international_trust",
    searchQueries: ["Fulbright-Nehru Master Fellowships Indian citizens guidelines"],
    recordsExtractedCount: 1,
  },
  {
    id: "chevening-uk",
    name: "Chevening Scholarships",
    startingUrl: "https://www.chevening.org",
    category: "international",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["chevening.org"],
    hostPlatform: "Chevening UK Portal",
    defaultProviderType: "international_trust",
    searchQueries: ["Chevening India scholarship application eligibility"],
    recordsExtractedCount: 1,
  },
  {
    id: "commonwealth-uk",
    name: "Commonwealth Scholarships",
    startingUrl: "https://cscuk.fcdo.gov.uk",
    category: "international",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["cscuk.fcdo.gov.uk"],
    hostPlatform: "Commonwealth Scholarship Commission (CSC UK)",
    defaultProviderType: "international_trust",
    searchQueries: ["Commonwealth Master scholarship India eligibility"],
    recordsExtractedCount: 1,
  },
  {
    id: "inlaks-foundation",
    name: "Inlaks Shivdasani Foundation",
    startingUrl: "https://www.inlaksfoundation.org",
    category: "international",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["inlaksfoundation.org"],
    hostPlatform: "Inlaks Shivdasani Foundation Portal",
    defaultProviderType: "international_trust",
    searchQueries: ["Inlaks scholarship higher education guidelines abroad"],
    recordsExtractedCount: 1,
  },

  // ==========================================
  // 5. State Portals (3)
  // ==========================================
  {
    id: "mahadbt-state",
    name: "MahaDBT (Maharashtra)",
    startingUrl: "https://mahadbt.maharashtra.gov.in",
    category: "state_portal",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["mahadbt.maharashtra.gov.in", "mahadbt2.maharashtra.gov.in"],
    hostPlatform: "MahaDBT 2.0 Portal",
    defaultProviderType: "state_government",
    searchQueries: ["Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh fee reimbursement"],
    recordsExtractedCount: 1,
  },
  {
    id: "karnataka-ssp",
    name: "Karnataka State Scholarship Portal (SSP)",
    startingUrl: "https://ssp.postmatric.karnataka.gov.in",
    category: "state_portal",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["ssp.postmatric.karnataka.gov.in", "karnataka.gov.in"],
    hostPlatform: "Karnataka Post-Matric SSP",
    defaultProviderType: "state_government",
    searchQueries: ["Karnataka post matric scholarship ePASS SSP eligibility"],
    recordsExtractedCount: 1,
  },
  {
    id: "up-scholarship",
    name: "Uttar Pradesh Scholarship",
    startingUrl: "https://scholarship.up.gov.in",
    category: "state_portal",
    enabled: true,
    discoveryStrategy: "search_and_fetch",
    allowedDomains: ["scholarship.up.gov.in"],
    hostPlatform: "UP SAKSHAM Scholarship Portal",
    defaultProviderType: "state_government",
    searchQueries: ["UP postmatric scholarship fee reimbursement dashmottar"],
    recordsExtractedCount: 1,
  },
];

/**
 * Validates a target URL against the allowlist of registered starting URLs and allowed domains.
 * Prevents SSRF or unrestricted URL fetching.
 */
export function isAllowedIngestionUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return SCHOLARSHIP_SOURCES_REGISTRY.some((source) =>
      source.allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      )
    );
  } catch {
    return false;
  }
}

/**
 * Gets a source definition by its unique identifier.
 */
export function getSourceById(id: string): ScholarshipSource | undefined {
  return SCHOLARSHIP_SOURCES_REGISTRY.find((s) => s.id === id);
}
