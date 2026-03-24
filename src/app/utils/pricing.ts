import { getListById, ListItem } from "../store/listsStore";
import type { ActionFeedback } from "../types/feedback";

export type StoreKey = "walmart" | "superstore" | "safeway";

export type StoreDefinition = {
  key: StoreKey;
  name: string;
  color: string;
  url: string;
};

export type ComparedOffer = {
  brand: string;
  packageLabel: string;
  price: number;
};

export type ComparedItem = {
  id: string;
  name: string;
  category: string;
  quantityLabel: string;
  offers: Record<StoreKey, ComparedOffer>;
  prices: Record<StoreKey, number>;
  bestStoreKey: StoreKey;
};

export type CheckoutStoreItem = {
  id: string;
  name: string;
  brand: string;
  packageLabel: string;
  quantityLabel: string;
  price: number;
};

export type CheckoutStore = StoreDefinition & {
  total: number;
  items: CheckoutStoreItem[];
};

export type CheckoutPlan = {
  key: "assistant" | "single-store" | "manual-selection";
  title: string;
  summary: string;
  stores: CheckoutStore[];
  total: number;
  savings: number;
};

export type ComparisonData = {
  listId: string;
  listName: string;
  items: ComparedItem[];
  stores: StoreDefinition[];
  totals: Record<StoreKey, number>;
  cheapestTotalStoreKey: StoreKey;
  assistantPlan: CheckoutPlan;
  singleStorePlan: CheckoutPlan;
};

export type PricingRouteState = {
  listId?: string;
  items?: ListItem[];
  plan?: CheckoutPlan;
  feedback?: ActionFeedback;
};

type CatalogOffer = {
  brand: string;
  packageLabel: string;
  unitPrice: number;
};

const fallbackListId = "1";

export const storeDefinitions: StoreDefinition[] = [
  {
    key: "walmart",
    name: "Walmart",
    color: "#1E4DB7",
    url: "https://www.walmart.ca/en",
  },
  {
    key: "superstore",
    name: "Superstore",
    color: "#FF6D00",
    url: "https://www.realcanadiansuperstore.ca/",
  },
  {
    key: "safeway",
    name: "Safeway",
    color: "#D32F2F",
    url: "https://www.safeway.ca/",
  },
];

const fallbackBrands: Record<StoreKey, string> = {
  walmart: "Great Value",
  superstore: "President's Choice",
  safeway: "Signature Select",
};

