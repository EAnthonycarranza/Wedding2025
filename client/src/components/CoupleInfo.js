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
            justifyContent: "space-between",
            gap: "40px", // Adjusts space between groom, heart, and bride
            alignItems: "center",
          }}
        >
          {/* Groom Section */}
          <div
            className="desc-groom"
            style={{
              flex: 1,
              textAlign: "right",
              paddingRight: "40px",
            }}
          >
            <img
              src="https://storage.googleapis.com/galleryimageswedding/6.jpg"
              alt="Groom"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "15px",
                border: "4px solid #ddd",
              }}
            />
            <h2
              style={{
                fontFamily: "Sacramento",
                color: "#323232",
              }}
            >
              Eduardo Antonio
            </h2>
            <p>
              Anthony is a kind-hearted man of faith from San Antonio, dedicated
              to his family and music. He's excited to begin this journey with
              Christina.
            </p>
          </div>

          {/* Heart Icon */}
          <div
            className="heart"
            style={{
              flex: 0,
              textAlign: "center",
              margin: "0 20px",
              color: "red",
            }}
          >
            <i className="icon-heart2"></i>
          </div>

          {/* Bride Section */}
          <div
            className="desc-bride"
            style={{
              flex: 1,
              textAlign: "left",
              paddingLeft: "40px",
            }}
          >
            <img
              src="https://storage.googleapis.com/galleryimageswedding/10.jpg"
              alt="Bride"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "center 20%", // Moves image up and zooms in slightly
                marginBottom: "15px",
                border: "4px solid #ddd",
              }}
            />
            <h2
              style={{
                fontFamily: "Sacramento",
                color: "#323232",
              }}
            >
              Christina Kyara
            </h2>
            <p>
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
