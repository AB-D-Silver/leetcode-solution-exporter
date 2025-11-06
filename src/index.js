import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import {
	stripHtml,
	loadCookies,
	loadProblemsFromFile,
	sleep,
	ensureDir,
} from "./utils.js";
import { getProblemData, getLatestAcceptedSubmission } from "./fetcher.js";

dotenv.config();

// Configuration from environment
const config = {
	baseUrl: process.env.LEETCODE_GRAPHQL_URL || "https://leetcode.com/graphql",
	outputDir: process.env.OUTPUT_DIR || "./output",
	problemName: process.env.PROBLEM_NAME || "LeetCode",
	cookiesFile: process.env.COOKIES_FILE || "./config/cookies.json",
	problemsFile: process.env.PROBLEMS_FILE || "./config/problems.txt",
	separateFiles: process.env.SEPARATE_FILES === "true",
	requestDelay: parseInt(process.env.REQUEST_DELAY || "1000"),
};

/**
 * Generate markdown content for a problem
 */
function generateMarkdownContent(problem, code, language) {
	const lines = [
		`# ${problem.questionId}. ${problem.title} (${problem.difficulty})`,
		``,
		`## 📝 Description`,
		``,
		stripHtml(problem.content),
		``,
	];

	const exampleBlock = problem.exampleTestcases?.trim();
	if (exampleBlock) {
		lines.push(`## 📄 Example Test Cases`, ``, "```", exampleBlock, "```", ``);
	}

	lines.push(
		`## ✔️ Solution (${language})`,
		``,
		`\`\`\`${language.toLowerCase()}`,
		code.trim(),
		"```",
		``,
		`---`,
		``
	);

	return lines.join("\n");
}

/**
 * Save markdown to file
 */
async function saveMarkdown(content, problem, separateFiles) {
	if (separateFiles) {
		// Create separate file for each problem
		const filename = path.join(
			config.outputDir,
			`${problem.questionId}-${problem.titleSlug}.md`
		);
		await fs.writeFile(filename, content, "utf-8");
		console.log(`✔️ Saved: ${filename}`);
	} else {
		// Append to single file
		const filename = path.join(config.outputDir, `${config.problemName}.md`);
		await fs.appendFile(filename, content + "\n\n", "utf-8");
		console.log(`✔️ Appended to: ${filename}`);
	}
}

/**
 * Process a single problem
 */
async function processProblem(slug, cookie) {
	try {
		console.log(`\n📦 Processing: ${slug}`);

		const problem = await getProblemData(config.baseUrl, slug, cookie);
		if (!problem) {
			console.warn(`⚠️  Skipping ${slug} - problem not found`);
			return false;
		}

		const submission = await getLatestAcceptedSubmission(
			config.baseUrl,
			slug,
			cookie
		);

		if (!submission) {
			console.warn(`⚠️  Skipping ${slug} - no accepted solution`);
			return false;
		}

		const content = generateMarkdownContent(
			problem,
			submission.code,
			submission.lang.verboseName
		);

		await saveMarkdown(content, problem, config.separateFiles);
		return true;
	} catch (err) {
		console.error(`❌ Error processing ${slug}: ${err.message}`);
		return false;
	}
}

/**
 * Main execution
 */
async function main() {
	console.log("🚀 LeetCode to Markdown Exporter\n");
	console.log("Configuration:");
	console.log(`  Output Dir: ${config.outputDir}`);
	console.log(`  Separate Files: ${config.separateFiles}`);
	console.log(`  Request Delay: ${config.requestDelay}ms\n`);

	try {
		// Load cookies
		const cookie = await loadCookies(config.cookiesFile);
		console.log("✔️ Cookies loaded");

		// Ensure output directory exists
		await ensureDir(config.outputDir);
		console.log("✔️ Output directory ready\n");

		// Get problem slugs from command line args or file
		let slugs = process.argv.slice(2);

		if (slugs.length === 0) {
			console.log(`📄 Loading problems from: ${config.problemsFile}`);
			slugs = await loadProblemsFromFile(config.problemsFile);
			console.log(`✔️ Loaded ${slugs.length} problems\n`);
		} else {
			console.log(
				`📄 Processing ${slugs.length} problem(s) from command line\n`
			);
		}

		if (slugs.length === 0) {
			console.log("⚠️  No problems to process!");
			return;
		}

		// Process each problem
		let successCount = 0;
		let failCount = 0;

		for (let i = 0; i < slugs.length; i++) {
			const slug = slugs[i];
			const success = await processProblem(slug, cookie);

			if (success) successCount++;
			else failCount++;

			// Rate limiting delay (except for last item)
			if (i < slugs.length - 1) {
				await sleep(config.requestDelay);
			}
		}

		// Summary
		console.log("\n" + "=".repeat(50));
		console.log("📊 Summary:");
		console.log(`  ✔️ Successfully processed: ${successCount}`);
		console.log(`  ❌ Failed: ${failCount}`);
		console.log(`  📁 Output location: ${config.outputDir}`);
		console.log("=".repeat(50));
	} catch (error) {
		console.error("\n❌ Fatal error:", error.message);
		process.exit(1);
	}
}

// Run the script
main();
