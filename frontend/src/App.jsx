import { Outlet, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import { useContext, useEffect } from "react";
import MessageContext from "./store/Messages/MessageContext";
import FullPageLoader from "./components/FullPageLoader";
import { ToastContainer } from "react-toastify";
import Socket from "../config/Socket";

function App() {
  const { loading, user: currentUser } = useContext(MessageContext); // or any global loading logic
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) {
      return; // Prevent navigation while loading
    }
    // If user is not authenticated, redirect to login
    if (!currentUser) {
      navigate("/login");
      console.log("User not authenticated, redirecting to login");
    }
  }, [currentUser, navigate, loading]);

  return (
    <div className="app">
      {loading ? (
        <FullPageLoader />
      ) : currentUser ? (
        <>
          <ToastContainer position="top-right" autoClose={3000} />
          <SideBar />
          <div className="main">
            <Header />
            <Outlet />
          </div>
        </>
      ) : (
        // useEffect(() => {
        //   navigate("/login");
        // }, [navigate])

        <div className="unauthenticated">
          <h1>Please log in to continue</h1>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
