import { deny, grant, type Policyset } from "src";

export type TestRole = "admin" | "user" | "guest";

// Test subject
export type TestSubject = {
  id: string;
  roles: TestRole[];
};

// Test document
export type TestDocument = {
  id: string;
  userId: string;
};

// Test state
const testState = {
  // Current subject
  subject: null as TestSubject | null,

  // Mocked document database
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

// Mocked `getSubject`
async function getSubject() {
  return await Promise.resolve(testState.subject);
}

// Mocked query to get a document by ID
async function getDocument(id: string) {
  return await Promise.resolve(testState.documents[id]);
}

// Mocked query to list all documents
async function listAllDocuments() {
  return await Promise.resolve(Object.values(testState.documents));
}

// All test policies
const policies = {
  // Always fail
  never() {
    return deny();
  },

  // Pass always
  public(subject) {
    return grant(subject);
  },

  // Authed only
  authed(subject) {
    if (!subject) return deny({ message: "Unauthenticated" });
    return grant(subject);
  },

  // Nested keys
  docs: {
    // Authed only if ID matches
    ownDocument(subject, doc: TestDocument) {
      if (!subject) return deny({ message: "Unauthenticated" });
      if (subject.id !== doc.userId) return deny();
      return grant(subject);
    },

    // Deeply nested policy
    deeply: {
      nested: {
        policy(subject, doc: TestDocument) {
          if (!subject) return deny({ message: "Unauthenticated" });
          if (subject.id !== doc.userId) return deny();
          return grant(subject);
        },
      },
    },
  },

  // Types
  types: {
    none_1() {
      return deny({ message: "No type" });
    },

    none_2() {
      return deny("No type");
    },

    type_1() {
      return deny({ message: "Type 1", type: "type_1" });
    },

    type_2() {
      return deny({ message: "Type 2", type: "type_2" });
    },
  },
} satisfies Policyset<TestSubject | null>;

// Custom test error class for testing throwing custom errors
class TestErrorClass extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "TestErrorClass";
  }
}

// Run a function while authenticated as another mocked user.
async function runAs<TSubject extends TestSubject | null>(
  subject: TSubject,
  fn: (subject: TSubject) => void | Promise<void>,
) {
  try {
    testState.subject = subject; // Sign in
    await fn(subject); // Run as signed in
  } finally {
    testState.subject = null; // Sign out
  }
}

// Export all test utilities as `TestUtils`
export const TestUtils = {
  runAs,
  getSubject,
  getDocument,
  listAllDocuments,
  TestErrorClass,
  policies,
};
