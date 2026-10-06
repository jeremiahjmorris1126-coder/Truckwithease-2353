# White-Label ELD: What It Would Actually Take, and Whether You Need It

**Prepared for Jeremiah Morris — TruckWithEase**
**Date: August 29, 2026**
**Decisions this informs: (1) no in-house hardware, confirmed; (2) positioning as software alongside an existing ELD, confirmed; (3) whether to white-label a registered device later.**

***

## Executive Summary

White-labeling an already-registered ELD is real, cheap to start, and extremely common — roughly **75% of the devices on the FMCSA registered list are white-labeled**, meaning they share core technology and are registered under different brand names.\[^1] So the path exists and it is well-worn.

But it does not do what you might hope. Under the ELD rule the **branding partner still has to self-certify and register the device under its own name** — "TruckWithEase ELD" would have to appear on the FMCSA list as its own entry, with TruckWithEase as the registered provider.\[^2] You inherit the certification liability and the revocation risk; you do not inherit somebody else's certification.

And the revocation risk right now is severe. FMCSA has removed **79 devices since January 2025** for failing federal standards,\[^3] with removals in 2026 alone on Jan 13 (4 devices), Feb 12 (9), Mar 4 (14), May 20 (12), and Aug 6 (5).\[^4] When a device is revoked, every carrier using it has 60 days to switch and the ELD goes out of service. Attaching the TruckWithEase name to somebody else's firmware means your brand goes down with their firmware.

**Recommendation: do not white-label now. Your confirmed decision — software that runs alongside the driver's existing ELD — is the stronger position, and it is stronger for a reason white-labeling would actually destroy: you have no device to get revoked.** Revisit white-labeling only when a paying customer refuses to buy without a TruckWithEase-branded box.

***

## Key Findings

* **Branding partners must self-certify.** A white-label deal does not let TruckWithEase ride on the manufacturer's registration. Your name, your entry on the list, your liability.\[^2]
* **Three-quarters of the registered list is already white-label**, and NMFTA has documented more than a dozen white-label ELD "families," some containing dozens of related products — including a network used for log falsification.\[^1]\[^5] Being one more rebadge in a crowded family is not a differentiator; it is a liability by association.
* **Revocation is now routine, not rare.** 79 devices removed since Jan 2025; 38 in 2025 alone; five separate removal events in 2026.\[^3]\[^4]
* **No reseller pricing is published by anyone.** Every program I found — ELD Mandate, CountingTrucks, ETAnow, Ezlogz — requires you to request a quote. ELD Mandate publishes only that joining the partner network is free and commissions pay twice monthly.\[^6] I could not verify per-unit wholesale cost for any vendor, and I am not going to guess at it.
* **You are already on the correct side of this.** The comparison brief's argument holds: TruckWithEase competes on software. The one structural gap was hardware, and you have now decided not to close it. That is a coherent strategy, not a concession.

***

## Which Candidates Are Actually on the List

I parsed the live FMCSA registered-devices page (`eld.fmcsa.dot.gov/List`, 3.4 MB, **938 device rows**) and searched it for every white-label program the research surfaced. This is measured against the government's own list, not vendor marketing.

| Vendor | Devices found on the live FMCSA list | Note |
|---|---|---|
| HOS247 | 5 (`A1`, `FLT2`, `FLT3`, `FLT4`, `FLT Tele`) | Multiple registered families — the classic white-label signature |
| Blue Ink Tech (BIT ELD) | 4 (`BIT17001` Apple/Android, `BIT17003`, `BIT18000` dashcam) | Own-brand hardware, US-based |
| GPSTab | 3 (`GELD01`, `GELDN01`, `GELDW01`) | Publishes a white-label explainer |
| Ezlogz | 3 (`Ezlogz DApp 1`, `EZ101`, `ST20`) | Partner program advertised |
| ELD Mandate | 3 (`EMPRM1`, `ELDPRO1`, `EMPT30`) | Free-to-join partner/reseller network |
| Gorilla Safety | 3 (incl. `GS0001`, two FleetLocate entries) | **Caution:** trade reporting lists "Gorilla Safety Express" among 2026 revocations\[^7] |
| CountingTrucks | 1 (`Counting Trucks ELD` v1.0) | Markets a white-label program; single registered device |
| ETAnow | **0** | Sells the platform and helps *you* certify under your own brand\[^8] |
| TruckingHub | **0** | Same model — white-label platform, not a registered device |

The last two rows are the important ones. ETAnow and TruckingHub are not shortcuts around registration; they are vendors who help you become the registered provider. That is the same obligation as certifying your own device, with someone else's firmware underneath it.

For reference, the incumbents you'd be competing against are all there: Geotab (9 entries, including OEM integrations for Ford, Freightliner, International, Mack, Volvo), Azuga (8), Samsara (2, incl. the VG gateway), Motive (1, `LBB-1 and higher`), EROAD (1, `Ehubo 2`).

***

## Why "Software Alongside Their ELD" Is the Better Position

This is the part worth internalizing, because it is not a fallback.

**1. You inherit no revocation risk.** Five removal events in 2026. If a carrier's ELD gets revoked, TruckWithEase is the thing that still works — and the app that helps them survive the switch. If TruckWithEase *were* the revoked device, you'd be the emergency.

