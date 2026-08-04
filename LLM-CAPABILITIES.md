# Benefits Assistant — What the LLM Can Answer

This document lists the questions the Benefits Assistant answers, **and what it
answers with**. Every answer below is real output from the app's own data
(`features/policy/constants.ts` + the dashboard and claims records), reproduced
verbatim — nothing here is illustrative or hand-written.

**How answers work**

| Stage | When it runs | What it decides |
|-------|--------------|-----------------|
| **Keyword routing** | Question matches a known benefit alias or data phrase | Instant, no model call |
| **LLM routing** | Everything the keyword matchers miss | Which grounded source to build — never the facts |
| **Policy answer** | Coverage, limit, proof, deadline, tax, how-to | Reads the benefit catalog |
| **App-data answer** | Balances, claims, wallets, rules, merchants | Reads dashboard + claim records + catalog |
| **Guided flows** | Upload, track, merchants, vehicle | Deterministic UI workflows, not free-form Q&A |
| **Fallback** | Model unavailable (e.g. GitHub Pages) | Same records, deterministic summaries |

**The model never supplies a fact.** It picks which JSON gets built, then
narrates it. Every number in a generated answer must already appear in that JSON
or the answer is discarded and the deterministic summary below is shown instead
(the rejection is logged to the console with the offending values). So the
answers in this document are the *guaranteed* answers — with the model running,
the wording varies but the facts cannot.

---

## 1. Policy & benefit questions

Ask about any of these wallets. Name the benefit (or use an alias) plus a policy
question word (`limit`, `proof`, `covered`, `eligible`, `deadline`, `how`, …).

| Benefit | Also recognized as |
|---------|-------------------|
| Meal Wallet | meal, meals, food, restaurant, cafeteria |
| Gift Wallet | gift, gifts, voucher, festival gift |
| Fuel & Maintenance | fuel, petrol, diesel, vehicle maintenance |
| Mobile & Internet | mobile, phone, internet, broadband, wifi, data plan |
| Driver Salary | driver, chauffeur, driver salary |
| Books & Periodicals | books, journals, periodicals, publication |
| Professional Development | courses, certifications, training, workshop, conference |

### Overview of a benefit

> **Q — "Tell me benefits about meals"**
>
> **Meal Wallet**
>
> Your meal wallet supports food expenses as part of CTC flexible benefits. With valid bills, reimbursements can be structured under common employer meal voucher practices aligned to Section 10(14) style allowances.
>
> - **Potential Tax Treatment:** Eligibility depends on employer policy and your applicable tax regime
> - **Monthly Limit:** ₹2,500
> - **Proof Required:** GST food / restaurant invoices
> - **Claim Frequency:** Monthly
>
> All monthly claims must be submitted before the 5th of subsequent month
>
> _Eligibility depends on your employer policy, applicable tax regime, documentation, and payroll review. This is policy guidance, not tax advice._

### Proof and documents

> **Q — "What proof is required for fuel?"**
>
> **Fuel & Maintenance proof required**
>
> - Original printed GST invoices are required
>
> All monthly claims must be submitted before the 5th of subsequent month

Also works: *What documents do I need for driver salary?* · *Do I need a GST invoice for fuel?* · *What invoice is needed for books claims?*

### Deadlines and frequency

> **Q — "When must I submit books claims?"**
>
> **Books & Periodicals deadline**
>
> - Claims must be submitted before the 5th of next month
> - **Claim Frequency:** Monthly

Also works: *When do I need to submit meal claims?* · *How often can I claim mobile benefits?* · *When is the gift claim window?*

### Coverage and eligibility

> **Q — "Are certifications covered under professional development?"**
>
> **Professional Development coverage**
>
> - Online courses
> - Professional certifications
> - Workshops & seminars
> - Exam fees
> - Conference tickets
> - Role-related training
>
> Learning must be relevant to your current or future role

> **Q — "What is covered under gift wallet?"**
>
> **Gift Wallet coverage**
>
> - Festival gift vouchers
> - Employer gift cards
> - Approved retail gift invoices
> - Diwali / Holi gift packs
> - Team celebration gifts
> - Company-listed merchants
>
> Eligible mainly for festival / employer-approved gift occasions

### How the claim process works

