# Citadel Snake - Custom Nostr Event Schema

## Kind 1151: Game Score Event

A regular event used to record game scores for the Citadel Snake arcade game.

### Event Structure

```json
{
  "kind": 1151,
  "content": "",
  "tags": [
    ["d", "<game-session-id>"],
    ["score", "<score-number>"],
    ["lightning", "<lightning-address>"],
    ["t", "citadel-snake"],
    ["alt", "Citadel Snake game score"]
  ]
}
```

### Tag Definitions

- `d`: Unique game session identifier (UUID) to prevent duplicate score submissions
- `score`: The numeric score achieved in the game session
- `lightning`: The player's lightning address for leaderboard display and prize distribution
- `t`: Topic tag for filtering game scores (`citadel-snake`). Uses the single-letter `t` tag for relay-level indexing and efficient querying
- `alt`: Human-readable description per NIP-31

### Query Patterns

```typescript
// Query all Citadel Snake scores
{ kinds: [1151], '#t': ['citadel-snake'], limit: 100 }

// Query scores from a specific time period (weekly leaderboard)
{ kinds: [1151], '#t': ['citadel-snake'], since: <week-start-timestamp>, until: <week-end-timestamp>, limit: 400 }
```

### Notes

- Scores are published as regular events (kind 1000–9999), stored permanently by relays
- The `t` tag is a single-letter tag, which means relays index it and support `#t` filter queries. Multi-letter tags (e.g. `game`) are not indexed by relays and cannot be used in filter queries
- The leaderboard is computed client-side by filtering scores within the current week (Monday 00:00 UTC to next Monday 00:00 UTC)
- Weekly winners are determined by the highest score per lightning address within the week boundary
- Players do not need a Nostr account to play; scores are published by the app's ephemeral keypair generated during the payment flow
