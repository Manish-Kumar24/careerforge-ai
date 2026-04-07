import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import PracticeProblem from "../src/models/PracticeProblem";

dotenv.config();

// ✅ Simple CSV parser - handles quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// ✅ Helper: Parse comma-separated fields (for patterns, companies, etc.)
function parseListField(field: string): string[] {
  if (!field) return [];
  return field
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ✅ Helper: Validate platform
function validatePlatform(platform: string): "leetcode" | "geeksforgeeks" {
  const p = (platform || "").toLowerCase().trim();
  if (p === "geeksforgeeks" || p === "gfg") return "geeksforgeeks";
  return "leetcode";
}

// ✅ Helper: Validate difficulty
function validateDifficulty(difficulty: string): "easy" | "medium" | "hard" {
  const d = (difficulty || "").toLowerCase().trim();
  if (d === "easy") return "easy";
  if (d === "hard") return "hard";
  return "medium";
}

// ✅ Helper: Convert minutes to seconds
function minutesToSeconds(minutes: string): number {
  const mins = parseInt(minutes || "0", 10);
  if (isNaN(mins) || mins <= 0) return 1800;
  return mins * 60;
}

async function importProblems() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to MongoDB");

    const csvPath = path.join(__dirname, "../uploads/problems.csv");
    
    // ✅ Read file and strip BOM if present
    let content = fs.readFileSync(csvPath, "utf-8");
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
      console.log("🔍 Stripped BOM from CSV");
    }

    // ✅ Split into lines
    const lines = content.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    // ✅ Parse header row
    const headers = parseCSVLine(lines[0]).map((h) => h.trim());
    console.log(`📊 Headers: ${headers.join(", ")}`);
    console.log(`📊 Found ${lines.length - 1} data rows`);

    let imported = 0;
    let errors = 0;

    // ✅ Parse each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        // ✅ Map values to headers into an object
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        // ✅ Debug log
        console.log(`\n🔍 Row ${i}: "${row.title}" | difficulty: "${row.difficulty}"`);

        const title = (row.title || "").trim();
        const link = (row.link || "").trim();
        
        if (!title || !link) {
          console.log(`⚠️  Skipped: missing title or link`);
          continue;
        }

        const platform = validatePlatform(row.platform);
        const difficulty = validateDifficulty(row.difficulty);
        const targetSeconds = minutesToSeconds(row.targetMinutes);

        const problemData = {
          title,
          link,
          platform,
          difficulty,
          patterns: parseListField(row.patterns),
          topics: parseListField(row.topics),
          companies: parseListField(row.companies),
          tags: parseListField(row.tags),
          targetTimeMinutes: Math.round(targetSeconds / 60),
        };

        console.log(`   → Saving: ${title} | ${difficulty} | ${platform}`);

        await PracticeProblem.findOneAndUpdate(
          { link },
          { $set: problemData },
          { upsert: true }
        );

        imported++;
        if (imported <= 3) {
          console.log(`✅ Imported: ${title}`);
        }
      } catch (err: any) {
        errors++;
        console.error(`❌ Row ${i} error:`, err.message);
      }
    }

    console.log("\n📊 SUMMARY");
    console.log(`✅ Imported: ${imported}`);
    console.log(`❌ Errors: ${errors}`);

    // ✅ Verify data in DB
    const count = await PracticeProblem.countDocuments();
    console.log(`🗄️  Total problems in DB: ${count}`);

    await mongoose.disconnect();
    console.log("\n✅ Import completed successfully!");
  } catch (err: any) {
    console.error("❌ Import failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

importProblems();