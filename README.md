<div align="center">
  <img src="public/favicon.svg" alt="JanSetu Logo" width="100" />
  <h1>JanSetu</h1>
  <p><strong>Citizen voices inform public investment.</strong></p>
  <p><em>AI for Digital Public Infrastructure & Governance — Build with AI: Code for Communities</em></p>
</div>

<br />

## 🌟 The Problem: Citizen requests stop short of planning
"Our water supply is unreliable." — A resident has described a need. But for local governments and urban planners, the investment decision still needs context:
- **Which locality?** Reports need consistent geographic context.
- **How serious is the gap?** Service indicators give the request perspective.
- **What is already planned?** Existing investment can change the next action.

Without this context, community voices get lost in bureaucratic silos, qualitative feedback is ignored, and redundant funding wastes taxpayer money.

## 🚀 The Solution: The Citizen-to-Project Workflow
JanSetu bridges the gap between grassroots voices and data-driven urban planning. We use AI to convert unstructured, multilingual community reports into structured, quantified, and prioritized project briefs for local officials.

1. **Citizen Request:** Citizens describe a community need in their native language (e.g., Hindi or English) and select their locality.
2. **Confirmed Meaning:** Google Gemini AI extracts the category, urgency, and actionable evidence while strictly redacting PII. The citizen reviews the summary before it enters planning.
3. **Local Priority:** JanSetu deterministically combines related reports and ranks them against existing public data (e.g., service gaps, population density, and currently funded plans).
4. **Project Proposal:** Officials inspect an automatically generated, evidence-backed project brief and decide what to verify and fund.

## 🧠 Google AI gives requests a usable structure
We leverage **Google Gemini** for:
- **Structured Extraction:** Hindi and English input becomes a consistent, reviewable record.
- **Evidence-based Drafting:** Generates an evidence packet that grounds a brief in reports, indicators, and existing plans.

> **Code calculates the score. People make the decision.**

## 🛡️ Trust by Design
Every recommendation stays inspectable.
- **Citizens confirm meaning:** A correction step protects against a mistaken category or locality.
- **Missing data stays visible:** An incomplete indicator produces a review state, not a guessed score.
- **Evidence stays attached:** Analysts can inspect report excerpts and the source of each indicator.
- **People retain authority:** The system proposes planning actions. Officials remain responsible for decisions.

## 🏗️ Architecture & Tech Stack
A small, scalable, and deployable architecture designed for portability across Indian states.

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Interface** | React, Vite | Citizen intake and analyst review (Hindi & English) |
| **API Backend** | Node.js, Express | Validation, grouping, and deterministic scoring |
| **AI Engine** | Google Gemini SDK | Extraction and proposal drafting |
| **Database** | SQLite (`sql.js`) | Isolated workspaces, reports, plans, provenance |

## 🚀 Running Locally

### Prerequisites
- Node.js (v20+)
- A Google Gemini API Key

### Setup
1. Clone the repository
   ```bash
   git clone https://github.com/mohdaliazam/JanSetu.git
   cd JanSetu
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up your environment variables
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   AI_MODE="live"
   NODE_ENV="development"
   ```
4. Start the application
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

## 🌐 Live Deployment
JanSetu is fully configured to be deployed as a Docker container or via a Render Blueprint (`render.yaml`). A persistent disk is used to ensure all civic data remains secure and persistent.

---
<div align="center">
  <i>Built with ❤️ for the Code for Communities Hackathon</i>
</div>
