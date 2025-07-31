import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Leaf, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero" style={{ padding: '3rem 1rem' }}>
        <div className="hero-content">
          <h1>About Bark & Beyond Tech</h1>
          <p>
            Born from a love for dogs and innovation, we're dedicated to creating smart, safe, and sustainable products for pets and their families.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '1rem' }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto',
              fontStyle: 'italic'
            }}>
              "To empower dog owners with innovative, eco-friendly products that enhance the lives of pets and their families—always safe, always smart, always beyond expectations."
            </p>
          </div>

          {/* Values Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '2px solid #e0e7ff'
            }}>
              <Zap size={48} style={{ color: '#4f46e5', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#4f46e5', marginBottom: '1rem' }}>Smart Innovation</h3>
              <p style={{ color: '#6b7280' }}>
                We leverage cutting-edge technology to create products that make pet care easier, more efficient, and more enjoyable for both pets and their owners.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '2px solid #dcfce7'
            }}>
              <Leaf size={48} style={{ color: '#059669', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#059669', marginBottom: '1rem' }}>Eco-Friendly</h3>
              <p style={{ color: '#6b7280' }}>
                Sustainability is at the heart of everything we do. We use environmentally responsible materials and manufacturing processes to protect our planet.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '2px solid #fee2e2'
            }}>
              <Shield size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Safety First</h3>
              <p style={{ color: '#6b7280' }}>
                Every product is rigorously tested to ensure it's safe for pets, children, and families. Your peace of mind is our top priority.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '2px solid #fef3c7'
            }}>
              <Heart size={48} style={{ color: '#d97706', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#d97706', marginBottom: '1rem' }}>Pet-Centered</h3>
              <p style={{ color: '#6b7280' }}>
                We understand that pets are family. Every product is designed with your pet's comfort, happiness, and well-being in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1.5rem' }}>
                Our Story
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.6' }}>
                Bark & Beyond Tech was founded by Tracy, a passionate pet owner and tech enthusiast studying at Pursuit in Queens. 
                After experiencing firsthand the challenges of finding high-quality, safe, and innovative products for her beloved pets, 
                Tracy decided to create a company that would bridge the gap between technology and pet care.
              </p>
              <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.6' }}>
                What started as a simple idea has grown into a mission to revolutionize the pet industry. We believe that our furry 
                friends deserve the best, and that technology can help us provide it while being mindful of our environmental impact.
              </p>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Today, we're proud to offer a curated selection of smart, safe, and sustainable products that enhance the bond 
                between pets and their families. Every product we sell reflects our commitment to quality, innovation, and responsibility.
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '3rem',
              borderRadius: '1rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Why We Do What We Do</h3>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐕❤️</div>
              <p style={{ opacity: 0.9, lineHeight: '1.6' }}>
                Because every tail wag, every purr, and every moment of joy our pets bring us deserves to be celebrated 
                with products that are as special as they are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', color: '#1f2937', textAlign: 'center', marginBottom: '3rem' }}>
            What We Offer
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              background: '#f8fafc',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ color: '#4f46e5', marginBottom: '1rem' }}>Smart Tech Products</h3>
              <p style={{ color: '#6b7280' }}>
                GPS trackers, smart feeders, interactive toys, and other innovative solutions that use technology to improve pet care.
              </p>
            </div>
            
            <div style={{
              padding: '2rem',
              background: '#f8fafc',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
              <h3 style={{ color: '#059669', marginBottom: '1rem' }}>Eco-Friendly Accessories</h3>
              <p style={{ color: '#6b7280' }}>
                Biodegradable waste bags, bamboo bowls, organic toys, and other sustainable products that are kind to the planet.
              </p>
            </div>
            
            <div style={{
              padding: '2rem',
              background: '#f8fafc',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦺</div>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Safety Products</h3>
              <p style={{ color: '#6b7280' }}>
                LED collars and leashes, reflective gear, and other products designed to keep your pets safe and visible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Have questions about our products or want to share your pet's story? We'd love to hear from you!
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            <a
              href="mailto:tracy@barkandbeyondtech.com"
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '1rem 2rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'background-color 0.3s ease'
              }}
            >
              📧 Email Us
            </a>
            
            <Link
              to="/products"
              style={{
                color: '#4f46e5',
                background: 'white',
                textDecoration: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'transform 0.3s ease'
              }}
            >
              🛍️ Shop Now
            </Link>
          </div>
          
          <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>
            Based in Queens, NY • Serving pet families everywhere
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;