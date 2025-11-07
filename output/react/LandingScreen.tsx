import React from "react";

export const LandingScreen: React.FC = () => {
  return (
    <div style={{ position: "relative" }}>
      <div key="frame-1-0" style={{ position: "absolute", left: 0, top: 0, width: 320, height: 200 }}>
        <span key="text-1-0" style={{ position: "absolute", left: 8, top: 12, width: 160, height: 24 }}>{"Hello CLI"}</span>
        <img key="image-1-1" src="hero.png" alt="image" style={{ position: "absolute", left: 12, top: 48, width: 96, height: 96 }} />
        <div key="group-1-2" style={{ position: "absolute", left: 180, top: 12, width: 120, height: 120 }}>
          <span key="text-2-0" style={{ position: "absolute", left: 0, top: 0, width: 110, height: 24 }}>{"Nested label"}</span>
          <div key="component-1-1" style={{ position: "absolute", left: 0, top: 40, width: 120, height: 72 }}></div>
        </div>
      </div>
    </div>
  );
};
