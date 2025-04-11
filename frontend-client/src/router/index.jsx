import { createBrowserRouter } from "react-router-dom";
import ConcertDetailPage from "../pages/concerts/ConcertDetailPage";
import Layout from "../components/Layout";
import ConcertList from "../pages/concerts/ConcertList"; // Import the missing component

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "concerts",
          children: [
            {
              path: "",
              element: <ConcertList />, // You'll need to create this component
            },
            {
              path: ":id",
              element: <ConcertDetailPage />,
            },
          ],
        },
        // ...existing routes...
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
