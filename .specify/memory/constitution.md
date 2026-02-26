<!-- Sync Impact Report
  Version Change: (none) → 1.0.0 (initial ratification from blank template)
  Modified Principles: N/A — first fill
  Added Sections:
    - Core Principles: I–V (Component-First, Mobile-First, Gamification Integrity,
      Performance Budget, Simplicity & YAGNI)
    - Technology Stack Constraints (new)
    - Development Workflow (new)
    - Governance
  Removed Sections: N/A
  Templates Requiring Updates:
    - .specify/templates/plan-template.md  ✅ Constitution Check section already present
    - .specify/templates/spec-template.md  ✅ No constitution-specific changes required
    - .specify/templates/tasks-template.md ✅ Task phases align with principles
    - .specify/templates/agent-file-template.md ✅ Generic template; no outdated refs
  Follow-up TODOs: None — all placeholders resolved.
-->

# Happy Data Survey Constitution

## Core Principles

### I. Component-First Architecture

Every UI element MUST be built as a self-contained, independently renderable React component.
Components MUST declare explicit TypeScript prop interfaces; implicit or `any`-typed props are
forbidden without an explanatory comment. State MUST be lifted no further than the nearest
common ancestor that requires it. Shared logic MUST live in custom hooks (`src/hooks/`), not
duplicated inline across components.

**Rationale**: Enforces testability, reuse, and clear ownership of state without over-engineering
a global store for an MVP-scale application.

### II. Mobile-First, Touch-Primary Interaction

All interactions MUST be designed for touch and gesture first; mouse/keyboard support is
additive. Swipe gestures MUST remain the primary survey input mechanism. Haptic feedback
(via `navigator.vibrate`) MUST be triggered on user actions where the browser API is available.
Touch targets MUST be at minimum 44×44 CSS pixels.

**Rationale**: The survey experience targets mobile users. Designing touch-first prevents
degraded mobile experiences that result from retrofitted accessibility hacks.

### III. Gamification Integrity

Every answered survey question MUST produce at minimum one of: audio feedback, animation, or
haptic response. Streak counters MUST accurately reflect consecutive answers without artificial
inflation. Completion states MUST celebrate the user with a visible reward (animation + sound).
Gamification elements MUST NOT deceive users about their progress or the number of remaining
questions.

**Rationale**: Trust is the foundation of good survey data. Engagement mechanics that mislead
users corrupt both the experience and the collected data.

### IV. Performance Budget

Animations MUST target 60 fps on mid-range mobile devices. 3D rendering MUST use
`@react-three/fiber` within a bounded `<Canvas>` element and MUST NOT block the main React
render tree. Web Audio API calls MUST be wrapped in try/catch and MUST NOT surface unhandled
exceptions. New dependencies that duplicate an already-present library's functionality MUST NOT
be added (e.g., a second animation library when Framer Motion is already present).

**Rationale**: A slow or crashing survey destroys completion rates. Performance is a user-facing
feature, not a post-launch concern.

### V. Simplicity & YAGNI

Features MUST only be built when explicitly required. No backend, authentication layer, or
persistence infrastructure MUST be added to the frontend until a concrete product requirement
exists. Survey data flow MUST remain in component state until a persistence requirement is
formally specified. An abstraction MUST serve at least two real callsites before being
extracted into a shared utility.

**Rationale**: This is an MVP. Premature architecture increases maintenance burden and slows
iteration without delivering measurable user value.

## Technology Stack Constraints

- **Language**: TypeScript 5.x — strict mode MUST be enabled; `any` types require an
  explanatory inline comment.
- **Framework**: React 18 with functional components and hooks only; class components are
  forbidden.
- **Build Tool**: Vite 5.x — no alternative bundler (Webpack, CRA, Parcel) MUST be introduced.
- **3D Rendering**: `@react-three/fiber` + `@react-three/drei` + `three.js` — no alternative
  WebGL library MUST be added.
- **Animation**: Framer Motion for DOM animations; `useFrame` for 3D canvas animations. No
  additional animation library MUST be introduced.
- **Gesture Handling**: `@use-gesture/react` exclusively — no additional gesture library MUST
  be added.
- **Audio**: Native Web Audio API via `src/hooks/useGamifiedSound.ts` — no audio library
  dependency MUST be introduced unless the Web Audio approach proves insufficient for a
  specific, documented requirement.
- **Styling**: CSS custom properties defined in `src/index.css`; `tailwind-merge` and `clsx`
  are available for class composition. No CSS-in-JS runtime MUST be added.
- Any new dependency MUST be evaluated against Principles IV and V before merging.

## Development Workflow

- New UI features MUST begin with a component specification (TypeScript props interface +
  expected behavior description) before writing implementation code.
- Survey question data MUST remain in `src/App.tsx` (`SURVEY_QUESTIONS`) until a data-loading
  abstraction is explicitly required by a product specification.
- New custom hooks MUST be placed in `src/hooks/`; new components MUST be placed in
  `src/components/`.
- `tsc -b` MUST pass (zero TypeScript errors) before any commit is considered complete.
- `vite dev` MUST start without errors before a feature branch is considered ready for review.
- Commits MUST be atomic — one logical change per commit with a descriptive imperative message.
- Feature branches MUST follow the naming convention `###-feature-name` to align with the
  spec directory structure under `specs/`.

## Governance

This constitution supersedes all informal conventions and any conflicting guidance in ad-hoc
comments or prior commit messages. Amendments MUST be documented by updating this file and
incrementing the version according to semantic versioning:

- **MAJOR**: Removal or incompatible redefinition of an existing principle.
- **MINOR**: Addition of a new principle or section, or materially expanded guidance.
- **PATCH**: Clarifications, wording fixes, or non-semantic refinements.

All feature plans (`.specify/specs/*/plan.md`) MUST include a **Constitution Check** gate that
verifies compliance before Phase 0 research begins. Re-verification MUST occur after Phase 1
design. Any deviation from a principle MUST be recorded in the plan's **Complexity Tracking**
table with explicit justification for why a simpler, compliant alternative was rejected.

Compliance is reviewed at plan-creation time and at PR/merge time.

**Version**: 1.0.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
