*"Test first. Code small. Ship fast. Explain why."*

## Appendix: Complete Example Session

```
Human: "I need to receive SMS messages via webhook"

Agent: Let me start with a test for parsing the webhook data.

test("parses Twilio webhook body") → red
```javascript
const { parseWebhook } = require('./sms');
test('parses Twilio webhook body', () => {
  const body = 'From=%2B1234567890&Body=Hello&MessageSid=123';
  const result = parseWebhook(body);
  expect(result.from).toBe('+1234567890');
  expect(result.body).toBe('Hello');
});
```

Now implementing with hickey::pure (keeping parsing separate from side effects):

```javascript
const parseWebhook = (body) => {
  const params = new URLSearchParams(body);
  return {
    from: params.get('From'),
    body: params.get('Body'),
    messageSid: params.get('MessageSid')
  };
};
```
→ green ✓

Shipped: `git commit -m "feat: parse Twilio webhook data"`# TDD + Vibes: How We Build

## The Core Loop

```
test → red → code → green → ship → next
```

Every change follows this. No exceptions.

## The Vibes

Think of these as embodying the deeper insights and philosophies behind each figure's contributions to computing:

```
hickey    = simple data, pure functions      # "let's simplify this"
carmack   = measure, direct, ship            # "just do the thing"
armstrong = isolate, let it crash            # "contain the blast radius"
kay       = messages, late-bind              # "keep it flexible"
knuth     = readable, literate               # "make it readable"
liskov    = contracts, don't break           # "protect the callers"
```

## Problem → Vibe → Solution

```
"tangled state"     → test → hickey::pure → ship
"too slow"          → test → carmack::measure → ship
"keeps crashing"    → test → armstrong::isolate → ship
"too rigid"         → test → kay::messages → ship
"confusing code"    → test → knuth::literate → ship
"breaks on change"  → test → liskov::contract → ship
```

## The TDD Rules

```
ALWAYS:
1. Write test first (red)
2. Make it pass (green)
3. Ship atomic change
4. Explain the vibe

NEVER:
- Write code without test
- Write big chunks
- Skip the red phase
- Forget to ship
```

## Real Session Example

```
you: "receive SMS webhooks"

me: test("parses Twilio webhook") → red
me: const parse = (body) => Object.fromEntries(new URLSearchParams(body)) → green
me: "used hickey::pure because webhook parsing should be side-effect free"
me: git add . && git commit -m "feat: parse Twilio webhooks"

you: "need to store them"

me: test("stores message in array") → red  
me: messages.push(parseWebhook(body)) → green
me: "hickey::simple data structure for now"
me: git add . && git commit -m "feat: store parsed messages"

you: "what about errors?"

me: test("handles malformed webhook") → red
me: try { parse(body) } catch { return null } → green
me: "armstrong::isolate to contain parsing failures"
me: git add . && git commit -m "feat: handle webhook parse errors"
```

## Common Patterns

### New Feature (Kay Start)
```
test("basic happy path") → red
kay::flexible_interface → green      # start loose
test("add validation") → red
hickey::pure_validate → green        # add constraints
test("handle errors") → red
armstrong::isolate → green           # contain failures
```

### Performance Issue (Carmack Flow)
```
test("measures current time") → red
carmack::add_timing → green          # measure first
test("optimized version faster") → red
carmack::direct_solution → green     # simplest fix
test("still correct") → red
verify_behavior → green              # don't break things
```

### Refactor Mess (Hickey Clean)
```
test("current behavior") → green     # lock behavior
hickey::extract_pure → refactor      # pull out pure parts
test("still works") → green          # verify nothing broke
hickey::simplify → refactor          # make it simple
test("cleaner now") → green          # ship it
```

## Session Vibes

```
feels_like:
  - pairing on small, clear changes
  - constant forward momentum
  - learning through examples
  - shipping every few minutes

not_like:
  - big design discussions
  - 500-line PRs
  - "let me refactor everything"
  - coding without tests
```

## The Pairing Contract

```
you:
  - share the problem
  - ask "what if..."
  - point out issues
  - request features

me:
  - write test first
  - apply minimal fix
  - explain the vibe
  - ship immediately
```

## Parallel Development with Git Worktrees

When working on multiple features or experiments simultaneously:

```bash
# Create worktree for new feature
git worktree add ../tala-feature feature-branch

# Create worktree for bug fix
git worktree add ../tala-fix bugfix-branch

# List active worktrees
git worktree list

# Remove when done
git worktree remove ../tala-feature
```

### When to Use Worktrees

```
USE when:
  - Testing different approaches in parallel
  - Keeping main branch clean while experimenting
  - Working on unrelated features simultaneously
  - Need to compare implementations side-by-side

AVOID when:
  - Simple linear development
  - Quick single-file fixes
  - Changes that build on each other
```

### Example Workflow

```bash
# Main session working on feature A
test("new API endpoint") → red
implement → green → ship

# Parallel session in worktree for feature B
cd ../tala-feature-b
test("different feature") → red
implement → green → ship

# Compare or merge approaches later
```

## Quick Reference Card

```
State mess?        → hickey (pure functions)
Performance issue? → carmack (measure, then fix)
Crashes?          → armstrong (isolate failures)
Too rigid?        → kay (late-bind, messages)
Confusing?        → knuth (make it literate)
Breaking changes? → liskov (honor contracts)
```

## Developer Log Format

Track your journey with micro-blog entries:

```markdown
## 2025-01-07

Webhooks weren't hitting the server. Added logging (carmack::measure)
and discovered Twilio was using a Messaging Service that overrides 
the webhook URL. 

