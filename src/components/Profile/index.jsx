import React, { useEffect, useState } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { clerk, loadClerk } from "../../LoginRegister/clerk";

const Profile = ({
  profileName,
  accountText,
  roleText,
  imageUrl,
  profileItems = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState();
  const navigate = useNavigate();
  const [bgColor, setBgColor] = useState("");

  const colorsForWhiteFont = [
    "#B71C1C", // Dark Red
    "#0D47A1", // Dark Blue
    "#1B5E20", // Dark Green
    "#F57F17", // Dark Yellow
    "#E65100", // Dark Orange
    "#4A148C", // Dark Purple
    "#880E4F", // Dark Pink
    "#3E2723", // Dark Brown
    "#424242", // Dark Gray
    "#006064", // Dark Cyan
    "#004D40", // Dark Teal
    "#827717", // Dark Lime
    "#1A237E"  // Dark Indigo
  ];
  
  const getFixedDarkColor = (letter) => {
    const uppercaseLetter = letter.toUpperCase();
    const alphabetPosition = uppercaseLetter.charCodeAt(0) - 65;
    const colorIndex = alphabetPosition % colorsForWhiteFont.length;
    return colorsForWhiteFont[colorIndex];
  };
  
  const setColorByLetter = (letter) => {
    const darkColor = getFixedDarkColor(letter);
    setBgColor(darkColor);
  };

  const getUserDetails = async () => {
    try {
      await loadClerk();
      const user = await clerk.user;
      console.log("useruser", user);
      if(!user){
        navigate("/sign-in");
        return;
      }
      setUserDetails(user);
      setColorByLetter(user?.firstName?.charAt(0).toUpperCase());
    } catch (error) {
      console.log({ error });
      navigate("/sign-in");
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <div
      className="profile-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="profile-nav">
        <div className="profile-avatar" style={{"background":bgColor}}>
          {
              <span className="profile-letter-thumbnail">
                {`${userDetails?.firstName?.charAt(0).toUpperCase()}`}
              </span>
          }

          
        </div>
        <div className="profile-toggle">
          <div className="profile-name">
            {profileName ?? `${userDetails?.fullName ?? 'Something wrong'}`}
          </div>
          <div className="profile-nav-container">
            {
              accountText && (
                <span className="premium">{accountText}</span>
              )
            }
            
          </div>
        </div>
      </div>
      <div className={`profile-menu ${isOpen ? "open" : ""}`}>
        {/* <div className="profile-arrow" /> */}
        <div className="profile-content">
          {profileItems.map((item, index) =>
            item.type === "divider" ? (
              <div key={`divider-${index}`} className="divider"></div>
            ) : (
              <div
                className="profile-item"
                style={item?.style || {}}
                key={item?.id || index}
                onClick={item?.onClick || undefined}
              >
                <span className="profile-item-icon">{item?.icon}</span>
                <span className="profile-item-label">{item?.label}</span>
              </div>
            )
          )}

          <div key={`divider-logout`} className="divider"></div>
          <div
            className="profile-item"
            key="profile_logout"
            onClick={() => {
              // UnyProtect.logout();
              try {
                document.cookie.split(";").forEach(cookie => {
                  const eqPos = cookie.indexOf("=");
                  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                  // Skip deletion if the cookie name is 'userData'
                  if (name !== "userData") {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  }
                });

                // Clear local storage
                localStorage.clear();

                // Clear session storage
                sessionStorage.clear();

                window.location.reload();
              } catch (err) {
                console.error("logout error", err);
              }
            }}
          >
            <span className="profile-item-icon" style={{ marginRight: "5px" }}>⏻</span>
            <span className="profile-item-label">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
