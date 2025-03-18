import { CodeBlock } from "./CodeBlock";

export function IntroductionSection() {
  return (
    <section id="introduction" className="py-40 flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl text-center font-bold tracking-tight sm:text-4xl">
          Overview in 60 seconds
        </h2>
      </div>

      <div className="overflow-x-scroll">
        <CodeBlock
          lineNumbers
          language="tsx"
          className="max-w-[800px] !mx-auto"
          content={`
					// Setup subject
					async function getSubject(): Promise<Subject | null> {
						return myAuthProvider.getCurrentUser();
					}

					// Setup policies 
					const AuthedPolicy = Policy.as((subject: Subject | null) => {
						return subject ? { subject } : null;
					});

					// Define your policies
					const policies = {
						authed: AuthedPolicy.new(() => true),
						documents: {
							read: AuthedPolicy.new((user, doc: Document) => {
								return doc.ownerId === user.id || doc.isPublic;
							}),
							create: AuthedPolicy.new((user) => {
								return user.isPremium;
							}),
							update: AuthedPolicy.new(async (user, doc: Document) => {
								return doc.ownerId === user.id || (await getIsInvited(user, doc));
							}),
						}
					}

					// Create Kilpi instance
					const Kilpi = createKilpi({ getSubject, policies });

					// Authorize a mutation
					async function updateDocument(doc: MyDocument) {
					  await Kilpi.authorize("documents:update", doc);
						await db.updateDocument(doc);
					}

					// Wrap a query with protection
					const getDocument = Kilpi.query(
						async (id: string) => await db.getDocument(id),
						{
						  async protector({ output: doc }) {
							  if (doc) await Kilpi.authorize("documents:read", doc);
								return doc;
							}
						}
					)

					// Create components
					const { Access } = createKilpiReactServerComponents(Kilpi, {});

					// Create a protected page
					export default async function Page(params) {

						// Handle authorization errors
						Kilpi.onUnauthorized(() => redirect("/"));

						// Authorize the user (inferred as non-nullable)
						const user = await Kilpi.authorize("authed");

						// Call protected queries
						const document = await getDocument.protect(params.id);

						return (
							<main>
								<h1>{document.title}</h1>
								<p>Signed in as {user.name}</p>
							
								{/* Protect your UI */}
								<Access
									to="documents:update"
									on={document}
									Unauthorized={<p>Not allowed to edit this document</p>}
									Loading={<p>Loading...</p>}
								>
									<button>Edit document</button>
								</Access>
							</main>
						)
					}
				`}
        />
      </div>
    </section>
  );
}
