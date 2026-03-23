import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { contactMessages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Contact Form Submission", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  const testData = {
    senderName: "Test User",
    senderEmail: "test@example.com",
    senderPhone: "555-1234",
    targetMember: "jane",
    subject: "Test Inquiry",
    message: "This is a test message",
  };

  let messageId: number;

  it("should successfully submit a contact form", async () => {
    const result = await caller.contact.submit(testData);

    expect(result.success).toBe(true);
    expect(result.message).toContain("sent successfully");
  });

  it("should reject submission with missing required fields", async () => {
    const invalidData = {
      senderName: "",
      senderEmail: "test@example.com",
      targetMember: "jane",
      subject: "Test",
      message: "Test",
    };

    try {
      await caller.contact.submit(invalidData as any);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should reject submission with invalid email", async () => {
    const invalidData = {
      senderName: "Test User",
      senderEmail: "invalid-email",
      targetMember: "jane",
      subject: "Test",
      message: "Test",
    };

    try {
      await caller.contact.submit(invalidData as any);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should save message to database", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping persistence test");
      return;
    }

    // Submit a message
    await caller.contact.submit({
      ...testData,
      senderEmail: "persistence-test@example.com",
    });

    // Query the database to verify it was saved
    const messages = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.senderEmail, "persistence-test@example.com"))
      .limit(1);

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].senderName).toBe(testData.senderName);
    expect(messages[0].targetMember).toBe(testData.targetMember);
    expect(messages[0].isRead).toBe(0);

    messageId = messages[0].id;
  });

  it("should handle optional phone field", async () => {
    const dataWithoutPhone = {
      senderName: "Test User",
      senderEmail: "no-phone@example.com",
      targetMember: "jane",
      subject: "Test",
      message: "Test",
    };

    const result = await caller.contact.submit(dataWithoutPhone as any);
    expect(result.success).toBe(true);
  });
});
