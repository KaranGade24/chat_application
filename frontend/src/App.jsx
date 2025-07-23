import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
function App() {
  return (
    <div className="app">
      <SideBar />
      <div className="main">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

export default App;
