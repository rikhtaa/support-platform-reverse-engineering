# Reverse Engineering Notes — Support Platform

## Purpose

This document records the process used to reverse-engineer a production-style B2B AI customer-support SaaS.

The objective was to understand the architecture and important implementation mechanisms of the original system by studying its code and behavior, then implementing simplified versions independently.

This is a learning document. It is not intended to reproduce or redistribute the original application's source code.

---

# 1. Method

The project used an implementation-first approach:

```text
Understand a small piece
        ↓
Implement it
        ↓
Test it
        ↓
Encounter a problem
        ↓
Return to the original SaaS
        ↓
Understand the original solution
        ↓
Implement the lesson
```

The emphasis was approximately:

```text
20% theory
80% implementation + experimentation
```

The goal was to understand the important architectural decisions by building working versions rather than attempting to understand the entire system before writing code.

---

# 2. Initial Architecture

The original platform was identified as a B2B AI customer-support SaaS centered on:

```text
Web Dashboard
Widget
Embed Script
Convex Backend
AI Agent
RAG
Authentication
Organization Management
```

The central flow became:

```text
Customer Website
      ↓
Embed
      ↓
Widget
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
Support Dashboard
```

---

# 3. Conversation Identity

A major discovery was that the platform uses multiple identifiers for different layers.

### `contactSessionId`

Identifies the website visitor/session. It is not the same thing as a user account.

### `conversationId`

Identifies the application-level support conversation.

### `threadId`

Identifies the AI Agent thread and its conversation context.

### Relationship

```text
contactSessionId
        ↓
conversationId
        ↓
threadId
```

These identifiers are related but serve different purposes.

---

# 4. Contact Sessions

The original contact-session model stores customer/session information including fields such as:

- name
- email
- organization ID
- expiration
- browser metadata

The widget creates or retrieves a session before creating a conversation.

The reconstructed implementation reproduced this flow.

## Expiration

A session expiration value represents a timestamp deadline.

Conceptually:

```ts
session.expiresAt < Date.now()
```

means that the expiration deadline has already passed.

---

# 5. Conversation Creation

The investigated conversation creation flow was approximately:

```text
Validate contact session
        ↓
Check organization
        ↓
Check expiration
        ↓
Create Agent thread
        ↓
Create application conversation
        ↓
Store contactSessionId
        ↓
Store threadId
        ↓
Return conversationId
```

This relationship was reproduced in the learning implementation.

---

# 6. Agent Threads

The Agent requires an appropriate user or thread context.

An early experiment showed that Agent generation without a suitable context fails because the Agent needs a `userId` or `threadId`.

The implementation was changed to create and persist a thread before generation.

The resulting pattern was:

```text
Conversation
   ↓
threadId
   ↓
supportAgent.generateText(...)
```

---

# 7. `Agent.generateText()`

The investigation distinguished raw Vercel AI SDK generation from the Convex Agent abstraction.

The important conceptual difference is:

```text
Raw AI SDK generation
    → model generation

Agent.generateText()
    → Agent/thread context + generation + configured tools
```

This distinction became important when conversation history and tool calling were introduced.

---

# 8. Tools

The original system exposes Agent tools such as:

```text
search
escalateConversation
resolveConversation
```

A tool has three important conceptual pieces:

```text
description
inputSchema
execute
```

The description explains the purpose of the tool to the model.

The schema defines the arguments the model can provide.

The execute function performs the operation.

---

# 9. Tool Calling Experiment

A simplified search tool was initially tested with raw AI SDK generation.

The model did not reliably call the tool. A required-tool experiment also showed that forcing a tool choice is not equivalent to guaranteeing successful tool execution.

The architecture was then aligned with the Agent abstraction.

The test successfully demonstrated a tool invocation such as:

```text
SEARCH TOOL CALLED: "refund policy"
```

This confirmed the Agent could invoke the tool.

---

# 10. RAG

RAG was then introduced.

The conceptual pipeline became:

```text
Knowledge
    ↓
Embedding
    ↓
RAG storage
    ↓
Semantic search
    ↓
Search result
    ↓
AI Agent
```

The reconstructed system used organization-specific namespaces.

---

# 11. RAG Namespace

The namespace is primarily an isolation boundary for knowledge.

For example:

```text
org_123
    └── its knowledge

org_234
    └── its knowledge
```

It is not primarily a performance optimization.

The reconstruction initially used a hardcoded namespace and later changed to a namespace derived from the conversation's organization.

---

# 12. Search Results

The RAG result was examined through concepts such as:

```text
entries
text
score
```

- `entries` — retrieved entries and metadata
- `text` — retrieved textual context
- `score` — relevance/similarity information

---

# 13. Search Interpreter

A particularly important discovery was that the original search tool does more than retrieve documents.

It performs a second model-generation step inside the search tool.

Conceptually:

