import { ReadingDocument } from '../models/reading/reading.model.js';

export const readingsApi: Partial<ReadingDocument>[] = [
  {
    uuid: 'uthmani',
    label: "The Holy Qur'an",
    coverColor: '#79511e',
    image: 'quran-cover.jpg',
    pageText:
      'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
    description:
      "The timeless and unaltered Arabic text of the Noble Qur'an.\n" +
      'Revealed over 1,400 years ago, it serves as the ultimate source\n' +
      'of guidance, wisdom, and mercy for all of humanity.\n' +
      'Recited, memorized, and revered by millions across generations.',
    author: 'Allah SWT',
  },
  {
    uuid: 'sahih',
    label: 'Sahih International',
    image: 'sahih-int-cover.jpg',
    coverColor: '#06151c',
    pageText:
      ' Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    description:
      "A highly respected English translation of the Qur'an,\n" +
      'valued for its clarity, simplicity, and faithfulness to the original Arabic.\n' +
      'Ideal for readers seeking a balance between literal meaning\n' +
      'and accessible language for reflection and study.',
    author: 'Saheeh International',
  },
  {
    uuid: 'sealed-nectar',
    label: 'The Sealed Nectar',
    image: 'sealed-nectar-cover.jpg',
    coverColor: '#8a1a0a',
    pageText:
      'In the name of Allah, the Most Merciful, the Especially Merciful.\n\n' +
      'The life of Prophet Muhammad ﷺ stands as the most complete example of faith, character, patience, and leadership known to humanity. Born in the noble city of Makkah, he grew up known among his people as Al-Amin — the trustworthy. Even before revelation, his honesty and compassion distinguished him from all others.\n\n' +
      'At the age of forty, the first revelation descended in the cave of Hira, marking the beginning of a mission that would transform the world. He called his people to pure monotheism, justice, mercy, and moral excellence. Despite persecution, rejection, and hardship, he remained steadfast, showing patience and reliance upon Allah.\n\n' +
      'The migration to Madinah marked a turning point — a society built upon faith, brotherhood, and justice. Through wisdom and mercy, the Prophet ﷺ united hearts that had long been divided, establishing a community grounded in compassion and responsibility.\n\n' +
      'His life was not merely a historical account but a living model of leadership, family life, worship, and service to humanity. Every challenge he faced became a lesson, and every victory reflected humility and gratitude.\n\n' +
      'The Sealed Nectar presents this blessed biography with authenticity and care, allowing readers to journey through the most remarkable life ever lived — a life that continues to inspire hearts and guide generations toward truth, mercy, and righteousness.',
    description:
      'An award-winning biography of the Prophet Muhammad ﷺ,\n' +
      'offering a detailed and authentic account of his noble life.\n' +
      'Widely recognized as one of the best resources for\n' +
      'understanding the life, mission, and character of the Messenger.',
    author: 'Safiyyur Rahman Mubarakpuri',
  },
  {
    uuid: 'sahih-bukhari',
    label: 'Sahih al-Bukhari',
    image: 'sahih-bukhari-cover.jpg',
    coverColor: '#45310d',
    pageText:
      'In the name of Allah, the Most Merciful, the Especially Merciful.\n\n' +
      'Sahih al-Bukhari is among the most authentic and respected collections of Hadith in Islamic tradition. Compiled by Imam Muhammad ibn Ismail al-Bukhari after years of travel, study, and rigorous verification, this work preserves the sayings, actions, and approvals of the Prophet Muhammad ﷺ with unmatched precision and care.\n\n' +
      'Imam al-Bukhari examined hundreds of thousands of narrations, applying strict conditions to ensure authenticity. Only narrations with reliable chains of transmission and sound content were accepted, making this collection a foundational source for understanding Islamic belief, worship, character, and law.\n\n' +
      'Within its chapters are timeless teachings — intentions define actions, honesty elevates a believer, mercy softens hearts, and sincerity brings one closer to Allah. The Hadith gathered here illuminate daily life: from prayer and fasting to family relations, business ethics, leadership, and spiritual refinement.\n\n' +
      'This collection is not merely a historical record but a living guide, connecting readers directly to the prophetic example. Through these narrations, generations of scholars and students have sought clarity, guidance, and a deeper understanding of faith.\n\n' +
      'To study Sahih al-Bukhari is to sit in the company of the Messenger ﷺ through authentic narration — learning from his wisdom, observing his character, and striving to embody the values he taught.',
    description:
      'The most authentic collection of Hadith compiled by Imam al-Bukhari.\n' +
      'It contains sayings, actions, and approvals of Prophet Muhammad ﷺ,\n' +
      'painstakingly verified to ensure authenticity and reliability.\n' +
      'Essential for every serious student of Islamic knowledge.',
    author: 'Imam Muhammad ibn Ismail al-Bukhari',
  },
  {
    uuid: 'sahih-muslim',
    label: 'Sahih Muslim',
    image: 'sahih-muslim-cover.jpg',
    coverColor: '#123b2f',
    pageText:
      'In the name of Allah, the Most Merciful, the Especially Merciful.\n\n' +
      'Sahih Muslim is one of the most authentic and revered collections of Hadith in Islam, compiled by Imam Muslim ibn al-Hajjaj after years of dedicated scholarship and careful verification. Alongside Sahih al-Bukhari, it forms a cornerstone of prophetic tradition, preserving the words, actions, and guidance of the Messenger of Allah ﷺ with precision and integrity.\n\n' +
      'Imam Muslim devoted his life to gathering narrations from trustworthy transmitters, organizing them with remarkable clarity and structure. His methodology emphasizes consistency in chains of narration and careful grouping of related reports, allowing readers to understand teachings in a clear and systematic manner.\n\n' +
      'Within these pages are narrations that illuminate faith, worship, character, and daily conduct. The collection explores sincerity in intention, excellence in worship, compassion toward others, and the pursuit of knowledge and righteousness. Each Hadith serves as a window into the prophetic example — a guide for both the heart and the mind.\n\n' +
      'The strength of Sahih Muslim lies not only in authenticity but also in its ability to present the teachings of the Prophet ﷺ with clarity and depth. Through its chapters, readers encounter reminders that nurture faith, refine character, and strengthen one’s connection with Allah.\n\n' +
      'Studying Sahih Muslim is an invitation to reflect deeply upon the prophetic tradition — to learn, to understand, and to strive toward a life shaped by wisdom, mercy, and sincere devotion.',
    description:
      'One of the most important and authentic Hadith compilations\n' +
      'by Imam Muslim ibn al-Hajjaj.\n' +
      'Second only to Sahih al-Bukhari in authenticity,\n' +
      'it offers profound insights into the teachings and practices\n' +
      'of the Prophet Muhammad ﷺ.',
    author: 'Imam Muslim ibn al-Hajjaj',
  },
];
