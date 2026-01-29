import { ReadingDocument } from '../models/reading/reading.model';

export const readingsApi: Partial<ReadingDocument>[] = [
  {
    uuid: 'quran',
    label: "The Holy Qur'an",
    color: '#0EB25D',
    description:
      "The timeless and unaltered Arabic text of the Noble Qur'an.\n" +
      'Revealed over 1,400 years ago, it serves as the ultimate source\n' +
      'of guidance, wisdom, and mercy for all of humanity.\n' +
      'Recited, memorized, and revered by millions across generations.',
  },
  {
    uuid: 'sahih-international',
    label: 'Sahih International',
    color: '#0E5DB2',
    description:
      "A highly respected English translation of the Qur'an,\n" +
      'valued for its clarity, simplicity, and faithfulness to the original Arabic.\n' +
      'Ideal for readers seeking a balance between literal meaning\n' +
      'and accessible language for reflection and study.',
  },
  {
    uuid: 'sealed-nectar',
    label: 'The Sealed Nectar',
    color: '#db461e',
    description:
      'An award-winning biography of the Prophet Muhammad ﷺ,\n' +
      'offering a detailed and authentic account of his noble life.\n' +
      'Widely recognized as one of the best resources for\n' +
      'understanding the life, mission, and character of the Messenger.',
  },
  {
    uuid: 'sahih-bukhari',
    label: 'Sahih al-Bukhari',
    color: '#B26A0E',
    description:
      'The most authentic collection of Hadith compiled by Imam al-Bukhari.\n' +
      'It contains sayings, actions, and approvals of Prophet Muhammad ﷺ,\n' +
      'painstakingly verified to ensure authenticity and reliability.\n' +
      'Essential for every serious student of Islamic knowledge.',
  },
  {
    uuid: 'sahih-muslim',
    label: 'Sahih Muslim',
    color: '#0EB2A4',
    description:
      'One of the most important and authentic Hadith compilations\n' +
      'by Imam Muslim ibn al-Hajjaj.\n' +
      'Second only to Sahih al-Bukhari in authenticity,\n' +
      'it offers profound insights into the teachings and practices\n' +
      'of the Prophet Muhammad ﷺ.',
  },
];
