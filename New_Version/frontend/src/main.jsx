import { createRoot } from "react-dom/client";
 import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Studio from "./pages/Studio.jsx";
import StudioHome from "./components/videoCallComponent/studio/StudioHome.jsx";
import Call from "./pages/Call.jsx";
import { ToastContainer } from 'react-toastify';

const routeProvider = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { 
        path : '' , 
        element: <Home /> 
      } ,
      {
        path : "/about" , 
        element: <h1 className=" w-screen h-screen flex items-center justify-center">About Page</h1> 
      }, 
      {
        path : "/contact-us" , 
        element: <h1 className=" w-screen h-screen flex items-center justify-center">Contact Page</h1>
      } , 
      {
        path: "/studio",
        element: <Studio /> , 
        children: [
          {
            path : "" , 
            element : <StudioHome /> 
          } , 
          {
            path: "/studio/call",
            element: <Call />
          }
        ]
      }
    ] , 
    errorElement : <div>
        <h1>Oops! Page Not Found</h1>
      </div>
  }
])

createRoot(document.getElementById("root")).render(
<>
  <RouterProvider router={routeProvider}/>
  <ToastContainer />
  </>
);
