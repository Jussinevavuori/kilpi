import { createKilpi, deny, grant, type Policyset } from "@kilpi/core";
import { ReactServerComponentPlugin } from "src/plugins/ReactServerComponentPlugin";
import { describe, expect, it } from "vitest";

type Sub = { id: number };
const sub = { id: 1 };

type Doc = { id: number; userId: number };
const doc = { id: 1, userId: 1 };

const policies = {
  async example(user) {
    return grant(user);
  },

  documents: {
    async read(user, doc: Doc) {
      if (!user) return deny();
      if (doc.userId !== user.id) return deny();
      return grant(user);
    },
  },
} satisfies Policyset<Sub | null>;

const Kilpi = createKilpi({
  getSubject: () => Promise.resolve(sub),
  policies,
  plugins: [ReactServerComponentPlugin()],
});

describe("types", () => {
  it("should be typesafe and have correct types", async () => {
    const { Access } = Kilpi.ReactServer.createComponents();

    // These should not throw type errors if all's well
    void (<Access to="example" />);
    void (<Access to="documents:read" on={doc} />);

    // No run-time tests
    expect(true).toBe(true);
  });
});
