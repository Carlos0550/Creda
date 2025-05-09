import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
} from "react";
import { Title } from "@mantine/core";
import { BsCreditCard, BsBoxArrowRight } from "react-icons/bs";
import "./Layout.css";
import { useAppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";

interface LayoutInterface {
  content: ReactNode;
}

function Layout({ content }: LayoutInterface) {
  const {
    usersHook: { getLocaleUserInfo, logout },
  } = useAppContext();
  
  const [userData] = useState(getLocaleUserInfo());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getInitial = (name: string) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Handle logout and redirect
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="layout-container">
      <header className="bg-gradient-to-r from-blue-800 to-blue-700 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md p-2 border-2 border-blue-300 mr-3">
              <BsCreditCard className="text-white text-xl" />
            </div>
            <div>
              <span className="text-2xl font-bold">
                <span className="text-blue-200">C</span>
                <span className="text-white">reda</span>
              </span>
            </div>
          </div>

          <div className="flex-grow"></div>

          <div className="hidden md:flex items-center space-x-6 mr-6">
            <div className="group relative">
              <button className="px-2 py-1.5 text-white text-sm uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer">
                Form
              </button>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
            </div>

            <div className="group relative">
              <button className="px-2 py-1.5 text-white text-sm uppercase tracking-wider font-medium transition-all duration-200 cursor-pointer">
                Data
              </button>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
            </div>
          </div>

          <div className="flex items-center">
      
            <div className="md:hidden flex items-center mr-4 space-x-2">
              <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm font-medium">
                Form
              </button>
              <button className="px-3 py-1.5 text-sm text-blue-100 border border-blue-500 hover:bg-blue-600 rounded-md font-medium">
                Data
              </button>
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 font-medium text-lg border border-blue-300 shadow-md hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
              >
                {getInitial(userData?.manager_name || "")}
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in overflow-hidden transform transition-all duration-200"
                  style={{ minWidth: "220px" }}
                >

                  <div
                    className="border-b border-gray-100"
                    style={{
                      padding: "16px 24px 16px 36px !important", 
                    }}
                  >
                    <div
                      className="font-medium text-gray-800 text-base"
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#333",
                        paddingTop: "13px",
                        paddingLeft: "13px", 
                      }}
                    >
                      {userData?.manager_name || "User"}
                    </div>
                  </div>

                  <div
                    className="py-4 px-6"
                    style={{ padding: "16px 24px !important" }}
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: "6px",
                      }}
                    >
                      <BsBoxArrowRight
                        className="mr-3 text-gray-500"
                        style={{ marginRight: "12px" }}
                      />
                      <span style={{ fontSize: "14px" }}>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="main-content">{content}</main>
    </div>
  );
}

export default Layout;
