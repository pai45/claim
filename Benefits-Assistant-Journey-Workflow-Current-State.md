# Benefits Assistant Journey & Workflow — Current State

> Repository-backed product and UX reference for the EB+Claims Benefits Assistant as verified on 10 August 2026.

![EB+Claims](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-01.gif)

## Purpose

This document describes only behavior present in the current EB+Claims repository and deterministic local demo. It covers visible quick chats, guided registration journeys, free-text routing, bill scenarios, policy and application-data answers, persistence, privacy, statuses, errors, limitations, and downstream screen handoffs.

## Current entry points

The assistant exposes five visible quick chats:

- Upload bill
- Claim history
- Meals merchant
- View dashboard
- View policy

Additional routes are available through recommendations, structured cards, menu actions, and recognized free text:

- Track claim
- Edit claim
- Vehicle Registration
- Driver registration and Driver Salary
- Grounded policy and application-data questions
- New chat, saved conversation recovery, pending intents, and conversation clearing

![Assistant entry and visible quick chats](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-02.jpg)

## Master assistant journey

```mermaid
flowchart TD
    A["Employee opens Benefits Assistant"] --> B{"Select quick chat or enter free text"}
    B -->|Upload bill| C["Choose upload source and demo scenario"]
    B -->|History, dashboard, track or edit| D["Load structured claim data or open screen"]
    B -->|Policy or app data| E["Retrieve grounded repository content"]
    B -->|Merchant| F["Search meal merchant by name or nearby"]
    B -->|Registration| G["Run vehicle or driver guided journey"]
    B -->|Incomplete intent| H["Save pending intent and request detail"]
    B -->|Unknown| I["Clarify request or show available actions"]
    C --> J["Structured claim receipt or correction"]
    D --> K["Assistant result or downstream screen"]
    E --> K
    F --> K
    G --> L["Registration receipt or HR handoff"]
    H --> B
    I --> B
```

## 1. Upload bill

All three visible source choices open the deterministic scenario picker in the current demo. The repository contains extraction helpers, but the visible camera, PDF, and gallery choices do not pass a real device file into that processing path.

```mermaid
flowchart TD
    A["Select Upload bill"] --> B{"Choose camera, PDF or gallery"}
    B --> C["Open deterministic scenario picker"]
    C --> D{"Choose one of 12 bill scenarios"}
    D --> E["Load extracted claim details"]
    E --> F["Review and edit merchant, date, amount, category and proof"]
    F --> G["Run policy precheck"]
    G --> H{"Blocking issue?"}
    H -->|Yes| I["Correct fields, replace selection or stop"]
    I --> F
    H -->|No| J{"Warning requires acknowledgement?"}
    J -->|Yes| K["Employee acknowledges warning"]
    K --> L["Submit claim"]
    J -->|No| L
    L --> M["Show claim receipt"]
```

![Bill upload source choices](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-03.jpg)

### Current precheck gates

- Required fields are present.
- Amount is positive.
- Bill date is available.
- Benefit and category match the policy data.
- Amount is within the available allowance.
- Required proof is present.
- Duplicate evidence is evaluated.
- Submission deadline is evaluated.
- Blocking issues prevent submission.
- Warnings can require explicit acknowledgement before submission.

![Duplicate warning and acknowledgement](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-04.jpg)

### Twelve deterministic bill scenarios

| Scenario | Current precheck behavior | Employee path |
| --- | --- | --- |
| Meal Bill | Complete meal receipt | Review and submit |
| Meal Bill — missing data | Amount and date need attention | Edit fields and rerun precheck |
| Fuel Bill | Complete fuel receipt | Review and submit |
| Fuel Bill — exceeding balance | Amount exceeds available allowance | Correct amount or stop |
| Internet Bill | Monthly broadband invoice | Review and submit |
| Mobile Postpaid Bill | Monthly mobile invoice | Review and submit |
| Gift Bill | Festival gift purchase | Review and submit |
| Books & Periodicals | Professional book invoice | Review and submit |
| Professional Development | Role-related course invoice | Review and use the HR-review route when indicated |
| Duplicate Bill | Matches an existing claim | Acknowledge the duplicate warning before submission |
| Late Bill | Outside the submission window | Follow the warning or blocked result shown by the scenario |
| Other / HR Review | Category requires HR review | Accept the review route |

## 2. Claim history

```mermaid
flowchart TD
    A["Select Claim history"] --> B["Load repository-backed claim history"]
    B --> C{"Choose benefit or status filter"}
    C -->|No matches| D["Show empty state"]
    D --> C
    C -->|Matches| E["Show claim cards"]
    E --> F["Open claim detail"]
    E --> G["Track or edit an eligible claim"]
```

Current behavior includes benefit and status filtering, matching claim cards, empty-filter recovery, and claim-detail handoff.

## 3. Meals merchant

The visible action is fixed to meal merchants. Search supports merchant-name lookup and a nearby branch. Results communicate allowed, not allowed, or no-result outcomes.

