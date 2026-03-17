# Citadel Snake - Nostr Event Schema

## Kind 30762: Gamestr Game Score Event

An addressable event (per the [Gamestr](https://gamestr.io/developers) specification) used to record game scores for the Citadel Snake arcade game. Scores are published to Nostr and displayed on a weekly leaderboard.

### Event Structure

```json
{
  "kind": 30762,
  "content": "",
  "tags": [
    ["d", "citadel-snake:<player-pubkey>:<session-uuid>"],
    ["game", "citadel-snake"],
    ["score", "<score-number>"],
    ["lightning", "<lightning-address>"],
    ["alt", "Citadel Snake game score"]
  ]
}
```

### Tag Definitions

- `d`: Unique addressable event identifier in the format `game-id:player-pubkey:session-uuid`. As an addressable event, only the latest event per `pubkey+kind+d` combination is stored by relays.
- `game`: The Gamestr game identifier (`citadel-snake`). Used for relay-level filtering across the Gamestr ecosystem.
- `score`: The numeric score achieved in the game session.
- `lightning`: The player's lightning address for leaderboard display and prize distribution.
- `alt`: Human-readable description per NIP-31.

### Query Patterns

```typescript
// Query all Citadel Snake scores
{ kinds: [30762], '#game': ['citadel-snake'], limit: 400 }

// Query scores from a specific time period (weekly leaderboard)
{ kinds: [30762], '#game': ['citadel-snake'], since: <week-start-timestamp>, until: <week-end-timestamp>, limit: 400 }
```

### Notes

- Kind 30762 is an addressable event (30000-39999 range), meaning only the latest event per `pubkey+kind+d-tag` is stored by relays.
- Since each game session uses an ephemeral keypair and a unique session UUID in the `d` tag, each score event is effectively unique and will not overwrite previous scores.
- The leaderboard is computed client-side by filtering scores within the current week (Monday 00:00 UTC to next Monday 00:00 UTC).
- Weekly winners are determined by the highest score per lightning address within the week boundary.
- Players do not need a Nostr account to play; scores are published by the app's ephemeral keypair generated during the payment flow.
- The `game` tag enables interoperability with the Gamestr ecosystem, allowing Citadel Snake scores to appear on Gamestr leaderboards.
