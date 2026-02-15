import React, { useMemo } from 'react';
import { Box, Image, List, useColorMode } from '@chakra-ui/react';
import './Book.css';
import { useColorShades } from '@/theme/useColorShades.js';

const Book = ({
  coverColor,
  ribbon,
  title,
  uuid,
  subtitle,
  captionTitle,
  author,
  description,
  imageSrc,
  pageText = '',
  pagesCount = 5,
  width = '500px',
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const shades = useColorShades(coverColor, isDark);
  const filledText = useMemo(() => {
    if (!pageText) return '';

    // repeat text enough times to look dense
    return Array(20).fill(pageText).join(' ');
  }, [pageText]);

  const pages = useMemo(
    () => Array.from({ length: pagesCount }, () => filledText),
    [filledText, pagesCount]
  );

  return (
    <List minW={width} {...rest}>
      <div className="book-wrapper">
        <figure
          className={`book ${isDark ? 'dark' : ''} ${uuid}`}
          style={{
            '--cover-light': shades?.light,
            '--cover-base': shades?.base,
            '--cover-dark': shades?.dark,
          }}
        >
          {/* Front */}
          <ul className="hardcover_front">
            <Box as="li">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={captionTitle}
                  width="100%"
                  height="100%"
                />
              ) : (
                <Box as="div" className={`coverDesign`}>
                  {ribbon && (
                    <Box as="span" className="ribbon">
                      {ribbon}
                    </Box>
                  )}
                  <Box as="h1">{title}</Box>
                  <Box as="p">{subtitle}</Box>
                </Box>
              )}
            </Box>
            <Box as="li"></Box>
          </ul>

          {/* Pages */}
          <ul className="page">
            {pages.map((text, pageIndex) => (
              <Box as="li" key={pageIndex}>
                <div className="page-content">
                  <p>{text}</p>
                </div>
              </Box>
            ))}
          </ul>

          {/* Back */}
          <ul className="hardcover_back">
            <Box as="li"></Box>
            <Box as="li"></Box>
          </ul>

          <ul className="book_spine">
            <Box as="li" />
            <Box as="li" />
          </ul>

          <figcaption>
            <h1>{captionTitle}</h1>
            <span>{author}</span>
            <p>{description}</p>
          </figcaption>
        </figure>
      </div>
    </List>
  );
};

export default Book;
