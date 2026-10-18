import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  }
}

import { getSourceById } from "../src/lib/source-registry.ts";
import { runSourceIngestion } from "../src/lib/ingestion-service.ts";
import { getScholarships } from "../src/lib/db.ts";

async function testLiveNsp() {
  console.log("=== Controlled Live Ingestion Test: National Scholarship Portal (NSP) ===");
  const nspSource = getSourceById("nsp-central");
  if (!nspSource) {
    console.error("NSP source definition not found in registry!");
    process.exit(1);
  }

  console.log("Source Config:", {
    id: nspSource.id,
    name: nspSource.name,
    startingUrl: nspSource.startingUrl,
    discoveryStrategy: nspSource.discoveryStrategy,
    domains: nspSource.allowedDomains,
  });

  const beforeTotal = (await getScholarships()).total;
  console.log(`Initial total scholarship records in database: ${beforeTotal}`);

  console.log("\nStarting live TinyFish execution (Search + Fetch + Extract + Normalize + Persist)...");
  const startTime = Date.now();

  const outcome = await runSourceIngestion(nspSource);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nCompleted live extraction in ${durationSec}s`);
  console.log("Execution Summary:", outcome);

  const afterResult = await getScholarships();
  console.log(`Updated total scholarship records in database: ${afterResult.total}`);

  // Inspect the top NSP scholarship record
  const sample = afterResult.scholarships.find((s) => s.provider.includes("AICTE") || s.host_platform.includes("National Scholarship"));
  if (sample) {
    console.log("\nSample Persisted Scholarship Record:");
    console.log({
      id: sample.id,
      name: sample.name,
      provider: sample.provider,
      category: sample.category,
      award_amount: sample.award_amount,
      award_amount_value: sample.award_amount_value,
      application_deadline: sample.application_deadline,
      verification_status: sample.verification_status,
      application_url: sample.application_url,
      source_url: sample.source_url,
      field_evidence_count: sample.field_evidence?.length ?? 0,
    });
  }

  if (outcome.success) {
    console.log("\n>>> LIVE NSP EXTRACTION SUCCESSFUL <<<");
  } else {
    console.log("\n>>> LIVE NSP EXTRACTION REPORTED WARNING/PARTIAL <<<", outcome.error);
  }
}

testLiveNsp().catch((err) => {
  console.error("Live test failed with exception:", err);
  process.exit(1);
});
