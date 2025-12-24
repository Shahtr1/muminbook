import { describe, it, expect, vi } from 'vitest';
import { createFamilyTree } from '../createFamilyTree.js';

// Mock the nodePositions import
vi.mock('@/utils/nodePositions.js', () => ({
  nodePositions: {
    adam: { x: 200, y: 50 },
    nuh: { x: 200, y: 240 },
    muhammad: { x: 500, y: 1850 },
  },
}));

describe('createFamilyTree', () => {
  it('should return empty array when given empty array', () => {
    const result = createFamilyTree([]);
    expect(result).toEqual([]);
  });

  it('should return empty array when given no argument', () => {
    const result = createFamilyTree();
    expect(result).toEqual([]);
  });

  it('should transform basic tree node with all properties', () => {
    const input = [
      {
        _id: '123',
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        lineages: ['lineage1'],
        parents: [],
        label: 'Adam Label',
      },
    ];

    const result = createFamilyTree(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '123',
      data: {
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        label: 'Adam Label',
        timeline: 'antediluvian',
        lineages: ['lineage1'],
        ulul_azm: false,
      },
      position: { x: 200, y: 50 },
      draggable: true,
      type: 'prophet',
      parents: [],
    });
  });

  it('should identify prophet type correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'nuh',
        biblicalName: 'Noah',
        islamicName: 'Nuh',
        arabicName: 'نوح',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'muhammad',
        biblicalName: 'Muhammad',
        islamicName: 'Muhammad',
        arabicName: 'محمد',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].type).toBe('prophet');
    expect(result[1].type).toBe('prophet');
    expect(result[2].type).toBe('prophet');
  });

  it('should identify caliph type correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'abubakr',
        biblicalName: '',
        islamicName: 'Abu Bakr',
        arabicName: 'أبو بكر',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'umar',
        biblicalName: '',
        islamicName: 'Umar',
        arabicName: 'عمر',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'uthman',
        biblicalName: '',
        islamicName: 'Uthman',
        arabicName: 'عثمان',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '4',
        uuid: 'ali',
        biblicalName: '',
        islamicName: 'Ali',
        arabicName: 'علي',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].type).toBe('caliph');
    expect(result[1].type).toBe('caliph');
    expect(result[2].type).toBe('caliph');
    expect(result[3].type).toBe('caliph');
  });

  it('should identify banner type correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'qurayshtribe',
        biblicalName: '',
        islamicName: 'Quraysh',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'banuisrael',
        biblicalName: '',
        islamicName: 'Banu Israel',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].type).toBe('banner');
    expect(result[1].type).toBe('banner');
  });

  it('should identify flag type correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'abbasid',
        biblicalName: '',
        islamicName: 'Abbasid',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'umayyad',
        biblicalName: '',
        islamicName: 'Umayyad',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].type).toBe('flag');
    expect(result[1].type).toBe('flag');
  });

  it('should default to text type for unknown uuids', () => {
    const input = [
      {
        _id: '1',
        uuid: 'unknown',
        biblicalName: '',
        islamicName: 'Unknown',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'another',
        biblicalName: '',
        islamicName: 'Another',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].type).toBe('text');
    expect(result[1].type).toBe('text');
  });

  it('should set ulul_azm to true for special prophets', () => {
    const input = [
      {
        _id: '1',
        uuid: 'nuh',
        biblicalName: 'Noah',
        islamicName: 'Nuh',
        arabicName: 'نوح',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'ibrahim',
        biblicalName: 'Abraham',
        islamicName: 'Ibrahim',
        arabicName: 'إبراهيم',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'musa',
        biblicalName: 'Moses',
        islamicName: 'Musa',
        arabicName: 'موسى',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '4',
        uuid: 'isa',
        biblicalName: 'Jesus',
        islamicName: 'Isa',
        arabicName: 'عيسى',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '5',
        uuid: 'muhammad',
        biblicalName: 'Muhammad',
        islamicName: 'Muhammad',
        arabicName: 'محمد',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.ulul_azm).toBe(true);
    expect(result[1].data.ulul_azm).toBe(true);
    expect(result[2].data.ulul_azm).toBe(true);
    expect(result[3].data.ulul_azm).toBe(true);
    expect(result[4].data.ulul_azm).toBe(true);
  });

  it('should set ulul_azm to false for non-ulul_azm prophets', () => {
    const input = [
      {
        _id: '1',
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'yusuf',
        biblicalName: 'Joseph',
        islamicName: 'Yusuf',
        arabicName: 'يوسف',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.ulul_azm).toBe(false);
    expect(result[1].data.ulul_azm).toBe(false);
  });

  it('should assign antediluvian timeline correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'idris',
        biblicalName: 'Enoch',
        islamicName: 'Idris',
        arabicName: 'إدريس',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'nuh',
        biblicalName: 'Noah',
        islamicName: 'Nuh',
        arabicName: 'نوح',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.timeline).toBe('antediluvian');
    expect(result[1].data.timeline).toBe('antediluvian');
    expect(result[2].data.timeline).toBe('antediluvian');
  });

  it('should assign arabic timeline correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'hud',
        biblicalName: '',
        islamicName: 'Hud',
        arabicName: 'هود',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'saleh',
        biblicalName: '',
        islamicName: 'Saleh',
        arabicName: 'صالح',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'muhammad',
        biblicalName: 'Muhammad',
        islamicName: 'Muhammad',
        arabicName: 'محمد',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.timeline).toBe('arabic');
    expect(result[1].data.timeline).toBe('arabic');
    expect(result[2].data.timeline).toBe('arabic');
  });

  it('should assign israelite timeline correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'musa',
        biblicalName: 'Moses',
        islamicName: 'Musa',
        arabicName: 'موسى',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'harun',
        biblicalName: 'Aaron',
        islamicName: 'Harun',
        arabicName: 'هارون',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'isa',
        biblicalName: 'Jesus',
        islamicName: 'Isa',
        arabicName: 'عيسى',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.timeline).toBe('israelite');
    expect(result[1].data.timeline).toBe('israelite');
    expect(result[2].data.timeline).toBe('israelite');
  });

  it('should assign other timeline correctly', () => {
    const input = [
      {
        _id: '1',
        uuid: 'ayyub',
        biblicalName: 'Job',
        islamicName: 'Ayyub',
        arabicName: 'أيوب',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'lut',
        biblicalName: 'Lot',
        islamicName: 'Lut',
        arabicName: 'لوط',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'yunus',
        biblicalName: 'Jonah',
        islamicName: 'Yunus',
        arabicName: 'يونس',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.timeline).toBe('other');
    expect(result[1].data.timeline).toBe('other');
    expect(result[2].data.timeline).toBe('other');
  });

  it('should default to "father" timeline for unknown uuids', () => {
    const input = [
      {
        _id: '1',
        uuid: 'unknown',
        biblicalName: '',
        islamicName: 'Unknown',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].data.timeline).toBe('father');
  });

  it('should use default position {x: 0, y: 0} for unknown uuids', () => {
    const input = [
      {
        _id: '1',
        uuid: 'unknown',
        biblicalName: '',
        islamicName: 'Unknown',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].position).toEqual({ x: 0, y: 0 });
  });

  it('should use nodePositions for known uuids', () => {
    const input = [
      {
        _id: '1',
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'muhammad',
        biblicalName: 'Muhammad',
        islamicName: 'Muhammad',
        arabicName: 'محمد',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].position).toEqual({ x: 200, y: 50 });
    expect(result[1].position).toEqual({ x: 500, y: 1850 });
  });

  it('should always set draggable to true', () => {
    const input = [
      {
        _id: '1',
        uuid: 'adam',
        biblicalName: 'Adam',
        islamicName: 'Adam',
        arabicName: 'آدم',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'unknown',
        biblicalName: '',
        islamicName: 'Unknown',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].draggable).toBe(true);
    expect(result[1].draggable).toBe(true);
  });

  it('should preserve parents array', () => {
    const input = [
      {
        _id: '1',
        uuid: 'child',
        biblicalName: '',
        islamicName: 'Child',
        arabicName: '',
        lineages: [],
        parents: ['parent1', 'parent2'],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].parents).toEqual(['parent1', 'parent2']);
  });

  it('should preserve empty parents array', () => {
    const input = [
      {
        _id: '1',
        uuid: 'root',
        biblicalName: '',
        islamicName: 'Root',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].parents).toEqual([]);
  });

  it('should handle multiple nodes with different types', () => {
    const input = [
      {
        _id: '1',
        uuid: 'muhammad',
        biblicalName: 'Muhammad',
        islamicName: 'Muhammad',
        arabicName: 'محمد',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '2',
        uuid: 'ali',
        biblicalName: '',
        islamicName: 'Ali',
        arabicName: 'علي',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '3',
        uuid: 'qurayshtribe',
        biblicalName: '',
        islamicName: 'Quraysh',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '4',
        uuid: 'umayyad',
        biblicalName: '',
        islamicName: 'Umayyad',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
      {
        _id: '5',
        uuid: 'other',
        biblicalName: '',
        islamicName: 'Other',
        arabicName: '',
        lineages: [],
        parents: [],
        label: '',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].type).toBe('prophet');
    expect(result[1].type).toBe('caliph');
    expect(result[2].type).toBe('banner');
    expect(result[3].type).toBe('flag');
    expect(result[4].type).toBe('text');
  });

  it('should preserve all data properties', () => {
    const input = [
      {
        _id: 'test123',
        uuid: 'yusuf',
        biblicalName: 'Joseph',
        islamicName: 'Yusuf',
        arabicName: 'يوسف',
        lineages: ['lineage1', 'lineage2'],
        parents: ['yaqub'],
        label: 'Test Label',
      },
    ];

    const result = createFamilyTree(input);

    expect(result[0].id).toBe('test123');
    expect(result[0].data.uuid).toBe('yusuf');
    expect(result[0].data.biblicalName).toBe('Joseph');
    expect(result[0].data.islamicName).toBe('Yusuf');
    expect(result[0].data.arabicName).toBe('يوسف');
    expect(result[0].data.label).toBe('Test Label');
    expect(result[0].data.lineages).toEqual(['lineage1', 'lineage2']);
    expect(result[0].parents).toEqual(['yaqub']);
  });
});
