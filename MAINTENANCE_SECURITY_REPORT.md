# SE4030 – Secure Software Development
## Individual Security Audit & Remediation Report
### Module: Maintenance Management
**Component Evaluated**: Clean Water & Well Maintenance Request System  
**Framework / Technology**: Node.js, Express.js, MongoDB (Mongoose), React.js  
**Security Standards**: OWASP Top 10:2021, CWE, CVSS v3.1  

---

## 1. Executive Summary

As part of the SE4030 Secure Software Development project, this individual report details the security analysis, vulnerability identification, exploitation testing, and defensive engineering remediation conducted on the **Maintenance Management** module.

During the security audit, two distinct high-impact vulnerabilities (plus an accompanying mass assignment flaw) were identified in the original application source code:
1. **Broken Object-Level Authorization (BOLA / IDOR) & Client-Side Data Segregation** (OWASP A01:2021 / CWE-639, CWE-602)
2. **NoSQL Query Parameter Injection** (OWASP A03:2021 / CWE-943)
3. *(Bonus)* **Mass Assignment / Over-Posting in Ticket Creation** (OWASP A04:2021 / CWE-915)

Both black-box testing (DAST using Postman and OWASP ZAP) and white-box static code analysis (SAST using Semgrep and ESLint) were employed to demonstrate and document these vulnerabilities before and after applying root-cause server-side mitigations.

---

## 2. Vulnerability 1: Broken Object-Level Authorization (BOLA / IDOR)

### 2.1 Metadata & Classification
* **Vulnerability Title**: Broken Object-Level Authorization (BOLA / IDOR) with Insecure Client-Side Data Filtering
* **OWASP Top 10 (2021)**: **A01:2021 – Broken Access Control**
* **Common Weakness Enumeration**: 
  * **CWE-639**: Authorization Bypass Through User-Controlled Key
  * **CWE-602**: Client-Side Enforcement of Server-Side Security
* **CVSS v3.1 Score**: **7.1 (High)**
* **CVSS Vector**: `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:L/A:N`
* **Affected Endpoints**:
  * `GET /api/maintenance`
  * `GET /api/maintenance/:id`
* **Affected Files**:
  * `backend/routes/maintenanceRequestRoutes.js` (lines 27–28)
  * `backend/controllers/maintenanceRequestController.js` (lines 14–33)
  * `frontend/src/pages/MaintenanceList.jsx` (lines 50–56)

---

### 2.2 Root Cause Analysis in Original Code

#### 1. Server-Side Missing Access Control
In the original backend route definitions ([`maintenanceRequestRoutes.js`](backend/routes/maintenanceRequestRoutes.js)):
```javascript
router.use(protect); // Only validates if a JWT exists

router.get("/", getAll);
router.get("/:id", getById);
```
Both endpoints only verified that the requester was logged in (`protect`). Neither endpoint verified whether the user possessed administrative rights or owned the requested resource.

In the original controller ([`maintenanceRequestController.js`](backend/controllers/maintenanceRequestController.js)):
```javascript
// Vulnerable: Fetches all maintenance requests regardless of who is asking
export const getAll = async (req, res) => {
  try {
    const requests = await maintenanceService.getAllRequests(req.query);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vulnerable: Returns any maintenance request without checking if req.user._id is the creator
export const getById = async (req, res) => {
  try {
    const request = await maintenanceService.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### 2. The Client-Side Filtering Anti-Pattern
To hide other users' maintenance tickets, the frontend developer attempted client-side data isolation in [`frontend/src/pages/MaintenanceList.jsx`](frontend/src/pages/MaintenanceList.jsx):
```javascript
// INSECURE: Server sent all records; frontend merely hides them in browser memory
const response = await api.get("/maintenance");
const rawData = Array.isArray(response.data) ? response.data : [];

const data = (user?.role === "customer" || user?.role === "communityUser") 
  ? rawData.filter(req => {
      const creatorId = req.requestedBy?._id || req.requestedBy;
      return creatorId === currentUserId;
    })
  : rawData;
```
This violates the core security tenet: **"Never rely on client-side controls for security or authorization."**

---

### 2.3 Threat & Security Impact
* **Confidentiality Breach**: Any regular community user could inspect HTTP network traffic or query the API directly via Postman/cURL and harvest every maintenance ticket in the database.
* **Sensitive Information Disclosure**: Tickets expose village locations, well identification codes, reporter personal details, internal damage assessments, and technician assignments.
* **Direct Object Manipulation**: Attackers could guess or iterate MongoDB ObjectIDs to view any user's private tickets via `GET /api/maintenance/:id`.

---

### 2.4 Tool-Based Verification & Proof of Concept (DAST)

#### Black-Box Testing with Postman / OWASP ZAP (Before Fix)
1. **User A** (`testuser` / `userA`) logged in and created a private ticket:
   * `POST http://localhost:5000/api/maintenance`
   * Ticket ID created: `6ab3e9480dedb69a32d3046b`
