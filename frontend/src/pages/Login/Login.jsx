import React, { useRef } from "react";
import styles from "./Login.module.css";
import { Navigate, NavLink } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = Navigate();
  const onLogin = async (user) => {
    try {
      const res = await axios.post("/api/login", {
        email: user.email,
        password: user.password,
      });
      if (res.ok) {
        const userData = res.data;
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/app/chat");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please check your credentials and try again.");
      return;
    }
  };
  const email = useRef("");
  const password = useRef("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.current || !password.current) {
      alert("Please fill in all fields");
      return;
    }
    // Simulate a login process
    const user = {
      email: email.current,
      password: password.current,
    };
    // Call the onLogin prop with the user data
    onLogin(user);
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Welcome Back 👋</h2>
        <p className={styles.subtitle}>Sign in to your chat account</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email.current}
            ref={email}
            // onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password.current}
            ref={password}
            // onChange={(e) => password.current =  (e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
        <p className={styles.footerText}>
          Don't have an account? <NavLink to="/signup">Create one</NavLink>
        </p>
        {/* <p className={styles.footerText}>
          Forgot password? <a href="#">Reset</a>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