> **Q — "How does driver salary work?"**
>
> **How Driver Salary works**
>
> 1. **Register Your Driver** — Add your driver details including name, mobile number, and driving licence
> 2. **Set Monthly Salary** — Define the monthly salary amount within your allowance limit
> 3. **Submit Monthly Claims** — Upload salary payment proof each month through the app
> 4. **Payroll Review** — Approved claims are processed according to employer payroll policy

### More than one benefit at a time

A question naming several benefits is answered for each of them (up to three),
rather than being refused.

> **Q — "Compare the meal and fuel benefits"**
>
> **Comparing Meal Wallet and Fuel & Maintenance**
>
> - **Meal Wallet:** monthly limit ₹2,500 · monthly · GST food or restaurant invoice
> - **Fuel & Maintenance:** monthly limit ₹15,000 · monthly · Original GST fuel or maintenance invoice
>
> _Eligibility depends on your employer policy, applicable tax regime, documentation, and payroll review. This is policy guidance, not tax advice._

### Tax treatment (qualified only)

*What is the tax treatment for fuel benefits?* · *Is the meal wallet tax-free?*

The assistant only restates policy language ("depends on employer policy and tax
regime") and will **not** invent savings percentages or guarantee tax-free status.

### Follow-ups

After discussing one benefit you can drop the category: *What proof is required?*
· *What is the limit?* · *When is the deadline?* · *How do I submit?*

---

## 2. Dashboard & balance questions

> **Q — "Show my dashboard"** / **"What is my available balance?"**
>
> **Claims dashboard (FY 26/27)**
>
> - **Available:** ₹2,05,000
> - **Utilized:** ₹80,000
> - **FY limit:** ₹2,85,000
> - **Categories:** 5

> **Q — "How much is available on my fuel dashboard?"**
>
> **Fuel & Maintenance**
>
> - **Available:** ₹42,000
> - **Utilized:** ₹18,000 of ₹60,000 accrued (FY 26/27)
> - **July 2026 claims:** ₹18,500

Category dashboards exist for Fuel, Mobile, Driver, Books, and Professional
Development. Meal and Gift have no dashboard screen — ask about them through the
wallet overview in §4 instead.

Also works: *How much have I utilized?* · *What is my FY limit?* · *What is pending on my fuel wallet this month?* · *Show books dashboard totals*

---

## 3. Claim history & status questions

The assistant reads the per-benefit dashboards **and** the claims-history screen
as one list of 25 claims, so every status is answerable.

> **Q — "How many claims do I have?"**
>
> **Your claims**
>
> - **Count:** 25
> - **Total:** ₹97,593
> - **Approved:** 18
> - **Pending:** 5
> - **Needs info:** 1
> - **Rejected:** 1
>
> **Latest**
> - **CLM-44120** — Indian Oil - July 2026, ₹4,500, Approved
> - **CLM-44410** — Coursera Certificate - July 2026, ₹4,500, Approved
> - **CLM-44201** — Airtel Postpaid - July 2026, ₹999, Approved

### Filtered lists

> **Q — "Show my pending fuel claims"**
>
> **Your pending claims**
>
> - **Count:** 1
> - **Total:** ₹3,200
> - **Approved:** 0
> - **Pending:** 1
> - **Needs info:** 0
> - **Rejected:** 0
>
> **Latest**
> - **CLM-44088** — HP Petrol Pump - July 2026, ₹3,200, Pending

> **Q — "Show mobile claims"**
>
> **Your claims**
>
> - **Count:** 6
> - **Total:** ₹5,995
> - **Approved:** 4
> - **Pending:** 2
> - **Needs info:** 0
> - **Rejected:** 0
>
> **Latest**
> - **CLM-44201** — Airtel Postpaid - July 2026, ₹999, Approved
> - **CLM-44185** — Jio Fiber - July 2026, ₹1,299, Approved
> - **CLM-44140** — Airtel Broadband - June 2026, ₹500, Pending

### Rejected and needs-info claims

> **Q — "Why was my claim rejected?"** / **"Show my rejected claims"**
>
> **Your rejected claims**
>
> - **Count:** 1
> - **Total:** ₹1,100
> - **Approved:** 0
> - **Pending:** 0
> - **Needs info:** 0
> - **Rejected:** 1
>
> **Latest**
> - **CLM-45033** — Shell Aundh - 20 Apr 2026, ₹1,100, Rejected

> **Q — "Which claims need more information?"**
>
> **Your needs info claims**
>
> - **Count:** 1
> - **Total:** ₹3,400
> - **Approved:** 0
> - **Pending:** 0
> - **Needs info:** 1
> - **Rejected:** 0
>
> **Latest**
> - **CLM-45188** — Indian Oil - 11 May 2026, ₹3,400, Needs info

### A specific claim ID

> **Q — "What happened to CLM-44088?"**
>
> **Claim CLM-44088**
>
> - **Title:** HP Petrol Pump - July 2026
> - **Status:** Pending
> - **Amount:** ₹3,200
> - **Date:** 04 July 2026

### Follow-ups

After a claims answer: *Which ones are approved?* · *Which are pending?* ·
*How many?* · *What amounts?*

---

## 4. Cross-benefit, rules, and merchant questions

### All wallets at once

Covers all seven benefits, including Meal and Gift, which have no dashboard
screen. This is why the total here (₹2,40,000) is higher than the dashboard's
₹2,05,000 — the dashboard only sums the five categories that have screens.

> **Q — "Which wallet has the most left?"** / **"What is my total available?"**
>
> **Your wallets (FY 26/27)**
>
> - **Driver Salary:** ₹55,000 available of ₹90,000
> - **Books & Periodicals:** ₹48,000 available of ₹55,000
> - **Fuel & Maintenance:** ₹42,000 available of ₹60,000
> - **Professional Development:** ₹38,000 available of ₹50,000
> - **Meal Wallet:** ₹30,000 available of ₹30,000
> - **Mobile & Internet:** ₹22,000 available of ₹30,000
> - **Gift Wallet:** ₹5,000 available of ₹5,000
>
> **Total available:** ₹2,40,000

Also works: *Where do I still have budget?* · *Compare meal and gift* · *Which benefit should I use?*

### What makes a claim pass or fail

The same checks `lib/claims/precheck.ts` runs at submission, explained before you
upload anything.

> **Q — "What makes a claim fail?"** / **"Why do claims get rejected?"**
>
> **What a claim needs to pass**
>
> Every claim is checked for required fields, a valid amount and bill date, available balance, attached proof, duplicates, and the submission deadline.
>
> - **Meal Wallet:** GST food or restaurant invoice, submit by the 5th of the next month
> - **Gift Wallet:** Gift voucher or purchase invoice
> - **Fuel & Maintenance:** Original GST fuel or maintenance invoice, submit by the 5th of the next month
> - **Mobile & Internet:** Postpaid mobile or broadband GST invoice, submit by the 5th of the next month
> - **Driver Salary:** Monthly salary receipt and driver licence, submit by the 5th of the next month
> - **Books & Periodicals:** Book or subscription invoice, submit by the 5th of the next month
> - **Professional Development:** Course or certification invoice

Also works: *What documents do I need?* · *What are the required fields?* · *Before I submit, what should I check?*

Note the split: *"Why do **claims** get rejected?"* explains the rules, while
*"Why was **my** claim rejected?"* shows your rejected claim (§3).

### Merchant eligibility

Checks the meal and fuel brand allowlist without starting the locator flow.

> **Q — "Is Shell allowed?"**
>
> **Allowed merchants**
>
> - **Fuel:** Shell
>
> Brands outside this list are not automatically rejected; they need HR review.

> **Q — "Is Starbucks eligible?"**
>
> **Allowed merchants**
>
> - **Meal:** Starbucks
>
> Brands outside this list are not automatically rejected; they need HR review.

---

## 5. Guided actions (not free-form LLM Q&A)

These start a **UI workflow**. The assistant replies with a short prompt, then
cards and inputs take over.

| Action | Trigger phrases | What happens |
|--------|-----------------|--------------|
| **Upload bill** | upload / scan + bill, receipt, invoice, reimbursement | Camera / PDF / gallery → OCR → precheck → submit |
| **Track claim** | track claim, claim status, where is my claim | Asks for claim ID or date; explains status steps |
| **Merchant locator** | merchant, petrol pump, meal merchant, allowed merchant | Fuel or Meal merchant search (name or nearby) |
| **Vehicle registration** | register vehicle, car registration, vehicle | Vehicle number lookup → HR submission |
| **View policy** | policy, coverage, benefits | Opens benefit picker, then policy answers |
| **Greeting / help** | hi, hello, help | Lists what the assistant can do |

> **Q — "Upload a bill"**
>
> Sure. Upload a bill and I'll read it for you.

Then: upload options (camera, PDF, gallery) → OCR → editable fields (category,
vendor, amount, bill date, invoice no.) → policy precheck → demo claim.

**Categories you can claim against:** Meal Wallet, Gift Wallet, Fuel &
Maintenance, Mobile & Internet, Books & Periodicals, Professional Development,
Other / HR review.

> **Q — "Track my claim"**
>
> **Track a claim**
>
> Please share your claim ID or the approximate submission date.
>
> Typical statuses:
>
> 1. Submitted
> 2. Under review
> 3. Approved / Needs info
> 4. Paid

> **Q — "Hi"**
>
> **Hi!** I'm your Benefits Assistant.
>
> I can help with:
>
> - Uploading bills
> - Tracking claims
> - Policy details
> - Merchant locator
> - Vehicle registration for tax benefits
>
> What would you like to do?

---

## 6. What the LLM will *not* answer

| Out of scope | Why |
|--------------|-----|
| Personal tax advice or "how much tax will I save?" with an invented % | Explicitly blocked; only the policy qualifier + disclaimer |
| Limits, dates, or claim IDs not in app data | Grounding rejects invented numbers and IDs |
| Arithmetic the app has not precomputed | The model may not add, subtract, or convert amounts; totals and percentages are computed in TypeScript and supplied in the JSON |
| Generic "status of my claim" without an ID or category | Reserved for the **Track claim** guided flow |
| Legal advice, payroll disputes, HR policy outside the catalog | Outside the supplied policy JSON |
| Topics unrelated to claims / benefits / vehicle / merchants | Falls back to the help menu |

If the policy or app data does not contain the answer, the assistant says so
rather than guessing.

**On the static GitHub Pages build** there is no `/api/assistant`, so LLM routing
is unavailable: only the keyword matchers run, and answers are exactly the
deterministic summaries shown throughout this document. The first failed call is
remembered so later questions do not retry.

---

## 7. Quick reference — sample question bank

Copy-paste prompts that are known to route correctly.

**Upload a bill**
1. Upload a bill
2. Upload a receipt / Upload an invoice
3. Scan a bill / Scan my receipt
4. Submit a bill / Submit my invoice
5. I want reimbursement
6. Upload my fuel bill / Upload a meal receipt

**Policy**
7. Tell me benefits about meals
8. What proof is required for fuel?
9. What is the monthly limit for mobile?
10. How does driver salary work?
11. Are certifications covered under professional development?
12. What is covered under gift wallet?
13. When must I submit books claims?
14. Compare the meal and fuel benefits

**Dashboard**
15. Show my dashboard
16. How much is available on my fuel dashboard?
17. What is my available balance?
18. How much have I utilized?

**Claims**
19. How many claims do I have?
20. Show my pending fuel claims
21. Show mobile claims
22. What happened to CLM-44088?
23. Why was my claim rejected?
24. Which claims need more information?
25. Which ones are approved? *(as a follow-up after claims)*

**Cross-benefit, rules, merchants**
26. Which wallet has the most left?
27. What is my total available?
28. What makes a claim fail?
29. Why do claims get rejected?
30. Is Shell allowed? / Is Starbucks eligible?

**Other guided**
31. Track my claim
32. Find a meal merchant / Find a fuel merchant
33. Register my vehicle
34. Hi / Help

---

## Related source files

| File | Role |
|------|------|
| `lib/assistant/route.ts` | LLM route classifier — prompt, strict validator, plan mapping |
| `lib/assistant/policy.ts` | Policy routing, system prompt, grounding check |
| `lib/assistant/appData.ts` | Dashboard / claims / wallets / rules / merchants routing |
| `lib/assistant/claimIndex.ts` | Merges the dashboard and history claim sets into one list |
| `lib/assistant/sources.ts` | Wallet overview, claim rules, and merchant allowlist payloads |
| `lib/assistant/history.ts` | Projects the transcript into prompt turns |
| `lib/assistant/replies.ts` | Intent keywords and guided-flow replies |
| `lib/assistant/routing.test.ts` | The routing table every question above is checked against |
| `features/policy/constants.ts` | Benefit catalog (limits, proof, steps, coverage) |
| `features/dashboard/` | Balances and claim records |
| `README.md` | Local vs static (Pages) model behavior |
