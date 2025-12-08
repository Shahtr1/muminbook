import { describe, it, expect } from "vitest";

describe("Example utility functions", () => {
  describe("String utilities", () => {
    it("should capitalize first letter", () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
    });

    it("should truncate long strings", () => {
      const truncate = (str, maxLength) => {
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength) + "...";
      };

      expect(truncate("Hello World", 5)).toBe("Hello...");
      expect(truncate("Hi", 10)).toBe("Hi");
    });
  });

  describe("Array utilities", () => {
    it("should chunk array into smaller arrays", () => {
      const chunk = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("should filter unique values", () => {
      const unique = (arr) => [...new Set(arr)];

      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
    });
  });

  describe("Object utilities", () => {
    it("should check if object is empty", () => {
      const isEmpty = (obj) => Object.keys(obj).length === 0;

      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ key: "value" })).toBe(false);
    });

    it("should pick properties from object", () => {
      const pick = (obj, keys) => {
        return keys.reduce((result, key) => {
          if (key in obj) result[key] = obj[key];
          return result;
        }, {});
      };

      const user = { id: 1, name: "John", email: "john@example.com", age: 30 };
      const result = pick(user, ["name", "email"]);

      expect(result).toEqual({ name: "John", email: "john@example.com" });
    });
  });
});
