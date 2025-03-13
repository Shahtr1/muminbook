import { SVG } from "@/components/svgs/SVG.jsx";

export const FamilyTreeSVG = ({ active, activeColor, viewBox }) => {
  return (
    <>
      <SVG
        dimensions="25px"
        active={active}
        style={{ borderRadius: "0" }}
        activeColor={activeColor}
        viewBox={viewBox}
      >
        <g transform="scale(2) translate(0,3)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15 2H9V8H11V11H3V16H1V22H7V16H5V13H11V16H9V22H15V16H13V13H19V16H17V22H23V16H21V11H13V8H15V2Z"
          />
        </g>
      </SVG>
    </>
  );
};
