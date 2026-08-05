# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2026-08-05

### Fixed
- Corrected `baseline update` so it updates `@grupoengen/engen-base-ai` instead of the obsolete package name.

## [1.0.1] - 2026-08-05

### Fixed
- Git hooks now use portable POSIX `sh` syntax, preventing Windows WSL `execvpe(/bin/bash)` push failures.
- Executable detection and Gentle-AI installation no longer depend on Unix-only shell commands.
- Windows installation now reports actionable prerequisites when Bash or WSL is unavailable.
- `baseline update` now updates the current `@grupoengen/engen-base-ai` package.

## [1.0.0] - 2026-07-22

### Added
- Initial release of `engen-base-ai` under the ENGEN organization
- `baseline install` — installs team standards, skills, and AI tool configuration
- `baseline update` — updates the package and re-applies standards
- `baseline status` — shows installed tools and team config state
- `baseline doctor` — verifies the full environment configuration
- `baseline onboard [junior|semi|senior]` — shows role-specific onboarding guide
- Claude Code adapter: copies skills to `~/.claude/skills/` and appends team standards to `CLAUDE.md`
- OpenCode adapter: copies skills to `~/.opencode/skills/` and appends team standards to `AGENTS.md`
- Kiro IDE/CLI support with skills and steering configuration
- Gentle-AI ecosystem integration with per-agent presets
- OpenSpec structure bootstrap for spec-driven development (SDD)
- Full SDD skill suite: explore, propose, spec, design, tasks, apply, verify, archive
- Code review skills: risk, readability, reliability, resilience (4R framework)
- Git workflow skills: branch-pr, chained-pr, work-unit-commits
- Architecture guidelines skill with team-specific stack rules
- Jira workflow integration with SDD phase mapping
- Global git hooks: pre-push (branch protection) and post-commit (Jira comments)
- **Automatic Strict TDD Mode** — enforces test-first workflow across all AI tools
- CI workflows: `validate.yml` (lint + build) and `publish.yml` (publish on release)
