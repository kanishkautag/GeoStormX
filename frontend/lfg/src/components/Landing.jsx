import './Landing.css';
import earthVideo from '../assets/earth.mp4';
import geo from '../assets/geo.jpg'
import infra from '../assets/infra.jpg'
import { Link } from 'react-router-dom';

// No need to import images locally anymore

const Landing = () => {
  return (
    <div className="page-container">
      {/* The original content is now the "hero" section */}
      <header className="hero-container">
        <div className="content-wrapper">
          <div className="left-content">
            <h1 className="main-heading">
              Stop Guessing.
              <br />
              Start Insuring.
              <br />
            </h1>
            
            <div className="accent-line">
              <div className="purple-line"></div>
              <div className="diamond">◆</div>
            </div>
            
            <p className="description">
               Solar Storms Threaten Trillions. We Insure Against Them. Next-gen risk modeling for satellites and power grids.
            </p>
            
<Link to="/dashboard" className="join-button">Dashboard</Link>        
  </div>
          
          <div className="right-content">
            <div className="video-container">
              <video 
                className="earth-video"
                autoPlay 
                loop 
                muted
                playsInline
              >
                <source src={earthVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </header>

      {/* --- NEW SECTIONS START HERE --- */}
      <main>
        <section className="info-section image-left">
          <div className="info-image-wrapper">
            {/* Using a placeholder image from the web */}
            <img 
              src={geo} 
              alt="space nebula explaination" 
              className="info-image" 
            />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">What Are Geomagnetic Storms?</h2>
            <div className="accent-line">
              <div className="purple-line"></div>
              <div className="diamond">◆</div>
            </div>
            <p className="info-description">
              Geomagnetic storms are major disturbances of Earth's magnetosphere that occur when there is a very efficient exchange of energy from the solar wind into the space environment surrounding Earth. These storms can disrupt global communications and damage critical infrastructure.
            </p>
          </div>
        </section>

        <section className="info-section image-right">
          <div className="info-image-wrapper">
            {/* Using a placeholder image from the web */}
            <img 
              src={infra}
              alt="Satellite orbiting Earth" 
              className="info-image" 
            />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">Protecting Critical Infrastructure</h2>
            <div className="accent-line">
              <div className="purple-line"></div>
              <div className="diamond">◆</div>
            </div>
            <p className="info-description">
              Our proprietary risk models analyze real-time solar activity and assess the vulnerability of specific assets. We provide parametric insurance products for satellite operators and power grid managers, ensuring rapid payouts when a solar event impacts your operations.
            </p>
          </div>
        </section>
        <section className="info-section image-left">
          <div className="info-image-wrapper">
            {/* Using a placeholder image from the web */}
            <img 
              src={geo} 
              alt="space nebula explaination" 
              className="info-image" 
            />
          </div>
          <div className="info-text-wrapper">
            <h2 className="info-title">What Are Kp, IMF Bz, Solar Wind Speed and Proton Flux?</h2>
            <div className="accent-line">
              <div className="purple-line"></div>
              <div className="diamond">◆</div>
            </div>
            <p className="info-description">
              Geomagnetic storms are major disturbances of Earth's magnetosphere that occur when there is a very efficient exchange of energy from the solar wind into the space environment surrounding Earth. These storms can disrupt global communications and damage critical infrastructure.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;