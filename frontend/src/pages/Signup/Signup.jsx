import React, { useState } from "react";
import styles from "./Signup.module.css";
import { NavLink } from "react-router-dom";

const Signup = ({ onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    // Replace with actual signup logic
    onSignup({ name, email, password });
  };

  return (
    <div className={styles.signupWrapper}>
      <div className={styles.signupCard}>
        <h2 className={styles.title}>Create Account 🚀</h2>
        <p className={styles.subtitle}>Join the chat and start talking</p>
        <form onSubmit={handleSignup} className={styles.form}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            minLength={6}
          />
          <button type="submit" className={styles.button}>
            Sign Up
          </button>
        </form>
        <p className={styles.footerText}>
          Already have an account? <NavLink to="/login">Login</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
