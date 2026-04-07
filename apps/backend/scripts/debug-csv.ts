import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

async function debugCSV() {
  const csvPath = path.join(__dirname, "../uploads/problems.csv");
  const csvData = fs.readFileSync(csvPath, "utf-8");

  console.log("🔍 RAW CSV PREVIEW (first 500 chars):");
  console.log(csvData.slice(0, 500).replace(/\r/g, "\\r").replace(/\n/g, "\\n\n"));
  console.log("\n" + "=".repeat(80) + "\n");

  // Check for BOM
  const hasBOM = csvData.charCodeAt(0) === 0xFEFF;
  console.log(`🔍 Has BOM (Byte Order Mark): ${hasBOM ? "✅ YES - This can break parsing!" : "❌ No"}`);
  console.log(`🔍 First 3 char codes: ${csvData.slice(0, 3).split("").map(c => c.charCodeAt(0))}`);
  console.log("\n" + "=".repeat(80) + "\n");

  // Parse with debug options
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    bom: hasBOM, // ✅ Handle BOM if present
  });

  console.log(`🔍 Parsed ${records.length} records`);
  
  if (records.length > 0) {
    const firstRow = records[0] as Record<string, any>;
    
    console.log("\n🔍 DETECTED COLUMN NAMES:");
    console.log(Object.keys(firstRow));
    
    console.log("\n🔍 FIRST ROW VALUES:");
    for (const [key, value] of Object.entries(firstRow)) {
      console.log(`  "${key}": "${value}" (type: ${typeof value}, length: ${String(value).length})`);
    }
    
    console.log("\n🔍 CHECKING title/link:");
    console.log(`  row.title = "${firstRow.title}" (truthy: ${!!firstRow.title})`);
    console.log(`  row.link = "${firstRow.link}" (truthy: ${!!firstRow.link})`);
  }
}

debugCSV();