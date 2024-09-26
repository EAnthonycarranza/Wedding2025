import React from 'react';

const Story = () => {
  return (
    <div id="fh5co-couple" className="fh5co-section-gray">
      <div className="container">
        <div className="row">
          <div className="col-md-8 col-md-offset-2 text-center fh5co-heading animate-box">
            <h2>Hello!</h2>
            <h3>November 28th, 2016 New York, USA</h3>
            <p>We invited you to celebrate our wedding</p>
          </div>
        </div>
        <div className="couple-wrap animate-box">
          <div className="couple-half">
            <div className="groom">
              <img src="images/groom.jpg" alt="groom" className="img-responsive" />
            </div>
            <div className="desc-groom">
              <h3>Joefrey Mahusay</h3>
              <p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>
            </div>
          </div>
          <p className="heart text-center"><i className="icon-heart2"></i></p>
          <div className="couple-half">
            <div className="bride">
              <img src="images/bride.jpg" alt="bride" className="img-responsive" />
            </div>
            <div className="desc-bride">
              <h3>Sheila Mahusay</h3>
              <p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;
