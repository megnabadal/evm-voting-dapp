## Events

### `ProposalCreated`

```solidity
event ProposalCreated(uint256 id, string title, address creator, uint256 deadline);
```

Emitted in `createProposal`. Allows off-chain indexers to track new proposals.

### `VoteCast`

```solidity
event VoteCast(uint256 indexed poolId, address indexed participant, bool accept);
```

Emitted in `vote`. The `indexed` keyword on `poolId` and `participant` allows efficient filtering when querying events.

| Parameter      | Type      | Indexed | Description |
|----------------|-----------|---------|-------------|
| `poolId`       | `uint256` | Yes     | The ID of the proposal being voted on |
| `participant`  | `address` | Yes     | The wallet that cast the vote |
| `accept`       | `bool`    | No      | `true` for yes, `false` for no |

**Note on backend integration:** Because Alchemy's free tier caps `eth_getLogs` to a 10-block range, the backend does NOT rely on querying these events directly. Instead, vote transactions are saved to the `vote_transactions` PostgreSQL table immediately after the frontend receives confirmation. See `docs/API.md`.