import React, { useMemo } from 'react';
import { Box, Flex, Image, List, Text, useColorMode } from '@chakra-ui/react';
import './Book.css';
import { useColorShades } from '@/theme/useColorShades.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

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
  const { brand, text } = useSemanticColors();

  const filledText = useMemo(() => {
    if (!pageText) return '';
    return Array(20).fill(pageText).join(' ');
  }, [pageText]);

  const pages = useMemo(
    () => Array.from({ length: pagesCount }, () => filledText),
    [filledText, pagesCount]
  );

  return (
    <List minW={width} {...rest}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        textAlign="center"
      >
        {/* 3D Book ONLY */}
        <Box
          className={`book ${isDark ? 'dark' : ''} ${uuid}`}
          style={{
            '--cover-light': shades?.light,
            '--cover-base': shades?.base,
            '--cover-dark': shades?.dark,
          }}
        >
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
                <Box as="div" className="coverDesign">
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
            <Box as="li" />
          </ul>

          <ul className="page">
            {pages.map((text, pageIndex) => (
              <Box as="li" key={pageIndex}>
                <div className="page-content">
                  <p>{text}</p>
                </div>
              </Box>
            ))}
          </ul>

          <ul className="hardcover_back">
            <Box as="li" />
            <Box as="li" />
          </ul>

          <ul className="book_spine">
            <Box as="li" />
            <Box as="li" />
          </ul>
        </Box>

        <Box
          className="book-caption"
          mt={{ base: 4, md: 0 }}
          ml={{ base: 0, md: 8 }}
          width={{ base: '100%', md: '310px' }}
        >
          <Text
            fontFamily="QuattrocentoRegular"
            fontSize="35px"
            color={brand.dark}
          >
            {captionTitle}
          </Text>

          <Box
            display={{ base: 'none', md: 'block' }}
            width="100%"
            height="2px"
            bgGradient={`linear(to-l, ${
              isDark ? 'bg.dark' : 'bg.light'
            }, ${brand.dark})`}
            mb={2}
          />

          <Text color={text.disabled} fontSize="sm">
            {author}
          </Text>

          <Box
            display={{ base: 'none', md: 'block' }}
            maxH="120px"
            overflowY="auto"
            sx={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Text>{description}</Text>
          </Box>
        </Box>
      </Flex>
    </List>
  );
};

export default Book;
