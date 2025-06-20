export interface PredefinedSkin {
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
}

export const predefinedSkins: PredefinedSkin[] = [
  {
    id: "karambit_doppler_factory_new",
    name: "Karambit | Doppler",
    weapon: {
      id: "karambit",
      weapon_id: 1,
      name: "Karambit"
    },
    category: {
      id: "knife",
      name: "Knives"
    },
    pattern: {
      id: "doppler",
      name: "Doppler"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 1,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Ruby", "Sapphire", "Black Pearl"],
    types: ["knife"],
    inspect: {
      gen: "2",
      links: {
        "Phase 1": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789",
        "Phase 2": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789",
        "Phase 3": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789",
        "Phase 4": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789",
        "Ruby": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789",
        "Sapphire": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789",
        "Black Pearl": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 1200,
    wear: 0.01,
    owner: "SteamUser123",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 40,
    wearName: "Factory New"
  },
  {
    id: "m4a4_howl_factory_new",
    name: "M4A4 | Howl",
    weapon: {
      id: "m4a4",
      weapon_id: 2,
      name: "M4A4"
    },
    category: {
      id: "rifle",
      name: "Rifles"
    },
    pattern: {
      id: "howl",
      name: "Howl"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 2,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["rifle"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 2000,
    wear: 0.02,
    owner: "SteamUser456",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 67,
    wearName: "Factory New"
  },
  {
    id: "ak47_fire_serpent_factory_new",
    name: "AK-47 | Fire Serpent",
    weapon: {
      id: "ak47",
      weapon_id: 3,
      name: "AK-47"
    },
    category: {
      id: "rifle",
      name: "Rifles"
    },
    pattern: {
      id: "fire_serpent",
      name: "Fire Serpent"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 3,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["rifle"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 1500,
    wear: 0.03,
    owner: "SteamUser789",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 50,
    wearName: "Factory New"
  },
  {
    id: "awp_dragon_lore_factory_new",
    name: "AWP | Dragon Lore",
    weapon: {
      id: "awp",
      weapon_id: 4,
      name: "AWP"
    },
    category: {
      id: "sniper",
      name: "Snipers"
    },
    pattern: {
      id: "dragon_lore",
      name: "Dragon Lore"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 4,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["sniper"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 5000,
    wear: 0.01,
    owner: "SteamUser101",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 167,
    wearName: "Factory New"
  },
  {
    id: "gloves_sport_gloves_vice_factory_new",
    name: "Sport Gloves | Vice",
    weapon: {
      id: "gloves",
      weapon_id: 5,
      name: "Sport Gloves"
    },
    category: {
      id: "gloves",
      name: "Gloves"
    },
    pattern: {
      id: "vice",
      name: "Vice"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 5,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["gloves"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 800,
    wear: 0.02,
    owner: "SteamUser202",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 27,
    wearName: "Factory New"
  },
  {
    id: "m9_bayonet_marble_fade_factory_new",
    name: "M9 Bayonet | Marble Fade",
    weapon: {
      id: "m9_bayonet",
      weapon_id: 6,
      name: "M9 Bayonet"
    },
    category: {
      id: "knife",
      name: "Knives"
    },
    pattern: {
      id: "marble_fade",
      name: "Marble Fade"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 6,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["knife"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 1000,
    wear: 0.01,
    owner: "SteamUser303",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 33,
    wearName: "Factory New"
  },
  {
    id: "ak47_bloodsport_factory_new",
    name: "AK-47 | Bloodsport",
    weapon: {
      id: "ak47",
      weapon_id: 7,
      name: "AK-47"
    },
    category: {
      id: "rifle",
      name: "Rifles"
    },
    pattern: {
      id: "bloodsport",
      name: "Bloodsport"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 7,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["rifle"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 300,
    wear: 0.02,
    owner: "SteamUser404",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 10,
    wearName: "Factory New"
  },
  {
    id: "m4a1s_hyper_beast_factory_new",
    name: "M4A1-S | Hyper Beast",
    weapon: {
      id: "m4a1s",
      weapon_id: 8,
      name: "M4A1-S"
    },
    category: {
      id: "rifle",
      name: "Rifles"
    },
    pattern: {
      id: "hyper_beast",
      name: "Hyper Beast"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 8,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["rifle"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 200,
    wear: 0.03,
    owner: "SteamUser505",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 7,
    wearName: "Factory New"
  },
  {
    id: "awp_asiimov_factory_new",
    name: "AWP | Asiimov",
    weapon: {
      id: "awp",
      weapon_id: 9,
      name: "AWP"
    },
    category: {
      id: "sniper",
      name: "Snipers"
    },
    pattern: {
      id: "asiimov",
      name: "Asiimov"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 9,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["sniper"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 150,
    wear: 0.02,
    owner: "SteamUser606",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 5,
    wearName: "Factory New"
  },
  {
    id: "usp_s_kill_confirmed_factory_new",
    name: "USP-S | Kill Confirmed",
    weapon: {
      id: "usp_s",
      weapon_id: 10,
      name: "USP-S"
    },
    category: {
      id: "pistol",
      name: "Pistols"
    },
    pattern: {
      id: "kill_confirmed",
      name: "Kill Confirmed"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 10,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["pistol"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 100,
    wear: 0.01,
    owner: "SteamUser707",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 3,
    wearName: "Factory New"
  },
  {
    id: "gloves_specialist_gloves_emerald_web_factory_new",
    name: "Specialist Gloves | Emerald Web",
    weapon: {
      id: "gloves",
      weapon_id: 11,
      name: "Specialist Gloves"
    },
    category: {
      id: "gloves",
      name: "Gloves"
    },
    pattern: {
      id: "emerald_web",
      name: "Emerald Web"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 11,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["gloves"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 600,
    wear: 0.02,
    owner: "SteamUser808",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 20,
    wearName: "Factory New"
  },
  {
    id: "butterfly_knife_fade_factory_new",
    name: "Butterfly Knife | Fade",
    weapon: {
      id: "butterfly_knife",
      weapon_id: 12,
      name: "Butterfly Knife"
    },
    category: {
      id: "knife",
      name: "Knives"
    },
    pattern: {
      id: "fade",
      name: "Fade"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 12,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["knife"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 900,
    wear: 0.01,
    owner: "SteamUser909",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 30,
    wearName: "Factory New"
  },
  {
    id: "ak47_case_hardened_factory_new",
    name: "AK-47 | Case Hardened",
    weapon: {
      id: "ak47",
      weapon_id: 13,
      name: "AK-47"
    },
    category: {
      id: "rifle",
      name: "Rifles"
    },
    pattern: {
      id: "case_hardened",
      name: "Case Hardened"
    },
    rarity: {
      id: "restricted",
      name: "Restricted",
      color: "#8847ff"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 13,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["rifle"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 250,
    wear: 0.03,
    owner: "SteamUser1010",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 8,
    wearName: "Factory New"
  },
  {
    id: "m4a4_neo_noir_factory_new",
    name: "M4A4 | Neo-Noir",
    weapon: {
      id: "m4a4",
      weapon_id: 14,
      name: "M4A4"
    },
    category: {
      id: "rifle",
      name: "Rifles"
    },
    pattern: {
      id: "neo_noir",
      name: "Neo-Noir"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 14,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["rifle"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 180,
    wear: 0.02,
    owner: "SteamUser1111",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 6,
    wearName: "Factory New"
  },
  {
    id: "awp_neo_noir_factory_new",
    name: "AWP | Neo-Noir",
    weapon: {
      id: "awp",
      weapon_id: 15,
      name: "AWP"
    },
    category: {
      id: "sniper",
      name: "Snipers"
    },
    pattern: {
      id: "neo_noir",
      name: "Neo-Noir"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 15,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["sniper"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 220,
    wear: 0.02,
    owner: "SteamUser1212",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 7,
    wearName: "Factory New"
  },
  {
    id: "deagle_blaze_factory_new",
    name: "Desert Eagle | Blaze",
    weapon: {
      id: "deagle",
      weapon_id: 16,
      name: "Desert Eagle"
    },
    category: {
      id: "pistol",
      name: "Pistols"
    },
    pattern: {
      id: "blaze",
      name: "Blaze"
    },
    rarity: {
      id: "classified",
      name: "Classified",
      color: "#d32ce6"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 16,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["pistol"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 400,
    wear: 0.01,
    owner: "SteamUser1313",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 13,
    wearName: "Factory New"
  },
  {
    id: "talon_knife_crimson_web_factory_new",
    name: "Talon Knife | Crimson Web",
    weapon: {
      id: "talon_knife",
      weapon_id: 18,
      name: "Talon Knife"
    },
    category: {
      id: "knife",
      name: "Knives"
    },
    pattern: {
      id: "crimson_web",
      name: "Crimson Web"
    },
    rarity: {
      id: "covert",
      name: "Covert",
      color: "#eb4b4b"
    },
    stattrak: false,
    souvenir: false,
    finish_catalog: 18,
    images: {
      "Factory New": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLFYS1H-t-7h5TZlvD7PYTZk2pH8fp9i_vG8Y_2j1Gx7UY5Yz7wJ4eUcQJqYwqG8gC9sO-7h1K1v8m7nCQw0HZ3sXQq0y0nA"
    },
    possible: [],
    types: ["knife"],
    inspect: {
      gen: "2",
      links: {
        "default": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198123456789A1234567890D1234567890123456789"
      }
    },
    price: 1100,
    wear: 0.01,
    owner: "SteamUser1515",
    minRentDays: 1,
    maxRentDays: 30,
    dailyRate: 37,
    wearName: "Factory New"
  }
]; 