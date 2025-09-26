
import React from 'react';

const Satellite = () => {

  // Simplified premium calculation
  const calculatePremium = (cost, riskFactor) => {
    const pp = cost * riskFactor; // Premium Part
    const rm = pp * 0.2; // Risk Margin (assuming 20%)
    const el = 10000 + (pp + rm) * 0.05; // Expense Loading (base + 5% of premium)
    return (pp + rm + el).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div>
      <h2>Satellite Insurance</h2>
      <div className="subsection">
        <h3>Low Earth Orbit (LEO)</h3>
        <p>LEO satellites orbit at an altitude of less than 1,000 km and at very high speeds, completing a full circle around the Earth in about 90 minutes. This proximity to Earth makes them ideal for services that require high bandwidth and low latency, such as internet constellations (e.g., Starlink), high-resolution Earth observation, and remote sensing. The short signal travel time to and from the ground allows for near-real-time communication, which is critical for applications like video conferencing and online gaming through satellite internet.</p>
        <p>However, their low altitude also means they experience greater atmospheric drag, which gradually slows them down and requires regular orbital boosts to maintain their position. This need for frequent maneuvers consumes propellant and can limit the satellite's operational lifespan. Furthermore, the LEO environment is becoming increasingly crowded, which raises the risk of collision with other satellites or space debris, a significant concern for satellite operators and insurers.</p>
        <p><strong>Average Cost to Build:</strong> $500,000 - $10,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(5250000, 0.1)}</p>
      </div>
      <div className="subsection">
        <h3>Medium Earth Orbit (MEO)</h3>
        <p>MEO satellites operate at altitudes between 2,000 km and 35,786 km. This orbit offers a good compromise between the large coverage area of geostationary satellites and the low latency of LEO satellites. A constellation of MEO satellites can provide continuous global coverage with fewer satellites than a LEO constellation, and with better signal strength than geostationary satellites for many applications.</p>
        <p>MEO is the orbit of choice for navigation systems, including the Global Positioning System (GPS), GLONASS, and Galileo. These systems rely on a precise and stable orbit to provide accurate positioning data. The MEO environment is also less congested than LEO, but the satellites are exposed to higher levels of radiation, which requires more robust and expensive electronic components.</p>
        <p><strong>Average Cost to Build:</strong> $50,000,000 - $150,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(100000000, 0.08)}</p>
      </div>
      <div className="subsection">
        <h3>Navigation Earth Orbit</h3>
        <p>These satellites, typically in MEO, are the backbone of global navigation satellite systems (GNSS). They provide autonomous geo-spatial positioning with global coverage, enabling a wide range of applications from personal navigation in our smartphones to precision agriculture, autonomous vehicles, and military operations. The high reliability and long lifespan required for these satellites make them a significant investment, with complex designs and redundant systems to ensure continuous operation.</p>
        <p>The signals from navigation satellites must be extremely precise, and their orbits are carefully monitored and adjusted. The system's accuracy can be affected by atmospheric conditions and even by the subtle effects of relativity. The ground segment, which controls the satellites and processes their signals, is just as critical as the satellites themselves, and the entire system must be protected from both physical and cyber threats.</p>
        <p><strong>Average Cost to Build:</strong> $100,000,000 - $200,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(150000000, 0.07)}</p>
      </div>
      <div className="subsection">
        <h3>Weather Satellite</h3>
        <p>Weather satellites are crucial for monitoring the Earth's weather and climate. They can be in geostationary orbit (GEO), providing a constant view of one side of the Earth, or in polar orbit, scanning the entire planet several times a day. GEO weather satellites are invaluable for tracking large-scale weather patterns like hurricanes, while polar-orbiting satellites provide the detailed data needed for numerical weather prediction models.</p>
        <p>These satellites carry sophisticated sensors, such as imagers and sounders, to capture data on cloud cover, temperature, humidity, and atmospheric composition. This information is essential for everything from daily weather forecasts to long-term climate change research. The high cost of these satellites is due to the complexity and sensitivity of their instruments, and the need for them to operate reliably for many years in the harsh environment of space.</p>
        <p><strong>Average Cost to Build:</strong> $200,000,000 - $400,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(300000000, 0.06)}</p>
      </div>

      <div className="subsection">
          <h3>Insurance Premium Calculation Formula</h3>
          <p>The insurance premium (G) is a comprehensive calculation designed to cover potential losses, manage risk, and account for administrative costs. It is determined by the following formula:</p>
          <p><code>G = PP + RM + EL</code></p>
          <ul>
              <li>
                  <strong>PP (Premium Part):</strong> <code>&Sigma; [P(Kp=k) * ELoss(k)]</code>
                  <p>This is the core of the premium, representing the expected loss. It is calculated by summing up the potential losses for different levels of geomagnetic storm intensity (Kp index). For each intensity level 'k', we multiply the probability of that event occurring, <strong>P(Kp=k)</strong>, by the expected financial loss if it does, <strong>ELoss(k)</strong>.</p>
              </li>
              <li>
                  <strong>RM (Risk Margin):</strong> <code>PP * (Z&alpha; * CV)</code>
                  <p>The risk margin is a buffer added to the premium to account for uncertainty. It is calculated by multiplying the premium part (PP) by a factor derived from <strong>Z&alpha;</strong> (a value from the standard normal distribution for a given confidence level, e.g., 99.5%) and the <strong>CV</strong> (Coefficient of Variation, a measure of the volatility of the potential losses).</p>
              </li>
              <li>
                  <strong>EL (Expense Loading):</strong> <code>AE + (G * CC)</code>
                  <p>This component covers the insurer's operational costs. It includes <strong>AE</strong> (Administrative Expenses), which are the fixed costs of underwriting and managing the policy, and the <strong>CC</strong> (Cost of Capital), which is a percentage of the total premium (G) that accounts for the cost of the capital the insurer must hold in reserve.</p>
              </li>
          </ul>
      </div>

      <div className="subsection">
        <h3>Assumptions for Premium Calculation</h3>
        <p>The premium calculations above are estimates and are based on the following assumptions:</p>
        <ul>
          <li>The formula has been simplified for this demonstration.</li>
          <li><strong>P(Kp=k)</strong> (Probability of a specific geomagnetic storm intensity) and <strong>ELoss(k)</strong> (Expected Loss at that intensity) are represented by a single simplified `riskFactor` for each satellite type.</li>
          <li><strong>Z&alpha;</strong> (a value from the standard normal distribution for a given confidence level) and <strong>CV</strong> (Coefficient of Variation) are combined into a flat 20% risk margin.</li>
          <li><strong>AE</strong> (Administrative Expenses) and <strong>CC</strong> (Cost of Capital) are simplified into a base fee and a percentage of the premium.</li>
          <li>The cost of the satellite is an average and can vary significantly.</li>
        </ul>
      </div>

      <div className="subsection advice">
        <h3>Advice for Satellite Operators: Dodging Geomagnetic Storms</h3>
        <p><strong>Use Thrusters to Mitigate Solar Storm Effects:</strong></p>
        <p>Geomagnetic storms, caused by solar flares and coronal mass ejections, can pose a significant threat to satellites. The increased solar radiation can damage sensitive electronics and increase atmospheric drag, causing orbital decay. To counter this:</p>
        <ul>
            <li><strong>Early Warning Systems:</strong> Monitor space weather forecasts from agencies like NOAA's Space Weather Prediction Center.</li>
            <li><strong>Orbital Adjustments:</strong> When a storm is predicted, use onboard thrusters to perform small orbital maneuvers. A slight increase in altitude can help to avoid the densest part of the upper atmosphere that expands during a storm, reducing drag.</li>
            <li><strong>Safe Mode:</strong> Place the satellite in a 'safe mode' to protect sensitive electronic components from radiation damage. This may involve shutting down non-essential systems and reorienting the satellite to shield vulnerable parts.</li>
        </ul>
      </div>
    </div>
  );
};

export default Satellite;