const priceCatalog: Record<string, Record<StoreKey, CatalogOffer>> = {
  "milk 2%": {
    walmart: { brand: "Great Value", packageLabel: "4L jug", unitPrice: 5.49 },
    superstore: {
      brand: "Neilson",
      packageLabel: "4L bag",
      unitPrice: 5.29,
    },
    safeway: { brand: "Lucerne", packageLabel: "4L jug", unitPrice: 5.99 },
  },
  "cheese slices": {
    walmart: {
      brand: "Kraft Singles",
      packageLabel: "300g pack",
      unitPrice: 4.99,
    },
    superstore: {
      brand: "President's Choice",
      packageLabel: "300g pack",
      unitPrice: 4.79,
    },
    safeway: {
      brand: "Compliments",
      packageLabel: "300g pack",
      unitPrice: 5.49,
    },
  },
  "greek yogurt": {
    walmart: { brand: "Oikos", packageLabel: "750g tub", unitPrice: 6.29 },
    superstore: {
      brand: "Liberte",
      packageLabel: "750g tub",
      unitPrice: 5.99,
    },
    safeway: {
      brand: "Olympic",
      packageLabel: "750g tub",
      unitPrice: 6.49,
    },
  },
  eggs: {
    walmart: {
      brand: "Burnbrae Farms",
      packageLabel: "12 pack",
      unitPrice: 4.79,
    },
    superstore: {
      brand: "No Name",
      packageLabel: "12 pack",
      unitPrice: 4.59,
    },
    safeway: {
      brand: "Compliments",
      packageLabel: "12 pack",
      unitPrice: 5.19,
    },
  },
  bananas: {
    walmart: { brand: "Dole", packageLabel: "fresh bunch", unitPrice: 1.49 },
    superstore: {
      brand: "No Name Produce",
      packageLabel: "fresh bunch",
      unitPrice: 1.29,
    },
    safeway: {
      brand: "Signature Farms",
      packageLabel: "fresh bunch",
      unitPrice: 1.69,
    },
  },
  spinach: {
    walmart: {
      brand: "Earthbound Farm",
      packageLabel: "300g clamshell",
      unitPrice: 3.99,
    },
    superstore: {
      brand: "PC Organics",
      packageLabel: "300g clamshell",
      unitPrice: 3.49,
    },
    safeway: {
      brand: "Compliments",
      packageLabel: "300g clamshell",
      unitPrice: 4.29,
    },
  },
  avocados: {
    walmart: {
      brand: "Avocados From Mexico",
      packageLabel: "single avocado",
      unitPrice: 2.49,
    },
    superstore: {
      brand: "No Name Produce",
      packageLabel: "single avocado",
      unitPrice: 2.29,
    },
    safeway: {
      brand: "Signature Farms",
      packageLabel: "single avocado",
      unitPrice: 2.79,
    },
  },
  tomatoes: {
    walmart: { brand: "Sunset", packageLabel: "500g pack", unitPrice: 4.49 },
    superstore: {
      brand: "President's Choice",
      packageLabel: "500g pack",
      unitPrice: 4.19,
    },
    safeway: {
      brand: "Signature Farms",
      packageLabel: "500g pack",
      unitPrice: 4.89,
    },
  },
  "chicken breast": {
    walmart: {
      brand: "Maple Leaf",
      packageLabel: "1kg tray",
      unitPrice: 12.99,
    },
    superstore: {
      brand: "PC Free From",
      packageLabel: "1kg tray",
      unitPrice: 11.49,
    },
    safeway: {
      brand: "Open Nature",
      packageLabel: "1kg tray",
      unitPrice: 13.99,
    },
  },
  "ground beef": {
    walmart: {
      brand: "Your Fresh Market",
      packageLabel: "500g tray",
      unitPrice: 7.99,
    },
    superstore: {
      brand: "President's Choice",
      packageLabel: "500g tray",
      unitPrice: 8.29,
    },
    safeway: {
      brand: "Open Nature",
      packageLabel: "500g tray",
      unitPrice: 7.49,
    },
  },
  "salmon fillet": {
    walmart: {
      brand: "Ocean Jewel",
      packageLabel: "500g tray",
      unitPrice: 11.99,
    },
    superstore: {
      brand: "Atlantic Sea Farms",
      packageLabel: "500g tray",
      unitPrice: 10.99,
    },
    safeway: {
      brand: "Open Nature",
      packageLabel: "500g tray",
      unitPrice: 12.49,
    },
  },
  bread: {
    walmart: {
      brand: "Dempster's",
      packageLabel: "1 loaf",
      unitPrice: 3.49,
    },
    superstore: {
      brand: "Wonder",
      packageLabel: "1 loaf",
      unitPrice: 3.29,
    },
    safeway: {
      brand: "Country Harvest",
      packageLabel: "1 loaf",
      unitPrice: 3.99,
    },
  },
  rice: {
    walmart: {
      brand: "Ben's Original",
      packageLabel: "1kg bag",
      unitPrice: 4.99,
    },
    superstore: {
      brand: "No Name",
      packageLabel: "1kg bag",
      unitPrice: 4.59,
    },
    safeway: {
      brand: "Ben's Original",
      packageLabel: "1kg bag",
      unitPrice: 5.49,
    },
  },
  pasta: {
    walmart: {
      brand: "Catelli",
      packageLabel: "454g box",
      unitPrice: 2.29,
    },
    superstore: {
      brand: "No Name",
      packageLabel: "454g box",
      unitPrice: 2.09,
    },
    safeway: {
      brand: "Barilla",
      packageLabel: "454g box",
      unitPrice: 2.69,
    },
  },
  "dish soap": {
    walmart: {
      brand: "Dawn",
      packageLabel: "500mL bottle",
      unitPrice: 3.99,
    },
    superstore: {
      brand: "Sunlight",
      packageLabel: "500mL bottle",
      unitPrice: 4.29,
    },
    safeway: {
      brand: "Palmolive",
      packageLabel: "500mL bottle",
      unitPrice: 4.89,
    },
  },
  "paper towels": {
    walmart: {
      brand: "Bounty",
      packageLabel: "6 roll pack",
      unitPrice: 7.99,
    },
    superstore: {
      brand: "President's Choice",
      packageLabel: "6 roll pack",
      unitPrice: 8.29,
    },
    safeway: {
      brand: "SpongeTowels",
      packageLabel: "6 roll pack",
      unitPrice: 8.99,
    },
  },
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getQuantity(item: ListItem): number {
  return item.quantity ?? 1;
}

function getUnit(item: ListItem): string {
  return item.unit ?? "each";
}

function getCategory(item: ListItem): string {
  return item.category ?? "Other";
}

function formatQuantityLabel(item: ListItem): string {
  return `${getUnit(item)} × ${getQuantity(item)}`;
}

function createEmptyCheckoutStore(store: StoreDefinition): CheckoutStore {
  return {
    ...store,
    total: 0,
    items: [],
  };
}

function getListSource(state?: PricingRouteState) {
  const listId = state?.listId ?? fallbackListId;
  const list = getListById(listId) ?? getListById(fallbackListId);
  const sourceItems = state?.items?.length ? state.items : list?.items ?? [];

  return {
    listId: list?.id ?? listId,
    listName: list?.name ?? "Current List",
    items: sourceItems,
  };
}

function getFallbackOffers(item: ListItem): Record<StoreKey, CatalogOffer> {
  const seed = Array.from(item.text.toLowerCase()).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0
  );
  const basePrice = 2.75 + (seed % 450) / 100;
  const packageLabel = getUnit(item) === "each" ? "standard pack" : getUnit(item);

  return {
    walmart: {
      brand: fallbackBrands.walmart,
      packageLabel,
      unitPrice: roundCurrency(basePrice),
    },
    superstore: {
      brand: fallbackBrands.superstore,
      packageLabel,
      unitPrice: roundCurrency(Math.max(1.49, basePrice - 0.28)),
    },
    safeway: {
      brand: fallbackBrands.safeway,
      packageLabel,
      unitPrice: roundCurrency(basePrice + 0.44),
    },
  };
}

