import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, BarChart2, Zap, Cpu, Globe } from 'lucide-react';
import './About.css';
import image1 from '../assets/image1.png'
import image2 from '../assets/image22.png'
import image3 from '../assets/image3.png'

// --- IMPORTANT ---
// Replace these placeholder URLs with your actual image imports
// Example: import image1 from '../assets/your-image-1.jpg';


const About = () => {

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="about-page-container">
      
      {/* Hero Section */}
      <motion.header 
        className="about-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img src={image1} alt="Our Mission" className="hero-background-image" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="main-heading">Insuring the Future of Space & Energy</h1>
          <p className="description">
            AURA was founded to address a critical, multi-trillion dollar vulnerability in our modern world: the threat of space weather to our most vital infrastructure.
          </p>
        </div>
      </motion.header>

      <main className="about-content-wrapper">
        
        {/* Our Story Section */}
        <section className="about-section text-and-image">
          <motion.div 
            className="about-text-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="info-title">From Uncertainty to Assurance</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              For decades, the risk from geomagnetic storms has been a known but poorly quantified threat. Existing insurance models were inadequate, leaving satellite operators and power grid managers exposed to catastrophic financial loss with little recourse. We started AURA to bridge this gap. Our intention is to replace ambiguity with data-driven certainty, providing a financial shield against the unpredictable power of the sun.
            </p>
          </motion.div>
          <motion.div 
            className="about-image-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img src={image2} alt="Advanced data modeling visualization" className="info-image" />
          </motion.div>
        </section>
        
        {/* Features Section */}
        <section className="about-section features-section">
            <h2 className="info-title centered">Our Technological Edge</h2>
            <motion.div 
              className="features-grid"
              variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
                <motion.div className="feature-card" variants={featureVariants}>
                    <Zap className="feature-icon" />
                    <h3>Real-time Forecasting</h3>
                    <p>We ingest live space-weather data to provide actionable 24-72 hour forecasts on geomagnetic storm intensity.</p>
                </motion.div>
                <motion.div className="feature-card" variants={featureVariants}>
                    <Cpu className="feature-icon" />
                    <h3>Proprietary AI Models</h3>
                    <p>Our machine learning algorithms translate complex solar phenomena into precise, asset-specific risk probabilities.</p>
                </motion.div>
                <motion.div className="feature-card" variants={featureVariants}>
                    <BarChart2 className="feature-icon" />
                    <h3>Probabilistic Analysis</h3>
                    <p>Understand the full range of potential financial outcomes with our detailed loss distribution models.</p>
                </motion.div>
            </motion.div>
        </section>

        {/* Why Trust Us Section */}
        <section className="about-section text-and-image reverse">
          <motion.div 
            className="about-text-content"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="info-title">Why Trust AURA?</h2>
            <div className="accent-line"><div className="purple-line"></div><div className="diamond">◆</div></div>
            <p className="info-description">
              Trust is paramount in insurance. We build it through transparency, accuracy, and a commitment to cutting-edge science. Our models are rigorously back-tested against historical data, and our parametric approach ensures that payouts are triggered automatically by verifiable event metrics, not lengthy damage assessments. We provide the clear, quantifiable data you need to make informed decisions and protect your assets with confidence.
            </p>
          </motion.div>
          <motion.div 
            className="about-image-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img src={image3} alt="Global satellite coverage network" className="info-image" />
          </motion.div>
        </section>

      </main>
    </div>
  );
};

export default About;