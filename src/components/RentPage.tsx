import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { getSteamMarketPrice, calculateDailyRate } from '../utils/steamMarket';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency, type SupportedCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { predefinedSkins, PredefinedSkin } from '../utils/predefinedSkins';
import { useCart } from '../contexts/CartContext';
import DownloadModal from './DownloadModal';
import DownloadCTA from './DownloadCTA';
import useDownloadPrompts from '../hooks/useDownloadPrompts';

interface Skin {
  id: string;
  name: string;
  weapon: {
    id: string;
    weapon_id: number;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  pattern: {
    id: string;
    name: string;
  };
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  stattrak: boolean;
  souvenir: boolean;
  finish_catalog: number;
  images: {
    [key: string]: string;
  };
  image?: string;
  possible: string[];
  types: string[];
  inspect: {
    gen: string | { [key: string]: string };
    links: { [key: string]: string };
  };
  price: number;
  wear: number;
  owner: string;
  minRentDays: number;
  maxRentDays: number;
  dailyRate: number;
  wearName: string;
  lastRented?: string;
}

// Add interface for API data
interface SkinDetails {
  weapon: string;
  weapon_catalog: number;
  finish: string;
  finish_catalog: number;
  rarity: string;
  color: string;
  images: {
    [key: string]: string;
  };
  image?: string;
  possible: string[];
  types: string[];
  inspect: {
    gen: string | { [key: string]: string };
    links: { [key: string]: string };
  };
}

// Expanded mapping for popular skins to CSGOStash URLs (user to fill in URLs)
export const csgostashUrlMap: Record<string, string> = {
  'awp_dragon_lore_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDYyMUZBUjE3UDdOZFRSSC10MjZxNFNabHZEN1BZVFFnWHR1NU14Mmd2MlByZFNpakFXd3FrVnROMjcySklHZEp3NDZZVnJZcVZPM3hMeS1nSkM5dTV2QnlDQmg2eWdpN1dHZHdVS1RZZFJEOEE-/auto/auto/85/notrim/53e3a7a23f47500e6e1651c084bc1fcf.webp',
  'karambit_doppler_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdmJTc0xRSmYyUExhY0RCQTVjaUpsWTIwa19qa0k3ZlVoRlJCNE1SaWo3ai0tWVh5Z0VENnFVSTlhbV8xSXRlVEl3UTZNMTNTX2dmb3llZnBncFhxdFpTYnlDZGl2bllxNXluZnlVUGhoZ1lNTUxKSTNBYWwzZw--/auto/auto/85/notrim/e06931887d6f8f343bb68a902e3a7f1e.webp',
  'usp_s_kill_confirmed_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvbzZtMUZCUnAzX2JHY2poUTA5LWpxNVdZaDhqX09yZmRxV2hlNXNONG1PVEU4YlA1Z1ZPOHYxMDZOVDM3TFktY0pBWnZaRi1FckFDN3dMaTYwTU81N3M3TndTQmd2U2drc3luYW1FZm1pUkJKY0tVeDBuVWZsbWow/auto/auto/85/notrim/ab57cbbcfb4f09715cad3e41e347ef46.webp',
  'm4a1s_hyper_beast_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdS02a2VqaHoydl9OZno1SF91TzFnYi1Hd19hbERMUElobTVEMThkMGlfclZ5b0Q4ajF5ZzVVSnJOanJ3ZDRTVWNRWnNaRm5SX3dlM3hyM3QxcEMtdVpYTXpuTTM3bklyNGltTWxrT3hpUmxTTHJzNEx4ZVNyNUU-/auto/auto/85/notrim/6c3e7a905dd197b87acb9e61f8f3cd30.webp',
  'awp_neo_noir_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDYyMUZBUjE3UExmWVFKTTZkTzRtNG1acVB2OU5MUEYyRHBTc0pWeWlMbVJvdDczakZidC14SnRNanIyY1lLUklWQnJOVnVELWxPNGstYTUxNWJ1dEp6WGlTdzAxUHhmY1JN/auto/auto/85/notrim/cab21428eefeead5659e903153b1fb64.webp',
  'gloves_specialist_gloves_emerald_web_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDREQVExaDNMQVZidjZteEZBQnMzT1hOWWdKUl9ObTFuWUdIbnVUZ0RMN2NrM2xRNU1GT25lekR5b0Q4ajF5ZzVSRnJabWlsY29PUmNGUTlNbDZCcjFXOXdMcTdocFc2dlo2WXlub3l2eUludGk2SXlSem1pVXRTTHJzNG4xeVRINk0-/auto/auto/85/notrim/f5824a9d61e37112df1368164b36cb7e.webp',
  'ak47_fire_serpent_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaGp4c3pPZUM5SF85bWtoSVdGZzhqMU9PLUdxV2xENmROLXRlWEk4b1RoeGdma3FSQnFOVzMwY0llVElGVTNOQW5aLUZuc2xlcTZnSlc2dUpYT21IUXd1WFIwc1hmWm1oZXB3VVlibFlkTld4TQ--/auto/auto/85/notrim/d895e23a747a316ee4cc70415da4808c.webp',
  'm4a4_howl_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdS02a2VqaGp4c3pGSlR3VDA5UzVnNHlDbWZETFA3TFdubjhmNnBJbDIteVlwOVNuakEyMy1CQnVOVy1pTEktWEpnRnNaUXlHX1ZXMmxPcTkxOGU4dXN6TG4yd2o1SGVBdmtWZHRR/auto/auto/85/notrim/6b8e7efb900be8f9de888c9d998cdfb6.webp',
  'ak47_case_hardened_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaGh3c3pIZURGSDZPTzZuWWVEZzdtaFllNkJ3MjRIN2NRbTNybkZyZGoyM2dIay1CSnJNRHIzZHRERGNsUTJZVm5RLUFXNGxlbThtOWJpNjVULW5zQ28-/auto/auto/85/notrim/f761aaf5c43ebe4028d042d7a792077f.webp',
  'm9_bayonet_marble_fade_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdmJTc0xRSmYzcXIzY3p4YjQ5S3pnTC1LbXNqNU1xblRtbTV1N3NSMWo5Yk5fSXY5bkJyc18wQS1NV3luSVlYQkpBSnFZMWlDLVFMb3dlZnVqY1h0dkpTWXdIcG12blIzdEhyZXlrYV9uMWdTT2RfaFVpMWg-/auto/auto/85/notrim/8dc58869b4d75689fd053569448326c4.webp',
  'deagle_blaze_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3Bvc3Ita0xBdGw3UExKVGp0TzdkR3poNy1IbnZEOEpfWFN3R2tHNjVkMWp1cVpwNHJ6M1ZMaHJoY19henFoSnRPUmRnTTRZRnZSLTFDNXdyeTVncEhxb3QyWG5wVm41RG1Q/auto/auto/85/notrim/ff927aa929841118a0cfea627dbca526.webp',
  'ak47_bloodsport_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaG53TXpKZW1rVjA5NjZtNC1QaE9mN0lhX3VtbUpXNE5FXzJMeVY4OVd0MFFld3FCRTZaMi1sY1k2VUpsUnJNRjdTcVFUdnlPN3Noc0s1djVpZG4zUm42RDVpdXlqRm9wcnN1Zw--/auto/auto/85/notrim/ff6555f39128d0ec26e97f5154c25a96.webp',
  'glock18_fade_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3Bvc2JhcUtBeGYwdkwzZHp4RzZlTzZuWWVEZzduMWEtNkdrRG9DN3BNcDNyR1lwTnFpaVEyMy1VTTVaVC1oY0llUUpnWnNNRnZSX2xUb3g3aS1tOWJpNi1wamZ1bEc-/auto/auto/85/notrim/84def4cc583d1c2899ecc71f49f3710c.webp',
  'awp_asiimov_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDYyMUZBUjE3UExmWVFKRF85VzdtNWEwbXZMd09xN2MyRE1CdXBRbjJlcVZvdHFraXdIaXFoZGxNbWlnSnRPV0p3RTVadzNYOHdTLXllYThqY0RvN2M3WGlTdzBnODlMOXVz/auto/auto/85/notrim/f0c32df9f4948e519ee181869596fbf5.webp',
  'm4a4_neo_noir_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdS02a2VqaGp4c3pGSlR3VzA5S3ptNy1GbVA3bURMZllrV05GcHBBaDJMbVhvdGlqM2xma3JSZHZOemoxSWRmRWRRODdZUXFDX1ZEdGt1dm4wWks4dGNqQXlpTjktbjUxYXdaSGdIOA--/auto/auto/85/notrim/2ffd337d30541acb7e7befccc59b365b.webp',
  'gloves_sport_gloves_vice_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDREQVExSm1NUjFvc2JhcVBRSno3T0RZZmk5VzllTzBtSldPcU9mOVBiRHVtbUpXNE5FXzNMbVlvNDN3MzFDeC14RTRabWlsSm9XVmRGUnZOUXpYXzFEdGxManExNUc1dEpuTHpDRmg3ajVpdXlqcmdKYktPZw--/auto/auto/85/notrim/dc1ce661083f58cef351ba9ef6931474.webp',
  'butterfly_knife_fade_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdmJTc0xRSmYwZWJjWlRoUTZ0Q3ZxNEdLcVBIMU43N3VtbUpXNE5FXzNlckhvdFNnMndibi0wdGtaMnIzZDRhVWN3RTROMUhSX1FTX3hlN3NqWlB2N1p6TXdIVmk3RDVpdXloOWFLejhCQQ--/auto/auto/85/notrim/bf46fd218eecf913e33571ccf1e07fe1.webp',
  'talon_knife_crimson_web_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdmJTc0xRSmZ4UHJNZmlwUDdkZXpoci1EanNqak5ybkNxV2RZNzgxbHhMM0FyTldnMlZYa19VdHZOV0NnZGRTUWV3RS1ZMTNYX2xHNHgtaTdqY1R2dTVqS25YQml1aWM4cFNHS05lXzVZWlk-/auto/auto/85/notrim/fe2923fc8dda325f952a748fd3f1efc4.webp',
  'p90_death_by_kitty_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvcHVQMUZBUjE3UERKWlM1Si1kQzZoNy1ienFmTFA3TFdubjhmdThFazJibVVwSXFuMFF5MV8wVTVOV3FsY29HV0p3UTdOQXpULVZIdGtMM3UwNTdxdU03T3kyd2o1SGVsSzVueFJn/auto/auto/85/notrim/a090b813275a87622401e7534be8acbf.webp',
  'tec9_nuclear_threat_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3Bvb3ItbWNqaHp3OHpHWkRaSF84aWtuWkNPcVBEbU5yN2ZxWDlVNjV4T2h1REdfWmk3M0ZhM3FFQnVObUNuSVlQSElRSTRabG5WOGxQdmwtcnVoWmE4NzVUQXlpRnJ2Q0J4c1g2Snl3djMzMDhnX1VQV3F3/auto/auto/85/notrim/b722cc9dba7f405ceb94a841982b5a93.webp',
  'm4a1s_printstream_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdS02a2VqaHoydl9OZno1SF91TzFnYi1Hd19hbElJVEJoR0pmX05abG1PekEtTFA1Z1ZPOHYxMXFhMm42ZHRPY0lRVm9NRkhVcXdDOXdlaTdqY081dlozQXpTUTF2Q01sczNmYXl4S3loaDFNY0tVeDBzZnprVk1y/auto/auto/85/notrim/bb75d0e30c1db9975e3e458ddde209a5.webp',
  'ak47_gold_arabesque_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaG53TXpKZW1rVjA5dTVtSVMwbHVYMU1iN0NoMzVVMThsNGplSFZ1NGlqM2xXMzhoVnVNR255ZGRTU0lBVTVad3lGOGdTN3ctLS0xcEswdXB2SW1IUmw2eVowNEh2RDMwdmdrV3Z0Z1lB/auto/auto/85/notrim/75153178bcecedee60a7083ae1fb66c9.webp',
  'm4a1s_hot_rod_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdS02a2VqaHoydl9OZno1SF91TzNtci1aa3ZYbU1vVFZsM2xhMThsNGplSFZ1OXIwM0FMZ194QnFabXo2Y1lTVGNWSS1OdzNSLTFlNndlYTYwOGZvN1ozT21ucG12WE1rNW5iRDMwdmdpWno1eUp3/auto/auto/85/notrim/20dbc444fba1c452daf1452a1bc7323a.webp',
  'ak47_wild_lotus_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaGp4c3pKZWdKTF85QzNtb1Mwa2Z2N0licmRxV2RZNzgxbHhPckg5dHlsMkFQal9SRmtZbTZuY0lTV2R3NDJad3ZYOHdmb2t1M3MxNVR1NmN6S3lTWmd1M1U4cFNHS2ktTlNiZEU-/auto/auto/85/notrim/d8632e5ba62266044891d35a5b459d2b.webp',
  'ak47_vulcan_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaGp4c3pKZW1rVjA4Nmpsb0tPaGNqNE9yelpnaVVJNnBRazJMbkVvOWlpM2dleThoQnNOVGlpSjQ2VmUxUThhVnlHX3dlLWtyM3AwNUx2N1p2TTF6STk3U3hPRGR4TA--/auto/auto/85/notrim/4525b07cdae06734985268398f1e0d02.webp',
  'ak47_asiimov_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaGp4c3pKZW1rVjA5MmxuWW1HbU9ITFA3TFdubjhmN1pBbjAtMlVyTnl0aXdLMl9oWTRNbUQ3ZG9hVmN3VTRZRnFELVFUcmxlcTgwSi04dnAtYW5Hd2o1SGZRU3BVSk53/auto/auto/85/notrim/575d6a61f6ea6a315ba579fe186b300b.webp',
  'awp_fade_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDYyMUZBWmg3UExmWVFKRTdkaXpxNHlDa1BfZ2Zlelh4ajBJdkpCeTJyckg5TlNoMlZYczgwVnNZV0duZDlTV2NBRm9hRkNFcVZhN3d1M29oNUdpX01PZVNjeE96cUk-/auto/auto/85/notrim/c7c4fba29565b299bd50f02ea77f3d6d.webp',
  'awp_containment_breach_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDYyMUZBUjE3UExmWVFKVTVjNmpoNy1IbnZEOEpfV0V4VzBDN3BVbzMtakRwZFh4MEZIcy1SQmxhMnI2TElIR0l3RTJZMV9YLUZpN3ctbTdnWlMwb3QyWG5wOVhQUmxk/auto/auto/85/notrim/739f04104e42b3a99f26a6ac47bb8db2.webp',
  'ak47_neon_rider_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdDdIeGZEaGp4c3pKZWdKTTZkTzRxNUtDa19MbURMZllrV05GcHBZb2pPdkZwZGoyMFFLeHFFWV9hMnIxY0lhZEl3ZG9NbDNROGxHOWw3eTdnNUM1dTVuSXpuSjktbjUxWVAxYjZEUQ--/auto/auto/85/notrim/e7145c7203360bf25587229e84e89c9a.webp',
  'm4a1s_dark_water_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvdS02a2VqaHoydl9OZno1SF91TzNtYi1Sa3ZYbU1vVFZsM2xhMThsNGplSFZ1OXIwM0FMZ194QnFabXo2Y1lTVGNWSS1OdzNSLTFlNndlYTYwOGZvN1ozT21ucG12WE1rNW5iRDMwdmdpWno1eUp3/auto/auto/85/notrim/20dbc444fba1c452daf1452a1bc7323a.webp',
  'usp_s_overgrowth_factory_new': 'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jb21tdW5pdHkuY2xvdWRmbGFyZS5zdGVhbXN0YXRpYy5jb20vZWNvbm9teS9pbWFnZS8tOWE4MWRsV0x3SjJVVUdjVnNfbnNWdHpkT0VkdFd3S0daWkxRSFR4RFo3STU2S1UwWnd3bzROVVg0b0ZKWkVITGJYSDVBcGVPNFltbGh4WVFrbkNSdkNvMDRERVZseGtLZ3BvbzZtMUZCUnAzX2JHY2poUTA5U3ZxNU9Da3ZEeERMbkRsMzFlMThsNGplSFZ1OXltMndLeThrUV9ZMkdoSUlLUWNBYzVOMV9ZcTFhNXc3Mi0wOGU5NkozTm5TQTFzeU1rNFNuRDMwdmc0a0ZjeE1n/auto/auto/85/notrim/87b6c6a6314aebd689417c0e9edabb1e.webp',
  // Add more as needed
};

const RentPage = () => {
  const { steamId } = useAuth();
  const [selectedPeriods, setSelectedPeriods] = useState<{[key: string]: number}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [filteredSkins, setFilteredSkins] = useState<Skin[]>([]);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [skinsData, setSkinsData] = useState<Skin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, convertPrice } = useCurrency();
  const [convertedPrices, setConvertedPrices] = useState<{[key: string]: number}>({});
  const [convertedDailyRates, setConvertedDailyRates] = useState<{[key: string]: number}>({});
  const location = useLocation();
  const [selectedSkin, setSelectedSkin] = useState<PredefinedSkin | null>(null);
  const [rentDays, setRentDays] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [displayedSkins, setDisplayedSkins] = useState<PredefinedSkin[]>([]);
  const navigate = useNavigate();
  const { addItem, items, removeItem, updateItem } = useCart();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { triggerPrompt } = useDownloadPrompts();

