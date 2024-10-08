// src/components/Events.js
import React from "react";
import bgImage from "../img/img_bg_3.jpg"; // Import your background image

const Events = () => {
  return (
    <div id="fh5co-event" className="fh5co-bg" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay"></div>
      <div className="container">
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
                        <span>4:00 PM</span>
                        <span>6:00 PM</span>
                      </div>
                      <div className="event-col">
                        <i className="icon-calendar"></i>
                        <span>Monday 28</span>
                        <span>November, 2025</span>
                      </div>
                    </div>
                    <p className="mt-3">
                      The main wedding ceremony will be held in a beautiful venue, surrounded by loved ones and family.
                    </p>
                  </div>
                </div>
                {/* Wedding Party */}
                <div className="col-md-6 col-sm-6 text-center">
                  <div className="event-wrap animate-box border p-3">
                    <h3>Wedding Party</h3>
                    <div className="d-flex justify-content-center">
                      <div className="event-col me-3">
                        <i className="icon-clock"></i>
                        <span>7:00 PM</span>
                        <span>12:00 AM</span>
                      </div>
                      <div className="event-col">
                        <i className="icon-calendar"></i>
                        <span>Monday 28</span>
                        <span>November, 2025</span>
                      </div>
                    </div>
                    <p className="mt-3">
                      Join us for the wedding reception and party, with music, dancing, and celebration.
                    </p>
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
