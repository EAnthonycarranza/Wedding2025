// src/components/Events.js
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa"; // Import map marker icon

const Events = () => {
  return (
    <div
      id="fh5co-event"
      className="fh5co-bg"
      style={{
        backgroundImage: `url(https://storage.googleapis.com/galleryimageswedding/img_bg_3.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
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
            <span>Our Special Events</span>
            <h2>Wedding Events</h2>
          </div>
        </div>
        <div className="row">
          <div className="d-flex justify-content-center">
            <div className="col-md-10">
              <div className="row">
                {/* Main Ceremony */}
                <div className="col-md-6 col-sm-6 text-center">
                  <div className="event-wrap animate-box border p-3">
                    <h3>Main Ceremony</h3>
                    <div className="d-flex justify-content-center">
                      <div className="event-col me-3">
                        <i className="icon-clock"></i>
                        <span>1:00 PM</span>
                        <span>2:00 PM</span>
                      </div>
                      <div className="event-col">
                        <i className="icon-calendar"></i>
                        <span>Saturday 28</span>
                        <span>June, 2025</span>
                      </div>
                    </div>
                    <p className="mt-3">
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
                  <div className="event-wrap animate-box border p-3">
                    <h3>The Receiption</h3>
                    <div className="d-flex justify-content-center">
                      <div className="event-col me-3">
                        <i className="icon-clock"></i>
                        <span>4:00 PM</span>
                        <span>10:00 PM</span>
                      </div>
                      <div className="event-col">
                        <i className="icon-calendar"></i>
                        <span>Saturday 28</span>
                        <span>June, 2025</span>
                      </div>
                    </div>
                    <p className="mt-3">
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
