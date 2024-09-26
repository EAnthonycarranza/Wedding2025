// src/components/CoupleInfo.js
import React from "react";
import groomImage from "../img/groom.jpg";
import brideImage from "../img/bride.jpg";

const CoupleInfo = () => {
  return (
    <div id="fh5co-couple" className="fh5co-section-gray">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-md-offset-2 text-center fh5co-heading animate-box">
            <h2>Hello!</h2>
            <h3>June 27th, 2025</h3>
            <p>We invited you to celebrate our wedding</p>
            <p>
              13435 West Ave<br />
              San Antonio, TX 78216<br />
              United States
            </p>
          </div>
        </div>
        <div className="couple-wrap animate-box">
          <div className="couple-half">
            <div className="groom">
              <img src={groomImage} alt="groom" className="img-responsive" />
            </div>
            <div className="desc-groom">
              <h3>Eduardo Antonio</h3>
              <p>
                Anthony is a kind-hearted man of faith from San Antonio, dedicated to his family and music. He's excited to begin this journey with Christina.
              </p>
            </div>
          </div>
          <p className="heart text-center">
            <i className="icon-heart2"></i>
          </p>
          <div className="couple-half">
            <div className="bride">
              <img src={brideImage} alt="bride" className="img-responsive" />
            </div>
            <div className="desc-bride">
              <h3>Christina Kyara</h3>
              <p>
                Christina, from San Antonio, is a joyful spirit with a love for worship and family. She’s thrilled to marry Anthony.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupleInfo;
