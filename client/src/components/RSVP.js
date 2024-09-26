import React from 'react';
import bgImage from '../img/img_bg_4.jpg';  // Import the background image

const RSVP = () => {
  return (
    <div id="fh5co-started" className="fh5co-bg" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay"></div>
      <div className="container">
        <div className="row animate-box">
          <div className="col-md-8 offset-md-2 text-center fh5co-heading">
            <h2>Are You Attending?</h2>
            <p>Please fill up the form to notify us that you're attending. Thanks.</p>
          </div>
        </div>
        <div className="row animate-box">
          <div className="col-md-10 offset-md-1">
            <form className="form-inline">
              <div className="col-md-4 col-sm-4">
                <div className="form-group">
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input type="text" className="form-control" id="name" placeholder="Name" />
                </div>
              </div>
              <div className="col-md-4 col-sm-4">
                <div className="form-group">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input type="email" className="form-control" id="email" placeholder="Email" />
                </div>
              </div>
              <div className="col-md-4 col-sm-4">
                <button type="submit" className="btn btn-default btn-block">I am Attending</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVP;
