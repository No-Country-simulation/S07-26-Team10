import commonEs from "./common/es.json";
import commonEn from "./common/en.json";
import homeEs from "./home/es.json";
import homeEn from "./home/en.json";
import navEs from "./nav/es.json";
import navEn from "./nav/en.json";
import authEs from "./auth/es.json";
import authEn from "./auth/en.json";
import adminEs from "./admin/es.json";
import adminEn from "./admin/en.json";

export const esMessages = {
  Common: commonEs,
  HomePage: homeEs,
  Nav: navEs,
  LoginPage: authEs,
  AdminPage: adminEs,
};

export const enMessages = {
  Common: commonEn,
  HomePage: homeEn,
  Nav: navEn,
  LoginPage: authEn,
  AdminPage: adminEn,
};

export const messagesMap = {
  es: esMessages,
  en: enMessages,
};

