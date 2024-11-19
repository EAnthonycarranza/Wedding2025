// src/components/Home.js
import React from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import CoupleInfo from "./CoupleInfo";
import Events from "./Events";
import Footer from "./Footer";
import Timeline from "./Timeline";
import RSVP from "./RSVP";
// import Gallery from "./Gallery";

const Home = () => {
  return (
    <div id="page">
      <Header />
      <CoupleInfo />
      <Events />
      <Timeline />
    </div>
  );
};

export default Home;
