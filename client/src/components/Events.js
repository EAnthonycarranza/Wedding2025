// src/components/Events.js
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa"; // Import map marker icon

const Events = () => {
  return (
    <div
      id="fh5co-event"
      className="fh5co-bg"
      style={{
        backgroundImage: `url("https://theclubatgardenridge.com/wp-content/uploads/2023/01/garden_ridge_watercolor_map.webp")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Semi-transparent Overlay */}
      <div
        className="overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Lighter overlay for the map
          zIndex: 1,
        }}
      ></div>

      {/* Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2, // Ensure content is above the overlay
        }}
      >
        <div className="row">
          <div className="col-md-8 offset-md-2 text-center fh5co-heading animate-box">
            <span style={{ color: "#323232" }}>Our Special Events</span>
            <h2 style={{ color: "#323232" }}>Wedding Events</h2>
          </div>
        </div>
        <div className="row">
          <div className="d-flex justify-content-center">
            <div className="col-md-10">
              <div className="row">
                {/* Main Ceremony */}
                <div className="col-md-6 col-sm-6 text-center">
                  <div className="event-wrap animate-box border p-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderColor: "#ddd" }}>
                    <h3 style={{ color: "#323232", borderBottomColor: "rgba(0,0,0,0.1)" }}>Main Ceremony</h3>
                    <div className="d-flex justify-content-center">
                      <div className="event-col me-3">
                        <i className="icon-clock" style={{ color: "#F14E95" }}></i>
                        <span style={{ color: "#323232" }}>2:00 PM</span>
                      </div>
                      <div className="event-col">
                        <i className="icon-calendar" style={{ color: "#F14E95" }}></i>
                        <span style={{ color: "#323232" }}>Saturday 28</span>
                        <span style={{ color: "#323232" }}>June, 2025</span>
                      </div>
                    </div>
                    <p className="mt-3" style={{ color: "#323232" }}>
                      The main wedding ceremony will be held at First Assembly of God San Antonio.
                    </p>
                    {/* Directions Icon */}
                    <a
                      href="https://maps.app.goo.gl/2hnMFKR5gGK7aSRg9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn directions-btn d-inline-flex align-items-center mt-2"
                    >
                      <FaMapMarkerAlt className="directions-icon" />
                      Get Directions
                    </a>
                  </div>
                </div>
                {/* Wedding Party */}
                <div className="col-md-6 col-sm-6 text-center">
                  <div className="event-wrap animate-box border p-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderColor: "#ddd" }}>
                    <h3 style={{ color: "#323232", borderBottomColor: "rgba(0,0,0,0.1)" }}>The Receiption</h3>
                    <div className="d-flex justify-content-center">
                      <div className="event-col me-3">
                        <i className="icon-clock" style={{ color: "#F14E95" }}></i>
                        <span style={{ color: "#323232" }}>5:00 PM</span>
                        <span style={{ color: "#323232" }}>10:00 PM</span>
                      </div>
                      <div className="event-col">
                        <i className="icon-calendar" style={{ color: "#F14E95" }}></i>
                        <span style={{ color: "#323232" }}>Saturday 28</span>
                        <span style={{ color: "#323232" }}>June, 2025</span>
                      </div>
                    </div>
                    <p className="mt-3" style={{ color: "#323232" }}>
                      Join us for the wedding reception and party at The Club at Garden Ridge.
                    </p>
                    {/* Directions Icon */}
                    <a
                      href="https://maps.app.goo.gl/FTLoMdF9MfTVbRJm7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn directions-btn d-inline-flex align-items-center mt-2"
                    >
                      <FaMapMarkerAlt className="directions-icon" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div> {/* End of row */}
            </div> {/* End of col-md-10 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
