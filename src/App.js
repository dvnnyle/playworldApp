import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./comp/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Sorlandet from "./pages/parks/Sorlandet.jsx";
import Triaden from "./pages/parks/Triaden.jsx";
import BookingPage from "./pages/BookingPage";
import Products from "./shop/Products";
import CreateUser from "./user/CreateUser";
import LogIn from "./user/LogIn";
import Profile from "./user/Profile";
import MyCart from "./shop/MyCart";
import PaymentReturn from "./shop/PaymentReturn";
import News from "./pages/News/News.jsx";
import NewsForm from "./pages/News/NewsForm";
import Settings from "./user/SettingsTabs/Settings";
import Tickets from "./TicketSystem/Tickets";
import Support from "./user/SettingsTabs/Support";
import Orders from "./user/SettingsTabs/Orders"; // <-- Add this line
import Koupons from "./user/SettingsTabs/koupons"; // Add this import

import Admin from "./console/admin";
import CustomerOrderList from "./console/CustomerOrderList";
import AdminCoupons from "./console/adminCoupons"; // Add this import
import AdminLogin from "./console/adminLogin"; // Add this import
import Prompter, { usePwaPrompt } from "./comp/prompter"; // <-- Import your modal

import PageTransition from "./comp/PageTransition";

function AnimatedRoutes() {
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/NewsForm"
          element={
            <PageTransition>
              <NewsForm />
            </PageTransition>
          }
        />


        <Route
          path="/News"
          element={
            <PageTransition>
              <News />
            </PageTransition>
          }
        />
        {/* Add the login page route below */}
        <Route
          path="/adminlogin"
          element={
            <PageTransition>
              <AdminLogin />
            </PageTransition>
          }
        />
        <Route
          path="/PaymentReturn"
          element={
            <PageTransition>
              <PaymentReturn />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/sorlandet"
          element={
            <PageTransition>
              <Sorlandet />
            </PageTransition>
          }
        />
              <Route
          path="/triaden"
          element={
            <PageTransition>
              <Triaden />
            </PageTransition>
          }
        />
        <Route
          path="/BookingPage"
          element={
            <PageTransition>
              <BookingPage />
            </PageTransition>
          }
        />
        <Route
          path="/Products"
          element={
            <PageTransition>
              <Products />
            </PageTransition>
          }
        />
        <Route
          path="/CreateUser"
          element={
            <PageTransition>
              <CreateUser />
            </PageTransition>
          }
        />
        <Route
          path="/LogIn"
          element={
            <PageTransition>
              <LogIn />
            </PageTransition>
          }
        />
        <Route
          path="/MyCart"
          element={
            <PageTransition>
              <MyCart />
            </PageTransition>
          }
        />
        <Route
          path="/Profile"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path="/Settings"
          element={
            <PageTransition>
              <Settings />
            </PageTransition>
          }
        />
        <Route
          path="/tickets"
          element={
            <PageTransition>
              <Tickets />
            </PageTransition>
          }
        />
        <Route
          path="/Orders"
          element={
            <PageTransition>
              <Orders />
            </PageTransition>
          }
        />
        <Route
          path="/support"
          element={
            <PageTransition>
              <Support />
            </PageTransition>
          }
        />
        <Route
          path="/koupons"
          element={
            <PageTransition>
              <Koupons />
            </PageTransition>
          }
        />
        <Route
          path="/customer-orders/:userId"
          element={
            <PageTransition>
              <CustomerOrderList />
            </PageTransition>
          }
        />
        <Route
          path="/admin"
          element={
            <PageTransition>
              <Admin />
            </PageTransition>
          }
        />
        <Route
          path="/admincoupons"
          element={
            <PageTransition>
              <AdminCoupons />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { showPrompt, handleInstall, handleClose } = usePwaPrompt();

  return (
    <Router>
      <Navbar />
      <Prompter show={showPrompt} onInstall={handleInstall} onClose={handleClose} />
      
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
