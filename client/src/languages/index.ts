import commonEs from "./common/es.json";
import commonEn from "./common/en.json";
import homeEs from "./home/es.json";
import homeEn from "./home/en.json";
import navEs from "./nav/es.json";
import navEn from "./nav/en.json";
import authEs from "./auth/es.json";
import authEn from "./auth/en.json";

export const esMessages = {
  Common: commonEs,
  HomePage: homeEs,
  Nav: navEs,
  LoginPage: authEs,
};

export const enMessages = {
  Common: commonEn,
  HomePage: homeEn,
  Nav: navEn,
  LoginPage: authEn,
};

export const messagesMap = {
  es: esMessages,
  en: enMessages,
};
