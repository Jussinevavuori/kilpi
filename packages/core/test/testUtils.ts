import { Rules } from "src/rule";
import { KilpiCore } from "../src";

/**
 * Example subject
 */
export type TestSubject = {
  id: string;
};

/**
 * Example resource
 */
export type TestDocument = {
  id: string;
  userId: string;
};

/**
 * Test state modified by test utilities
 */
const testState = {
  subject: null as TestSubject | null,

  /**
   * Document database
   */
  documents: {
    // Docs 1-3 are owned by user1
    doc1: { id: "doc1", userId: "user1" },
    doc2: { id: "doc2", userId: "user1" },
    doc3: { id: "doc3", userId: "user1" },

    // Docs 4-6 are owned by user2
    doc4: { id: "doc4", userId: "user2" },
    doc5: { id: "doc5", userId: "user2" },
    doc6: { id: "doc6", userId: "user2" },
  } as Record<string, TestDocument>,
};

/**
 * Access subject as promise from test state
 */
async function getSubject() {
  return await Promise.resolve(testState.subject);
}

async function getDocument(id: string) {
  return await Promise.resolve(testState.documents[id]);
}

async function listAllDocuments() {
  return await Promise.resolve(Object.values(testState.documents));
}

const PublicRule = Rules.as((subject: TestSubject | null) => ({ subject }));
const AuthedRule = Rules.as((subject: TestSubject | null) => (subject ? { subject } : null));

/**
 * Test definitions
 */
export const TestKilpi = new KilpiCore({
  getSubject,
  rules: {
    // Pass always
    public: PublicRule.new(() => true),

    // Pass always (without Public guard)
    public2: PublicRule.new(() => true),

    // Authed only
    authed: AuthedRule.new(() => true),

    // Nested keys
    docs: {
      // Authed only if ID matches
      ownDocument: AuthedRule.new((user, doc: TestDocument) => user.id === doc.userId),

      // Deeply nested rule
      deeply: {
        nested: {
          rule: AuthedRule.new((user, doc: TestDocument) => user.id === doc.userId),
        },
      },
    },
  },
});

class TestErrorClass extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "TestErrorClass";
  }
}

/**
 * Run a function while subject is defined as a custom user (or unauthed when null)
 */
async function runAs<TSubject extends TestSubject | null>(
  subject: TSubject,
  fn: (subject: TSubject) => void | Promise<void>,
) {
  testState.subject = subject; // Sign in
  await fn(subject); // Run as signed in
  testState.subject = null; // Sign out
}

/**
 * Export test utilities
 */
export const TestUtils = {
  runAs,
  getSubject,
  getDocument,
  listAllDocuments,
  TestErrorClass,
};
