    // src/components/Header.js
    import React from "react";
    import bgImage from "../img/img_bg_2.jpg"; // Import the background image

    const Header = () => {
    return (
        <header
        id="fh5co-header"
        className="fh5co-cover"
        role="banner"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}
        data-stellar-background-ratio="0.5"
        >
        <div className="overlay"></div>
        <div className="container">
            <div className="row">
            <div className="col-md-8 col-md-offset-2 text-center">
                <div className="display-t">
                <div className="display-tc animate-box" data-animate-effect="fadeIn">
                    <h1>Christina &amp; Anthony</h1>
                    <h2>We Are Getting Married</h2>
                    <div className="simply-countdown simply-countdown-one"></div>
                    <p><a href="#" className="btn btn-default btn-sm">Save the date</a></p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </header>
    );
    };

    export default Header;