```js
// test first
test("logs webhook data") → red
// then implement
console.log('Webhook:', req.body) → green
```

Lesson: when external service involved, check ALL the configs.

---

SMS send was failing with A2P errors. 

```js
test("sends to verified number") → red
// armstrong::isolate the platform quirks
const sendSMS = async (to) => {
  if (process.env.NODE_ENV === 'dev') {
    to = process.env.TEST_NUMBER; // force test number
  }
  return twilio.messages.create({to, ...});
}
→ green
```

Platform fights you sometimes - work around it.
```

## The Meta Pattern

```
while (building):
  problem = you.describe()
  test = me.write_test() → red
  solution = me.apply(minimal + right_vibe) → green
  me.explain("used X because Y")
  me.ship()
  continue
```

## Concrete Implementation Patterns

### Hickey::Pure
```javascript
// ❌ Not hickey
function processOrder(order) {
  order.total = order.items.reduce((sum, i) => sum + i.price, 0);
  order.processed = true;
  db.save(order);  // side effect mixed in
  return order;
}

// ✅ Hickey style
const calculateTotal = (items) => items.reduce((sum, i) => sum + i.price, 0);
const markProcessed = (order) => ({...order, processed: true});
const processOrder = (order) => markProcessed({...order, total: calculateTotal(order.items)});
// side effects separate
```

### Carmack::Direct
```javascript
// ❌ Not carmack
class APIWrapper {
  constructor() { this.client = new HTTPClient(); }
  async sendMessage(msg) {
    return await this.client.post('/messages', this.transform(msg));
  }
}

// ✅ Carmack style
const sendMessage = (msg) => fetch('/messages', {
  method: 'POST',
  body: JSON.stringify(msg)
}).then(r => r.json());
```

### Armstrong::Isolate
```javascript
// ❌ Not armstrong
async function handleRequest(req) {
  const data = JSON.parse(req.body);  // might crash
  const result = await process(data);  // might fail
  return result;
}

// ✅ Armstrong style
async function handleRequest(req) {
  try {
    const data = JSON.parse(req.body);
    return await process(data);
  } catch (error) {
    console.error('Request failed:', error);
    return { error: 'Invalid request' };
  }
}
```

## Anti-Patterns to Avoid

```
❌ Writing implementation before test
❌ Making multiple changes at once
❌ Explaining after shipping
❌ Skipping commits
❌ Over-engineering
❌ Under-testing
```

## Agent-Specific Guidance

### Command Line Only Environment
```
REMEMBER: You operate in a CLI-only environment
✅ Can do:
- Run tests: npm test
- Check files: cat, ls, grep
- Edit files: write/update via tools
- Git operations: add, commit, push
- Run scripts that output to terminal

❌ Cannot do:
- Start servers expecting browser interaction
- Use npm start/npm run dev for web apps
- Click, scroll, or interact with UI
- Open browser dev tools
- Access localhost:3000 or any URL

// Instead of:
npm start  // ❌ starts server you can't interact with

// Do:
npm test   // ✅ see test results in terminal
node script.js  // ✅ run scripts with console output
curl http://api.example.com  // ✅ test APIs from CLI
```

### When to Emphasize Different Vibes
```
// Not "which vibe?" but "which needs emphasis now?"
if (code_is_messy):
  emphasize hickey while maintaining all principles
  
if (performance_issue):
  emphasize carmack while keeping simplicity
  
if (brittle_code):
  emphasize armstrong while staying readable
```

### All Vibes, All The Time
```
Every piece of code should strive to be:
- Simple and pure (hickey)
- Direct and shippable (carmack)  
- Fault-tolerant (armstrong)
- Flexible (kay)
- Readable (knuth)
- Contract-respecting (liskov)

The question isn't "which one?" but "which needs more attention here?"
```

### Vibe Blending
```
// Vibes work together, not in isolation:
const handleWebhook = async (req) => {
  // armstrong: isolate failures
  try {
    // hickey: pure parsing function
    const message = parseWebhook(req.body);
    
    // carmack: direct and measured
    console.log('Received:', message);
    
    // kay: flexible message passing
    await messageQueue.send(message);
    
    // liskov: honor the contract
    return { status: 'ok', id: message.id };
  } catch (e) {
    // armstrong: let it crash gracefully
    return { status: 'error', message: 'Invalid webhook' };
  }
};

// All vibes present:
// ✓ hickey: pure data transformation
// ✓ carmack: direct implementation, logging
// ✓ armstrong: error isolation
// ✓ kay: decoupled via messages
// ✓ knuth: readable, clear intent
// ✓ liskov: consistent return contract
```

### The Mindset
```
While coding any solution:
- Is this as simple as possible? (hickey)
- Am I measuring/shipping directly? (carmack)
- Are failures contained? (armstrong)
- Is this flexible for future needs? (kay)
- Will someone understand this? (knuth)
- Am I breaking existing contracts? (liskov)

These aren't alternatives - they're simultaneous considerations.
```

### Test Granularity Guide
```
// Feature test (coarse)
test("user can send SMS") → maps to multiple unit tests

// Unit tests (fine) 
test("parses webhook body") → single function
test("formats phone number") → single transform
test("handles missing fields") → single edge case

// Rule: Start coarse, add fine as needed
```

## Growth Over Time

```
Day 1:   test → hickey::parse → ship
Day 2:   test → carmack::validate → ship
Day 3:   test → armstrong::handle_errors → ship
Day 10:  test → kay::make_extensible → ship
Day 30:  test → liskov::add_contracts → ship
Day 90:  test → knuth::document_why → ship
```

Start simple. Add vibes as needed. Always test first.

---

*"Test first. Code small. Ship fast. Explain why."*