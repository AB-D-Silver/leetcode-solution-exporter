# LeetCode to Markdown Exporter

A Node.js tool to fetch LeetCode problems and your accepted solutions, then export them as formatted Markdown files.

## 📁 Project Structure

```
leetcode-exporter/
├── src/
│   ├── index.js              # Main entry point
│   ├── fetcher.js            # Core LeetCode API functions
│   └── utils.js              # Helper utilities
├── config/
│   ├── cookies.json          # Your LeetCode session cookies
│   └── problems.txt          # List of problem slugs (one per line)
├── output/                   # Generated markdown files
├── .env                      # Environment configuration
├── .env.example             # Example environment file
├── .gitignore               # Git ignore file
├── package.json             # Node.js dependencies
└── README.md                # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cookies

Create `config/cookies.json` with your LeetCode session:

```json
{
	"LEETCODE_SESSION": "your-session-cookie-here",
	"csrftoken": "your-csrf-token-here"
}
```

**How to get cookies:**

1. Log into LeetCode
2. Open DevTools (F12) → Application/Storage → Cookies
3. Copy `LEETCODE_SESSION` and `csrftoken` values

### 3. Add Problem Slugs

Create `config/problems.txt` with one problem slug per line:

```
two-sum
reverse-linked-list
valid-parentheses
merge-two-sorted-lists
```

### 4. Configure Environment

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

### 5. Run the Exporter

```bash
npm start
```

Or process a single problem:

```bash
npm start -- two-sum
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# LeetCode API URL (usually no need to change)
LEETCODE_GRAPHQL_URL=https://leetcode.com/graphql

# Output directory for markdown files
OUTPUT_DIR=./output

# Default problem name prefix for output files
PROBLEM_NAME=LeetCode

# Path to cookies file
COOKIES_FILE=./config/cookies.json

# Path to problems list file
PROBLEMS_FILE=./config/problems.txt
```

### Problems List (config/problems.txt)

Add one problem slug per line. Lines starting with `#` are treated as comments:

```txt
# Array Problems
two-sum
best-time-to-buy-and-sell-stock

# Linked List Problems
reverse-linked-list
merge-two-sorted-lists

# Tree Problems
maximum-depth-of-binary-tree
```

## 📝 Output Format

Generated markdown files include:

- Problem title and difficulty
- Full problem description
- Example test cases
- Your accepted solution code with syntax highlighting

Example output: `output/LeetCode.md`

## 🔧 Advanced Usage

### Process Specific Problems

```bash
# Single problem
node src/index.js two-sum

# Multiple problems
node src/index.js two-sum reverse-linked-list valid-parentheses
```

### Custom Output Directory

```bash
OUTPUT_DIR=./my-solutions npm start
```

### Separate Output Files

Set `SEPARATE_FILES=true` in `.env` to create one file per problem instead of appending to a single file.

## 🐛 Troubleshooting

**Problem: "GraphQL request failed: 401"**

- Your cookies are expired or invalid
- Update `config/cookies.json` with fresh session cookies

**Problem: "No accepted solution found"**

- You haven't solved this problem yet
- The solution might not be marked as "Accepted"

**Problem: "Problem not found"**

- Check the problem slug is correct
- Some premium problems may not be accessible

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
