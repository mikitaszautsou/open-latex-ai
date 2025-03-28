import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/chat/:chatId", "routes/home.tsx", { id: 'defaultChat'})
] satisfies RouteConfig;
