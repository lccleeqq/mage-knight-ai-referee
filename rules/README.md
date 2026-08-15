# Rules Engine v2

## Purpose
Turn the referee from keyword matching into structured rule validation.

## Data model
Each rule has:
- `id`: stable rule identifier
- `domain`: unit/card/combat/etc.
- `priority`: conflict resolution order
- `when`: normalized game-state/action predicates
- `verdict`: violation / insufficient_information / not_violation
- `reason`: player-facing explanation

## Required validation order
1. Normalize the player's natural-language action.
2. Resolve entities: card, unit, enemy, action, phase, resource.
3. Build the minimum required state.
4. Match structured rules by priority.
5. Return the strongest supported verdict.
6. If required state is missing, return `insufficient_information` rather than assuming legality.

## Non-goals
The engine must not tell the player what strategy to choose, which action is best, or whether another move would be stronger.

## Source discipline
Rule records should eventually include an authoritative source reference and exact rule-section identifier before being treated as authoritative game rules. Current v2 records are architectural seed data, not a complete Mage Knight rules database.
