# AI Supply Chain Exception Intelligence & Digital Twin — Design Document

## Overview

An end-to-end system that automatically detects supply chain exceptions, quantifies downstream impact, generates AI-powered strategic alternatives, and simulates "what-if" scenarios through a lightweight digital twin.

---

## Full System Architecture

```
Data Sources → Anomaly Detection → Impact Quantification → AI Reasoning → Decision UI → Task Execution
                                         ↑
                               Digital Twin Simulator
```

---

## Part 1: AI Exception Intelligence

### 1. Anomaly Detection Engine

Continuously monitors DB tables and fires exceptions when thresholds or patterns are violated.

| Signal Type | Detection Method | Example |
|---|---|---|
| **Rule-based** | Hard thresholds | Carrier API returns 0 tankers → trigger |
| **Statistical** | Z-score / IQR over rolling window | Transit time >2σ above 30-day median |
| **ML Classifier** | Gradient Boosting / IsolationForest | Demand + Lead time pattern predicts stockout |
| **External signals** | Webhook / API polling | Port congestion index API > threshold |

**Tech:** Python `APScheduler`, `scikit-learn` IsolationForest, `httpx` async polling

**Exception Schema:**
```json
{
  "exception_id": "EXC202603-0044",
  "exception_type": "Logistics Capacity",
  "severity_level": "Critical",
  "root_cause_hypotheses": "Tank cleaning facility suspension in EU-West region",
  "impacted_entities": "42 orders, ISO tanker route NLRTM→DEHAM",
  "impacted_kpis": "OTIF projected -11.4%, Revenue at risk $120K",
  "probability": 0.98,
  "time_horizon": "48 Hours"
}
```

---

### 2. Impact Quantification

Model the supply chain as a directed dependency graph and propagate the disruption forward.

```
Supplier → [RM Transit] → Plant → [Production] → Warehouse → [FG Transit] → Customer
```

When a node is disrupted:
1. Which orders depend on this lane? (`JOIN movements ON shipment_id`)
2. Which production runs depend on those orders?
3. Which customers are impacted?
4. Calculate: `revenue_at_risk = SUM(order_value)`, `otif_impact = affected_orders / total_orders`

**Tech:** `NetworkX` for graph traversal, SQL recursive CTEs

---

### 3. AI Alternatives Generation (LLM)

**Prompt Design (Chain-of-Thought):**
```
System: "You are a senior supply chain strategist..."
User:   Exception + Impact + Current KPIs + Constraints
→ Output: 3 strategic alternatives as structured JSON
```

Each alternative returns:
- `title`, `description`, `cost_impact`, `otif_delta`, `lead_time_delta`, `tradeoff`, `confidence_score`

**LLM Options:**

| Model | Use Case |
|---|---|
| AWS Bedrock GPT-OSS 120B | Current implementation ✅ |
| Claude 3.5 Sonnet | Complex multi-hop reasoning |
| Claude 3 Haiku | High-volume, fast triage |
| Ollama + Llama 3.1 | Air-gapped / private environments |

---

### 4. Alternative Scoring

```
Score = 0.4×OTIF_preservation + 0.3×Cost_minimization + 0.2×Lead_time + 0.1×Risk_rating
```

Weights are user-configurable per business priority.

---

### 5. Human Decision Loop

```
Exception Inbox → Select Exception → AI Alternatives → Review Scorecard → Approve → Task Created → Execute → Outcome Recorded
```

---

### 6. RAG — Historical Precedents

Store past exception resolutions as text embeddings. At inference time, retrieve the top-k similar past exceptions and inject them into the LLM prompt as "historical precedents."

**Tech:** `ChromaDB` vector store, `sentence-transformers` for embeddings

---

## Part 2: Digital Twin Simulator

### What It Is

A virtual replica of the supply chain network that can be "shocked" with disruptions to simulate cascading effects before they happen.

| Dashboard | Digital Twin |
|---|---|
| Shows what *happened* | Shows what *will happen* |
| Historical data | Forward simulation |
| Static view | Interactive — inject shocks |
| Descriptive | Predictive + prescriptive |