  // Fetch skins data when component mounts
  useEffect(() => {
    const fetchSkins = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching skins data...');
        const response = await fetch('https://raw.githubusercontent.com/qwkdev/csapi/main/data.json');
        const data = await response.json();
        
        console.log('Processing skins data...');
        // Take only first 40 skins for initial load to avoid too many API calls
        const entries = Object.entries(data) as [string, SkinDetails][];
        
        // Sort entries by rarity to favor higher quality skins
        const sortedEntries = entries.sort(([, detailsA], [, detailsB]) => {
          const rarityOrder: { [key: string]: number } = {
            'Consumer Grade': 0,
            'Industrial Grade': 1,
            'Mil-Spec Grade': 2,
            'Restricted': 3,
            'Classified': 4,
            'Covert': 5
          };
          return (rarityOrder[detailsB.rarity] ?? 0) - (rarityOrder[detailsA.rarity] ?? 0);
        });

        // Separate high-tier and regular skins
        const highTierEntries: [string, SkinDetails][] = [];
        const regularEntries: [string, SkinDetails][] = [];

        // Categorize skins
        sortedEntries.forEach(([name, details]) => {
          if (name.toLowerCase().includes('knife') || 
              name.toLowerCase().includes('gloves') ||
              name.toLowerCase().includes('dragon') ||
              name.toLowerCase().includes('fade') ||
              details.rarity === 'Covert' ||
              details.rarity === 'Classified') {
            highTierEntries.push([name, details]);
          } else {
            regularEntries.push([name, details]);
          }
        });

        // Take a balanced selection of skins
        const selectedEntries = [
          ...highTierEntries.slice(0, 3), // Take up to 3 high-tier skins
          ...regularEntries.slice(0, 17) // Take up to 17 regular skins
        ].slice(0, 20); // Ensure we don't exceed 20 total

        // Shuffle the selected entries to mix high-tier and regular skins
        for (let i = selectedEntries.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [selectedEntries[i], selectedEntries[j]] = [selectedEntries[j], selectedEntries[i]];
        }
        
        // Convert the API data format to our Skin interface
        const processedSkins = await Promise.all(selectedEntries.map(async ([name, details]: [string, SkinDetails]) => {
          const wear = (() => {
            // Bias towards better wear conditions
            const random = Math.random();
            if (random < 0.4) return 'Factory New';
            if (random < 0.7) return 'Minimal Wear';
            if (random < 0.9) return 'Field-Tested';
            if (random < 0.95) return 'Well-Worn';
            return 'Battle-Scarred';
          })();
          
          // Generate market hash name
          const marketHashName = `${name} (${wear})`;
          // Get real market price from Steam
          const marketPrice = await getSteamMarketPrice(marketHashName);
          // Calculate daily rate based on market price
          const dailyRate = calculateDailyRate(marketPrice);
          
          return {
            id: `${name.replace(/\s+/g, '_')}_${wear.replace(/\s+/g, '_')}_${details.weapon_catalog}_${details.finish_catalog || '0'}`,
            name: name,
            weapon: {
              id: details.weapon.toLowerCase(),
              weapon_id: details.weapon_catalog,
              name: details.weapon
            },
            category: {
              id: 'weapon_category',
              name: details.weapon.includes('Knife') ? 'Knives' : 'Weapons'
            },
            pattern: {
              id: details.finish.toLowerCase().replace(/\s+/g, '_'),
              name: details.finish
            },
            rarity: {
              id: details.rarity.toLowerCase().replace(/\s+/g, '_'),
              name: details.rarity,
              color: details.color
            },
            stattrak: Math.random() < 0.3, // 30% chance for StatTrak
            souvenir: Math.random() < 0.2, // 20% chance for Souvenir
            finish_catalog: details.finish_catalog,
            images: details.images,
            image: details.image,
            possible: details.possible,
            types: details.types,
            inspect: details.inspect,
            price: marketPrice,
            wear: Math.random() * 0.2 + 0.8, // Bias towards better float values (0.8-1.0)
            owner: 'SteamUser' + Math.floor(Math.random() * 1000),
            minRentDays: 1,
            maxRentDays: 30,
            dailyRate: dailyRate,
            wearName: wear
          };
        }));

        console.log(`Processed ${processedSkins.length} skins`);
        setSkinsData(processedSkins);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching skins:', error);
        setError('Failed to load skins. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchSkins();
  }, []);

  // Effect to handle currency conversions
  useEffect(() => {
    const updatePrices = async () => {
      const newPrices: {[key: string]: number} = {};
      const newDailyRates: {[key: string]: number} = {};
      for (const skin of skinsData) {
        const converted = await convertPrice(skin.price, 'USD');
        const convertedDaily = await convertPrice(skin.dailyRate, 'USD');
        newPrices[skin.id] = converted;
        newDailyRates[skin.id] = convertedDaily;
      }
      // Check if all prices are the same (possible bug)
      const uniquePrices = new Set(Object.values(newPrices));
      if (uniquePrices.size === 1 && skinsData.length > 1) {
        skinsData.forEach(skin => {
          newPrices[skin.id] = skin.price;
          newDailyRates[skin.id] = skin.dailyRate;
        });
      }
      setConvertedPrices(newPrices);
      setConvertedDailyRates(newDailyRates);
    };
    if (skinsData.length > 0) {
      updatePrices();
    }
  }, [currency, skinsData, convertPrice]);

  // Update total price when currency changes
  useEffect(() => {
    if (selectedSkin) {
      const convertedDailyRate = convertedDailyRates[selectedSkin.id] || selectedSkin.dailyRate;
      setTotalPrice(calculateDiscountedTotal(convertedDailyRate, rentDays));
    }
  }, [currency, selectedSkin, rentDays, convertedDailyRates]);

  const getImageUrl = (skin: Skin | any) => {
    // Only use csgostashUrlMap and fallback to placeholder
    if (csgostashUrlMap[skin.id]) return csgostashUrlMap[skin.id];
    return '/skins/placeholder.png';
  };

  // Function to handle image load errors
  const handleImageError = (skinId: string) => {
    console.error(`Failed to load image for skin ${skinId}`);
    // You could set a fallback image here if needed
  };

  // Add initial randomization effect
  useEffect(() => {
    // Randomize skins on first load
    setShuffleTrigger(Math.random());
    // Also set initial filtered skins
    const shuffledSkins = [...skinsData].sort(() => Math.random() - 0.5);
    setFilteredSkins(shuffledSkins.slice(0, 6));
  }, [skinsData]);

  useEffect(() => {
    const processSkins = () => {
      let tempSkins = [...skinsData];

      // Filter by search query
      if (searchQuery) {
        tempSkins = tempSkins.filter(skin =>
          skin.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by price
      if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-').map(Number);
        tempSkins = tempSkins.filter(skin => skin.price >= min && (max ? skin.price <= max : true));
      }

      // Sort skins
      switch (sortBy) {
        case 'popular':
          tempSkins.sort((a, b) => {
            // Prioritize high rarity skins
            const rarityOrder: { [key: string]: number } = {
              'Consumer Grade': 0,
              'Industrial Grade': 1,
              'Mil-Spec Grade': 2,
              'Restricted': 3,
              'Classified': 4,
              'Covert': 5
            };
            const rarityDiff = (rarityOrder[b.rarity.name] ?? 0) - (rarityOrder[a.rarity.name] ?? 0);
            if (rarityDiff !== 0) return rarityDiff;
            
            // Then consider price and wear
            return b.price * (1 - b.wear) - a.price * (1 - a.wear);
          });
          break;
        case 'newest':
          tempSkins.sort((a, b) => a.id.localeCompare(b.id));
          break;
        case 'price_asc':
          tempSkins.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          tempSkins.sort((a, b) => b.price - a.price);
          break;
      }

      // Ensure at least 2 high-tier skins (if available) and fill the rest
      const highTierSkins = tempSkins.filter(skin => 
        skin.name.toLowerCase().includes('knife') ||
        skin.name.toLowerCase().includes('gloves') ||
        skin.name.toLowerCase().includes('dragon') ||
        skin.name.toLowerCase().includes('fade') ||
        skin.rarity.name === 'Covert' ||
        skin.rarity.name === 'Classified'
      );

      const otherSkins = tempSkins.filter(skin => 
        !highTierSkins.includes(skin)
      );

      // Shuffle both arrays separately
      for (let i = highTierSkins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [highTierSkins[i], highTierSkins[j]] = [highTierSkins[j], highTierSkins[i]];
      }

      for (let i = otherSkins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSkins[i], otherSkins[j]] = [otherSkins[j], otherSkins[i]];
      }

      // Take 2-3 high-tier skins (if available) and fill the rest with other skins
      const numHighTier = Math.min(3, highTierSkins.length);
      const finalSkins = [
        ...highTierSkins.slice(0, numHighTier),
        ...otherSkins.slice(0, 6 - numHighTier)
      ];

      // Shuffle the final selection to mix high-tier and regular skins
      for (let i = finalSkins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalSkins[i], finalSkins[j]] = [finalSkins[j], finalSkins[i]];
      }

      setFilteredSkins(finalSkins);
    };

    processSkins();
  }, [searchQuery, priceFilter, sortBy, shuffleTrigger, skinsData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openid.op_endpoint') === 'https://steamcommunity.com/openid/login' && window.opener) {
      const claimedId = params.get('openid.claimed_id');
      if (claimedId) {
        // In a real app, you would take these parameters and send them to your backend
        // to verify the login with Steam's API. For now, we'll simulate success.
        window.opener.postMessage({ type: 'steam_login_success', steamId: claimedId.substring(claimedId.lastIndexOf('/') + 1) }, window.location.origin);
      } else {
        window.opener.postMessage({ type: 'steam_login_failure' }, window.location.origin);
      }
      window.close();
    }
  }, []);

  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'consumer grade': return 'bg-gray-500';
      case 'industrial grade': return 'bg-blue-500';
      case 'mil-spec grade': return 'bg-blue-600';
      case 'restricted': return 'bg-purple-500';
      case 'classified': return 'bg-pink-500';
      case 'covert': return 'bg-red-500';
      case 'contraband': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const handleLogin = () => {
    // Save the current path for return after login
    localStorage.setItem('returnPath', window.location.pathname);

    // Redirect to the backend's Steam authentication route
    window.location.href = 'http://150.136.130.59:3002/auth/steam';
  };

  const handleShuffle = () => {
    setShuffleTrigger(c => c + 1);
  };

  const calculateRentCost = (skinId: string, days: number) => {
    const dailyRate = convertedDailyRates[skinId] || 0;
    return formatCurrency(dailyRate * days, currency);
  };

  const handlePeriodChange = (skinId: string, value: number) => {
    setSelectedPeriods(prev => ({
      ...prev,
      [skinId]: value
    }));
  };

  useEffect(() => {
    // Randomly select 6 skins from the predefined list
    const shuffled = [...predefinedSkins].sort(() => 0.5 - Math.random());
    setDisplayedSkins(shuffled.slice(0, 6));
  }, []);

  const handleSkinSelect = (skin: PredefinedSkin) => {
    setSelectedSkin(skin);
    setRentDays(1);
    const dailyRate = convertedDailyRates[skin.id] || skin.dailyRate;
    setTotalPrice(calculateDiscountedTotal(dailyRate, 1));
  };

  const handleDaysChange = (days: number) => {
    if (selectedSkin) {
      setRentDays(days);
      const dailyRate = convertedDailyRates[selectedSkin.id] || selectedSkin.dailyRate;
      const newTotalPrice = calculateDiscountedTotal(dailyRate, days);
      setTotalPrice(newTotalPrice);
      
      // Update cart if item exists
      if (items.some(item => item.id === selectedSkin.id)) {
        updateItem(selectedSkin.id, days);
      }
    }
  };

  // Discount calculation based on rental days
  const getDiscount = (days: number) => {
    if (days >= 30) return 0.20;
    if (days >= 21) return 0.15;
    if (days >= 14) return 0.10;
    if (days >= 7) return 0.05;
    return 0;
  };

  const calculateDiscountedTotal = (dailyRate: number, days: number) => {
    const discount = getDiscount(days);
    const total = dailyRate * days * (1 - discount);
    return total;
  };

  const handleAddToCart = () => {
    if (selectedSkin) {
      addItem({
        id: selectedSkin.id,
        name: selectedSkin.name,
        image: getImageUrl(selectedSkin),
        dailyRate: convertedDailyRates[selectedSkin.id] || selectedSkin.dailyRate,
        rentDays,
        totalPrice
      });
      setSelectedSkin(null);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeItem(itemId);
  };

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleRentClick = () => {
    const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
    if (!isAppInstalled) {
      triggerPrompt('action');
      return;
    }

    // Only proceed with authentication check if app is installed
    if (!steamId) {
      handleLogin();
    } else {
      if (selectedSkin) {
        navigate('/payment', {
          state: {
            skin: selectedSkin,
            rentDays: rentDays,
            totalPrice: totalPrice
          }
        });
      }
    }
  };

  const renderSkinsContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csfloat-blue mx-auto mb-4"></div>
            <p>Loading skins...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-csfloat-blue px-4 py-2 rounded hover:bg-csfloat-blue/80"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedSkins.slice(0, 12).map((skin) => (
          <div
            key={skin.id}
            className={`item-card p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedSkin?.id === skin.id ? 'ring-2 ring-csfloat-accent' : ''
            }`}
            onClick={() => handleSkinSelect(skin)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{skin.name}</h3>
              <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: skin.rarity.color + '20', color: skin.rarity.color }}>
                {skin.rarity.name}
              </span>
            </div>
            
            <div className="relative aspect-video mb-4">
              <img
                src={getImageUrl(skin)}
                alt={skin.name}
                className="w-full h-full object-contain"
                onError={() => handleImageError(skin.id)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-csfloat-gray">Steam Market</p>
                <p className="text-lg font-semibold">{formatCurrency(convertedPrices[skin.id] ?? skin.price, currency)}</p>
              </div>
              <div>
                <p className="text-sm text-csfloat-gray">Daily Rate</p>
                <p className="text-lg font-semibold">{formatCurrency(convertedDailyRates[skin.id] ?? skin.dailyRate, currency)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedSkinFooter = () => {
    if (!selectedSkin) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-csfloat-dark/95 backdrop-blur-sm border-t border-csfloat-gray/20 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={getImageUrl(selectedSkin)}
                alt={selectedSkin.name}
                className="w-16 h-16 object-contain"
                onError={() => handleImageError(selectedSkin.id)}
              />
              <div>
                <h3 className="text-lg font-semibold">{selectedSkin.name}</h3>
                <p className="text-sm text-csfloat-gray">Daily Rate: {formatCurrency(convertedDailyRates[selectedSkin.id] ?? selectedSkin.dailyRate, currency)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDaysChange(Math.max(1, rentDays - 1))}
                  className="btn-secondary px-3 py-1"
                >
                  -
                </button>
                <span className="w-12 text-center">{rentDays} days</span>
                <button
                  onClick={() => handleDaysChange(Math.min(30, rentDays + 1))}
                  className="btn-secondary px-3 py-1"
                >
                  +
                </button>
              </div>
              
              <div className="w-px h-8 bg-csfloat-gray/20 mx-4"></div>
              
              <div className="text-right">
                <p className="text-sm text-csfloat-gray">Total Price</p>
                <p className="text-xl font-bold">{formatCurrency(totalPrice, currency)}</p>
              </div>
              
              <div className="w-px h-8 bg-csfloat-gray/20 mx-4"></div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  className="btn-secondary px-6 py-2"
                >
                  Add to Cart
                </button>
                <button
                  className={`w-full py-2 px-4 rounded ${
                    selectedSkin ? 'bg-csfloat-blue hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'
                  } text-white font-semibold transition-colors duration-200`}
                  onClick={handleRentClick}
                  disabled={!selectedSkin}
                >
                  {selectedSkin ? 'Rent Now' : 'Select a Skin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!steamId) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-csfloat-blue to-blue-400">
              Rent Premium CS2 Skins
            </h1>
            <p className="text-xl text-csfloat-light/80 mb-12 max-w-2xl mx-auto">
              Access high-tier skins without the commitment. Connect with Steam to browse our curated collection of premium CS2 skins available for rent.
            </p>
            <button 
              onClick={handleLogin}
              className="btn-primary flex items-center space-x-3 mx-auto px-8 py-4 text-lg bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-csfloat-blue/20"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" alt="Steam Logo" className="w-6 h-6" />
              <span>Sign in through Steam</span>
            </button>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Featured Skins Available for Rent</h2>
            {renderSkinsContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
      {/* Download Promotion Banner */}
      {localStorage.getItem('skinforge_app_installed') !== 'true' && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white mb-2">Ready to Rent Premium Skins?</h3>
                <p className="text-csfloat-light/80">
                  Download the Skinforge app to start renting and participate in daily giveaways!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/download"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Download App
                </Link>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('showGiveawayPrompt', {
                      detail: {
                        title: 'Daily Giveaway!',
                        message: 'Download the Skinforge app to enter our daily skin giveaway! Win premium CS2 skins worth up to $1000!',
                        variant: 'giveaway'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Learn About Giveaways
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Download CTA */}
      <DownloadCTA variant="floating" onDownloadClick={handleDownloadClick} />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Available Skins for Rent</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownloadClick}
              className="bg-gradient-to-r from-csfloat-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Client</span>
            </button>
            <UserProfile />
            {items.length > 0 && (
              <button
                onClick={() => navigate('/payment', { state: { items } })}
                className="bg-csfloat-blue px-6 py-2 rounded-lg hover:bg-csfloat-blue/80 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Checkout ({items.length})</span>
              </button>
            )}
          </div>
        </div>
        {/* Search and Filters */}
        {/* Removed search input, shuffle button, and price filter dropdown */}

        {renderSkinsContent()}
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
      )}

      {renderSelectedSkinFooter()}
    </div>
  );
};

export default RentPage; 