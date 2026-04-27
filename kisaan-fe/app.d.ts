"use client";

import "expo-router";

declare global {
  namespace ExpoRouter {
    interface RouteProps {
      "/": { href: "/" };
      "/(tabs)": { href: "/(tabs)" };
      "/(tabs)/explore": { href: "/(tabs)/explore" };
      "/login": { href: "/login" };
      "/register": { href: "/register" };
      "/farmer": { href: "/farmer" };
      "/farmer/dashboard": { href: "/farmer/dashboard" };
      "/farmer/products": { href: "/farmer/products" };
      "/farmer/orders": { href: "/farmer/orders" };
      "/farmer/quotations": { href: "/farmer/quotations" };
      "/farmer/profile": { href: "/farmer/profile" };
      "/farmer/add-product": { href: "/farmer/add-product" };
      "/buyer": { href: "/buyer" };
      "/buyer/dashboard": { href: "/buyer/dashboard" };
      "/buyer/products": { href: "/buyer/products" };
      "/buyer/products/[id]": { href: "/buyer/products/[id]" };
      "/buyer/cart": { href: "/buyer/cart" };
      "/buyer/orders": { href: "/buyer/orders" };
      "/buyer/quotations": { href: "/buyer/quotations" };
      "/modal": { href: "/modal" };
    }
  }
}
