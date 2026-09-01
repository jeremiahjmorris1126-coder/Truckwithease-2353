# Twilio Support Ticket — stuck A2P campaign, cached FAILED verdict

**Account SID:** AC92d8…a250d1 (full SID in the Console account this ticket is filed from) **Campaign SID:** QE2c6890da8086d771620e9b13fadeba0b **Brands:** BNc2bb637f13c79bc10c8045ee264e55e6 (tcr B1FOSW1), BN595cbf455736c2daa748056985107d74 (tcr B9RCDXC) — both APPROVED / VERIFIED / STANDARD **Messaging Services:** MG28e60cf43e25de692677cca0c6d9dedc, MG71b9b9d3ef9f814d71b3cff5a5d696d5 **Primary Customer Profile:** BU4549acfd8133b61444347b175b50f5c0 (twilio-approved)

## Summary

A US A2P campaign cannot be refiled. Every submission returns the **same campaign SID** and is marked FAILED in the same second it is created, with no review taking place.

## Evidence

1. `POST /v1/Services/{MG}/Compliance/Usa2p` returns HTTP 201 with `sid = QE2c6890da8086d771620e9b13fadeba0b` — the identical SID every time, across **five separate submissions**, **two different brands**, and **two different messaging services**. A newly created campaign should receive a new SID.

2. `date_created` and `date_updated` on the failed record are **identical to the second** (`2026-09-01T21:09:30Z`). The campaign is created already-FAILED.

3. The record is deleted successfully before each refile: `DELETE /v1/Services/{MG}/Compliance/Usa2p/{QE...}` returns **204**, and a subsequent GET confirms `compliance: []` (zero campaigns) on both services. The same SID then reappears on the next POST.

4. Errors returned are always the same two:

   * `30882` field `TERMS_AND_CONDITIONS_URL`

   * `30908` field `PRIVACY_POLICY_URL`

## Why those two errors are no longer valid

The brand's registered business website is `https://morrishive.com` (EndUser IT81046df9c502cc5eefbb3cf5c7d0f39d, `website_url`). It was previously returning HTTP 525. It has been fixed and now serves both required pages over plain HTTP with no JavaScript and no redirects:

| URL                               | HTTP | Bytes  |
| --------------------------------- | ---- | ------ |
| https://morrishive.com/terms      | 200  | 48,528 |
| https://morrishive.com/privacy    | 200  | 31,839 |
| https://truckwithease.com/terms   | 200  | 48,528 |
| https://truckwithease.com/privacy | 200  | 31,839 |

Both privacy pages contain the required carrier sentence stating that no mobile information is sold or shared with third parties for marketing or promotional purposes. Both pages name the legal entity, MorrisHive LLC (Missouri).

The rejections continued unchanged after these pages went live, and continued to arrive within the same second as submission — so the reviewer is not fetching them.

## Secondary issue

`website_url` on the primary customer profile cannot be corrected to `https://truckwithease.com`, which is the actual brand/sender identity:

* `POST /v1/EndUsers/IT81046df9c502cc5eefbb3cf5c7d0f39d` → `400 code 70002` "Cannot update end-user. A bundle it belongs to is in an immutable state."

* `POST /v1/CustomerProfiles/BU4549acfd.../ Status=draft` → `400` "This operation is restricted via API for Primary Customer Profiles. Use Twilio Console instead."

* `POST /v1/CustomerProfiles/BU4549acfd.../ Status=pending-review` → `400` "User cannot perform this status update"

In the Console, the only editable field on this profile is the organization name.

## What is being requested

1. Purge the stuck TCR campaign record `QE2c6890da8086d771620e9b13fadeba0b` so a genuinely new campaign can be submitted and reviewed.

2. Unlock the primary customer profile so `website_url` can be changed from `https://morrishive.com` to `https://truckwithease.com`.

## Campaign being filed

Use case: **LOW\_VOLUME** (Low Volume Mixed). Internal fleet communication only — a fleet subscribes to phone lines inside the TruckWithEase platform and assigns them to its own drivers and dispatchers. Two message types: a conversational duty-clock answer under 49 CFR 395 between the fleet's own employees, and one-time sign-in codes to an employee's own account. No marketing, no lead generation, no third-party messaging, never used to contact brokers, shippers or the public. Consent is collected via an unchecked-by-default checkbox inside the product, with wording, timestamp and account stored on the employee record.
