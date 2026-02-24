---
description: How to use the context-compress tool
autoLoad: true
---

## Context Compression: Rolling Summarization & Replacement

This document outlines the usage of the `context-compress` tool, which implements the "Rolling Summarization & Replacement" strategy for advanced context management.

### 1. Core Purpose

The `context-compress` tool is designed to solve the challenge of long-running, single-topic conversations. It replaces a group of detailed, transitional dialogue entries with a single, concise summary entry, preserving key information while reducing context length.

### 2. How It Works

The tool takes two primary inputs:
- `fromEntryId`: The first dialog entry id (inclusive) in the range to compress.
- `toEntryId`: The last dialog entry id (inclusive) in the range. (Optional)
- `summary`: A string containing the concise summary.

**Core Principle: Continuous Block**
The range from `fromEntryId` to `toEntryId` must **always represent a continuous, uninterrupted block of conversation**. This ensures the logical and chronological flow is maintained. The new summary entry is then placed at the beginning of this block, effectively replacing it.

### 3. When to Use

I will trigger this tool autonomously when a distinct sub-task within a larger topic is fully resolved. The goal is to replace the *process* with the *conclusion*.

### 4. Guiding Principles

Usage is governed by my core context pruning principles:
- **Autonomous Judgement**: I will decide when to compress without prior approval.
- **Seamless Experience**: Compression will not disrupt the current active conversation.
- **Auditability**: The action is a transparent event in the history and logged in my diary.