# Customer Profile, Contracts, and Pricing Creation — Collaborative Workflow

Smart Laundry Management Software Platform supports a structured, collaborative workflow between the Client Admin and the Factory Side (Super Admin) for managing customer profiles, contracts, and pricing, as follows.

## Collaborative Functions

### 1. Customer Profile Management (Centralized Profile Management)

- **Factory Side (Super Admin):** Can create new profiles in the system for enterprise customers, enter their information, and manage those profiles.
- **Client Admin Side:** Can view and update their own business's profile information.

### 2. Contracts and Pricing Creation (Configurable Templates)

- **Factory Side (Super Admin):** Can define contract templates and pricing models for each individual customer within the system. This includes Service-Level Agreements (SLAs), which maintain service quality against defined standards.

  **What an SLA includes**

  An SLA is an agreement between the client and the factory that maintains service quality standards, and includes:

  - **Turnaround Time (TAT):** The committed timeframe within which laundered items must be completed and returned.
  - **Quality Standards:** Rules ensuring cleanliness standards and that garments are not damaged.
  - **Service Scope:** Which categories of items are covered (e.g., linen, towels, uniforms).
  - **Penalty Clauses:** Liability terms in cases where commitments are not met, or where items are lost or damaged.

  **Note:** A single customer can have more than one contract. Care must be taken to ensure there is no overlap of linen items across contracts (for example, if bed sheets are covered under Contract A, they should not also appear in Contract B for the same company).

- **Client Admin Side:** Can review the contract terms and pricing models set by the Super Admin through their own dashboard.

### 3. Cross-Process Integration

- **Order, Pricing, and Billing Engine (Module B):** Based on the pricing rules set by the Super Admin, when the Client Admin submits an order, the system automatically generates an invoice and calculates charges according to the subscribed plan.

  **Invoice Generation — Business Flow (Step-by-Step)**

  Since the system is cloud-based SaaS, data is managed in real time, and invoices are generated through the following steps:

  1. **Step 1 (Order Submission):** The Client Admin submits a service order through the system.
  2. **Step 2 (Usage Tracking):** The system automatically records the quantity or weight of items submitted.
  3. **Step 3 (Automated Calculation):** Based on the pricing model set by the Super Admin (as defined in the contract), the system automatically calculates the amount due for the order.
  4. **Step 4 (Invoice Generation):** Based on the calculated amount, an invoice is automatically generated.
  5. **Step 5 (Tracking & Management):** The Client Admin can monitor invoices and check outstanding balances through their dashboard.