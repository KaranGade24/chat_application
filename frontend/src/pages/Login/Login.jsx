import React, { useContext, useRef } from "react";
import styles from "./Login.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import MessageContext from "../../store/Messages/MessageContext";
import { toast, ToastContainer } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

const Login = () => {
  const { setUser, setLoading, loading } = useContext(MessageContext); // Assuming you have a context to set the user
  const navigate = useNavigate();

  const onLogin = async (user) => {
    try {
      setLoading(true); // Set loading state to true
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email: user.email,
          password: user.password,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        const doc = res.data;
        toast.success("Login successful!", {
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
        setUser(doc.user);
        navigate("/app");
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(
        "Login failed. Please check your credentials and try again.",
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
      setUser(null); // Clear user state on error
      return;
    } finally {
      setLoading(false); // Set loading state to false after the request
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
      email: email.current.value,
      password: password.current.value,
    };
    // Call the onLogin prop with the user data
    onLogin(user);
  };

  return (
    <>
      <div className={styles.loginWrapper}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className={styles.loginCard}>
          <h2 className={styles.title}>Welcome Back 👋</h2>
          <p className={styles.subtitle}>Sign in to your chat account</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="Email"
              ref={email}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              ref={password}
              className={styles.input}
              required
            />
            <button
              disabled={loading ? true : false}
              type="submit"
              className={styles.button}
            >
              {loading ? (
                <FaSpinner className={loading ? styles.spinner : ""} />
              ) : (
                "Login"
              )}
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
    </>
  );
};

export default Login;
