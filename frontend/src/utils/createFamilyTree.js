import { nodePositions } from "@/utils/nodePositions.js";

export const createFamilyTree = (tree = []) =>
  tree.map(
    ({ id, uuid, biblicalName, islamicName, arabicName, lineage, parent }) => ({
      id,
      data: {
        uuid,
        biblicalName,
        islamicName,
        arabicName,
        timeline:
          Object.keys(timeline).find((key) => timeline[key].includes(uuid)) ||
          "unknown",
        lineage,
        ulul_azm: ulul_azms.includes(uuid),
      },
      position: nodePositions[uuid] || { x: 0, y: 0 },
      draggable: true,
      type: prophets.includes(uuid)
        ? "prophet"
        : caliphs.includes(uuid)
          ? "caliph"
          : "text",
      parent,
    }),
  );

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
  "lut",
  "yaqub",
  "yusuf",
  "ayyub",
  "shuaib",
  "moses",
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
    "isaac",
    "musa",
    "sulayman",
    "yahya",
    "yaqub",
    "yusuf",
    "zakariya",
  ],
  other: ["ayyub", "dhulalkifl", "lut", "yunus"],
};
