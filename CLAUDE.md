# CLAUDE.md - AI Assistant Guide for TrackPop

This document provides comprehensive guidance for AI assistants working on the TrackPop codebase.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Development Workflow](#development-workflow)
4. [Code Conventions](#code-conventions)
5. [Git Practices](#git-practices)
6. [Testing Guidelines](#testing-guidelines)
7. [AI Assistant Best Practices](#ai-assistant-best-practices)

---

## Project Overview

**Project Name:** TrackPop
**Repository:** Dilocris/TrackPop
**Status:** Initial setup phase

### Purpose
[To be documented as the project develops]

### Tech Stack
[To be documented - will include languages, frameworks, and key dependencies]

---

## Repository Structure

```
TrackPop/
├── .git/                 # Git repository data
├── CLAUDE.md            # This file - AI assistant guide
├── README.md            # [To be created] Project documentation
├── package.json         # [To be created] Node.js dependencies and scripts
├── src/                 # [To be created] Source code
├── tests/               # [To be created] Test files
├── docs/                # [To be created] Additional documentation
└── config/              # [To be created] Configuration files
```

### Key Directories (When Created)

- **`src/`** - Main source code directory
- **`tests/`** - Test files and test utilities
- **`docs/`** - Additional project documentation
- **`config/`** - Configuration files for various environments

---

## Development Workflow

### Setting Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd TrackPop

# Install dependencies (when package.json exists)
npm install
# or
yarn install
# or
pnpm install
```

### Branch Strategy

**Feature Branches:**
- Create feature branches from the main branch
- Use descriptive names: `feature/description`, `fix/bug-name`, `refactor/component-name`
- AI assistants working on issues use branches prefixed with `claude/`

**Branch Naming Convention:**
- Features: `feature/feature-name`
- Bug fixes: `fix/issue-description`
- Refactoring: `refactor/component-name`
- Documentation: `docs/topic`
- AI Assistant branches: `claude/claude-md-<session-id>`

### Development Process

1. **Before Starting:**
   - Read relevant files to understand existing code
   - Check for existing tests and patterns
   - Review recent commits for style consistency

2. **During Development:**
   - Follow existing code patterns and conventions
   - Write tests for new functionality
   - Keep changes focused and minimal
   - Avoid over-engineering or adding unrequested features

3. **Before Committing:**
   - Ensure code follows project conventions
   - Run tests to verify nothing breaks
   - Review changes for security vulnerabilities
   - Check that only intended files are staged

---

## Code Conventions

### General Principles

1. **Simplicity First**
   - Avoid over-engineering
   - Don't add features beyond what's requested
   - Keep solutions simple and focused
   - Three similar lines of code is better than a premature abstraction

2. **Code Quality**
   - Write self-documenting code with clear variable/function names
   - Add comments only where logic isn't self-evident
   - Don't add comments/docs to code you didn't change
   - Remove unused code completely (no commented-out code)

3. **Security**
   - Validate input at system boundaries (user input, external APIs)
   - Avoid common vulnerabilities: XSS, SQL injection, command injection
   - Don't add unnecessary error handling for scenarios that can't happen
   - Trust internal code and framework guarantees

### File Organization

- One primary export per file when possible
- Group related functionality together
- Keep files focused and cohesive
- Use clear, descriptive file names

### Naming Conventions

[To be documented based on project language and framework choices]

**Examples:**
- Variables: `camelCase`
- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.js` or `PascalCase.tsx` (to be determined)

### Code Style

[To be documented - may include:]
- Indentation (spaces vs tabs)
- Line length limits
- Semicolon usage
- Quote style (single vs double)
- Import order conventions

---

## Git Practices

### Commit Guidelines

**Commit Messages:**
- Use imperative mood: "Add feature" not "Added feature"
- First line: concise summary (50 chars or less)
- Focus on the "why" rather than the "what"
- Reference issue numbers when applicable

**Good Examples:**
```
Add user authentication middleware
Fix memory leak in event listeners
Refactor database connection pooling
Update API documentation for v2 endpoints
```

**Commit Strategy:**
- Create atomic commits (one logical change per commit)
- Don't commit unrelated changes together
- Avoid committing files with secrets (.env, credentials)

### Git Operations

**Pushing Changes:**
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Branch names must start with 'claude/' for AI assistant commits
# and match the session ID
```

**Fetching/Pulling:**
```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>
```

**Retry Logic:**
- If network failures occur, retry up to 4 times
- Use exponential backoff: 2s, 4s, 8s, 16s

### What NOT to Do

- ❌ Never use `git push --force` to main/master
- ❌ Never skip hooks (--no-verify, --no-gpg-sign) without explicit permission
- ❌ Never update git config without permission
- ❌ Avoid `git commit --amend` unless specific conditions are met
- ❌ Never use interactive git commands (-i flag)

---

## Testing Guidelines

### Test Organization

[To be documented based on testing framework]

**Test File Naming:**
- Unit tests: `<filename>.test.js` or `<filename>.spec.js`
- Integration tests: `<filename>.integration.test.js`
- E2E tests: `<filename>.e2e.test.js`

### Writing Tests

1. **Test Structure:**
   - Arrange: Set up test data and conditions
   - Act: Execute the code being tested
   - Assert: Verify the results

2. **Test Coverage:**
   - Write tests for new functionality
   - Update tests when modifying existing code
   - Don't remove tests without good reason

3. **Test Naming:**
   - Describe what is being tested
   - Include expected behavior
   - Use descriptive names: `should return null when input is empty`

### Running Tests

```bash
# Run all tests (when configured)
npm test

# Run specific test file
npm test -- <test-file-path>

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## AI Assistant Best Practices

### Before Making Changes

1. **Read First, Code Second**
   - ALWAYS read files before modifying them
   - Understand existing patterns and conventions
   - Check recent commits for context
   - Use Explore agent for codebase exploration

2. **Use TodoWrite Tool**
   - Plan complex tasks with todos
   - Track progress on multi-step implementations
   - Mark tasks as completed immediately when done
   - Keep only one task in_progress at a time

### During Development

1. **Follow Existing Patterns**
   - Match the coding style of surrounding code
   - Use existing utilities and helpers
   - Don't introduce new patterns without good reason

2. **Minimize Changes**
   - Only change what's necessary
   - Avoid refactoring unrelated code
   - Don't add "improvements" beyond the request
   - Remove, don't comment out, unused code

3. **Security First**
   - Watch for injection vulnerabilities
   - Validate at system boundaries
   - Fix security issues immediately when discovered

### Tool Usage

**File Operations:**
- Use `Read` tool, not `cat` command
- Use `Edit` tool, not `sed`/`awk`
- Use `Write` tool for new files, not `echo >>`
- Use `Glob` for finding files by pattern
- Use `Grep` for searching file contents

**Code Search:**
- For specific file/class/function: Use `Glob` or `Grep` directly
- For exploration: Use `Task` tool with `subagent_type=Explore`
- For questions about architecture: Use Explore agent

**Parallel Operations:**
- Make independent tool calls in parallel
- Use single message with multiple tool blocks
- Don't parallelize dependent operations

### Communication

1. **Be Concise**
   - Keep responses short and focused
   - Output text directly, not via bash echo
   - Use GitHub-flavored markdown for formatting

2. **No Emojis** (unless explicitly requested)

3. **Code References**
   - Use format: `file_path:line_number`
   - Example: "Error handling occurs in src/services/process.ts:712"

### Committing Code

**Only commit when explicitly requested.**

**Commit Process:**
1. Run `git status` and `git diff` in parallel
2. Review all changes carefully
3. Stage relevant files with `git add`
4. Create descriptive commit message
5. Use HEREDOC for commit messages:
   ```bash
   git commit -m "$(cat <<'EOF'
   Your commit message here
   EOF
   )"
   ```
6. Run `git status` after commit to verify

**Pull Request Process:**
1. Review full commit history with `git log` and `git diff`
2. Analyze ALL commits (not just the latest)
3. Draft comprehensive PR summary
4. Push to remote with `-u` flag if needed
5. Create PR using `gh pr create` with HEREDOC
6. Return PR URL to user

---

## Project-Specific Notes

### Dependencies
[To be documented as dependencies are added]

### Environment Variables
[To be documented when environment configuration is needed]

### Build Process
[To be documented when build tools are configured]

### Deployment
[To be documented when deployment process is established]

---

## Resources

### Documentation Links
[To be added as the project grows]

### Related Projects
[To be added if relevant]

### External Resources
[To be added for frameworks, libraries, etc.]

---

## Changelog

### 2026-01-24
- Initial CLAUDE.md creation
- Established basic structure and conventions template
- Set up AI assistant guidelines

---

## Contributing

This document should be updated as the project evolves:
- Add new conventions as they're established
- Document architectural decisions
- Update tech stack information
- Refine workflows based on team needs

**When updating this file:**
- Keep it concise and scannable
- Use clear examples
- Maintain the table of contents
- Add to changelog with dates

---

*Last Updated: 2026-01-24*
