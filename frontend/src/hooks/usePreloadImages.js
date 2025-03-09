import { useEffect, useState } from "react";

export const usePreloadImages = (navItems) => {
  const [preloadedImages, setPreloadedImages] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      const images = {};

      await Promise.all(
        navItems.flatMap((item) =>
          ["light", "dark"].flatMap((mode) =>
            ["", "-active"].map(
              (state) =>
                new Promise((resolve) => {
                  const img = new window.Image();
                  img.src = `/images/logos/icons/${item.icon}-${mode}${state}.svg`;

                  img.onload = () => {
                    if (!images[item.icon]) images[item.icon] = {};
                    images[item.icon][`${mode}${state}`] = img.src;
                    resolve();
                  };
                }),
            ),
          ),
        ),
      );

      setPreloadedImages(images);
    };

    loadImages();
  }, [navItems]);

  return preloadedImages;
};