```mermaid
flowchart TD
    A["Select Meals merchant"] --> B{"Search by name or nearby"}
    B -->|Name| C["Enter merchant name"]
    B -->|Nearby| D["Use nearby-search route"]
    C --> E["Resolve meal-benefit eligibility"]
    D --> E
    E -->|Allowed| F["Show allowed result"]
    E -->|Not allowed| G["Show restriction explanation"]
    E -->|No result| H["Ask employee to refine the search"]
    H --> B
```

![Meal merchant eligibility result](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-05.jpg)

## 4. View dashboard

```mermaid
flowchart TD
    A["Select View dashboard"] --> B["Show structured balance and claim summary"]
    B --> C{"Open full dashboard?"}
    C -->|No| D["Continue in assistant"]
    C -->|Yes| E["Open Claims Dashboard"]
    E --> F["Use dashboard filters and details"]
```

The assistant provides a compact summary and can hand the employee to the Claims Dashboard for deeper exploration.

## 5. View policy

```mermaid
flowchart TD
    A["Select View policy"] --> B{"Choose a benefit"]
    B --> C["Load grounded policy and application data"]
    C --> D{"On-device answer available?"}
    D -->|Yes| E["Show structured grounded answer"]
    D -->|No or delayed| F["Use deterministic grounded fallback"]
    E --> G["Open Policy details when requested"]
    F --> G
```

The route covers eligibility, allowance, deadlines, proof requirements, category rules, and process questions for the supported benefits. Repository-backed content remains available when the optional on-device answer path is unavailable.

## 6. Track and edit claim

```mermaid
flowchart TD
    A["Recognize track or edit intent"] --> B{"Track or edit?"}
    B -->|Track| C["Show the current canned CLM-43872 status response"]
    B -->|Edit| D["Collect claim ID or claim date"]
    D --> E{"Required identifier available?"}
    E -->|No| F["Save pending intent and ask follow-up"]
    F --> D
    E -->|Yes| G["Show structured claim details"]
    G --> H{"Claim editable in its current state?"}
    H -->|Yes| I["Save change or resubmit"]
    H -->|No| J["Show read-only status explanation"]
    G --> K["Open claim details screen"]
```

Current limitation: the tracking response uses a canned claim rather than binding the employee-entered identifier to a live lookup.

## 7. Vehicle Registration

```mermaid
flowchart TD
    A["Start Vehicle Registration"] --> B["Enter vehicle registration number"]
    B --> C{"Vehicle found?"}
    C -->|No| D["Correct the number or stop"]
    D --> B
    C -->|Yes| E{"Select Self Owned or Company Leased"}
    E --> F["Review vehicle and ownership details"]
    F --> G["Accept declaration"]
    G --> H["Submit registration to HR"]
    H --> I["Show registration receipt and claim ID"]
    I --> J["Offer Driver Salary action"]
```

The deterministic lookup displays vehicle details, ownership selection, a declaration, an HR-submission state, a receipt, a vehicle-detail link, and a Driver Salary continuation.

![Vehicle registration review](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-06.jpg)

Current limitation: the displayed owner name is hard-coded as Vishal Sharma in the vehicle lookup even when another persona context is active.

## 8. Driver registration and Driver Salary

```mermaid
flowchart TD
    A["Start Driver Salary"] --> B["Enter driver's full name"]
    B --> C["Choose camera, PDF or gallery for driving licence"]
    C --> D{"Choose deterministic DL outcome"}
    D -->|DL found| E["Show licence preview, extracted number and demo confidence"]
    D -->|DL data not found| F["Ask for manual DL-number entry"]
    E --> G["Confirm DL number"]
    F --> G
    G --> H["Continue to salary details"]
```

The current demo includes two DL outcomes:

| Outcome | Current result |
| --- | --- |
| DL found | Shows a fictional licence preview, extracted DL number, and demo confidence for confirmation |
| DL data not found | Requests manual entry of the licence number |

![Driver Salary licence extraction](Benefits-Assistant-Journey-Workflow-Blueprint.assets/image-07.jpg)

## 9. Grounded policy and application-data routing

```mermaid
flowchart TD
    A["Employee asks free-text question"] --> B{"Classify request"}
    B -->|Policy or app data| C["Retrieve grounded repository facts"]
    B -->|Known action| D["Dispatch deterministic handler"]
    B -->|Unknown| E["Ask for clarification or show capabilities"]
    C --> F{"On-device phrasing available?"}
    F -->|Yes| G["Show grounded structured answer"]
    F -->|No| H["Show deterministic grounded fallback"]
    D --> I["Open relevant card or screen"]
    G --> I
    H --> I
    E --> B
```

## 10. Persistence, pending intents, privacy, and clearing

