import {
  Badge,
  Box,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Grid,
  GridItem,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/* ===============================
   Hooks
================================ */

const useClock = () => {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
};

const useLocation = () => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  return coords;
};

const usePrayerData = (lat, lng) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;

    fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
    )
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, [lat, lng]);

  return data;
};

const useHijri = (date) => {
  const [hijri, setHijri] = useState(null);

  useEffect(() => {
    fetch(`https://api.aladhan.com/v1/gToH?date=${date.format('DD-MM-YYYY')}`)
      .then((res) => res.json())
      .then((res) => setHijri(res.data.hijri));
  }, [date]);

  return hijri;
};

const useQibla = (lat, lng) => {
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;

    fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`)
      .then((res) => res.json())
      .then((res) => setDirection(res.data.direction));
  }, [lat, lng]);

  return direction;
};

const useDailyAyah = () => {
  const [ayah, setAyah] = useState(null);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/ayah/random/en.asad')
      .then((res) => res.json())
      .then((res) => setAyah(res.data));
  }, []);

  return ayah;
};

/* ===============================
   Helpers
================================ */

const getNextPrayer = (timings, now) => {
  const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (let name of order) {
    const time = timings[name];
    const prayerTime = dayjs(`${now.format('YYYY-MM-DD')} ${time}`);
    if (prayerTime.isAfter(now)) {
      return { name, time: prayerTime };
    }
  }
  return null;
};

const getRemaining = (target, now) => {
  const diff = target.diff(now);
  const d = dayjs.duration(diff);
  return `${d.hours()}h ${d.minutes()}m remaining`;
};

/* ===============================
   Tile
================================ */

const Tile = ({ children, colSpan = 1, rowSpan = 1 }) => {
  const { surface, border } = useSemanticColors();

  return (
    <GridItem colSpan={colSpan} rowSpan={rowSpan}>
      <Box
        bg={surface.content}
        border="1px solid"
        borderColor={border.subtle}
        borderRadius="2xl"
        p={6}
        h="100%"
        transition="all 0.25s ease"
        _hover={{
          transform: 'translateY(-4px)',
          bg: surface.elevated,
          borderColor: border.default,
        }}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        {children}
      </Box>
    </GridItem>
  );
};

/* ===============================
   Dashboard
   This is a mock dashboard for now, only the live data is correct, but needs more testing, user specific data is mocked
================================ */

export const Dashboard = () => {
  const { surface, text, border, brand } = useSemanticColors();

  const now = useClock();
  const coords = useLocation();
  const prayerData = usePrayerData(coords?.lat, coords?.lng);
  const hijri = useHijri(now);
  const qibla = useQibla(coords?.lat, coords?.lng);
  const ayah = useDailyAyah();

  const nextPrayer = prayerData && getNextPrayer(prayerData.timings, now);

  /* Mock User State */
  const dhikrCount = 124;
  const dhikrTarget = 200;
  const prayersCompleted = 3;

  return (
    <Box
      h="100%"
      w="100%"
      bg={surface.base}
      overflow={{ base: 'auto', lg: 'hidden' }}
      p={{ base: 4, md: 6 }}
    >
      <Grid
        h={{ base: 'auto', lg: '100%' }}
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        templateRows={{
          base: 'auto',
          md: 'repeat(6, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={{ base: 4, md: 5 }}
      >
        {/* Clock */}
        <Tile colSpan={2} rowSpan={2}>
          <Box>
            <Text
              fontSize="10px"
              letterSpacing="2px"
              textTransform="uppercase"
              color={text.secondary}
            >
              Current Time
            </Text>

            <Text
              fontSize="6xl"
              fontWeight="700"
              fontFamily="mono"
              color={text.primary}
            >
              {now.format('HH:mm')}
            </Text>

            <Text fontSize="sm" color={text.secondary}>
              {now.format('ddd, MMM D')} •{' '}
              {hijri ? `${hijri.day} ${hijri.month.en}` : <Spinner size="xs" />}
            </Text>
          </Box>

          <Flex justify="space-between" fontSize="xs" color={text.secondary}>
            <Text>Sunrise {prayerData?.timings?.Sunrise || '--:--'}</Text>
            <Text>Sunset {prayerData?.timings?.Sunset || '--:--'}</Text>
          </Flex>
        </Tile>

        {/* Hijri */}
        <Tile>
          <Text
            fontSize="10px"
            letterSpacing="2px"
            textTransform="uppercase"
            color={text.secondary}
          >
            Hijri Date
          </Text>

          <Text fontSize="lg" fontWeight="600" color={text.primary}>
            {hijri ? (
              `${hijri.day} ${hijri.month.en} ${hijri.year} AH`
            ) : (
              <Spinner size="sm" />
            )}
          </Text>

          <Divider my={2} borderColor={border.subtle} />
        </Tile>

        {/* Dhikr (Mock) */}
        <Tile>
          <Text
            fontSize="10px"
            letterSpacing="2px"
            textTransform="uppercase"
            color={text.secondary}
          >
            Dhikr
          </Text>

          <Text fontSize="4xl" fontWeight="bold" color={text.primary}>
            {dhikrCount}
          </Text>

          <Text fontSize="xs" color={text.secondary}>
            Target: {dhikrTarget} •{' '}
            {Math.round((dhikrCount / dhikrTarget) * 100)}% completed
          </Text>
        </Tile>

        {/* Prayer Progress (Mock) */}
        <Tile rowSpan={2}>
          <Flex direction="column" align="center" justify="center" h="100%">
            <Text
              fontSize="10px"
              letterSpacing="2px"
              textTransform="uppercase"
              color={text.secondary}
              mb={4}
            >
              Prayers Today
            </Text>

            <CircularProgress
              value={(prayersCompleted / 5) * 100}
              size="120px"
              thickness="6px"
              trackColor={border.subtle}
              color={brand.primary}
            >
              <CircularProgressLabel fontWeight="bold">
                {prayersCompleted} / 5
              </CircularProgressLabel>
            </CircularProgress>
          </Flex>
        </Tile>

        {/* Next Prayer */}
        <Tile colSpan={2}>
          <Box>
            <Text
              fontSize="10px"
              letterSpacing="2px"
              textTransform="uppercase"
              color={text.secondary}
            >
              Next Prayer
            </Text>

            <Text fontSize="3xl" fontWeight="700" color={text.primary}>
              {nextPrayer ? nextPrayer.name : <Spinner size="sm" />}
            </Text>

            <Text fontSize="sm" color={text.secondary}>
              {nextPrayer ? getRemaining(nextPrayer.time, now) : ''}
            </Text>
          </Box>

          <Divider borderColor={border.subtle} />

          <Flex justify="space-between" fontSize="xs" color={text.secondary}>
            <Text>Isha {prayerData?.timings?.Isha || '--:--'}</Text>
            <Text>Maghrib {prayerData?.timings?.Maghrib || '--:--'}</Text>
          </Flex>
        </Tile>

        {/* Daily Ayah */}
        <Tile colSpan={2} rowSpan={2}>
          <Box>
            <Text
              fontSize="10px"
              letterSpacing="2px"
              textTransform="uppercase"
              color={text.secondary}
            >
              Daily Ayah
            </Text>

            <Text fontSize="lg" fontWeight="500" mt={3} color={text.primary}>
              {ayah ? `“${ayah.text}”` : <Spinner size="sm" />}
            </Text>
          </Box>

          <Text fontSize="xs" color={text.secondary}>
            {ayah
              ? `Surah ${ayah.surah.englishName} ${ayah.numberInSurah}`
              : ''}
          </Text>
        </Tile>

        {/* Quran Progress (Mock) */}
        <Tile>
          <Text
            fontSize="10px"
            letterSpacing="2px"
            textTransform="uppercase"
            color={text.secondary}
          >
            Quran Progress
          </Text>

          <Flex direction="column" align="center" justify="center" flex={1}>
            <CircularProgress
              value={42}
              size="110px"
              thickness="8px"
              trackColor={border.subtle}
              color={brand.primary}
            >
              <CircularProgressLabel>
                <Flex direction="column" align="center">
                  <Text fontSize="xl" fontWeight="bold" color={text.primary}>
                    42 %
                  </Text>
                </Flex>
              </CircularProgressLabel>
            </CircularProgress>

            <Text mt={3} fontSize="xs" color={text.secondary}>
              12 / 30 Juz completed
            </Text>
          </Flex>
        </Tile>

        {/* Qibla */}
        <Tile>
          <Text
            fontSize="10px"
            letterSpacing="2px"
            textTransform="uppercase"
            color={text.secondary}
          >
            Qibla
          </Text>

          <Flex align="center" justify="center" flex={1}>
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              border="2px solid"
              borderColor={border.default}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              fontSize="lg"
              color={text.primary}
            >
              {qibla ? `${Math.round(qibla)}°` : <Spinner size="sm" />}
            </Box>
          </Flex>
        </Tile>

        {/* Open Suhuf (Mock) */}
        <Tile colSpan={2}>
          <Text
            fontSize="10px"
            letterSpacing="2px"
            textTransform="uppercase"
            color={text.secondary}
          >
            Open Suhuf
          </Text>

          <Flex mt={3} gap={2} wrap="wrap">
            <Badge bg={brand.primary} color="white">
              Untitled • Edited 5m ago
            </Badge>

            <Badge bg={border.subtle} color={text.primary}>
              Reflection • 3 notes
            </Badge>

            <Badge bg={surface.elevated} color={text.primary}>
              Ramadan Notes • Active
            </Badge>
          </Flex>
        </Tile>
      </Grid>
    </Box>
  );
};