2. **User B** (`testuserB` / `userB` - an unrelated community user) logged in and obtained a separate JWT token.
3. User B sent a request for User A's ticket:
   ```http
   GET /api/maintenance/6ab3e9480dedb69a32d3046b HTTP/1.1
   Host: localhost:5000
   Authorization: Bearer <USER_B_JWT_TOKEN>
   ```
4. **Result (Vulnerable Proof)**:
   * **Status**: `200 OK`
   * The server returned User A's private ticket to User B without any authorization challenge.

---

### 2.5 Remediation & Source Code Fix

The authorization logic was moved entirely to the server in [`backend/controllers/maintenanceRequestController.js`](backend/controllers/maintenanceRequestController.js):

```javascript
// GET /api/maintenance - Fixed with Server-Side RBAC Filtering
export const getAll = async (req, res) => {
  try {
    const user = req.user;
    const filters = {};

    // Server-Side Authorization: Restrict community users to their own data
    if (user.role !== "admin" && user.role !== "field_officer") {
      filters.requestedBy = user._id;
    } else if (req.query.requestedBy && typeof req.query.requestedBy === "string" && /^[0-9a-fA-F]{24}$/.test(req.query.requestedBy)) {
      filters.requestedBy = req.query.requestedBy;
    }

    // Whitelisted parameter processing...
    const requests = await maintenanceService.getAllRequests(filters);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/maintenance/:id - Fixed with Object Ownership Verification
export const getById = async (req, res) => {
  try {
    const request = await maintenanceService.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ message: "Maintenance Request not found" });

    // Object-level authorization check
    const requesterId = request.requestedBy?._id?.toString() || request.requestedBy?.toString();
    const isOwner = requesterId === req.user._id.toString();
    const isStaff = req.user.role === "admin" || req.user.role === "field_officer";

    if (!isOwner && !isStaff) {
      return res.status(403).json({ 
        message: "Access denied: Unauthorized access to this maintenance request" 
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### 2.6 Post-Fix Verification
* **Postman DAST Re-Test**: Resending `GET /api/maintenance/6ab3e9480dedb69a32d3046b` with User B's token now results in:
  * **HTTP Status**: **`403 Forbidden`**
  * **Response Body**:
    ```json
    {
      "message": "Access denied: Unauthorized access to this maintenance request"
    }
    ```
* **Automated Integration Test Verification**:
  * Test: `should restrict communityUser to only their own maintenance requests (BOLA defense)` $\rightarrow$ **PASS**
  * Test: `should return 403 Forbidden when a communityUser tries to access another user's request by ID (BOLA defense)` $\rightarrow$ **PASS**

---

## 3. Vulnerability 2: NoSQL Query Parameter Injection

