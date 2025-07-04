import React, { useEffect, useState } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { clerk, loadClerk } from "../../LoginRegister/clerk";
import { $ajax_post } from "../../Library";
import EditProfileDrawer from "./EditProfileDrawer";
import { LogOut } from "lucide-react";

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
    "#1A237E", // Dark Indigo
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
      if (!user) {
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view");

  const getUsers = async () => {
    $ajax_post(
      `getUserByEmail/${clerk.user?.primaryEmailAddress?.emailAddress}`,
      {},
      (response) => {
        console.log(response, "users");
        setSelectedUser(response);
      }
    );
  };
  useEffect(() => {
    getUsers();
  }, []);
  const handleOpenDrawer = (user = {}, mode = "view") => {
    setDrawerMode(mode);
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleEditUser = (updatedUser) => {
    $ajax_post("users/update", updatedUser, () => {
      setDrawerOpen(false);
      getUsers();
    });
  };

  return (
    <>
      <div
        className="profile-container"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="profile-nav">
          <div className="profile-avatar" style={{ background: bgColor }}>
            {selectedUser?.image_url ||
            userDetails?.unsafeMetadata?.custom_profile_image_url ||
            userDetails?.imageUrl ? (
              <img
                src={
                  selectedUser?.image_url ||
                  userDetails?.unsafeMetadata?.custom_profile_image_url ||
                  userDetails?.imageUrl
                }
                alt="profile_pic"
                style={{
                  height: "100%",
                  width: "100%",
                }}
              />
            ) : (
              <span className="profile-letter-thumbnail">
                {`${userDetails?.firstName?.charAt(0).toUpperCase()}`}
              </span>
            )}
          </div>
          <div className="profile-toggle">
            <div className="profile-name">
              {profileName ?? `${userDetails?.fullName ?? "Something wrong"}`}
            </div>
            <div className="profile-nav-container">
              {accountText && <span className="premium">{accountText}</span>}
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
            <div className="profile-item" onClick={() => handleOpenDrawer()}>
              Edit Profile
            </div>
            <div key={`divider-logout`} className="divider"></div>
            <div
              className="profile-item"
              key="profile_logout"
              onClick={() => {
                // UnyProtect.logout();
                try {
                  document.cookie.split(";").forEach((cookie) => {
                    const eqPos = cookie.indexOf("=");
                    const name =
                      eqPos > -1
                        ? cookie.substr(0, eqPos).trim()
                        : cookie.trim();

                    // Skip deletion if the cookie name is 'userData'
                    if (name !== "userData") {
                      document.cookie =
                        name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
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
              <span
                className="profile-item-icon"
                style={{ marginRight: "5px" }}
              >
                {" "}
                <LogOut className="h-[1.2rem] w-[1.2rem] transition-all" />
              </span>
              <span className="profile-item-label">Logout</span>
            </div>
          </div>
        </div>
      </div>
      <EditProfileDrawer
        open={drawerOpen}
        mode={drawerMode}
        data={selectedUser}
        setDrawerMode={setDrawerMode}
        handleEditUser={handleEditUser}
        onClose={() => setDrawerOpen(false)}
        imageUrl={
          userDetails?.unsafeMetadata?.custom_profile_image_url ||
          userDetails?.imageUrl
        }
        onRefresh={() => {
          setDrawerOpen(false);
          // getUsers();
        }}
      />
    </>
  );
};

export default Profile;
