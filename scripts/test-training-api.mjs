#!/usr/bin/env node
/**
 * Test script for /api/training (text, PDF, URL).
 * Run with dev server: npm run dev (in one terminal), then node scripts/test-training-api.mjs
 */

const BASE = process.env.TRAINING_BASE_URL || "http://localhost:3000";

async function testText() {
  console.log("\n--- POST /api/training/text ---");
  const res = await fetch(`${BASE}/api/training/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        "The Orthodox Church teaches that the Holy Spirit proceeds from the Father alone, as confessed in the Nicene Creed. This is the ancient faith of the undivided Church.",
      title: "Test Orthodox Teaching",
      source: "Training API test",
      author: "Test script",
    }),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.log("FAIL:", res.status, "(non-JSON response)", text?.slice(0, 200));
    return false;
  }
  if (res.ok) {
    console.log("OK:", data.upserted, "chunks upserted, total chunks:", data.chunks);
    if (data.errors?.length) console.log("Warnings:", data.errors);
  } else {
    console.log("FAIL:", res.status, data.error || data);
  }
  return res.ok;
}

async function testUrl() {
  console.log("\n--- POST /api/training/url ---");
  const res = await fetch(`${BASE}/api/training/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://www.example.com",
      title: "Example page",
    }),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.log("FAIL:", res.status, "(non-JSON)", text?.slice(0, 200));
    return false;
  }
  if (res.ok) {
    console.log("OK:", data.upserted, "chunks upserted, total chunks:", data.chunks);
    if (data.errors?.length) console.log("Warnings:", data.errors);
  } else {
    console.log("FAIL:", res.status, data.error || data);
  }
  return res.ok;
}

async function main() {
  console.log("Training API tests (BASE =", BASE + ")");
  let textOk = false;
  let urlOk = false;
  try {
    textOk = await testText();
  } catch (e) {
    console.log("Text test error:", e.message);
  }
  try {
    urlOk = await testUrl();
  } catch (e) {
    console.log("URL test error:", e.message);
  }
  console.log("\n--- Summary ---");
  console.log("Text:", textOk ? "PASS" : "FAIL");
  console.log("URL:", urlOk ? "PASS" : "FAIL");
  console.log("PDF: run manually via /training page (upload a PDF)");
  process.exit(textOk && urlOk ? 0 : 1);
}

main();