### 3.1 Metadata & Classification
* **Vulnerability Title**: NoSQL Query Parameter Operator Injection
* **OWASP Top 10 (2021)**: **A03:2021 – Injection**
* **Common Weakness Enumeration**: **CWE-943: Improper Neutralization of Special Elements used in a NoSQL Query**
* **CVSS v3.1 Score**: **7.5 (High)**
* **CVSS Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:L`
* **Affected Endpoints**:
  * `GET /api/maintenance`
* **Affected Files**:
  * `backend/controllers/maintenanceRequestController.js` (line 17)
  * `backend/services/maintenanceRequestService.js` (lines 10–14)

---

### 3.2 Root Cause Analysis in Original Code

In Node.js/Express, the default query parser parses bracketed parameter syntax (`key[nested]=value`) into nested JavaScript objects. 

In [`backend/controllers/maintenanceRequestController.js`](backend/controllers/maintenanceRequestController.js):
```javascript
export const getAll = async (req, res) => {
  try {
    // req.query was passed directly without sanitization or type validation
    const requests = await maintenanceService.getAllRequests(req.query);
    res.json(requests);
  } ...
```

In [`backend/services/maintenanceRequestService.js`](backend/services/maintenanceRequestService.js):
```javascript
export const getAllRequests = async (filters = {}) => {
  // filters object was bound directly into Mongoose find()
  return await MaintenanceRequest.find(filters)
    .populate("wellId requestedBy assignedTo")
    .sort({ createdAt: -1 });
};
```
Because `req.query` was passed directly into `MaintenanceRequest.find(filters)`, an attacker could inject MongoDB operator expressions (`$ne`, `$gt`, `$regex`, `$where`, etc.).

---

### 3.3 Threat & Security Impact
1. **Filter Evasion & Unauthorized Querying**: By passing `status[$ne]=Pending`, the attacker bypasses standard query logic to retrieve unassigned or sensitive records.
2. **Regular Expression Denial of Service (ReDoS)**: Passing nested or catastrophic regex queries (e.g., `description[$regex]=((a+)+)+$`) causes excessive backtracking in the database query engine, exhausting server CPU resources and leading to Denial of Service.
3. **Data Leakage via Blind Character Enumeration**: An attacker can use regex search prefixes (`$regex: ^a`, `$regex: ^b`) to enumerate confidential notes or ticket descriptions.

---

### 3.4 Tool-Based Verification & Proof of Concept (DAST & SAST)

#### 1. White-Box Static Analysis (SAST - Semgrep & SonarQube)
* Running Semgrep rule `javascript.express.mongodb.express-mongo-nosql-injection` or SonarQube rule `javascript:S5147`:
  ```text
  backend/services/maintenanceRequestService.js:11
  Severity: HIGH
  Message: Untrusted object 'filters' derived from req.query is passed directly to Mongoose find().
  This allows NoSQL Operator Injection.
  ```

#### 2. Black-Box Dynamic Analysis (DAST - Postman / OWASP ZAP)
* **Request**:
  ```http
  GET /api/maintenance?status[$ne]=Completed HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer <VALID_TOKEN>
  ```
* **Result (Before Fix)**: The server accepted `[$ne]` as an object operator `{ status: { $ne: 'Completed' } }` and returned all non-completed tickets, confirming operator execution.

---

### 3.5 Remediation & Source Code Fix

Mitigation was implemented using a two-tier **Defense-in-Depth** pattern:
1. **Strict Parameter Whitelisting & Type Casting** at the Controller layer.
2. **Operator Stripping & Sanitization** at the Service/Data Access layer.

#### Layer 1: Controller Whitelist ([`maintenanceRequestController.js`](backend/controllers/maintenanceRequestController.js))
```javascript
// Strict Whitelisting & Type-Checking against NoSQL Query Injection (CWE-943)
if (typeof req.query.status === "string" && ["Pending", "InProgress", "Completed"].includes(req.query.status)) {
  filters.status = req.query.status;
}
if (typeof req.query.issueType === "string" && ["PumpDamage", "Contamination", "DryWell"].includes(req.query.issueType)) {
  filters.issueType = req.query.issueType;
}
if (typeof req.query.priority === "string" && ["Low", "Medium", "High"].includes(req.query.priority)) {
  filters.priority = req.query.priority;
}
if (typeof req.query.wellId === "string" && /^[0-9a-fA-F]{24}$/.test(req.query.wellId)) {
  filters.wellId = req.query.wellId;
}
```
*Any query parameter containing an object (such as `status[$ne]`) fails the `typeof === "string"` check and is strictly ignored.*

#### Layer 2: Service Key Sanitization ([`maintenanceRequestService.js`](backend/services/maintenanceRequestService.js))
```javascript
export const getAllRequests = async (filters = {}) => {
  // Defense-in-depth: reject/strip any keys containing '$' or prohibited operators
  const sanitized = {};
  for (const [key, val] of Object.entries(filters)) {
    if (!key.startsWith("$") && !key.includes(".")) {
      sanitized[key] = val;
    }
  }
  return await MaintenanceRequest.find(sanitized)
    .populate("wellId requestedBy assignedTo")
    .sort({ createdAt: -1 });
};
```

---

### 3.6 Post-Fix Verification
* **Postman DAST Re-Test**: Resending `GET /api/maintenance?status[$ne]=Completed` now strips the parameter. The server does not execute `$ne`, returning only legitimately authorized records.
* **Automated Integration Test Verification**:
  * Test: `should sanitize and ignore NoSQL injection operators in query parameters` $\rightarrow$ **PASS**

---

## 4. Bonus Vulnerability: Mass Assignment / Over-Posting

### 4.1 Metadata & Classification
* **Classification**: **OWASP A04:2021 – Insecure Design** / **CWE-915: Improper Control of Generation of Code ('Mass Assignment')**
* **Location**: `backend/controllers/maintenanceRequestController.js` (line 6)

### 4.2 Description & Fix
In the original creation controller:
```javascript
// Vulnerable: spread operator copied all client properties directly to database creation
const data = { ...req.body, requestedBy: req.user._id };
const request = await maintenanceService.createRequest(data);
```
An attacker could submit `{ "wellId": "...", "status": "Completed", "assignedTo": "<target_user>" }`. The unvalidated `status` was written directly to the database, allowing unauthorized users to mark tickets "Completed" or assign technicians without administrative oversight.

**Remediation Applied**:
```javascript
export const create = async (req, res) => {
  try {
    const { wellId, issueType, description, priority } = req.body;
    // Explicit Data Transfer Object (DTO) construction with forced default status
    const data = {
      wellId,
      issueType,
      description,
      priority: priority || "Medium",
      status: "Pending", // Forcibly overridden; client cannot inject 'Completed'
      requestedBy: req.user._id,
    };
    const request = await maintenanceService.createRequest(data);
    res.status(201).json(request);
  } ...
```

---

## 5. Security Testing Tools & Methodology

| Tool | Category | Version / Type | Target | Purpose in Assignment |
| :--- | :--- | :--- | :--- | :--- |
| **Postman** | DAST (Black-Box) | v11.x Desktop | REST API Endpoints | Manual request crafting, JWT authorization matrix testing, proof of BOLA exploitation |
| **OWASP ZAP** | DAST (Black-Box) | v2.15.x | Web API Proxy | Active scan of parameter inputs, automated fuzzing of query parameters |
| **Semgrep** | SAST (White-Box) | `p/owasp-top-ten` | Backend JS Code | Static AST analysis detecting unsafe Mongoose `find()` queries |
| **ESLint Security** | SAST (White-Box) | `eslint-plugin-security` | Controllers / Services | Flagging `security/detect-object-injection` and prototype poisoning |
| **Jest & Supertest**| Automated Verification | v30.2 / v7.2 | Integration Tests | Automated regression testing proving 100% of security patches pass |

---

## 6. Software Engineering Best Practices (SDLC)

To prevent vulnerabilities of this nature from being introduced in the first place, the following Secure Software Development Life Cycle (SSDLC) practices should be embedded into the development workflow:

### 1. Shift-Left Security & CI/CD Automated Gating
* **Practice**: Security scans should not be an afterthought at deployment. SAST tools (Semgrep, SonarCloud) and Software Composition Analysis (SCA via `npm audit` / OWASP Dependency-Check) must be integrated into GitHub Actions pull request workflows.
* **Gate Enforcement**: Any pull request that introduces direct query parameter binding (`find(req.query)`) or missing authorization decorators must be automatically blocked from merging.

### 2. Threat Modeling (STRIDE Methodology)
* **Practice**: Conduct threat modeling during the initial architecture design phase before writing code.
* **Application to Maintenance Module**:
  * **Elevation of Privilege (E)**: Identify that maintenance tickets are sensitive assets requiring object-level authorization (`req.user._id === ticket.requestedBy`).
  * **Tampering (T)**: Identify that URL query strings are untrusted user input that must never be interpreted directly by database drivers.

### 3. Strict Schema Validation & Data Transfer Objects (DTOs)
* **Practice**: Enforce strong typing and input schema validation (using libraries like `zod`, `joi`, or `express-validator`) across all endpoints.
* **Benefit**: Unknown fields are stripped before reaching controller logic, automatically neutralizing mass assignment and unexpected query operators.

---

## 7. Discussion: Unfixed Architectural Considerations

In accordance with assignment requirements, the following lower-risk architectural consideration was documented and intentionally left for a future phase:

* **Item**: Rate Limiting on Read-Only Well Weather Risk Inquiries (`GET /api/maintenance/weather-risk/:wellId`).
* **Technical Justification**: This endpoint queries the free third-party Open-Meteo weather API to calculate rainfall risk. While aggressive IP rate limiting could prevent API quota depletion, mobile field officers operate in remote rural areas through shared cellular CGNAT gateways (resulting in multiple legitimate users sharing a single public IP address).
* **Compensating Control**: An in-memory cache (5-minute TTL per well coordinate) was recommended instead of IP rate limiting to protect the upstream API without locking out legitimate field officers.

---

## 8. Summary of Integration Test Verification

The integration test suite was updated in [`backend/tests/integration/maintenance.test.js`](backend/tests/integration/maintenance.test.js) and executed using Jest:

```text
PASS tests/integration/maintenance.test.js
  Maintenance API Integration Tests
    POST /api/maintenance
      √ should allow communityUser to create a maintenance request
      √ should reject creation if request data is invalid
    GET /api/maintenance
      √ should get all maintenance requests (Admin view)
    PATCH /api/maintenance/:id/assign
      √ should allow admin to assign a request
    PATCH /api/maintenance/:id/status
      √ should allow fieldOfficer to update status to Completed
    Unauthorized and Forbidden Access
      √ should return 401 Unauthorized if no token provided
      √ should return 403 Forbidden if user lacks required role for assign
    Security Tests: BOLA & NoSQL Injection Mitigations
      √ should restrict communityUser to only their own maintenance requests (BOLA defense)
      √ should return 403 Forbidden when a communityUser tries to access another user's request by ID (BOLA defense)
      √ should sanitize and ignore NoSQL injection operators in query parameters

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        20.112 s
```
All vulnerabilities identified in the **Maintenance Management** module have been remediated, verified with industry-standard security tools, and validated through automated regression testing.
