# Project Brief: Kissan - Farm to Table Marketplace

## 1. Project Vision
Kissan is a mobile-first marketplace designed to bridge the gap between farmers and consumers. By enabling direct sales, Kissan ensures farmers get better prices for their produce and buyers receive fresh, high-quality products. The unique "Negotiate on Checkout" feature brings the traditional market bargaining experience into a modern digital platform.

## 2. Core Value Propositions
*   **For Farmers:** Direct access to consumers, transparent pricing, and simplified inventory/order management.
*   **For Buyers:** Fresh produce delivered "farm-to-table," cost savings through direct negotiation, and clear order tracking.

## 3. Target Audience
*   **Farmers:** Small to mid-scale agricultural producers looking to sell directly to urban consumers.
*   **Buyers:** Health-conscious individuals and families seeking fresh, organic, or locally-sourced produce at competitive prices.

## 4. Key Functional Requirements

### A. Authentication & Onboarding
*   Role-based signup (Farmer or Buyer).
*   Secure login with email/phone.

### B. Farmer Experience
*   **Dashboard:** Real-time metrics (earnings, active orders, total products) and quick actions.
*   **Inventory Management:** Add, edit, and track stock levels for various produce categories.
*   **Order Fulfillment:** Manage active sales, update shipment status, and view detailed buyer information.
*   **Negotiation Handling:** Review and accept/counter price offers from buyers.

### C. Buyer Experience
*   **Marketplace Home:** Browse produce by category, view trending items, and see promotional banners.
*   **Smart Cart:** Review items from specific farms.
*   **Conditional Negotiation Flow:** Upon checkout, users are prompted to either "Order Now" or "Negotiate Price." 
    *   *Negotiate:* Input a proposed total price for the cart.
    *   *Order:* Immediate conversion to a standard order.
*   **Order History:** Track active deliveries and past purchases.

## 5. Design Principles
*   **Emerald Growth Theme:** A fresh, trustworthy green accent (#10B981) used for primary actions and brand identity.
*   **High-Fidelity Interface:** Clean, modern UI with a focus on high-quality product imagery and readable typography (Plus Jakarta Sans).
*   **Simplicity:** Minimalist navigation to ensure ease of use for users of all technical backgrounds.

## 6. Technical Foundation
*   **Database Schema:** Prisma-based MySQL schema defining core entities: Users, Products, Carts, Orders, and Quotations.
*   **Data Models:** Supports complex relationships like many-to-one (Farmer to Products) and state management for negotiations.

## 7. Current Project Status & Assets
*   **Design System:** "Emerald Growth" and "Kissan Design System" (Tokens & Guidelines).
*   **High-Fidelity Screens:** 11 screens covering the complete end-to-end flow for both roles.
*   **Backend Definition:** Prisma Schema Document.