```mermaid
flowchart TD
    A["Receive message or structured action"] --> B{"Enough information to resolve intent?"}
    B -->|No| C["Save pending intent and ask follow-up"]
    C --> B
    B -->|Yes| D["Resolve intent and save conversation"]
    D --> E["Reload saved browser conversation on return"]
    E --> F{"Start new chat or clear conversation?"}
    F -->|Keep draft| G["Continue current conversation"]
    F -->|Confirm clear| H["Remove saved messages and structured claim details"]
    H --> I["Original files and raw OCR text are not stored by the demo"]
```

The clear-conversation dialog states that it removes the current chat and structured claim details saved in the browser. It also states that original files and raw OCR text are not stored.

## Supported benefits

| Benefit | Current assistant coverage | Common exception |
| --- | --- | --- |
| Meal | Bill precheck, policy answer, merchant eligibility | Missing amount/date or ineligible merchant |
| Fuel & Maintenance | Bill precheck and policy routing | Allowance overrun or vehicle dependency |
| Internet | Broadband invoice extraction and precheck | Missing or unsupported proof |
| Mobile | Postpaid invoice extraction and precheck | Missing invoice fields |
| Gift | Gift-purchase extraction and precheck | Category or merchant mismatch |
| Books & Periodicals | Professional-book extraction and precheck | Non-professional category |
| Professional Development | Course-invoice extraction and precheck | Category ambiguity and HR review |

## Current claim-status vocabulary

Status labels present across the repository include:

- Submitted
- Policy checked
- Under review
- Needs info
- Approved
- Rejected
- Revoked
- Reimbursed
- Paid in one tracking explanation

The repository currently uses overlapping terms across assistant responses, cards, and downstream views.

## Error and recovery coverage

| Area | Current condition | Current employee action |
| --- | --- | --- |
| Bill details | Required value missing | Edit the structured field |
| Bill amount | Non-positive or above allowance | Correct the amount or stop |
| Bill date | Date absent or outside the scenario window | Correct or follow the displayed warning/block |
| Proof | Required evidence absent | Add or replace the selected proof |
| Duplicate | Existing-claim match | Acknowledge the warning before submission |
| Category | No direct policy match | Use the HR-review route |
| Claim filter | No matching history | Clear or change the filter |
| Merchant | Not allowed or not found | Read the explanation or refine the query |
| Vehicle lookup | Registration not found | Correct and retry |
| DL extraction | Licence number not found | Enter the number manually |
| Free text | Intent incomplete | Answer the stored follow-up prompt |
| Free text | Intent unknown | Clarify or choose an available action |
| On-device answer | Preparation unavailable or delayed | Receive grounded deterministic fallback content |

## Current downstream handoffs

| Assistant result | Destination |
| --- | --- |
| View dashboard | Claims Dashboard |
| View policy | Policy details |
| Claim history, track, or edit | Claim details |
| Vehicle registration receipt | Vehicle details |
| Vehicle submission | HR review state |
| Vehicle completion | Driver Salary guided journey |

## Current persona behavior

- The active persona supplies user context in several assistant and application surfaces.
- Vehicle lookup displays Vishal Sharma as the owner through hard-coded data.
- Persona-sensitive checks need to account for this fixed owner value when reviewing deterministic demo results.

## Verified current limitations

| ID | Limitation | Repository or demo evidence |
| --- | --- | --- |
| C-01 | Device upload is not connected to the visible journey | Camera, PDF, and Gallery all open deterministic scenario selection |
| C-02 | Track claim uses a canned identifier | Tracking responds with CLM-43872 rather than the entered claim identifier |
| C-03 | Vehicle owner is hard-coded | Vehicle review shows Vishal Sharma independent of active persona |
| C-04 | Merchant scope is inconsistent across dormant and visible elements | Visible quick chat is Meals merchant while other components describe broader merchant types |
| C-05 | Assistant journey stops at receipt or operational handoff | The demo does not persist verification, payment scheduling, or payment completion transitions |
| C-06 | On-device answer preparation can remain visible for an extended period | Policy capture remained in the preparation state during the deterministic review |
| C-07 | Capability descriptions exceed reachable UI in places | Some described components or actions are not connected to a visible entry point |
| C-08 | Status vocabulary overlaps | Paid/Reimbursed and pending/review language varies across surfaces |

## Repository evidence map

| Area | Primary source |
| --- | --- |
| Visible quick chats | `features/chat/constants.ts` |
| Routing, pending intents, persistence, vehicle and driver journeys | `features/chat/useChat.ts` |
| Twelve bill scenarios | `features/chat/demoUploadScenarios.ts` |
| Claims and status examples | `features/claims`, `features/claims-history`, and chat constants |
| Benefits and policy data | Policy, dashboard, persona, and benefit constants |

## Current-state verification checklist

- Five visible quick chats are represented.
- Track/edit, vehicle, driver, grounding, persistence, and clearing routes are represented.
- Seven benefit categories are covered.
- Twelve deterministic bill scenarios are listed.
- Both driving-licence outcomes are covered.
- Claim filters, merchant variants, persona behavior, errors, recovery actions, and screen handoffs are recorded.
- Current limitations are separated from implemented behavior.
