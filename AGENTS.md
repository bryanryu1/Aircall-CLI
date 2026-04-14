# Aircall CLI — Agent Reference

> This file describes the aircall-cli for AI agents and LLMs. It explains what each command does, what it returns, and how to chain commands together to answer complex questions.

## Overview

`aircall-cli` is a CLI for the Aircall Public API. Aircall is a cloud-based phone system (VoIP). The CLI manages calls, contacts, users, phone numbers, tags, teams, webhooks, and provides access to AI-powered conversation intelligence features (summaries, transcriptions, sentiment analysis, etc.).

**All commands require authentication first via `aircall auth login`.**

## Authentication

| Command | Use when |
|---|---|
| `aircall auth login` | First-time setup. Prompts for API ID and API Token interactively. Credentials are from the Aircall Dashboard > Integrations > API Keys. |
| `AIRCALL_API_ID=xxx AIRCALL_API_TOKEN=yyy aircall auth login` | Non-interactive login via env vars (scripting/CI). |
| `aircall auth status` | Check if currently authenticated and which account. |
| `aircall auth logout` | Clear stored credentials. |

## Output Formats

All commands support `--format table` (default, human-readable) and `--format json` (machine-readable, for piping).

For AI agents: **always use `--format json`** to get structured data you can parse.

## Pagination

List commands return paginated results (default 20 per page, max 50).

| Flag | Effect |
|---|---|
| `--page N` | Fetch page N |
| `--per-page N` | Set page size (max 50) |
| `--all` | Auto-paginate through all results (follows `next_page_link` until done) |

**Note:** Calls and Contacts are capped at 10,000 items even with `--all`.

---

## Commands Reference

### Calls

Calls are the core resource. Each call has an `id`, `direction` (inbound/outbound), `status`, `duration`, `started_at` (UNIX timestamp), `raw_digits` (phone number), and optionally a linked `contact` and `user`.

| Command | Description | Returns |
|---|---|---|
| `aircall calls list` | List all calls, newest first | Array of call objects with id, direction, status, duration, started_at, raw_digits, user, contact |
| `aircall calls list --from TIMESTAMP --to TIMESTAMP` | Filter calls by date range (UNIX timestamps) | Same as above, filtered |
| `aircall calls get <call_id>` | Get full details of one call | Single call object with all fields including recording URL, voicemail, tags, comments, assigned user, contact |
| `aircall calls search --direction inbound\|outbound --from TS --to TS` | Search calls with filters | Array of call objects |

**Key relationships:**
- A call's `contact` field contains the contact `id` if one is linked
- A call's `user` field contains the Aircall user (agent) who handled it
- Use the `call_id` to fetch conversation intelligence data (summary, transcription, etc.)

### Conversation Intelligence

These commands retrieve AI-generated analysis for a specific call. **All require a `call_id` argument.**

| Command | Description | Returns | When to use |
|---|---|---|---|
| `aircall calls summary <call_id>` | AI-generated summary of the call | Object with `status` and summary text | User asks "what was this call about?" |
| `aircall calls topics <call_id>` | Topics discussed during the call | Object with `status` and topic list | User asks "what topics were covered?" |
| `aircall calls sentiments <call_id>` | Sentiment analysis of the call | Object with `status` and sentiment data | User asks "how did the call go?" or "was the customer happy?" |
| `aircall calls action-items <call_id>` | Action items extracted from the call | Object with `call_id` and `action_items` array (each has `content`) | User asks "what are the next steps?" or "what needs to be done?" |
| `aircall calls transcription <call_id>` | Full transcription of the call | Object with `status` and transcription content | User asks "what was said?" or needs the full conversation text |
| `aircall calls realtime-transcription <call_id>` | Realtime transcription data | Object with `call_id`, `call_uuid`, and `content` | User needs the live/streaming transcription data |
| `aircall calls custom-summary <call_id>` | Custom summary result (AI Assist Pro) | Object with `id`, `call_id`, `number_id`, `language`, and structured summary | User needs a customized summary format (requires AI Assist Pro license) |
| `aircall calls evaluations <call_id>` | Call evaluation/scoring data | Object with `id`, `call_id`, `ai_generated`, `evaluations` array | User asks "how did the agent perform?" or needs QA scoring |
| `aircall calls playbook <call_id>` | Playbook adherence result (AI Assist Pro) | Object with `id`, `call_id`, `user_id`, `number_id`, and playbook results | User asks "did the agent follow the script?" (requires AI Assist Pro license) |

### Contacts

Contacts are people (customers, leads) with phone numbers and emails.

