import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TeacherTopSliderTabs from "../components/TeacherTopSliderTabs";
import "./layout.css";

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("sessions");

  return (
    <div className="teacher-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="teacher-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <TeacherTopSliderTabs
          active={active}
          setActive={setActive}
        />

        <main className="teacher-content">
          <Outlet context={{ active, setActive }} />
        </main>
      </div>
    </div>
  );
}