```text
Customer question
       ↓
Agent decides to search
       ↓
RAG search
       ↓
Retrieved context
       ↓
Search-interpreter model
       ↓
Grounded search response
       ↓
Main Agent
```

The interpreter prompt constrains the response to the retrieved information.

This became important because the first simplified RAG implementation allowed the main Agent to add unsupported refund details. Adding the interpreter step grounded the result in the stored knowledge.

---

# 14. File Ingestion

The original platform contains file ingestion for knowledge management.

The investigated flow was approximately:

```text
File bytes
    ↓
Determine MIME type
    ↓
Convex storage
    ↓
Text extraction
    ↓
RAG.add()
    ↓
Embedding / indexing
```

Metadata can be stored alongside the RAG entry.

---

# 15. Metadata and Content Hashing

Metadata was distinguished from searchable text.

Metadata can contain information such as:

```text
storageId
filename
category
upload information
```

The original ingestion flow also uses a content hash as a fingerprint of file contents.

Conceptually:

```text
File bytes
    ↓
SHA-256
    ↓
Content hash
```

The same bytes produce the same hash; changed bytes produce a different hash. This supports duplicate/content-change detection.

---

# 16. Support Dashboard

The dashboard was reverse-engineered after the core AI flow.

The major workflow is:

```text
Conversation list
      ↓
Conversation selection
      ↓
Conversation details
      ↓
Agent thread messages
      ↓
Operator response
```

The reconstructed dashboard covered conversation lists, details, statuses, contact information, messages, pagination, operator replies, and response enhancement.

---

# 17. Message Pagination

The original dashboard retrieves Agent messages through pagination rather than loading an unlimited history at once.

The reconstruction initially encountered a pagination-validator error because an incorrect argument shape was passed. After correcting the pagination configuration, message pagination worked.

This clarified the difference between application-level conversation records and paginated Agent message retrieval.

---

# 18. Customer, AI, and Operator Messages

A conversation can contain:

```text
Customer
AI Agent
Human Operator
```

A key discovery was that message `role` alone is not necessarily enough to distinguish AI-generated assistant messages from human operator messages.

Additional metadata can identify the actor, such as:

```text
agentName
model
provider
```

The reconstructed dashboard used metadata to distinguish actors.

---

# 19. Human Operator Replies

The customer and operator flows are different.

Customer:

```text
Customer message
      ↓
Save message
      ↓
AI generation
      ↓
AI response
```

Operator:

```text
Operator message
      ↓
Save message
      ↓
No automatic AI generation
```

Both can participate in the same conversation/thread.

---

# 20. Conversation Status

The reconstructed implementation supports:

```text
unresolved
escalated
resolved
```

The status affects automatic AI behavior.

```text
unresolved
    ↓
customer message
    ↓
AI responds
```

while:

```text
escalated / resolved
    ↓
customer message
    ↓
message persists
    ↓
AI response skipped
```

This was an important business-rule discovery.

---

# 21. Response Enhancement

The dashboard contains an operator response-enhancement flow.

Conceptually:

```text
Operator draft
      ↓
Enhancement model
      ↓
Improved wording
      ↓
Operator uses result
```

The investigated prompt focused on professionalism, clarity, grammar, spelling, concision, and avoiding invented information.

The reconstructed implementation reproduced this behavior.

---

# 22. Dynamic Organization

The early reconstruction used a hardcoded organization ID such as:

```text
org_123
```

This was later replaced with organization information passed through the widget/embed flow.

The resulting flow became:

```text
Customer Website
      ↓
data-organization-id
      ↓
Embed Script
      ↓
iframe URL
      ↓
organizationId
      ↓
Widget
      ↓
Contact Session
      ↓
Conversation
```

A second organization ID was tested successfully after clearing local browser state, demonstrating that the implementation was not inherently tied to one organization.

---

# 23. Widget

The widget is the customer-facing application.

Important responsibilities investigated included:

- session initialization
- conversation initialization
- message submission
- displaying Agent messages
- file interaction
- client-side state

The reconstruction used simpler state mechanisms where they were sufficient to understand the behavior.

---

# 24. Embed Script

The original embed script was studied as a separate layer from the widget.

Its responsibilities include:

```text
Find script element
      ↓
Read organization ID
      ↓
Create floating button
      ↓
Create widget container
      ↓
Create iframe
      ↓
Load widget URL
      ↓
Pass organization ID
      ↓
Listen for iframe messages
```

The embed script is therefore the bridge between an external website and the widget application.

---

# 25. Why an iframe?

The investigation clarified that:

```text
Embed Script
```

and:

```text
Widget Application
```

are separate layers.

The iframe isolates the widget application from the host website while allowing the embed script to control the widget container and communicate with it.

---

# 26. `demo.html`

A local `demo.html` was used to simulate a third-party customer website.

Its role is simply:

