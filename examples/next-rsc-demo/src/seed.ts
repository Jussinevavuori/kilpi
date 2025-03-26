import { db } from "./db";
/**
 * Seed the database when initializing
 */
export async function seed() {
  console.log(`🟢 Seeding database...`);

  /**
   * Create better-auth user table
   *
   * https://www.better-auth.com/docs/concepts/database#user
   */
  await db.exec(`
		CREATE TABLE IF NOT EXISTS user (
			id TEXT PRIMARY KEY,
			name TEXT,
			email TEXT,
			emailVerified BOOLEAN,
			image TEXT,
			createdAt DATE,
			updatedAt DATE,
			role TEXT,
			banned BOOLEAN,
			banReason TEXT,
			banExpires DATE
		);	
	`);

  console.log(`🟢 Created "users" table`);

  /**
   * Create better-auth session table
   *
   * https://www.better-auth.com/docs/concepts/database#session
   */
  await db.exec(`
		CREATE TABLE IF NOT EXISTS session (
			id TEXT PRIMARY KEY,
			userId TEXT,
			token TEXT,
			expiresAt DATE,
			ipAddress TEXT,
			userAgent TEXT,
			createdAt DATE,
			updatedAt DATE,
			FOREIGN KEY (userId) REFERENCES user(id)
		);
	`);

  console.log(`🟢 Created "session" table`);

  /**
   * Create better-auth account table
   *
   * https://www.better-auth.com/docs/concepts/database#account
   */
  await db.exec(`
		CREATE TABLE IF NOT EXISTS account (
			id TEXT PRIMARY KEY,
			userId TEXT,
			accountId TEXT,
			providerId TEXT,
			accessToken TEXT,
			refreshToken TEXT,
			accessTokenExpiresAt DATE,
			refreshTokenExpiresAt DATE,
			scope TEXT,
			idToken TEXT,
			password TEXT,
			createdAt DATE,
			updatedAt DATE,
			FOREIGN KEY (userId) REFERENCES user(id)
		);
	`);

  console.log(`🟢 Created "account" table`);

  /**
   * Create better-auth verification table
   *
   * https://www.better-auth.com/docs/concepts/database#verification
   */
  await db.exec(`
		CREATE TABLE IF NOT EXISTS verification (
			id TEXT PRIMARY KEY,
			identifier TEXT,
			value TEXT,
			expiresAt DATE,
			createdAt DATE,
			updatedAt DATE
		);
	`);

  console.log(`🟢 Created "verification" table`);

  /**
   * Create custom news-article table.
   */
  await db.exec(`
		CREATE TABLE IF NOT EXISTS articles (
			id TEXT PRIMARY KEY,
			userId TEXT,
			title TEXT,
			content TEXT,
			createdAt DATE,
			isPublished BOOLEAN,
			FOREIGN KEY (userId) REFERENCES user(id)
		);
	`);

  console.log(`🟢 Created "articles" table`);

  /**
   * Insert 3 example users. Use creative names.
   */
  await db.exec(`
		INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
		VALUES
			('1', 'Alice Wonderland', 'alice.wonderland@mail.com', 1, '2021-01-01', '2021-01-01', 'admin'),
			('2', 'Bob Builder', 'bob.builder@mail.com', 1, '2021-01-01', '2021-01-01', 'user'),
			('3', 'Charlie Chaplin', 'charlie.chaplin@mail.com', 1, '2021-01-01', '2021-01-01', 'user');
	`);

  console.log(`🟢 Created example users`);

  /**
   * Insert example articles.
   */
  await db.exec(`
		INSERT INTO articles (id, userId, title, content, createdAt, isPublished)
		VALUES
			(
				'a1',
				'1',
				'AI Revolution: How Machine Learning is Changing Everything',
				'Artificial intelligence is no longer a buzzword; it’s embedded in our daily lives. From smart assistants to content generation, machine learning models are helping humans work faster, think better, and do more. Businesses are rapidly adopting AI to streamline workflows and drive innovation.\n\nExperts believe that the next wave of AI will be even more personalized and efficient. With advancements in natural language processing and real-time learning, AI may soon move from passive assistant to proactive collaborator in many fields.',
				'2023-10-01',
				1
			),
			(
				'a2',
				'1',
				'Quantum Computing Inches Closer to Reality',
				'For decades, quantum computing has lived mostly in research papers and theoretical physics discussions. But recent developments from companies like IBM and Google hint that we may be nearing a breakthrough. Their prototype systems are starting to solve problems classical computers struggle with.\n\nThough still early, the implications are massive. Quantum computing could revolutionize areas like cryptography, materials science, and drug discovery, potentially unlocking new scientific frontiers we can’t yet imagine.',
				'2023-10-05',
				1
			),
			(
				'a3',
				'1',
				'The Rise of Edge Computing in a Connected World',
				'Edge computing is quietly reshaping how data is processed and delivered. Instead of sending everything to the cloud, edge computing allows devices to process data locally. This means faster response times, lower bandwidth usage, and improved privacy — all crucial for IoT and smart infrastructure.\n\nWith the explosion of connected devices, industries from healthcare to transportation are embracing edge architectures. Experts predict the edge will become just as important as the cloud in the coming years.',
				'2023-10-10',
				1
			),
			(
				'b1',
				'2',
				'3D Printing is Revolutionizing Construction',
				'3D printing is no longer limited to prototypes or small gadgets. In the construction world, companies are building entire homes using massive 3D printers. This method reduces waste, cuts costs, and accelerates project timelines significantly.\n\nWhile the technology still faces regulatory and scalability hurdles, the potential for affordable, eco-friendly housing has attracted global interest. Builders and architects are beginning to design with 3D printing in mind.',
				'2023-10-12',
				1
			),
			(
				'b2',
				'2',
				'How Drones Are Transforming Job Sites',
				'From surveying land to inspecting hard-to-reach infrastructure, drones are becoming essential tools in the construction industry. With high-res cameras and real-time data streaming, project managers gain better visibility and control.\n\nBeyond safety and efficiency, drones are helping teams make more informed decisions. As software advances, drones may soon take on more automated, AI-assisted roles in planning and logistics.',
				'2023-10-15',
				0
			),
			(
				'c1',
				'3',
				'The Return of Silent Tech: Minimalist Devices Gain Popularity',
				'In a world overloaded with notifications and distractions, a quiet tech revolution is underway. Minimalist phones and distraction-free devices are becoming popular among digital detoxers and productivity seekers alike.\n\nBrands are now exploring “silent tech” as a lifestyle choice — one that prioritizes intentional use and mental well-being over constant connectivity.',
				'2023-10-18',
				0
			),
			(
				'c2',
				'3',
				'Film Restoration Meets AI: Saving Cinema History',
				'Classic films are being brought back to life thanks to AI-powered restoration tools. These models clean up scratches, upscale resolution, and even reconstruct missing frames, preserving cultural heritage for new generations.\n\nStudios and archivists are using this technology to digitize rare footage and enhance visual quality beyond what was ever possible before — all while respecting the original artistry.',
				'2023-10-20',
				1
			);
	`);

  console.log(`🟢 Created example articles`);

  console.log(`🟢 Database seeded`);
}
