# Delta for public-catalog-read-proxy

## MODIFIED Requirements

### Requirement: Gateway SHALL allow unauthenticated reads for approved catalog routes

The system SHALL permit unauthenticated access for explicitly allowlisted, read-only catalog list and product-detail routes used by storefront clients. Write and administrative catalog routes MUST remain outside this public allowlist.

(Previously: The public allowlist covered approved catalog read routes without explicitly requiring product-detail coverage.)

#### Scenario: Public product detail read is proxied

- GIVEN a client sends an unauthenticated request to an existing product-detail route
- WHEN the gateway evaluates route policy
- THEN the request is proxied to catalog and returned without an auth challenge

#### Scenario: Non-allowlisted route remains protected

- GIVEN a client sends an unauthenticated request to a non-allowlisted catalog route
- WHEN the gateway evaluates route policy
- THEN the request is denied or challenged according to protected-route policy
