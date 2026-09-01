# TruckWithEase — A2P refile status (2026-09-01)

## Done this session
- DELETE on Usa2p **instance** URL works (204). Collection URL 405s. Both stuck FAILED campaigns deleted.
- Refiled LOW_VOLUME with live RECOMMENDED_FILING text on MG28e60 (brand BNc2bb) -> HTTP 201 -> FAILED in <45s.
- Control test: same filing on MG71b9 under the OTHER brand (BN595cbf) -> HTTP 201 -> FAILED in <40s.
- Both returned the IDENTICAL campaign SID QE2c6890da8086d771620e9b13fadeba0b. Cached verdict, not a fresh review.

## ROOT CAUSE FOUND
Customer profile `BU4549acfd8133b61444347b175b50f5c0`
EndUser `IT81046df9c502cc5eefbb3cf5c7d0f39d` (customer_profile_business_information):
  website_url = https://morrishive.com   <-- returns HTTP 525 (dead)
30882 (TERMS_AND_CONDITIONS_URL) and 30908 (PRIVACY_POLICY_URL) are verified against the
BRAND's registered website, not the URLs written in the campaign message flow.
truckwithease.com/terms = 200 / 48,528B, /privacy = 200 / 31,839B — both fine, both never checked.
morrishive.com is NOT in his Cloudflare account (only truckwithease.com zone exists).

## BLOCKED — website_url cannot be changed via API
He said GO. Attempted and rejected:
- POST /v1/EndUsers/IT81046df9c502cc5eefbb3cf5c7d0f39d {website_url: https://truckwithease.com}
  -> 400 code 70002 "Cannot update end-user. A bundle it belongs to is in an immutable state."
- POST /v1/CustomerProfiles/BU4549acfd.../ Status=draft
  -> 400 "This operation is restricted via API for Primary Customer Profiles. Use Twilio Console instead."
- Status=pending-review -> 400 "User cannot perform this status update"
Profile status = twilio-approved (immutable).

HIS ACTION: Twilio Console -> Trust Hub -> Customer Profiles -> "Morrishive-Truckwithease"
(primary business profile) -> edit Business Website -> https://truckwithease.com -> save/resubmit.

Both FAILED campaigns deleted (204 each); both services now show 0 campaigns.
Once website_url is truckwithease.com, re-run the LOW_VOLUME POST from /tmp/filing.json
against MG28e60cf43e25de692677cca0c6d9dedc, brand BNc2bb637f13c79bc10c8045ee264e55e6.

## Still outstanding
- Cloudflare -> SSL/TLS -> Overview -> Full (his click)
- www.truckwithease.com custom domain was `pending`
- Phase 2 Render deploy so /api/comms/inbound has a public webhook
- Google Maps HTTP referrer restrictions (his click)
