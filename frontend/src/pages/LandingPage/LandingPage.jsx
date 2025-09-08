import React, { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import chatFlowLogo from "../../assets/logo.png"
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.landingWrapper}>
      {/* Header with Logo and Auth Buttons */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
        
          <img
          src={chatFlowLogo}
          width={70}
          height={70}
          alt="ChatFlow Logo"
          className={styles.logo}
          />
          <span className={styles.brandName}>ChatFlow</span>
        </div>
        <div className={styles.authButtons}>
          <NavLink to="/login" className={styles.loginBtn}>
            Login
          </NavLink>
          <NavLink to="/signup" className={styles.signupBtn}>
            Sign Up
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroVisual}>
            {/* Animated Chat Bubbles */}
            <svg
              width="120"
              height="90"
              viewBox="0 0 120 90"
              className={styles.heroSvg}
            >
              <defs>
                <linearGradient
                  id="bubble1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#6dd5ed" />
                  <stop offset="100%" stopColor="#4c8bf5" />
                </linearGradient>
                <linearGradient
                  id="bubble2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffb86b" />
                  <stop offset="100%" stopColor="#6dd5ed" />
                </linearGradient>
              </defs>

              <ellipse
                cx="35"
                cy="30"
                rx="25"
                ry="18"
                fill="url(#bubble1)"
                className={styles.bubble1}
              />
              <ellipse
                cx="85"
                cy="50"
                rx="28"
                ry="20"
                fill="url(#bubble2)"
                className={styles.bubble2}
              />

              {/* Chat dots */}
              <circle
                cx="28"
                cy="25"
                r="2.5"
                fill="white"
                className={styles.dot1}
              />
              <circle
                cx="35"
                cy="25"
                r="2.5"
                fill="white"
                className={styles.dot2}
              />
              <circle
                cx="42"
                cy="25"
                r="2.5"
                fill="white"
                className={styles.dot3}
              />

              <circle
                cx="78"
                cy="45"
                r="2.5"
                fill="white"
                className={styles.dot4}
              />
              <circle
                cx="85"
                cy="45"
                r="2.5"
                fill="white"
                className={styles.dot5}
              />
              <circle
                cx="92"
                cy="45"
                r="2.5"
                fill="white"
                className={styles.dot6}
              />
            </svg>
          </div>

          <h1 className={styles.heroTitle}>
            Connect <span className={styles.gradientText}>Instantly</span>
            <br />
            Chat <span className={styles.gradientText}>Seamlessly</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Experience the future of communication with our lightning-fast,
            secure, and beautifully designed chat platform.
          </p>
          <div className={styles.heroActions}>
            <NavLink
              style={{ background: "none", borderRadius: "20%" }}
              onClick={(e) => {
                e.preventDefault();
                if (!localStorage.getItem("user")) {
                  navigate("/login");
                }
                navigate("/app");
              }}
            >
              <button className={styles.primaryCta}>Start Chatting</button>
            </NavLink>
            {/* <button className={styles.secondaryCta}>Learn More</button> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose ChatFlow?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="#4c8bf5" opacity="0.1" />
                  <path
                    d="M15 25 L22 32 L35 18"
                    stroke="#4c8bf5"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Lightning Fast</h3>
              <p>
                Messages delivered instantly with our optimized real-time
                architecture.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="#6dd5ed" opacity="0.1" />
                  <rect
                    x="18"
                    y="15"
                    width="14"
                    height="20"
                    rx="2"
                    fill="none"
                    stroke="#6dd5ed"
                    strokeWidth="2"
                  />
                  <path
                    d="M22 12 L22 15 M28 12 L28 15"
                    stroke="#6dd5ed"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>
                End-to-end encryption ensures your conversations stay completely
                private.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="#ffb86b" opacity="0.1" />
                  <circle
                    cx="20"
                    cy="20"
                    r="8"
                    fill="none"
                    stroke="#ffb86b"
                    strokeWidth="2"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="8"
                    fill="none"
                    stroke="#ffb86b"
                    strokeWidth="2"
                  />
                  <path d="M25 20 L25 30" stroke="#ffb86b" strokeWidth="2" />
                </svg>
              </div>
              <h3>Group Chats</h3>
              <p>
                Create unlimited groups and channels for seamless team
                collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10M+</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50B+</div>
              <div className={styles.statLabel}>Messages Sent</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Uptime</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>150+</div>
              <div className={styles.statLabel}>Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Start Chatting?</h2>
          <p className={styles.ctaSubtitle}>
            Join millions of users who trust ChatFlow for their daily
            communication needs.
          </p>
          <NavLink
            onClick={(e) => {
              e.preventDefault();
              if (!localStorage.getItem("user")) {
                navigate("/login");
              }
              navigate("/app");
            }}
            className={styles.ctaButton}
          >
            Get Started Free
          </NavLink>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
            <img
          src={chatFlowLogo}
          width={70}
          height={70}
          alt="ChatFlow Logo"
          className={styles.logo}
          />
              <span>ChatFlow</span>
            </div>
            <p>&copy; 2025 ChatFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
