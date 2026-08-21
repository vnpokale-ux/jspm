# University Viva & Technical Q&A Preparation Guide

### **Project**: Campus Lost & Found System with AI-Powered Multi-Factor Matching
### **College**: TSSM's Bhivarabai Sawant College of Engineering & Research (BSCOER), Pune
### **Subject**: Web Technology / Software Engineering

---

## 🎯 Top Examiner Questions & Model Answers

### **Q1: What is the high-level architecture of your project?**
**Answer:**  
Our system follows a decoupled, 3-tier RESTful client-server architecture:
1. **Frontend Presentation Tier**: A Single Page Web Application (SPA) built with vanilla CSS design system and modular JavaScript, providing sub-second UI interactions, live search, and persona testing.
2. **Backend API & Service Tier**: Built on Spring Boot 3.2 (Java 17), containing REST Controllers, Spring Security OAuth2 Resource Server for JWT authentication, and business service modules.
3. **Data Persistence Tier**: Spring Data JPA and Hibernate ORM interacting with a relational MySQL 8 database.

---

### **Q2: How does the AI Multi-Factor Matching Engine work?**
**Answer:**  
When an item is reported, `MatchingServiceImpl` executes a weighted heuristic similarity scoring formula:
- **Category (40% Weight)**: Checks exact or hierarchical taxonomy match.
- **Text Similarity (35% Weight)**: Pre-processes text by converting to lowercase, stripping stop words ("the", "is", "lost", "found"), and computing the **Jaccard similarity coefficient** with a bonus boost if the titles match closely.
- **Location Similarity (15% Weight)**: Evaluates campus building and room keyword overlap (e.g. "Lab 204", "Library 3rd Floor").
- **Date Proximity (10% Weight)**: Computes the absolute difference in days using a proximity decay curve.
- If total similarity score $S \ge 0.45$ ($45\%$), a `Match` suggestion is automatically created and both users receive an instant in-app notification.

---

### **Q3: How do you handle Authentication and Authorization?**
**Answer:**  
- **Authentication**: We support secure credential authentication with email verification. The permanent campus administrator is **Sanjay Patil** (`sb@patil.bscoer.gmail.com`).
- **Student Email Approval Workflow**: Because universities don't always provision `@college.edu` emails to all students, any student can register using their personal email and PRN. New student accounts are flagged as `PENDING` until approved by Administrator Sanjay Patil in the **Student Approvals Hub**.
- **Authorization**: Role-Based Access Control (RBAC) separates Students (`USER`) and Administrators (`ADMIN`). Regular students can only delete and resolve their own reported items (`isOwner`), while the Administrator can moderate all listings, approve student emails, and export CSV audit reports.

---

### **Q4: How does the Ownership Claim & Handover verification prevent false claims?**
**Answer:**  
1. Claimants must provide private distinguishing proof (e.g. PRN number, engraved marks, lockscreen wallpaper description).
2. The original finder or security officer reviews this proof description.
3. When approved, the system generates a **secure 6-digit PIN token (e.g., `TK-824915`)** and a **scannable QR pass**.
4. The claimant presents this pass in person at the security cabin. The finder/officer inputs the PIN into `/api/claims/{id}/verify-handover` to validate the physical exchange, transition the item status to `CLOSED`, and record an audit entry.

---

### **Q5: Why did you use Spring Data JPA Specifications instead of standard query methods?**
**Answer:**  
In the item directory (`BrowsePage`), users can filter by any combination of keywords, type (Lost/Found), category, location, date range, and status.  
Using JPA Specifications (`ItemSpecification.java`) allows us to dynamically construct criteria predicates at runtime without writing dozens of repetitive repository query combinations, resulting in cleaner and more maintainable code.

---

### **Q6: How do you handle CORS and security headers?**
**Answer:**  
In `SecurityConfig.java`, we configure a `CorsConfigurationSource` restricting allowed origins to trusted clients (`http://localhost:5173`, `http://localhost:3000`), allowing standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`), and requiring authorization headers.

---

### **Q7: What database constraints and entity relationships are implemented?**
**Answer:**  
- `User` to `Item`: `@OneToMany` (One user can report multiple lost/found items).
- `Item` to `Claim`: `@OneToMany` (Multiple users can submit claims on a found item).
- `Match`: Has `@ManyToOne` relationships with `lostItem` and `foundItem`.
- `Notification`: `@ManyToOne` linked to recipient `User`.
- Cascade types and fetch policies are configured with `FetchType.LAZY` for performance optimization.
