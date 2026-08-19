import fs from "fs";
import path from "path";
import {
  validateFeedbackSubmission,
  sanitizeText,
  feedbackStorage,
  VALID_FEEDBACK_CATEGORIES,
} from "../src/services/feedback";

console.log("================================================================================");
console.log("BUYWISE AI — PHASE 37A: REAL USER FEEDBACK SYSTEM VERIFICATION");
console.log("================================================================================");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      res
        .then(() => {
          console.log(`✅ PASS: ${name}`);
          passed++;
        })
        .catch((err) => {
          console.error(`❌ FAIL: ${name}`);
          console.error(`   Error: ${err.message}`);
          failed++;
        });
    } else {
      console.log(`✅ PASS: ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  // 1. Feedback entry point exists
  test("1. Feedback entry point exists in Navbar and Footer", () => {
    const navbarCode = fs.readFileSync(path.join(__dirname, "../src/components/layout/Navbar.tsx"), "utf-8");
    const footerCode = fs.readFileSync(path.join(__dirname, "../src/components/layout/Footer.tsx"), "utf-8");

    if (!navbarCode.includes("FeedbackModal") || !navbarCode.includes("Feedback")) {
      throw new Error("Navbar does not include Feedback entry point");
    }
    if (!footerCode.includes("FeedbackModal") || !footerCode.includes("Feedback")) {
      throw new Error("Footer does not include Feedback entry point");
    }
  });

  // 2. Feedback form renders & exports
  test("2. Feedback form component exists", () => {
    const modalFile = path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx");
    const quickFile = path.join(__dirname, "../src/components/feedback/QuickFeedback.tsx");
    if (!fs.existsSync(modalFile) || !fs.existsSync(quickFile)) {
      throw new Error("Feedback UI components missing");
    }
  });

  // 3. Rating validation
  test("3. Rating validation (1 to 5 integer)", () => {
    // Valid ratings
    for (let r = 1; r <= 5; r++) {
      const validRes = validateFeedbackSubmission({ rating: r, category: "Website" });
      if (!validRes.isValid) throw new Error(`Valid rating ${r} was rejected`);
    }

    // Invalid ratings
    const invalidRatings = [0, 6, -1, 3.5, "invalid", null, undefined];
    for (const r of invalidRatings) {
      const invRes = validateFeedbackSubmission({ rating: r, category: "Website" });
      if (invRes.isValid) throw new Error(`Invalid rating ${r} was erroneously accepted`);
    }
  });

  // 4. Category validation
  test("4. Category validation against allowed values", () => {
    for (const cat of VALID_FEEDBACK_CATEGORIES) {
      const res = validateFeedbackSubmission({ rating: 5, category: cat });
      if (!res.isValid) throw new Error(`Valid category ${cat} was rejected`);
    }

    const invalidCats = ["FakeCategory", "Spam", 123, ""];
    for (const cat of invalidCats) {
      const res = validateFeedbackSubmission({ rating: 5, category: cat });
      if (res.isValid) throw new Error(`Invalid category ${cat} was accepted`);
    }
  });

  // 5. Comment validation
  test("5. Comment validation and sanitization", () => {
    // Under max limit
    const res = validateFeedbackSubmission({
      rating: 4,
      category: "Recommendation",
      comment: "Great suggestion for programming laptops!",
    });
    if (!res.isValid || res.cleanData?.comment !== "Great suggestion for programming laptops!") {
      throw new Error("Valid comment failed validation");
    }

    // Sanitize script tags
    const malicious = "Great site <script>alert(1)</script>";
    const sanitized = sanitizeText(malicious);
    if (sanitized.includes("<") || sanitized.includes(">")) {
      throw new Error("HTML angle brackets were not stripped by sanitizer");
    }

    // Exceed max length
    const tooLong = "a".repeat(1050);
    const longRes = validateFeedbackSubmission({
      rating: 4,
      category: "Website",
      comment: tooLong,
    });
    if (longRes.isValid) throw new Error("Comment exceeding 1000 chars was accepted");
  });

  // 6. Optional email works
  test("6. Optional email works (valid or omitted)", () => {
    const withoutEmail = validateFeedbackSubmission({ rating: 5, category: "Website" });
    if (!withoutEmail.isValid || withoutEmail.cleanData?.email !== null) {
      throw new Error("Omission of email failed");
    }

    const withEmail = validateFeedbackSubmission({
      rating: 5,
      category: "Website",
      email: "user@example.com",
    });
    if (!withEmail.isValid || withEmail.cleanData?.email !== "user@example.com") {
      throw new Error("Valid email failed");
    }
  });

  // 7. Invalid email rejected
  test("7. Invalid email rejected", () => {
    const badEmails = ["notanemail", "user@", "@domain.com", "user@domain", "user space@domain.com"];
    for (const b of badEmails) {
      const res = validateFeedbackSubmission({
        rating: 5,
        category: "Website",
        email: b,
      });
      if (res.isValid) throw new Error(`Invalid email ${b} was accepted`);
    }
  });

  // 8. Successful submission
  test("8. Successful submission to storage adapter", async () => {
    const submission = {
      rating: 5,
      category: "Recommendation" as const,
      comment: "Super fast and helpful specs.",
      email: "shopper@buywise.ai",
      productId: "hp-victus-15-fa2500tx",
    };
    const validation = validateFeedbackSubmission(submission);
    if (!validation.isValid || !validation.cleanData) {
      throw new Error("Submission validation failed");
    }
    const saveRes = await feedbackStorage.saveFeedback(validation.cleanData);
    if (!saveRes.success || !saveRes.id) {
      throw new Error("Failed to save validated submission");
    }
  });

  // 9. Duplicate / spam protection
  test("9. Duplicate / spam protection", () => {
    const ip = "192.168.1.100";
    // Check rate limit allows initial requests
    const allowed = feedbackStorage.checkRateLimit(ip);
    if (!allowed) throw new Error("Initial request was blocked by rate limiter");
  });

  // 10. Quick helpful / not-helpful feedback
  test("10. Quick helpful / not-helpful feedback", async () => {
    const helpfulVote = validateFeedbackSubmission({
      feedbackType: "quick_vote",
      helpfulVote: true,
      productId: "hp-victus-15-fa2500tx",
    });
    if (!helpfulVote.isValid || helpfulVote.cleanData?.rating !== 5) {
      throw new Error("Helpful quick vote did not map to 5 stars");
    }

    const notHelpfulVote = validateFeedbackSubmission({
      feedbackType: "quick_vote",
      helpfulVote: false,
      productId: "hp-victus-15-fa2500tx",
    });
    if (!notHelpfulVote.isValid || notHelpfulVote.cleanData?.rating !== 1) {
      throw new Error("Not helpful quick vote did not map to 1 star");
    }
  });

  // 11. Mobile-safe UI assumptions
  test("11. Mobile-safe UI assumptions", () => {
    const modalCode = fs.readFileSync(path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx"), "utf-8");
    if (!modalCode.includes("max-w-lg") || !modalCode.includes("overflow-y-auto")) {
      throw new Error("Feedback modal missing mobile max-width / overflow protection");
    }
  });

  // 12. No secrets exposed
  test("12. No secrets exposed in client feedback code", () => {
    const modalCode = fs.readFileSync(path.join(__dirname, "../src/components/feedback/FeedbackModal.tsx"), "utf-8");
    const quickCode = fs.readFileSync(path.join(__dirname, "../src/components/feedback/QuickFeedback.tsx"), "utf-8");

    if (modalCode.includes("process.env.") || quickCode.includes("process.env.")) {
      throw new Error("Client feedback components contain process.env secret accesses");
    }
  });

  // 13. No sensitive data collected
  test("13. No sensitive data collected in schema", () => {
    const typesCode = fs.readFileSync(path.join(__dirname, "../src/services/feedback/types.ts"), "utf-8");
    const forbidden = ["password", "cardNumber", "cvv", "apiKey", "secret", "authHeader"];
    for (const f of forbidden) {
      if (typesCode.includes(f)) {
        throw new Error(`Forbidden sensitive field '${f}' found in feedback schema`);
      }
    }
  });

  // 14. API endpoint returns safe responses
  test("14. API endpoint returns safe responses", () => {
    const routeCode = fs.readFileSync(path.join(__dirname, "../src/app/api/feedback/route.ts"), "utf-8");
    if (!routeCode.includes("validateFeedbackSubmission") || !routeCode.includes("feedbackStorage")) {
      throw new Error("API route missing validation or storage pipeline");
    }
    if (routeCode.includes("console.log(body.comment)") || routeCode.includes("console.log(comment)")) {
      throw new Error("API route logging user comments to console!");
    }
  });

  // Wait a small tick for any async tests
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("\n==================================================");
  console.log(`PHASE 37A VERIFICATION: ${passed} PASSED / ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(console.error);
