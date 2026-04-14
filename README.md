# aircall-cli

[![npm version](https://img.shields.io/npm/v/aircall-cli.svg)](https://www.npmjs.com/package/aircall-cli)

> **Warning:** This is an unofficial CLI tool for the Aircall API. It is not affiliated with, endorsed by, or maintained by Aircall. Simply a project in vibe coding that may provide value to some users :) 

A command-line interface for interacting with the [Aircall Public API](https://developer.aircall.io/api-references/). Manage calls, contacts, users, numbers, tags, teams, and webhooks from your terminal.

## Installation

```bash
npm install -g aircall-cli
```

Requires Node.js 18 or later.

## Quick Start

1. **Authenticate** with your Aircall API credentials (found in the Aircall Dashboard under Integrations > API keys):

```bash
aircall auth login
```

2. **Test your connection:**

```bash
aircall ping
```

3. **Run your first command:**

```bash
aircall calls list
aircall users list --format json
```

## Available Commands

### Authentication

| Command | Description |
|---------|-------------|
| `aircall auth login` | Authenticate with API credentials (interactive or via flags) |
| `aircall auth status` | Check current authentication status |
| `aircall auth logout` | Remove stored credentials |

### Calls

| Command | Description |
|---------|-------------|
| `aircall calls list` | List calls |
| `aircall calls get <id>` | Get details for a specific call |
| `aircall calls search` | Search calls with filters |

### Conversation Intelligence

| Command | Description |
|---------|-------------|
| `aircall calls summary <id>` | Get the AI-generated summary of a call |
| `aircall calls topics <id>` | Get the topics discussed in a call |
| `aircall calls sentiments <id>` | Get the sentiment analysis of a call |
| `aircall calls action-items <id>` | Get the action items extracted from a call |
| `aircall calls transcription <id>` | Get the transcription of a call |
| `aircall calls realtime-transcription <id>` | Get the realtime transcription of a call |
| `aircall calls custom-summary <id>` | Get the custom summary result (AI Assist Pro) |
| `aircall calls evaluations <id>` | Get evaluation data for a call |
| `aircall calls playbook <id>` | Get the playbook result (AI Assist Pro) |

### Contacts

| Command | Description |
|---------|-------------|
| `aircall contacts list` | List contacts |
| `aircall contacts get <id>` | Get details for a specific contact |
| `aircall contacts create` | Create a new contact |
| `aircall contacts search` | Search contacts by phone or email |

### Users

| Command | Description |
|---------|-------------|
| `aircall users list` | List users |
| `aircall users get <id>` | Get details for a specific user |

### Numbers

| Command | Description |
|---------|-------------|
| `aircall numbers list` | List phone numbers |
| `aircall numbers get <id>` | Get details for a specific number |

### Tags

| Command | Description |
|---------|-------------|
| `aircall tags list` | List tags |
| `aircall tags get <id>` | Get details for a specific tag |
| `aircall tags create` | Create a new tag |

### Teams

| Command | Description |
|---------|-------------|
| `aircall teams list` | List teams |
| `aircall teams get <id>` | Get details for a specific team |

### Webhooks

| Command | Description |
|---------|-------------|
| `aircall webhooks list` | List webhooks |
| `aircall webhooks get <id>` | Get details for a specific webhook |
| `aircall webhooks create` | Create a new webhook |
| `aircall webhooks delete <id>` | Delete a webhook |

### Utility

| Command | Description |
|---------|-------------|
| `aircall ping` | Test your API connection |

## Pagination

All list commands support pagination:

```bash
# Specific page
aircall calls list --page 2 --per-page 50

# Auto-paginate through all results
aircall calls list --all
```

The `--all` flag automatically fetches every page. The Aircall API caps results at 10,000 items for calls and contacts.

## Output Formats

Every command supports `--format table` (default) or `--format json`:

```bash
# Human-readable table (default)
aircall users list

# Machine-readable JSON (great for piping to jq)
aircall users list --format json
aircall users list --format json | jq '.[].email'
```

## Rate Limiting

The CLI automatically handles Aircall API rate limits:

- Tracks `X-AircallAPI-Remaining` and `X-AircallAPI-Reset` headers
- Proactively pauses when approaching the limit
- Automatically retries on 429 responses with appropriate backoff
- Displays a message to stderr when waiting

## Configuration

Credentials are stored locally with restricted permissions (owner-only read/write). For CI/scripting, use environment variables instead of the interactive prompt:

```bash
AIRCALL_API_ID=xxx AIRCALL_API_TOKEN=yyy aircall auth login
```

To clear stored credentials:

```bash
aircall auth logout
```

## Development

```bash
git clone https://github.com/bryanryu1/aircall-cli.git
cd aircall-cli
npm install
npm run build

# Run in development mode (uses ts-node, no build needed)
./bin/dev.js --help

# Run production build
./bin/run.js --help
```

## License

MIT
