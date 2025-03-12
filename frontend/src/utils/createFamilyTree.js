import { nodePositions } from "@/utils/nodePositions.js";

export const createFamilyTree = (tree = []) =>
  tree.map(
    ({
      _id: id,
      uuid,
      biblicalName,
      islamicName,
      arabicName,
      lineages,
      parents,
      label,
    }) => ({
      id,
      data: {
        uuid,
        biblicalName,
        islamicName,
        arabicName,
        label,
        timeline:
          Object.keys(timeline).find((key) => timeline[key].includes(uuid)) ||
          "father",
        lineages,
        ulul_azm: ulul_azms.includes(uuid),
      },
      position: nodePositions[uuid] || { x: 0, y: 0 },
      draggable: true,
      type: prophets.includes(uuid)
        ? "prophet"
        : caliphs.includes(uuid)
          ? "caliph"
          : banners.includes(uuid)
            ? "banner"
            : flags.includes(uuid)
              ? "flag"
              : "text",
      parents,
    }),
  );

const flags = ["abbasid", "umayyad"];
const banners = ["qurayshtribe", "banuisrael"];

const caliphs = ["abubakr", "umar", "uthman", "ali"];

const prophets = [
  "adam",
  "idris",
  "nuh",
  "hud",
  "saleh",
  "shuayb",
  "ibrahim",
  "ismail",
  "ishaq",
  "lut",
  "yaqub",
  "yusuf",
  "ayyub",
  "shuaib",
  "musa",
  "harun",
  "dawud",
  "sulayman",
  "ilyas",
  "alyasa",
  "yunus",
  "zakariya",
  "yahya",
  "isa",
  "muhammad",
  "dhulalkifl",
];

const ulul_azms = ["nuh", "ibrahim", "musa", "isa", "muhammad"];
const timeline = {
  antediluvian: ["adam", "idris", "nuh"],
  arabic: ["hud", "saleh", "shuayb", "ismail", "muhammad"],
  israelite: [
    "alyasa",
    "dawud",
    "harun",
    "ilyas",
    "isa",
    "ishaq",
    "musa",
    "sulayman",
    "yahya",
    "yaqub",
    "yusuf",
    "zakariya",
  ],
  other: ["ayyub", "dhulalkifl", "lut", "yunus"],
};
