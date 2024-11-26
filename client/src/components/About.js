// src/components/About.js
import React from "react";
import "../styles/style.css";
import bgImage from "../img/img_bg_1.jpg"; // Import the background image for the header
import CoupleInfo from "./CoupleInfo";
import Timeline from "./Timeline";

const About = () => {
  // Function to handle "Save the Date" functionality
  const handleSaveTheDate = () => {
    // Define the content for the calendar invite with proper formatting
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
    ].join("\r\n"); // Use CRLF line endings as required by the iCalendar standard

    // Create a Blob and trigger the download
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "christina-anthony-wedding.ics"; // Set the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Cleanup
  };

  return (
    <div id="page">
      {/* Header Section */}
      <header
        id="fh5co-header"
        className="fh5co-cover"
        role="banner"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-stellar-background-ratio="0.5"
      >
        <div className="overlay"></div>
        <div className="container">
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
                      color: "#fff",
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
                        color: "#9c0044", // Text color
                        padding: "10px 20px",
                        fontSize: "16px",
                        border: "none",
                        backgroundColor: "rgba(156, 0, 68, 0.5)", // Translucent initial color
                        cursor: "pointer",
                        borderRadius: "5px",
                        transition: "all 0.3s ease", // Smooth transitions
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(176, 0, 85, 0.7)"; // Darker hover effect
                        e.target.style.transform = "scale(1.05)"; // Slight scaling effect
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(156, 0, 68, 0.5)"; // Revert to original translucent color
                        e.target.style.transform = "scale(1)"; // Revert to original size
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
