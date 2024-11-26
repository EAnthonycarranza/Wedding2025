// src/components/About.js
import React from "react";
import "../styles/style.css";
import CoupleInfo from "./CoupleInfo";
import Timeline from "./Timeline";

const About = () => {
  // Function to handle "Save the Date" functionality
  const handleSaveTheDate = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "SUMMARY:Christina & Anthony's Wedding",
      "DTSTART;TZID=America/Chicago:20250628T110000",
      "DTEND;TZID=America/Chicago:20250628T140000",
      "LOCATION:13435 West Ave, San Antonio TX 78216-2006, United States",
      "DESCRIPTION:Join us to celebrate the wedding of Christina and Anthony!",
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: Christina & Anthony's Wedding",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "christina-anthony-wedding.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div id="page">
      {/* Header Section */}
      <header
        id="fh5co-header"
        className="fh5co-cover"
        role="banner"
        style={{
          position: "relative",
          backgroundImage: `url(https://storage.googleapis.com/galleryimageswedding/img_bg_1.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
        }}
        data-stellar-background-ratio="0.5"
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

        {/* Text Container */}
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 2, // Ensure text is above the overlay
            color: "#fff",
          }}
        >
          <div className="row">
            <div className="col-md-8 col-md-offset-2 text-center">
              <div className="display-t">
                <div
                  className="display-tc animate-box"
                  data-animate-effect="fadeIn"
                >
                  <h1>Christina &amp; Anthony</h1>
                  <h2
                    style={{
                      fontFamily: "'Sacramento', cursive",
                      fontSize: "2.5rem",
                    }}
                  >
                    We Are Getting Married
                  </h2>
                  <div className="simply-countdown simply-countdown-one"></div>
                  <p>
                    {/* Save the Date Button */}
                    <button
                      onClick={handleSaveTheDate}
                      className="btn btn-default btn-sm"
                      style={{
                        color: "#9c0044",
                        padding: "10px 20px",
                        fontSize: "16px",
                        border: "none",
                        backgroundColor: "rgba(156, 0, 68, 0.5)",
                        cursor: "pointer",
                        borderRadius: "5px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(176, 0, 85, 0.7)";
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(156, 0, 68, 0.5)";
                        e.target.style.transform = "scale(1)";
                      }}
                      aria-label="Save the date for Christina & Anthony's wedding"
                    >
                      Save the date
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Couple Info Section */}
      <CoupleInfo />

      {/* Timeline Section */}
      <Timeline />
    </div>
  );
};

export default About;
