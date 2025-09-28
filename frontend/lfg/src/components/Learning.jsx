import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import './Learning.css';
import image1 from '../assets/mcsim.png'
import image2 from '../assets/kpi.png'
import image3 from "../assets/image3.png";
import image4 from '../assets/sws.png'
import image5 from '../assets/sf.png'

// --- IMPORTANT ---
// Replace these placeholder URLs with your actual image imports
// Example: import image1 from '../assets/your-image-1.jpg';


const Learning = () => {
  return (
    <div className="learning-page-container">
      <div className="header">
        <div className="header-title">
            <h1><BookOpen /> Knowledge Hub</h1>
            <p>A deep dive into the science behind space weather and risk modeling.</p>
        </div>
      </div>

      <main className="learning-content-wrapper">
        {/* Monte Carlo Simulation */}
        <motion.section 
            className="info-section image-left"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="info-image-wrapper">
            <img src={image1} alt="Abstract visualization of a Monte Carlo simulation" className="info-image" />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">Monte Carlo Simulation</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              Monte Carlo simulation is a powerful computational technique that models the probability of different outcomes in a system that is difficult to predict. Instead of guessing a single outcome, it runs thousands or even millions of simulated trials, each with slightly randomized inputs. For our insurance platform, we simulate countless geomagnetic storm scenarios to build a detailed "probabilistic loss distribution." This allows us to move beyond a single premium estimate and provide a 95% confidence range, giving you a much clearer picture of the true financial risk.
            </p>
          </div>
        </motion.section>

        {/* Kp Index */}
        <motion.section 
            className="info-section image-right"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="info-image-wrapper">
            <img src={image2} alt="Graph showing Kp Index fluctuations" className="info-image" />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">Kp Index</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              Think of the Kp index as a "Richter scale" for geomagnetic storms. It's a global average that measures the disturbance of Earth's magnetic field on a scale from 0 (quiet) to 9 (extreme). The index is calculated every three hours based on data from magnetometers around the world. While it doesn't measure the solar wind directly, it's the ultimate indicator of how much our planet's shield is shaking. A higher Kp index directly correlates with more intense auroras, greater risk to satellites from atmospheric drag, and a higher likelihood of induced currents affecting power grids.
            </p>
          </div>
        </motion.section>

        {/* IMF Bz */}
        <motion.section 
            className="info-section image-left"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="info-image-wrapper">
            <img src={image3} alt="Diagram of Earth's magnetosphere and IMF Bz" className="info-image" />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">IMF Bz Component</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              The Interplanetary Magnetic Field (IMF) is the sun's magnetic field carried by the solar wind. Its most critical component is the **Bz**, which indicates its north-south direction. When the IMF Bz is pointing south (a negative value), it acts like a key that unlocks Earth's magnetosphere. It directly opposes our planet's northward-pointing magnetic field, allowing a massive and efficient transfer of energy from the solar wind. A strong, sustained, negative Bz is the single most important ingredient for fueling a powerful geomagnetic storm.
            </p>
          </div>
        </motion.section>

        {/* Solar Wind Speed */}
        <motion.section 
            className="info-section image-right"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="info-image-wrapper">
            <img src={image4} alt="Visualization of solar wind streaming from the sun" className="info-image" />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">Solar Wind Speed</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              Solar wind is a continuous stream of charged particles (mostly protons and electrons) flowing from the sun. Its speed determines the kinetic energy delivered to Earth's magnetosphere. A typical "slow" solar wind travels at around 400 km/s. However, during a high-speed stream from a coronal hole or following a Coronal Mass Ejection (CME), speeds can exceed 800 km/s. A faster wind increases the pressure on Earth's magnetic field, compressing it and intensifying the effects of a geomagnetic storm, much like a strong gust of wind hitting a sail.
            </p>
          </div>
        </motion.section>

        {/* Solar Flare */}
        <motion.section 
            className="info-section image-left"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="info-image-wrapper">
            <img src={image5} alt="An intense solar flare erupting from the sun" className="info-image" />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">Solar Flare</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              A solar flare is an enormous explosion on the sun's surface, releasing a burst of energy, light, and high-frequency radiation. The radiation travels at the speed of light, reaching Earth in about 8 minutes. Its primary impact is on our ionosphere, which can cause high-frequency radio blackouts on the sunlit side of Earth. While flares themselves are a concern, they often serve as a warning sign. The most powerful flares are frequently associated with Coronal Mass Ejections (CMEs), which are the true drivers of the most severe geomagnetic storms that arrive 1-3 days later.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Learning;