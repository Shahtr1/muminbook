import { nodePositions } from "@/utils/nodePositions.js";

export const createFamilyTree = (tree = []) => {
  return tree.map((node) => {
    const foundTimeline = Object.keys(timeline).find((key) =>
      timeline[key].includes(node.uuid),
    );
    return {
      id: node.id,
      data: {
        biblicalName: node.biblicalName,
        islamicName: node.islamicName,
        arabicName: node.arabicName,
        timeline: foundTimeline,
        ulul_azm: ulul_azms.includes(node.uuid),
      },
      position: nodePositions[node.uuid] || { x: 0, y: 0 },
      draggable: true,
      type: prophets.includes(node.uuid)
        ? "prophet"
        : caliphs.includes(node.uuid)
          ? "caliph"
          : "text",
      parent: node.parent,
    };
  });
};

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
