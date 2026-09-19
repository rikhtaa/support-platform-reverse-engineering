# Support Platform — Reverse Engineering

A learning-focused reimplementation of a production-style B2B AI customer-support SaaS.

The purpose of this repository is to understand how the original support platform works by studying its architecture and behavior, then implementing simplified versions of the important mechanisms from scratch.

> **This is a learning and reverse-engineering project, not the original Support Platform.**

## What This Project Demonstrates

- Customer-facing chat widget
- Embeddable website integration
- Contact/customer sessions
- Persistent conversations
- AI Agent conversations and threads
- AI tools
- RAG / knowledge-base search
- Human support dashboard
- Conversation status management
- Human operator replies
- Response enhancement
- Organization-scoped data

## Learning Approach

```text
Study a small feature
       ↓
Understand why it exists
       ↓
Implement a simplified version
       ↓
Run and test it
       ↓
Encounter a problem
       ↓
Return to the original SaaS
       ↓
Understand how the original solves it
       ↓
Improve the implementation
```

The emphasis was approximately **20% understanding / 80% implementation and experimentation**.

## Architecture

```text
Customer Website
      ↓
Embed Script
      ↓
Widget iframe
      ↓
Contact Session
      ↓
Conversation
      ↓
Agent Thread
      ↓
AI Agent
      ↓
Tools / RAG
      ↓
AI Response
      ↓
Support Dashboard
      ↓
Human Operator
```

## Repository Structure

```text
.
├── apps/
│   ├── embed/                 # Embeddable JavaScript bundle
│   ├── web/                   # Support dashboard
│   └── widget/                # Customer-facing widget
│
├── packages/
│   ├── backend/               # Convex backend
│   ├── ui/                    # Shared UI
│   └── ...
│
├── README.md
└── REVERSE_ENGINEERING.md
```

## Core Components

### Embed

`apps/embed` produces the browser JavaScript loaded by an external customer website. It reads the organization ID, creates the floating button and iframe, loads the widget, and handles basic iframe communication.

```text
apps/embed/embed.ts
        ↓ Vite
apps/embed/dist/widget-life.js
```

### Widget

The widget is the customer-facing application. It handles contact sessions, conversations, customer messages, AI responses, widget state, and related customer interactions.

### Backend

The Convex backend provides persistence, conversations, contact sessions, Agent threads, AI generation, tools, RAG, and dashboard operations.

### Dashboard

The web application provides the support-team interface for conversations, statuses, customer information, operator replies, pagination, and response enhancement.

## Conversation Model

A central discovery was that three identifiers represent different layers:

```text
Contact Session
      ↓
Conversation
      ↓
Agent Thread
```

- **`contactSessionId`** — identifies the website visitor/session.
- **`conversationId`** — identifies the application-level support conversation.
- **`threadId`** — identifies the AI Agent conversation/thread context.

They are related but are not interchangeable.

## AI Agent

The project uses the Convex Agent abstraction to connect:

```text
System instructions
       +
Thread context
       +
Tools
       +
Language model
       ↓
AI response
```

The investigation also distinguished raw Vercel AI SDK generation from `supportAgent.generateText()`, which operates in the Agent/thread context.

## Tools

The reconstructed system explored the major Agent tools:

```text
search
escalateConversation
resolveConversation
```

A tool consists conceptually of:

- description
- input schema
- execute function

The description tells the model what the tool does and when it is useful; the schema defines the arguments; execution performs the operation.

## RAG / Knowledge Base

```text
Knowledge
    ↓
Embedding
    ↓
Vector storage
    ↓
Semantic search
    ↓
Relevant context
    ↓
AI Agent
```

The implementation explored organization-specific RAG namespaces, knowledge ingestion, semantic search, retrieved context, and grounding the final answer.

## Contact Sessions

A contact session can contain:

- name
- email
- organization ID
- expiration
- browser metadata

The session provides the connection between an anonymous website visitor and the conversation.

## Conversation Lifecycle

```text
unresolved
    ↓
escalated
    ↓
resolved
```

The reconstructed implementation also reproduced the important behavior that unresolved conversations can receive automatic AI responses, while escalated/resolved conversations can stop automatic AI generation while still persisting customer messages.

## Support Dashboard

Implemented dashboard areas include:

- Conversation inbox
- Conversation details
- Conversation history
- Message pagination
- Conversation status
- Customer/contact information
- AI responses
- Human operator responses
- Response enhancement
- Organization checks

## Human Operator

The project distinguished three actors:

```text
Customer
AI Agent
Human Operator
```

The investigation showed that message role alone is not necessarily enough to distinguish AI-generated assistant messages from human operator messages; additional metadata can be used.

## Widget / Embed Integration

```text
demo.html
    ↓
widget-life.js
    ↓
iframe
    ↓
Widget Application
    ↓
Convex
```

`demo.html` represents an external customer website. The embed bundle places the actual widget application inside an iframe.

## Intentionally Simplified / Deferred

This project is not a production clone. The following were deliberately deferred or simplified:

- Full Clerk authentication and organization management
- Full RBAC
- Full Jotai/atom architecture
- Production deployment and hardening
- Complete billing enforcement
- Complete Vapi voice infrastructure
- Complete plugin ecosystem
- Sentry production setup

These were not prerequisites for understanding the core support workflow.

## What Was Reproduced

- Convex action → AI call
- Conversation persistence
- Persistent messages
- Customer and assistant messages
- Conversation history
- Agent threads
- System instructions
- Agent generation
- AI tools
- RAG
- Knowledge ingestion
- Contact sessions
- Dynamic organization handling
- Support dashboard
- Conversation statuses
- Message pagination
- Human operator replies
- Response enhancement
- Customer widget
- Embed script
- External website integration

## Project Boundary

This repository contains an independent learning implementation. It is not the original SaaS, an official clone, or a redistribution of proprietary source code.

Do not commit API keys, credentials, private configuration, or copied proprietary source code.

## Related Documentation

See [`REVERSE_ENGINEERING.md`](./REVERSE_ENGINEERING.md) for the detailed investigation, experiments, discoveries, architectural decisions, and deferred features.

## Author

Rekhta
