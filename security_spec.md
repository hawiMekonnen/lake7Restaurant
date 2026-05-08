# Security Specification for Lake7 Restaurant Manager

## Data Invariants
1.  An Order must have a status from the predefined list.
2.  An Order's `total` must be the sum of its items.
3.  Only authenticated staff can modify menu items, inventory, and driver assignments.
4.  Customers (simulated/public) can only create orders, but not edit or delete them.
5.  Order status transitions should be sequential (received -> prepared -> out_for_delivery -> delivered).

## The Dirty Dozen Payloads
1.  **Unauthorized Menu Edit**: Unauthenticated user trying to change item price.
2.  **Order Spoofing**: User trying to create an order with a 'delivered' status.
3.  **Inventory Drain**: Unauthenticated user trying to zero out stock levels.
4.  **Driver Takeover**: User trying to change a driver's name or phone.
5.  **Status Skip**: Transitioning an order from 'received' directly to 'delivered'.
6.  **Price Tampering**: Creating an order with items worth $100 but `total` set to $1.
7.  **Negative Stock**: Setting inventory `stockLevel` to -50.
8.  **Shadow Fields**: Adding an `isAdmin: true` field to a user profile (if we had users collection).
9.  **Feedback Injection**: Writing feedback for an order that doesn't exist.
10. **ID Poisoning**: Using a 2KB string as a menu item ID.
11. **PII Leak**: Accessing the `orders` collection without authentication to see customer addresses.
12. **Double Action**: Trying to "Prepare" an order that is already "Out for Delivery".

## The Test Runner (Plan)
We will use `firestore.rules.test.ts` to verify these rejects. (Simplified for this environment, but conceptually complete).