| Command | Description | Returns |
|---|---|---|
| `aircall contacts list` | List all contacts | Array of contact objects with id, first_name, last_name, company_name, phone_numbers, emails |
| `aircall contacts list --order asc\|desc --order-by created_at\|updated_at` | List with sorting | Same, sorted |
| `aircall contacts get <id>` | Get full details of one contact | Single contact object with all fields |
| `aircall contacts search --phone PHONE` | Search by phone number | Array of matching contacts |
| `aircall contacts search --email EMAIL` | Search by email | Array of matching contacts |
| `aircall contacts create --first-name X --last-name Y --phone Z --email E --company-name C` | Create a contact | The created contact object |

**Note:** Contact search requires a phone number OR email. You cannot search by name.

### Users

Users are Aircall agents/employees in the company.

| Command | Description | Returns |
|---|---|---|
| `aircall users list` | List all users | Array of user objects with id, name, email, availability_status |
| `aircall users get <user_id>` | Get full details of one user | Single user object |

### Numbers

Phone numbers configured in Aircall.

| Command | Description | Returns |
|---|---|---|
| `aircall numbers list` | List all phone numbers | Array of number objects with id, name, digits, country, is_ivr |
| `aircall numbers get <id>` | Get details of one number | Single number object |

### Tags

Tags used to categorize calls.

| Command | Description | Returns |
|---|---|---|
| `aircall tags list` | List all tags | Array of tag objects with id, name, color |
| `aircall tags get <id>` | Get details of one tag | Single tag object |
| `aircall tags create --name NAME --color HEX` | Create a tag | The created tag object |

### Teams

Teams are groups of users/agents.

| Command | Description | Returns |
|---|---|---|
| `aircall teams list` | List all teams | Array of team objects with id, name, created_at |
| `aircall teams get <id>` | Get details of one team | Single team object with members |

### Webhooks

Webhooks for receiving event notifications.

| Command | Description | Returns |
|---|---|---|
| `aircall webhooks list` | List all webhooks | Array of webhook objects with webhook_id, url, active, events, created_at |
| `aircall webhooks get <id>` | Get details of one webhook | Single webhook object |
| `aircall webhooks create --url URL --events EVENTS` | Create a webhook. Events is comma-separated (e.g., `call.created,call.ended`) | The created webhook object |
| `aircall webhooks delete <id>` | Delete a webhook | Confirmation message |

---

## Common Workflows

### "What happened on this call?" (Get full call intelligence)
```bash
aircall calls summary <call_id> --format json
aircall calls topics <call_id> --format json
aircall calls sentiments <call_id> --format json
aircall calls action-items <call_id> --format json
```

### "Find calls with a specific person"
```bash
# Step 1: Find the contact by phone or email
aircall contacts search --phone "+15551234567" --format json
# Step 2: Get their call history by listing calls and filtering
aircall calls list --format json
# Note: Filter the results client-side by contact.id
```

### "Show me yesterday's missed calls"
```bash
# Calculate UNIX timestamps for yesterday (example: April 13, 2026)
# from=1744502400 to=1744588800
aircall calls search --from 1744502400 --to 1744588800 --format json
# Filter results where status is "missed" client-side
```

### "How is my team performing?"
```bash
# Get team members
aircall teams get <team_id> --format json
# Get recent calls
aircall calls list --all --format json
# For each call, get evaluations
aircall calls evaluations <call_id> --format json
```

### "Get the transcript and summary of a call"
```bash
aircall calls transcription <call_id> --format json
aircall calls summary <call_id> --format json
```

---

## Data Model Relationships

```
Company
├── Users (agents who handle calls)
├── Teams (groups of users)
├── Numbers (phone lines)
├── Tags (call categorization labels)
├── Contacts (customers/leads with phone numbers and emails)
├── Calls (each call links to a user, number, and optionally a contact)
│   ├── Summary (AI-generated)
│   ├── Topics (AI-generated)
│   ├── Sentiments (AI-generated)
│   ├── Action Items (AI-generated)
│   ├── Transcription
│   ├── Realtime Transcription
│   ├── Custom Summary (AI Assist Pro)
│   ├── Evaluations (QA scoring)
│   └── Playbook Result (AI Assist Pro)
└── Webhooks (event subscriptions)
```

## Limitations

- Contact search only works by phone number or email, not by name
- Calls and Contacts list endpoints cap at 10,000 items
- Rate limit: 60 requests per minute per company (CLI auto-handles this)
- `--from` and `--to` flags expect UNIX timestamps, not human-readable dates
- Custom Summary and Playbook commands require an AI Assist Pro license
- Conversation intelligence data (summary, topics, etc.) is only available for calls that have been processed — recent calls may return empty results
