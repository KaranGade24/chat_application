import React, { useState } from "react";
import styles from "./Signup.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const name = useRef("");
  const email = useRef("");
  const password = useRef("");

  const onSignup = async (user) => {
    try {
      // Make a POST request to the backend for registration
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: user.name,
          email: user.email,
          password: user.password,
        },
        { withCredentials: true }
      );
      if (res.status === 201) {
        const doc = res.data;
        toast.success("Signup successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light", // or "dark", "colored"
          newestOnTop: true,
          pauseOnFocusLoss: true,
          rtl: false, // for right-to-left languages
          icon: true, // or pass a custom icon component
          role: "alert", // for accessibility
        });
        localStorage.setItem("user", JSON.stringify(doc));
        navigate("/app");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      toast.error("Signup failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light", // or "dark", "colored"
        newestOnTop: true,
        pauseOnFocusLoss: true,
        rtl: false, // for right-to-left languages
        icon: true, // or pass a custom icon component
        role: "alert", // for accessibility
      });
      return;
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Replace with actual signup logic
    if (
      !name.current.value ||
      !email.current.value ||
      !password.current.value
    ) {
      toast.info("Please fill in all fields");
      return;
    }
    const user = {
      name: name.current.value,
      email: email.current.value,
      password: password.current.value,
    };
    onSignup(user);
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
            ref={name}
            className={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            className={styles.input}
            ref={email}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className={styles.input}
            required
            minLength={6}
            ref={password}
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
