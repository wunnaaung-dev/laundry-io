# Hotel Admin

- Send items to be laundered directly through the system
  - Customer Profile Information
  - The quantity and weight of the items they are sending
  - Based on this information and the contract, the system will calculate the Expected Cost
- Hotel Floor Staff will input data for the items that will actually be sent from the ground
- The items that have been entered can be used to create a Pickup Schedule, and the items to be sent will be managed according to that schedule
- Once confirmed, the status should be able to change to "Ready To Delivery." For items that may have some issues, it should be possible to leave a Review and Feedback

Once items reach the "Ready To Deliver" status, the remaining steps will be handled by the rest of the Hotel staff and the Driver (details to be implemented later)

- Once loaded onto the vehicle, the order's status can be monitored in real time
  (e.g., whether it has reached the vehicle, whether it has arrived at the factory, which stage of washing it has reached, whether it's been washed and is about to be sent back, etc.)

## Factory Admin

- Receive (Scan-in) the orders sent from the hotel and confirm their arrival at the factory
- Sort the received items by category and begin the Washing Process required within the factory
- Update the status of each washing stage (Washing, Drying, Ironing, Folding) in the system in real time
- Move completed, laundered items into the Warehouse (Clean Linen Staging)
- Perform Quality Control (QC) on items before dispatch and change their status to Dispatch Status
- Review the feedback and reviews sent from the hotel and make necessary Corrective Actions
- Regularly enter the data needed into the system so the hotel side can monitor the order status