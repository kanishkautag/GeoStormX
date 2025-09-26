
import React from 'react';

const Aviation = () => {

  // Simplified premium calculation
  const calculatePremium = (cost, riskFactor) => {
    const pp = cost * riskFactor;
    const rm = pp * 0.2;
    const el = 10000 + (pp + rm) * 0.05;
    return (pp + rm + el).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div>
      <h2>Aviation Insurance</h2>
      <div className="subsection">
        <h3>Airbus A320</h3>
        <p>The Airbus A320 family is a cornerstone of modern aviation, representing one of the most successful and widely used families of commercial passenger aircraft. These narrow-body airliners are renowned for their operational efficiency, advanced technology, and passenger comfort. The A320 was a pioneer in the use of digital fly-by-wire flight control systems in a commercial aircraft. This technology replaces conventional manual flight controls with an electronic interface, which provides improved handling, enhanced safety through flight envelope protection, and reduced pilot workload.</p>
        <p>The versatility of the A320 family, which includes the A318, A319, A320, and A321, makes it suitable for a wide range of routes, from short-haul domestic flights to longer international journeys. Its fuel efficiency and reliability have made it a favorite among airlines worldwide, from low-cost carriers to major international airlines. The continuous innovation in the A320neo (new engine option) series, with its more efficient engines and aerodynamic improvements, ensures that the A320 family will remain a key player in the aviation industry for years to come.</p>
        <p><strong>Average Cost of an A320:</strong> $100,000,000</p>
        <p><strong>Estimated Insurance Premium:</strong> {calculatePremium(100000000, 0.015)}</p>
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
          <li>The `riskFactor` is a simplified representation of various risks, including those from events like geomagnetic storms.</li>
          <li>The risk margin and expense loading are based on simplified percentages.</li>
          <li>The cost of the aircraft is an estimated average.</li>
        </ul>
      </div>

      <div className="subsection advice">
        <h3>Advice for Aviation: Navigating Geomagnetic Storms</h3>
        <p><strong>Mitigating Risks from Geomagnetic Storms in Aviation:</strong></p>
        <p>While passengers are safe from the direct effects of a geomagnetic storm, the event can impact aircraft systems and operations, particularly for flights on polar routes.</p>
        <ul>
            <li><strong>Communication and Navigation:</strong> Geomagnetic storms can disrupt high-frequency (HF) radio communications and satellite-based navigation systems (like GPS). Airlines should have contingency plans to use alternative communication methods and navigation procedures.</li>
            <li><strong>Rerouting Flights:</strong> For flights planned on polar routes, which are more susceptible to the effects of geomagnetic storms, airlines may reroute aircraft to lower latitudes to avoid the regions of greatest impact.</li>
            <li><strong>Radiation Exposure:</strong> At high altitudes, particularly on polar routes, there can be increased levels of radiation during a geomagnetic storm. While the increase is generally small, flight crews and frequent flyers may be exposed to slightly higher levels. Rerouting flights helps to mitigate this as well.</li>
        </ul>
      </div>
    </div>
  );
};

export default Aviation;
