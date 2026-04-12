---
name: stride-threat-model
description: Systematic STRIDE-based threat identification and analysis for software components. Guides capability-to-threat mapping using six standard categories.
---

# STRIDE Threat Modeling

Use this skill when asked to identify threats, perform threat analysis, or create a ThreatCatalog for a system or component.

## STRIDE Categories

Every threat you identify MUST be categorized into exactly one of these groups. Use the ID prefix when naming threat groups in Gemara ThreatCatalogs.

| Category | ID Prefix | Description | Key Question |
|:---|:---|:---|:---|
| Spoofing | S | Impersonating a user, service, or component | Can an attacker pretend to be something they are not? |
| Tampering | T | Unauthorized modification of data, configuration, or code | Can data or configuration be modified without authorization? |
| Repudiation | R | Denying actions without accountability mechanisms | Can actions be performed without a verifiable audit trail? |
| Information Disclosure | I | Exposing sensitive data to unauthorized parties | Can sensitive data leak to unintended recipients? |
| Denial of Service | D | Disrupting availability of services or resources | Can the service be degraded or made unavailable? |
| Elevation of Privilege | E | Gaining unauthorized access beyond intended permissions | Can an attacker gain more access than intended? |

## Analysis Workflow

### Step 1: Identify Capabilities

Before analyzing threats, enumerate the system's capabilities — features, interfaces, data flows, and integrations that comprise the attack surface.

For each capability, document:
- What can the system do?
- What interfaces does it expose (APIs, network ports, IPC)?
- What data does it process, store, or transmit?
- What external systems does it integrate with?

### Step 2: Systematic STRIDE Pass

For **each capability**, walk through all six STRIDE categories:

1. **Spoofing**: Can this capability's identity or authentication be faked? Consider service impersonation, credential replay, token forgery.
2. **Tampering**: Can the data this capability handles be modified in transit or at rest? Consider man-in-the-middle, config injection, dependency substitution.
3. **Repudiation**: Can actions through this capability go unlogged or unattributed? Consider missing audit trails, unsigned operations, log tampering.
4. **Information Disclosure**: Can sensitive information leak through this capability? Consider verbose errors, unencrypted channels, side-channel leaks.
5. **Denial of Service**: Can this capability be disrupted? Consider resource exhaustion, crash vectors, upstream dependency failure.
6. **Elevation of Privilege**: Can permissions be escalated through this capability? Consider RBAC bypass, container escape, privilege inheritance.

Skip categories where no meaningful threat exists for that capability. Not every category applies to every capability.

### Step 3: Ground in Evidence

When repository context is available (code, configuration, manifests):
- Reference specific files that demonstrate the capability or exposure
- Cite concrete configuration values, default settings, or missing protections
- Distinguish between confirmed exposures and theoretical risks

When no repository context is available:
- Perform abstract analysis based on the system description
- Note that threats are not grounded in observed code

## Gemara ThreatCatalog Mapping

When authoring a Gemara ThreatCatalog, map STRIDE categories to the `groups` array:

```yaml
groups:
  - id: spoofing
    title: Spoofing
    description: Threats involving impersonation of users, services, or components
  - id: tampering
    title: Tampering
    description: Threats involving unauthorized modification of data, configuration, or code
  - id: repudiation
    title: Repudiation
    description: Threats involving actions performed without accountability mechanisms
  - id: information-disclosure
    title: Information Disclosure
    description: Threats involving exposure of sensitive data to unauthorized parties
  - id: denial-of-service
    title: Denial of Service
    description: Threats involving disruption of service availability or resources
  - id: elevation-of-privilege
    title: Elevation of Privilege
    description: Threats involving unauthorized access beyond intended permissions
```

Each threat entry's `group` field MUST reference one of these group IDs.

Each threat entry's `capabilities` field MUST reference the capabilities it exploits, using `mapping-references` to link back to the CapabilityCatalog.

## Threat Quality Criteria

A well-formed threat:
- Describes a specific, actionable scenario (not a vague concern)
- Names the attacker's action and its consequence
- Links to one or more capabilities it exploits
- Belongs to exactly one STRIDE category
- Is distinguishable from every other threat in the catalog
