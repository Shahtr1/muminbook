# What Is an Aggregation Pipeline?

Think of an aggregation pipeline like an assembly line in a factory.

Raw documents go in.
Each station modifies them.
Final result comes out.

Each “station” is called a stage.

```js
[{ $match: { age: { $gt: 18 } } }, { $sort: { age: 1 } }, { $limit: 10 }];
```

Documents flow through these stages one by one.

## Mental Model

Imagine you have this collection:

```json
[
  { "name": "Ali", "age": 25 },
  { "name": "Omar", "age": 17 },
  { "name": "Zayd", "age": 30 }
]
```

Now you run:

```js
db.users.aggregate([{ $match: { age: { $gt: 18 } } }, { $sort: { age: 1 } }]);
```

Stage 1 – `$match`

Filters documents.

```json
[
  { "name": "Ali", "age": 25 },
  { "name": "Zayd", "age": 30 }
]
```

Stage 2 – `$sort`

Sorts the remaining documents.

```json
[
  { "name": "Ali", "age": 25 },
  { "name": "Zayd", "age": 30 }
]
```

Each stage transforms what it receives.

It’s MongoDB’s version of SQL's:

- `SELECT`

- `JOIN`

- `GROUP BY`

- `HAVING`

- `ORDER BY`

But expressed as a pipeline.

## Now Complex Example

`quran` collection

```json
{
  uuid: 1,
  surahId: ObjectId("..."),
  ayahNumber: 1,
  juzId: ObjectId("..."),
  sajda: {
    recommended: false,
    obligatory: false
  }
}

```

`surahs` collection

```json
{
  _id: ObjectId("..."),
  uuid: 1,
  name: "Al-Fatiha"
}

```

`quran_content`

```json
{
  "uuid": 1,
  "category": "translation",
  "source": "sahih",
  "text": "In the name of Allah..."
}
```

## The Aggregation Pipeline:

This runs on `quran` collection.

```js
const pipeline = [
  // 1️⃣ Join Surah information
  {
    $lookup: {
      from: 'surahs',
      localField: 'surahId',
      foreignField: '_id',
      as: 'surah',
    },
  },

  // Because $lookup returns an array.
  //   We flatten it into a single object.
  { $unwind: '$surah' },

  // 2️⃣ Join Sahih translation
  {
    $lookup: {
      from: 'quran_content',
      let: { localUuid: '$uuid' }, // const localUuid = currentDocument.uuid;
      pipeline: [
        // This is a mini aggregation that runs inside quran_content.
        {
          $match: {
            $expr: {
              // Without $expr, Mongo thinks both sides are literal values.
              $and: [
                { $eq: ['$uuid', '$$localUuid'] },
                { $eq: ['$category', 'translation'] },
                { $eq: ['$source', 'sahih'] },
              ],
            },
          },
        },
      ],
      as: 'translation',
    }, // Mongo ALWAYS returns an array. Even if only one match exists.
    /**
    Because $lookup is designed for:

      One-to-many relationships

    Zero matches

    Multiple matches
      **/
  },

  {
    $addFields: {
      translation: { $arrayElemAt: ['$translation', 0] }, // "Give me the element at this position inside the array."
    },

    /**
     Why Do We Do This?
     Because later, you want to access:
     '$translation.text'
     If you don’t flatten it, you'd need:
     '$translation[0].text'
     Mongo aggregation doesn’t support array indexing like JavaScript.
     So we extract it cleanly first.
     */
  },

  // 3️⃣ Group by Surah
  {
    $group: {
      _id: '$surah._id', // GROUP BY surah._i, All ayahs of same surah become ONE document.

      surahName: { $first: '$surah.name' }, // Take first value encountered, Since all same, safe.

      totalAyahs: { $sum: 1 },

      firstAyahUuid: { $min: '$uuid' },

      sajdaCount: {
        $sum: {
          $cond: [{ $or: ['$sajda.recommended', '$sajda.obligatory'] }, 1, 0],
        },
      },

      hasSajda: {
        $max: {
          $cond: [{ $or: ['$sajda.recommended', '$sajda.obligatory'] }, 1, 0],
        },
      },

      juzSet: { $addToSet: '$juzId' },
    },
  },

  // 4️⃣ Calculate derived fields
  {
    $addFields: {
      totalJuzSpanned: { $size: '$juzSet' },
    },
  },

  // 5️⃣ Join first ayah Arabic text
  {
    $lookup: {
      from: 'quran',
      localField: 'firstAyahUuid',
      foreignField: 'uuid',
      as: 'firstAyah',
    },
  },

  { $unwind: '$firstAyah' },

  // 6️⃣ Join first ayah translation
  {
    $lookup: {
      from: 'quran_content',
      let: { localUuid: '$firstAyahUuid' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$uuid', '$$localUuid'] },
                { $eq: ['$category', 'translation'] },
                { $eq: ['$source', 'sahih'] },
              ],
            },
          },
        },
      ],
      as: 'firstTranslation',
    },
  },

  {
    $addFields: {
      firstTranslation: {
        $arrayElemAt: ['$firstTranslation', 0],
      },
    },
  },

  // 7️⃣ Final shape
  {
    $project: {
      _id: 0,
      surahName: 1,
      totalAyahs: 1,
      hasSajda: { $toBool: '$hasSajda' },
      sajdaCount: 1,
      totalJuzSpanned: 1,
      firstAyahUuid: 1,
      firstTranslation: '$firstTranslation.text',
    },
  },
];
```

## FInal Output

```json
{
  "surahName": "Al-Baqarah",
  "totalAyahs": 286,
  "hasSajda": true,
  "sajdaCount": 1,
  "totalJuzSpanned": 3,
  "firstAyahUuid": 8,
  "firstTranslation": "Alif, Lam, Meem."
}
```
