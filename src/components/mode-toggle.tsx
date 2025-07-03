import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  
  // Get the actual applied theme (resolve "system" to actual theme)
  const getAppliedTheme = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  };
  
  const appliedTheme = getAppliedTheme();
  
  const toggleTheme = () => {
    // Simple toggle between light and dark (you can extend this to include system)
    setTheme(appliedTheme === "light" ? "dark" : "light");
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {appliedTheme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}