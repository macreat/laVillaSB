# public-catalog-read-proxy Specification

## Purpose

Define gateway behavior that allows public read-only access to selected catalog routes while preserving explicit route-level control.

## Requirements

### Requirement: Gateway SHALL allow unauthenticated reads for approved catalog routes

The system SHALL permit unauthenticated access for the explicitly allowlisted catalog read routes used by storefront clients.
The system SHALL keep write or administrative catalog routes outside this public allowlist.

#### Scenario: Public product list read is proxied

- GIVEN a client sends an unauthenticated request to an allowlisted catalog read route
- WHEN the gateway evaluates route policy
- THEN the request is proxied to catalog and the response is returned without auth challenge

#### Scenario: Non-allowlisted route remains protected

- GIVEN a client sends an unauthenticated request to a non-allowlisted catalog route
- WHEN the gateway evaluates route policy
- THEN the request is denied or challenged according to protected-route policy

### Requirement: Public proxy scope SHALL remain explicit and testable

The system SHALL maintain a deterministic allowlist for public catalog reads to prevent accidental expansion of unauthenticated surface area.
The system SHOULD provide contract verification that only intended read paths are public.

#### Scenario: Allowlist changes require explicit update

- GIVEN a new catalog route is introduced
- WHEN no allowlist entry is added for that route
- THEN unauthenticated gateway access to that route is not granted by default
