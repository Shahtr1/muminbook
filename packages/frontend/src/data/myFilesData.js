export const myFilesData = {
  'my-files': {
    empty: {},

    // Simple folders
    notes: {
      'class-1': {
        'lecture.txt': 'file',
        'homework.pdf': 'file',
      },
      'class-2': {},
      'class-3': {
        slides: {
          'week1.pptx': 'file',
          'week2.pptx': 'file',
        },
      },
    },

    // Mixed content
    documents: {
      'resume.docx': 'file',
      'cover-letter.docx': 'file',
      archive: {
        'old_resume.docx': 'file',
        'job_desc.pdf': 'file',
      },
      empty: {},
    },

    // Deep nested folders
    'project-alpha': {
      research: {
        'phase-1': {
          notes: {
            'draft.md': 'file',
            images: {
              'graph1.png': 'file',
              'chart2.png': 'file',
            },
          },
        },
        references: {
          books: {
            'book-1.pdf': 'file',
            'book-2.pdf': 'file',
            'notes.txt': 'file',
          },
        },
      },
      results: {
        'result.csv': 'file',
        'summary.pdf': 'file',
      },
    },

    // Folder with subfolders and a file
    'project-beta': {
      overview: {
        'summary.txt': 'file',
        attachments: {
          'diagram.svg': 'file',
        },
      },
      'README.md': 'file', // file at folder level
    },
    '📚-library': {
      '📖-hadiths': {
        'sahih-bukhari.txt': 'file',
      },
      '📘-seerah': {
        'life-of-prophet.pdf': 'file',
      },
    },

    // Special characters / emojis
    '📁-fun-folder': {
      '😎-memes': {
        'meme1.jpg': 'file',
        'meme2.jpg': 'file',
        gifs: {
          'funny.gif': 'file',
        },
      },
      '🎉-party': {
        'invite.png': 'file',
        'playlist.m3u': 'file',
      },
    },

    // Large file listing
    media: {
      images: Array.from({ length: 10 }, (_, i) => ({
        [`image-${i + 1}.jpg`]: 'file',
      })).reduce((acc, val) => ({ ...acc, ...val }), {}),
      videos: {
        'intro.mp4': 'file',
        'tutorial.mp4': 'file',
      },
    },

    // Edge folders
    config: {
      '.env': 'file',
      '.gitignore': 'file',
    },

    backups: {
      2021: {
        jan: {
          'backup.zip': 'file',
        },
      },
      2022: {},
    },

    // Root-level files
    'welcome.txt': 'file',
    'todo.json': 'file',
    'index.html': 'file',
    ...Array.from({ length: 50 }, (_, i) => {
      const folderName = `folder-${String(i + 1).padStart(2, '0')}`;
      return {
        [folderName]: {
          [`file-${i + 1}-a.txt`]: 'file',
          [`file-${i + 1}-b.md`]: 'file',
          [`file-${i + 1}-c.json`]: 'file',
          subfolder: {
            [`nested-${i + 1}-note.txt`]: 'file',
          },
        },
      };
    }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  },
};
