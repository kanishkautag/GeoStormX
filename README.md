# 🌌 AURA: Cosmic Weather Prediction & Insurance System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

AURA is a predictive analytics and risk management platform designed to forecast space weather events, quantify their financial impact, and provide actionable intelligence to insurers and asset operators.

### ✨ **[View the Live Application](https://auraa-amber.vercel.app/)** ✨

---

## 🚨 Problem Statement
Space weather—encompassing solar flares, geomagnetic storms, and cosmic rays—poses a significant and growing threat to our technology-dependent world. These events can disrupt satellites, cripple power grids, and endanger aviation, leading to multi-million-dollar losses.

The core problem is that existing risk assessment is poor. Forecasts have limited lead time, and there's **no direct translation of space weather data into quantifiable financial risk**. This leaves satellite operators and insurers exposed and unable to effectively price or mitigate this cosmic threat. Our challenge was to design a system that bridges this gap.

---

## 🛰️ Our Solution

### 🗺️ 1. Real-time Forecasting & Aurora Mapping
We provide an intuitive visualization of current and future geomagnetic activity, showing exactly where the impact will be felt.

* **72-Hour Kp-Index Forecast**: The system uses a custom-trained ML model to predict the Kp-index (a global measure of geomagnetic storm intensity) up to 72 hours in advance.
* **Interactive Global Map**: Forecasts are plotted on an interactive map that visualizes the aurora oval, helping operators understand the risk to assets in specific orbits.
* **Specialized Aviation Reports**: A dedicated agent analyzes high Kp-index events to generate detailed reports for the aviation industry, identifying high-risk polar routes and potential communication blackouts.

https://github.com/user-attachments/assets/a6884122-e5b1-4d15-8b81-10b8532e1b39

### 🛰️ 2. Dynamic Risk Simulation
Our platform's core is a powerful "what-if" engine that allows users to simulate the impact of space weather on individual assets. This is crucial for underwriting and insurance pricing.

* **Asset Control Sliders**: Users can input key parameters for a satellite, including Shielding Hardness, Orbital Altitude, and Insured Asset Value.
* **Real-time Anomaly Calculation**: AURA runs a Monte Carlo simulation in the backend to model thousands of potential outcomes based on the forecasted storm intensity and asset parameters.
* **Probabilistic Output**: The result is a clear **Anomaly Probability (%)** and the **Calculated Financial Impact**, providing a solid foundation for pricing an insurance policy.

https://github.com/user-attachments/assets/6b3489a8-540b-4d7e-8541-727ec57c31c5

### 📈 3. Actuarial Insurance Premium Calculation
AURA moves beyond simple risk identification by translating complex space weather forecasts directly into a suggested insurance premium.

* **Dynamic Calculation Engine**: The premium isn't static. It's calculated dynamically using an actuarial formula: `Gross Premium = Pure Premium + Risk Margin + Expense Loading`.
* **Kp-Index Driven**: The **Pure Premium** is directly influenced by the live Kp-index. As the forecasted storm intensity rises, the probable loss increases, and the premium adjusts accordingly.
* **Asset-Specific Premiums**: The platform displays estimated premiums for various classes of assets (LEO, MEO, GEO), allowing underwriters to quickly assess risk.

### 🤖 4. AURA-Agent: The Expert AI Analyst
To make complex data accessible, we built AURA-Agent, a specialized AI chatbot powered by **Google's Gemini model**.

* **Expert Persona**: The agent acts as a data-driven risk analyst.
* **Grounded Responses**: Its knowledge is strictly limited to the project's problem statement and live alert data from NOAA, ensuring it provides answers that are factual, precise, and relevant.
* **Natural Language Interface**: Users can ask complex questions about methodology, current alerts, or risk factors and get immediate, easy-to-understand answers.

### 📲 5. Automated Alerting
Timely information is critical. AURA includes an integrated notification system to ensure stakeholders are informed the moment a threat emerges.

* **Live Alert Feed**: The dashboard ingests real-time alerts from official sources like the NOAA Space Weather Prediction Center.
* **AI-Assisted Drafting**: Users can select a critical alert, and the AURA agent will instantly analyze its potential impacts and draft a clear, concise notification message.

---

## 🏗️ System Architecture
AURA is built on a modern, decoupled architecture with a React frontend and a FastAPI backend, ensuring a responsive user experience and scalable data processing.

<img width="3033" height="1069" alt="diagram-export-9-28-2025-2_41_09-PM" src="https://github.com/user-attachments/assets/80f105ff-6e8c-4ac6-ba93-d5c475cd1e81" />

---

## 🔧 Technology Stack

| Area                 | Technologies                                                                                                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Backend** | ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)                                                                  |
| **Machine Learning** | Custom Time-Series Forecasting Model, Monte Carlo Simulation Engine                                                                                                                                                                                                         |
| **APIs & Services** | ![Google Gemini](https://img.shields.io/badge/-Gemini-4285F4?style=flat-square&logo=google&logoColor=white) ![Twilio](https://img.shields.io/badge/-Twilio-F22F46?style=flat-square&logo=twilio&logoColor=white) `SERPAPI`, `NOAA Space Weather API`                               |
| **Deployment** | Vercel (Frontend), Docker (Backend)                                                                                                                                                                                                                                         |

---




## 🚀 Getting Started

Follow these steps to get AURA running locally on your machine.

### Prerequisites

* Python 3.9+
* Node.js and npm
* Git

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/aura.git](https://github.com/your-username/aura.git)
cd aura
