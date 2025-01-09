import { createRuleset } from "../src";

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

/**
 * Test ruleset
 */
const ruleset = createRuleset<TestSubject | null>()((Rule) => {
  const Authed = Rule.subject((subject) => (subject ? subject : false)).create;

  return {
    // Pass always
    public: Rule.create(() => true),

    // Authed only
    authed: Authed(() => true),

    // Nested keys
    docs: {
      // Authed only if ID matches
      ownDocument: Authed<TestDocument>((user, doc) => user.id === doc.userId),

      // Deeply nested rule
      deeply: {
        nested: {
          rule: Authed<TestDocument>((user, doc) => user.id === doc.userId),
        },
      },
    },
  };
});

/**
 * Run a function while subject is defined as a custom user (or unauthed when null)
 */
async function runAs<TSubject extends TestSubject | null>(
  subject: TSubject,
  fn: (subject: TSubject) => void | Promise<void>
) {
  testState.subject = subject;
  await fn(subject);
  testState.subject = null;
}

/**
 * Export test utilities
 */
export const TestUtils = {
  ruleset,
  runAs,
  getSubject,
  getDocument,
};
