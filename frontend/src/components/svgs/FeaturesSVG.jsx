import { SVG } from "@/components/svgs/SVG.jsx";

export const FeaturesSVG = ({ active, activeColor, viewBox }) => {
  return (
    <>
      <SVG
        dimensions="25px"
        active={active}
        activeColor={activeColor}
        viewBox={viewBox}
      >
        <g transform="scale(2.4) translate(-1.5,2)">
          <path d="M2 22V2H22V18H6L2 22ZM9.075 14.25L12 12.475L14.925 14.25L14.15 10.925L16.75 8.675L13.325 8.4L12 5.25L10.675 8.4L7.25 8.675L9.85 10.925L9.075 14.25Z" />
        </g>
      </SVG>
    </>
  );
};