function getBaseOffers(item: ListItem): Record<StoreKey, CatalogOffer> {
  return priceCatalog[item.text.toLowerCase()] ?? getFallbackOffers(item);
}

function getCheapestStoreKey(prices: Record<StoreKey, number>): StoreKey {
  return storeDefinitions.reduce((bestKey, store) => {
    if (prices[store.key] < prices[bestKey]) {
      return store.key;
    }

    return bestKey;
  }, storeDefinitions[0].key);
}

function createCheckoutItem(
  item: ComparedItem,
  storeKey: StoreKey
): CheckoutStoreItem {
  const selectedOffer = item.offers[storeKey];

  return {
    id: item.id,
    name: item.name,
    brand: selectedOffer.brand,
    packageLabel: selectedOffer.packageLabel,
    quantityLabel: item.quantityLabel,
    price: selectedOffer.price,
  };
}

export function buildComparisonData(
  listId: string,
  sourceItems?: ListItem[]
): ComparisonData | null {
  const list = getListById(listId) ?? getListById(fallbackListId);
  if (!list) {
    return null;
  }

  const items = sourceItems?.length ? sourceItems : list.items;
  const comparedItems: ComparedItem[] = items.map((item) => {
    const quantity = getQuantity(item);
    const baseOffers = getBaseOffers(item);
    const offers: Record<StoreKey, ComparedOffer> = {
      walmart: {
        brand: baseOffers.walmart.brand,
        packageLabel: baseOffers.walmart.packageLabel,
        price: roundCurrency(baseOffers.walmart.unitPrice * quantity),
      },
      superstore: {
        brand: baseOffers.superstore.brand,
        packageLabel: baseOffers.superstore.packageLabel,
        price: roundCurrency(baseOffers.superstore.unitPrice * quantity),
      },
      safeway: {
        brand: baseOffers.safeway.brand,
        packageLabel: baseOffers.safeway.packageLabel,
        price: roundCurrency(baseOffers.safeway.unitPrice * quantity),
      },
    };
    const prices: Record<StoreKey, number> = {
      walmart: offers.walmart.price,
      superstore: offers.superstore.price,
      safeway: offers.safeway.price,
    };

    return {
      id: item.id,
      name: item.text,
      category: getCategory(item),
      quantityLabel: formatQuantityLabel(item),
      offers,
      prices,
      bestStoreKey: getCheapestStoreKey(prices),
    };
  });

  const totals = storeDefinitions.reduce<Record<StoreKey, number>>(
    (accumulator, store) => {
      accumulator[store.key] = roundCurrency(
        comparedItems.reduce((sum, item) => sum + item.prices[store.key], 0)
      );
      return accumulator;
    },
    {
      walmart: 0,
      superstore: 0,
      safeway: 0,
    }
  );

  const cheapestTotalStoreKey = getCheapestStoreKey(totals);
  const cheapestTotalStore =
    storeDefinitions.find((store) => store.key === cheapestTotalStoreKey) ??
    storeDefinitions[0];

  const assistantStoresMap: Record<StoreKey, CheckoutStore> = {
    walmart: createEmptyCheckoutStore(storeDefinitions[0]),
    superstore: createEmptyCheckoutStore(storeDefinitions[1]),
    safeway: createEmptyCheckoutStore(storeDefinitions[2]),
  };

  comparedItems.forEach((item) => {
    const assignedStore = assistantStoresMap[item.bestStoreKey];
    const lineItem = createCheckoutItem(item, item.bestStoreKey);
    assignedStore.items.push(lineItem);
    assignedStore.total = roundCurrency(assignedStore.total + lineItem.price);
  });

  const assistantStores = storeDefinitions
    .map((store) => assistantStoresMap[store.key])
    .filter((store) => store.items.length > 0);

  const assistantTotal = roundCurrency(
    assistantStores.reduce((sum, store) => sum + store.total, 0)
  );

  const singleStorePlanStore = createEmptyCheckoutStore(cheapestTotalStore);
  comparedItems.forEach((item) => {
    const lineItem = createCheckoutItem(item, cheapestTotalStore.key);
    singleStorePlanStore.items.push(lineItem);
  });
  singleStorePlanStore.total = totals[cheapestTotalStore.key];

  const savings = roundCurrency(
    Math.max(0, totals[cheapestTotalStore.key] - assistantTotal)
  );

  return {
    listId: list.id,
    listName: list.name,
    items: comparedItems,
    stores: storeDefinitions,
    totals,
    cheapestTotalStoreKey,
    assistantPlan: {
      key: "assistant",
      title: "AI Optimized Selection",
      summary:
        savings > 0
          ? `This split basket saves ${formatCurrency(
              savings
            )} compared with buying everything at ${cheapestTotalStore.name}.`
          : `${cheapestTotalStore.name} already has the best total for this basket.`,
      stores: assistantStores,
      total: assistantTotal,
      savings,
    },
    singleStorePlan: {
      key: "single-store",
      title: "Single-Store Checkout",
      summary: `Everything is grouped under ${cheapestTotalStore.name}, which has the lowest full-cart total right now.`,
      stores: [singleStorePlanStore],
      total: singleStorePlanStore.total,
      savings: 0,
    },
  };
}

