The LOT concept is used to group items within an order for efficient processing. A "LOT" represents a batch of specific items (e.g., LOT-01 for Bed sheets) that share the same characteristics, such as type, weight, and destination/route, allowing the system to automatically calculate parameters like total weight for laundry machines and track their status throughout the factory flow.

To fix the logic for handling multiple items per order using the LOT concept, you should implement the following structure:

### 1. LOT Concept Integration

* 
**Logical Partitioning:** Instead of treating an order as a single monolithic entity, break each order down into distinct LOTs based on item type (e.g., Bed sheets, Towels, Uniforms).


* 
**Automatic Calculation:** Each LOT is assigned its own estimated weight and specific processing route (e.g., Washer 1 -> Flatwork).


* 
**Individual Tracking:** By assigning a unique ID to each LOT, the system can track individual item batches independently as they move through different stages like Washing, Drying, Ironing, and Folding.



### 2. Implementation Logic for Multiple Items

* 
**Sorting Phase:** After receiving an order, use the "Scan Container & Classify" function to automatically generate LOTs based on the items present in the trolley.


* 
**Status-State Machine:** Implement a state machine where each LOT carries its own status (e.g., `Tagging` -> `Sorting` -> `Washing` -> `QC` -> `Dispatch`). This ensures that even if one LOT is delayed, other LOTs in the same order can continue processing.


* **Quality Control (QC) Logic:** Apply QC checks at the LOT level. A LOT can only proceed to the `Dispatch` status if its specific `QC_Check_Passed` boolean field is set to `TRUE`.


* **Warehouse Handling:** Upon completion, each LOT is moved to the "Clean Linen Staging" area in the warehouse. The system must update the inventory accuracy by tracking the `Stock_Type` specifically for these finished LOTs to avoid mixing them with other warehouse materials.



### 3. Workflow Adjustment

* 
**Dispatching:** Use a "Batch Scan" feature in the Dispatch module to group finished LOTs back together under the original Order ID for delivery, ensuring the customer receives their entire order correctly.