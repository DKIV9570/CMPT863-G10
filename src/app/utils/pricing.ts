import { getListById, ListItem } from "../store/listsStore";

export type StoreKey = "walmart" | "superstore" | "safeway";

export type StoreDefinition = {
  key: StoreKey;
  name: string;
  color: string;
  url: string;
};

export type ComparedItem = {
  id: string;
  name: string;
  category: string;
  quantityLabel: string;
  prices: Record<StoreKey, number>;
  bestStoreKey: StoreKey;
};

export type CheckoutStoreItem = {
  id: string;
  name: string;
  quantityLabel: string;
  price: number;
};

export type CheckoutStore = StoreDefinition & {
  total: number;
  items: CheckoutStoreItem[];
};

export type CheckoutPlan = {
  key: "assistant" | "single-store";
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

const priceCatalog: Record<string, Record<StoreKey, number>> = {
  "milk 2%": { walmart: 5.49, superstore: 5.29, safeway: 5.99 },
  "cheese slices": { walmart: 4.99, superstore: 4.79, safeway: 5.49 },
  "greek yogurt": { walmart: 6.29, superstore: 5.99, safeway: 6.49 },
  eggs: { walmart: 4.79, superstore: 4.59, safeway: 5.19 },
  bananas: { walmart: 1.49, superstore: 1.29, safeway: 1.69 },
  spinach: { walmart: 3.99, superstore: 3.49, safeway: 4.29 },
  avocados: { walmart: 2.49, superstore: 2.29, safeway: 2.79 },
  tomatoes: { walmart: 4.49, superstore: 4.19, safeway: 4.89 },
  "chicken breast": { walmart: 12.99, superstore: 11.49, safeway: 13.99 },
  "ground beef": { walmart: 7.99, superstore: 8.29, safeway: 7.49 },
  "salmon fillet": { walmart: 11.99, superstore: 10.99, safeway: 12.49 },
  bread: { walmart: 3.49, superstore: 3.29, safeway: 3.99 },
  rice: { walmart: 4.99, superstore: 4.59, safeway: 5.49 },
  pasta: { walmart: 2.29, superstore: 2.09, safeway: 2.69 },
  "dish soap": { walmart: 3.99, superstore: 4.29, safeway: 4.89 },
  "paper towels": { walmart: 7.99, superstore: 8.29, safeway: 8.99 },
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

function getFallbackPrices(itemName: string): Record<StoreKey, number> {
  const seed = Array.from(itemName.toLowerCase()).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0
  );
  const basePrice = 2.75 + (seed % 450) / 100;

  return {
    walmart: roundCurrency(basePrice),
    superstore: roundCurrency(Math.max(1.49, basePrice - 0.28)),
    safeway: roundCurrency(basePrice + 0.44),
  };
}

function getBasePrices(itemName: string): Record<StoreKey, number> {
  return priceCatalog[itemName.toLowerCase()] ?? getFallbackPrices(itemName);
}

function getCheapestStoreKey(prices: Record<StoreKey, number>): StoreKey {
  return storeDefinitions.reduce((bestKey, store) => {
    if (prices[store.key] < prices[bestKey]) {
      return store.key;
    }

    return bestKey;
  }, storeDefinitions[0].key);
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
    const basePrices = getBasePrices(item.text);
    const prices: Record<StoreKey, number> = {
      walmart: roundCurrency(basePrices.walmart * quantity),
      superstore: roundCurrency(basePrices.superstore * quantity),
      safeway: roundCurrency(basePrices.safeway * quantity),
    };

    return {
      id: item.id,
      name: item.text,
      category: getCategory(item),
      quantityLabel: formatQuantityLabel(item),
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
    const linePrice = item.prices[item.bestStoreKey];
    assignedStore.items.push({
      id: item.id,
      name: item.name,
      quantityLabel: item.quantityLabel,
      price: linePrice,
    });
    assignedStore.total = roundCurrency(assignedStore.total + linePrice);
  });

  const assistantStores = storeDefinitions
    .map((store) => assistantStoresMap[store.key])
    .filter((store) => store.items.length > 0);

  const assistantTotal = roundCurrency(
    assistantStores.reduce((sum, store) => sum + store.total, 0)
  );

  const singleStorePlanStore = createEmptyCheckoutStore(cheapestTotalStore);
  comparedItems.forEach((item) => {
    singleStorePlanStore.items.push({
      id: item.id,
      name: item.name,
      quantityLabel: item.quantityLabel,
      price: item.prices[cheapestTotalStore.key],
    });
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

export function resolveComparisonData(
  state?: PricingRouteState
): ComparisonData | null {
  const source = getListSource(state);
  return buildComparisonData(source.listId, source.items);
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}
