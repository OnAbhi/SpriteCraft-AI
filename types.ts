export enum SpriteCategory {
  Human = 'Human',
  Soldier = 'Soldier',
  Alien = 'Alien',
  Monster = 'Monster',
  Robot = 'Robot',
  Animal = 'Animal',
  NPC = 'NPC',
  Boss = 'Boss Character'
}

export enum SpriteStyle {
  PixelArt8Bit = 'Pixel Art (8-bit)',
  PixelArt16Bit = 'Pixel Art (16-bit)',
  PixelArt32Bit = 'Pixel Art (32-bit)',
  PixelArt64Bit = 'Pixel Art (64-bit)',
  PixelArt128Bit = 'High Def 2D (128-bit)',
  Cartoon = 'Cartoon',
  DarkFantasy = 'Dark Fantasy',
  SciFi = 'Sci-Fi',
  Chibi = 'Cute / Chibi',
  Realistic = 'Realistic 2D'
}

export enum SpriteWeapon {
  None = 'None',
  Sword = 'Sword',
  Dagger = 'Dagger',
  Axe = 'Axe',
  Spear = 'Spear',
  Bow = 'Bow & Arrow',
  Staff = 'Magic Staff',
  Wand = 'Wand',
  Pistol = 'Pistol',
  Rifle = 'Assault Rifle',
  LaserGun = 'Laser Gun',
  PlasmaCannon = 'Plasma Cannon',
  Shield = 'Shield & Weapon',
  Claws = 'Natural Claws'
}

export enum AnimationState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Jump = 'Jump',
  Attack = 'Attack',
  Hit = 'Hit / Damage',
  Death = 'Death'
}

export interface SpriteConfig {
  category: SpriteCategory;
  style: SpriteStyle;
  weapon: SpriteWeapon;
  description: string;
}

export interface GeneratedFrame {
  id: string;
  state: AnimationState;
  imageUrl: string; // Base64 data URL
  timestamp: number;
}

export interface ProjectState {
  config: SpriteConfig;
  frames: GeneratedFrame[];
}