
import React from 'react';

const PowerGrids = () => {

  // Simplified premium calculation
  const calculatePremium = (cost, riskFactor) => {
    const pp = cost * riskFactor;
    const rm = pp * 0.2;
    const el = 10000 + (pp + rm) * 0.05;
    return (pp + rm + el).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div>
      <h2>Power Grid Insurance</h2>
      <div className="subsection">
        <h3>Centralised Grids</h3>
        <p>Centralised grids are the traditional model for power delivery, consisting of large-scale power plants (often using fossil fuels, nuclear, or hydro) that generate electricity. This power is then transported over a vast network of high-voltage transmission lines to substations, where it is stepped down to lower voltages for distribution to millions of consumers. The key characteristic of a centralised grid is its one-way flow of electricity, from the producer to the consumer.</p>
        <p>While this model has been incredibly effective for electrifying entire countries, its interconnected nature makes it vulnerable to widespread outages. A single point of failure, whether it's a major power plant going offline or a critical transmission line being damaged, can trigger a cascading effect that leads to blackouts across a large area. The complexity and age of much of the existing grid infrastructure also present significant challenges for maintenance and protection against modern threats like cyberattacks and geomagnetic storms.</p>
        <p><strong>Average Asset Value:</strong> $1,000,000,000 - $10,000,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(5500000000, 0.02)}</p>
      </div>
      <div className="subsection">
        <h3>Microgrids</h3>
        <p>Microgrids are smaller, self-contained power grids that can operate either connected to the main grid or independently in "island mode." They often serve a specific local area, such as a university campus, hospital, industrial park, or military base. A microgrid has its own local power generation resources, which can include a mix of traditional generators and renewable sources like solar panels and wind turbines, as well as energy storage systems like batteries.</p>
        <p>The primary advantage of a microgrid is its ability to enhance reliability. By disconnecting from the main grid during an outage, a microgrid can continue to provide power to its local area, ensuring that critical services remain operational. This makes them particularly valuable for facilities that cannot afford to lose power. Microgrids also facilitate the integration of renewable energy and can improve the efficiency and stability of the broader electrical grid.</p>
        <p><strong>Average Asset Value:</strong> $10,000,000 - $100,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(55000000, 0.01)}</p>
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
          <li>The `riskFactor` is a simplified representation of the probability and expected loss from events like geomagnetic storms.</li>
          <li>The risk margin and expense loading are based on simplified percentages.</li>
          <li>The asset value of the grid is an estimated average.</li>
        </ul>
      </div>

      <div className="subsection advice">
        <h3>Advice for Power Grid Operators: Mitigating Geomagnetic Storms</h3>
        <p><strong>Beware of Geomagnetically Induced Currents (GIC):</strong></p>
        <p>Geomagnetic storms can induce quasi-DC currents in high-voltage power lines, known as GICs. These currents can flow into transformers, causing them to overheat and potentially leading to widespread blackouts and permanent damage.</p>
        <ul>
            <li><strong>Real-time Monitoring:</strong> Install real-time GIC monitoring systems on critical transformers to get early warnings of dangerous current levels.</li>
            <li><strong>Operational Procedures:</strong> During a severe storm, grid operators can take proactive steps like reducing the load on susceptible transformers or temporarily disconnecting them to prevent damage.</li>
            <li><strong>Grid Hardening:</strong> Invest in GIC-blocking devices, such as series capacitors or neutral grounding resistors, to protect vulnerable transformers from the harmful effects of GICs.</li>
        </ul>
      </div>
    </div>
  );
};

export default PowerGrids;
