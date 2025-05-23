import LineageType from "../constants/enums/lineageType";

export interface FamilyTreeEntry {
  id: string;
  uuid: string;
  biblicalName?: string;
  islamicName?: string;
  arabicName?: string;
  lineages?: LineageType | LineageType[];
  parents?: string | string[];
  label?: string;
}

export const familyTreeApi: FamilyTreeEntry[] = [
  {
    id: "1",
    uuid: "adam",
    biblicalName: "Adam",
    islamicName: "Adam",
    arabicName: "آدم",
  },
  {
    id: "2",
    uuid: "hawa",
    biblicalName: "Eve",
    islamicName: "Hawa",
    arabicName: "حواء",
    parents: "1",
    lineages: LineageType.Indirect,
  },
  {
    id: "3",
    uuid: "qabil",
    biblicalName: "Cain",
    islamicName: "Qabil",
    arabicName: "قابيل",
    parents: "1",
    lineages: LineageType.Direct,
  },
  {
    id: "4",
    uuid: "habil",
    biblicalName: "Abel",
    islamicName: "Habil",
    arabicName: "هابيل",
    parents: "1",
    lineages: LineageType.Direct,
  },
  {
    id: "5",
    uuid: "shayth",
    biblicalName: "Seth",
    islamicName: "Shayth",
    arabicName: "شيث",
    parents: "1",
    lineages: LineageType.Direct,
  },
  {
    id: "6",
    uuid: "anoush",
    biblicalName: "Enosh",
    islamicName: "Anoush",
    arabicName: "أنوش",
    parents: "5",
    lineages: LineageType.Direct,
  },
  {
    id: "7",
    uuid: "qinan",
    biblicalName: "Kenan",
    islamicName: "Qinan",
    arabicName: "قينان",
    parents: "6",
    lineages: LineageType.Direct,
  },
  {
    id: "8",
    uuid: "mahlaleel",
    biblicalName: "Mahalalel",
    islamicName: "Mahlaleel",
    arabicName: "مهلائيل",
    parents: "7",
    lineages: LineageType.Direct,
  },
  {
    id: "9",
    uuid: "alyarid",
    biblicalName: "Jared",
    islamicName: "Al-Yarid",
    arabicName: "اليارد",
    parents: "8",
    lineages: LineageType.Direct,
  },
  {
    id: "10",
    uuid: "idris",
    biblicalName: "Enoch",
    islamicName: "Idris",
    arabicName: "إدريس",
    parents: "9",
    lineages: LineageType.Direct,
  },
  {
    id: "11",
    uuid: "matushalakh",
    biblicalName: "Methuselah",
    islamicName: "Matushalakh",
    arabicName: "متوشلخ",
    parents: "10",
    lineages: LineageType.Direct,
  },
  {
    id: "12",
    uuid: "lamik",
    biblicalName: "Lamech",
    islamicName: "Lamik",
    arabicName: "لامك",
    parents: "11",
    lineages: LineageType.Direct,
  },
  {
    id: "13",
    uuid: "nuh",
    biblicalName: "Noah",
    islamicName: "Nuh",
    arabicName: "نوح",
    parents: "12",
    lineages: LineageType.Direct,
  },
  {
    id: "14",
    uuid: "sam",
    biblicalName: "Shem",
    islamicName: "Sam",
    arabicName: "سام",
    parents: "13",
    lineages: LineageType.Direct,
  },
  {
    id: "15",
    uuid: "ham",
    biblicalName: "Ham",
    islamicName: "Ham",
    arabicName: "حام",
    parents: "13",
    lineages: LineageType.Direct,
  },
  {
    id: "16",
    uuid: "yafith",
    biblicalName: "Japheth",
    islamicName: "Yafith",
    arabicName: "يافث",
    parents: "13",
    lineages: LineageType.Direct,
  },
  {
    id: "17",
    uuid: "yam",
    biblicalName: "Canaan",
    islamicName: "Yam",
    arabicName: "يام",
    parents: "13",
    lineages: LineageType.Direct,
  },
  {
    id: "18",
    uuid: "antakhshad",
    biblicalName: "Arphaxad",
    islamicName: "Antakhshad",
    arabicName: "أنطخشد",
    parents: "14",
    lineages: LineageType.Direct,
  },
  {
    id: "19",
    uuid: "eram",
    biblicalName: "Iram",
    islamicName: "Eram",
    arabicName: "إرم",
    parents: "14",
    lineages: LineageType.Direct,
  },
  {
    id: "20",
    uuid: "shalikh",
    biblicalName: "Salah",
    islamicName: "Shalikh",
    arabicName: "شالخ",
    parents: "18",
    lineages: LineageType.Direct,
  },
  {
    id: "21",
    uuid: "hud",
    biblicalName: "Hud",
    islamicName: "Hud",
    arabicName: "هود",
    parents: "20",
    lineages: LineageType.Direct,
  },
  {
    id: "22",
    uuid: "saleh",
    biblicalName: "Saleh",
    islamicName: "Saleh",
    arabicName: "صالح",
    parents: "19",
    lineages: LineageType.Indirect,
  },
  {
    id: "23",
    uuid: "falikh",
    biblicalName: "Falikh",
    islamicName: "Falikh",
    arabicName: "فالغ",
    parents: "21",
    lineages: LineageType.Direct,
  },
  {
    id: "24",
    uuid: "rauh",
    biblicalName: "Reu",
    islamicName: "Rauh",
    arabicName: "راح",
    parents: "23",
    lineages: LineageType.Direct,
  },
  {
    id: "25",
    uuid: "sarukh",
    biblicalName: "Serug",
    islamicName: "Sarukh",
    arabicName: "ساروخ",
    parents: "24",
    lineages: LineageType.Direct,
  },
  {
    id: "26",
    uuid: "nahur",
    biblicalName: "Nahor",
    islamicName: "Nahur",
    arabicName: "ناحور",
    parents: "25",
    lineages: LineageType.Direct,
  },
  {
    id: "27",
    uuid: "azar",
    biblicalName: "Terah",
    islamicName: "Azar",
    arabicName: "آزر",
    parents: "26",
    lineages: LineageType.Direct,
  },
  {
    id: "28",
    uuid: "ibrahim",
    biblicalName: "Abraham",
    islamicName: "Ibrahim",
    arabicName: "إبراهيم",
    parents: "27",
    lineages: LineageType.Direct,
  },
  {
    id: "29",
    uuid: "haran",
    biblicalName: "Haran",
    islamicName: "Haran",
    arabicName: "هاران",
    parents: "27",
    lineages: LineageType.Direct,
  },
  {
    id: "30",
    uuid: "lut",
    biblicalName: "Lot",
    islamicName: "Lut",
    arabicName: "لوط",
    parents: "29",
    lineages: LineageType.Direct,
  },
  {
    id: "31",
    uuid: "hajar",
    biblicalName: "Hagar",
    islamicName: "Hajar",
    arabicName: "هاجر",
    parents: "28",
    lineages: LineageType.Indirect,
  },
  {
    id: "32",
    uuid: "sarah",
    biblicalName: "Sarah",
    islamicName: "Sarah",
    arabicName: "سارة",
    parents: "28",
    lineages: LineageType.Indirect,
  },
  {
    id: "33",
    uuid: "ismail",
    biblicalName: "Ishmael",
    islamicName: "Ismail",
    arabicName: "إسماعيل",
    parents: "31",
    lineages: LineageType.Direct,
  },
  {
    id: "34",
    uuid: "ishaq",
    biblicalName: "Isaac",
    islamicName: "Ishaq",
    arabicName: "إسحاق",
    parents: "32",
    lineages: LineageType.Direct,
  },
  {
    id: "35",
    uuid: "madyan",
    biblicalName: "Madyan",
    islamicName: "Madyan",
    arabicName: "مدين",
    parents: "32",
    lineages: LineageType.Indirect,
  },
  {
    id: "36",
    uuid: "yaqub",
    biblicalName: "Jacob",
    islamicName: "Yaqub",
    arabicName: "يعقوب",
    parents: "34",
    lineages: LineageType.Direct,
  },
  {
    id: "37",
    uuid: "alis",
    biblicalName: "Esau",
    islamicName: "Al-Is",
    arabicName: "ٱلعيص",
    parents: "34",
    lineages: LineageType.Direct,
  },
  {
    id: "38",
    uuid: "banuisrael",
    label: "Banu Israel",
    parents: "36",
    lineages: LineageType.Direct,
  },
  {
    id: "39",
    uuid: "yusuf",
    biblicalName: "Joseph",
    islamicName: "Yusuf",
    arabicName: "يوسف",
    parents: "38",
    lineages: LineageType.Direct,
  },
  {
    id: "40",
    uuid: "benyamin",
    biblicalName: "Benyamin",
    islamicName: "Benyamin",
    arabicName: "بِنْيَامِين",
    parents: "38",
    lineages: LineageType.Direct,
  },
  {
    id: "41",
    uuid: "yahuda",
    biblicalName: "Yahuda",
    islamicName: "Yahuda",
    arabicName: "يَهُوذَا",
    parents: "38",
    lineages: LineageType.Direct,
  },
  {
    id: "42",
    uuid: "lawi",
    biblicalName: "Levi",
    islamicName: "Lawi",
    arabicName: "لاوي",
    parents: "38",
    lineages: LineageType.Direct,
  },
  {
    id: "43",
    uuid: "ayyub",
    biblicalName: "Job",
    islamicName: "Ayyub",
    arabicName: "أيوب",
    parents: "37",
    lineages: LineageType.Indirect,
  },
  {
    id: "44",
    uuid: "shuayb",
    biblicalName: "Shuayb",
    islamicName: "Shuayb",
    arabicName: "شعيب",
    parents: "37",
    lineages: LineageType.Indirect,
  },
  {
    id: "45",
    uuid: "qahath",
    biblicalName: "Kahath",
    islamicName: "Qahath",
    arabicName: "قهات",
    parents: "42",
    lineages: LineageType.Direct,
  },
  {
    id: "46",
    uuid: "imran",
    biblicalName: "Imran",
    islamicName: "Imran",
    arabicName: "عِمْرَان",
    parents: "45",
    lineages: LineageType.Direct,
  },
  {
    id: "47",
    uuid: "harun",
    biblicalName: "Aaron",
    islamicName: "Harun",
    arabicName: "هارون",
    parents: "46",
    lineages: LineageType.Direct,
  },
  {
    id: "48",
    uuid: "maryam",
    biblicalName: "Maryam",
    islamicName: "Maryam",
    arabicName: "مريم",
    parents: "46",
    lineages: LineageType.Direct,
  },
  {
    id: "49",
    uuid: "musa",
    biblicalName: "Moses",
    islamicName: "Musa",
    arabicName: "موسى",
    parents: "46",
    lineages: LineageType.Direct,
  },
  {
    id: "50",
    uuid: "safurah",
    biblicalName: "Safurah",
    islamicName: "Safurah",
    arabicName: "سفورة",
    parents: ["44", "49"],
    lineages: [LineageType.Indirect, LineageType.Indirect],
  },
  {
    id: "51",
    uuid: "asiya",
    biblicalName: "Asiya",
    islamicName: "Asiya",
    arabicName: "آسِيَة",
    parents: "49",
    lineages: LineageType.Indirect,
  },
  {
    id: "52",
    uuid: "ilyas",
    biblicalName: "Elias",
    islamicName: "Ilyas",
    arabicName: "إلياس",
    parents: "47",
    lineages: LineageType.Indirect,
  },
  {
    id: "53",
    uuid: "alyasa",
    biblicalName: "Elisha",
    islamicName: "Al-Yasa",
    arabicName: "اليسع",
    parents: "47",
    lineages: LineageType.Indirect,
  },
  {
    id: "54",
    uuid: "zakariya",
    biblicalName: "Zechariah",
    islamicName: "Zakariya",
    arabicName: "زكريا",
    parents: "47",
    lineages: LineageType.Indirect,
  },
  {
    id: "55",
    uuid: "dawud",
    biblicalName: "David",
    islamicName: "Dawud",
    arabicName: "داوود",
    parents: "41",
    lineages: LineageType.Indirect,
  },
  {
    id: "56",
    uuid: "sulayman",
    biblicalName: "Solomon",
    islamicName: "Sulayman",
    arabicName: "سليمان",
    parents: "55",
    lineages: LineageType.Direct,
  },
  {
    id: "57",
    uuid: "yunus",
    biblicalName: "Jonah",
    islamicName: "Yunus",
    arabicName: "يونس",
    parents: "40",
    lineages: LineageType.Indirect,
  },
  {
    id: "58",
    uuid: "imran_2",
    biblicalName: "Imran",
    islamicName: "Imran",
    arabicName: "عِمْرَان",
    parents: "56",
    lineages: LineageType.Indirect,
  },
  {
    id: "59",
    uuid: "hannah",
    biblicalName: "Anne",
    islamicName: "Hannah",
    arabicName: "حَنَّة",
    parents: "58",
    lineages: LineageType.Indirect,
  },
  {
    id: "60",
    uuid: "faqud",
    biblicalName: "Faqud",
    islamicName: "Faqud",
    arabicName: "فاقود",
    parents: "59",
    lineages: LineageType.Direct,
  },
  {
    id: "61",
    uuid: "alisbat",
    biblicalName: "Al-Isbat",
    islamicName: "Al-Isbat",
    arabicName: "ألْيَسْبَط",
    parents: ["60", "54"],
    lineages: [LineageType.Direct, LineageType.Direct],
  },
  {
    id: "62",
    uuid: "maryam_2",
    biblicalName: "Mary",
    islamicName: "Maryam",
    arabicName: "مريم",
    parents: "58",
    lineages: LineageType.Direct,
  },
  {
    id: "63",
    uuid: "isa",
    biblicalName: "Jesus",
    islamicName: "Isa",
    arabicName: "عيسى",
    parents: "62",
    lineages: LineageType.Direct,
  },
  {
    id: "64",
    uuid: "yahya",
    biblicalName: "John the Baptist",
    islamicName: "Yahya",
    arabicName: "يحيى",
    parents: "54",
    lineages: LineageType.Direct,
  },
  {
    id: "65",
    uuid: "adnan",
    biblicalName: "Adnan",
    islamicName: "Adnan",
    arabicName: "عدنان",
    parents: "33",
    lineages: LineageType.Indirect,
  },
  {
    id: "66",
    uuid: "maad",
    biblicalName: "Maad",
    islamicName: "Maad",
    arabicName: "معد",
    parents: "65",
    lineages: LineageType.Direct,
  },
  {
    id: "67",
    uuid: "nizar",
    biblicalName: "Nizar",
    islamicName: "Nizar",
    arabicName: "نزار",
    parents: "66",
    lineages: LineageType.Direct,
  },
  {
    id: "68",
    uuid: "mudhar",
    biblicalName: "Mudhar",
    islamicName: "Mudhar",
    arabicName: "مضر",
    parents: "67",
    lineages: LineageType.Direct,
  },
  {
    id: "69",
    uuid: "ilyas_2",
    biblicalName: "Ilyas",
    islamicName: "Ilyas",
    arabicName: "إلياس",
    parents: "68",
    lineages: LineageType.Direct,
  },
  {
    id: "70",
    uuid: "mudrikah",
    biblicalName: "Mudrikah",
    islamicName: "Mudrikah",
    arabicName: "مدركة",
    parents: "69",
    lineages: LineageType.Direct,
  },
  {
    id: "71",
    uuid: "khuzaimah",
    biblicalName: "Khuzaimah",
    islamicName: "Khuzaimah",
    arabicName: "خزيمة",
    parents: "70",
    lineages: LineageType.Direct,
  },
  {
    id: "72",
    uuid: "kinana",
    biblicalName: "Kinana",
    islamicName: "Kinana",
    arabicName: "كنانة",
    parents: "71",
    lineages: LineageType.Direct,
  },
  {
    id: "73",
    uuid: "alnadr",
    biblicalName: "Al-Nadr",
    islamicName: "Al-Nadr",
    arabicName: "النضر",
    parents: "72",
    lineages: LineageType.Direct,
  },
  {
    id: "74",
    uuid: "malik",
    biblicalName: "Malik",
    islamicName: "Malik",
    arabicName: "مالك",
    parents: "73",
    lineages: LineageType.Direct,
  },
  {
    id: "75",
    uuid: "fihr",
    biblicalName: "Fihr",
    islamicName: "Fihr",
    arabicName: "فهر",
    parents: "74",
    lineages: LineageType.Direct,
  },
  {
    id: "76",
    uuid: "qurayshtribe",
    label: "Quraysh",
    parents: "75",
    lineages: LineageType.Direct,
  },
  {
    id: "77",
    uuid: "ghalib",
    biblicalName: "Ghalib",
    islamicName: "Ghalib",
    arabicName: "غالب",
    parents: "76",
    lineages: LineageType.Direct,
  },
  {
    id: "78",
    uuid: "luay",
    biblicalName: "Luay",
    islamicName: "Luay",
    arabicName: "لؤي",
    parents: "77",
    lineages: LineageType.Direct,
  },
  {
    id: "79",
    uuid: "kab",
    biblicalName: "Kab",
    islamicName: "Kab",
    arabicName: "كعب",
    parents: "78",
    lineages: LineageType.Direct,
  },
  {
    id: "80",
    uuid: "murrah",
    biblicalName: "Murrah",
    islamicName: "Murrah",
    arabicName: "مرة",
    parents: "79",
    lineages: LineageType.Direct,
  },
  {
    id: "81",
    uuid: "kilab",
    biblicalName: "Kilab",
    islamicName: "Kilab",
    arabicName: "كلاب",
    parents: "80",
    lineages: LineageType.Direct,
  },
  {
    id: "82",
    uuid: "qusai",
    biblicalName: "Qusai",
    islamicName: "Qusai",
    arabicName: "قصي",
    parents: "81",
    lineages: LineageType.Direct,
  },
  {
    id: "83",
    uuid: "abdmanaf",
    biblicalName: "Abd Manaf",
    islamicName: "Abd Manaf",
    arabicName: "عبد مناف",
    parents: "82",
    lineages: LineageType.Direct,
  },
  {
    id: "84",
    uuid: "hashim",
    biblicalName: "Hashim",
    islamicName: "Hashim",
    arabicName: "هاشم",
    parents: "83",
    lineages: LineageType.Direct,
  },
  {
    id: "85",
    uuid: "abdshams",
    biblicalName: "Abd Shams",
    islamicName: "Abd Shams",
    arabicName: "عبد شمس",
    parents: "83",
    lineages: LineageType.Direct,
  },
  {
    id: "86",
    uuid: "abdalmuttalib",
    biblicalName: "Abd al-Mutalib",
    islamicName: "Abd al-Mutalib",
    arabicName: "عبد المطلب",
    parents: "84",
    lineages: LineageType.Direct,
  },
  {
    id: "87",
    uuid: "abutalib",
    biblicalName: "Abu Talib",
    islamicName: "Abu Talib",
    arabicName: "أبو طالب",
    parents: "86",
    lineages: LineageType.Direct,
  },
  {
    id: "88",
    uuid: "abdullah",
    biblicalName: "Abdullah",
    islamicName: "Abdullah",
    arabicName: "عبد الله",
    parents: "86",
    lineages: LineageType.Direct,
  },
  {
    id: "89",
    uuid: "alabbas",
    biblicalName: "Al-Abbas",
    islamicName: "Al-Abbas",
    arabicName: "العباس",
    parents: "86",
    lineages: LineageType.Direct,
  },
  {
    id: "90",
    uuid: "aminah",
    biblicalName: "Aminah",
    islamicName: "Aminah",
    arabicName: "آمنة",
    parents: "88",
    lineages: LineageType.Indirect,
  },
  {
    id: "91",
    uuid: "muhammad",
    biblicalName: "Muhammad(ﷺ)",
    islamicName: "Muhammad(ﷺ)",
    arabicName: "محمد",
    parents: "88",
    lineages: LineageType.Direct,
  },
  {
    id: "92",
    uuid: "aisha",
    biblicalName: "Aisha",
    islamicName: "Aisha",
    arabicName: "عائشة",
    parents: "91",
    lineages: LineageType.Indirect,
  },
  {
    id: "93",
    uuid: "hafsa",
    biblicalName: "Hafsa",
    islamicName: "Hafsa",
    arabicName: "حفصة",
    parents: "91",
    lineages: LineageType.Indirect,
  },
  {
    id: "94",
    uuid: "khadijah",
    biblicalName: "Khadijah",
    islamicName: "Khadijah",
    arabicName: "خديجة",
    parents: "91",
    lineages: LineageType.Indirect,
  },
  {
    id: "95",
    uuid: "abubakr",
    biblicalName: "Abu Bakr",
    islamicName: "Abu Bakr",
    arabicName: "أبو بكر",
    parents: "92",
    lineages: LineageType.Direct,
  },
  {
    id: "96",
    uuid: "umar",
    biblicalName: "Umar",
    islamicName: "Umar",
    arabicName: "عمر",
    parents: "93",
    lineages: LineageType.Direct,
  },
  {
    id: "97",
    uuid: "ali",
    biblicalName: "Ali",
    islamicName: "Ali",
    arabicName: "علي",
    parents: "87",
    lineages: LineageType.Direct,
  },
  {
    id: "98",
    uuid: "fatimah",
    biblicalName: "Fatimah",
    islamicName: "Fatimah",
    arabicName: "فاطمة",
    parents: ["91", "97"],
    lineages: [LineageType.Direct, LineageType.Indirect],
  },
  {
    id: "99",
    uuid: "zainab",
    biblicalName: "Zainab",
    islamicName: "Zainab",
    arabicName: "زينب",
    parents: "91",
    lineages: LineageType.Direct,
  },
  {
    id: "100",
    uuid: "ruqayyah",
    biblicalName: "Ruqayyah",
    islamicName: "Ruqayyah",
    arabicName: "رقيّة",
    parents: ["91", "107"],
    lineages: [LineageType.Direct, LineageType.Indirect],
  },
  {
    id: "101",
    uuid: "ummkulthum",
    biblicalName: "Umm Kulthum",
    islamicName: "Umm Kulthum",
    arabicName: "أم كلثوم",
    parents: ["91", "107"],
    lineages: [LineageType.Direct, LineageType.Indirect],
  },
  {
    id: "102",
    uuid: "hasan",
    biblicalName: "Hasan",
    islamicName: "Hasan",
    arabicName: "حسن",
    parents: "97",
    lineages: LineageType.Direct,
  },
  {
    id: "103",
    uuid: "husayn",
    biblicalName: "Husayn",
    islamicName: "Husayn",
    arabicName: "حسين",
    parents: "97",
    lineages: LineageType.Direct,
  },
  {
    id: "104",
    uuid: "umayya",
    biblicalName: "Umayya",
    islamicName: "Umayya",
    arabicName: "أمية",
    parents: "85",
    lineages: LineageType.Direct,
  },
  {
    id: "105",
    uuid: "umayyad",
    label: "Umayyad",
    parents: "104",
    lineages: LineageType.Direct,
  },
  {
    id: "106",
    uuid: "abbasid",
    label: "Abbasid",
    parents: "89",
    lineages: LineageType.Direct,
  },
  {
    id: "107",
    uuid: "uthman",
    biblicalName: "Uthman",
    islamicName: "Uthman",
    arabicName: "عثمان",
    parents: "105",
    lineages: LineageType.Indirect,
  },
  {
    id: "108",
    uuid: "dhulalkifl",
    biblicalName: "Dhu al-Kifl",
    islamicName: "Dhu al-Kifl",
    arabicName: "ذو الكفل",
  },
];
