export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  quantity?: number;
  unit?: string;
  badge?: "SALE" | "OUT";
  suggested?: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  color: string;
  items: ListItem[];
  modifiedDate: string;
}

// Initial data based on the Figma design
export const initialLists: ShoppingList[] = [
  {
    id: "1",
    name: "Weekly Groceries",
    color: "#4CAF50",
    items: [
      {
        id: "1-1",
        text: "Milk 2%",
        completed: true,
        category: "Dairy",
        quantity: 2,
        unit: "4L",
        badge: "SALE",
      },
      {
        id: "1-2",
        text: "Cheese Slices",
        completed: false,
        category: "Dairy",
        quantity: 1,
        unit: "300g",
      },
      {
        id: "1-3",
        text: "Greek Yogurt",
        completed: true,
        category: "Dairy",
        quantity: 1,
        unit: "750g",
      },
      {
        id: "1-4",
        text: "Chicken Breast",
        completed: false,
        category: "Meat",
        quantity: 1,
        unit: "1kg",
        badge: "SALE",
      },
      {
        id: "1-5",
        text: "Ground Beef",
        completed: false,
        category: "Meat",
        quantity: 2,
        unit: "500g",
      },
      {
        id: "1-6",
        text: "Bananas",
        completed: true,
        category: "Produce",
        quantity: 1,
        unit: "bunch",
      },
      {
        id: "1-7",
        text: "Spinach",
        completed: false,
        category: "Produce",
        quantity: 1,
        unit: "300g",
        badge: "SALE",
      },
      {
        id: "1-8",
        text: "Avocados",
        completed: false,
        category: "Produce",
        quantity: 3,
        unit: "each",
        badge: "OUT",
      },
    ],
    modifiedDate: "Mar 3, 2026",
  },
  {
    id: "2",
    name: "Party Supplies",
    color: "#FF9800",
    items: [
      { id: "2-1", text: "Balloons", completed: false },
      { id: "2-2", text: "Paper plates", completed: true },
      { id: "2-3", text: "Cups", completed: false },
      { id: "2-4", text: "Napkins", completed: false },
      { id: "2-5", text: "Streamers", completed: false },
      { id: "2-6", text: "Cake", completed: false },
      { id: "2-7", text: "Ice cream", completed: false },
      { id: "2-8", text: "Candles", completed: true },
    ],
    modifiedDate: "Mar 1, 2026",
  },
  {
    id: "3",
    name: "Meal Prep Sunday",
    color: "#2196F3",
    items: [
      { id: "3-1", text: "Chicken thighs", completed: false },
      { id: "3-2", text: "Sweet potatoes", completed: false },
      { id: "3-3", text: "Broccoli", completed: true },
      { id: "3-4", text: "Brown rice", completed: false },
      { id: "3-5", text: "Olive oil", completed: false },
      { id: "3-6", text: "Garlic", completed: false },
      { id: "3-7", text: "Onions", completed: true },
      { id: "3-8", text: "Bell peppers", completed: false },
      { id: "3-9", text: "Carrots", completed: false },
      { id: "3-10", text: "Spinach", completed: false },
      { id: "3-11", text: "Ground beef", completed: false },
      { id: "3-12", text: "Black beans", completed: false },
      { id: "3-13", text: "Quinoa", completed: false },
      { id: "3-14", text: "Meal prep containers", completed: true },
      { id: "3-15", text: "Aluminum foil", completed: false },
    ],
    modifiedDate: "Feb 28, 2026",
  },
  {
    id: "4",
    name: "Pantry Restock",
    color: "#9C27B0",
    items: [
      { id: "4-1", text: "Flour", completed: false },
      { id: "4-2", text: "Sugar", completed: false },
      { id: "4-3", text: "Salt", completed: true },
      { id: "4-4", text: "Pepper", completed: false },
      { id: "4-5", text: "Olive oil", completed: false },
      { id: "4-6", text: "Canned tomatoes", completed: false },
    ],
    modifiedDate: "Feb 25, 2026",
  },
  {
    id: "5",
    name: "Baby Essentials",
    color: "#E91E63",
    items: [
      { id: "5-1", text: "Diapers", completed: false },
      { id: "5-2", text: "Baby wipes", completed: true },
      { id: "5-3", text: "Baby formula", completed: false },
      { id: "5-4", text: "Baby food", completed: false },
      { id: "5-5", text: "Baby shampoo", completed: false },
      { id: "5-6", text: "Baby lotion", completed: false },
      { id: "5-7", text: "Pacifiers", completed: true },
      { id: "5-8", text: "Baby bottles", completed: false },
      { id: "5-9", text: "Burp cloths", completed: false },
    ],
    modifiedDate: "Feb 20, 2026",
  },
  {
    id: "6",
    name: "Shared — Roommates",
    color: "#00BCD4",
    items: [
      { id: "6-1", text: "Toilet paper", completed: false },
      { id: "6-2", text: "Paper towels", completed: true },
      { id: "6-3", text: "Dish soap", completed: false },
      { id: "6-4", text: "Laundry detergent", completed: false },
      { id: "6-5", text: "Trash bags", completed: false },
      { id: "6-6", text: "Sponges", completed: true },
      { id: "6-7", text: "All-purpose cleaner", completed: false },
      { id: "6-8", text: "Hand soap", completed: false },
      { id: "6-9", text: "Coffee", completed: false },
      { id: "6-10", text: "Creamer", completed: false },
      { id: "6-11", text: "Snacks", completed: false },
    ],
    modifiedDate: "Feb 18, 2026",
  },
];

let lists = [...initialLists];

function getModifiedDateLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getLists(): ShoppingList[] {
  return lists;
}

export function getListById(id: string): ShoppingList | undefined {
  return lists.find((list) => list.id === id);
}

export function addList(list: ShoppingList): void {
  lists = [...lists, list];
}

export function updateList(id: string, updates: Partial<ShoppingList>): void {
  lists = lists.map((list) =>
    list.id === id ? { ...list, ...updates } : list
  );
}

export function deleteList(id: string): void {
  lists = lists.filter((list) => list.id !== id);
}

export function addItemToList(listId: string, item: ListItem): void {
  lists = lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: [...list.items, item],
          modifiedDate: getModifiedDateLabel(),
        }
      : list
  );
}

export function updateItemInList(
  listId: string,
  itemId: string,
  updates: Partial<ListItem>
): void {
  lists = lists.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    const hasItem = list.items.some((item) => item.id === itemId);
    if (!hasItem) {
      return list;
    }

    return {
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
      modifiedDate: getModifiedDateLabel(),
    };
  });
}

export function deleteItemFromList(listId: string, itemId: string): void {
  lists = lists.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    return {
      ...list,
      items: list.items.filter((item) => item.id !== itemId),
      modifiedDate: getModifiedDateLabel(),
    };
  });
}