**2. Your addressable market is every truck, not every truck willing to change hardware.** A carrier replaces an ELD reluctantly and rarely; there's a device already bolted in, a contract, and drivers trained on it. Software that reads alongside it has no rip-and-replace conversation. That is a dramatically shorter sales cycle.

**3. It matches what the codebase can honestly back today.** The platform has 61 live tables, HOS clock math, DVIR, safety scoring, dispatch decision ledgering, and low-bridge data owned outright. None of that requires a registered device. Hardware would have required a supplier, firmware, ECM integration, and a certification you'd have to defend.

**4. The differentiators don't come from hardware anyway.** Deaf/HoH drivers as a primary design constraint, the low-bridge dataset, the hash-chained dispatch ledger, an app that publishes its own gaps — none of those are device features.

### What this means concretely, this week

* Keep every "FMCSA-registered ELD" claim out of the product. Already enforced — stripped in `64c4cb6`, and it stays stripped.
* Say what you are, in the marketing words you actually use: *"Works with your existing ELD."* Not "we are an ELD."
* The ELD/telematics integrations list (Geotab, Motive, Samsara, Azuga) is now the important surface, not a nice-to-have. Reading HOS from a device you didn't build **is** the product. Azuga is already built and the key was rejected; that is the one integration with a live code path waiting on credentials.

***

## If You Ever Do Want a TruckWithEase-Branded Device

Keep this on the shelf. The trigger to pull it off the shelf is a customer who will not buy without it.

1. Pick a manufacturer with **multiple long-standing registered entries and no revocation history**. On the measured list, HOS247, Blue Ink Tech and GPSTab meet the first test; Gorilla Safety fails the second.
2. Get in writing: who holds the registration, who does the self-testing against 49 CFR 395 Appendix A, and **who is liable if FMCSA revokes**. This is the whole negotiation.
3. Budget for the fact that FMCSA now runs an **initial technical review** of new applications instead of accepting them at face value.
4. Assume you must register "TruckWithEase ELD" yourself and maintain it — including the malfunction-reporting and data-transfer obligations that come with being a provider.

**Unverified, deliberately:** wholesale per-unit cost, minimum order quantity, registration timeline, and FMCSA review turnaround. Nobody publishes these. They require a direct quote and a call, and I won't invent them.

***

## Methodology & Limitations

* The device counts are measured, not quoted: I fetched the live FMCSA registered-devices page and parsed 938 device rows, then case-insensitively matched each vendor name across the provider/model columns. Re-runnable at any time.
* **What I could not verify:** FMCSA's ELD FAQ #91 — the authoritative statement on white-label self-certification — is currently returning HTTP 403 from FMCSA's edge (Akamai "Access Denied"). The self-certification requirement above rests on the indexed FAQ text plus NMFTA/Overdrive reporting, not on a page I read end to end. Confirm it directly before signing anything.
* No pricing figure appears in this brief because none could be verified from a primary source.
* Revocation counts come from FMCSA newsroom releases and the FMCSA ELD news page; individual 2026 removal dates come from FMCSA file postings and trade press, which is why the Gorilla Safety Express item is flagged as a caution rather than stated as fact.

***

## References

\[^1]: Overdrive, "'White label' ELD cheater network uncovered in NMFTA research" — approximately 75% of registered ELDs are white-labeled, sharing core technology under different names. https://www.overdriveonline.com/electronic-logging-devices/article/15829225/white-label-eld-cheater-network-uncovered-in-nmfta-research (accessed Aug 29, 2026)
\[^2]: FMCSA, "ELD FAQ 91 — Electronic Logging Devices and Hours of Service Technical Specifications": addresses whether all "providers" of a white-label device must self-certify. Page returned HTTP 403 on access attempt; claim rests on the indexed text. https://www.fmcsa.dot.gov/hours-service/elds/eld-faq-91-electronic-logging-devices-and-hours-service-technical-specifications
\[^3]: FMCSA Newsroom, "FMCSA Removes 12 Devices from List of Registered Electronic Logging Devices" — 79 devices removed since January 2025. https://www.fmcsa.dot.gov/newsroom/fmcsa-removes-12-devices-list-registered-electronic-logging-devices
\[^4]: FMCSA ELD News & Events, revoked-device notices (Jan 13, Feb 12, Mar 4, May 20, Aug 6, 2026). https://eld.fmcsa.dot.gov/Support/\_NewsAndEventCurrentPage
\[^5]: NMFTA, "White-Labeled ELDs: Hidden Risks Behind Different Brand Names" — more than a dozen white-label ELD families identified. https://nmfta.org/news/white-labeled-elds-hidden-risks-behind-different-brand-names/
\[^6]: ELD Mandate Partner Program — free to join, commissions paid twice monthly; no per-unit reseller pricing published. https://www.eldmandate.biz/partner-programs
\[^7]: FleetRabbit, "Best ELD Devices for Trucking 2026" — lists Gorilla Safety Express among devices revoked March 4, 2026. Trade source; verify against FMCSA notice before relying on it. https://fleetrabbit.com/blogs/post/best-eld-devices-2026
\[^8]: ETAnow, "White Label ELD Platform" — "Become a registered provider and certify your white label ELD under your brand." https://etanow.com/eld/
\[^9]: FMCSA ELD registered devices list (live), 938 device rows parsed Aug 29, 2026. https://eld.fmcsa.dot.gov/List