export function buildManualSelectionPlan(
  comparisonData: ComparisonData,
  selections: Partial<Record<string, StoreKey>>
): CheckoutPlan {
  const selectedStoresMap: Record<StoreKey, CheckoutStore> = {
    walmart: createEmptyCheckoutStore(storeDefinitions[0]),
    superstore: createEmptyCheckoutStore(storeDefinitions[1]),
    safeway: createEmptyCheckoutStore(storeDefinitions[2]),
  };

  comparisonData.items.forEach((item) => {
    const selectedStoreKey =
      selections[item.id] ?? comparisonData.cheapestTotalStoreKey;
    const lineItem = createCheckoutItem(item, selectedStoreKey);
    selectedStoresMap[selectedStoreKey].items.push(lineItem);
    selectedStoresMap[selectedStoreKey].total = roundCurrency(
      selectedStoresMap[selectedStoreKey].total + lineItem.price
    );
  });

  const stores = storeDefinitions
    .map((store) => selectedStoresMap[store.key])
    .filter((store) => store.items.length > 0);

  const total = roundCurrency(
    stores.reduce((sum, store) => sum + store.total, 0)
  );

  const baselineTotal = comparisonData.singleStorePlan.total;
  const savings = roundCurrency(Math.max(0, baselineTotal - total));
  const storeSummary =
    stores.length === 1
      ? `You selected ${stores[0].name} for the whole basket.`
      : `You built a custom basket across ${stores.length} stores.`;
  const savingsSummary =
    savings > 0
      ? ` This saves ${formatCurrency(
          savings
        )} compared with the best one-store checkout.`
      : "";

  return {
    key: "manual-selection",
    title: "Manual Selection",
    summary: `${storeSummary}${savingsSummary}`,
    stores,
    total,
    savings,
  };
}

export function resolveComparisonData(
  state?: PricingRouteState
): ComparisonData | null {
  const source = getListSource(state);
  return buildComparisonData(source.listId, source.items);
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}
