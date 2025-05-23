import { SVG } from "@/components/svgs/SVG.jsx";

export const FamilyTreeSVG = ({ active, activeColor, dimensions = "25px" }) => {
  return (
    <>
      <SVG
        dimensions={dimensions}
        active={active}
        style={{ borderRadius: "0" }}
        activeColor={activeColor}
        viewBox="0 0 48 48"
      >
        <g id="Layer_2" data-name="Layer 2">
          <g id="icons_Q2" data-name="icons Q2">
            <g>
              <rect width="48" height="48" fill="none" />
              <path d="M26,30H42a2,2,0,0,0,2-2V20a2,2,0,0,0-2-2H26a2,2,0,0,0-2,2v2H16V14h6a2,2,0,0,0,2-2V4a2,2,0,0,0-2-2H6A2,2,0,0,0,4,4v8a2,2,0,0,0,2,2h6V40a2,2,0,0,0,2,2H24v2a2,2,0,0,0,2,2H42a2,2,0,0,0,2-2V36a2,2,0,0,0-2-2H26a2,2,0,0,0-2,2v2H16V26h8v2A2,2,0,0,0,26,30Z" />
            </g>
          </g>
        </g>
      </SVG>
    </>
  );
};
