import React, { useContext, useState } from "react";
import styles from "./Signup.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import MessageContext from "../../store/Messages/MessageContext";
import { FaSpinner } from "react-icons/fa";

const Signup = () => {
  const { setLoading, loading } = useContext(MessageContext);
  const navigate = useNavigate();
  const name = useRef("");
  const email = useRef("");
  const password = useRef("");
  const otp = useRef("");
  const [otpVerify, setOtpVerify] = useState(false);
  const [getOtp, setGetOtp] = useState(false);
  useEffect(() => {
    setLoading(false);
  }, []);

  const onSignup = async (user) => {
    try {
      // Make a POST request to the backend for registration
      setLoading(true);
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
      toast.error(
        err?.response?.data?.message || "Signup failed. Please try again.",
        {
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
        }
      );
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otp, email) => {
    try {
      if (!otp || !email)
        return toast.warning("Please enter OTP or email", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          otp,
          email,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setOtpVerify(true);
        toast.success("OTP verified successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (err) {
      console.error("Signup failed:", err);
      toast.error("OTP varification faild!. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetOtp = async (email) => {
    try {
      if (!email) {
        return toast.warning("Please enter email and otp", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/get-otp`,
        {
          email,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setGetOtp(true);
        toast.success("OTP sent successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setGetOtp(true);
      }
    } catch (err) {
      console.error("Error to send OTP:", err);
      toast.error("Error to send OTP. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();

    const nameVal = name.current.value?.trim();
    const emailVal = email.current.value?.trim();
    const passwordVal = password.current.value?.trim();
    const otpVal = otp.current.value?.trim();

    console.log({
      nameVal,
      emailVal,
      passwordVal,
      otpVal,
    });
    // Step 1: Request OTP
    if (nameVal && emailVal && otpVal === "" && passwordVal === "") {
      handleGetOtp(emailVal);
      return;
    }

    // Step 2: Verify OTP
    if (nameVal && emailVal && otpVal && passwordVal === "") {
      handleOtpVerify(otpVal, emailVal);
      return;
    }

    // Step 3: Final Signup
    if (nameVal && emailVal && passwordVal) {
      const user = {
        name: nameVal,
        email: emailVal,
        password: passwordVal,
      };
      onSignup(user);
      return;
    }

    // Catch-all: Missing required fields
    toast.info("Please fill in all required fields", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <div className={styles.signupWrapper}>
      <ToastContainer position="top-right" autoClose={3000} />
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
            disabled={getOtp}
          />

          <input
            type="number"
            placeholder="OTP"
            className={styles.input}
            hidden={!getOtp}
            ref={otp}
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className={styles.input}
            hidden={!otpVerify}
            minLength={6}
            ref={password}
            autoComplete="new-password"
          />

          <button
            disabled={loading}
            type="submit"
            className={styles.button}
            onClick={(e) => {
              {
                loading && e.preventDefault();
              }
            }}
          >
            {loading ? (
              <FaSpinner className={loading ? styles.spinner : ""} />
            ) : getOtp && !otpVerify ? (
              "Verify OTP"
            ) : otpVerify ? (
              "Sign Up"
            ) : (
              "Get OTP"
            )}
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
