import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./comp/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Sor from "./pages/Sor";
import BookingPage from "./pages/BookingPage";
import Products from "./shop/Products";
import CreateUser from "./user/CreateUser";
import LogIn from "./user/LogIn";
import Profile from "./user/Profile";
import MyCart from "./shop/MyCart";
import PaymentReturn from "./shop/PaymentReturn";
import News from "./pages/News/News.jsx";
import NewsForm from "./pages/News/NewsForm";



import ProductPage from "./ProductPage"
import PageTransition from "./comp/PageTransition";

function AnimatedRoutes() {
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
        
          path="/ProductPage"
          element={
            <PageTransition>
              <ProductPage />
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
          path="/sor"
          element={
            <PageTransition>
              <Sor />
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



      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