```text
External Website Simulation
        ↓
Load widget-life.js
        ↓
Widget appears
```

It is not the widget application itself.

---

# 27. Vite Embed Build

The embed source:

```text
apps/embed/embed.ts
```

was configured as a Vite library build.

The output is:

```text
apps/embed/dist/widget-life.js
```

The relationship is:

```text
embed.ts
   ↓
Vite
   ↓
widget-life.js
```

The generated bundle is what an external website would load.

---

# 28. Widget Page vs Embed Script

The reconstruction used a Next.js widget route for the page loaded inside the iframe.

Conceptually:

```text
widget-life.js
      ↓
iframe
      ↓
/embed?organizationId=org_123
      ↓
Next.js widget page
      ↓
WidgetChatScreen
```

This is different from the embed script itself.

The embed script places the widget on the host website; the widget page contains the actual customer-facing application.

---

# 29. Production Features Deliberately Deferred

## Clerk

The original system uses Clerk for authentication and organization management.

The reconstruction did not implement full Clerk integration. A temporary organization model was used so the core support workflow could be understood without first building the complete identity/RBAC layer.

## Jotai

The original widget uses Jotai and atom families extensively.

The reconstruction did not reproduce every atom. Simpler state mechanisms were used where sufficient.

## Other deferred production systems

The following were also intentionally not completed because they were not prerequisites for understanding the core workflow:

- Production deployment
- Production hardening
- Complete billing enforcement
- Complete Vapi infrastructure
- Complete plugin ecosystem
- Sentry production setup
- Full production RBAC

---

# 30. Completion Status

The core reverse-engineering implementation successfully covered:

```text
Convex action → AI call                  ✅
Conversation document                    ✅
Persistent messages                      ✅
Customer + assistant messages            ✅
Conversation history                      ✅
Agent thread                              ✅
System instructions                       ✅
Agent.generateText                        ✅
AI tools                                  ✅
RAG                                       ✅
Knowledge ingestion                       ✅
Contact sessions                           ✅
Dynamic organization                       ✅
Support dashboard                          ✅
Conversation statuses                      ✅
Message pagination                         ✅
Human operator replies                     ✅
Response enhancement                       ✅
Widget                                     ✅
Embed script                               ✅
External website simulation                ✅
```

---

# 31. Key Architectural Lessons

## Application record vs AI thread

```text
conversationId ≠ threadId
```

The application needs its own conversation record, while the Agent needs its own thread/context identifier.

## Agent vs raw model

```text
Model generation
```

is not equivalent to:

```text
Agent generation
```

The Agent abstraction connects generation with thread/context and tools.

## Tools are model-facing capabilities

A tool is not merely a backend function. Its description and schema help the model understand when and how it can be used.

## RAG is more than retrieval

The investigation showed that a useful grounded flow is:

```text
Question
   ↓
Search
   ↓
Retrieved knowledge
   ↓
Context interpretation
   ↓
Agent answer
```

Retrieving documents alone does not guarantee that the final model response will stay grounded.

## Same thread, different actors

Customer, AI, and operator messages can participate in the same conversation context.

---

# 32. Final Mental Model

```text
                         SUPPORT PLATFORM
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
       CUSTOMER SIDE                         SUPPORT SIDE
             │                                     │
      Customer Website                         Web Dashboard
             │                                     │
        Embed Script                         Authenticated User
             │                                     │
           iframe                          Conversations
             │                                     │
           Widget                         Operator Reply
             │                                     │
             └──────────────────┬──────────────────┘
                                │
                             Convex
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
        Contact Sessions   Conversations       Agent
                                                  │
                                           ┌──────┼──────┐
                                           │      │      │
                                         Model  Tools   RAG
                                                  │      │
                                                  └──┬───┘
                                                     │
                                               Knowledge Base
```

The core relationship is:

```text
Customer
   ↓
Contact Session
   ↓
Conversation
   ↓
Agent Thread
   ↓
AI Agent
   ├── Model
   ├── Tools
   └── RAG
   ↓
Response
   ↓
Same Conversation
   ↓
Support Dashboard
   ↓
Human Operator
```

---

# 33. Project Boundary

This repository is intentionally a learning implementation.

It should not be represented as:

- the original SaaS
- an official clone
- a production replacement
- a redistribution of proprietary source code

Its value is the engineering investigation:

```text
Observe
→ understand
→ implement
→ test
→ compare
→ document
```

---

# 34. Next Reverse-Engineering Project

The next planned reverse-engineering exercise is an **EShop multi-vendor e-commerce SaaS** using a microservice architecture.

The planned investigation will cover:

- Nx monorepo
- API Gateway
- Authentication service
- Product service
- Seller service
- Order service
- Kafka
- Redis
- WebSockets
- Recommendation service
- Stripe
- ImageKit
- Next.js applications

The same implementation-first methodology will be used.
