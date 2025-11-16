import { SVG } from "@/components/svgs/SVG.jsx";

export const FolderSVG = ({
  active,
  activeColor,
  dimensions = "25px",
  empty = true,
}) => {
  const folderFillId = `folder-fill-${empty ? "empty" : "full"}`;
  const folderSideFillId = `folder-side-fill-${empty ? "empty" : "full"}`;

  return (
    <>
      <SVG
        dimensions={dimensions}
        active={active}
        activeColor={activeColor}
        viewBox="0 0 48 48"
      >
        <linearGradient
          id="Om5yvFr6YrdlC0q2Vet0Ha"
          x1="-7.018"
          x2="39.387"
          y1="9.308"
          y2="33.533"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#27A69F" /> {/* Brand 500 */}
          <stop offset=".909" stopColor="#1e857f" /> {/* Brand 600 */}
        </linearGradient>
        <path
          fill="url(#Om5yvFr6YrdlC0q2Vet0Ha)"
          d="M44.5,41h-41C2.119,41,1,39.881,1,38.5v-31C1,6.119,2.119,5,3.5,5h11.597	c1.519,0,2.955,0.69,3.904,1.877L21.5,10h23c1.381,0,2.5,1.119,2.5,2.5v26C47,39.881,45.881,41,44.5,41z"
        />
        <linearGradient
          id={folderFillId}
          x1="5.851"
          x2="18.601"
          y1="9.254"
          y2="27.39"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={empty ? "transparent" : "#e3fdfc"} />
          <stop offset=".909" stopColor={empty ? "transparent" : "#c1f7f4"} />
        </linearGradient>

        <path
          fill={`url(#${folderFillId})`}
          d="M2,25h20V11H4c-1.105,0-2,0.895-2,2V25z"
        />
        <linearGradient
          id={folderSideFillId}
          x1="2"
          x2="22"
          y1="19"
          y2="19"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={empty ? "transparent" : "#e3fdfc"} />
          <stop offset=".909" stopColor={empty ? "transparent" : "#c1f7f4"} />
        </linearGradient>

        <path
          fill={`url(#${folderSideFillId})`}
          d="M2,26h20V12H4c-1.105,0-2,0.895-2,2V26z"
        />

        <linearGradient
          id="Om5yvFr6YrdlC0q2Vet0Hd"
          x1="16.865"
          x2="44.965"
          y1="39.287"
          y2="39.792"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#166561" /> {/* Brand 700 */}
          <stop offset=".464" stopColor="#0e4443" /> {/* Brand 800 */}
        </linearGradient>
        <path
          fill="url(#Om5yvFr6YrdlC0q2Vet0Hd)"
          d="M1,37.875V38.5C1,39.881,2.119,41,3.5,41h41c1.381,0,2.5-1.119,2.5-2.5v-0.625H1z"
        />
        <linearGradient
          id="Om5yvFr6YrdlC0q2Vet0He"
          x1="-4.879"
          x2="35.968"
          y1="12.764"
          y2="30.778"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".34" stopColor="#6ae2d9" /> {/* Brand 300 */}
          <stop offset=".485" stopColor="#44d7cc" /> {/* Brand 400 */}
          <stop offset=".652" stopColor="#27A69F" /> {/* Brand 500 */}
        </linearGradient>
        <path
          fill="url(#Om5yvFr6YrdlC0q2Vet0He)"
          d="M44.5,11h-23l-1.237,0.824C19.114,12.591,17.763,13,16.381,13H3.5C2.119,13,1,14.119,1,15.5	v22C1,38.881,2.119,40,3.5,40h41c1.381,0,2.5-1.119,2.5-2.5v-24C47,12.119,45.881,11,44.5,11z"
        />
        <radialGradient
          id="Om5yvFr6YrdlC0q2Vet0Hf"
          cx="37.836"
          cy="49.317"
          r="53.875"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".199" stopColor="#072423" /> {/* Brand 900 */}
          <stop offset=".601" stopColor="#0e4443" /> {/* Brand 800 */}
          <stop offset=".886" stopColor="#166561" /> {/* Brand 700 */}
        </radialGradient>
        <path
          fill="url(#Om5yvFr6YrdlC0q2Vet0Hf)"
          d="M44.5,40h-41C2.119,40,1,38.881,1,37.5v-21C1,15.119,2.119,14,3.5,14h13.256	c1.382,0,2.733-0.409,3.883-1.176L21.875,12H44.5c1.381,0,2.5,1.119,2.5,2.5v23C47,38.881,45.881,40,44.5,40z"
        />
      </SVG>
    </>
  );
};
