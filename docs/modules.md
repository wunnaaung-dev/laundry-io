
**Core Business Modules**
- **Customer / Company Profile** — Company Profile Management
- **Contract & SLA** — Contract Management, Service Level Agreement
- **Pricing** — Pricing Model Management
- **Order Management** — Order Processing, Checking Invoices
- **Billing & Invoicing** — Billing (hotel confirmation), Checking invoices, Cash Flow

**Operations Modules**
- **Linen Lifecycle Tracking** — Scan linen via RFID/QR, Real-time status updates, Tracking status for hotel view
- **Workflow & SOP Engine** — Defining validation/workflow rules, Adhere to digitally defined SOP tasks
- **Warehouse Management** — Warehouse (both hotel & laundry side)
- **Asset Management** — Equipment/asset tracking
- **Purchasing** — Purchasing module
- **Delivery / Dispatch Schedule** — Delivery Schedule (ties into your existing Dispatch & Vehicle work)

**Intelligence & Notification Modules**
- **AI Analytics / Recommendations** — Decisions based on equipment performance & AI-generated reports, Operational recommendations for hotel
- **Notification System** — Batch stage notifications to hotel

**Access & Reporting**
- **Role-Based Access Control** — since you have distinct actors (HQ Admin, Site Manager, Warehouse Staff, Floor Staff / Laundry Manager, Floor Operator, Warehouse Staff, QC Inspector, Driver)
- **Reporting & Usage Dashboard** — Viewing invoices/usage info (hotel side)

---

**Consolidated module list (matching your example format):**

- Customer / Company Profile
- Contract & SLA
- Pricing
- Order
- Linen Lifecycle Tracking
- Workflow & SOP Engine
- Warehouse
- Asset Management
- Purchasing
- Dispatch & Delivery
- AI Analytics & Recommendations
- Notification
- Billing & Cash Flow
- Access Control (Roles)
- Reporting / Usage Dashboard

A couple of things worth flagging: **QC Inspector** doesn't have an explicit feature mapped to it yet in your list (Quality Control module — inspection checkpoints, defect logging?), and **Driver** role also has no dedicated feature bullet beyond "Delivery Schedule" — you may want a lightweight **Driver App / Trip Execution** module to cover pickup/drop confirmation, similar to what you've been doing with Trip/Vehicle Dispatch.

🏨 Hotel Side Only

Customer Portal / Notification — ဘာတွေ့ ပို့မှာလဲ (batch stage) notification ရရှိတာ Hotel side က ကြည့်တဲ့ view
Usage & Invoice Dashboard — Invoice, Usage Information ကြည့်တာ (Hotel ဘက်က consume လုပ်တဲ့ feature)
Operational Recommendation View — Laundry ဘက်က AI ထုတ်ပေးတဲ့ recommendation ကို Hotel ဘက်ကနေ လက်ခံကြည့်ရှုတာ (generate တာက Laundry ဘက်၊ consume တာက Hotel ဘက်)

🏭 Laundry Factory Side Only

Workflow & SOP Engine — SOP tasks သတ်မှတ်တာက Laundry operation ရဲ့ internal process
AI Analytics / Equipment Performance — Equipment performance monitoring, AI report generation (Laundry Factory ရဲ့ internal equipment data)
QC / Inspection — QC Inspector role ရှိတာအရ Laundry factory production line ထဲက quality checkpoint
Purchasing — Laundry chemical, spare parts စတာတွေ ဝယ်ယူတာ (internal operations)
Asset Management — Machine, equipment asset tracking (Laundry factory ပိုင် asset)

🔄 နှစ်ဖက်လုံးနဲ့ သက်ဆိုင် (Shared)

Customer / Company Profile Management — Hotel profile ကို Laundry ဘက်က create/manage လုပ်ပေမယ့် Hotel ဘက်ကလည်း own data ကြည့်ရတယ်
Contract & SLA Management — နှစ်ဖက်စလုံး ကတိကဝတ်ချုပ်ဆိုတဲ့ document ဖြစ်လို့
Pricing Model Management — Laundry က သတ်မှတ်ပေမယ့် Hotel ဘက်ကလည်း visible ဖြစ်ရမယ့် data
Order Processing — Hotel က order တင်တာ (request) နဲ့ Laundry က process လုပ်တာ (fulfill) နှစ်ဖက်လုံးပါ
Billing & Cash Flow — Hotel ဘက်ကနေ confirm/pay ရတယ်၊ Laundry ဘက်ကနေ invoice ထုတ်တယ် — flow တစ်ခုတည်းပေမယ့် actor နှစ်ဖက်ပါ
Linen/Garment Lifecycle Tracking (RFID/QR scan) — Garment ဟာ Hotel ကနေ Laundry ကို သွားလာနေတဲ့ item ဖြစ်လို့ status ကို နှစ်ဖက်စလုံးက tracking view ချင်ကြမယ်
Warehouse — Hotel side မှာလည်း Warehouse ရှိတယ် (ဓာတ်ပုံထဲက Hotel actor group ထဲမှာ "Warehouse Staff" ပါ)၊ Laundry ဘက်မှာလည်း Warehouse ရှိတယ် — ဒါပေမယ့် Data model အားဖြင့် သီးခြား instance နှစ်ခု ဖြစ်တာကို သတိထားရမယ် (Hotel ရဲ့ warehouse ≠ Laundry ရဲ့ warehouse၊ Module logic တူပေမယ့် data scope ခွဲရမယ်)
Dispatch & Delivery — Driver က နှစ်ဖက် (Hotel pickup → Laundry drop) ကြားမှာ လှုပ်ရှားနေရလို့ inherently shared