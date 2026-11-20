/**
 * DatumOS — Role & Portal Access Policy unit tests (node --test, no framework).
 * Run: node --test src/lib/roles.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ROLES, ROLE_LIST, PORTAL_ACCESS, HOME_MAP, canAccessPath } from "./roles.mjs";

test("ROLES contains all four canonical roles", () => {
  assert.deepEqual(Object.keys(ROLES).sort(), ["CLIENT", "DIRECTOR", "MEMBER", "REVIT"]);
  assert.ok(ROLE_LIST.includes("REVIT"));
  assert.equal(ROLE_LIST.length, 4);
});

test("PORTAL_ACCESS includes REVIT portal and shared communication", () => {
  assert.deepEqual(PORTAL_ACCESS.REVIT, ["/revit", "/console", "/live"]);
});

test("DIRECTOR can access all four portals + console", () => {
  for (const p of ["/director", "/workspace", "/client", "/revit", "/console"]) {
    assert.equal(canAccessPath("DIRECTOR", p), true, `DIRECTOR should access ${p}`);
  }
});

test("MEMBER restricted to workspace + console (no director/client/revit)", () => {
  assert.equal(canAccessPath("MEMBER", "/workspace"), true);
  assert.equal(canAccessPath("MEMBER", "/console"), true);
  assert.equal(canAccessPath("MEMBER", "/director"), false);
  assert.equal(canAccessPath("MEMBER", "/client"), false);
  assert.equal(canAccessPath("MEMBER", "/revit"), false);
});

test("CLIENT restricted to client + console (no director/workspace/revit)", () => {
  assert.equal(canAccessPath("CLIENT", "/client"), true);
  assert.equal(canAccessPath("CLIENT", "/console"), true);
  assert.equal(canAccessPath("CLIENT", "/director"), false);
  assert.equal(canAccessPath("CLIENT", "/workspace"), false);
  assert.equal(canAccessPath("CLIENT", "/revit"), false);
});

test("REVIT restricted to revit + console (no director/workspace/client)", () => {
  assert.equal(canAccessPath("REVIT", "/revit"), true);
  assert.equal(canAccessPath("REVIT", "/console"), true);
  assert.equal(canAccessPath("REVIT", "/director"), false);
  assert.equal(canAccessPath("REVIT", "/workspace"), false);
  assert.equal(canAccessPath("REVIT", "/client"), false);
});

test("no role / unknown role denied everywhere", () => {
  assert.equal(canAccessPath(null, "/director"), false);
  assert.equal(canAccessPath(undefined, "/console"), false);
  assert.equal(canAccessPath("", "/client"), false);
  assert.equal(canAccessPath("SUPERUSER", "/console"), false);
});

test("prefix semantics: nested paths inherit parent portal access", () => {
  assert.equal(canAccessPath("DIRECTOR", "/director/enterprise"), true);
  assert.equal(canAccessPath("REVIT", "/revit/projects"), true);
  assert.equal(canAccessPath("CLIENT", "/client/contracts"), true);
  assert.equal(canAccessPath("MEMBER", "/workspace/projects/1"), true);
});

test("HOME_MAP assigns each role a landing portal", () => {
  assert.equal(HOME_MAP.DIRECTOR, "/director");
  assert.equal(HOME_MAP.MEMBER, "/workspace");
  assert.equal(HOME_MAP.CLIENT, "/client");
  assert.equal(HOME_MAP.REVIT, "/revit");
});

test("portal access respects path segment boundaries", () => {
  for (const path of ["/workspace-other", "/operations-admin", "/consoleevil", "/lively"]) {
    assert.equal(canAccessPath("MEMBER", path), false);
  }
  assert.equal(canAccessPath("MEMBER", null), false);
  assert.equal(canAccessPath("MEMBER", "/operations/projects"), true);
  for (const role of ROLE_LIST) assert.equal(canAccessPath(role, "/live/meetings"), true);
  assert.equal(canAccessPath("CLIENT", "/operations"), false);
});
