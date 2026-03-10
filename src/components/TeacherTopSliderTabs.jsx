import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import "../styles/teacherTopSliderTabs.css";

export default function TeacherTopSliderTabs({ active, setActive }) {
  const tabs = [
    { id: "sessions", label: "Upcoming Classes" },
    { id: "assignments", label: "Assignments" },
    { id: "quizzes", label: "Quizzes" },
    { id: "notifications", label: "Notifications" },
    { id: "calendar", label: "Calendar" },
  ];

  const currentIndex = tabs.findIndex((tab) => tab.id === active);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentTab = tabs[safeIndex];

  const goPrev = () => {
    const prevIndex = safeIndex === 0 ? tabs.length - 1 : safeIndex - 1;
    setActive(tabs[prevIndex].id);
  };

  const goNext = () => {
    const nextIndex = safeIndex === tabs.length - 1 ? 0 : safeIndex + 1;
    setActive(tabs[nextIndex].id);
  };

  return (
    <div className="teacherTopSlider">
      <button className="teacherTopSlider__arrow" onClick={goPrev} type="button">
        <HiChevronLeft />
      </button>

      <div className="teacherTopSlider__title">{currentTab.label}</div>

      <button className="teacherTopSlider__arrow" onClick={goNext} type="button">
        <HiChevronRight />
      </button>
    </div>
  );
}