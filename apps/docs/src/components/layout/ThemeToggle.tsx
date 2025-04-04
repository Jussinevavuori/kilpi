import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "../variants/buttonVariants";

/**
 * @see https://tailwindcss.com/docs/dark-mode#with-system-theme-support
 */
export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Init on client
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
  }, [setIsDarkMode]);

  // Update theme
  function handleToggleTheme() {
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", isDarkMode ? "light" : "dark");
    setIsDarkMode(!isDarkMode);
  }

  return (
    <button
      onClick={handleToggleTheme}
      className={buttonVariants({ size: "icon", variant: "ghost" })}
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
