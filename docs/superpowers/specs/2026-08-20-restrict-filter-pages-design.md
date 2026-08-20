---
type: decision
description: Approved design for limiting novel filtering and its controls to the former supported Pixiv URLs.
status: active
archived: false
work_status: completed
timestamp: 2026-08-20
tags:
  - userscript
  - routing
  - novel-filtering
---

# Restrict filtering to former supported pages

## Goal

Keep the userscript active across `https://www.pixiv.net/*` so targeted
promotional and advertising elements can still be removed site-wide, while
limiting novel filtering and its controls to the five former URL patterns
listed in README lines 28-32.

Pixiv uses client-side navigation, so filtering availability must update when
the URL changes without a full page load.

## Supported filtering URLs

A single predicate owns filtering-page recognition. It matches the pathname
forms represented by the former userscript URL patterns:

- `/search*`;
- `/tags/*`;
- `/<language-or-prefix>/tags/*`;
- `/users/<user>/bookmarks/novels*`;
- `/<language-or-prefix>/users/<user>/bookmarks/novels*`.

Query strings and fragments do not affect the decision. Similar paths that do
not have one of these forms are unsupported. The userscript metadata remains
site-wide; this predicate controls only novel filtering and its UI.

## Runtime behavior

One synchronization function compares the current pathname with the supported
filtering-page predicate and applies the corresponding state.

On a supported page, it mounts or reveals the eye and settings controls, then
collects novel cards and applies the current filtering state. If filtering was
enabled before leaving a supported page, it remains enabled and is reapplied
when a supported page is entered again.

On an unsupported page, it:

- closes the settings panel without moving focus into a hidden control;
- hides the controls and settings panel;
- removes the filtering class from every previously hidden work so no work
  remains hidden outside the supported URLs;
- clears the tracked card collection;
- prevents delayed mutation callbacks from applying filtering there.

The route state is synchronized immediately after `history.pushState`,
`history.replaceState`, and `popstate`. The existing two-second maintenance
interval also synchronizes it as a fallback for navigation mechanisms outside
those hooks. Repeated synchronization is idempotent.

The existing mutation observer may continue scheduling page processing, but
filter initialization and execution must check filtering availability before
collecting or hiding cards.

## Separation of responsibilities

Filtering-page recognition, filtering/UI availability, and target-element
removal remain separate concerns. `removeTargetElements()` continues to run on
all Pixiv pages during initial processing, mutation-driven processing, and the
maintenance interval. Its selectors and removal behavior do not change.

## Verification

Automated tests must first fail against the current source, then prove that:

- all five former URL families enable filtering and show the controls;
- representative near-miss and unrelated Pixiv URLs disable filtering and hide
  both the controls and settings panel;
- navigation from supported to unsupported restores hidden works immediately;
- navigation back to a supported page restores the controls and reapplies an
  already-enabled filter;
- `pushState`, `replaceState`, and `popstate` trigger synchronization without a
  page reload;
- delayed mutation processing cannot hide works on an unsupported page;
- site-wide target-element removal remains connected on unsupported pages;
- the existing filtering, settings, localization, responsive UI, and element
  removal tests still pass.

JavaScript syntax checking and the complete Node test suite are required after
implementation.

## Scope

This change does not alter filter configuration storage, filtering criteria,
translations, userscript metadata, or target-element removal selectors. It
does not add a user-facing setting for URL scope.
