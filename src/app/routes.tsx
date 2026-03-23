import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ListDetail from "./pages/ListDetail";
import Settings from "./pages/Settings";
import Receipt from "./pages/Receipt";
import NotFound from "./pages/NotFound";
import AddItem from "./pages/AddItem";
import PriceComparison from "./pages/PriceComparison";
import Checkout from "./pages/Checkout";
import AIRules from "./pages/AIRules";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/list/:listId",
    Component: ListDetail,
  },
  {
    path: "/receipt",
    Component: Receipt,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/settings/ai-rules",
    Component: AIRules,
  },
  {
    path: "/list/:listId/add-item",
    Component: AddItem,
  },
  {
    path: "*",
    Component: NotFound,
  },
  {
    path: "/add-item",
    Component: AddItem,
  },
  {
    path: "/price-comparison",
    Component: PriceComparison,
  },
  {
    path: "/checkout",
    Component: Checkout,
  }

]);
