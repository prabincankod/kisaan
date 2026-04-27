# ⚡ 1. Setup pnpm in Existing Expo App

If not already:

```bash
npm install -g pnpm
```

Inside your project:

```bash
pnpm install
```

👉 If Expo was created with npm/yarn, pnpm will still work fine.

---

# 📦 2. Install Core Dependencies (pnpm)

```bash
pnpm add axios @tanstack/react-query zustand
pnpm add @react-navigation/native @react-navigation/native-stack
pnpm add react-native-screens react-native-safe-area-context
pnpm add expo-image-picker expo-secure-store
```

---

# 🧱 3. Clean Scalable Structure

Refactor your app like this:

```bash
src/
 ├── api/
 │    ├── client.ts
 │    ├── auth.api.ts
 │    ├── product.api.ts
 │    ├── cart.api.ts
 │    ├── quotation.api.ts
 │    ├── order.api.ts
 │
 ├── features/
 │    ├── auth/
 │    ├── buyer/
 │    ├── farmer/
 │
 ├── store/
 ├── hooks/
 ├── navigation/
 ├── components/
 └── utils/
```

👉 This structure scales well when your app grows.

---

# 🌐 4. API Client (IMPORTANT)

```ts
// src/api/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: "http://YOUR_IP:PORT/api",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

# 🔐 5. Auth Store (Zustand + SecureStore)

```ts
// src/store/auth.store.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync("token", token);
    set({ user, token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    set({ user: null, token: null });
  },
}));
```

---

# 🧠 6. React Query Setup (Global)

```ts
// App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <Navigation />
</QueryClientProvider>
```

---

# 🧭 7. Navigation (Role-Based)

```ts
// src/navigation/index.tsx
const AppNavigator = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return <AuthStack />;

  return user.role === "farmer"
    ? <FarmerStack />
    : <BuyerStack />;
};
```

---

# 👤 8. API Modules (Clean Pattern)

## Example: Product API

```ts
// src/api/product.api.ts
import { api } from "./client";

export const getProducts = (params) =>
  api.get("/products", { params });

export const createProduct = (formData) =>
  api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
```

---

# 📲 9. Buyer Implementation (Real Flow)

## Fetch Products

```ts
const { data, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: () => getProducts({ page: 1 }).then(res => res.data),
});
```

---

## Add to Cart (Important Constraint)

```ts
try {
  await api.post("/cart/add", { productId, quantity });
} catch (e: any) {
  if (e.response?.data?.message.includes("farmer")) {
    Alert.alert("Cart Error", "You can only add products from one farmer.");
  }
}
```

---

## Send Quotation

```ts
await api.post("/quotations", {
  farmerId,
  items: [
    { productId, quantity, offeredPrice }
  ]
});
```

---

# 👨‍🌾 10. Farmer Implementation

## Image Picker

```ts
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!res.canceled) {
    return res.assets[0];
  }
};
```

---

## Upload Product

```ts
const formData = new FormData();

formData.append("title", title);
formData.append("price", price);

formData.append("images", {
  uri: image.uri,
  name: "image.jpg",
  type: "image/jpeg",
});

await createProduct(formData);
```

---

# 📩 11. Quotation Handling UI

### Farmer side:

* Show list
* Accept / Reject buttons

```ts
await api.patch(`/quotations/${id}/respond`, {
  status: "accepted"
});
```

---

# 📦 12. Orders UI

* Buyer → Track order
* Farmer → Update status

```ts
await api.patch(`/orders/${id}/status`, {
  status: "shipped"
});
```

---

# ⚡ 13. Performance (Critical)

* Use `FlatList` always:

```tsx
<FlatList
  data={products}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderItem}
/>
```

* Avoid re-renders with memo

---

# 🔔 14. Real-World Additions (Do This Early)

### 1. Loading States

```tsx
if (isLoading) return <ActivityIndicator />;
```

### 2. Empty States

```tsx
if (!data.length) return <Text>No products found</Text>;
```

---

# 🧪 15. Dev Testing Tips

### Use your local backend:

```bash
http://192.168.X.X:PORT
```

👉 NOT `localhost` (won’t work on phone)

---

# 🚀 16. Build & Run

```bash
pnpm start
```

or

```bash
pnpm expo start
```

---

# 🧠 17. Real Advice (From Experience)

Your biggest UX risks:

### ❌ Confusion between:

* Add to cart
* Send quotation

👉 Fix:

* Use **2 clear buttons**

  * 🟢 “Buy Now”
  * 🟡 “Negotiate Price”

---

