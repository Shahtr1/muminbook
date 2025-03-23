export const myFiles = {
  "my-files": {
    empty: {},
    // Simple folders
    notes: {
      "class-1": {
        "lecture.txt": "file",
        "homework.pdf": "file",
      },
      "class-2": {},
    },

    // Mixed content
    documents: {
      "resume.docx": "file",
      "cover-letter.docx": "file",
      archive: {
        "old_resume.docx": "file",
      },
      empty: {},
    },

    // Deep nested folders
    "project-alpha": {
      research: {
        "phase-1": {
          notes: {
            "draft.md": "file",
          },
        },
        references: {
          "book-1.pdf": "file",
          "book-2.pdf": "file",
        },
      },
    },

    // Folder with subfolders and a file
    "project-beta": {
      overview: {
        "summary.txt": "file",
      },
      "README.md": "file", // file at folder level
    },

    // Edge case: folder with special characters
    "📁-fun-folder": {
      "😎-memes": {
        "meme1.jpg": "file",
        "meme2.jpg": "file",
      },
    },

    // Root-level files
    "welcome.txt": "file",
    "todo.json": "file",
  },
};