---

### 4 Core Components

#### 1. Network Graph Model
- Nodes: Suppliers, Plants, Warehouses, Customers
- Edges: Shipment lanes, production lines (with capacity, lead time, cost, utilization)
- Populated directly from existing DB (`shipments`, `movements`, `production_runs`)
- **Tech:** `NetworkX`

#### 2. Simulation Engine
- Apply a shock to any node/edge → propagate effects forward
- Each disruption drains capacity, extends lead times, depletes inventory
- **Discrete event simulation** with `SimPy`
- Outputs: delayed orders, stockout risk nodes, OTIF delta, cost delta

#### 3. Live Visual Twin (Frontend)
- Interactive animated supply chain network map
- Click a node → inject a disruption → edges turn red as impact propagates
- **Tech:** React Flow or D3.js

#### 4. AI Layer Over Simulation
- After simulation computes raw numerical impact, pass results to LLM
- LLM generates strategic alternatives grounded in the simulated numbers
- Far more accurate than pure LLM estimation

---

### Example: ISO Tanker Shortage

```
Shock injected:   Tank cleaning facility suspension → 0 available ISO tankers
Simulation runs:  42 orders on NLRTM→DEHAM lane flagged
                  Production runs at Plant C starved of RM
                  Inventory depletion model: Plant C hits zero in 6 days
Output:           OTIF: 92.4% → 80.9% | Revenue at risk: $120K
AI Alternatives:  1. Premium spot freight ($1.70/unit extra, OTIF preserved)
                  2. Reroute via rail+road (2 days slower, saves $0.60/unit)
                  3. Delay non-critical orders + reallocate buffer stock (no cost, high risk)
```

---

### Digital Twin Build Plan (4 Days)

| Day | Task |
|---|---|
| 1 | Build NetworkX supply chain graph from DB (suppliers → plants → warehouses → customers) |
| 2 | Implement SimPy simulation — apply shocks, propagate delays, compute KPI impact |
| 3 | Expose `/api/twin/simulate` endpoint + hook into Optimizer page |
| 4 | Animated network visualization in frontend (React Flow) |

---

## Full Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI ✅ |
| Database | SQLite (dev) → PostgreSQL (prod) |
| LLM | AWS Bedrock via LangChain ✅ |
| Anomaly Detection | APScheduler + scikit-learn |
| Graph Model | NetworkX |
| Discrete Event Simulation | SimPy |
| Vector Store (RAG) | ChromaDB + sentence-transformers |
| Frontend | React + Vite ✅ |
| Network Visualization | React Flow / D3.js |
| Real-time Push | WebSockets ✅ |

---

## Do You Need a Full Digital Twin?

**No** — if you need strategic decision support (LLM alternatives are sufficient for ~80% of use cases).

**Yes** — if you need:
- Automated straight-through execution with high confidence
- Real-time IoT sensor data integration
- Millisecond-precision cascading simulation across 5+ tiers
- Tight decision windows (<2 hours)

**Recommendation:** Build the Phase 2 graph propagation engine first (lightweight twin). Add full `SimPy` simulation only after validating the core AI decision loop.

---

## Implementation Phases

| Phase | Deliverable | Priority | Effort |
|---|---|---|---|
| 1 — Anomaly Detection | Auto-detect exceptions from DB | 🔴 High | 2 days |
| 2 — Impact Quantification | Graph propagation, revenue at risk | 🔴 High | 1 day |
| 3 — AI Alternatives (enhance) | Richer LLM context + confidence scores | 🟡 Medium | 1 day |
| 4 — Optimizer / What-If | Slider inputs → LLM scenario scorecards | 🟡 Medium | 1 day |
| 5 — Digital Twin Simulator | NetworkX + SimPy + React Flow visual | 🟡 Medium | 4 days |
| 6 — RAG | Embed past resolutions, ground future alternatives | 🟢 Lower | 2 days |
| 7 — Feedback Loop | Outcome tracking, continuous learning | 🟢 Lower | 1 day |
