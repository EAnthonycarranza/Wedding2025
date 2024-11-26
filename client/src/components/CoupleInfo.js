// src/components/CoupleInfo.js
import React from "react";

const CoupleInfo = () => {
  return (
    <div id="fh5co-couple" className="fh5co-section-gray">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-md-offset-2 text-center fh5co-heading animate-box">
            <h2>Welcome!</h2>
            <h3>June 28th, 2025</h3>
            <p>We invited you to celebrate our wedding!</p>
          </div>
        </div>
        <div
          className="couple-wrap animate-box"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignItems: "center",
            gap: "40px", // Space between elements
          }}
        >
          <div
            className="desc-groom"
            style={{
              flex: "1 1 300px", // Flexibility for responsiveness
              textAlign: "right",
              padding: "0 20px",
            }}
          >
            <h2
              style={{
                fontFamily: "Sacramento",
                color: "#9c0044",
                fontSize: "2.5rem",
                marginBottom: "10px",
              }}
            >
              Eduardo Antonio
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.6",
              }}
            >
              Anthony is a kind-hearted man of faith from San Antonio, dedicated
              to his family and music. He's excited to begin this journey with
              Christina.
            </p>
          </div>
          <div
            className="heart"
            style={{
              flex: "0 1 auto", // Ensures icon stays centered
              textAlign: "center",
              fontSize: "3rem",
              color: "red",
            }}
          >
            <i className="icon-heart2"></i>
          </div>
          <div
            className="desc-bride"
            style={{
              flex: "1 1 300px", // Flexibility for responsiveness
              textAlign: "left",
              padding: "0 20px",
            }}
          >
            <h2
              style={{
                fontFamily: "Sacramento",
                color: "#9c0044",
                fontSize: "2.5rem",
                marginBottom: "10px",
              }}
            >
              Christina Kyara
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.6",
              }}
            >
              Christina, from San Antonio, is a joyful spirit with a love for
              worship and family. She’s thrilled to marry Anthony.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupleInfo;
