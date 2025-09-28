
# AURA: Cosmic Weather Prediction & Insurance System

A predictive analytics and risk management platform designed to forecast space weather events, quantify their financial impact, and provide actionable intelligence to insurers and asset operators.

## Problem Statement
Space weather—encompassing solar flares, geomagnetic storms, and cosmic rays—poses a significant and growing threat to our technology-dependent world. These events can disrupt satellites, cripple power grids, and endanger aviation, leading to multi-million-dollar losses.

The core problem is that existing risk assessment is poor. Forecasts have limited lead time, and there's no direct translation of space weather data into quantifiable financial risk. This leaves satellite operators and insurers exposed and unable to effectively price or mitigate this cosmic threat. Our challenge was to design a system that bridges this gap.

## Our Solution

https://github.com/user-attachments/assets/a6884122-e5b1-4d15-8b81-10b8532e1b39


#### 🗺️ 1. Real-time Forecasting & Aurora Mapping
We provide an intuitive visualization of current and future geomagnetic activity, showing exactly where the impact will be felt.

72-Hour Kp-Index Forecast: The system uses a custom-trained ML model to predict the Kp-index (a global measure of geomagnetic storm intensity) up to 72 hours in advance.

Interactive Global Map: Forecasts are plotted on an interactive map that visualizes the aurora oval, the region where storm effects are most potent. This helps operators understand the risk to assets in specific orbits.

Specialized Aviation Reports: A dedicated agent analyzes high Kp-index events to generate detailed reports for the aviation industry, identifying high-risk polar routes and potential communication blackouts.

#### 🛰️ 2. Dynamic Risk Simulation
Our platform's core is a powerful "what-if" engine that allows users to simulate the impact of space weather on individual assets. This is crucial for underwriting and insurance pricing.

Asset Control Sliders: Users can input key parameters for a satellite, including Shielding Hardness, Orbital Altitude, and Insured Asset Value.

Real-time Anomaly Calculation: AURA runs a Monte Carlo simulation in the backend to model thousands of potential outcomes based on the forecasted storm intensity and asset parameters.

Probabilistic Output: The result is a clear Anomaly Probability (%) and the Calculated Financial Impact, providing a solid foundation for pricing an insurance policy.

#### 📈 3. Actuarial Insurance Premium Calculation
AURA's ultimate goal is to price risk. Our platform moves beyond simple risk identification by translating complex space weather forecasts directly into a suggested insurance premium, fulfilling a core requirement of the problem statement.

Dynamic Calculation Engine: The premium isn't static. It's calculated dynamically using an actuarial formula: Gross Premium = Pure Premium + Risk Margin + Expense Loading.

Kp-Index Driven: The Pure Premium (the core component representing expected loss) is directly influenced by the live or simulated Kp-index. As the forecasted storm intensity rises, the probable loss increases, and the premium adjusts accordingly.

Asset-Specific Premiums: The platform displays estimated premiums for various classes of assets, such as Low Earth Orbit (LEO), Medium Earth Orbit (MEO), and high-value weather satellites, allowing underwriters to quickly assess risk for different assets.

#### 🤖 4. AURA-Agent: The Expert AI Analyst
To make complex data accessible, we built AURA-Agent, a specialized AI chatbot powered by Google's Gemini model.

Expert Persona: The agent acts as a data-driven risk analyst.

Grounded Responses: Its knowledge is strictly limited to the project's problem statement and live alert data from NOAA, ensuring it provides answers that are factual, precise, and directly relevant to the user's concerns.

Natural Language Interface: Users can ask complex questions about methodology, current alerts, or risk factors and get immediate, easy-to-understand answers.

#### 📲 5. Automated Alerting 
Timely information is critical. AURA includes an integrated notification system to ensure stakeholders are informed the moment a threat emerges.

Live Alert Feed: The dashboard ingests real-time alerts from official sources like the NOAA Space Weather Prediction Center.

AI-Assisted Drafting: Users can select a critical alert, and the AURA agent will instantly analyze its potential impacts and draft a clear, concise notification message.



