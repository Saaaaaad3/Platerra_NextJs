# Project Overview: Smart AI-Powered QR Menu Platform

## Vision

Build a mobile-first SaaS platform for restaurants and cafés that replaces traditional printed menus with visually rich digital menus accessible through a QR code.

The primary goal is not to build a menu management system, but to improve the customer ordering experience and help restaurants showcase their food more effectively.

Food photography is a core differentiator. Every menu item should be able to display a high-quality image so customers can see what they are ordering before making a decision.

The platform will eventually evolve into an AI-powered restaurant automation and discovery platform.

---

## Core Principles

* Mobile-first design
* Extremely fast loading
* No mobile app required
* QR code opens directly in browser
* Simple and elegant user experience
* Focus on solving restaurant and customer problems
* Build fast and validate with real restaurants before adding complexity

---

# Version 1 (MVP)

## Customer Experience

Customer scans a QR code at a restaurant table.

They are taken to a mobile-friendly menu page where they can:

* View restaurant branding
* Browse menu categories
* View menu items
* View food photos
* Read descriptions
* See prices
* Search menu items

No account creation is required.

No mobile app download is required.

The experience should feel similar to browsing a modern food delivery app.

---

## Restaurant Experience

Restaurant owner can:

* Create and manage menu categories
* Create and manage menu items
* Upload food photos
* Edit prices
* Edit descriptions
* Generate a QR code linked to their menu

The admin experience should be simple and functional.

---

## Initial Scope

Build only:

* Restaurant management
* Categories
* Menu items
* Food photos
* QR menu page
* Search

Do NOT build:

* Ordering
* Payments
* Reservations
* Loyalty programs
* Reviews
* Delivery integrations
* Analytics
* Restaurant marketplace

---

# Version 1.5 (AI Assistant)

Add a lightweight AI food assistant.

The assistant should answer questions using menu data.

Examples:

* Which dishes are vegetarian?
* What is spicy?
* What is good for two people?
* Which dishes contain nuts?
* Recommend a high-protein meal.
* What is your most popular dish?

The AI should use structured menu information rather than document uploads or complex RAG systems initially.

The assistant should feel like a digital waiter.

---

# Version 2 (Restaurant Discovery Platform)

Allow customers to discover restaurants using the platform.

Features may include:

* Restaurant listings
* Restaurant profiles
* Public menu browsing
* Search and discovery
* Food-focused exploration

The long-term vision is to help users discover restaurants through menu content and food preferences, not just restaurant names.

Examples:

* Find restaurants with vegan options.
* Find restaurants with high-protein meals.
* Find cafés with dessert menus.

---

# Version 3 (Future Vision)

Potential expansion into restaurant automation:

* Table ordering
* Dine-in ordering
* Waiter assistance
* Delivery workflows
* AI customer interactions
* Restaurant operations automation

This is out of scope for MVP.

---

# Technical Philosophy

Optimize for:

* Fast development
* Simplicity
* Clean architecture
* Rapid validation

Avoid premature optimization and overengineering.

The goal is to acquire real restaurant customers quickly and validate demand before investing in advanced features or infrastructure.

Technology decisions should prioritize speed of delivery and maintainability rather than architectural complexity.