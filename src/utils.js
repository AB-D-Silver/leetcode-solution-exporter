import fs from "fs/promises";

/**
 * Strip HTML entities and format text for markdown
 */
export function stripHtml(html) {
	return html
		.replace(/&nbsp;/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/(?:^|\s)Output:/g, "\n\nOutput:")
		.replace(/(?:^|\s)Explanation:/g, "\n\nExplanation:")
		.trim();
}

/**
 * Load cookies from JSON file
 */
export async function loadCookies(cookiesFile) {
	try {
		const cookieData = JSON.parse(await fs.readFile(cookiesFile, "utf-8"));
		return `LEETCODE_SESSION=${cookieData.LEETCODE_SESSION}; csrftoken=${cookieData.csrftoken};`;
	} catch (error) {
		console.error(`❌ Failed to load cookies from ${cookiesFile}`);
		throw error;
	}
}

/**
 * Load problem slugs from text file
 * Lines starting with # are treated as comments
 */
export async function loadProblemsFromFile(problemsFile) {
	try {
		const content = await fs.readFile(problemsFile, "utf-8");
		return content
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"));
	} catch (error) {
		console.error(`❌ Failed to load problems from ${problemsFile}`);
		throw error;
	}
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dir) {
	await fs.mkdir(dir, { recursive: true });
}
