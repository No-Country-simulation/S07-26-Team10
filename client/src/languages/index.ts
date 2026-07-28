import commonEs from "./common/es.json";
import commonEn from "./common/en.json";
import homeCardEs from "./home/card/es.json";
import homeCardEn from "./home/card/en.json";
import authEs from "./auth/es.json";
import authEn from "./auth/en.json";

export const esMessages = {
  Common: commonEs,
  HomePage: homeCardEs,
  LoginPage: authEs,
};

export const enMessages = {
  Common: commonEn,
  HomePage: homeCardEn,
  LoginPage: authEn,
};

export const messagesMap = {
  es: esMessages,
  en: enMessages,
};
