import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle"; // Adjust path as needed

const ThemeTest = () => {
  const { theme } = useTheme();
  const [htmlClass, setHtmlClass] = useState("");

  useEffect(() => {
    const updateHtmlClass = () => {
      if (document.documentElement.classList.contains("dark")) {
        setHtmlClass("dark");
      } else if (document.documentElement.classList.contains("light")) {
        setHtmlClass("light");
      } else {
        setHtmlClass("none");
      }
    };

    updateHtmlClass();

    // Create a MutationObserver to watch for class changes
    const observer = new MutationObserver(updateHtmlClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Theme Test Page</h1>
          <ModeToggle />
        </div>

        {/* Current Theme Info */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-2">Current Theme Status</h2>
          <p className="text-muted-foreground">
            Active Theme:{" "}
            <span className="font-medium text-foreground">{theme}</span>
          </p>
          <p className="text-muted-foreground mt-1">
            HTML Class:{" "}
            <span className="font-medium text-foreground">{htmlClass}</span>
          </p>
        </div>

        {/* Color Palette Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Background Colors */}
          <div className="bg-card text-card-foreground p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Card Background</h3>
            <p className="text-sm text-muted-foreground">
              This should change from white to black
            </p>
          </div>

          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Secondary Background</h3>
            <p className="text-sm text-muted-foreground">
              Light gray to dark gray
            </p>
          </div>

          <div className="bg-muted text-muted-foreground p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Muted Background</h3>
            <p className="text-sm">Subtle background color</p>
          </div>
        </div>

        {/* Button Tests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Button Variations</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Primary Button
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80">
              Secondary Button
            </button>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90">
              Destructive Button
            </button>
            <button className="border border-border bg-background text-foreground px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              Outline Button
            </button>
          </div>
        </div>

        {/* Text Variations */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Text Variations</h2>
          <div className="space-y-2">
            <p className="text-foreground">
              <strong>Primary Text:</strong> This is the main text color
            </p>
            <p className="text-muted-foreground">
              <strong>Muted Text:</strong> This is secondary/muted text
            </p>
            <p className="text-destructive">
              <strong>Destructive Text:</strong> This is for errors or warnings
            </p>
          </div>
        </div>

        {/* Border and Input Tests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Elements</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Input field test"
              className="w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Textarea test"
              className="w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
          </div>
        </div>

        {/* CSS Variables Debug */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">CSS Variables Debug</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>--background:</strong>{" "}
              <span className="text-muted-foreground">
                hsl(var(--background))
              </span>
            </div>
            <div>
              <strong>--foreground:</strong>{" "}
              <span className="text-muted-foreground">
                hsl(var(--foreground))
              </span>
            </div>
            <div>
              <strong>--card:</strong>{" "}
              <span className="text-muted-foreground">hsl(var(--card))</span>
            </div>
            <div>
              <strong>--border:</strong>{" "}
              <span className="text-muted-foreground">hsl(var(--border))</span>
            </div>
          </div>
        </div>

        {/* Visual Indicator */}
        <div className="text-center py-8">
          <div className="inline-block p-6 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              🎨 Theme Test Complete
            </h3>
            <p className="text-muted-foreground">
              If colors change when you toggle the theme, everything is working!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
