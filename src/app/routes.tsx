import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ListDetail from "./pages/ListDetail";
import Settings from "./pages/Settings";
import Receipt from "./pages/Receipt";
import NotFound from "./pages/NotFound";
import AddItem from "./pages/AddItem";

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
    path: "*",
    Component: NotFound,
  },
  {
    path: "/add-item",
    Component: AddItem,
  }
]);
