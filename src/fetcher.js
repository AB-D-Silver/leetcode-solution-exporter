/**
 * LeetCode API Fetcher Functions
 */

/**
 * Generic GraphQL fetcher
 */
export async function fetchGraphQL(baseUrl, query, variables, cookie) {
	const res = await fetch(baseUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			cookie: cookie,
			"x-csrftoken": cookie.match(/csrftoken=([^;]+)/)[1],
			Referer: "https://leetcode.com",
		},
		body: JSON.stringify({ query, variables }),
	});

	if (!res.ok) {
		const errorText = await res.text();
		console.error("❌ Response error:", res.status);
		console.error("❌ Response body:", errorText);
		throw new Error(`GraphQL request failed: ${res.status}`);
	}

	const json = await res.json();
	return json.data;
}

/**
 * Fetch problem data by slug
 */
export async function getProblemData(baseUrl, slug, cookie) {
	const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        content
        difficulty
        exampleTestcases
      }
    }
  `;
	const variables = { titleSlug: slug };
	const data = await fetchGraphQL(baseUrl, query, variables, cookie);

	if (!data || !data.question) {
		console.error(`❌ Problem not found for slug: ${slug}`);
		return null;
	}

	console.log(`✔️ Problem data fetched: ${slug}`);
	return data.question;
}

/**
 * Fetch submission details
 */
async function fetchSubmissionDetails(baseUrl, submissionId, cookie) {
	const query = `
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        code
        lang {
          name
          verboseName
        }
      }
    }
  `;
	const variables = { submissionId: parseInt(submissionId) };
	return await fetchGraphQL(baseUrl, query, variables, cookie);
}

/**
 * Get latest accepted submission for a problem
 */
export async function getLatestAcceptedSubmission(baseUrl, slug, cookie) {
	const listQuery = `
    query submissionList($questionSlug: String!, $offset: Int!, $limit: Int!) {
      submissionList(questionSlug: $questionSlug, offset: $offset, limit: $limit) {
        submissions {
          id
          statusDisplay
          lang
        }
      }
    }
  `;
	const listVars = { questionSlug: slug, offset: 0, limit: 20 };
	const submissions = await fetchGraphQL(baseUrl, listQuery, listVars, cookie);

	const latest = submissions.submissionList.submissions.find(
		(s) => s.statusDisplay === "Accepted"
	);

	if (!latest) {
		console.warn(`⚠️  No accepted solution found for: ${slug}`);
		return null;
	}

	console.log(`✔️ Found accepted submission for: ${slug}`);
	const detail = await fetchSubmissionDetails(baseUrl, latest.id, cookie);
	return detail.submissionDetails;
}
